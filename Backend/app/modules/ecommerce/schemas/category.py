from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CategoryBase(BaseModel):
    CategoryName: str = Field(..., description="Category display name")
    Description: Optional[str] = Field(None, description="Category description")

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    CategoryName: Optional[str] = None
    Description: Optional[str] = None

class CategoryOut(CategoryBase):
    Id: str
    CreatedAt: Optional[datetime] = None
    UpdatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True
