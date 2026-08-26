from fastapi import APIRouter
from backend_app.common.routers.business_router import BusinessRouter

class CommonRouter:
    def __init__(self):
        self.router = APIRouter()
        self._add_routes()
        # Include business management router
        self.router.include_router(BusinessRouter().router)

    def _add_routes(self):
        self.router.add_api_route(
            "/health",
            self.health_check,
            methods=["GET"],
            tags=["Infrastructure"],
            summary="System Health Check"
        )
        self.router.add_api_route(
            "/system/status",
            self.system_status,
            methods=["GET"],
            tags=["Infrastructure"],
            summary="System Information & Supported Industries"
        )

    def health_check(self):
        return {
            "status": "ok",
            "service": "HiCore Slotify API Backend",
            "version": "1.0.0"
        }

    def system_status(self):
        return {
            "status": "online",
            "supported_industries": [
                "doctor_appointment",
                "ecommerce",
                "salon",
                "fitness",
                "hospitality",
                "real_estate",
                "automotive",
                "education"
            ],
            "modules": {
                "common_business_registration": "active",
                "doctor_appointment": "active",
                "ecommerce": "active"
            }
        }

router = CommonRouter().router
