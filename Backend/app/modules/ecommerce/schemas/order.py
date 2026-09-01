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
    Status: str = Field(..., description="Order status (e.g. New, Processing, Shipped, Delivered, Cancelled)")

class OrderPaymentStatusUpdate(BaseModel):
    PaymentStatus: str = Field(..., description="Payment status (e.g. Unpaid, Paid, Pending, Refunded, Failed)")


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

class OrderListResponse(BaseModel):
    AllOrders: int = Field(0, description="Total count of all orders")
    New: int = Field(0, description="Count of New / Pending orders")
    Processing: int = Field(0, description="Count of Processing / Confirmed orders")
    Shipped: int = Field(0, description="Count of Shipped / In-Transit orders")
    Delivered: int = Field(0, description="Count of Delivered orders")
    Cancelled: int = Field(0, description="Count of Cancelled orders")
    Orders: List[OrderOut] = Field(default=[], description="List of order items")

    class Config:
        from_attributes = True

