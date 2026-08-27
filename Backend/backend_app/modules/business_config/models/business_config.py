from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from backend_app.core.database import Base
from backend_app.core.security import generate_uuid

class BusinessConfig(Base):
    __tablename__ = "business_configurations"

    Id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid, index=True)
    BusinessPhoneNumber: Mapped[str] = mapped_column(String(20), unique=True, nullable=False, index=True)
    ConfigJson: Mapped[str] = mapped_column(Text, nullable=False)
