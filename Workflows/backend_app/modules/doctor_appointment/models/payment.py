from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from backend_app.core.database import Base
from backend_app.core.security import generate_uuid

class Payment(Base):
    __tablename__ = "payments"

    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    DateTime = Column(DateTime, nullable=False, default=datetime.utcnow)
    AppointmentId = Column(String(36), ForeignKey("appointments.Id", ondelete="CASCADE"), nullable=False)
    CustomerId = Column(String(36), nullable=False)
    DoctorId = Column(String(36), ForeignKey("doctors.Id", ondelete="CASCADE"), nullable=False)
    Payment = Column(Float, nullable=False)
    Status = Column(String(20), nullable=False)

    __table_args__ = (
        CheckConstraint("Status IN ('Pending','Paid','Failed','Refunded')", name="chk_payment_status"),
    )

    appointment = relationship("Appointment", back_populates="payments")
