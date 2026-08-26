import uuid
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend_app.core.database import db_session
from backend_app.modules.ecommerce.models import Product, Order, OrderItem
from backend_app.modules.ecommerce.schemas import OrderCreate
from backend_app.modules.ecommerce.repositories.order_repository import OrderRepository

class OrderService:
    def __init__(self, db: Session = None):
        self.db = db or db_session
        self.repo = OrderRepository(self.db)

    def create_order(self, data: OrderCreate) -> Order:
        subtotal = 0.0
        order_items = []

        for item_in in data.items:
            product = self.db.query(Product).filter(Product.id == item_in.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product ID {item_in.product_id} not found.")

            if product.stock_quantity < item_in.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for product '{product.name}'.")

            item_total = item_in.unit_price * item_in.quantity
            subtotal += item_total

            product.stock_quantity -= item_in.quantity

            order_items.append(OrderItem(
                product_id=product.id,
                product_name=product.name,
                sku=product.sku,
                quantity=item_in.quantity,
                unit_price=item_in.unit_price,
                total_price=item_total
            ))

        order_num = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        total = subtotal

        order = Order(
            order_number=order_num,
            customer_name=data.customer_name or "Guest Customer",
            customer_phone=data.customer_phone,
            customer_email=data.customer_email,
            shipping_address=data.shipping_address,
            city=data.city,
            state=data.state,
            pincode=data.pincode,
            payment_method=data.payment_method or "COD",
            status="Pending",
            payment_status="Unpaid",
            subtotal=subtotal,
            total=total,
            notes=data.notes,
            store_id=data.store_id or "default",
            items=order_items
        )

        return self.repo.create(order)

    def get_order(self, order_id: int) -> Order:
        order = self.repo.get_by_id(order_id)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found.")
        return order

    def update_status(self, order_id: int, status_str: str, payment_status: Optional[str] = None) -> Order:
        order = self.repo.update_status(order_id, status_str, payment_status)
        if not order:
            raise HTTPException(status_code=404, detail="Order not found.")
        return order
