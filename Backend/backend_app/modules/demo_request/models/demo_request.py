from sqlalchemy import Column, String, Text, Boolean, DateTime
from datetime import datetime
from backend_app.core.database import Base
from backend_app.core.security import generate_uuid

class DemoRequest(Base):
    __tablename__ = "demo_requests"

    DemoId = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    BusinessName = Column(String(150), nullable=False)
    BusinessType = Column(String(100), nullable=True)
    Locations = Column(String(50), nullable=True)
    City = Column(String(100), nullable=True)
    State = Column(String(100), nullable=True)
    Country = Column(String(100), nullable=True)
    FullName = Column(String(150), nullable=False)
    Designation = Column(String(100), nullable=True)
    WorkEmail = Column(String(150), nullable=False)
    MobileNumber = Column(String(20), nullable=False)
    WhatsappNumber = Column(String(20), nullable=True)
    PreferredDate = Column(String(50), nullable=True)
    PreferredTime = Column(String(50), nullable=True)
    PreferredDemoMode = Column(String(100), nullable=True)
    DemoRequirements = Column(Text, nullable=True)
    AgreeToContact = Column(Boolean, default=True, nullable=False)
    SelectedIndustry = Column(String(100), nullable=True)
    Status = Column(String(50), default="Pending", nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow, nullable=False)
