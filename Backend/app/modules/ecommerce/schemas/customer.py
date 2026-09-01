from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class EcommerceCustomerBase(BaseModel):
    PhoneNumber: str
    ProfileName: Optional[str] = None
    Email: Optional[str] = None
    Gender: Optional[str] = None
    DOB: Optional[date] = None
    Address: Optional[str] = None
    City: Optional[str] = None
    State: Optional[str] = None
    Pincode: Optional[str] = None

class EcommerceCustomerCreate(EcommerceCustomerBase):
    pass

class EcommerceCustomerUpdate(BaseModel):
    ProfileName: Optional[str] = None
    Email: Optional[str] = None
    Gender: Optional[str] = None
    DOB: Optional[date] = None
    Address: Optional[str] = None
    City: Optional[str] = None
    State: Optional[str] = None
    Pincode: Optional[str] = None

class EcommerceCustomerOut(EcommerceCustomerBase):
    CustomerId: str
    ProfileId: str
    CreatedAt: Optional[datetime] = None
    UpdatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True
