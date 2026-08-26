from sqlalchemy.orm import Session
from typing import List, Optional
import backend_app.modules.doctor_appointment.models as models
import backend_app.modules.doctor_appointment.schemas as schemas
from backend_app.core.database import db_session

class PaymentService:
    def __init__(self):
        self.db = db_session

    def create_payment(self, payment: schemas.PaymentCreate) -> models.Payment:
        db_payment = models.Payment(**payment.model_dump())
        self.db.add(db_payment)
        self.db.commit()
        self.db.refresh(db_payment)
        return db_payment

    def list_payments(
        self,
        appointment_id: Optional[str] = None,
        doctor_id: Optional[str] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[models.Payment]:
        query = self.db.query(models.Payment)
        if appointment_id:
            query = query.filter(models.Payment.AppointmentId == appointment_id)
        if doctor_id:
            query = query.filter(models.Payment.DoctorId == doctor_id)
        if status:
            query = query.filter(models.Payment.Status == status)
        return query.offset(skip).limit(limit).all()

    def get_payment(self, payment_id: str) -> Optional[models.Payment]:
        return self.db.query(models.Payment).filter(models.Payment.Id == payment_id).first()

    def get_payment_by_appointment(self, appointment_id: str) -> Optional[models.Payment]:
        return self.db.query(models.Payment).filter(models.Payment.AppointmentId == appointment_id).first()

    def update_payment(self, payment_id: str, payment_update: schemas.PaymentUpdate) -> Optional[models.Payment]:
        payment = self.get_payment(payment_id)
        if not payment:
            return None
        update_data = payment_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(payment, key, value)
        self.db.commit()
        self.db.refresh(payment)
        return payment

    def update_payment_status(self, payment_id: str, status_str: str) -> Optional[models.Payment]:
        payment = self.get_payment(payment_id)
        if not payment:
            return None
        payment.Status = status_str
        self.db.commit()
        self.db.refresh(payment)
        return payment

    def delete_payment(self, payment_id: str) -> bool:
        payment = self.get_payment(payment_id)
        if not payment:
            return False
        self.db.delete(payment)
        self.db.commit()
        return True
