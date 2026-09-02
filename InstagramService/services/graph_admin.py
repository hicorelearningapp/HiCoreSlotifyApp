"""
The two Meta calls manual onboarding still needs.

Vendors are added by hand: a token is generated in the Meta dashboard and
pasted into POST /connections. That covers everything except two things the
OAuth flow used to do on the way past, both of which still have to happen:

  subscribe_account   configuring the callback URL in the dashboard subscribes
                      the *app*. Each professional account must additionally
                      be subscribed to `comments` or its events never arrive.

  refresh_token       long-lived tokens last ~60 days. Without this, every
                      vendor goes dark two months after being added and the
                      only symptom is replies quietly stopping.

This is what is left of graph_client.py and onboarding.py once the
authorization code exchange, state handling and profile lookup are gone --
they were only ever needed to obtain a token this service is now handed.
"""
from __future__ import annotations

import logging
import time

import requests

from config import (
    INSTAGRAM_GRAPH_API_VERSION,
    INSTAGRAM_GRAPH_HOST,
    INSTAGRAM_HTTP_TIMEOUT,
    INSTAGRAM_REFRESH_TOKEN_URL,
    INSTAGRAM_TOKEN_REFRESH_MARGIN_SECONDS,
)
from models.connection import InstagramConnection
from services.token_cipher import TokenCipherError, instagram_token_cipher

logger = logging.getLogger("uvicorn")

COMMENT_WEBHOOK_FIELDS = ("comments",)


class InstagramAPIError(RuntimeError):
    """Meta rejected an administrative call.

    `retryable` separates a transient failure from a permanent one, so the
    refresh loop can tell "try again tomorrow" from "this token is dead".
    """

    def __init__(self, message, retryable=False, status_code=None):
        super().__init__(message)
        self.retryable = retryable
        self.status_code = status_code


def _request(method, url, access_token=None, form_body=None, params=None) -> dict:
    headers = {"Authorization": f"Bearer {access_token}"} if access_token else {}
    try:
        response = requests.request(
            method, url, headers=headers, data=form_body, params=params,
            timeout=INSTAGRAM_HTTP_TIMEOUT,
        )
    except requests.exceptions.RequestException as e:
        raise InstagramAPIError(f"Meta request failed: {e}", retryable=True) from e

    try:
        data = response.json()
    except ValueError:
        logger.warning("Meta returned a non-JSON body (HTTP %s)", response.status_code)
        data = {}

    if 200 <= response.status_code < 300:
        return data if isinstance(data, dict) else {}

    error = data.get("error", {}) if isinstance(data, dict) else {}
    message = error.get("message") if isinstance(error, dict) else None
    raise InstagramAPIError(
        str(message or f"Meta returned HTTP {response.status_code}"),
        retryable=response.status_code == 429 or response.status_code >= 500,
        status_code=response.status_code,
    )


def _graph_url(path: str) -> str:
    return f"{INSTAGRAM_GRAPH_HOST}/{INSTAGRAM_GRAPH_API_VERSION}/{path.lstrip('/')}"


def _expiry_from(payload: dict) -> float | None:
    """Absolute expiry from Meta's relative `expires_in`, if it sent one."""
    raw = payload.get("expires_in") if isinstance(payload, dict) else None
    if raw is None or isinstance(raw, bool):
        # No expiry recorded means refresh_expiring_tokens skips this row from
        # now on, and the token dies unrefreshed ~60 days later with nothing
        # to show for it. Worth a line even though it is not an error here.
        logger.warning("Meta sent no expires_in; this token will not be auto-refreshed")
        return None
    try:
        seconds = float(raw)
    except (TypeError, ValueError):
        logger.warning("Meta sent an unreadable expires_in (%r); not auto-refreshing", raw)
        return None
    if seconds <= 0:
        logger.warning("Meta sent expires_in=%r; not auto-refreshing", raw)
        return None
    return time.time() + seconds


# ── subscription ──────────────────────────────────────────────────────────
def subscribe_account(access_token: str, instagram_account_id: str) -> bool:
    """Subscribe one professional account to `comments`."""
    response = _request(
        "POST",
        _graph_url(f"{instagram_account_id}/subscribed_apps"),
        access_token=access_token,
        form_body={"subscribed_fields": ",".join(COMMENT_WEBHOOK_FIELDS)},
    )
    if response.get("success") is not True:
        logger.error(
            "Meta did not confirm the comments subscription for %s; its comments "
            "will not be delivered", instagram_account_id,
        )
        raise InstagramAPIError("Instagram did not confirm the comments subscription")
    logger.info("Subscribed account %s to comments", instagram_account_id)
    return True


# ── token lifecycle ───────────────────────────────────────────────────────
def refresh_token(db, instagram_account_id: str) -> InstagramConnection | None:
    """Renew one connection's long-lived token in place."""
    connection = (
        db.query(InstagramConnection)
        .filter(InstagramConnection.InstagramAccountId == str(instagram_account_id))
        .first()
    )
    if connection is None:
        return None

    try:
        current = instagram_token_cipher.decrypt(connection.AccessTokenEncrypted)
    except TokenCipherError as e:
        raise InstagramAPIError(f"could not read the stored token: {e}") from e

    # Only the token is needed -- no app secret, which is why this survives
    # the removal of the OAuth client.
    response = _request(
        "GET", INSTAGRAM_REFRESH_TOKEN_URL,
        params={"grant_type": "ig_refresh_token", "access_token": current},
    )
    refreshed = str(response.get("access_token") or "").strip()
    if not refreshed:
        raise InstagramAPIError("Instagram refresh response has no access token")

    connection.AccessTokenEncrypted = instagram_token_cipher.encrypt(refreshed)
    connection.TokenExpiresAt = _expiry_from(response)
    db.commit()
    db.refresh(connection)
    logger.info("Refreshed Instagram token for account %s", instagram_account_id)
    return connection


def refresh_expiring_tokens(db, margin_seconds: int | None = None) -> dict:
    """Refresh every active token inside the expiry margin.

    Called on a schedule. One vendor failing must not stop the others, so each
    is attempted independently.
    """
    margin = (
        INSTAGRAM_TOKEN_REFRESH_MARGIN_SECONDS
        if margin_seconds is None
        else margin_seconds
    )
    due = (
        db.query(InstagramConnection)
        .filter(
            InstagramConnection.Status == "active",
            InstagramConnection.TokenExpiresAt.isnot(None),
            InstagramConnection.TokenExpiresAt <= time.time() + margin,
        )
        .all()
    )
    refreshed = failed = 0
    for connection in due:
        try:
            refresh_token(db, connection.InstagramAccountId)
            refreshed += 1
        except InstagramAPIError as e:
            failed += 1
            logger.error(
                "Instagram token refresh failed for %s: %s",
                connection.InstagramAccountId, e,
            )
    return {"due": len(due), "refreshed": refreshed, "failed": failed}
