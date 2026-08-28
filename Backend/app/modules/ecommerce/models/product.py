from sqlalchemy import Column, String, Integer, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String, index=True, nullable=True)
    product_type = Column(String, nullable=True)
    price = Column(Float, default=0.0)
    compare_at_price = Column(Float, nullable=True)
    sku = Column(String, index=True, nullable=True)
    stock_quantity = Column(Integer, default=0)
    unit = Column(String, default="Pieces")
    description = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    images = Column(JSON, default=list)
    reel_id = Column(String, index=True, nullable=True)
    active = Column(Boolean, default=True)
    store_id = Column(String, index=True, default="default")
    product_data = Column(JSON, default=dict)

    inventory_items = relationship("Inventory", back_populates="product", cascade="all, delete-orphan")
