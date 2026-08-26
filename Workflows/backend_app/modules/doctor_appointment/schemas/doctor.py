from pydantic import BaseModel, field_validator, ValidationInfo
from datetime import datetime, date
from typing import Optional, List, Dict, Any
from enum import Enum
import re

class WhatsAppBusinessStatusEnum(str, Enum):
    CONNECTED = "Connected"
    DISCONNECTED = "Disconnected"

class DoctorValidationMixin:
    @field_validator("FullName", mode="before", check_fields=False)
    @classmethod
    def validate_fullname(cls, v: Any) -> Optional[str]:
        if v is None or v == "":
            return None
        if not isinstance(v, str) or not v.strip():
            raise ValueError("FullName cannot be empty")
        v = v.strip()
        if len(v) < 2:
            raise ValueError("FullName must be at least 2 characters long")
        if len(v) > 150:
            raise ValueError("FullName cannot exceed 150 characters")
        return v

    @field_validator("MobileNumber", "WhatsAppNumber", "BusinessPhoneNumber", mode="before", check_fields=False)
    @classmethod
    def validate_phone_numbers(cls, v: Any, info: ValidationInfo) -> Optional[str]:
        if v is None or v == "" or (isinstance(v, str) and not v.strip()):
            return None
        v = str(v).strip()
        cleaned = re.sub(r"[^\d+]", "", v)
        if not re.match(r"^\+?\d{7,15}$", cleaned):
            raise ValueError(f"{info.field_name} must be a valid phone number (7 to 15 digits)")
        return cleaned

    @field_validator("EmailAddress", mode="before", check_fields=False)
    @classmethod
    def validate_email(cls, v: Any) -> Optional[str]:
        if v is None or v == "" or (isinstance(v, str) and not v.strip()):
            return None
        v = str(v).strip().lower()
        if not re.match(r"^[\w\.\-]+@[\w\.\-]+\.[a-zA-Z]{2,}$", v):
            raise ValueError("EmailAddress must be a valid email address format")
        return v

    @field_validator("MedicalRegistrationNumber", mode="before", check_fields=False)
    @classmethod
    def validate_reg_num(cls, v: Any) -> Optional[str]:
        if v is None or v == "" or (isinstance(v, str) and not v.strip()):
            return None
        v = str(v).strip()
        if len(v) < 3 or len(v) > 50:
            raise ValueError("MedicalRegistrationNumber must be between 3 and 50 characters")
        return v

    @field_validator("YearsOfExperience", mode="before", check_fields=False)
    @classmethod
    def validate_experience(cls, v: Any) -> Optional[int]:
        if v is None or v == "":
            return None
        try:
            val = int(v)
        except (TypeError, ValueError):
            raise ValueError("YearsOfExperience must be an integer")
        if val < 0 or val > 70:
            raise ValueError("YearsOfExperience must be between 0 and 70")
        return val

    @field_validator("Pincode", mode="before", check_fields=False)
    @classmethod
    def validate_pincode(cls, v: Any) -> Optional[str]:
        if v is None or v == "" or (isinstance(v, str) and not v.strip()):
            return None
        v = str(v).strip()
        if not re.match(r"^\d{4,10}$", v):
            raise ValueError("Pincode must be a numeric string between 4 and 10 digits")
        return v

    @field_validator("ClinicConsultationFee", mode="before", check_fields=False)
    @classmethod
    def validate_consultation_fee(cls, v: Any) -> Optional[float]:
        if v is None or v == "":
            return None
        try:
            val = float(v)
        except (TypeError, ValueError):
            raise ValueError("ClinicConsultationFee must be a valid number")
        if val < 0:
            raise ValueError("ClinicConsultationFee cannot be negative")
        return val

    @field_validator("VideoConsultationFee", "SecondOpinionFee", mode="before", check_fields=False)
    @classmethod
    def validate_optional_fees(cls, v: Any, info: ValidationInfo) -> Optional[float]:
        if v is None or v == "" or (isinstance(v, str) and not v.strip()):
            return None
        try:
            val = float(v)
        except (TypeError, ValueError):
            raise ValueError(f"{info.field_name} must be a valid number")
        if val < 0:
            raise ValueError(f"{info.field_name} cannot be negative")
        return val

    @field_validator("ConsultationDuration", mode="before", check_fields=False)
    @classmethod
    def validate_consultation_duration(cls, v: Any) -> Optional[int]:
        if v is None or v == "":
            return None
        try:
            val = int(v)
        except (TypeError, ValueError):
            raise ValueError("ConsultationDuration must be an integer in minutes")
        if val < 5 or val > 240:
            raise ValueError("ConsultationDuration must be between 5 and 240 minutes")
        return val

    @field_validator("MaximumPatientsPerDay", mode="before", check_fields=False)
    @classmethod
    def validate_max_patients(cls, v: Any) -> Optional[int]:
        if v is None or v == "":
            return None
        try:
            val = int(v)
        except (TypeError, ValueError):
            raise ValueError("MaximumPatientsPerDay must be a valid integer")
        if val < 1 or val > 500:
            raise ValueError("MaximumPatientsPerDay must be between 1 and 500")
        return val

    @field_validator("IfscCode", mode="before", check_fields=False)
    @classmethod
    def validate_ifsc(cls, v: Any) -> Optional[str]:
        if v is None or v == "" or (isinstance(v, str) and not v.strip()):
            return None
        v = str(v).strip().upper()
        if not re.match(r"^[A-Z]{4}0[A-Z0-9]{6}$", v):
            raise ValueError("IfscCode must be a valid 11-character Indian IFSC code (e.g. SBIN0001234)")
        return v

    @field_validator("UpiId", mode="before", check_fields=False)
    @classmethod
    def validate_upi(cls, v: Any) -> Optional[str]:
        if v is None or v == "" or (isinstance(v, str) and not v.strip()):
            return None
        v = str(v).strip()
        if not re.match(r"^[\w\.\-]+@[\w\-]+$", v):
            raise ValueError("UpiId must be a valid UPI ID (e.g. doctor@upi)")
        return v

    @field_validator("AccountNumber", mode="before", check_fields=False)
    @classmethod
    def validate_account_number(cls, v: Any) -> Optional[str]:
        if v is None or v == "" or (isinstance(v, str) and not v.strip()):
            return None
        v = str(v).strip()
        if not re.match(r"^\d{9,18}$", v):
            raise ValueError("AccountNumber must be a numeric string between 9 and 18 digits")
        return v

class DoctorBase(BaseModel):
    FullName: str
    Qualification: str
    Specialization: str
    MedicalRegistrationNumber: str
    YearsOfExperience: int
    DateOfBirth: date
    Gender: str
    ProfilePhoto: Optional[str] = None
    MobileNumber: str
    WhatsAppNumber: Optional[str] = None
    BusinessPhoneNumber: Optional[str] = None
    EmailAddress: str
    ClinicName: str
    ClinicAddress: str
    City: str
    State: str
    Pincode: str
    Country: str
    ClinicConsultationFee: float
    VideoConsultationFee: Optional[float] = None
    SecondOpinionFee: Optional[float] = None
    ConsultationDuration: int
    MaximumPatientsPerDay: int
    WhatsAppBusinessStatus: WhatsAppBusinessStatusEnum = WhatsAppBusinessStatusEnum.DISCONNECTED
    
    Monday: Optional[str] = None
    Tuesday: Optional[str] = None
    Wednesday: Optional[str] = None
    Thursday: Optional[str] = None
    Friday: Optional[str] = None
    Saturday: Optional[str] = None
    Sunday: Optional[str] = None
    
    UpiId: Optional[str] = None
    AccountHolderName: Optional[str] = None
    BankName: Optional[str] = None
    IfscCode: Optional[str] = None
    AccountNumber: Optional[str] = None

class DoctorCreate(DoctorBase, DoctorValidationMixin):
    Password: str
    Status: str = 'Pending'
    IsVerified: bool = False
    UserName: str

    @field_validator("UserName", mode="before")
    @classmethod
    def validate_username(cls, v: Any) -> str:
        if v is None or not isinstance(v, str) or not v.strip():
            raise ValueError("UserName is required")
        v = v.strip()
        if len(v) < 3 or len(v) > 50:
            raise ValueError("UserName must be between 3 and 50 characters long")
        if not re.match(r"^[a-zA-Z0-9_\-\.]+$", v):
            raise ValueError("UserName can only contain letters, numbers, underscores, hyphens, and dots")
        return v

    @field_validator("Password", mode="before")
    @classmethod
    def validate_password(cls, v: Any) -> str:
        if v is None or not isinstance(v, str) or not v.strip():
            raise ValueError("Password is required and cannot be blank")
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters long")
        if len(v) > 100:
            raise ValueError("Password cannot exceed 100 characters")
        return v

class DoctorUpdate(BaseModel, DoctorValidationMixin):
    FullName: Optional[str] = None
    Qualification: Optional[str] = None
    Specialization: Optional[str] = None
    YearsOfExperience: Optional[int] = None
    DateOfBirth: Optional[date] = None
    Gender: Optional[str] = None
    ProfilePhoto: Optional[str] = None
    MobileNumber: Optional[str] = None
    WhatsAppNumber: Optional[str] = None
    BusinessPhoneNumber: Optional[str] = None
    EmailAddress: Optional[str] = None
    ClinicName: Optional[str] = None
    ClinicAddress: Optional[str] = None
    City: Optional[str] = None
    State: Optional[str] = None
    Pincode: Optional[str] = None
    Country: Optional[str] = None
    ClinicConsultationFee: Optional[float] = None
    VideoConsultationFee: Optional[float] = None
    SecondOpinionFee: Optional[float] = None
    ConsultationDuration: Optional[int] = None
    MaximumPatientsPerDay: Optional[int] = None
    WhatsAppBusinessStatus: Optional[WhatsAppBusinessStatusEnum] = None
    Monday: Optional[str] = None
    Tuesday: Optional[str] = None
    Wednesday: Optional[str] = None
    Thursday: Optional[str] = None
    Friday: Optional[str] = None
    Saturday: Optional[str] = None
    Sunday: Optional[str] = None
    UpiId: Optional[str] = None
    AccountHolderName: Optional[str] = None
    BankName: Optional[str] = None
    IfscCode: Optional[str] = None
    AccountNumber: Optional[str] = None
    Status: Optional[str] = None
    IsVerified: Optional[bool] = None

class DoctorUsernameUpdate(BaseModel):
    UserName: str

    @field_validator("UserName", mode="before")
    @classmethod
    def validate_username(cls, v: Any) -> str:
        if v is None or not isinstance(v, str) or not v.strip():
            raise ValueError("UserName is required")
        v = v.strip()
        if len(v) < 3 or len(v) > 50:
            raise ValueError("UserName must be between 3 and 50 characters long")
        if not re.match(r"^[a-zA-Z0-9_\-\.]+$", v):
            raise ValueError("UserName can only contain letters, numbers, underscores, hyphens, and dots")
        return v

class DoctorPasswordUpdate(BaseModel):
    OldPassword: Optional[str] = None
    NewPassword: str

    @field_validator("NewPassword", mode="before")
    @classmethod
    def validate_password(cls, v: Any) -> str:
        if v is None or not isinstance(v, str) or not v.strip():
            raise ValueError("NewPassword is required and cannot be blank")
        if len(v) < 6:
            raise ValueError("NewPassword must be at least 6 characters long")
        if len(v) > 100:
            raise ValueError("NewPassword cannot exceed 100 characters")
        return v

class DoctorOut(DoctorBase):
    Id: str
    Status: str
    IsVerified: bool
    UserName: str
    CreatedAt: datetime
    UpdatedAt: datetime

    class Config:
        from_attributes = True

class DoctorWhatsAppStatusUpdate(BaseModel):
    WhatsAppBusinessStatus: WhatsAppBusinessStatusEnum

class DoctorLogin(BaseModel):
    UserName: str
    Password: str

class WeeklyDayAnalyticsItem(BaseModel):
    Day: str
    Count: int

    class Config:
        from_attributes = True

class MonthlyAnalyticsItem(BaseModel):
    Month: str
    Count: int

    class Config:
        from_attributes = True

class DoctorDashboardOut(BaseModel):
    DoctorId: str
    DoctorName: str
    Specialization: str
    ClinicName: str
    Status: str
    IsVerified: bool
    TodayTotalAppointments: int
    TodayCompletedAppointments: int
    TodayPendingAppointments: int
    TodayCancelledAppointments: int
    TodayRevenue: float
    TotalLifetimeAppointments: int
    TotalLifetimePatients: int
    TotalLifetimeRevenue: float
    TodayAppointmentsList: List[dict]
    Weekly: List[WeeklyDayAnalyticsItem] = []
    Monthly: List[MonthlyAnalyticsItem] = []

    class Config:
        from_attributes = True

class DoctorAnalyticsOut(BaseModel):
    CancellationRate: str
    NoShow: int
    PatientRetention: str
    Appointments: List[Dict[str, str]]
    Revenue: List[Dict[str, str]]

    class Config:
        from_attributes = True

class DoctorPatientItem(BaseModel):
    PatientId: Optional[str] = None
    Name: str
    Age: Optional[int] = None
    Gender: Optional[str] = None
    BloodGroup: Optional[str] = None
    Mobile: Optional[str] = None
    LastVisit: Optional[date] = None
    NextReview: Optional[date] = None
    Status: Optional[str] = None

class DoctorPatientsResponse(BaseModel):
    TotalPatients: int
    NewPatients: int
    ReturningPatients: int
    FollowUpDue: int
    Patients: List[DoctorPatientItem]

    class Config:
        from_attributes = True

class DoctorAppointmentAnalyticsOut(BaseModel):
    DoctorId: str
    FilterType: str
    Year: Optional[int] = None
    TotalAppointments: int
    CompletedAppointments: int
    PendingAppointments: int
    CancelledAppointments: int
    NoShowAppointments: int
    Weekly: List[WeeklyDayAnalyticsItem] = []
    Monthly: List[MonthlyAnalyticsItem] = []

    class Config:
        from_attributes = True
