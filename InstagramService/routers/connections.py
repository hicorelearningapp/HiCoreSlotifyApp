"""
Admin API over the connection table.

Everything is addressed by Instagram account id, because that is what the
webhook carries and what every other module keys on. The WhatsApp number is
data about a connection, never a path parameter.
"""
from __future__ import annotations

import json

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
from services.policy import POLICY_FIELDS, resolve_policy
from services.tenant_resolver import tenant_resolver

router = APIRouter(prefix="/integrations/instagram/connections", tags=["connections"])


def require_admin(x_api_key: str | None = Header(None, alias="X-API-Key")) -> None:
    """Reject unless the caller presents the admin key.

    Without a key configured the endpoints stay closed rather than open --
    these expose vendor account ids and can revoke a live integration.
    """
    if not ADMIN_API_KEY:
        raise HTTPException(status_code=503, detail="ADMIN_API_KEY is not configured")
    if x_api_key != ADMIN_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key")


def _to_out(connection) -> ConnectionOut:
    policy = resolve_policy(connection)
    return ConnectionOut(
        instagram_account_id=connection.InstagramAccountId,
        business_phone_number=connection.BusinessPhoneNumber,
        instagram_username=connection.InstagramUsername,
        status=connection.Status,
        token_expires_at=connection.TokenExpiresAt,
        scopes=connection.Scopes,
        account_type=connection.AccountType,
        # The token itself is never returned, in any form.
        effective_policy={
            "comment_reply_mode": policy.comment_reply_mode,
            "comment_match_mode": policy.comment_match_mode,
            "comment_keywords": list(policy.comment_keywords),
            "reply_to_nested_comments": policy.reply_to_nested_comments,
            "ignore_own_comments": policy.ignore_own_comments,
            "handoff_mode": policy.handoff_mode,
            "handoff_wa_number": policy.handoff_wa_number,
        },
    )


@router.get("", response_model=list[ConnectionOut], dependencies=[Depends(require_admin)])
def list_connections(status_filter: str | None = None, db: Session = Depends(get_db)):
    return [_to_out(c) for c in tenant_resolver.list_connections(db, status_filter)]


@router.get("/{instagram_account_id}", response_model=ConnectionOut,
            dependencies=[Depends(require_admin)])
def get_connection(instagram_account_id: str, db: Session = Depends(get_db)):
    connection = tenant_resolver.get_by_account_id(db, instagram_account_id)
    if connection is None:
        raise HTTPException(status_code=404, detail="No connection for that account")
    return _to_out(connection)


@router.post("", response_model=ConnectionOut, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(require_admin)])
def create_connection(payload: ConnectionCreate, db: Session = Depends(get_db)):
    """Register an account directly, bypassing OAuth.

    Used to restore an existing integration, or to onboard an account whose
    token was obtained by hand.
    """
    try:
        connection = tenant_resolver.connect(
            db,
            instagram_account_id=payload.instagram_account_id,
            business_phone_number=payload.business_phone_number,
            access_token=payload.access_token,
            instagram_username=payload.instagram_username,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return _to_out(connection)


@router.patch("/{instagram_account_id}/policy", response_model=ConnectionOut,
              dependencies=[Depends(require_admin)])
def update_policy(instagram_account_id: str, payload: PolicyUpdate,
                  db: Session = Depends(get_db)):
    connection = tenant_resolver.get_by_account_id(db, instagram_account_id)
    if connection is None:
        raise HTTPException(status_code=404, detail="No connection for that account")

    overrides = payload.model_dump(exclude_unset=True, exclude_none=True)
    unknown = set(overrides) - POLICY_FIELDS
    if unknown:
        raise HTTPException(
            status_code=400, detail=f"Unknown policy fields: {sorted(unknown)}"
        )

    existing = {}
    if connection.PolicyJson:
        try:
            existing = json.loads(connection.PolicyJson) or {}
        except ValueError:
            existing = {}
    existing.update(overrides)

    connection.PolicyJson = json.dumps(existing)
    db.commit()
    db.refresh(connection)
    return _to_out(connection)


@router.patch("/{instagram_account_id}/status", response_model=ConnectionOut,
              dependencies=[Depends(require_admin)])
def set_status(instagram_account_id: str, payload: StatusUpdate,
               db: Session = Depends(get_db)):
    connection = tenant_resolver.set_status(db, instagram_account_id, payload.status)
    if connection is None:
        raise HTTPException(status_code=404, detail="No connection for that account")
    return _to_out(connection)


@router.delete("/{instagram_account_id}", status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(require_admin)])
def delete_connection(instagram_account_id: str, db: Session = Depends(get_db)):
    if not tenant_resolver.disconnect(db, instagram_account_id):
        raise HTTPException(status_code=404, detail="No connection for that account")
    return None
