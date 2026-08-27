from core.workflows.BaseWorkflow import Workflow
from core.workflows.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from backend_app.modules.doctor_appointment.services.customer_service import CustomerService

class CreatePatientWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        return WorkflowResult.waiting(reply=Reply("text", "Please type the full name of the patient:"))

    def Process(self, session: ConversationSession, message: Message):
        if not message.Text:
            return WorkflowResult.waiting()
            
        patient_name = message.Text.strip()
        
        customer_service = CustomerService()
        new_patient = customer_service.add_patient_by_phone(
            phone_number=session.PhoneNumber,
            patient_name=patient_name
        )
        
        session.WorkflowData["patient_id"] = new_patient.PatientId
        session.current_workflow = "SelectDoctorWorkflow" # Bridge back into standard BookFlow
        
        return WorkflowResult.completed(reply=Reply("text", f"{patient_name} has been added! 🎉"))

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
