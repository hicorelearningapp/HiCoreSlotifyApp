"""
Routes a natural-language message into the EXISTING deterministic booking flow.

The local LLM (nlu_service) only proposes an intent; this router does all the
real work by configuring the session's SequenceName, WorkflowIndex, and WorkflowData.
The ConversationManager will then automatically initialize the corresponding workflow.

dispatch()/route() return True when the message has been handled directly, and False to
*defer* to the normal sequence flow dispatch.
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from config import NLU_ENABLED
import core.models as models
from core.services.nlu_service import NLUService
from industries.healthcare.services.appointment_service import AppointmentService
from core.services.customer_service import CustomerService
from core.sequence.Sequence import SequenceFactory
from core.channels.whatsapp.services.whatsapp_service import whatsapp
from core.identify.IdentifyService import IdentifyServiceFactory

import core.schemas as schemas
from core.services.session_service import SessionService

# How many days ahead to scan when the user asks for the "earliest" slot.
_EARLIEST_SCAN_DAYS = 21


class NLRouter:
    def __init__(self, db: Session):
        self.db = db

    # ---------------------------------------------------------------- entry
    def dispatch(self, phone, message, session) -> bool:
        if message.get("type") != "text":
            return False

        text = message["text"]["body"]
        doctors = self.db.query(models.Doctor).all()
        extract = NLUService.extract_intent(
            text,
            today=datetime.now().date(),
            doctor_names=[d.FullName for d in doctors],
        )
        if not extract:
            # LLM unreachable / unparseable -> let the normal flow handle it.
            return False
            
        # Get customer right away
        customer = CustomerService().get_customer_by_phone(phone)
        return self.route(phone, customer, extract, session, doctors=doctors)

    def route(self, phone, customer, extract, session, doctors=None) -> bool:
        """Act on an already-extracted intent."""
        if doctors is None:
            doctors = self.db.query(models.Doctor).all()

        # A self-introduction can ride along with any intent ("hi I'm Yogeshwar...").
        customer = self._maybe_capture_name(phone, customer, extract)

        action = extract.get("action", "unknown")

        if action in ("greeting", "main_menu"):
            return self._menu(phone, session)
        if action == "view_appointments":
            return self._view(session)
        if action in ("cancel", "reschedule"):
            return self._cancel_stub(session)
        if action in ("show_slots", "book"):
            return self._booking(phone, customer, extract, session, doctors)

        # action == "unknown" -> defer so existing handlers keep working.
        return False

    # ---------------------------------------------------------------- name
    def _maybe_capture_name(self, phone, customer, extract):
        name = extract.get("customer_name")
        if name:
            if not customer:
                customer_create = schemas.CustomerCreate(CustomerName=name, PhoneNumber=phone)
                customer = CustomerService().create_customer(customer=customer_create)
                whatsapp.send_text(phone, f"Thanks {name}!")
            elif not customer.CustomerName or customer.CustomerName == "Guest":
                CustomerService().update_customer_name(phone, name)
                if hasattr(customer, 'PatientName'):
                    customer.PatientName = name
                customer.CustomerName = name
                whatsapp.send_text(phone, f"Thanks {name}!")
        return customer

    # -------------------------------------------------------------- booking
    def _booking(self, phone, customer, extract, session, doctors) -> bool:
        action = extract.get("action")
        today = datetime.now().date()
        data = session.state.WorkflowData

        # --- resolve the doctor ---
        doctor = None
        doctor_id = data.get("DoctorId") or data.get("doctor_id")
        if doctor_id:
            doctor = self.db.query(models.Doctor).filter(models.Doctor.Id == doctor_id).first()

        consult = extract.get("consultation_type") or data.get("ConsultationType") or data.get("consultation_type") or "Clinic"
        # Standardize consultation types
        if consult in ["in_person", "Clinic", "clinic"]: consult = "Clinic"
        elif consult in ["online", "Video", "video"]: consult = "Video"
        
        target_date = NLUService.resolve_date(extract, today)
        if not target_date and data.get("date"):
            try:
                target_date = datetime.strptime(data["date"], "%Y-%m-%d").date()
            except ValueError:
                target_date = None
        target_time = NLUService.resolve_time(extract)

        if not doctor:
            status, value = NLUService.match_doctor(extract.get("doctor_name"), doctors)
            if status == "found":
                doctor = value
            elif status == "not_found":
                whatsapp.send_text(
                    phone,
                    f"I couldn't find a doctor named “{extract.get('doctor_name')}”. "
                    "Please pick from our doctors:",
                )
                self._start_sequence(session, "PatientRegisterAndBookSequence", index=2, data={"ConsultationType": consult})
                return False
            elif status == "ambiguous":
                whatsapp.send_text(phone, "I found a few matching doctors — please choose one:")
                self._start_sequence(session, "PatientRegisterAndBookSequence", index=2, data={"ConsultationType": consult})
                return False
            else:  # "none" -- no doctor named
                if not doctors:
                    whatsapp.send_text(phone, "Sorry, no doctors are available right now.")
                    return self._menu(phone, session)
                if len(doctors) == 1:
                    doctor = doctors[0]
                else:
                    self._start_sequence(session, "PatientRegisterAndBookSequence", index=2, data={"ConsultationType": consult})
                    return False

        doctor_id = str(doctor.Id)

        # --- "earliest available" preference ---
        if extract.get("preference") == "earliest" and not target_time:
            found = self._earliest_slot(doctor_id, consult, today)
            if not found:
                whatsapp.send_text(
                    phone,
                    f"Dr. {doctor.FullName} has no open slots in the next {_EARLIEST_SCAN_DAYS} days.",
                )
                return self._menu(phone, session)
            target_date, target_time = found

        # Update base data
        session.state.WorkflowData["DoctorId"] = doctor_id
        session.state.WorkflowData["ConsultationType"] = consult
        
        if customer and hasattr(customer, 'PatientId') and customer.PatientId:
            session.state.WorkflowData["patient_id"] = customer.PatientId

        # --- Route to specific step based on what's missing ---
        
        # 1. Name check
        if not customer or not customer.CustomerName or customer.CustomerName == "Guest":
            self._start_sequence(session, "PatientRegisterAndBookSequence", index=0)
            whatsapp.send_text(phone, "Before I book that, what's your name?")
            return False

        # 2. Need date
        if not target_date:
            self._start_sequence(session, "PatientRegisterAndBookSequence", index=3)
            if action == "book":
                whatsapp.send_text(phone, "Sure — which day would you like?")
            return False

        # 3. Need time
        if not target_time:
            if extract.get("time"):
                whatsapp.send_text(phone, "We book in fixed time slots. Here are the available times:")
                
            slots_dt = AppointmentService().get_available_slots(target_date=target_date, doctor_id=doctor_id)
            if not slots_dt:
                whatsapp.send_text(phone, f"No slots available for {target_date.strftime('%b %d, %Y')}. Please select another date.")
                self._start_sequence(session, "PatientRegisterAndBookSequence", index=3)
                return False
                
            session.state.WorkflowData["date"] = target_date.strftime("%Y-%m-%d")
            session.state.WorkflowData["slots"] = [s["SlotTime"].strftime("%H:%M") for s in slots_dt]
            session.state.WorkflowData["page"] = 0
            self._start_sequence(session, "PatientRegisterAndBookSequence", index=4)
            return False

        # 4. We have date and time, check availability
        slots = AppointmentService().get_available_slots(target_date=target_date, doctor_id=doctor_id)
        slot_str_list = [s["SlotTime"].strftime("%H:%M") for s in slots]
        requested_str = target_time.strftime("%H:%M")

        if requested_str in slot_str_list:
            session.state.WorkflowData["date"] = target_date.strftime("%Y-%m-%d")
            session.state.WorkflowData["time"] = requested_str
            self._start_sequence(session, "PatientRegisterAndBookSequence", index=5)
            return False

        if not slots:
            whatsapp.send_text(
                phone,
                f"Dr. {doctor.FullName} isn't available on {target_date.strftime('%A, %d %b')}. "
                "Here are other dates:",
            )
            self._start_sequence(session, "PatientRegisterAndBookSequence", index=3)
            return False

        whatsapp.send_text(
            phone,
            f"Dr. {doctor.FullName} is not available at {target_time.strftime('%I:%M %p')} on {target_date.strftime('%A, %d %b')}. "
            "Here are the open times:",
        )
        session.state.WorkflowData["date"] = target_date.strftime("%Y-%m-%d")
        session.state.WorkflowData["slots"] = slot_str_list
        session.state.WorkflowData["page"] = 0
        self._start_sequence(session, "PatientRegisterAndBookSequence", index=4)
        return False

    # --------------------------------------------------------- helpers
    def _start_sequence(self, session, sequence_name: str, index: int = 0, data: dict = None):
        """Helper to safely configure session for a specific sequence transition."""
        seq = SequenceFactory.Get(sequence_name, self.db, session.state.BusinessPhoneNumber)
        first_workflow_class = seq.Current(index)
        current_workflow = first_workflow_class.__name__ if first_workflow_class else ""
        
        session.state.SequenceName = sequence_name
        session.state.CurrentWorkflow = current_workflow
        session.state.WorkflowIndex = index
        session.workflow_initialized = False
        if data:
            session.state.WorkflowData.update(data)

    def _earliest_slot(self, doctor_id, consult, today):
        for i in range(_EARLIEST_SCAN_DAYS):
            d = today + timedelta(days=i)
            slots = AppointmentService().get_available_slots(target_date=d, doctor_id=doctor_id)
            if slots:
                first = slots[0]
                # Combine with date just to extract datetime objects safely if needed
                return d, first["SlotTime"]
        return None

    # ------------------------------------------------------ view / cancel / menu
    def _view(self, session) -> bool:
        self._start_sequence(session, "PatientViewSequence", index=0)
        return False

    def _cancel_stub(self, session) -> bool:
        self._start_sequence(session, "PatientCancelSequence", index=0)
        return False

    def _identify(self, phone: str, business_phone_number: str = None):
        """Resolve the industry's IdentifyService for this business."""
        config = (
            BusinessManager.get_config(self.db, business_phone_number)
            if business_phone_number
            else BusinessManager._load_default_config()
        )
        industry = config.get("industry", "default")
        return IdentifyServiceFactory.get_service(industry).identify_user(
            phone, business_phone_number
        )

    def _handle_restart_flow(self, customer_phone: str, session) -> bool:
        """Restarts the session explicitly."""
        SessionService().reset_session(customer_phone)
        from core.config.BusinessManager import BusinessManager
        business_phone = session.state.BusinessPhoneNumber if session else None
        config = BusinessManager.get_config(self.db, business_phone) if business_phone else BusinessManager._load_default_config()
        industry = config.get("industry", "default")
        user = IdentifyServiceFactory.get_service(industry).identify_user(customer_phone, business_phone)
        sequence_name = SequenceFactory.GetSequenceName(user.UserType, self.db, session.state.BusinessPhoneNumber)
        session = SessionService.load_session(customer_phone, session.state.BusinessPhoneNumber) # This creates a fresh one
        self._start_sequence(session, sequence_name, index=0)
        return False

    def _menu(self, phone, session) -> bool:
        from core.config.BusinessManager import BusinessManager
        business_phone = session.state.BusinessPhoneNumber if session else None
        config = BusinessManager.get_config(self.db, business_phone) if business_phone else BusinessManager._load_default_config()
        industry = config.get("industry", "default")
        user = IdentifyServiceFactory.get_service(industry).identify_user(phone, business_phone)
        

        sequence_name = SequenceFactory.GetSequenceName(user.UserType, self.db, session.state.BusinessPhoneNumber)
        
        session.state.WorkflowData = user.WorkflowData
        self._start_sequence(session, sequence_name, index=0)
        return False
