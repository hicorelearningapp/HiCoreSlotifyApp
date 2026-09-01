from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from app.core.security import generate_uuid

class Address(Base):
    __tablename__ = "addresses"

    Id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid, index=True)
    CustomerPhone: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    Name: Mapped[str] = mapped_column(String(150), nullable=False)
    AddressLine: Mapped[str] = mapped_column(Text, nullable=False)
    City: Mapped[str] = mapped_column(String(100), nullable=False)
    State: Mapped[str] = mapped_column(String(100), nullable=False)
    Pincode: Mapped[str] = mapped_column(String(20), nullable=False)
    IsDefault: Mapped[bool] = mapped_column(Boolean, default=False)
    CreatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    UpdatedAt: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
