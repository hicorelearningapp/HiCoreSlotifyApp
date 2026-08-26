from sqlalchemy.orm import Session
from typing import List, Optional
from backend_app.modules.doctor_appointment.models.status_type import StatusType
from backend_app.modules.doctor_appointment.schemas.status_type import StatusTypeCreate, StatusTypeUpdate
from backend_app.core.database import db_session

DEFAULT_STATUS_TYPES = [
    {"Name": "Available", "Description": "Slot is available for booking"},
    {"Name": "Booked", "Description": "Appointment has been booked"},
    {"Name": "Completed", "Description": "Appointment consultation completed"},
    {"Name": "Cancelled", "Description": "Appointment was cancelled"},
    {"Name": "Rescheduled", "Description": "Appointment was rescheduled"},
    {"Name": "NoShow", "Description": "Patient did not attend appointment"},
    {"Name": "NotAvailable", "Description": "Slot is marked not available"},
]

class StatusTypeService:
    @staticmethod
    def get_all(db: Session = db_session, skip: int = 0, limit: int = 100) -> List[StatusType]:
        return db.query(StatusType).offset(skip).limit(limit).all()

    @staticmethod
    def get_by_id(db: Session, status_type_id: str) -> Optional[StatusType]:
        return db.query(StatusType).filter(StatusType.Id == status_type_id).first()

    @staticmethod
    def create(db: Session, status_type_in: StatusTypeCreate) -> StatusType:
        existing = db.query(StatusType).filter(StatusType.Name == status_type_in.Name).first()
        if existing:
            return existing
        status_type = StatusType(
            Name=status_type_in.Name,
            Description=status_type_in.Description,
            IsActive=status_type_in.IsActive
        )
        db.add(status_type)
        db.commit()
        db.refresh(status_type)
        return status_type

    @staticmethod
    def update(db: Session, status_type_id: str, status_type_in: StatusTypeUpdate) -> Optional[StatusType]:
        status_type = db.query(StatusType).filter(StatusType.Id == status_type_id).first()
        if not status_type:
            return None
        if status_type_in.Name is not None:
            status_type.Name = status_type_in.Name
        if status_type_in.Description is not None:
            status_type.Description = status_type_in.Description
        if status_type_in.IsActive is not None:
            status_type.IsActive = status_type_in.IsActive
        db.commit()
        db.refresh(status_type)
        return status_type

    @staticmethod
    def delete(db: Session, status_type_id: str) -> bool:
        status_type = db.query(StatusType).filter(StatusType.Id == status_type_id).first()
        if not status_type:
            return False
        db.delete(status_type)
        db.commit()
        return True

    @staticmethod
    def seed_defaults(db: Session):
        for item in DEFAULT_STATUS_TYPES:
            existing = db.query(StatusType).filter(StatusType.Name == item["Name"]).first()
            if not existing:
                st = StatusType(Name=item["Name"], Description=item["Description"], IsActive=True)
                db.add(st)
        db.commit()
