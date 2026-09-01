from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime

class OrderItemCreate(BaseModel):
    ProductId: str
    Quantity: int = 1
    UnitPrice: float = 0.0
    ProductName: Optional[str] = None
    Sku: Optional[str] = None
    ItemData: Optional[Dict[str, Any]] = None

class OrderItemOut(BaseModel):
    Id: str
    OrderId: str
    ProductId: Optional[str] = None
    ProductName: Optional[str] = None
    Sku: Optional[str] = None
    Quantity: int
    UnitPrice: float
    TotalPrice: float
    ItemData: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    CustomerPhone: str
    CustomerName: Optional[str] = None
    CustomerEmail: Optional[str] = None
    ShippingAddress: str
    City: str
    State: str
    Pincode: str
    PaymentMethod: Optional[str] = "COD"
    SellerId: Optional[str] = None
    Items: List[OrderItemCreate]
    Notes: Optional[str] = None
    OrderData: Optional[Dict[str, Any]] = None

class OrderStatusUpdate(BaseModel):
    Status: str
    PaymentStatus: Optional[str] = None

class OrderOut(BaseModel):
    Id: str
    OrderNumber: Optional[str] = None
    SellerId: Optional[str] = None
    CustomerName: Optional[str] = None
    CustomerPhone: Optional[str] = None
    CustomerEmail: Optional[str] = None
    ShippingAddress: Optional[str] = None
    City: Optional[str] = None
    State: Optional[str] = None
    Pincode: Optional[str] = None
    Status: str
    PaymentStatus: str
    PaymentMethod: Optional[str] = None
    Subtotal: float
    ShippingFee: float
    Discount: float
    Total: float
    DeliverySlot: Optional[str] = None
    SourceChannel: str
    Notes: Optional[str] = None
    OrderData: Optional[Dict[str, Any]] = None
    CreatedAt: datetime
    UpdatedAt: Optional[datetime] = None
    Items: Optional[List[OrderItemOut]] = []

    class Config:
        from_attributes = True
