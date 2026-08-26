from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class InventoryBase(BaseModel):
    product_id: int
    stock_quantity: int = 0
    reserved_quantity: int = 0
    low_stock_threshold: int = 5
    location: Optional[str] = "Default Warehouse"
    store_id: Optional[str] = "default"

class InventoryUpdate(BaseModel):
    stock_quantity: Optional[int] = None
    reserved_quantity: Optional[int] = None
    low_stock_threshold: Optional[int] = None

class InventoryOut(InventoryBase):
    id: int
    last_updated: datetime

    class Config:
        from_attributes = True
