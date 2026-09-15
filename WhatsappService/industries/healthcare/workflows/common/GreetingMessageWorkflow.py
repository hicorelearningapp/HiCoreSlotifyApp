from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from config import PUBLIC_BASE_URL
from core.api_client import api_client
import urllib.parse


class GreetingMessageWorkflow(Workflow):
    def Initialize(self, session: ConversationSession) -> WorkflowResult:
        from core.SequenceFactory import SequenceFactory
        role = session.WorkflowData.get("role", "customer")
        user_name = session.WorkflowData.get("name") or ((c := api_client.get_customer_by_phone(session.PhoneNumber)) and (c.get("CustomerName") or c.get("PatientName")))

        if role == "admin":
            greeting = "👋 Welcome back, Admin!\n\nYou have full access to the HiCore system. Please select an option from the menu to continue."
        elif role != "customer" and user_name:
            greeting = f"Welcome back, {user_name}!"
        elif user_name:
            greeting = f"Welcome back, {user_name}!"
        else:
            greeting = "Welcome to the automated booking system!"
            
        business_phone = session.state.BusinessPhoneNumber
        welcome_message_override = SequenceFactory.get_setting(business_phone, "welcome_message_override")
        if welcome_message_override and not user_name:
            greeting = welcome_message_override

        if role != "admin":
            image_filename = SequenceFactory.get_setting(business_phone, "welcome_image_filename", "Welcome to HiCore Image English.jpeg")
            if not image_filename:
                return WorkflowResult.completed(
                    reply=Reply(message_type="text", text=greeting)
                )
            industry = session.WorkflowData.get("industry", "healthcare")
            image_url = f"{PUBLIC_BASE_URL}/industries/{industry}/images/{urllib.parse.quote(image_filename)}"
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
