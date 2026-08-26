from sqlalchemy import Column, String, Text
from backend_app.core.database import Base
from core.models.utils import generate_uuid

class BusinessConfig(Base):
    __tablename__ = "business_configurations"

    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    BusinessPhoneNumber = Column(String(20), unique=True, nullable=False, index=True)
    ConfigJson = Column(Text, nullable=False)
