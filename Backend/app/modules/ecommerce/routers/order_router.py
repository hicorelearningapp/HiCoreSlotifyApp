from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.modules.ecommerce.schemas import OrderOut, OrderCreate, OrderStatusUpdate
from app.modules.ecommerce.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Ecommerce Orders"])

@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    svc = OrderService(db)
    return svc.create_order(data)

@router.get("", response_model=List[OrderOut])
def list_orders(
    customer_phone: Optional[str] = Query(None, description="Filter orders by customer phone"),
    seller_id: Optional[str] = Query(None, description="Filter orders by Seller ID"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    svc = OrderService(db)
    return svc.list_orders(customer_phone=customer_phone, seller_id=seller_id, skip=skip, limit=limit)

@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: str, db: Session = Depends(get_db)):
    svc = OrderService(db)
    return svc.get_order(order_id)

@router.put("/{order_id}/status", response_model=OrderOut)
def update_order_status(order_id: str, data: OrderStatusUpdate, db: Session = Depends(get_db)):
    svc = OrderService(db)
    return svc.update_status(order_id, data.Status, data.PaymentStatus)
