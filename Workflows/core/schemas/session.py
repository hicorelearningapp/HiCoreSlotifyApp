from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any

class SessionBase(BaseModel):
    PhoneNumber: str
    StateData: Optional[Any] = None

class SessionCreate(SessionBase):
    pass

class SessionUpdate(BaseModel):
    PhoneNumber: Optional[str] = None
    StateData: Optional[Any] = None

class SessionOut(SessionBase):
    Id: str
    CreatedAt: datetime
    UpdatedAt: datetime

    class Config:
        from_attributes = True
