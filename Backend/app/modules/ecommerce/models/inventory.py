import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Inventory(Base):
    __tablename__ = "inventory"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    stock_quantity = Column(Integer, default=0)
    reserved_quantity = Column(Integer, default=0)
    low_stock_threshold = Column(Integer, default=5)
    location = Column(String, default="Default Warehouse")
    store_id = Column(String, index=True, default="default")
    last_updated = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    product = relationship("Product", back_populates="inventory_items")
