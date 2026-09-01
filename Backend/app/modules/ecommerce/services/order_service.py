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

    def list_orders(
        self,
        customer_phone: Optional[str] = None,
        seller_id: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> dict:
        base_query = self.db.query(Order)
        if seller_id:
            base_query = base_query.filter(Order.SellerId == seller_id)
        if customer_phone:
            base_query = base_query.filter(Order.CustomerPhone == customer_phone)
            
        all_orders = base_query.all()
        
        all_count = len(all_orders)
        new_count = 0
        processing_count = 0
        shipped_count = 0
        delivered_count = 0
        cancelled_count = 0
        
        for o in all_orders:
            st = (o.Status or "").strip().lower()
            if st in ["new", "pending", "created"]:
                new_count += 1
            elif st in ["processing", "in progress", "in_progress", "confirmed", "accepted"]:
                processing_count += 1
            elif st in ["shipped", "dispatched", "in transit", "in_transit", "out for delivery", "out_for_delivery"]:
                shipped_count += 1
            elif st in ["delivered", "completed", "done"]:
                delivered_count += 1
            elif st in ["cancelled", "canceled", "rejected"]:
                cancelled_count += 1
            else:
                new_count += 1

        filtered_query = base_query
        if status:
            filtered_query = filtered_query.filter(Order.Status.ilike(status))

        order_items = filtered_query.order_by(Order.Id.desc()).offset(skip).limit(limit).all()

        return {
            "AllOrders": all_count,
            "New": new_count,
            "Processing": processing_count,
            "Shipped": shipped_count,
            "Delivered": delivered_count,
            "Cancelled": cancelled_count,
            "Orders": order_items
        }

    def get_order(self, order_id: str) -> Optional[Order]:
        return self.db.query(Order).filter(Order.Id == order_id).first()

    def update_status(self, order_id: str, status: str, payment_status: Optional[str] = None) -> Order:
        order = self.db.query(Order).filter(Order.Id == order_id).first()
        if not order:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Order not found")
        order.Status = status
        if payment_status:
            order.PaymentStatus = payment_status
        order.UpdatedAt = datetime.datetime.utcnow()
        self.db.commit()
        self.db.refresh(order)
        return order

    def update_payment_status(self, order_id: str, payment_status: str) -> Order:
        order = self.db.query(Order).filter(Order.Id == order_id).first()
        if not order:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Order not found")
        order.PaymentStatus = payment_status
        order.UpdatedAt = datetime.datetime.utcnow()
        self.db.commit()
        self.db.refresh(order)
        return order

