from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.modules.ecommerce.schemas.report import EcommerceReportOut
from app.modules.ecommerce.services.report_service import ReportService


class ReportRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/reports", tags=["Ecommerce Reports"])
        self._add_routes()

    def _add_routes(self):
        self.router.add_api_route(
            "",
            self.get_reports,
            methods=["GET"],
            response_model=EcommerceReportOut,
            summary="Get ecommerce analytics reports for seller",
            description="Returns comprehensive ecommerce reports filtered by year, month, week, day, or overall: summary, revenueOverview, TopProducts, and RecentSales.",
        )

    def get_reports(
        self,
        seller_id: Optional[str] = Query(None, description="Filter reports by Seller / Merchant ID"),
        year: Optional[int] = Query(None, description="Filter reports by Year (e.g. 2024, 2025, 2026)"),
        period: Optional[str] = Query(None, description="Time shortcut: 'day', 'week', 'month', 'all'"),
        month: Optional[str] = Query(None, description="Filter by Month: 'Jan'..'Dec' (e.g. 'Sep', '9', 'September')"),
        week: Optional[str] = Query(None, description="Filter by Week: 'week1'..'week5' (e.g. 'week1', '1')"),
        day: Optional[str] = Query(None, description="Filter by Day: 'Monday'..'Sunday' (e.g. 'Wednesday', 'wed', '02.09.2026')"),
        db: Session = Depends(get_db)
    ):
        svc = ReportService(db)
        return svc.get_report(
            seller_id=seller_id,
            year=year,
            period=period,
            month=month,
            week=week,
            day=day
        )


router = ReportRouter().router
__all__ = ["ReportRouter", "router"]

