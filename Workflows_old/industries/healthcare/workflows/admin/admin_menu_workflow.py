from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply

class AdminMenuWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        reply = Reply(
            message_type="buttons",
            text="🔒 *Admin Dashboard*\n\nWelcome to the system controls.",
            options=[
                {"id": "ADMIN_STATS", "title": "View Statistics"},
                {"id": "ADMIN_BROADCAST", "title": "Broadcast Message"}
            ]
        )
        return WorkflowResult.waiting(reply=reply)

    def Process(self, session: ConversationSession, message: Message):
        return WorkflowResult.waiting(reply=Reply("text", "Admin features are currently being built. Type 'hi' to refresh."))

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
