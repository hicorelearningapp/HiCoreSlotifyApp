from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.api_client import api_client

class ConfirmCancellationWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
       
        return WorkflowResult.waiting(reply=Reply("buttons", "Are you sure you want to cancel this appointment?", options=[
            {"id": "CONFIRM_CANCEL", "title": "Yes, Cancel It"},
            {"id": "ABORT_CANCEL", "title": "No, Keep It"}
        ]))

    def Process(self, session: ConversationSession, message: Message):
        
        if message.InteractiveId == "CONFIRM_CANCEL":
            appointment_id = session.WorkflowData.get("appointment_id_to_cancel")
            if appointment_id:
                try:
                    api_client.delete_appointment(appointment_id)
                    return WorkflowResult.completed(reply=Reply("text", "Your appointment has been successfully cancelled. Have a great day!"))
                except Exception:
                    return WorkflowResult.end_sequence(reply=Reply("text", "Sorry, there was an issue cancelling your appointment. Please try again or contact support."))
            return WorkflowResult.completed(reply=Reply("text", "Process cancelled."))
            
        elif message.InteractiveId == "ABORT_CANCEL":
            return WorkflowResult.completed(reply=Reply("text", "Cancellation aborted. Your appointment is kept."))
            
        return WorkflowResult.waiting()

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
