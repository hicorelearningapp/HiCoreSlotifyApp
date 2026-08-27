from core.workflows.BaseWorkflow import Workflow
from core.workflows.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from backend_app.modules.doctor_appointment.services.appointment_service import AppointmentService

class DoctorPatientDetailsWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        appt_id = session.WorkflowData.get("target_appt_id")
        appointment = AppointmentService().get_appointment_by_id(appt_id)
        
        if not appointment or not appointment.patient:
            return WorkflowResult.finished(reply=Reply("text", "Could not load patient details. Type 'hi' to return to menu."))

        patient = appointment.patient
        
        details = (
            f"👤 *Patient Details*\n"
            f"Name: {patient.Name}\n"
            f"Registered Contact: {patient.PhoneNumber}\n"
            f"Consultation Type: {appointment.ConsultationType}\n"
            f"Appointment Time: {appointment.SlotTime.strftime('%I:%M %p')} on {appointment.Date.strftime('%b %d, %Y')}\n"
        )
        
        return WorkflowResult.finished(reply=Reply("text", f"{details}\n\nType 'hi' to return to the main menu."))

    def Process(self, session: ConversationSession, message: Message):
        return WorkflowResult.completed()

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
