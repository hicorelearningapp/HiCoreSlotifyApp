from datetime import datetime
from sqlalchemy import Column, Integer, String, Date as SqlDate, Time, ForeignKey, UniqueConstraint, CheckConstraint, DateTime
from sqlalchemy.orm import relationship
from backend_app.core.database import Base
from backend_app.core.security import generate_uuid

class Appointment(Base):
    __tablename__ = "appointments"

    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    DoctorId = Column(String(36), ForeignKey("doctors.Id", ondelete="CASCADE"), nullable=False)
    DoctorName = Column(String(150), nullable=True)
    PatientId = Column(String(36), ForeignKey("customers.PatientId", ondelete="CASCADE"), nullable=True)
    PatientName = Column(String(150), nullable=True)
    
    Date = Column(SqlDate, nullable=False, index=True)
    SlotTime = Column(Time, nullable=False)
    Slot = Column(Integer, nullable=False)
    
    ConsultationType = Column(String, nullable=False, default="Clinic")
    Status = Column(String, nullable=False, default="Booked")
    MeetingLink = Column(String(255), nullable=True)
    RemindersSent = Column(String(255), default="")
    ReMarks = Column(String(255), nullable=True)
    ReviewDate = Column(SqlDate, nullable=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    
    RefundStatus = Column(String(20), nullable=True)
    RefundedAt = Column(DateTime, nullable=True)

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
