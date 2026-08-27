from pydantic import BaseModel
from typing import Optional
from sqlalchemy import Mapped

class ConsultationTypeBase(BaseModel):
    Name: str
    Description: Optional[str] = None
    IsActive: bool = True

class ConsultationTypeCreate(ConsultationTypeBase):
    pass

class ConsultationTypeUpdate(BaseModel):
    Name: Optional[str] = None
    Description: Optional[str] = None
    IsActive: Optional[bool] = None

class ConsultationTypeOut(ConsultationTypeBase):
    Id: str

    class Config:
        from_attributes = True
