from typing import List, Optional
from sqlalchemy.orm import Session
from backend_app.modules.ecommerce.models import Order

class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, order_id: int) -> Optional[Order]:
        return self.db.query(Order).filter(Order.id == order_id).first()

    def list_orders(self, customer_phone: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Order]:
        query = self.db.query(Order)
        if customer_phone:
            query = query.filter(Order.customer_phone == customer_phone)
        return query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

    def create(self, order: Order) -> Order:
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    def update_status(self, order_id: int, status: str, payment_status: Optional[str] = None) -> Optional[Order]:
        order = self.get_by_id(order_id)
        if order:
            order.status = status
            if payment_status:
                order.payment_status = payment_status
            self.db.commit()
            self.db.refresh(order)
        return order
