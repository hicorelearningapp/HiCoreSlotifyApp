
from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.api_client import api_client


class SelectDoctorWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        business_phone = session.state.BusinessPhoneNumber
        if business_phone:
            doctors = (api_client.list_doctors_by_business_phone(business_phone, approved_only=False) or [])[:9]
        else:
            doctors = (api_client.list_doctors(approved_only=False) or [])[:9]
            
        if not doctors:
            return WorkflowResult.end_sequence(reply=Reply("text", "Sorry, no doctors are currently available for this clinic."))
            
        if len(doctors) == 1 and doctors[0].get("Status") == "Approved":
            session.WorkflowData["DoctorId"] = str(doctors[0].get("Id"))
            return WorkflowResult.completed()
            
        sections = [{
            "title": "Available Doctors",
            "rows": [{"id": str(d.get("Id")), "title": "Dr. " + d.get('FullName', '')[:20], "description": d.get('Specialization')[:72] if d.get("Specialization") else ""} for d in doctors]
        }, {
            "title": "Options",
            "rows": [{"id": "CANCEL_FLOW", "title": "❌ Cancel", "description": "Return to main menu"}]
        }]
        
        prompt = "Please choose a doctor:"
        if session.WorkflowData.get("doctor_error"):
            prompt = session.WorkflowData.pop("doctor_error") + "\n\n" + prompt
            
        return WorkflowResult.waiting(reply=Reply("list", prompt, sections=sections))

    def Process(self, session: ConversationSession, message: Message):
        try:
            doctor_id = message.InteractiveId or message.Text
            if not doctor_id: 
                print(f"[DEBUG] doctor_id is empty! message.InteractiveId={message.InteractiveId}, message.Text={message.Text}")
                raise ValueError()
                
            print(f"[DEBUG] Calling get_doctor with {doctor_id}")
            doctor = api_client.get_doctor(doctor_id)
            if not doctor: 
                print(f"[DEBUG] api_client.get_doctor returned None for {doctor_id}")
                raise ValueError()

            if doctor.get("Status") != "Approved":
                print(f"[DEBUG] Doctor status is not Approved: {doctor.get('Status')}")
                session.WorkflowData["doctor_error"] = f"Dr. {doctor.get('FullName')} is currently not available for booking."
                return self.Initialize(session)
                
            session.WorkflowData["DoctorId"] = doctor_id
            return WorkflowResult.completed()
        except Exception as e:
            print(f"[DEBUG] Exception in SelectDoctorWorkflow Process: {repr(e)}")
            session.WorkflowData["doctor_error"] = "Please select a valid doctor."
            return self.Initialize(session)

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
