import datetime
import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from backend_app.modules.ecommerce.models.order import Order, OrderItem
from backend_app.modules.ecommerce.schemas.order import OrderCreate
from backend_app.modules.ecommerce.models.customer import EcommerceCustomer
from backend_app.modules.ecommerce.models.product import Product

class OrderService:
    def __init__(self, db: Session):
        self.db = db

    def create_order(self, data: OrderCreate) -> Order:
        # Find customer by phone
        customer = self.db.query(EcommerceCustomer).filter(EcommerceCustomer.PhoneNumber == data.customer_phone).first()
        customer_id = customer.CustomerId if customer else None

        subtotal = sum(item.quantity * item.unit_price for item in data.items)
        shipping_fee = 0.0
        discount = 0.0
        total = subtotal + shipping_fee - discount

        order_number = f"ORD-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:4]}"

        order = Order(
            order_number=order_number,
            customer_id=customer_id,
            customer_name=data.customer_name,
            customer_phone=data.customer_phone,
            customer_email=data.customer_email,
            shipping_address=data.shipping_address,
            city=data.city,
            state=data.state,
            pincode=data.pincode,
            payment_method=data.payment_method,
            subtotal=subtotal,
            shipping_fee=shipping_fee,
            discount=discount,
            total=total,
            notes=data.notes,
            store_id=data.store_id
        )
        self.db.add(order)
        self.db.flush()

        for item_data in data.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=item_data.product_id,
                quantity=item_data.quantity,
                unit_price=item_data.unit_price,
                total_price=item_data.quantity * item_data.unit_price
            )
            self.db.add(order_item)
            
            # Deduct stock
            product = self.db.query(Product).filter(Product.id == item_data.product_id).first()
            if product and product.stock_quantity >= item_data.quantity:
                product.stock_quantity -= item_data.quantity

        self.db.commit()
        self.db.refresh(order)
        return order

    def list_orders(self, customer_phone: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Order]:
        query = self.db.query(Order)
        if customer_phone:
            query = query.filter(Order.customer_phone == customer_phone)
        return query.offset(skip).limit(limit).all()

    def get_order(self, order_id: int) -> Order:
        return self.db.query(Order).filter(Order.id == order_id).first()

    def update_status(self, order_id: int, status: str, payment_status: Optional[str] = None) -> Order:
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if order:
            order.status = status
            if payment_status:
                order.payment_status = payment_status
            self.db.commit()
            self.db.refresh(order)
        return order
