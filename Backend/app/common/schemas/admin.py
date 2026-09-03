from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from app.common.schemas.business import BusinessOut

class AdminLogin(BaseModel):
    UserName: str = Field(..., description="Admin username")
    Password: str = Field(..., description="Admin password")

class AdminTokenOut(BaseModel):
    status: str = "success"
    access_token: str
    token_type: str = "bearer"

class AdminDashboardOut(BaseModel):
    Total: int
    Pending: int
    Approved: int
    Rejected: int
    ByIndustry: Dict[str, int] = {}
    PendingRequests: List[BusinessOut] = []

    class Config:
        from_attributes = True

class AdminBusinessListOut(BaseModel):
    Total: int
    Approved: int
    Pending: int
    Rejected: int
    Businesses: List[BusinessOut] = []

    class Config:
        from_attributes = True
