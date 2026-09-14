from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.modules.ecommerce.schemas.dashboard import SellerDashboardOut
from app.modules.ecommerce.services.dashboard_service import DashboardService


class DashboardRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/dashboard", tags=["Ecommerce Dashboard"])
        self._add_routes()

    def _add_routes(self):
        self.router.add_api_route(
            "",
            self.get_dashboard,
            methods=["GET"],
            response_model=SellerDashboardOut,
            summary="Get seller dashboard metrics",
            description="Returns seller ecommerce dashboard metrics: TotalProducts and OrdersAndSales (12 months hierarchy)",
        )

    def get_dashboard(
        self,
        seller_id: Optional[str] = Query(None, description="Filter dashboard by Seller / Merchant ID"),
        year: Optional[int] = Query(None, description="Filter dashboard by Year (e.g. 2024, 2025, 2026)"),
        db: Session = Depends(get_db),
    ):
        svc = DashboardService(db)
        return svc.get_seller_dashboard(seller_id=seller_id, year=year)


router = DashboardRouter().router
__all__ = ["DashboardRouter", "router"]

