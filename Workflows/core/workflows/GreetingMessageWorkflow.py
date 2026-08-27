from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from backend_app.core.database import db_session
from config import SERVER_BASE_URL
import urllib.parse

class GreetingMessageWorkflow(Workflow):
    def Initialize(self, session: ConversationSession) -> WorkflowResult:
        from core.Sequence import SequenceFactory
        role = session.WorkflowData.get("role", "customer")
        user_name = session.WorkflowData.get("name")
        
        if role == "admin":
            greeting = session.translate("greeting_admin")
        elif role != "customer" and user_name:
            greeting = session.translate("greeting_staff", staff_name=user_name, role=role)
        elif user_name:
            greeting = session.translate("greeting_customer", user_name=user_name)
        else:
            greeting = session.translate("greeting_image_caption")
            
        business_phone = session.state.BusinessPhoneNumber
        welcome_message_override = SequenceFactory.get_setting(db_session, business_phone, "welcome_message_override")
        if welcome_message_override and not user_name:
            greeting = welcome_message_override

        if role != "admin":
            image_filename = SequenceFactory.get_setting(db_session, business_phone, "welcome_image_filename", "Welcome to HiCore Image English.jpeg")
            if not image_filename:
                return WorkflowResult.completed(
                    reply=Reply(message_type="text", text=greeting)
                )
            industry = session.WorkflowData.get("industry", "healthcare")
            image_url = f"{SERVER_BASE_URL}/industries/{industry}/images/{urllib.parse.quote(image_filename)}"
            return WorkflowResult.completed(
                reply=Reply(message_type="image", text=greeting, image_url=image_url)
            )

        return WorkflowResult.completed(
            reply=Reply(message_type="text", text=greeting)
        )

    def Process(self, session: ConversationSession, message: Message) -> WorkflowResult:
        return WorkflowResult.completed()

    def Complete(self, session: ConversationSession) -> WorkflowResult:
        return WorkflowResult.success()
