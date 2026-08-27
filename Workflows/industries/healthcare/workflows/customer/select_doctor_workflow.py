from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.api_client import api_client
from core.services.whatsapp_service import whatsapp as WhatsAppService
import time


class SelectDoctorWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        business_phone = session.state.BusinessPhoneNumber
        if business_phone:
            doctors = api_client.list_doctors_by_business_phone(business_phone, approved_only=True)[:9]
        else:
            doctors = api_client.list_doctors(approved_only=True)[:9]
            
        if not doctors:
            return WorkflowResult.finished(reply=Reply("text", session.translate("select_doctor_no_doctors")))
            
        if len(doctors) == 1:
            session.WorkflowData["DoctorId"] = str(doctors[0].Id)
            return WorkflowResult.completed()
            
        sections = [{
            "title": session.translate("section_available_doctors"),
            "rows": [{"id": str(d.Id), "title": "Dr. " + session.translate(d.FullName)[:20], "description": session.translate(d.Specialization)[:72] if d.Specialization else ""} for d in doctors]
        }, {
            "title": session.translate("section_options"),
            "rows": [{"id": "CANCEL_FLOW", "title": session.translate("btn_cancel"), "description": session.translate("btn_cancel_desc")}]
        }]
        
        return WorkflowResult.waiting(reply=Reply("list", session.translate("prompt_select_doctor"), sections=sections))

    def Process(self, session: ConversationSession, message: Message):
        try:
            doctor_id = message.InteractiveId or message.Text
            if not doctor_id: raise ValueError()
                
            doctor = api_client.get_doctor(doctor_id)
            if not doctor or doctor.Status != "Approved": raise ValueError()

                
            session.WorkflowData["DoctorId"] = doctor_id
            return WorkflowResult.completed()
        except (ValueError, TypeError):
            WhatsAppService.send_text(session.PhoneNumber, session.translate("prompt_invalid_doctor"))
            time.sleep(1.5)
            return self.Initialize(session)

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
