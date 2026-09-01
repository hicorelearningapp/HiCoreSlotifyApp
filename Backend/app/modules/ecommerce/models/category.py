from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from app.core.security import generate_uuid

class Category(Base):
    __tablename__ = "categories"

    Id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid, index=True)
    CategoryName: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    Description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    CreatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    UpdatedAt: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
