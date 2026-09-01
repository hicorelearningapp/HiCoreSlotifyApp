from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy import String, Float, Boolean, JSON, DateTime, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.core.database import Base
from app.core.security import generate_uuid

class Product(Base):
    __tablename__ = "products"

    Id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid, index=True)
    SellerId: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    ProductName: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    Category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    Price: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    CompareAtPrice: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    Sku: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    Description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    Images: Mapped[Optional[list]] = mapped_column(JSON, default=list)
    ReelLink: Mapped[Optional[str]] = mapped_column(String(500), nullable=True, index=True)
    Active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Dynamic JSON data payload for all other seller/product attributes
    ProductData: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)

    CreatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    UpdatedAt: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    InventoryItems = relationship("Inventory", back_populates="Product", cascade="all, delete-orphan")
