from datetime import datetime, date, time
from typing import Optional
from sqlalchemy import Column, Integer, String, Date as SqlDate, Time, ForeignKey, UniqueConstraint, CheckConstraint, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.core.security import generate_uuid

class Appointment(Base):
    __tablename__ = "appointments"

    Id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid, index=True)
    DoctorId: Mapped[str] = mapped_column(String(36), ForeignKey("doctors.Id", ondelete="CASCADE"), nullable=False)
    DoctorName: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    PatientId: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("customers.PatientId", ondelete="CASCADE"), nullable=True)
    PatientName: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    
    Date: Mapped[date] = mapped_column(SqlDate, nullable=False, index=True)
    SlotTime: Mapped[time] = mapped_column(Time, nullable=False)
    Slot: Mapped[int] = mapped_column(Integer, nullable=False)
    
    ConsultationType: Mapped[str] = mapped_column(String, nullable=False, default="Clinic")
    Status: Mapped[str] = mapped_column(String, nullable=False, default="Booked")
    MeetingLink: Mapped[str | None] = mapped_column(String, nullable=True)
    RemindersSent: Mapped[str] = mapped_column(String(255), default="")
    ReMarks: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    ReviewDate: Mapped[Optional[date]] = mapped_column(SqlDate, nullable=True)
    CreatedAt: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    RefundStatus: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    RefundedAt: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    __table_args__ = (
        CheckConstraint("ConsultationType IN ('Clinic','VideoConsultation','SecondOpinion')", name="chk_consultation_type"),
        CheckConstraint("Status IN ('Available','Booked','Completed','Cancelled','Rescheduled','NoShow','NotAvailable')", name="chk_appointment_status"),
        UniqueConstraint("DoctorId", "Date", "SlotTime", "Slot", name="uq_appointment_slot_v4"),
    )

    patient = relationship("Customer", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    payments = relationship("Payment", back_populates="appointment", cascade="all, delete")

    @property
    def SlotStartTime(self):
        return self.SlotTime

    @property
    def SlotEndTime(self):
        if not self.SlotTime:
            return None
        duration = 15
        doc = self.doctor
        if doc and getattr(doc, 'ConsultationDuration', None):
            duration = doc.ConsultationDuration
        from datetime import datetime, timedelta
        dt = datetime.combine(self.Date, self.SlotTime) + timedelta(minutes=duration)
        return dt.time()
