from typing import List, Optional
from fastapi import APIRouter, Query, status

import backend_app.common.schemas as schemas
from backend_app.common.services.business_service import BusinessService

class BusinessRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/businesses", tags=["Common Business Management"])
        self.business_svc = BusinessService()
        self._add_routes()

    def _add_routes(self):
        self.router.add_api_route(
            "/register",
            self.register_business,
            methods=["POST"],
            response_model=schemas.BusinessOut,
            status_code=status.HTTP_201_CREATED,
            summary="Register a new business (Multi-industry support with common columns and industry JSON data)"
        )
        self.router.add_api_route(
            "/login",
            self.login_business,
            methods=["POST"],
            response_model=schemas.BusinessLoginResponse,
            status_code=status.HTTP_200_OK,
            summary="Business account login with JWT token generation"
        )
        self.router.add_api_route(
            "",
            self.list_businesses,
            methods=["GET"],
            response_model=List[schemas.BusinessOut],
            status_code=status.HTTP_200_OK,
            summary="List all registered businesses filterable by industry and status"
        )
        self.router.add_api_route(
            "/{business_id}",
            self.get_business,
            methods=["GET"],
            response_model=schemas.BusinessOut,
            status_code=status.HTTP_200_OK,
            summary="Get details of a registered business by ID"
        )
        self.router.add_api_route(
            "/{business_id}",
            self.update_business,
            methods=["PUT"],
            response_model=schemas.BusinessOut,
            status_code=status.HTTP_200_OK,
            summary="Update business profile or industry-specific JSON payload"
        )
        self.router.add_api_route(
            "/{business_id}",
            self.delete_business,
            methods=["DELETE"],
            status_code=status.HTTP_200_OK,
            summary="Delete a business registration"
        )

    def register_business(self, data: schemas.BusinessRegisterCreate):
        return self.business_svc.register_business(data)

    def login_business(self, login_data: schemas.BusinessLogin):
        return self.business_svc.login_business(login_data)

    def list_businesses(
        self,
        industry_type: Optional[str] = Query(None, description="Filter by industry type (e.g. doctor_appointment, ecommerce, salon, etc.)"),
        status: Optional[str] = Query(None, description="Filter by status (e.g. Pending, Approved, Active, Suspended)"),
        skip: int = Query(0, ge=0, description="Number of records to skip"),
        limit: int = Query(100, ge=1, le=500, description="Max records to return")
    ):
        return self.business_svc.list_businesses(industry_type=industry_type, status=status, skip=skip, limit=limit)

    def get_business(self, business_id: str):
        return self.business_svc.get_business(business_id)

    def update_business(self, business_id: str, data: schemas.BusinessUpdate):
        return self.business_svc.update_business(business_id, data)

    def delete_business(self, business_id: str):
        self.business_svc.delete_business(business_id)
        return {"status": "success", "message": "Business registration deleted successfully."}
