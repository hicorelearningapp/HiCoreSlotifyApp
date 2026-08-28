from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float

class OrderCreate(BaseModel):
    customer_phone: str
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    shipping_address: str
    city: str
    state: str
    pincode: str
    payment_method: Optional[str] = "COD"
    items: List[OrderItemCreate]
    notes: Optional[str] = None
    store_id: Optional[str] = "default"

class OrderStatusUpdate(BaseModel):
    status: str
    payment_status: Optional[str] = None

class OrderOut(BaseModel):
    id: int
    order_number: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    shipping_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    status: str
    payment_status: str
    payment_method: Optional[str] = None
    subtotal: float
    shipping_fee: float
    discount: float
    total: float
    store_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
