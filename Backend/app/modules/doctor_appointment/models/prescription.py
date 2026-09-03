from datetime import datetime, date
from sqlalchemy import Column, String, Text, Date as SqlDate, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.core.security import generate_uuid
from sqlalchemy.orm import Mapped, mapped_column

class Prescription(Base):
    __tablename__ = "prescriptions"

    Id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid, index=True)
    DoctorId: Mapped[str] = mapped_column(String(36), ForeignKey("businesses.Id", ondelete="CASCADE"), nullable=False)
    PatientId: Mapped[str] = mapped_column(String(36), ForeignKey("customers.PatientId", ondelete="CASCADE"), nullable=False)
    
    Diagnosis: Mapped[str] = mapped_column(Text, nullable=True)
    Medicines: Mapped[str] = mapped_column(Text, nullable=True)
    NextFollowUpDate: Mapped[date] = mapped_column(SqlDate, nullable=True)
    BP: Mapped[str] = mapped_column(String(50), nullable=True)
    Height: Mapped[str] = mapped_column(String(20), nullable=True)
    Weight: Mapped[str] = mapped_column(String(20), nullable=True)
    Note: Mapped[str] = mapped_column(Text, nullable=True)
    PrescriptionFile: Mapped[str] = mapped_column(Text, nullable=True)
    
    CreatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    UpdatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    doctor = relationship("Business", back_populates="prescriptions")
    patient = relationship("Customer", back_populates="prescriptions")
