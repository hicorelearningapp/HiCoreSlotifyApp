from sqlalchemy import Column, String, DateTime, JSON, UniqueConstraint
from core.database import Base
from datetime import datetime
from core.models.utils import generate_uuid
from sqlalchemy.orm import Mapped, mapped_column
from datetime import timezone
from sqlalchemy.sql import func

class ConversationSessionDB(Base):
    __tablename__ = "conversation_sessions"

    # A person can hold one conversation per business at a time. PhoneNumber
    # alone used to be unique, which meant someone messaging two businesses
    # shared a single session and a single sequence position between them.
    __table_args__ = (
        UniqueConstraint(
            "PhoneNumber", "BusinessPhoneNumber", name="uq_session_phone_business"
        ),
    )

    Id : Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid, index=True)
    PhoneNumber : Mapped[str] = mapped_column(String, index=True, nullable=False)
    BusinessPhoneNumber : Mapped[str] = mapped_column(String(32), index=True, nullable=False, default="", server_default="")
    StateData : Mapped[dict] = mapped_column(JSON, nullable=True, default=dict) # dict stored as JSON # current sequence, current flow, index
    
    CreatedAt : Mapped[datetime] = mapped_column(DateTime, nullable=False, default=func.now(), server_default=func.now())
    UpdatedAt : Mapped[datetime] = mapped_column(DateTime, nullable=False, default=func.now(), server_default=func.now(), onupdate=func.now())

