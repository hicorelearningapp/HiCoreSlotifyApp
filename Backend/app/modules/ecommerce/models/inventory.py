from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.core.database import Base
from app.core.security import generate_uuid

class Inventory(Base):
    __tablename__ = "inventory"
    
    Id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid, index=True)
    ProductId: Mapped[str] = mapped_column(String(36), ForeignKey("products.Id", ondelete="CASCADE"), nullable=False, index=True)
    StockQuantity: Mapped[int] = mapped_column(Integer, default=0)
    ReservedQuantity: Mapped[int] = mapped_column(Integer, default=0)
    LowStockThreshold: Mapped[int] = mapped_column(Integer, default=5)
    Location: Mapped[str] = mapped_column(String(150), default="Default Warehouse")
    LastUpdated: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    Product = relationship("Product", back_populates="InventoryItems")
