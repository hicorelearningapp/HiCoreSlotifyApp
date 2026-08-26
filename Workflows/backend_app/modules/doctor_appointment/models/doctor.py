from datetime import datetime
from sqlalchemy import Column, Integer, String, Date as SqlDate, Boolean, Float, Text, DateTime
from sqlalchemy.orm import relationship
from backend_app.core.database import Base
from backend_app.core.security import generate_uuid

class Doctor(Base):
    __tablename__ = "doctors"

    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    FullName = Column(String(150), nullable=False)
    Qualification = Column(String(200), nullable=False)
    Specialization = Column(String(100), nullable=False)
    MedicalRegistrationNumber = Column(String(50), unique=True, nullable=False)
    YearsOfExperience = Column(Integer, nullable=False)
    DateOfBirth = Column(SqlDate, nullable=False)
    Gender = Column(String(20), nullable=False)
    ProfilePhoto = Column(Text, nullable=True)
    MobileNumber = Column(String(20), nullable=False)
    WhatsAppNumber = Column(String(20), nullable=True)
    BusinessPhoneNumber = Column(String(20), nullable=True)
    EmailAddress = Column(String(150), unique=True, nullable=False)
    ClinicName = Column(String(200), nullable=False)
    ClinicAddress = Column(Text, nullable=False)
    City = Column(String(100), nullable=False)
    State = Column(String(100), nullable=False)
    Pincode = Column(String(10), nullable=False)
    Country = Column(String(100), nullable=False)
    ClinicConsultationFee = Column(Float, nullable=False)
    VideoConsultationFee = Column(Float, nullable=True)
    SecondOpinionFee = Column(Float, nullable=True)
    ConsultationDuration = Column(Integer, nullable=False)
    MaximumPatientsPerDay = Column(Integer, nullable=False)
    
    Monday = Column(String(255), nullable=True)
    Tuesday = Column(String(255), nullable=True)
    Wednesday = Column(String(255), nullable=True)
    Thursday = Column(String(255), nullable=True)
    Friday = Column(String(255), nullable=True)
    Saturday = Column(String(255), nullable=True)
    Sunday = Column(String(255), nullable=True)
    
    UpiId = Column(String(100), nullable=True)
    AccountHolderName = Column(String(150), nullable=True)
    BankName = Column(String(150), nullable=True)
    IfscCode = Column(String(20), nullable=True)
    AccountNumber = Column(String(30), nullable=True)
    
    Status = Column(String(20), default='Pending')
    WhatsAppBusinessStatus = Column(String(50), default='Disconnected')
    IsVerified = Column(Boolean, default=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    UpdatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    Password = Column(String, nullable=False)
    UserName = Column(String, unique=True, nullable=False)

    appointments = relationship("Appointment", back_populates="doctor", cascade="all, delete")
    prescriptions = relationship("Prescription", back_populates="doctor", cascade="all, delete")
