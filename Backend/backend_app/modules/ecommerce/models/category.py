from sqlalchemy import Column, String, Integer, Boolean, Text
from backend_app.core.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    store_id = Column(String(50), index=True, default="default")
    is_active = Column(Boolean, default=True)
