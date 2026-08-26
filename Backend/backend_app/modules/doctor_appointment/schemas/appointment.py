from pydantic import BaseModel
from datetime import date, time
from typing import Optional, List
from enum import Enum
from .customer import CustomerOut
from .doctor import DoctorOut
from .payment import PaymentOut

class ConsultationTypeEnum(str, Enum):
    CLINIC = "Clinic"
    VIDEO_CONSULTATION = "VideoConsultation"
    SECOND_OPINION = "SecondOpinion"

class AppointmentStatusEnum(str, Enum):
    AVAILABLE = "Available"
    BOOKED = "Booked"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"
    RESCHEDULED = "Rescheduled"
    NO_SHOW = "NoShow"
    NOT_AVAILABLE = "NotAvailable"

class AppointmentBase(BaseModel):
    Date: date
    SlotTime: time
    Slot: int = 0
    ConsultationType: ConsultationTypeEnum = ConsultationTypeEnum.CLINIC
    Status: AppointmentStatusEnum = AppointmentStatusEnum.BOOKED
    MeetingLink: Optional[str] = None
    RemindersSent: str = ""
    ReMarks: Optional[str] = None
    ReviewDate: Optional[date] = None

class AppointmentCreate(AppointmentBase):
    DoctorId: str
    PatientId: Optional[str] = None

class ManualAppointmentCreate(BaseModel):
    DoctorId: str
    PatientName: str
    PhoneNumber: str
    Date: date
    Time: Optional[time] = None
    SlotTime: Optional[time] = None
    Type: Optional[ConsultationTypeEnum] = ConsultationTypeEnum.CLINIC
    ConsultationType: Optional[ConsultationTypeEnum] = ConsultationTypeEnum.CLINIC
    Fee: Optional[float] = None
    Reason: Optional[str] = None
    Remarks: Optional[str] = None
    MailId: Optional[str] = None

class AppointmentUpdate(BaseModel):
    Date: Optional[date] = None
    SlotTime: Optional[time] = None
    Slot: Optional[int] = None
    ConsultationType: Optional[ConsultationTypeEnum] = None
    Status: Optional[AppointmentStatusEnum] = None
    DoctorId: Optional[str] = None
    PatientId: Optional[str] = None
    ReviewDate: Optional[date] = None

class AppointmentReviewDateUpdate(BaseModel):
    ReviewDate: date

class AppointmentOut(AppointmentBase):
    Id: str
    DoctorId: str
    PatientId: Optional[str] = None
    PatientName: Optional[str] = None
    SlotStartTime: Optional[time] = None
    SlotEndTime: Optional[time] = None
    patient: Optional[CustomerOut] = None
    payments: List[PaymentOut] = []

    class Config:
        from_attributes = True

class AppointmentListResponse(BaseModel):
    TotalAppointments: str
    Completed: str
    UpComming: str
    Cancelled: str
    NoShow: str
    Appointments: List[AppointmentOut]

    class Config:
        from_attributes = True

class AppointmentStatusUpdate(BaseModel):
    Status: AppointmentStatusEnum
    ReMarks: Optional[str] = None

class BulkAppointmentStatusUpdate(BaseModel):
    AppointmentIds: List[str]
    Status: AppointmentStatusEnum
    ReMarks: Optional[str] = None

class AppointmentReschedule(BaseModel):
    Date: date
    SlotTime: time
    Slot: int
