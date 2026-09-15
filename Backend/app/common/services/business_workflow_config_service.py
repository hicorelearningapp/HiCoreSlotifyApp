import os
import json
import re
import logging
from typing import Optional, Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.common.schemas.business import IndustryTypeEnum

logger = logging.getLogger("uvicorn")


class BusinessWorkflowConfigService:
    @staticmethod
    def clean_phone(phone: Optional[str]) -> Optional[str]:
        if not phone:
            return None
        clean = re.sub(r"\D", "", str(phone).strip())
        if clean.startswith("0") and len(clean) > 10:
            clean = clean[1:]
        return clean if clean else None

    @classmethod
    def normalize_industry(cls, raw_industry: Optional[str]) -> Tuple[str, str]:
        """
        Returns (pascal_case_name, folder_name) strictly mapped to IndustryTypeEnum values.
        Directory name is exactly the IndustryType in PascalCase.
        e.g. 'doctor_appointment' -> ('HealthcareDoctorAppointment', 'HealthcareDoctorAppointment')
             'ecommerce' -> ('Ecommerce', 'Ecommerce')
             'salon' -> ('Salon', 'Salon')
        """
        if not raw_industry:
            default_val = IndustryTypeEnum.HealthcareDoctorAppointment.value
            return (default_val, default_val)

        if isinstance(raw_industry, IndustryTypeEnum):
            return (raw_industry.value, raw_industry.value)

        ind_clean = str(raw_industry).strip()

        # Direct match against IndustryTypeEnum members
        for member in IndustryTypeEnum:
            if ind_clean.lower() == member.value.lower() or ind_clean.lower() == member.name.lower():
                return (member.value, member.value)

        lower_ind = ind_clean.lower().replace("-", "_").replace(" ", "_")

        if lower_ind in [
            "doctor_appointment", "doctorappointment", "healthcare",
            "doctor", "health", "healthcare_doctor_appointment",
            "healthcaredoctorappointment", "clinic", "hospital"
        ]:
            enum_val = IndustryTypeEnum.HealthcareDoctorAppointment.value
        elif lower_ind in ["ecommerce", "e_commerce", "ecom", "e_com"]:
            enum_val = IndustryTypeEnum.Ecommerce.value
        elif lower_ind in ["salon", "salons", "beauty", "spa", "parlour", "barber"]:
            enum_val = IndustryTypeEnum.Salon.value
        elif lower_ind in ["hospitality", "hotel", "hotels", "restaurant", "restaurants", "resort", "cafe"]:
            enum_val = IndustryTypeEnum.Hospitality.value
        elif lower_ind in ["fitness", "gym", "gyms", "workout", "trainer"]:
            enum_val = IndustryTypeEnum.Fitness.value
        elif lower_ind in ["retail", "shop", "shops", "store", "stores", "shopping", "mart"]:
            enum_val = IndustryTypeEnum.Retail.value
        else:
            enum_val = IndustryTypeEnum.Other.value

        return (enum_val, enum_val)

    @classmethod
    def get_backend_configs_dir(cls, industry: str = IndustryTypeEnum.HealthcareDoctorAppointment.value) -> str:
        # File: Backend/app/common/services/business_workflow_config_service.py
        # 1: services, 2: common, 3: app, 4: Backend
        backend_dir = os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        )
        if industry and str(industry).lower() in ["ecommerce", "e_commerce", "ecom", IndustryTypeEnum.Ecommerce.value.lower()]:
            target_dir = os.path.join(backend_dir, "industry_configs", "Ecommerce", "Businesses")
        else:
            target_dir = os.path.join(backend_dir, "industry_configs", industry)
        os.makedirs(target_dir, exist_ok=True)
        return target_dir

    @classmethod
    def build_generic_industry_config(cls, industry_pascal: str) -> Dict[str, Any]:
        """
        Builds empty template for non-HealthcareDoctorAppointment industries:
        {
          "industry": "<IndustryName>",
          "settings": {},
          "user_type_mappings": {},
          "number": {},
          "sequences": {}
        }
        """
        return {
            "industry": industry_pascal,
            "settings": {},
            "user_type_mappings": {},
            "number": {},
            "sequences": {}
        }

    @classmethod
    def build_doctor_appointment_config(
        cls,
        business: Any,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Builds the HealthcareDoctorAppointment / Healthcare workflow configuration dictionary.
        """
        b_data = getattr(business, "BusinessData", None) or {}
        if not isinstance(b_data, dict):
            b_data = {}

        # 1. Admin phone numbers
        biz_phone = cls.clean_phone(getattr(business, "BusinessPhoneNumber", None))
        mobile_phone = cls.clean_phone(getattr(business, "MobileNumber", None))
        admin_phones = []
        if biz_phone:
            admin_phones.append(biz_phone)
        if mobile_phone and mobile_phone not in admin_phones:
            admin_phones.append(mobile_phone)

        # 2. Doctor phone numbers
        doctor_phones: List[str] = []
        if db and biz_phone:
            try:
                from app.modules.doctor_appointment.models.doctor import Doctor
                from app.core.phone_utils import build_phone_filter
                doctors = db.query(Doctor).filter(build_phone_filter(Doctor.BusinessPhoneNumber, biz_phone)).all()
                for doc in doctors:
                    cleaned_doc_phone = cls.clean_phone(doc.MobileNumber or doc.WhatsAppNumber)
                    if cleaned_doc_phone and cleaned_doc_phone not in doctor_phones:
                        doctor_phones.append(cleaned_doc_phone)
            except Exception as e:
                logger.warning(f"Could not load doctors from DB: {e}")

        # Check if doctors provided in BusinessData
        if "doctor_phones" in b_data and isinstance(b_data["doctor_phones"], list):
            for p in b_data["doctor_phones"]:
                c_p = cls.clean_phone(p)
                if c_p and c_p not in doctor_phones:
                    doctor_phones.append(c_p)

        # 3. Settings
        open_time = (
            b_data.get("open_time")
            or b_data.get("business_hours", {}).get("open")
            or "09:00"
        )
        close_time = (
            b_data.get("close_time")
            or b_data.get("business_hours", {}).get("close")
            or "17:00"
        )
        interval_min = int(
            b_data.get("appointment_slot_duration")
            or b_data.get("appointment_interval_minutes")
            or 10
        )
        welcome_override = (
            b_data.get("welcome_message_override")
            or b_data.get("WelcomeMessageOverride")
            or None
        )
        welcome_image = (
            b_data.get("welcome_image_filename")
            or b_data.get("WelcomeImageFilename")
            or "Welcome to HiCore Image English.jpeg"
        )
        max_bookings = int(b_data.get("max_bookings_per_slot", 1))
        buffer_min = int(b_data.get("customer_appointment_buffer_minutes", 60))
        lang_sel = bool(b_data.get("language_selection_enabled", False))
        time_out_en = bool(b_data.get("time_out_enabled", True))
        session_timeout = int(b_data.get("session_timeout_minutes", 10))

        config_data = {
            "industry": IndustryTypeEnum.HealthcareDoctorAppointment.value,
            "settings": {
                "welcome_message_override": welcome_override,
                "welcome_image_filename": welcome_image,
                "business_hours": {
                    "open": str(open_time),
                    "close": str(close_time)
                },
                "appointment_interval_minutes": interval_min,
                "max_bookings_per_slot": max_bookings,
                "customer_appointment_buffer_minutes": buffer_min,
                "language_selection_enabled": lang_sel,
                "time_out_enabled": time_out_en,
                "session_timeout_minutes": session_timeout,
            },
            "user_type_mappings": {
                "ADMIN": "AdminFlow",
                "DOCTOR": "DoctorFlow",
                "PATIENT": "PatientMainWorkSequence"
            },
            "number": {
                "doctor": doctor_phones,
                "admin": admin_phones
            },
            "sequences": {
                "PatientMainWorkSequence": [
                    "GreetingMessageWorkflow",
                    "MainMenuWorkflow"
                ],
                "PatientRegisterAndBookSequence": [
                    "RegisterPatientWorkflow",
                    "SelectPatientWorkflow",
                    "SelectDoctorWorkflow",
                    "SelectConsultationWorkflow",
                    "SelectDateWorkflow",
                    "SelectTimeSlotWorkflow",
                    "CollectEmailWorkflow",
                    "ProcessPaymentWorkflow",
                    "ConfirmBookingWorkflow",
                    "ExitWorkflow"
                ],
                "PatientViewSequence": [
                    "ViewAppointmentsWorkflow",
                    "ExitWorkflow"
                ],
                "PatientCancelSequence": [
                    "SelectAppointmentToCancelWorkflow",
                    "ConfirmCancellationWorkflow",
                    "ExitWorkflow"
                ],
                "DoctorFlow": [
                    "GreetingMessageWorkflow",
                    "DoctorMenuWorkflow"
                ],
                "DoctorScheduleFlow": [
                    "DoctorViewScheduleWorkflow",
                    "ExitWorkflow"
                ],
                "DoctorCancelFlow": [
                    "DoctorSelectAppointmentsToCancelWorkflow",
                    "DoctorCancelAppointmentsWorkflow",
                    "DoctorCancellationConfirmationWorkflow",
                    "ExitWorkflow"
                ],
                "DoctorRefundFlow": [
                    "DoctorViewRefundsWorkflow",
                    "DoctorProcessRefundWorkflow",
                    "ExitWorkflow"
                ],
                "AdminFlow": [
                    "GreetingMessageWorkflow",
                    "AdminMenuWorkflow"
                ]
            }
        }
        return config_data

    @classmethod
    def generate_and_save_config(
        cls,
        business: Any,
        db: Optional[Session] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Generates and saves the configuration JSON file named as {business_phone}.json
        strictly inside Backend/industry_configs/{IndustryType}/
        """
        try:
            raw_industry = getattr(business, "IndustryType", IndustryTypeEnum.HealthcareDoctorAppointment.value)
            pascal_name, folder_name = cls.normalize_industry(raw_industry)

            clean_phone = cls.clean_phone(getattr(business, "BusinessPhoneNumber", None) or getattr(business, "MobileNumber", None))
            if not clean_phone:
                logger.warning("Business has no valid phone number to generate workflow config.")
                return None

            if pascal_name == IndustryTypeEnum.HealthcareDoctorAppointment.value:
                config_data = cls.build_doctor_appointment_config(business, db)
            else:
                config_data = cls.build_generic_industry_config(pascal_name)

            # Save strictly inside Backend/industry_configs/{IndustryType}/{clean_phone}.json
            backend_dir = cls.get_backend_configs_dir(folder_name)
            primary_file_path = os.path.join(backend_dir, f"{clean_phone}.json")
            with open(primary_file_path, "w", encoding="utf-8") as f:
                json.dump(config_data, f, indent=2)

            logger.info(f"Successfully generated workflow config for business {business.BusinessName} at {primary_file_path}")
            return config_data
        except Exception as e:
            logger.error(f"Error generating business workflow config: {e}")
            return None

    @classmethod
    def find_config_file(cls, phone_number: str) -> Optional[str]:
        """
        Searches Backend/industry_configs/ directory for {phone_number}.json or {phone_number}.txt
        """
        clean = cls.clean_phone(phone_number)
        if not clean:
            return None

        candidates = [f"{clean}.json", f"{clean}.txt", f"{phone_number}.json", f"{phone_number}.txt"]

        # Search strictly inside Backend/industry_configs/
        backend_dir = os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        )
        base_dir = os.path.join(backend_dir, "industry_configs")

        if os.path.exists(base_dir):
            for root, _, files in os.walk(base_dir):
                for candidate in candidates:
                    if candidate in files:
                        return os.path.join(root, candidate)

        return None

    @classmethod
    def get_config_by_phone(
        cls,
        phone_number: str,
        db: Optional[Session] = None
    ) -> Dict[str, Any]:
        """
        Retrieves the config by business phone number strictly from Backend directory.
        If missing from files, checks DB and generates.
        """
        clean = cls.clean_phone(phone_number)
        if not clean:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid business phone number provided."
            )

        file_path = cls.find_config_file(clean)
        if file_path and os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error reading config file {file_path}: {e}")

        # Fallback: Check if business is in database and generate config in Backend
        if db:
            from app.common.models.business import Business
            from app.core.phone_utils import build_phone_filter
            biz = db.query(Business).filter(
                build_phone_filter(Business.BusinessPhoneNumber, clean),
                build_phone_filter(Business.MobileNumber, clean)
            ).first()
            if biz:
                generated = cls.generate_and_save_config(biz, db)
                if generated:
                    return generated

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow configuration not found for business phone number '{phone_number}'."
        )

    @classmethod
    def get_industry_by_phone(
        cls,
        phone_number: str,
        db: Optional[Session] = None
    ) -> str:
        """
        Returns only the Industry type string from the configuration for the given business phone number.
        """
        config = cls.get_config_by_phone(phone_number, db)
        raw_ind = config.get("Industry") or config.get("industry") or IndustryTypeEnum.HealthcareDoctorAppointment.value
        pascal_name, _ = cls.normalize_industry(raw_ind)
        return pascal_name

    @classmethod
    def update_doctor_phone_in_config(
        cls,
        business_phone: str,
        doctor_phone: str,
        db: Optional[Session] = None
    ):
        """
        Appends doctor_phone to the config's number.doctor array if not already present inside Backend directory.
        """
        clean_biz = cls.clean_phone(business_phone)
        clean_doc = cls.clean_phone(doctor_phone)
        if not clean_biz or not clean_doc:
            return

        try:
            config = cls.get_config_by_phone(clean_biz, db)
            numbers = config.setdefault("number", {})
            doctors = numbers.setdefault("doctor", [])
            if clean_doc not in doctors:
                doctors.append(clean_doc)

                # Save back to file strictly inside Backend/industry_configs/
                file_path = cls.find_config_file(clean_biz)
                if not file_path:
                    backend_dir = cls.get_backend_configs_dir(IndustryTypeEnum.HealthcareDoctorAppointment.value)
                    file_path = os.path.join(backend_dir, f"{clean_biz}.json")

                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(config, f, indent=2)
        except Exception as e:
            logger.warning(f"Could not update doctor phone in config for business {business_phone}: {e}")
