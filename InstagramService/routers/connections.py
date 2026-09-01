"""
Admin API over the connection table.

This is how a vendor is onboarded. There is no OAuth flow: a token is made by
hand in the Meta dashboard, POSTed here, and the account is then subscribed to
`comments` through /subscribe. Two calls, in that order.

Everything is addressed by Instagram account id, because that is what the
webhook carries and what every other module keys on. The WhatsApp number is
data about a connection, never a path parameter.
"""
from __future__ import annotations

import json
import logging
import secrets
import time

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from config import ADMIN_API_KEY
from db import get_db
from schemas.connection import (
    ConnectionCreate,
    ConnectionOut,
    PolicyUpdate,
    StatusUpdate,
)
from services.graph_admin import InstagramAPIError, subscribe_account
from services.graph_admin import refresh_token as refresh_connection_token
from services.policy import POLICY_FIELDS, resolve_policy
from services.tenant_resolver import tenant_resolver

logger = logging.getLogger("uvicorn")

#: What a freshly generated long-lived token gets from Meta.
DEFAULT_TOKEN_LIFETIME_SECONDS = 60 * 24 * 60 * 60


def require_admin(x_api_key: str | None = Header(None, alias="X-API-Key")) -> None:
    """Reject unless the caller presents the admin key.

    Without a key configured the endpoints stay closed rather than open --
    these expose vendor account ids and can revoke a live integration.

    Module-level rather than a method: it is a FastAPI dependency.
    """
    if not ADMIN_API_KEY:
        raise HTTPException(status_code=503, detail="ADMIN_API_KEY is not configured")
    # compare_digest rather than !=, so the time taken does not reveal how much
    # of the key was correct -- matching how the webhook checks its verify
    # token. Compared as bytes because the str form rejects non-ASCII, and the
    # header is attacker-controlled.
    presented = (x_api_key or "").encode("utf-8")
    if not secrets.compare_digest(presented, ADMIN_API_KEY.encode("utf-8")):
        # These endpoints can revoke a live integration, so a rejected key is
        # worth a line. The key itself is never logged.
        logger.warning(
            "Rejected an admin request with %s X-API-Key",
            "an invalid" if x_api_key else "no",
        )
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key")


def _to_out(connection) -> ConnectionOut:
    policy = resolve_policy(connection)
    return ConnectionOut(
        instagram_account_id=connection.InstagramAccountId,
        instagram_username=connection.InstagramUsername,
        business_phone_number=connection.BusinessPhoneNumber,
        status=connection.Status,
        token_expires_at=connection.TokenExpiresAt,
        # The token itself is never returned, in any form.
        effective_policy={
            "comment_reply_mode": policy.comment_reply_mode,
            "comment_match_mode": policy.comment_match_mode,
            "comment_keywords": list(policy.comment_keywords),
            "reply_to_nested_comments": policy.reply_to_nested_comments,
            "ignore_own_comments": policy.ignore_own_comments,
        },
    )


class ConnectionsRouter:
    def __init__(self):
        self.router = APIRouter(
            prefix="/integrations/instagram/connections", tags=["connections"]
        )
        self._add_routes()

    def _add_routes(self):
        admin = [Depends(require_admin)]
        self.router.add_api_route("", self.list_connections, methods=["GET"],
                                  response_model=list[ConnectionOut], dependencies=admin)
        self.router.add_api_route("/{instagram_account_id}", self.get_connection, methods=["GET"],
                                  response_model=ConnectionOut, dependencies=admin)
        self.router.add_api_route("", self.create_connection, methods=["POST"],
                                  response_model=ConnectionOut,
                                  status_code=status.HTTP_201_CREATED, dependencies=admin)
        self.router.add_api_route("/{instagram_account_id}/policy", self.update_policy,
                                  methods=["PATCH"], response_model=ConnectionOut,
                                  dependencies=admin)
        self.router.add_api_route("/{instagram_account_id}/status", self.set_status,
                                  methods=["PATCH"], response_model=ConnectionOut,
                                  dependencies=admin)
        self.router.add_api_route("/{instagram_account_id}", self.delete_connection,
                                  methods=["DELETE"],
                                  status_code=status.HTTP_204_NO_CONTENT, dependencies=admin)
        self.router.add_api_route("/{instagram_account_id}/subscribe", self.subscribe,
                                  methods=["POST"], dependencies=admin)
        self.router.add_api_route("/{instagram_account_id}/refresh-token",
                                  self.refresh_token, methods=["POST"], dependencies=admin)

    def list_connections(self, status_filter: str | None = None, db: Session = Depends(get_db)):
        return [_to_out(c) for c in tenant_resolver.list_connections(db, status_filter)]

    def get_connection(self, instagram_account_id: str, db: Session = Depends(get_db)):
        connection = tenant_resolver.get_by_account_id(db, instagram_account_id)
        if connection is None:
            raise HTTPException(status_code=404, detail="No connection for that account")
        return _to_out(connection)

    def create_connection(self, payload: ConnectionCreate, db: Session = Depends(get_db)):
        """Register one vendor from a token generated by hand.

        The onboarding path. Follow it with POST /{id}/subscribe -- without
        that call the account's comments never reach the webhook.

        An expiry is always recorded, guessed when not supplied, because the
        refresh job skips rows that have none and an unrefreshed token dies
        silently 60 days in.
        """
        expires_at = payload.token_expires_at
        if expires_at is None:
            expires_at = time.time() + DEFAULT_TOKEN_LIFETIME_SECONDS

        try:
            connection = tenant_resolver.connect(
                db,
                instagram_account_id=payload.instagram_account_id,
                business_phone_number=payload.business_phone_number,
                access_token=payload.access_token,
                instagram_username=payload.instagram_username,
                token_expires_at=expires_at,
            )
        except ValueError as e:
            logger.warning(
                "Rejected a connection for account %s: %s",
                payload.instagram_account_id, e,
            )
            raise HTTPException(status_code=400, detail=str(e)) from e
        except Exception:
            # An IntegrityError here means a concurrent write took the row.
            # Without this it surfaces as an unexplained 500.
            logger.exception(
                "Could not store the connection for account %s",
                payload.instagram_account_id,
            )
            raise HTTPException(status_code=500, detail="Could not store the connection")
        return _to_out(connection)

    def update_policy(self, instagram_account_id: str, payload: PolicyUpdate,
                      db: Session = Depends(get_db)):
        connection = tenant_resolver.get_by_account_id(db, instagram_account_id)
        if connection is None:
            raise HTTPException(status_code=404, detail="No connection for that account")

        overrides = payload.model_dump(exclude_unset=True, exclude_none=True)
        unknown = set(overrides) - POLICY_FIELDS
        if unknown:
            logger.warning(
                "Rejected a policy update for %s with unknown fields: %s",
                instagram_account_id, sorted(unknown),
            )
            raise HTTPException(
                status_code=400, detail=f"Unknown policy fields: {sorted(unknown)}"
            )

        existing = {}
        if connection.PolicyJson:
            try:
                existing = json.loads(connection.PolicyJson) or {}
            except ValueError:
                logger.warning(
                    "Discarding unreadable PolicyJson on %s before applying the "
                    "update; previous overrides are lost", instagram_account_id,
                )
                existing = {}
        existing.update(overrides)

        connection.PolicyJson = json.dumps(existing)
        db.commit()
        db.refresh(connection)
        return _to_out(connection)

    def set_status(self, instagram_account_id: str, payload: StatusUpdate,
                   db: Session = Depends(get_db)):
        connection = tenant_resolver.set_status(db, instagram_account_id, payload.status)
        if connection is None:
            raise HTTPException(status_code=404, detail="No connection for that account")
        return _to_out(connection)

    def delete_connection(self, instagram_account_id: str, db: Session = Depends(get_db)):
        if not tenant_resolver.disconnect(db, instagram_account_id):
            raise HTTPException(status_code=404, detail="No connection for that account")
        return None

    def subscribe(self, instagram_account_id: str, db: Session = Depends(get_db)):
        """Subscribe the account to `comments` at Meta.

        Configuring the callback URL in the dashboard subscribes the *app*.
        Every professional account needs this call as well, or its comments
        are never delivered -- and that silence looks exactly like nobody
        having commented.
        """
        token = tenant_resolver.get_access_token(db, instagram_account_id)
        if not token:
            logger.error(
                "Cannot subscribe %s: no usable token. Its comments will never "
                "reach the webhook.", instagram_account_id,
            )
            raise HTTPException(status_code=404, detail="No usable token for that account")
        try:
            subscribe_account(token, instagram_account_id)
        except InstagramAPIError as e:
            logger.error(
                "Meta refused the comments subscription for %s: %s. Until this "
                "succeeds the account's comments are not delivered.",
                instagram_account_id, e,
            )
            raise HTTPException(status_code=502, detail=str(e)) from e
        return {"subscribed": True, "instagram_account_id": instagram_account_id}

    def refresh_token(self, instagram_account_id: str, db: Session = Depends(get_db)):
        """Renew the stored token now instead of waiting for the scheduler."""
        try:
            connection = refresh_connection_token(db, instagram_account_id)
        except InstagramAPIError as e:
            logger.error("Token refresh failed for %s: %s", instagram_account_id, e)
            raise HTTPException(status_code=502, detail=str(e)) from e
        if connection is None:
            raise HTTPException(status_code=404, detail="No connection for that account")
        return {
            "instagram_account_id": instagram_account_id,
            "token_expires_at": connection.TokenExpiresAt,
        }


router = ConnectionsRouter().router
