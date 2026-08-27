from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.api_client import api_client

class ConfirmCancellationWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
       
        return WorkflowResult.waiting(reply=Reply("buttons", session.translate("prompt_confirm_cancel"), options=[
            {"id": "CONFIRM_CANCEL", "title": session.translate("btn_yes_cancel")},
            {"id": "ABORT_CANCEL", "title": session.translate("btn_no_keep")}
        ]))

    def Process(self, session: ConversationSession, message: Message):
        
        if message.InteractiveId == "CONFIRM_CANCEL":
            appointment_id = session.WorkflowData.get("appointment_id_to_cancel")
            if appointment_id:
                try:
                    api_client.delete_appointment(appointment_id)
                    return WorkflowResult.completed(reply=Reply("text", session.translate("msg_cancel_success")))
                except Exception:
                    return WorkflowResult.finished(reply=Reply("text", session.translate("msg_cancel_failed")))
            return WorkflowResult.completed(reply=Reply("text", session.translate("msg_process_cancelled")))
            
        elif message.InteractiveId == "ABORT_CANCEL":
            return WorkflowResult.completed(reply=Reply("text", session.translate("msg_cancel_aborted")))
            
        return WorkflowResult.waiting()

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
