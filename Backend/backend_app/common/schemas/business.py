from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

class BusinessBase(BaseModel):
    BusinessName: str = Field(..., max_length=200, description="Name of the business / entity")
    IndustryType: str = Field(..., max_length=100, description="Industry sector, e.g. doctor_appointment, ecommerce, salon, hospitality, etc.")
    OwnerName: str = Field(..., max_length=150, description="Name of the business owner / representative")
    EmailAddress: str = Field(..., max_length=150, description="Primary email address")
    MobileNumber: str = Field(..., max_length=20, description="Primary mobile phone number")
    BusinessPhoneNumber: Optional[str] = Field(None, max_length=20, description="WhatsApp or secondary business phone number")
    Address: Optional[str] = Field(None, description="Full street address")
    City: Optional[str] = Field(None, max_length=100)
    State: Optional[str] = Field(None, max_length=100)
    Pincode: Optional[str] = Field(None, max_length=20)
    Country: Optional[str] = Field("India", max_length=100)
    UserName: str = Field(..., max_length=100, description="Unique username for business account login")

class BusinessRegisterCreate(BusinessBase):
    Password: str = Field(..., min_length=6, description="Account login password")
    # Dynamic JSON data payload customized for the specific industry
    IndustryData: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Industry-specific details and configs")

class BusinessLogin(BaseModel):
    UserName: Optional[str] = Field(None, description="Username for login")
    EmailAddress: Optional[str] = Field(None, description="Or email address for login")
    Password: str = Field(..., description="Account password")

class BusinessUpdate(BaseModel):
    BusinessName: Optional[str] = Field(None, max_length=200)
    OwnerName: Optional[str] = Field(None, max_length=150)
    MobileNumber: Optional[str] = Field(None, max_length=20)
    BusinessPhoneNumber: Optional[str] = Field(None, max_length=20)
    Address: Optional[str] = None
    City: Optional[str] = None
    State: Optional[str] = None
    Pincode: Optional[str] = None
    Country: Optional[str] = None
    Password: Optional[str] = None
    Status: Optional[str] = None
    IsVerified: Optional[bool] = None
    IndustryData: Optional[Dict[str, Any]] = None

class BusinessOut(BusinessBase):
    Id: str
    Status: str
    IsVerified: bool
    IndustryData: Optional[Dict[str, Any]] = None
    CreatedAt: datetime
    UpdatedAt: datetime

    class Config:
        from_attributes = True

class BusinessLoginResponse(BaseModel):
    status: str = "success"
    access_token: str
    token_type: str = "bearer"
    business: BusinessOut
