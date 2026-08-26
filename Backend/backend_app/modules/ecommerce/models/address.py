from sqlalchemy import Column, String, Integer, Boolean
from backend_app.core.database import Base

class Address(Base):
    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    customer_phone = Column(String(50), index=True, nullable=False)
    name = Column(String(150), nullable=False)
    address_line = Column(String(300), nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    pincode = Column(String(20), nullable=False)
    is_default = Column(Boolean, default=False)
