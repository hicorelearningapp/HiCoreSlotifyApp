from datetime import date
from sqlalchemy import Column, String, Date as SqlDate
from sqlalchemy.orm import relationship
from backend_app.core.database import Base
from backend_app.core.security import generate_uuid

class Customer(Base):
    __tablename__ = "customers"

    PatientId = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    CustomerId = Column(String(36), index=True, nullable=False)
    CustomerName = Column(String(150), nullable=False)
    PatientName = Column(String(150), nullable=False)
    PhoneNumber = Column(String(20), index=True, nullable=False)
    EmailAddress = Column(String(150), nullable=True)
    DateOfBirth = Column(SqlDate, nullable=True)
    BloodGroup = Column(String(20), nullable=True)
    Gender = Column(String(20), nullable=True)
    Address = Column(String(255), nullable=True)
    Language = Column(String(5), default="en")

    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete")
    prescriptions = relationship("Prescription", back_populates="patient", cascade="all, delete")
