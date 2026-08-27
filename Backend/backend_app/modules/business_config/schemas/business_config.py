from pydantic import BaseModel
from typing import Dict, Any

class BusinessConfigBase(BaseModel):
    business_phone_number: str
    config_json: Dict[Any, Any]

class BusinessConfigCreate(BusinessConfigBase):
    pass

class BusinessConfigUpdate(BusinessConfigBase):
    pass

class BusinessConfigResponse(BusinessConfigBase):
    id: str

    class Config:
        from_attributes = True
