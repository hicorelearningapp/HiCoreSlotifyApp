"""
Instagram OAuth lifecycle: authorize, connect, refresh, disconnect.

Ported from the standalone app's onboarding.py. The vendor identity there was
a free-form vendor_id; here it is the BusinessPhoneNumber, so an authorized
Instagram account lands directly on the tenant key the rest of the platform
already uses.

The flow:
    1. build_authorization_url  -> mints single-use state, returns Instagram URL
    2. vendor approves on instagram.com
    3. complete_authorization   -> consumes state, exchanges code for a
                                   short-lived token, upgrades it to long-lived,
                                   reads the profile, subscribes the account to
                                   `comments`, and stores the connection

Tokens never leave this module in plaintext: they go straight into the
encrypted column via InstagramConnectionService.
"""
from __future__ import annotations

import hashlib
import logging
import secrets
import time
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from config import (
    INSTAGRAM_APP_ID,
    INSTAGRAM_OAUTH_REDIRECT_URI,
    INSTAGRAM_OAUTH_AUTHORIZE_URL,
    INSTAGRAM_OAUTH_SCOPES,
    OAUTH_STATE_TTL_SECONDS,
    INSTAGRAM_TOKEN_REFRESH_MARGIN_SECONDS,
)
from models.connection import InstagramOAuthState, InstagramConnection
from services.graph_client import (
    graph_client,
    InstagramAPIError,
)
from services.tenant_resolver import tenant_resolver
from services.token_cipher import instagram_token_cipher, TokenCipherError

logger = logging.getLogger("uvicorn")

COMMENT_WEBHOOK_FIELDS = ("comments",)
REQUIRED_COMMENT_SCOPES = frozenset(
    {"instagram_business_basic", "instagram_business_manage_comments"}
)


class OnboardingError(RuntimeError):
    """A safe, non-secret onboarding failure."""


class InvalidOAuthStateError(OnboardingError):
    pass


class InstagramOAuthResponseError(OnboardingError):
    pass


class ConnectionConflictError(OnboardingError):
    pass


def _digest(state: str) -> str:
    return hashlib.sha256(state.encode("utf-8")).hexdigest()


def _oauth_record(payload):
    """Instagram returns either a flat object or {"data": [ {...} ]}."""
    if not isinstance(payload, dict):
        raise InstagramOAuthResponseError("Instagram token response is not an object")
    data = payload.get("data")
    if data is None:
        return payload
    if not isinstance(data, list) or not data or not isinstance(data[0], dict):
        raise InstagramOAuthResponseError("Instagram token response has no account data")
    return data[0]


def _access_token(payload, response_name):
    record = _oauth_record(payload)
    value = record.get("access_token")
    if not isinstance(value, str) or not value.strip():
        raise InstagramOAuthResponseError(f"Instagram {response_name} has no access token")
    return value.strip()


def _permissions(payload, fallback):
    record = _oauth_record(payload)
    raw = record.get("permissions")
    if raw is None:
        return tuple(dict.fromkeys(s.strip() for s in fallback if s.strip()))
    candidates = raw.split(",") if isinstance(raw, str) else raw
    if not isinstance(candidates, (list, tuple)):
        raise InstagramOAuthResponseError("Instagram permissions response is invalid")
    scopes = []
    for value in candidates:
        if not isinstance(value, str):
            raise InstagramOAuthResponseError("Instagram permissions response is invalid")
        scope = value.strip()
        if scope and scope not in scopes:
            scopes.append(scope)
    return tuple(scopes)


def _token_expiry(payload, now=None):
    if not isinstance(payload, dict) or payload.get("expires_in") is None:
        return None
    raw = payload["expires_in"]
    if isinstance(raw, bool):
        raise InstagramOAuthResponseError("Instagram token expiry is invalid")
    try:
        seconds = float(raw)
    except (TypeError, ValueError) as exc:
        raise InstagramOAuthResponseError("Instagram token expiry is invalid") from exc
    if seconds <= 0:
        raise InstagramOAuthResponseError("Instagram token expiry is invalid")
    return (now if now is not None else time.time()) + seconds


def _identifier(value, field_name):
    if isinstance(value, bool) or not isinstance(value, (str, int)):
        raise InstagramOAuthResponseError(f"Instagram profile is missing {field_name}")
    normalized = str(value).strip()
    if not normalized:
        raise InstagramOAuthResponseError(f"Instagram profile is missing {field_name}")
    return normalized


def _confirmed(response, operation):
    if not isinstance(response, dict) or response.get("success") is not True:
        raise InstagramOAuthResponseError(f"Instagram did not confirm {operation}")


class InstagramOnboardingService:
    def __init__(self, client=graph_client):
        self.client = client

    # ── state ─────────────────────────────────────────────────────────────

    def create_oauth_state(self, db, business_phone_number: str) -> str:
        now = time.time()
        # Opportunistically drop expired states so the table stays small.
        db.query(InstagramOAuthState).filter(
            InstagramOAuthState.ExpiresAt <= now
        ).delete(synchronize_session=False)

        raw_state = secrets.token_urlsafe(32)
        db.add(
            InstagramOAuthState(
                StateDigest=_digest(raw_state),
                BusinessPhoneNumber=business_phone_number,
                ExpiresAt=now + OAUTH_STATE_TTL_SECONDS,
            )
        )
        db.commit()
        return raw_state

    def consume_oauth_state(self, db, state: str):
        """Return the business for a state and delete it. One use only."""
        record = (
            db.query(InstagramOAuthState)
            .filter(InstagramOAuthState.StateDigest == _digest(state))
            .first()
        )
        if record is None:
            return None
        business = record.BusinessPhoneNumber
        expired = record.ExpiresAt <= time.time()
        db.delete(record)
        db.commit()
        return None if expired else business

    # ── authorize ─────────────────────────────────────────────────────────

    def build_authorization_url(self, db, business_phone_number: str) -> str:
        business_phone_number = str(business_phone_number or "").strip()
        if not business_phone_number:
            raise ValueError("business_phone_number must not be empty")
        if not INSTAGRAM_APP_ID:
            raise ValueError("INSTAGRAM_APP_ID is not configured")
        if not INSTAGRAM_OAUTH_REDIRECT_URI:
            raise ValueError("INSTAGRAM_OAUTH_REDIRECT_URI is not configured")
        if not INSTAGRAM_OAUTH_SCOPES:
            raise ValueError("INSTAGRAM_OAUTH_SCOPES must contain at least one scope")

        state = self.create_oauth_state(db, business_phone_number)
        parts = urlsplit(INSTAGRAM_OAUTH_AUTHORIZE_URL)
        query = dict(parse_qsl(parts.query, keep_blank_values=True))
        query.update(
            {
                "client_id": INSTAGRAM_APP_ID,
                "redirect_uri": INSTAGRAM_OAUTH_REDIRECT_URI,
                "response_type": "code",
                "scope": ",".join(INSTAGRAM_OAUTH_SCOPES),
                "state": state,
            }
        )
        return urlunsplit(
            (parts.scheme, parts.netloc, parts.path, urlencode(query), parts.fragment)
        )

    def complete_authorization(self, db, state: str, code: str):
        """Consume the state and register one comments-subscribed account."""
        business_phone_number = self.consume_oauth_state(db, state)
        if business_phone_number is None:
            raise InvalidOAuthStateError("OAuth state is invalid, expired, or already used")

        # The state is burned before any exchange, so a failed callback cannot
        # be replayed with the same URL.
        short_response = self.client.exchange_authorization_code(code)
        short_token = _access_token(short_response, "authorization response")
        scopes = _permissions(short_response, INSTAGRAM_OAUTH_SCOPES)
        if not REQUIRED_COMMENT_SCOPES.issubset(scopes):
            raise InstagramOAuthResponseError(
                "Instagram authorization is missing required comment permissions"
            )

        long_response = self.client.exchange_long_lived_token(short_token)
        long_token = _access_token(long_response, "long-lived token response")
        expires_at = _token_expiry(long_response)

        profile = self.client.get_instagram_profile(long_token)
        if not isinstance(profile, dict):
            raise InstagramOAuthResponseError("Instagram profile response is not an object")
        account_id = _identifier(profile.get("user_id"), "user_id")
        app_scoped_id = _identifier(profile.get("id"), "id")
        username = (profile.get("username") or "").strip() or None
        account_type = (profile.get("account_type") or "").strip() or None

        existing = tenant_resolver.get_by_account_id(db, account_id)
        if existing is not None and existing.BusinessPhoneNumber != business_phone_number:
            raise ConnectionConflictError(
                "This Instagram account is already connected to another business"
            )

        # The app-level callback in the Meta dashboard is not enough: each
        # professional account needs its own `comments` subscription.
        _confirmed(
            self.client.subscribe_account(long_token, account_id, COMMENT_WEBHOOK_FIELDS),
            "the comments webhook subscription",
        )

        try:
            connection = tenant_resolver.connect(
                db,
                instagram_account_id=account_id,
                business_phone_number=business_phone_number,
                access_token=long_token,
                instagram_username=username,
            )
        except Exception:
            # Do not leave a subscribed account with no connection row behind.
            self._best_effort_unsubscribe(long_token, account_id)
            raise

        connection.TokenExpiresAt = expires_at
        connection.Scopes = ",".join(scopes)
        connection.AccountType = account_type
        connection.AppScopedId = app_scoped_id
        db.commit()
        db.refresh(connection)
        return connection

    def subscribe_connection(self, db, instagram_account_id: str) -> bool:
        """Install the account-level `comments` subscription for a connection.

        Configuring the callback URL in the Meta dashboard subscribes the *app*.
        Every professional account additionally needs its own subscription, or
        the app verifies fine and then silently receives nothing. The OAuth path
        does this automatically; a token pasted from the dashboard's
        "Generate access tokens" screen needs it done here.
        """
        connection = tenant_resolver.get_by_account_id(db, instagram_account_id)
        if connection is None:
            raise OnboardingError("Instagram connection was not found")
        try:
            token = instagram_token_cipher.decrypt(connection.AccessTokenEncrypted)
        except TokenCipherError as exc:
            raise OnboardingError(str(exc)) from exc

        response = self.client.subscribe_account(
            token, connection.InstagramAccountId, COMMENT_WEBHOOK_FIELDS
        )
        _confirmed(response, "the comments webhook subscription")
        return True

    # ── refresh ───────────────────────────────────────────────────────────

    def refresh_token(self, db, instagram_account_id: str):
        connection = tenant_resolver.get_by_account_id(db, instagram_account_id)
        if connection is None:
            raise OnboardingError("Instagram connection was not found")
        if connection.Status != "active":
            raise OnboardingError("Instagram connection is disconnected")

        try:
            current = instagram_token_cipher.decrypt(connection.AccessTokenEncrypted)
        except TokenCipherError as exc:
            raise OnboardingError(str(exc)) from exc

        response = self.client.refresh_long_lived_token(current)
        refreshed = _access_token(response, "refresh response")
        expires_at = _token_expiry(response)

        connection.AccessTokenEncrypted = instagram_token_cipher.encrypt(refreshed)
        connection.TokenExpiresAt = expires_at
        db.commit()
        db.refresh(connection)
        logger.info(
            "Refreshed Instagram token for account %s", connection.InstagramAccountId
        )
        return connection

    def refresh_expiring_tokens(self, db, margin_seconds=None) -> dict:
        """Refresh every active token inside the expiry margin.

        Called on a schedule. One vendor failing must not stop the others, so
        each is attempted independently.
        """
        margin = (
            INSTAGRAM_TOKEN_REFRESH_MARGIN_SECONDS
            if margin_seconds is None
            else margin_seconds
        )
        cutoff = time.time() + margin
        due = (
            db.query(InstagramConnection)
            .filter(
                InstagramConnection.Status == "active",
                InstagramConnection.TokenExpiresAt.isnot(None),
                InstagramConnection.TokenExpiresAt <= cutoff,
            )
            .all()
        )
        refreshed, failed = 0, 0
        for connection in due:
            try:
                self.refresh_token(db, connection.InstagramAccountId)
                refreshed += 1
            except (OnboardingError, InstagramAPIError) as e:
                failed += 1
                logger.error(
                    "Instagram token refresh failed for %s: %s",
                    connection.InstagramAccountId,
                    e,
                )
        return {"due": len(due), "refreshed": refreshed, "failed": failed}

    # ── disconnect ────────────────────────────────────────────────────────

    def disconnect(self, db, instagram_account_id: str) -> dict:
        """Unsubscribe from Meta, then delete the connection and its token."""
        connection = tenant_resolver.get_by_account_id(db, instagram_account_id)
        if connection is None:
            raise OnboardingError("Instagram connection was not found")

        unsubscribed = False
        try:
            token = instagram_token_cipher.decrypt(connection.AccessTokenEncrypted)
            self.client.unsubscribe_account(token, connection.InstagramAccountId)
            unsubscribed = True
        except (TokenCipherError, InstagramAPIError) as e:
            # A token we can no longer use is still worth deleting locally.
            logger.warning(
                "Could not unsubscribe %s before disconnect: %s", instagram_account_id, e
            )

        tenant_resolver.disconnect(db, instagram_account_id)
        return {
            "instagram_account_id": instagram_account_id,
            "unsubscribed": unsubscribed,
            "token_deleted": True,
        }

    def _best_effort_unsubscribe(self, access_token, account_id):
        try:
            self.client.unsubscribe_account(access_token, account_id)
        except Exception:
            pass


instagram_onboarding_service = InstagramOnboardingService()
