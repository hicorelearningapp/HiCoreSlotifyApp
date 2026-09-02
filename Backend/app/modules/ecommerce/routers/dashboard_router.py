from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.modules.ecommerce.schemas.dashboard import SellerDashboardOut
from app.modules.ecommerce.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Ecommerce Dashboard"])

@router.get("", response_model=SellerDashboardOut, summary="Get seller dashboard metrics")
def get_dashboard(
    seller_id: Optional[str] = Query(None, description="Filter dashboard by Seller / Merchant ID"),
    year: Optional[int] = Query(None, description="Filter dashboard by Year (e.g. 2024, 2025, 2026)"),
    db: Session = Depends(get_db)
):
    """
    Returns seller ecommerce dashboard metrics:
    - TotalProducts
    - OrdersAndSales (12 months hierarchy)
    """
    svc = DashboardService(db)
    return svc.get_seller_dashboard(seller_id=seller_id, year=year)
