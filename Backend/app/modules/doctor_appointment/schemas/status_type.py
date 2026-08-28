from pydantic import BaseModel
from typing import Optional

class StatusTypeBase(BaseModel):
    Name: str
    Description: Optional[str] = None
    IsActive: bool = True

class StatusTypeCreate(StatusTypeBase):
    pass

class StatusTypeUpdate(BaseModel):
    Name: Optional[str] = None
    Description: Optional[str] = None
    IsActive: Optional[bool] = None

class StatusTypeOut(StatusTypeBase):
    Id: str

    class Config:
        from_attributes = True
