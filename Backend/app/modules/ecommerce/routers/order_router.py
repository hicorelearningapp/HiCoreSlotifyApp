from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.modules.ecommerce.schemas import (
    OrderOut, OrderCreate, OrderStatusUpdate, OrderPaymentStatusUpdate, OrderListResponse
)
from app.modules.ecommerce.services.order_service import OrderService


class OrderRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/orders", tags=["Ecommerce Orders"])
        self._add_routes()

    def _add_routes(self):
        self.router.add_api_route(
            "",
            self.create_order,
            methods=["POST"],
            response_model=OrderOut,
            status_code=status.HTTP_201_CREATED,
            summary="Create a new customer order",
        )
        self.router.add_api_route(
            "",
            self.list_orders,
            methods=["GET"],
            response_model=OrderListResponse,
            summary="Get orders with status analytics and counts",
            description="Returns orders list along with aggregate counts: AllOrders, New, Processing, Shipped, Delivered, Cancelled.",
        )
        self.router.add_api_route(
            "/{order_id}",
            self.get_order,
            methods=["GET"],
            response_model=OrderOut,
            summary="Get order by ID",
        )
        self.router.add_api_route(
            "/{order_id}/status",
            self.update_order_status,
            methods=["PATCH"],
            response_model=OrderOut,
            summary="Update order status",
        )
        self.router.add_api_route(
            "/{order_id}/payment-status",
            self.update_order_payment_status,
            methods=["PATCH"],
            response_model=OrderOut,
            summary="Update order payment status",
        )

    def create_order(self, data: OrderCreate, db: Session = Depends(get_db)):
        svc = OrderService(db)
        return svc.create_order(data)

    def list_orders(
        self,
        seller_id: Optional[str] = Query(None, description="Filter orders by Seller / Merchant ID"),
        customer_phone: Optional[str] = Query(None, description="Filter orders by customer phone"),
        order_status: Optional[str] = Query(None, alias="status", description="Filter by status (New, Processing, Shipped, Delivered, Cancelled)"),
        skip: int = Query(0, ge=0, description="Pagination offset"),
        limit: int = Query(100, ge=1, le=500, description="Pagination limit"),
        db: Session = Depends(get_db),
    ):
        svc = OrderService(db)
        return svc.list_orders(
            customer_phone=customer_phone,
            seller_id=seller_id,
            status=order_status,
            skip=skip,
            limit=limit,
        )

    def get_order(self, order_id: str, db: Session = Depends(get_db)):
        svc = OrderService(db)
        order = svc.get_order(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order

    def update_order_status(self, order_id: str, data: OrderStatusUpdate, db: Session = Depends(get_db)):
        svc = OrderService(db)
        return svc.update_status(order_id, data.Status)

    def update_order_payment_status(self, order_id: str, data: OrderPaymentStatusUpdate, db: Session = Depends(get_db)):
        svc = OrderService(db)
        return svc.update_payment_status(order_id, data.PaymentStatus)


router = OrderRouter().router
__all__ = ["OrderRouter", "router"]




