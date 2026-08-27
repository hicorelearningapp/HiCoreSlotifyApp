"""
Vendor onboarding.

One shared Meta app; each vendor authorises it against their own professional
account. The state is single-use and stored only as a SHA-256 digest, so a
replayed callback URL cannot register a second connection.

/connect is admin-only. /callback cannot be -- Meta redirects the vendor's
browser to it -- so its protection is the state parameter alone.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from db import get_db
from routers.connections import require_admin
from services.graph_client import InstagramAPIError
from services.onboarding import (
    ConnectionConflictError,
    InstagramOAuthResponseError,
    InvalidOAuthStateError,
    OnboardingError,
    instagram_onboarding_service,
)

logger = logging.getLogger("uvicorn")

router = APIRouter(prefix="/integrations/instagram", tags=["oauth"])


def _page(title: str, message: str, ok: bool = True) -> HTMLResponse:
    colour = "#2F6B45" if ok else "#A02F26"
    return HTMLResponse(
        f"""<main style="font-family:system-ui,sans-serif;max-width:34rem;
        margin:4rem auto;padding:0 1.5rem;line-height:1.6">
        <h1 style="color:{colour};font-size:1.4rem">{title}</h1>
        <p style="color:#444">{message}</p></main>""",
        status_code=200 if ok else 400,
    )


@router.get("/connect", dependencies=[Depends(require_admin)])
def connect(
    business_phone_number: str = Query(min_length=1, max_length=20),
    db: Session = Depends(get_db),
):
    """Start onboarding. Returns the Instagram URL to send the vendor to."""
    try:
        url = instagram_onboarding_service.build_authorization_url(db, business_phone_number)
    except OnboardingError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return {"authorization_url": url}


@router.get("/callback", response_class=HTMLResponse, include_in_schema=False)
def callback(
    state: str = Query(default=""),
    code: str = Query(default=""),
    error: str = Query(default=""),
    error_description: str = Query(default=""),
    db: Session = Depends(get_db),
):
    """Where Meta returns the vendor after they approve or decline."""
    if error:
        logger.info("Instagram onboarding declined: %s %s", error, error_description)
        return _page("Connection cancelled", error_description or error, ok=False)

    if not state or not code:
        return _page("Connection failed", "The callback was missing its state or code.", ok=False)

    try:
        connection = instagram_onboarding_service.complete_authorization(db, state, code)
    except InvalidOAuthStateError:
        # Also the expired-link case: states are single-use and time-limited.
        return _page(
            "Link expired",
            "That connection link has already been used or has expired. Start again.",
            ok=False,
        )
    except ConnectionConflictError as e:
        return _page("Already connected", str(e), ok=False)
    except (InstagramOAuthResponseError, InstagramAPIError) as e:
        logger.error("Instagram onboarding failed: %s", e)
        return _page("Connection failed", str(e), ok=False)
    except OnboardingError as e:
        logger.error("Instagram onboarding failed: %s", e)
        return _page("Connection failed", str(e), ok=False)

    return _page(
        "Connected",
        f"@{connection.InstagramUsername or connection.InstagramAccountId} is now "
        f"linked to {connection.BusinessPhoneNumber}. Comments on this account "
        f"will be answered automatically.",
    )


@router.post("/{instagram_account_id}/subscribe", dependencies=[Depends(require_admin)])
def subscribe(instagram_account_id: str, db: Session = Depends(get_db)):
    """Reinstall the account-level `comments` subscription."""
    try:
        ok = instagram_onboarding_service.subscribe_connection(db, instagram_account_id)
    except OnboardingError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    if not ok:
        raise HTTPException(status_code=404, detail="No connection for that account")
    return {"subscribed": True, "instagram_account_id": instagram_account_id}


@router.post("/{instagram_account_id}/refresh-token", dependencies=[Depends(require_admin)])
def refresh_token(instagram_account_id: str, db: Session = Depends(get_db)):
    try:
        connection = instagram_onboarding_service.refresh_token(db, instagram_account_id)
    except OnboardingError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    if connection is None:
        raise HTTPException(status_code=404, detail="No connection for that account")
    return {
        "instagram_account_id": instagram_account_id,
        "token_expires_at": connection.TokenExpiresAt,
    }


@router.delete("/{instagram_account_id}", status_code=status.HTTP_200_OK,
               dependencies=[Depends(require_admin)])
def disconnect(instagram_account_id: str, db: Session = Depends(get_db)):
    """Unsubscribe at Meta and drop the stored connection."""
    result = instagram_onboarding_service.disconnect(db, instagram_account_id)
    if not result.get("removed"):
        raise HTTPException(status_code=404, detail="No connection for that account")
    return result
