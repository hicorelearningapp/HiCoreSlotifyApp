
from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.api_client import api_client


class SelectDoctorWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        business_phone = session.state.BusinessPhoneNumber
        if business_phone:
            doctors = api_client.list_doctors_by_business_phone(business_phone, approved_only=False)[:9]
        else:
            doctors = api_client.list_doctors(approved_only=False)[:9]
            
        if not doctors:
            return WorkflowResult.finished(reply=Reply("text", session.translate("select_doctor_no_doctors")))
            
        if len(doctors) == 1 and doctors[0].get("Status") == "Approved":
            session.WorkflowData["DoctorId"] = str(doctors[0].get("Id"))
            return WorkflowResult.completed()
            
        sections = [{
            "title": session.translate("section_available_doctors"),
            "rows": [{"id": str(d.get("Id")), "title": "Dr. " + session.translate(d.get("FullName", ""))[:20], "description": session.translate(d.get("Specialization"))[:72] if d.get("Specialization") else ""} for d in doctors]
        }, {
            "title": session.translate("section_options"),
            "rows": [{"id": "CANCEL_FLOW", "title": session.translate("btn_cancel"), "description": session.translate("btn_cancel_desc")}]
        }]
        
        prompt = session.translate("prompt_select_doctor")
        if session.WorkflowData.get("doctor_error"):
            prompt = session.WorkflowData.pop("doctor_error") + "\n\n" + prompt
            
        return WorkflowResult.waiting(reply=Reply("list", prompt, sections=sections))

    def Process(self, session: ConversationSession, message: Message):
        try:
            doctor_id = message.InteractiveId or message.Text
            if not doctor_id: raise ValueError()
                
            doctor = api_client.get_doctor(doctor_id)
            if not doctor: raise ValueError()

            if doctor.get("Status") != "Approved":
                session.WorkflowData["doctor_error"] = f"Dr. {doctor.get('FullName')} is currently not available for booking."
                return self.Initialize(session)
                
            session.WorkflowData["DoctorId"] = doctor_id
            return WorkflowResult.completed()
        except (ValueError, TypeError):
            session.WorkflowData["doctor_error"] = session.translate("prompt_invalid_doctor")
            return self.Initialize(session)

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
