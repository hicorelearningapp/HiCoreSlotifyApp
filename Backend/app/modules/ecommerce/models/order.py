from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.core.security import generate_uuid
from sqlalchemy.orm import mapped_column, Mapped
from typing import TYPE_CHECKING, List, Optional

if TYPE_CHECKING:
    from app.modules.ecommerce.models.customer import EcommerceCustomer
    from app.modules.ecommerce.models.product import Product

class Order(Base):
    __tablename__ = "orders"
    
    Id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid, index=True)
    OrderNumber: Mapped[Optional[str]] = mapped_column(String(50), index=True, nullable=True)
    SellerId: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    CustomerId: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("ecommerce_customers.CustomerId"), nullable=True)
    CustomerName: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    CustomerPhone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    CustomerEmail: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    ShippingAddress: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    City: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    State: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    Pincode: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    Status: Mapped[str] = mapped_column(String(50), default="Pending")
    PaymentStatus: Mapped[str] = mapped_column(String(50), default="Unpaid")
    PaymentMethod: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    Subtotal: Mapped[float] = mapped_column(Float, default=0.0)
    ShippingFee: Mapped[float] = mapped_column(Float, default=0.0)
    Discount: Mapped[float] = mapped_column(Float, default=0.0)
    Total: Mapped[float] = mapped_column(Float, default=0.0)
    DeliverySlot: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    SourceChannel: Mapped[str] = mapped_column(String(50), default="web")
    Notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    OrderData: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    
    CreatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    UpdatedAt: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    Customer: Mapped[Optional["EcommerceCustomer"]] = relationship("EcommerceCustomer")
    Items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="Order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    
    Id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid, index=True)
    OrderId: Mapped[str] = mapped_column(String(36), ForeignKey("orders.Id"))
    ProductId: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("products.Id"), nullable=True)
    ProductName: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    Sku: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    Quantity: Mapped[int] = mapped_column(Integer, default=1)
    UnitPrice: Mapped[float] = mapped_column(Float, default=0.0)
    TotalPrice: Mapped[float] = mapped_column(Float, default=0.0)
    ItemData: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    
    Order: Mapped["Order"] = relationship("Order", back_populates="Items")
    Product: Mapped[Optional["Product"]] = relationship("Product")
