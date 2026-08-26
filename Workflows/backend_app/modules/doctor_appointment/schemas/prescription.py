from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List

class MedicineItem(BaseModel):
    Name: str
    Dosage: Optional[str] = Field(None, json_schema_extra={"example": "500mg"}, description="Dosage e.g. 500mg, 1 tablet")
    Frequency: Optional[str] = Field(None, json_schema_extra={"example": "1-0-1"}, description="Frequency e.g. 1-0-1, Once daily")
    Duration: Optional[str] = Field(None, json_schema_extra={"example": "5 days"}, description="Duration e.g. 5 days, 1 week")
    Instructions: Optional[str] = Field(None, json_schema_extra={"example": "After meals"}, description="Instructions e.g. After meals, Before bed")

class PrescriptionBase(BaseModel):
    DoctorId: str
    PatientId: str
    Diagnosis: Optional[str] = None
    Medicines: List[MedicineItem] = []
    NextFollowUpDate: Optional[date] = None
    BP: Optional[str] = None
    Height: Optional[str] = None
    Weight: Optional[str] = None
    Note: Optional[str] = None
    PrescriptionFile: Optional[str] = None

class PrescriptionCreate(PrescriptionBase):
    pass

class PrescriptionUpdate(BaseModel):
    DoctorId: Optional[str] = None
    PatientId: Optional[str] = None
    Diagnosis: Optional[str] = None
    Medicines: Optional[List[MedicineItem]] = None
    NextFollowUpDate: Optional[date] = None
    BP: Optional[str] = None
    Height: Optional[str] = None
    Weight: Optional[str] = None
    Note: Optional[str] = None
    PrescriptionFile: Optional[str] = None

class PrescriptionOut(PrescriptionBase):
    Id: str
    CreatedAt: datetime
    UpdatedAt: datetime

    class Config:
        from_attributes = True
