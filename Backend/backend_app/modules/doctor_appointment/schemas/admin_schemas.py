from pydantic import BaseModel
from typing import Optional

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    active: bool = True

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    active: Optional[bool] = None

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float = 0.0
    category_id: int

class ProductUpdate(BaseModel):
    reel_id: Optional[str] = None
    active: Optional[bool] = None

class VariantCreate(BaseModel):
    variant_name: str
    sku: Optional[str] = None
    price: Optional[float] = None
    stock_quantity: int = 0

class StockUpdate(BaseModel):
    stock_quantity: int
