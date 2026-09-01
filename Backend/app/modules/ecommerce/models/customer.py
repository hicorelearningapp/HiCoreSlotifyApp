from sqlalchemy import Column, String, Date as SqlDate, DateTime
from app.core.database import Base
from app.core.security import generate_uuid
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional
from datetime import datetime

class EcommerceCustomer(Base):
    __tablename__ = "ecommerce_customers"

    CustomerId: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid, index=True)
    ProfileId: Mapped[str] = mapped_column(String(36), default=generate_uuid, unique=True, index=True)
    ProfileName: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    PhoneNumber: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    Email: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    Gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    DOB: Mapped[Optional[datetime]] = mapped_column(SqlDate, nullable=True)
    Address: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    City: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    State: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    Pincode: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    CreatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    UpdatedAt: Mapped[Optional[datetime]] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
