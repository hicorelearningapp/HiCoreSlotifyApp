from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from backend_app.core.database import Base
from backend_app.core.security import generate_uuid
from sqlalchemy.orm import Mapped, mapped_column
class Payment(Base):
    __tablename__ = "payments"

    Id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid, index=True)
    DateTime: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
    AppointmentId: Mapped[str] = mapped_column(String(36), ForeignKey("appointments.Id", ondelete="CASCADE"), nullable=False)
    CustomerId: Mapped[str] = mapped_column(String(36), nullable=False)
    DoctorId: Mapped[str] = mapped_column(String(36), ForeignKey("doctors.Id", ondelete="CASCADE"), nullable=False)
    Payment: Mapped[float] = mapped_column(Float, nullable=False)
    Status: Mapped[str] = mapped_column(String(20), nullable=False)

    __table_args__ = (
        CheckConstraint("Status IN ('Pending','Paid','Failed','Refunded')", name="chk_payment_status"),
    )

    appointment = relationship("Appointment", back_populates="payments")
