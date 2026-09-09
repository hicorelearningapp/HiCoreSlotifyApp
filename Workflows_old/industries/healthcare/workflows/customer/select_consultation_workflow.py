from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.services.whatsapp_service import whatsapp as WhatsAppService

class SelectConsultationWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        sections = [
            {
                "title": "Options",
                "rows": [
                    {"id": "Clinic", "title": "In-Person", "description": "Visit the clinic in person"},
                    {"id": "VideoConsultation", "title": "Video Consultation", "description": "Online video call"},
                    {"id": "SecondOpinion", "title": "Second Opinion", "description": "Medical second opinion"},
                    {"id": "CANCEL_FLOW", "title": " Cancel", "description": "Cancel appointment booking"}
                ]
            }
        ]
        return WorkflowResult.waiting(reply=Reply(
            message_type="list",
            text="Choose Consultation Type:",
            sections=sections,
            button_text="Select Type"
        ))

    def Process(self, session: ConversationSession, message: Message):
        consultation_type = message.InteractiveId or message.Text
        try:
            if consultation_type not in ["Clinic", "VideoConsultation", "SecondOpinion"]:
                raise ValueError("Invalid consultation type")
            
            session.WorkflowData["ConsultationType"] = consultation_type
            return WorkflowResult.completed()
        except ValueError:
            WhatsAppService.send_text(session.PhoneNumber, "Please select a valid consultation type.")
            return self.Initialize(session)

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
