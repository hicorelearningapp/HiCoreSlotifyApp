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
            res = api_client.list_appointments(patient_id=pid)
            if res and isinstance(res, dict) and "Appointments" in res:
                all_appointments.extend(res["Appointments"])
            elif res and isinstance(res, dict) and "items" in res:
                all_appointments.extend(res["items"])
            elif isinstance(res, list):
                all_appointments.extend(res)
        all_appointments.sort(key=lambda x: (x.get("Date", ""), x.get("SlotTime", "")))
            
        if not all_appointments:
            options = [{"id": "BOOK_APPOINTMENT", "title": session.translate("btn_book_appointment")}]
        else:
            options = [
                {"id": "BOOK_APPOINTMENT", "title": session.translate("btn_book_appointment")},
                {"id": "VIEW_APPOINTMENTS", "title": session.translate("btn_view_appointments")},
                {"id": "CANCEL_APPOINTMENT", "title": session.translate("btn_cancel_appointment")}
            ]
            
        WhatsAppService.send_interactive_buttons(
            phone=session.PhoneNumber,
            text=session.translate("main_menu_greeting"),
            buttons=options
        )
        
        from config import LANGUAGE_SELECTION_ENABLED
        if LANGUAGE_SELECTION_ENABLED:
            lang_options = [{"id": "CHANGE_LANGUAGE", "title": session.translate("btn_change_language")}]
            return WorkflowResult.waiting(
                reply=Reply("buttons", session.translate("change_language_prompt"), options=lang_options)
            )
        else:
            return WorkflowResult.waiting()

    def Process(self, session: ConversationSession, message: Message):
        if not message.InteractiveId:
            WhatsAppService.send_text(session.PhoneNumber, session.translate("invalid_option"))
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
            return WorkflowResult.waiting(reply=Reply("text", session.translate("invalid_option")))

        session.current_workflow = "SEQUENCE_CHANGED"
        session.state.WorkflowIndex = 0
        
        session.state.Initialized = False
        return WorkflowResult.completed()

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
