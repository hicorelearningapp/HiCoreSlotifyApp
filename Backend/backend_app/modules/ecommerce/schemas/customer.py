from pydantic import BaseModel
from typing import Optional
from datetime import date

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

    class Config:
        from_attributes = True
