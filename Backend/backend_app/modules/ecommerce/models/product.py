from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, ForeignKey
from sqlalchemy.orm import relationship
from backend_app.core.database import Base

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

    variants = relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan")
    inventory_items = relationship("Inventory", back_populates="product", cascade="all, delete-orphan")

class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    variant_name = Column(String(150), nullable=False)
    sku = Column(String(100), nullable=True)
    price = Column(Float, default=0.0)
    compare_at_price = Column(Float, nullable=True)
    stock_quantity = Column(Integer, default=0)
    variant_data = Column(JSON, default=dict)

    product = relationship("Product", back_populates="variants")
