"""
Admin endpoints for connecting an Instagram account to a business.

Every route here requires the admin bearer key. These endpoints accept and
manage access tokens, so unlike the other admin routers in this project they
are not left open. Send the key as a header, never in a query string:

    Authorization: Bearer <ADMIN_API_KEY>

Responses never include the access token.
"""
import secrets
from dataclasses import asdict

from fastapi import APIRouter, HTTPException, Request, status

from config import ADMIN_API_KEY
from backend_app.core.database import db_session
from core.channels.instagram.schemas.instagram_connection import (
    InstagramConnectionCreate,
    InstagramPolicyInput,
)
from core.channels.instagram.services.instagram_connection_service import instagram_connection_service
from core.channels.instagram.services.instagram_token_cipher import TokenCipherError
from core.channels.instagram.services.instagram_onboarding_service import (
    instagram_onboarding_service,
    OnboardingError,
)
from core.channels.instagram.services.instagram_oauth_client import InstagramAPIError


def _require_admin(request: Request) -> None:
    if not ADMIN_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ADMIN_API_KEY is not configured",
        )
    authorization = request.headers.get("authorization", "")
    if not secrets.compare_digest(authorization, f"Bearer {ADMIN_API_KEY}"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def _safe(connection) -> dict:
    """Serialise a connection without ever exposing the token."""
    policy = instagram_connection_service.resolve_policy(connection)
    policy_dict = asdict(policy)
    policy_dict["comment_keywords"] = list(policy_dict.get("comment_keywords") or ())
    return {
        "id": connection.Id,
        "instagram_account_id": connection.InstagramAccountId,
        "business_phone_number": connection.BusinessPhoneNumber,
        "instagram_username": connection.InstagramUsername,
        "status": connection.Status,
        "policy": policy_dict,
        "created_at": connection.CreatedAt.isoformat() if connection.CreatedAt else None,
        "updated_at": connection.UpdatedAt.isoformat() if connection.UpdatedAt else None,
    }


class InstagramConnectionRouter:
    def __init__(self):
        self.router = APIRouter(
            tags=["instagram_connections"],
            prefix="/api/admin/instagram/connections",
        )
        self._add_routes()

    def _add_routes(self):
        self.router.add_api_route("", self.list_connections, methods=["GET"])
        self.router.add_api_route("", self.connect, methods=["POST"])
        self.router.add_api_route("/{instagram_account_id}", self.get_connection, methods=["GET"])
        self.router.add_api_route("/{instagram_account_id}/policy", self.update_policy, methods=["PATCH"])
        self.router.add_api_route("/{instagram_account_id}/status", self.set_status, methods=["PATCH"])
        self.router.add_api_route("/{instagram_account_id}/subscribe", self.subscribe, methods=["POST"])
        self.router.add_api_route("/{instagram_account_id}", self.disconnect, methods=["DELETE"])

    def list_connections(self, request: Request, status_filter: str = None):
        _require_admin(request)
        connections = instagram_connection_service.list_all(db_session, status_filter)
        return {
            "count": len(connections),
            "connections": [_safe(c) for c in connections],
        }

    def get_connection(self, instagram_account_id: str, request: Request):
        _require_admin(request)
        connection = instagram_connection_service.get_by_account_id(
            db_session, instagram_account_id
        )
        if connection is None:
            raise HTTPException(status_code=404, detail="Connection not found")
        return _safe(connection)

    def connect(self, payload: InstagramConnectionCreate, request: Request):
        _require_admin(request)
        try:
            connection = instagram_connection_service.connect(
                db_session,
                instagram_account_id=payload.instagram_account_id,
                business_phone_number=payload.business_phone_number,
                access_token=payload.access_token.get_secret_value(),
                instagram_username=payload.instagram_username,
                policy=payload.policy.model_dump(exclude_none=True) if payload.policy else None,
            )
        except TokenCipherError as e:
            # Missing or invalid encryption key -- the operator must fix config.
            raise HTTPException(status_code=503, detail=str(e)) from e
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e)) from e

        # A stored token that is not subscribed receives no webhooks at all.
        # Report the outcome rather than failing the connect, so a subscription
        # problem does not throw away the token that was just supplied.
        result = _safe(connection)
        try:
            instagram_onboarding_service.subscribe_connection(
                db_session, connection.InstagramAccountId
            )
            result["subscribed"] = True
        except (OnboardingError, InstagramAPIError) as e:
            result["subscribed"] = False
            result["subscribe_error"] = str(e)
        return result

    def subscribe(self, instagram_account_id: str, request: Request):
        """Retry the account-level comments subscription."""
        _require_admin(request)
        try:
            instagram_onboarding_service.subscribe_connection(
                db_session, instagram_account_id
            )
        except OnboardingError as e:
            raise HTTPException(status_code=404, detail=str(e)) from e
        except InstagramAPIError as e:
            raise HTTPException(
                status_code=502, detail=f"Instagram subscription failed: {e}"
            ) from e
        return {"instagram_account_id": instagram_account_id, "subscribed": True}

    def update_policy(
        self,
        instagram_account_id: str,
        payload: InstagramPolicyInput,
        request: Request,
    ):
        _require_admin(request)
        try:
            connection = instagram_connection_service.update_policy(
                db_session, instagram_account_id, payload.model_dump(exclude_none=True)
            )
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e)) from e
        if connection is None:
            raise HTTPException(status_code=404, detail="Connection not found")
        return _safe(connection)

    def set_status(self, instagram_account_id: str, new_status: str, request: Request):
        _require_admin(request)
        try:
            connection = instagram_connection_service.set_status(
                db_session, instagram_account_id, new_status
            )
        except ValueError as e:
            raise HTTPException(status_code=422, detail=str(e)) from e
        if connection is None:
            raise HTTPException(status_code=404, detail="Connection not found")
        return _safe(connection)

    def disconnect(self, instagram_account_id: str, request: Request):
        _require_admin(request)
        deleted = instagram_connection_service.disconnect(db_session, instagram_account_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Connection not found")
        return {
            "status": "disconnected",
            "instagram_account_id": instagram_account_id,
            "token_deleted": True,
        }


router = InstagramConnectionRouter().router
