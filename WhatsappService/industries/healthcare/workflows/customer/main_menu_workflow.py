from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.services.whatsapp_service import whatsapp as WhatsAppService
from core.api_client import api_client
import time

class MainMenuWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        
        patients = api_client.get_profiles_by_phone(session.PhoneNumber) or []
        patient_ids = [p.get("PatientId") for p in patients]
        
        all_appointments = []
        for pid in patient_ids:
            res = api_client.list_appointments(patient_id=pid) or []
            if isinstance(res, dict):
                res = res.get("Appointments") or res.get("items") or []
            all_appointments.extend(res)
            
        all_appointments.sort(key=lambda x: (x.get("Date", ""), x.get("SlotTime", "")))
        if not all_appointments:
            options = [{"id": "BOOK_APPOINTMENT", "title": "Book Appointment"}]
        else:
            options = [
                {"id": "BOOK_APPOINTMENT", "title": "Book Appointment"},
                {"id": "VIEW_APPOINTMENTS", "title": "View Appointments"},
                {"id": "CANCEL_APPOINTMENT", "title": "Cancel Appointment"}
            ]
            
        WhatsAppService.send_interactive_buttons(
            phone=session.PhoneNumber,
            text="How can I help you today?",
            buttons=options,
            business_phone_id=session.state.BusinessPhoneNumberId
        )
        
        from config import LANGUAGE_SELECTION_ENABLED
        if LANGUAGE_SELECTION_ENABLED:
            lang_options = [{"id": "CHANGE_LANGUAGE", "title": "🌐 Change Language"}]
            return WorkflowResult.waiting(
                reply=Reply("buttons", "Would you like to change the language?", options=lang_options)
            )
        else:
            return WorkflowResult.waiting()

    def Process(self, session: ConversationSession, message: Message):
        if not message.InteractiveId:
            WhatsAppService.send_text(session.PhoneNumber, "Please select a valid option.", business_phone_id=session.state.BusinessPhoneNumberId)
            time.sleep(1.5)
            return self.Initialize(session)

        button_id = message.InteractiveId
        
        if button_id == "BOOK_APPOINTMENT":
            session.sequence_name = "PatientRegisterAndBookSequence"
            
        elif button_id == "VIEW_APPOINTMENTS":
            session.sequence_name = "PatientViewSequence"
            
        elif button_id == "CANCEL_APPOINTMENT":
            session.sequence_name = "PatientCancelSequence"
            
        elif button_id == "CHANGE_LANGUAGE":
            session.sequence_name = "PatientMainWorkSequence"
            session.state.WorkflowIndex = -1 # Next will route to Language Selection Workflow index 0
            session.state.WorkflowData["ForceLanguageSelection"] = True
        else:
            return WorkflowResult.waiting(reply=Reply("text", "Please select a valid option."))

        session.current_workflow = "SEQUENCE_CHANGED"
        session.state.WorkflowIndex = 0
        
        session.state.Initialized = False
        return WorkflowResult.completed()

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
