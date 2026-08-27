from datetime import date
from sqlalchemy import Column, String, Date as SqlDate
from sqlalchemy.orm import relationship
from backend_app.core.database import Base
from backend_app.core.security import generate_uuid
from sqlalchemy import Mapped, mapped_column

class Customer(Base):
    __tablename__ = "customers"

    PatientId = mapped_column(String(36), primary_key=True, default=generate_uuid, index=True)
    CustomerId = mapped_column(String(36), index=True, nullable=False)
    CustomerName = mapped_column(String(150), nullable=False)
    PatientName = mapped_column(String(150), nullable=False)
    PhoneNumber = mapped_column(String(20), index=True, nullable=False)
    EmailAddress = mapped_column(String(150), nullable=True)
    DateOfBirth = mapped_column(SqlDate, nullable=True)
    BloodGroup = mapped_column(String(20), nullable=True)
    Gender = mapped_column(String(20), nullable=True)
    Address = mapped_column(String(255), nullable=True)
    Language = mapped_column(String(5), default="en")

    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete")
    prescriptions = relationship("Prescription", back_populates="patient", cascade="all, delete")
