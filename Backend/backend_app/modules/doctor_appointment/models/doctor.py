from datetime import datetime
from sqlalchemy import Column, Integer, String, Date as SqlDate, Boolean, Float, Text, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column
from backend_app.core.database import Base
from backend_app.core.security import generate_uuid

class Doctor(Base):
    __tablename__ = "doctors"

    Id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid, index=True)
    FullName: Mapped[str] = mapped_column(String(150), nullable=False)
    Qualification: Mapped[str] = mapped_column(String(200), nullable=False)
    Specialization: Mapped[str] = mapped_column(String(100), nullable=False)
    MedicalRegistrationNumber: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    YearsOfExperience: Mapped[int] = mapped_column(Integer, nullable=False)
    DateOfBirth: Mapped[date] = mapped_column(SqlDate, nullable=False)
    Gender: Mapped[str] = mapped_column(String(20), nullable=False)
    ProfilePhoto: Mapped[str] = mapped_column(Text, nullable=True)
    MobileNumber: Mapped[str] = mapped_column(String(20), nullable=False)
    WhatsAppNumber: Mapped[str] = mapped_column(String(20), nullable=True)
    BusinessPhoneNumber: Mapped[str] = mapped_column(String(20), nullable=True)
    EmailAddress: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    ClinicName: Mapped[str] = mapped_column(String(200), nullable=False)
    ClinicAddress: Mapped[str] = mapped_column(Text, nullable=False)
    City: Mapped[str] = mapped_column(String(100), nullable=False)
    State: Mapped[str] = mapped_column(String(100), nullable=False)
    Pincode: Mapped[str] = mapped_column(String(10), nullable=False)
    Country: Mapped[str] = mapped_column(String(100), nullable=False)
    ClinicConsultationFee: Mapped[float] = mapped_column(Float, nullable=False)
    VideoConsultationFee: Mapped[float] = mapped_column(Float, nullable=True)
    SecondOpinionFee: Mapped[float] = mapped_column(Float, nullable=True)
    ConsultationDuration: Mapped[int] = mapped_column(Integer, nullable=False)
    MaximumPatientsPerDay: Mapped[int] = mapped_column(Integer, nullable=False)
    
    Monday: Mapped[str] = mapped_column(String(255), nullable=True)
    Tuesday: Mapped[str] = mapped_column(String(255), nullable=True)
    Wednesday: Mapped[str] = mapped_column(String(255), nullable=True)
    Thursday: Mapped[str] = mapped_column(String(255), nullable=True)
    Friday: Mapped[str] = mapped_column(String(255), nullable=True)
    Saturday: Mapped[str] = mapped_column(String(255), nullable=True)
    Sunday: Mapped[str] = mapped_column(String(255), nullable=True)
    
    UpiId: Mapped[str] = mapped_column(String(100), nullable=True)
    AccountHolderName: Mapped[str] = mapped_column(String(150), nullable=True)
    BankName: Mapped[str] = mapped_column(String(150), nullable=True)
    IfscCode: Mapped[str] = mapped_column(String(20), nullable=True)
    AccountNumber: Mapped[str] = mapped_column(String(30), nullable=True)
    
    Status: Mapped[str] = mapped_column(String(20), default='Pending')
    WhatsAppBusinessStatus: Mapped[str] = mapped_column(String(50), default='Disconnected')
    IsVerified: Mapped[bool] = mapped_column(Boolean, default=False)
    CreatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    UpdatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    Password: Mapped[str] = mapped_column(String, nullable=False)
    UserName: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    appointments = relationship("Appointment", back_populates="doctor", cascade="all, delete")
    prescriptions = relationship("Prescription", back_populates="doctor", cascade="all, delete")
