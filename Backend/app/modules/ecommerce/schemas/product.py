from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ProductBase(BaseModel):
    name: str
    category: Optional[str] = None
    product_type: Optional[str] = None
    price: float = 0.0
    compare_at_price: Optional[float] = None
    sku: Optional[str] = None
    stock_quantity: int = 0
    unit: Optional[str] = "Pieces"
    description: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = []
    reel_id: Optional[str] = None
    active: bool = True
    store_id: Optional[str] = "default"
    product_data: Optional[Dict[str, Any]] = {}

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    product_type: Optional[str] = None
    price: Optional[float] = None
    compare_at_price: Optional[float] = None
    sku: Optional[str] = None
    stock_quantity: Optional[int] = None
    unit: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    reel_id: Optional[str] = None
    active: Optional[bool] = None
    store_id: Optional[str] = None
    product_data: Optional[Dict[str, Any]] = None

class ProductOut(ProductBase):
    id: int

    class Config:
        from_attributes = True
