import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from sqlalchemy.orm import mapped_column, Mapped
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from app.modules.ecommerce.models.customer import EcommerceCustomer
    from app.modules.ecommerce.models.product import Product

class Order(Base):
    __tablename__ = "orders"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_number: Mapped[str] = mapped_column(String(50), index=True, nullable=True)
    customer_id: Mapped[str] = mapped_column(String(36), ForeignKey("ecommerce_customers.CustomerId"), nullable=True)
    customer_name: Mapped[str] = mapped_column(String(150), nullable=True)
    customer_phone: Mapped[str] = mapped_column(String(50), nullable=True)
    customer_email: Mapped[str] = mapped_column(String(150), nullable=True)
    shipping_address: Mapped[str] = mapped_column(String(300), nullable=True)
    city: Mapped[str] = mapped_column(String(100), nullable=True)
    state: Mapped[str] = mapped_column(String(100), nullable=True)
    pincode: Mapped[str] = mapped_column(String(20), nullable=True)
    status: Mapped[str] = mapped_column(String, default="Pending")
    payment_status: Mapped[str] = mapped_column(String, default="Unpaid")
    payment_method: Mapped[str] = mapped_column(String, nullable=True)
    subtotal: Mapped[float] = mapped_column(Float, default=0.0)
    shipping_fee: Mapped[float] = mapped_column(Float, default=0.0)
    discount: Mapped[float] = mapped_column(Float, default=0.0)
    total: Mapped[float] = mapped_column(Float, default=0.0)
    delivery_slot: Mapped[str] = mapped_column(String, nullable=True)
    source_channel: Mapped[str] = mapped_column(String, default="web")
    notes: Mapped[str] = mapped_column(String, nullable=True)
    store_id: Mapped[str] = mapped_column(String, index=True, default="default")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    customer: Mapped["EcommerceCustomer"] = relationship("EcommerceCustomer")
    items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    order_id: Mapped[int] = mapped_column(Integer, ForeignKey("orders.id"))
    product_id: Mapped[int] = mapped_column(Integer, ForeignKey("products.id"), nullable=True)
    product_name: Mapped[str] = mapped_column(String(200), nullable=True)
    sku: Mapped[str] = mapped_column(String(100), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price: Mapped[float] = mapped_column(Float, default=0.0)
    total_price: Mapped[float] = mapped_column(Float, default=0.0)
    
    order: Mapped["Order"] = relationship("Order", back_populates="items")
    product: Mapped["Product"] = relationship("Product")
