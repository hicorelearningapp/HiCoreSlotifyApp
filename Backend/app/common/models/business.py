from datetime import datetime, date
from typing import Optional, Any
from sqlalchemy import Column, String, Boolean, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.core.security import generate_uuid

class Business(Base):
    __tablename__ = "businesses"

    # Common Primary & Profile Columns
    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    BusinessName = Column(String(200), nullable=False)
    IndustryType = Column(String(100), nullable=False, index=True)  # e.g., 'DoctorAppointment', 'Ecommerce', etc.
    FullName = Column(String(150), nullable=False)
    EmailAddress = Column(String(150), unique=True, nullable=False, index=True)
    MobileNumber = Column(String(20), nullable=False, index=True)
    BusinessPhoneNumber = Column(String(20), nullable=True)
    ProfilePic = Column(Text, nullable=True)
    
    # Common Address Information
    Address = Column(Text, nullable=True)
    City = Column(String(100), nullable=True)
    State = Column(String(100), nullable=True)
    Pincode = Column(String(20), nullable=True)
    Country = Column(String(100), nullable=True, default="India")

    # Common Authentication & Account Status
    UserName = Column(String(100), unique=True, nullable=False, index=True)
    Password = Column(String(255), nullable=False)
    Status = Column(String(50), default="Pending")  # 'Pending', 'Approved', 'Active', 'Suspended'
    IsVerified = Column(Boolean, default=False)

    # Dynamic JSON Column for storing business data
    BusinessData = Column(JSON, nullable=True, default=dict)

    # Common Timestamps
    CreatedAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    UpdatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Healthcare / Doctor Appointment Relationships
    appointments = relationship("Appointment", back_populates="doctor", cascade="all, delete")
    prescriptions = relationship("Prescription", back_populates="doctor", cascade="all, delete")

    # Helper for extracting from BusinessData
    def _get_bdata(self, key: str, default: Any = None) -> Any:
        bd = self.BusinessData
        if isinstance(bd, dict):
            return bd.get(key, default)
        return default

    def _set_bdata(self, key: str, val: Any):
        from sqlalchemy.orm.attributes import flag_modified
        bd = dict(self.BusinessData or {})
        bd[key] = val
        self.BusinessData = bd
        flag_modified(self, "BusinessData")

    # Healthcare / Doctor Virtual Properties for Seamless Doctor Appointment Compatibility
    @property
    def ClinicName(self) -> str:
        return self.BusinessName

    @ClinicName.setter
    def ClinicName(self, val: str):
        self.BusinessName = val

    @property
    def ClinicAddress(self) -> str:
        return self.Address or ""

    @ClinicAddress.setter
    def ClinicAddress(self, val: str):
        self.Address = val

    @property
    def ProfilePhoto(self) -> Optional[str]:
        return self.ProfilePic

    @ProfilePhoto.setter
    def ProfilePhoto(self, val: Optional[str]):
        self.ProfilePic = val

    @property
    def Qualification(self) -> str:
        return self._get_bdata("Qualification") or self._get_bdata("qualification") or ""

    @Qualification.setter
    def Qualification(self, val: str):
        self._set_bdata("Qualification", val)

    @property
    def Specialization(self) -> str:
        return self._get_bdata("Specialization") or self._get_bdata("specialization") or ""

    @Specialization.setter
    def Specialization(self, val: str):
        self._set_bdata("Specialization", val)

    @property
    def MedicalRegistrationNumber(self) -> str:
        return self._get_bdata("MedicalRegistrationNumber") or self._get_bdata("medical_registration_number") or ""

    @MedicalRegistrationNumber.setter
    def MedicalRegistrationNumber(self, val: str):
        self._set_bdata("MedicalRegistrationNumber", val)

    @property
    def YearsOfExperience(self) -> int:
        v = self._get_bdata("YearsOfExperience") or self._get_bdata("years_of_experience") or 0
        try:
            return int(v)
        except (ValueError, TypeError):
            return 0

    @YearsOfExperience.setter
    def YearsOfExperience(self, val: int):
        self._set_bdata("YearsOfExperience", val)

    @property
    def DateOfBirth(self) -> date:
        v = self._get_bdata("DateOfBirth") or self._get_bdata("date_of_birth")
        if isinstance(v, str):
            try:
                return datetime.strptime(v, "%Y-%m-%d").date()
            except Exception:
                return date.today()
        elif isinstance(v, date):
            return v
        return date.today()

    @DateOfBirth.setter
    def DateOfBirth(self, val: Any):
        if isinstance(val, (date, datetime)):
            self._set_bdata("DateOfBirth", str(val))
        else:
            self._set_bdata("DateOfBirth", val)

    @property
    def Gender(self) -> str:
        return self._get_bdata("Gender") or self._get_bdata("gender") or ""

    @Gender.setter
    def Gender(self, val: str):
        self._set_bdata("Gender", val)

    @property
    def WhatsAppNumber(self) -> Optional[str]:
        return self._get_bdata("WhatsAppNumber") or self._get_bdata("whatsapp_number") or self.BusinessPhoneNumber or self.MobileNumber

    @WhatsAppNumber.setter
    def WhatsAppNumber(self, val: Optional[str]):
        self._set_bdata("WhatsAppNumber", val)

    @property
    def ClinicConsultationFee(self) -> float:
        v = self._get_bdata("ClinicConsultationFee") or self._get_bdata("consultation_fee") or 0.0
        try:
            return float(v)
        except (ValueError, TypeError):
            return 0.0

    @ClinicConsultationFee.setter
    def ClinicConsultationFee(self, val: float):
        self._set_bdata("ClinicConsultationFee", val)

    @property
    def VideoConsultationFee(self) -> Optional[float]:
        v = self._get_bdata("VideoConsultationFee") or self._get_bdata("video_consultation_fee")
        if v is None or v == "":
            return None
        try:
            return float(v)
        except (ValueError, TypeError):
            return None

    @VideoConsultationFee.setter
    def VideoConsultationFee(self, val: Optional[float]):
        self._set_bdata("VideoConsultationFee", val)

    @property
    def SecondOpinionFee(self) -> Optional[float]:
        v = self._get_bdata("SecondOpinionFee") or self._get_bdata("second_opinion_fee")
        if v is None or v == "":
            return None
        try:
            return float(v)
        except (ValueError, TypeError):
            return None

    @SecondOpinionFee.setter
    def SecondOpinionFee(self, val: Optional[float]):
        self._set_bdata("SecondOpinionFee", val)

    @property
    def ConsultationDuration(self) -> int:
        v = self._get_bdata("ConsultationDuration") or self._get_bdata("appointment_slot_duration") or self._get_bdata("consultation_duration") or 15
        try:
            return int(v)
        except (ValueError, TypeError):
            return 15

    @ConsultationDuration.setter
    def ConsultationDuration(self, val: int):
        self._set_bdata("ConsultationDuration", val)

    @property
    def MaximumPatientsPerDay(self) -> int:
        v = self._get_bdata("MaximumPatientsPerDay") or self._get_bdata("max_patients_per_day") or 30
        try:
            return int(v)
        except (ValueError, TypeError):
            return 30

    @MaximumPatientsPerDay.setter
    def MaximumPatientsPerDay(self, val: int):
        self._set_bdata("MaximumPatientsPerDay", val)

    @property
    def WhatsAppBusinessStatus(self) -> str:
        return self._get_bdata("WhatsAppBusinessStatus") or self._get_bdata("whatsapp_business_status") or "Disconnected"

    @WhatsAppBusinessStatus.setter
    def WhatsAppBusinessStatus(self, val: str):
        self._set_bdata("WhatsAppBusinessStatus", val)

    @property
    def Monday(self) -> Optional[str]:
        return self._get_bdata("Monday") or self._get_bdata("monday")

    @Monday.setter
    def Monday(self, val: Optional[str]):
        self._set_bdata("Monday", val)

    @property
    def Tuesday(self) -> Optional[str]:
        return self._get_bdata("Tuesday") or self._get_bdata("tuesday")

    @Tuesday.setter
    def Tuesday(self, val: Optional[str]):
        self._set_bdata("Tuesday", val)

    @property
    def Wednesday(self) -> Optional[str]:
        return self._get_bdata("Wednesday") or self._get_bdata("wednesday")

    @Wednesday.setter
    def Wednesday(self, val: Optional[str]):
        self._set_bdata("Wednesday", val)

    @property
    def Thursday(self) -> Optional[str]:
        return self._get_bdata("Thursday") or self._get_bdata("thursday")

    @Thursday.setter
    def Thursday(self, val: Optional[str]):
        self._set_bdata("Thursday", val)

    @property
    def Friday(self) -> Optional[str]:
        return self._get_bdata("Friday") or self._get_bdata("friday")

    @Friday.setter
    def Friday(self, val: Optional[str]):
        self._set_bdata("Friday", val)

    @property
    def Saturday(self) -> Optional[str]:
        return self._get_bdata("Saturday") or self._get_bdata("saturday")

    @Saturday.setter
    def Saturday(self, val: Optional[str]):
        self._set_bdata("Saturday", val)

    @property
    def Sunday(self) -> Optional[str]:
        return self._get_bdata("Sunday") or self._get_bdata("sunday")

    @Sunday.setter
    def Sunday(self, val: Optional[str]):
        self._set_bdata("Sunday", val)

    @property
    def UpiId(self) -> Optional[str]:
        return self._get_bdata("UpiId") or self._get_bdata("upi_id")

    @UpiId.setter
    def UpiId(self, val: Optional[str]):
        self._set_bdata("UpiId", val)

    @property
    def AccountHolderName(self) -> Optional[str]:
        return self._get_bdata("AccountHolderName") or self._get_bdata("account_holder_name") or self.FullName

    @AccountHolderName.setter
    def AccountHolderName(self, val: Optional[str]):
        self._set_bdata("AccountHolderName", val)

    @property
    def BankName(self) -> Optional[str]:
        return self._get_bdata("BankName") or self._get_bdata("bank_name")

    @BankName.setter
    def BankName(self, val: Optional[str]):
        self._set_bdata("BankName", val)

    @property
    def IfscCode(self) -> Optional[str]:
        return self._get_bdata("IfscCode") or self._get_bdata("ifsc_code")

    @IfscCode.setter
    def IfscCode(self, val: Optional[str]):
        self._set_bdata("IfscCode", val)

    @property
    def AccountNumber(self) -> Optional[str]:
        return self._get_bdata("AccountNumber") or self._get_bdata("account_number")

    @AccountNumber.setter
    def AccountNumber(self, val: Optional[str]):
        self._set_bdata("AccountNumber", val)
