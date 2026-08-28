from sqlalchemy import Column, String, Integer
from backend_app.core.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False, index=True)
    description = Column(String, nullable=True)
    store_id = Column(String, index=True, default="default")
