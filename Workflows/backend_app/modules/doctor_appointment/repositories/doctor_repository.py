from typing import List, Optional
from sqlalchemy.orm import Session
from backend_app.modules.doctor_appointment.models import Doctor

class DoctorRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, doctor_id: str) -> Optional[Doctor]:
        return self.db.query(Doctor).filter(Doctor.Id == doctor_id).first()

    def get_by_username(self, username: str) -> Optional[Doctor]:
        return self.db.query(Doctor).filter(Doctor.UserName == username).first()

    def get_by_email(self, email: str) -> Optional[Doctor]:
        return self.db.query(Doctor).filter(Doctor.EmailAddress == email).first()

    def list_all(self, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> List[Doctor]:
        query = self.db.query(Doctor)
        if status:
            query = query.filter(Doctor.Status == status)
        return query.offset(skip).limit(limit).all()

    def create(self, doctor: Doctor) -> Doctor:
        self.db.add(doctor)
        self.db.commit()
        self.db.refresh(doctor)
        return doctor

    def update(self, doctor: Doctor) -> Doctor:
        self.db.commit()
        self.db.refresh(doctor)
        return doctor

    def delete(self, doctor_id: str) -> bool:
        doctor = self.get_by_id(doctor_id)
        if doctor:
            self.db.delete(doctor)
            self.db.commit()
            return True
        return False
