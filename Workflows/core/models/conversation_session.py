from sqlalchemy import Column, String, DateTime, JSON, UniqueConstraint
from backend_app.core.database import Base
from datetime import datetime
from core.models.utils import generate_uuid

class ConversationSession(Base):
    __tablename__ = "conversation_sessions"

    # A person can hold one conversation per business at a time. PhoneNumber
    # alone used to be unique, which meant someone messaging two businesses
    # shared a single session and a single sequence position between them.
    __table_args__ = (
        UniqueConstraint(
            "PhoneNumber", "BusinessPhoneNumber", name="uq_session_phone_business"
        ),
    )

    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    PhoneNumber = Column(String, index=True, nullable=False)
    BusinessPhoneNumber = Column(String(32), index=True, nullable=False, default="", server_default="")
    StateData = Column(JSON, nullable=True, default=dict) # dict stored as JSON # current sequence, current flow, index
    CreatedAt = Column(DateTime, nullable=False, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def translate(self, key: str, **kwargs) -> str:
        from core.services.language_manager import LanguageManager
        return LanguageManager().text(key, **kwargs)
