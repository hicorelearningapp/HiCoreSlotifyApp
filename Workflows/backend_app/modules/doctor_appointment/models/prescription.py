from datetime import datetime
from sqlalchemy import Column, String, Text, Date as SqlDate, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend_app.core.database import Base
from backend_app.core.security import generate_uuid

class Prescription(Base):
    __tablename__ = "prescriptions"

    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    DoctorId = Column(String(36), ForeignKey("doctors.Id", ondelete="CASCADE"), nullable=False)
    PatientId = Column(String(36), ForeignKey("customers.PatientId", ondelete="CASCADE"), nullable=False)
    
    Diagnosis = Column(Text, nullable=True)
    Medicines = Column(Text, nullable=True)
    NextFollowUpDate = Column(SqlDate, nullable=True)
    BP = Column(String(50), nullable=True)
    Height = Column(String(20), nullable=True)
    Weight = Column(String(20), nullable=True)
    Note = Column(Text, nullable=True)
    PrescriptionFile = Column(Text, nullable=True)
    
    CreatedAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    UpdatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    doctor = relationship("Doctor", back_populates="prescriptions")
    patient = relationship("Customer", back_populates="prescriptions")
