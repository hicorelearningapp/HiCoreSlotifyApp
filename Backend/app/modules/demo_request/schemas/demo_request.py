from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DemoRequestBase(BaseModel):
    BusinessName: str
    BusinessType: Optional[str] = None
    Locations: Optional[str] = None
    City: Optional[str] = None
    State: Optional[str] = None
    Country: Optional[str] = None
    FullName: str
    Designation: Optional[str] = None
    WorkEmail: str
    MobileNumber: str
    WhatsappNumber: Optional[str] = None
    PreferredDate: Optional[str] = None
    PreferredTime: Optional[str] = None
    PreferredDemoMode: Optional[str] = None
    DemoRequirements: Optional[str] = None
    AgreeToContact: bool = True
    SelectedIndustry: Optional[str] = None


class DemoRequestCreate(DemoRequestBase):
    pass


class DemoRequestStatusUpdate(BaseModel):
    Status: str


class DemoRequestUpdate(BaseModel):
    BusinessName: Optional[str] = None
    BusinessType: Optional[str] = None
    Locations: Optional[str] = None
    City: Optional[str] = None
    State: Optional[str] = None
    Country: Optional[str] = None
    FullName: Optional[str] = None
    Designation: Optional[str] = None
    WorkEmail: Optional[str] = None
    MobileNumber: Optional[str] = None
    WhatsappNumber: Optional[str] = None
    PreferredDate: Optional[str] = None
    PreferredTime: Optional[str] = None
    PreferredDemoMode: Optional[str] = None
    DemoRequirements: Optional[str] = None
    AgreeToContact: Optional[bool] = None
    SelectedIndustry: Optional[str] = None
    Status: Optional[str] = None


class DemoRequestOut(DemoRequestBase):
    DemoId: str
    Status: str
    CreatedAt: datetime

    class Config:
        from_attributes = True
