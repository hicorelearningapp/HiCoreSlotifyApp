from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.api_client import api_client

class CreatePatientWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        return WorkflowResult.waiting(reply=Reply("text", "Please type the full name of the patient:"))

    def Process(self, session: ConversationSession, message: Message):
        if not message.Text:
            return WorkflowResult.waiting()
            
        patient_name = message.Text.strip()
        
        new_patient = api_client.add_patient_by_phone(
            session.PhoneNumber,
            {"PatientName": patient_name}
        )
        
        session.WorkflowData["patient_id"] = new_patient.get("PatientId")
        session.current_workflow = "SelectDoctorWorkflow" # Bridge back into standard BookFlow
        
        return WorkflowResult.completed(reply=Reply("text", f"{patient_name} has been added! 🎉"))

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
