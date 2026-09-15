from abc import ABC, abstractmethod
from core.utils.logging_utils import debug
from core.models.workflow_models import ConversationSession, Message, WorkflowResult

from datetime import datetime

class Workflow(ABC):
    def __init__(self):
        debug(f"Executing Workflow: {self.__class__.__name__}")
    @abstractmethod
    def Initialize(self, session: ConversationSession) -> WorkflowResult:
        pass

    @abstractmethod
    def Process(self, session: ConversationSession, message: Message) -> WorkflowResult:
        pass

    @abstractmethod
    def Complete(self, session: ConversationSession) -> WorkflowResult:
        pass
