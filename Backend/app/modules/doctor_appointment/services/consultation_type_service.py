from sqlalchemy.orm import Session, scoped_session
from typing import List, Optional
from app.modules.doctor_appointment.models.consultation_type import ConsultationType
from app.modules.doctor_appointment.schemas.consultation_type import ConsultationTypeCreate, ConsultationTypeUpdate
from app.core.database import db_session

DEFAULT_CONSULTATION_TYPES = [
    {"Name": "Clinic", "Description": "In-person clinic consultation"},
    {"Name": "VideoConsultation", "Description": "Online video consultation via Google Meet or link"},
    {"Name": "SecondOpinion", "Description": "Second opinion medical consultation"},
]

class ConsultationTypeService:
    @staticmethod
    def get_all(db: Session | scoped_session = db_session, skip: int = 0, limit: int = 100) -> List[ConsultationType]:
        return db.query(ConsultationType).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, consultation_type_id: str) -> Optional[ConsultationType]:
        return db.query(ConsultationType).filter(ConsultationType.Id == consultation_type_id).first()

    @staticmethod
    def create(db: Session, consultation_type_in: ConsultationTypeCreate) -> ConsultationType:
        existing = db.query(ConsultationType).filter(ConsultationType.Name == consultation_type_in.Name).first()
        if existing:
            return existing
        consultation_type = ConsultationType(
            Name=consultation_type_in.Name,
            Description=consultation_type_in.Description,
            IsActive=consultation_type_in.IsActive
        )
        db.add(consultation_type)
        db.commit()
        db.refresh(consultation_type)
        return consultation_type

    @staticmethod
    def update(db: Session, consultation_type_id: str, consultation_type_in: ConsultationTypeUpdate) -> Optional[ConsultationType]:
        ct = db.query(ConsultationType).filter(ConsultationType.Id == consultation_type_id).first()
        if not ct:
            return None
        if consultation_type_in.Name is not None:
            ct.Name = consultation_type_in.Name
        if consultation_type_in.Description is not None:
            ct.Description = consultation_type_in.Description
        if consultation_type_in.IsActive is not None:
            ct.IsActive = consultation_type_in.IsActive
        db.commit()
        db.refresh(ct)
        return ct

    @staticmethod
    def delete(db: Session, consultation_type_id: str) -> bool:
        ct = db.query(ConsultationType).filter(ConsultationType.Id == consultation_type_id).first()
        if not ct:
            return False
        db.delete(ct)
        db.commit()
        return True

    @staticmethod
    def seed_defaults(db: Session):
        for item in DEFAULT_CONSULTATION_TYPES:
            existing = db.query(ConsultationType).filter(ConsultationType.Name == item["Name"]).first()
            if not existing:
                ct = ConsultationType(Name=item["Name"], Description=item["Description"], IsActive=True)
                db.add(ct)
        db.commit()
