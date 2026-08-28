from sqlalchemy.orm import Session
from typing import List, Optional

from app.modules.demo_request.models.demo_request import DemoRequest
from app.modules.demo_request.schemas.demo_request import DemoRequestCreate, DemoRequestUpdate


class DemoRequestService:

    @staticmethod
    def create(db: Session, demo_in: DemoRequestCreate) -> DemoRequest:
        payload = demo_in.model_dump()
        # PreferredDate arrives as a free-text date from the booking form.
        if payload.get("PreferredDate") is not None:
            payload["PreferredDate"] = str(payload["PreferredDate"])
        new_demo = DemoRequest(**payload, Status="Pending")
        db.add(new_demo)
        db.commit()
        db.refresh(new_demo)
        return new_demo

    @staticmethod
    def get_by_id(db: Session, demo_id: str) -> Optional[DemoRequest]:
        return db.query(DemoRequest).filter(DemoRequest.DemoId == demo_id).first()

    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[DemoRequest]:
        return (
            db.query(DemoRequest)
            .order_by(DemoRequest.CreatedAt.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def update(db: Session, demo_id: str, demo_in: DemoRequestUpdate) -> Optional[DemoRequest]:
        demo = DemoRequestService.get_by_id(db, demo_id)
        if not demo:
            return None
        for field, value in demo_in.model_dump(exclude_unset=True).items():
            setattr(demo, field, value)
        db.commit()
        db.refresh(demo)
        return demo

    @staticmethod
    def update_status(db: Session, demo_id: str, status: str) -> Optional[DemoRequest]:
        demo = DemoRequestService.get_by_id(db, demo_id)
        if not demo:
            return None
        demo.Status = status
        db.commit()
        db.refresh(demo)
        return demo

    @staticmethod
    def delete(db: Session, demo_id: str) -> bool:
        demo = DemoRequestService.get_by_id(db, demo_id)
        if not demo:
            return False
        db.delete(demo)
        db.commit()
        return True
