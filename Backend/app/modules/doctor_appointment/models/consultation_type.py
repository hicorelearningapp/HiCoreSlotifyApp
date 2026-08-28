from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional
from app.core.database import Base
from app.core.security import generate_uuid

class ConsultationType(Base):
    __tablename__ = "consultation_types"

    Id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid, index=True)
    Name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    Description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    IsActive: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
