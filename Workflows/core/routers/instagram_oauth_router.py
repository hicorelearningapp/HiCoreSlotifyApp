"""
Instagram OAuth onboarding endpoints, plus the public legal pages.

    GET /integrations/instagram/connect?business_phone_number=...
        Admin-only. Mints single-use state and redirects the vendor to
        Instagram to authorize the shared Meta app.

    GET /integrations/instagram/callback
        The redirect URI registered in the Meta dashboard. Public by
        necessity -- Instagram calls it in the vendor's browser -- but it is
        protected by the single-use state, which is burned on first use.

    GET /privacy, GET /data-deletion
        Required by Meta App Review before Advanced Access is granted.
"""
import html
import secrets

from fastapi import APIRouter, HTTPException, Query, Request, status
from fastapi.responses import HTMLResponse, RedirectResponse

from config import (
    ADMIN_API_KEY,
    APP_DISPLAY_NAME,
    PRIVACY_CONTROLLER_NAME,
    PRIVACY_CONTACT_EMAIL,
)
from backend_app.core.database import db_session
from core.services.instagram_oauth_client import InstagramAPIError
from core.services.instagram_onboarding_service import (
    instagram_onboarding_service,
    InvalidOAuthStateError,
    InstagramOAuthResponseError,
    ConnectionConflictError,
 
    OnboardingError,
)
from core.services.instagram_token_cipher import TokenCipherError
from utils.legal_pages import (
    render_privacy_policy,
    render_data_deletion_instructions,
)


def _require_admin(request: Request) -> None:
    if not ADMIN_API_KEY:
        raise HTTPException(status_code=503, detail="ADMIN_API_KEY is not configured")
    if not secrets.compare_digest(
        request.headers.get("authorization", ""), f"Bearer {ADMIN_API_KEY}"
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid admin credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def _result_page(title: str, message: str, status_code: int = 200) -> HTMLResponse:
    return HTMLResponse(
        "<!doctype html><html><head><meta charset='utf-8'>"
        "<meta name='viewport' content='width=device-width,initial-scale=1'>"
        f"<title>{html.escape(title)}</title></head>"
        "<body style=\"font-family:system-ui,sans-serif;max-width:600px;"
        "margin:60px auto;padding:0 20px;line-height:1.6\">"
        f"<h1>{html.escape(title)}</h1><p>{message}</p></body></html>",
        status_code=status_code,
    )


class InstagramOAuthRouter:
    def __init__(self):
        self.router = APIRouter(tags=["instagram_oauth"])
        self._add_routes()

    def _add_routes(self):
        self.router.add_api_route(
            "/integrations/instagram/connect", self.connect, methods=["GET"]
        )
        self.router.add_api_route(
            "/integrations/instagram/callback", self.callback, methods=["GET"]
        )
        self.router.add_api_route(
            "/integrations/instagram/{instagram_account_id}/refresh-token",
            self.refresh_token,
            methods=["POST"],
        )
        self.router.add_api_route(
            "/integrations/instagram/{instagram_account_id}",
            self.disconnect,
            methods=["DELETE"],
        )
        self.router.add_api_route(
            "/privacy", self.privacy, methods=["GET"], include_in_schema=False
        )
        self.router.add_api_route(
            "/data-deletion", self.data_deletion, methods=["GET"], include_in_schema=False
        )

    def connect(
        self,
        request: Request,
        business_phone_number: str = Query(min_length=1, max_length=20),
    ):
        _require_admin(request)
        try:
            url = instagram_onboarding_service.build_authorization_url(
                db_session, business_phone_number
            )
        except ValueError as e:
            raise HTTPException(status_code=503, detail=str(e)) from e
        return RedirectResponse(url, status_code=status.HTTP_307_TEMPORARY_REDIRECT)

    def callback(
        self,
        state: str = Query(default=None),
        code: str = Query(default=None),
        error: str = Query(default=None),
        error_description: str = Query(default=None),
    ):
        if error:
            return _result_page(
                "Instagram connection cancelled",
                html.escape(error_description or error),
                status_code=400,
            )
        if not state or not code:
            raise HTTPException(
                status_code=400, detail="OAuth callback requires state and code"
            )

        try:
            connection = instagram_onboarding_service.complete_authorization(
                db_session, state=state, code=code
            )
        except InvalidOAuthStateError as e:
            raise HTTPException(status_code=400, detail=str(e)) from e
        except (InstagramOAuthResponseError, ConnectionConflictError) as e:
            raise HTTPException(status_code=409, detail=str(e)) from e
        except TokenCipherError as e:
            raise HTTPException(status_code=503, detail=str(e)) from e
        except InstagramAPIError as e:
            raise HTTPException(
                status_code=502, detail="Instagram authorization failed"
            ) from e

        return _result_page(
            "Instagram connected",
            f"<strong>@{html.escape(connection.InstagramUsername or 'your account')}</strong> "
            f"is now connected to {html.escape(connection.BusinessPhoneNumber)}."
            "<br><br>You may close this window.",
        )

    def refresh_token(self, instagram_account_id: str, request: Request):
        _require_admin(request)
        try:
            connection = instagram_onboarding_service.refresh_token(
                db_session, instagram_account_id
            )
        except OnboardingError as e:
            raise HTTPException(status_code=409, detail=str(e)) from e
        except InstagramAPIError as e:
            raise HTTPException(
                status_code=502, detail="Instagram token refresh failed"
            ) from e
        return {
            "instagram_account_id": connection.InstagramAccountId,
            "token_expires_at": connection.TokenExpiresAt,
            "status": connection.Status,
        }

    def disconnect(self, instagram_account_id: str, request: Request):
        _require_admin(request)
        try:
            return instagram_onboarding_service.disconnect(
                db_session, instagram_account_id
            )
        except OnboardingError as e:
            raise HTTPException(status_code=404, detail=str(e)) from e

    def privacy(self):
        return HTMLResponse(
            render_privacy_policy(
                app_name=APP_DISPLAY_NAME,
                controller_name=PRIVACY_CONTROLLER_NAME,
                contact_email=PRIVACY_CONTACT_EMAIL,
            )
        )

    def data_deletion(self):
        return HTMLResponse(
            render_data_deletion_instructions(
                app_name=APP_DISPLAY_NAME,
                controller_name=PRIVACY_CONTROLLER_NAME,
                contact_email=PRIVACY_CONTACT_EMAIL,
            )
        )


router = InstagramOAuthRouter().router

