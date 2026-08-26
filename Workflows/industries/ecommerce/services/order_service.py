from backend_app.modules.ecommerce.models.order import Order, OrderItem
from sqlalchemy.orm import Session
from backend_app.core.database import db_session

class OrderService:
    @staticmethod
    def create_order(db: Session, customer_id: int, product_id: int, quantity: int, total: float, variant_id: int = None, source_channel: str = "whatsapp") -> Order:
        order = Order(
            customer_id=customer_id,
            total=total,
            source_channel=source_channel
        )
        db.add(order)
        db.flush() # flush to get order.id

        order_item = OrderItem(
            order_id=order.id,
            product_id=product_id,
            variant_id=variant_id,
            quantity=quantity,
            unit_price=total/quantity if quantity > 0 else 0
        )
        db.add(order_item)
        
        # Deduct stock if a variant was selected
        if variant_id:
            from backend_app.modules.ecommerce.models.product import ProductVariant
            variant = db.query(ProductVariant).filter(ProductVariant.id == variant_id).first()
            if variant and variant.stock_quantity >= quantity:
                variant.stock_quantity -= quantity
                
        db.commit()
        db.refresh(order)
        return order

    @staticmethod
    def update_order_details(db: Session, order_id: int, delivery_slot: str, payment_method: str):
        order = db.query(Order).filter(Order.id == order_id).first()
        if order:
            order.delivery_slot = delivery_slot
            order.payment_method = payment_method
            order.status = "Confirmed"
            db.commit()
            db.refresh(order)
        return order

    @staticmethod
    def update_order_status(db: Session, order_id: int, status: str):
        order = db.query(Order).filter(Order.id == order_id).first()
        if order:
            order.status = status
            db.commit()
            db.refresh(order)
        return order

    @staticmethod
    def get_order(db: Session, order_id: int):
        return db.query(Order).filter(Order.id == order_id).first()

    @staticmethod
    def get_pending_orders(db: Session):
        return db.query(Order).filter(Order.status.in_(["Confirmed", "Preparing"])).all()

order_service = OrderService()
