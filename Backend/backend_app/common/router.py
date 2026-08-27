from fastapi import APIRouter
from backend_app.common.routers.business_router import BusinessRouter
from fastapi import Depends
from backend_app.core.database import get_db
from sqlalchemy.orm import Session
from backend_app.modules.business_config.services.business_config_service import BusinessConfigService

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
        self.router.add_api_route(
            "/business-config/{business_phone}",
            self.get_business_config,
            methods=["GET"],
            tags=["Configuration"],
            summary="Get Configuration for a Business Phone"
        )

    def get_business_config(self, business_phone: str, db: Session = Depends(get_db)):
        return BusinessConfigService.get_config(db, business_phone)

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
