from abc import ABC, abstractmethod
from core.workflows.workflow_models import ConversationSession, Message, WorkflowResult

from datetime import datetime

class Workflow(ABC):
    def __init__(self):
        print(f"[DEBUG] [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Executing Workflow: {self.__class__.__name__}")
    @abstractmethod
    def Initialize(self, session: ConversationSession) -> WorkflowResult:
        pass

    @abstractmethod
    def Process(self, session: ConversationSession, message: Message) -> WorkflowResult:
        pass

    @abstractmethod
    def Complete(self, session: ConversationSession) -> WorkflowResult:
        pass
