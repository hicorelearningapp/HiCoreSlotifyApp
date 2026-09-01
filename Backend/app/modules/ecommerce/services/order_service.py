import datetime
import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.modules.ecommerce.models.order import Order, OrderItem
from app.modules.ecommerce.schemas.order import OrderCreate
from app.modules.ecommerce.models.customer import EcommerceCustomer
from app.modules.ecommerce.models.product import Product

class OrderService:
    def __init__(self, db: Session):
        self.db = db

    def create_order(self, data: OrderCreate) -> Order:
        # Find customer by phone
        customer = self.db.query(EcommerceCustomer).filter(EcommerceCustomer.PhoneNumber == data.CustomerPhone).first()
        customer_id = customer.CustomerId if customer else None

        subtotal = sum(item.Quantity * item.UnitPrice for item in data.Items)
        shipping_fee = 0.0
        discount = 0.0
        total = subtotal + shipping_fee - discount

        order_number = f"ORD-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:4]}"

        order = Order(
            OrderNumber=order_number,
            SellerId=data.SellerId,
            CustomerId=customer_id,
            CustomerName=data.CustomerName,
            CustomerPhone=data.CustomerPhone,
            CustomerEmail=data.CustomerEmail,
            ShippingAddress=data.ShippingAddress,
            City=data.City,
            State=data.State,
            Pincode=data.Pincode,
            PaymentMethod=data.PaymentMethod,
            Subtotal=subtotal,
            ShippingFee=shipping_fee,
            Discount=discount,
            Total=total,
            Notes=data.Notes,
            OrderData=data.OrderData or {}
        )
        self.db.add(order)
        self.db.flush()

        for item_data in data.Items:
            product = self.db.query(Product).filter(Product.Id == item_data.ProductId).first()
            p_name = item_data.ProductName or (product.ProductName if product else None)
            p_sku = item_data.Sku or (product.Sku if product else None)

            order_item = OrderItem(
                OrderId=order.Id,
                ProductId=item_data.ProductId,
                ProductName=p_name,
                Sku=p_sku,
                Quantity=item_data.Quantity,
                UnitPrice=item_data.UnitPrice,
                TotalPrice=item_data.Quantity * item_data.UnitPrice,
                ItemData=item_data.ItemData or {}
            )
            self.db.add(order_item)
            
            # Deduct stock if tracked in ProductData
            if product and product.ProductData and isinstance(product.ProductData, dict):
                curr_stock = product.ProductData.get("stock_quantity") or product.ProductData.get("StockQuantity")
                if isinstance(curr_stock, (int, float)) and curr_stock >= item_data.Quantity:
                    p_data = dict(product.ProductData)
                    p_data["stock_quantity"] = int(curr_stock - item_data.Quantity)
                    product.ProductData = p_data

        self.db.commit()
        self.db.refresh(order)
        return order

    def list_orders(self, customer_phone: Optional[str] = None, seller_id: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Order]:
        query = self.db.query(Order)
        if customer_phone:
            query = query.filter(Order.CustomerPhone == customer_phone)
        if seller_id:
            query = query.filter(Order.SellerId == seller_id)
        return query.order_by(Order.Id.desc()).offset(skip).limit(limit).all()

    def get_order(self, order_id: str) -> Optional[Order]:
        return self.db.query(Order).filter(Order.Id == order_id).first()

    def update_status(self, order_id: str, status: str, payment_status: Optional[str] = None) -> Optional[Order]:
        order = self.db.query(Order).filter(Order.Id == order_id).first()
        if order:
            order.Status = status
            if payment_status:
                order.PaymentStatus = payment_status
            self.db.commit()
            self.db.refresh(order)
        return order
