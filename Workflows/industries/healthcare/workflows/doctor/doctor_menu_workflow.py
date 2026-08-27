from core.workflows.BaseWorkflow import Workflow
from core.workflows.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.channels.whatsapp.services.whatsapp_service import whatsapp as WhatsAppService
from backend_app.modules.doctor_appointment.services.doctor_service import DoctorService
import time

class DoctorMenuWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        doctor_id = session.WorkflowData.get("doctor_id")
        name = DoctorService().get_doctor_first_name(doctor_id) if doctor_id else "Doctor"
        reply = Reply(
            message_type="buttons",
            text=f"What would you like to do?",
            options=[
                {"id": "DOC_VIEW_SCHEDULE", "title": "View Schedule"},
                {"id": "DOC_CANCEL_APPT", "title": "Cancel Appointment"}
            ]
        )
        return WorkflowResult.waiting(reply=reply)

    def Process(self, session: ConversationSession, message: Message):
        if not message.InteractiveId:
            WhatsAppService.send_text(session.PhoneNumber, "Please select a valid option.")
            time.sleep(1.5)
            return self.Initialize(session)

        if message.InteractiveId == "DOC_VIEW_SCHEDULE":
            session.state.SequenceName = "DoctorScheduleFlow"
            session.current_workflow = "DoctorViewScheduleWorkflow"
            session.state.WorkflowIndex = 0
            return WorkflowResult.completed()
        elif message.InteractiveId == "DOC_CANCEL_APPT":
            session.state.SequenceName = "DoctorCancelFlow"
            session.current_workflow = "DoctorSelectAppointmentsToCancelWorkflow"
            session.state.WorkflowIndex = 0
            return WorkflowResult.completed()

        return WorkflowResult.waiting()

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
