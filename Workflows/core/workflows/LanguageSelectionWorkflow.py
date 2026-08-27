from core.workflows.BaseWorkflow import Workflow
from core.workflows.workflow_models import ConversationSession, Message, WorkflowResult

class LanguageSelectionWorkflow(Workflow):
    def Initialize(self, session: ConversationSession) -> WorkflowResult:
        # Bypassed: immediately moves to the next workflow
        return WorkflowResult.completed()

    def Process(self, session: ConversationSession, message: Message) -> WorkflowResult:
        return WorkflowResult.completed()

    def Complete(self, session: ConversationSession) -> WorkflowResult:
        return WorkflowResult.success()
