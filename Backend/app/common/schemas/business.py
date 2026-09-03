from enum import Enum
from datetime import datetime
from typing import Optional, Dict, Any, Union
from pydantic import BaseModel, EmailStr, Field, field_validator

class IndustryTypeEnum(str, Enum):
    DoctorAppointment = "DoctorAppointment"
    Ecommerce = "Ecommerce"
    Salon = "Salon"
    Hospitality = "Hospitality"
    Fitness = "Fitness"
    Retail = "Retail"
    Other = "Other"

class BusinessStatusEnum(str, Enum):
    Pending = "Pending"
    Approved = "Approved"
    Rejected = "Rejected"
    Active = "Active"
    Suspended = "Suspended"

class BusinessBase(BaseModel):
    BusinessName: str = Field(..., max_length=200, description="Name of the business / entity")
    IndustryType: str = Field(..., max_length=100, description="Industry sector, e.g. DoctorAppointment, Ecommerce, Salon, Hospitality, etc.")
    FullName: str = Field(..., max_length=150, description="Name of the business owner / representative")
    EmailAddress: str = Field(..., max_length=150, description="Primary email address")
    MobileNumber: str = Field(..., max_length=20, description="Primary mobile phone number")
    BusinessPhoneNumber: Optional[str] = Field(None, max_length=20, description="WhatsApp or secondary business phone number")
    ProfilePic: Optional[str] = Field(None, description="Profile picture URL, base64, or image path")
    Address: Optional[str] = Field(None, description="Full street address")
    City: Optional[str] = Field(None, max_length=100)
    State: Optional[str] = Field(None, max_length=100)
    Pincode: Optional[str] = Field(None, max_length=20)
    Country: Optional[str] = Field("India", max_length=100)
    UserName: str = Field(..., max_length=100, description="Unique username for business account login")

class BusinessRegisterCreate(BusinessBase):
    Password: str = Field(..., min_length=6, description="Account login password")
    # Dynamic JSON data payload customized for the specific business / industry
    BusinessData: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Industry or business-specific details and configs")

class BusinessLogin(BaseModel):
    UserName: str = Field(..., description="Username for login")
    IndustryType: str = Field(..., description="Industry sector")
    Password: str = Field(..., description="Account password")

class BusinessUpdate(BaseModel):
    BusinessName: Optional[str] = Field(None, max_length=200)
    FullName: Optional[str] = Field(None, max_length=150)
    MobileNumber: Optional[str] = Field(None, max_length=20)
    BusinessPhoneNumber: Optional[str] = Field(None, max_length=20)
    ProfilePic: Optional[str] = None
    Address: Optional[str] = None
    City: Optional[str] = None
    State: Optional[str] = None
    Pincode: Optional[str] = None
    Country: Optional[str] = None
    Password: Optional[str] = None
    Status: Optional[BusinessStatusEnum] = None
    IsVerified: Optional[bool] = None
    BusinessData: Optional[Dict[str, Any]] = None

    @field_validator("Status", mode="before")
    @classmethod
    def normalize_status(cls, v: Any) -> Any:
        if isinstance(v, str):
            for member in BusinessStatusEnum:
                if member.value.lower() == v.strip().lower():
                    return member
        return v

class BusinessOut(BusinessBase):
    Id: str
    Status: Union[BusinessStatusEnum, str]
    IsVerified: bool
    BusinessData: Optional[Dict[str, Any]] = None
    CreatedAt: datetime
    UpdatedAt: datetime

    class Config:
        from_attributes = True

class BusinessLoginResponse(BaseModel):
    status: str = "success"
    access_token: str
    token_type: str = "bearer"
    business: BusinessOut
