from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.services.session_service import SessionService


class ExitWorkflow(Workflow):
    def Initialize(self, session: ConversationSession) -> WorkflowResult:
        SessionService().reset_session(session.PhoneNumber, session.state.BusinessPhoneNumber)
        return WorkflowResult.finished(
            reply=Reply("text", session.translate("exit_message"))
        )
    def Process(self, session: ConversationSession, message: Message) -> WorkflowResult:
        SessionService().reset_session(session.PhoneNumber, session.state.BusinessPhoneNumber)
        return WorkflowResult.completed()
        
    def Complete(self, session: ConversationSession) -> WorkflowResult:
        return WorkflowResult.success()
