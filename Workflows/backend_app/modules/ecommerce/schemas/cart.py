from pydantic import BaseModel
from typing import Optional, List

class CartItemCreate(BaseModel):
    product_id: int
    variant_id: Optional[int] = None
    quantity: int = 1

class CartItemUpdate(BaseModel):
    quantity: int

class CartItemOut(BaseModel):
    id: int
    product_id: int
    variant_id: Optional[int] = None
    quantity: int
    unit_price: float

    class Config:
        from_attributes = True

class CartOut(BaseModel):
    id: str
    customer_phone: str
    store_id: str
    items: List[CartItemOut] = []
    total_amount: float = 0.0
