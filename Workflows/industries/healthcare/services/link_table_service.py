from typing import List, Optional
import core.models as models
import core.schemas as schemas
from backend_app.core.database import db_session

class LinkTableService:
    def __init__(self):
        self.db = db_session

    def create_link(self, link_data: schemas.LinkTableCreate) -> models.LinkTable:
        new_link = models.LinkTable(**link_data.model_dump())
        self.db.add(new_link)
        self.db.commit()
        self.db.refresh(new_link)
        return new_link

    def list_links(self, skip: int = 0, limit: int = 100) -> List[models.LinkTable]:
        return self.db.query(models.LinkTable).order_by(models.LinkTable.CreatedAt.desc()).offset(skip).limit(limit).all()

    def get_link(self, link_id: str) -> Optional[models.LinkTable]:
        return self.db.query(models.LinkTable).filter(models.LinkTable.Id == link_id).first()

    def get_whatsapp_link_by_link(self, link_url: str) -> Optional[models.LinkTable]:
        if not link_url:
            return None
        return self.db.query(models.LinkTable).filter(models.LinkTable.Link == link_url.strip()).first()

    def update_link(self, link_id: str, link_update: schemas.LinkTableUpdate) -> Optional[models.LinkTable]:
        link_entry = self.get_link(link_id)
        if not link_entry:
            return None
        update_data = link_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(link_entry, key, value)
        self.db.commit()
        self.db.refresh(link_entry)
        return link_entry

    def delete_link(self, link_id: str) -> bool:
        link_entry = self.get_link(link_id)
        if not link_entry:
            return False
        self.db.delete(link_entry)
        self.db.commit()
        return True
