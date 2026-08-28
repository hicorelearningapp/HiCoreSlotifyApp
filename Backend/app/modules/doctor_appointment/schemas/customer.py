from pydantic import BaseModel, model_validator
from typing import Optional
from datetime import date, datetime

class CustomerBase(BaseModel):
    CustomerName: str
    PhoneNumber: str
    EmailAddress: Optional[str] = None
    DateOfBirth: Optional[date] = None
    BloodGroup: Optional[str] = None
    Gender: Optional[str] = None
    Address: Optional[str] = None

class CustomerCreate(CustomerBase):
    PatientName: Optional[str] = None
    Height: Optional[float] = None
    Weight: Optional[float] = None

class PatientCreate(BaseModel):
    PatientName: str
    DateOfBirth: Optional[date] = None
    BloodGroup: Optional[str] = None
    Gender: Optional[str] = None
    Address: Optional[str] = None

class CustomerUpdate(BaseModel):
    CustomerName: Optional[str] = None
    PatientName: Optional[str] = None
    PhoneNumber: Optional[str] = None
    EmailAddress: Optional[str] = None
    DateOfBirth: Optional[date] = None
    BloodGroup: Optional[str] = None
    Gender: Optional[str] = None
    Address: Optional[str] = None

class CustomerOut(BaseModel):
    PatientId: str
    CustomerId: str
    CustomerName: str
    PatientName: str
    PhoneNumber: str
    EmailAddress: Optional[str] = None
    DateOfBirth: Optional[date] = None
    Age: Optional[int] = None
    BloodGroup: Optional[str] = None
    Gender: Optional[str] = None
    Address: Optional[str] = None
    Language: Optional[str] = "en"

    @model_validator(mode="before")
    @classmethod
    def compute_age(cls, data):
        dob = None
        if hasattr(data, "DateOfBirth"):
            dob = getattr(data, "DateOfBirth")
        elif isinstance(data, dict):
            dob = data.get("DateOfBirth")

        if dob:
            if isinstance(dob, str):
                try:
                    dob = datetime.strptime(dob, "%Y-%m-%d").date()
                except Exception:
                    dob = None
            if isinstance(dob, date):
                today = date.today()
                calculated_age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
                if hasattr(data, "__dict__"):
                    try:
                        setattr(data, "Age", calculated_age)
                    except Exception:
                        pass
                elif isinstance(data, dict):
                    data["Age"] = calculated_age
        return data

    class Config:
        from_attributes = True
