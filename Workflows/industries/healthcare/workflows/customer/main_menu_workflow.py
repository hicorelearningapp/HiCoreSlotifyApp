from core.workflows.BaseWorkflow import Workflow
from core.workflows.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.channels.whatsapp.services.whatsapp_service import whatsapp as WhatsAppService
from backend_app.modules.doctor_appointment.services.customer_service import CustomerService
from backend_app.modules.doctor_appointment.services.appointment_service import AppointmentService
import time

class MainMenuWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        
        patients = CustomerService().get_profiles_by_phone(session.PhoneNumber)
        patient_ids = [p.PatientId for p in patients]
        
        all_appointments = []
        appt_service = AppointmentService()
        for pid in patient_ids:
            all_appointments.extend(appt_service.get_customer_appointments(pid))
            
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
