from datetime import datetime
from sqlalchemy import Column, String, Boolean, Text, DateTime, JSON
from app.core.database import Base
from app.core.security import generate_uuid

class Business(Base):
    __tablename__ = "businesses"

    # Common Primary & Profile Columns
    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    BusinessName = Column(String(200), nullable=False)
    IndustryType = Column(String(100), nullable=False, index=True)  # e.g., 'doctor_appointment', 'ecommerce', 'hospitality', 'fitness', 'salon', etc.
    OwnerName = Column(String(150), nullable=False)
    EmailAddress = Column(String(150), unique=True, nullable=False, index=True)
    MobileNumber = Column(String(20), nullable=False, index=True)
    BusinessPhoneNumber = Column(String(20), nullable=True)
    
    # Common Address Information
    Address = Column(Text, nullable=True)
    City = Column(String(100), nullable=True)
    State = Column(String(100), nullable=True)
    Pincode = Column(String(20), nullable=True)
    Country = Column(String(100), nullable=True, default="India")

    # Common Authentication & Account Status
    UserName = Column(String(100), unique=True, nullable=False, index=True)
    Password = Column(String(255), nullable=False)
    Status = Column(String(50), default="Pending")  # 'Pending', 'Approved', 'Active', 'Suspended'
    IsVerified = Column(Boolean, default=False)

    # Dynamic JSON Column for storing industry-specific business data
    # (e.g. clinic fees/timings for healthcare, store policies/catalogs for ecom, salon menu, etc.)
    IndustryData = Column(JSON, nullable=True, default=dict)

    # Common Timestamps
    CreatedAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    UpdatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
