from enum import Enum
from typing import Optional, Any

class Message:
    def __init__(self, phone_number: str, text: str | None = None, interactive_id: str | None = None, business_phone_number: str | None = None, business_phone_number_id: str | None = None):
        self.PhoneNumber = phone_number
        self.Text = text
        self.InteractiveId = interactive_id
        self.BusinessPhoneNumber = business_phone_number
        self.BusinessPhoneNumberId = business_phone_number_id

from pydantic import BaseModel, Field

class SessionState(BaseModel):
    SequenceName: str = ""
    CurrentWorkflow: str = ""
    WorkflowIndex: int = 0
    UserType: str = "PATIENT"
    WorkflowData: dict = Field(default_factory=dict)
    Initialized: bool = False
    BusinessPhoneNumber: str = ""
    BusinessPhoneNumberId: str = ""

class ConversationSession:
    def __init__(self, phone_number: str, state: SessionState):
        self.PhoneNumber = phone_number
        self.state = state

    @property
    def sequence_name(self) -> str:
        return self.state.SequenceName

    @sequence_name.setter
    def sequence_name(self, value: str):
        self.state.SequenceName = value

    @property
    def current_workflow(self) -> str:
        return self.state.CurrentWorkflow

    @current_workflow.setter
    def current_workflow(self, value: str):
        self.state.CurrentWorkflow = value

    @property
    def WorkflowData(self) -> dict:
        return self.state.WorkflowData

    @WorkflowData.setter
    def WorkflowData(self, value: dict):
        self.state.WorkflowData = value

    @property
    def workflow_initialized(self) -> bool:
        return self.state.Initialized

    @workflow_initialized.setter
    def workflow_initialized(self, value: bool):
        self.state.Initialized = value

    def translate(self, key: str, default: str | None = None, **kwargs) -> str:
        import os, json
        industry = self.WorkflowData.get("industry", "healthcare") if self.state else "healthcare"
        locale_path = os.path.join(os.path.dirname(__file__), "..", "..", "industries", industry, "locales", "en.json")
        template = default or key
        if os.path.exists(locale_path):
            try:
                with open(locale_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    template = data.get(key, default or key)
            except Exception:
                pass
        if kwargs:
            try:
                return template.format(**kwargs)
            except Exception:
                return template
        return str(template)

class WorkflowStatus(Enum):
    WAITING = "WAITING"
    SUCCESS = "SUCCESS"
    COMPLETED = "COMPLETED"
    FINISHED = "FINISHED"

class Reply:
    """Standardized reply object to pass back to the Conversation Manager"""
    def __init__(self, message_type: str, text: str, options: list | None = None, sections: list | None = None, image_url: str | None = None, button_text: str = "Select Option", carousel_cards: list | None = None):
        self.message_type = message_type
        self.text = text
        self.options = options
        self.sections = sections
        self.image_url = image_url
        self.button_text = button_text
        self.carousel_cards = carousel_cards

class WorkflowResult:
    def __init__(self, status: WorkflowStatus, reply: Optional[Reply] = None):
        self.status = status
        self.reply = reply

    @staticmethod
    def waiting(reply=None):
        return WorkflowResult(WorkflowStatus.WAITING, reply)

    @staticmethod
    def success():
        return WorkflowResult(WorkflowStatus.SUCCESS)

    @staticmethod
    def completed(reply=None):
        return WorkflowResult(WorkflowStatus.COMPLETED, reply)

    @staticmethod
    def finished(reply=None):
        return WorkflowResult(WorkflowStatus.FINISHED, reply)
