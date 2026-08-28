from pydantic import BaseModel
from typing import List, Optional
from .doctor import DoctorOut

class AdminDashboardOut(BaseModel):
    Total: int
    Pending: int
    Approved: int
    Rejected: int
    PendingRequest: List[DoctorOut]

    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    username: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
