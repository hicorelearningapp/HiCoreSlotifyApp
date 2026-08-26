from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class PaymentStatusEnum(str, Enum):
    PENDING = "Pending"
    PAID = "Paid"
    FAILED = "Failed"
    REFUNDED = "Refunded"

class PaymentBase(BaseModel):
    AppointmentId: str
    CustomerId: str
    DoctorId: str
    Payment: float
    Status: PaymentStatusEnum = PaymentStatusEnum.PENDING

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    AppointmentId: Optional[str] = None
    CustomerId: Optional[str] = None
    DoctorId: Optional[str] = None
    Payment: Optional[float] = None
    Status: Optional[PaymentStatusEnum] = None

class PaymentOut(PaymentBase):
    Id: str
    DateTime: datetime

    class Config:
        from_attributes = True

class PaymentStatusUpdate(BaseModel):
    Status: PaymentStatusEnum
