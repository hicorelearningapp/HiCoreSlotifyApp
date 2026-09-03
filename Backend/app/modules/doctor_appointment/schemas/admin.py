from pydantic import BaseModel
from typing import List, Optional, Any
from .doctor import DoctorOut

class AdminDashboardOut(BaseModel):
    Total: int
    Pending: int
    Approved: int
    Rejected: int
    PendingRequest: List[DoctorOut] = []

    class Config:
        from_attributes = True

class AdminLogin(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None
    UserName: Optional[str] = None
    Password: Optional[str] = None

    def get_username(self) -> str:
        return (self.username or self.UserName or "").strip()

    def get_password(self) -> str:
        return (self.password or self.Password or "").strip()

class TokenOut(BaseModel):
    status: str = "success"
    access_token: str
    token_type: str = "bearer"
