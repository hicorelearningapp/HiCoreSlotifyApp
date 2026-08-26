from sqlalchemy.orm import Session
from typing import List, Optional
import core.models as models
import core.schemas as schemas
from backend_app.core.database import db_session

class DemoRequestService:
    def __init__(self, db: Session = None):
        self.db = db or db_session

    def create_demo_request(self, demo_in: schemas.DemoRequestCreate) -> models.DemoRequest:
        new_demo = models.DemoRequest(
            BusinessName=demo_in.BusinessName,
            BusinessType=demo_in.BusinessType,
            Locations=demo_in.Locations,
            City=demo_in.City,
            State=demo_in.State,
            Country=demo_in.Country,
            FullName=demo_in.FullName,
            Designation=demo_in.Designation,
            WorkEmail=demo_in.WorkEmail,
            MobileNumber=demo_in.MobileNumber,
            WhatsappNumber=demo_in.WhatsappNumber,
            PreferredDate=str(demo_in.PreferredDate) if demo_in.PreferredDate else None,
            PreferredTime=demo_in.PreferredTime,
            PreferredDemoMode=demo_in.PreferredDemoMode,
            DemoRequirements=demo_in.DemoRequirements,
            AgreeToContact=demo_in.AgreeToContact,
            SelectedIndustry=demo_in.SelectedIndustry,
            Status="Pending"
        )
        self.db.add(new_demo)
        self.db.commit()
        self.db.refresh(new_demo)
        return new_demo

    def get_demo_request(self, demo_id: str) -> Optional[models.DemoRequest]:
        return self.db.query(models.DemoRequest).filter(models.DemoRequest.DemoId == demo_id).first()

    def get_all_demo_requests(self, skip: int = 0, limit: int = 100) -> List[models.DemoRequest]:
        return self.db.query(models.DemoRequest).order_by(models.DemoRequest.CreatedAt.desc()).offset(skip).limit(limit).all()

    def update_demo_status(self, demo_id: str, status: str) -> Optional[models.DemoRequest]:
        demo = self.db.query(models.DemoRequest).filter(models.DemoRequest.DemoId == demo_id).first()
        if not demo:
            return None
        demo.Status = status
        self.db.commit()
        self.db.refresh(demo)
        return demo

    def delete_demo_request(self, demo_id: str) -> bool:
        demo = self.db.query(models.DemoRequest).filter(models.DemoRequest.DemoId == demo_id).first()
        if not demo:
            return False
        self.db.delete(demo)
        self.db.commit()
        return True
