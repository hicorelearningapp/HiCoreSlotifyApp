import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend_app.core.database import Base

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), index=True, nullable=True)
    customer_id = Column(String(36), ForeignKey("customers.PatientId"), nullable=True)
    customer_name = Column(String(150), nullable=True)
    customer_phone = Column(String(50), nullable=True)
    customer_email = Column(String(150), nullable=True)
    shipping_address = Column(String(300), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(20), nullable=True)
    status = Column(String, default="Pending")
    payment_status = Column(String, default="Unpaid")
    payment_method = Column(String, nullable=True)
    subtotal = Column(Float, default=0.0)
    shipping_fee = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    delivery_slot = Column(String, nullable=True)
    source_channel = Column(String, default="web")
    notes = Column(String, nullable=True)
    store_id = Column(String, index=True, default="default")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    customer = relationship("Customer")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    product_name = Column(String(200), nullable=True)
    sku = Column(String(100), nullable=True)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, default=0.0)
    total_price = Column(Float, default=0.0)
    
    order = relationship("Order", back_populates="items")
    product = relationship("Product")
