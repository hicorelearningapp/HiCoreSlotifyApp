from sqlalchemy import Column, String, DateTime, JSON
from backend_app.core.database import Base
from datetime import datetime
from core.models.utils import generate_uuid

class ConversationSession(Base):
    __tablename__ = "conversation_sessions"

    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    PhoneNumber = Column(String, unique=True, index=True, nullable=False)
    StateData = Column(JSON, nullable=True, default=dict) # dict stored as JSON # current sequence, current flow, index
    CreatedAt = Column(DateTime, nullable=False, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def translate(self, key: str, **kwargs) -> str:
        from core.services.language_manager import LanguageManager
        return LanguageManager().text(key, **kwargs)
