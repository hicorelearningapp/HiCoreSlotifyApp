from sqlalchemy import Column, String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from backend_app.core.database import Base
from backend_app.core.security import generate_uuid

class ConsultationType(Base):
    __tablename__ = "consultation_types"

    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    Name = Column(String(50), unique=True, nullable=False, index=True)
    Description = Column(String(255), nullable=True)
    IsActive = Column(Boolean, default=True, nullable=False)
