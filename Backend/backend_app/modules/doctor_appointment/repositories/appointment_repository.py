from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from datetime import date
from backend_app.modules.doctor_appointment.models import Appointment

class AppointmentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, appointment_id: str) -> Optional[Appointment]:
        return self.db.query(Appointment).filter(Appointment.Id == appointment_id).first()

    def list_appointments(
        self,
        doctor_id: Optional[str] = None,
        patient_id: Optional[str] = None,
        target_date: Optional[date] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> Tuple[List[Appointment], int]:
        query = self.db.query(Appointment)
        if doctor_id:
            query = query.filter(Appointment.DoctorId == doctor_id)
        if patient_id:
            query = query.filter(Appointment.PatientId == patient_id)
        if target_date:
            query = query.filter(Appointment.Date == target_date)
        if status:
            query = query.filter(Appointment.Status == status)

        total = query.count()
        items = query.order_by(Appointment.Date.desc(), Appointment.SlotTime.asc()).offset(skip).limit(limit).all()
        return items, total

    def create(self, appointment: Appointment) -> Appointment:
        self.db.add(appointment)
        self.db.commit()
        self.db.refresh(appointment)
        return appointment

    def update(self, appointment: Appointment) -> Appointment:
        self.db.commit()
        self.db.refresh(appointment)
        return appointment

    def delete(self, appointment_id: str) -> bool:
        apt = self.get_by_id(appointment_id)
        if apt:
            self.db.delete(apt)
            self.db.commit()
            return True
        return False
