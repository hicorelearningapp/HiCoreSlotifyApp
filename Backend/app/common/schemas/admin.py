from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.common.schemas.business import BusinessOut

class AdminLogin(BaseModel):
    UserName: str = Field(..., description="Admin username")
    Password: str = Field(..., description="Admin password")

class AdminTokenOut(BaseModel):
    status: str = "success"
    access_token: str
    token_type: str = "bearer"

class AdminDashboardOut(BaseModel):
    TotalBusinesses: int
    PendingApprovals: int
    ApprovedBusinesses: int
    RejectedBusinesses: int
    ByIndustry: Dict[str, int] = {}
    PendingRequests: List[BusinessOut] = []

    # Backward compatibility fields
    Total: Optional[int] = None
    Pending: Optional[int] = None
    Approved: Optional[int] = None
    Rejected: Optional[int] = None
    PendingRequest: Optional[List[BusinessOut]] = None

    class Config:
        from_attributes = True
