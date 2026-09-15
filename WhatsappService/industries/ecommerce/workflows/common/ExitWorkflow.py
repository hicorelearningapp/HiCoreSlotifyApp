from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.services.session_service import SessionService


class ExitWorkflow(Workflow):
    def Initialize(self, session: ConversationSession) -> WorkflowResult:
        SessionService().reset_session(session.PhoneNumber, session.state.BusinessPhoneNumber)
        return WorkflowResult.end_sequence(
            reply=Reply("text", "Thank you for using the HiCore Appointment System! 🏥\n\nWhenever you are ready to book another appointment, view your schedule, or manage existing appointments, simply type 'hi' to start a new conversation.")
        )
    def Process(self, session: ConversationSession, message: Message) -> WorkflowResult:
        SessionService().reset_session(session.PhoneNumber, session.state.BusinessPhoneNumber)
        return WorkflowResult.completed()
        
    def Complete(self, session: ConversationSession) -> WorkflowResult:
        return WorkflowResult.success()
