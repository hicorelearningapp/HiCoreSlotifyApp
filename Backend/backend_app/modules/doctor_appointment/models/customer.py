from datetime import date
from sqlalchemy import Column, String, Date as SqlDate
from sqlalchemy.orm import relationship
from backend_app.core.database import Base
from backend_app.core.security import generate_uuid
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

class Customer(Base):
    __tablename__ = "customers"

    PatientId : Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid, index=True)
    CustomerId : Mapped[str] = mapped_column(String(36), index=True, nullable=False)
    CustomerName : Mapped[str] = mapped_column(String(150), nullable=False)
    PatientName : Mapped[str] = mapped_column(String(150), nullable=False)
    PhoneNumber : Mapped[str] = mapped_column(String(20), index=True, nullable=False)
    EmailAddress : Mapped[str] = mapped_column(String(150), nullable=True)
    DateOfBirth : Mapped[date] = mapped_column(SqlDate, nullable=True)
    BloodGroup : Mapped[str] = mapped_column(String(20), nullable=True)
    Gender : Mapped[str] = mapped_column(String(20), nullable=True)
    Address : Mapped[str] = mapped_column(String(255), nullable=True)
    Language : Mapped[str] = mapped_column(String(5), default="en")

    appointments = relationship("Appointment", back_populates="patient", cascade="all, delete")
    prescriptions = relationship("Prescription", back_populates="patient", cascade="all, delete")

    @property
    def Name(self) -> str:
        return self.PatientName or self.CustomerName
    