from sqlalchemy import Column, String, Boolean
from app.core.database import Base
from app.core.security import generate_uuid

class StatusType(Base):
    __tablename__ = "status_types"

    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    Name = Column(String(50), unique=True, nullable=False, index=True)
    Description = Column(String(255), nullable=True)
    IsActive = Column(Boolean, default=True, nullable=False)
