from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import (
    ConversationSession,
    Message,
    WorkflowResult,
    Reply,
)
from core.api_client import api_client
import re


class CollectEmailWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        # Skip email collection for In-Person consultations
        if session.WorkflowData.get("ConsultationType") in ("Clinic", "SecondOpinion"):
            return WorkflowResult.completed()
            
        customer = api_client.get_customer_by_phone(session.PhoneNumber)

        # If the customer already has an email on file, ask for confirmation
        if customer and customer.get("EmailAddress"):
            session.WorkflowData["email_step"] = "confirming_email"
            session.WorkflowData["current_email"] = customer.get("EmailAddress")
            return self._send_confirmation_prompt(session, customer.get("EmailAddress"))

        # Otherwise, ask for a new email
        session.WorkflowData["email_step"] = "asking_email"
        return WorkflowResult.waiting(
            reply=Reply("text", session.translate("prompt_new_email"))
        )

    def _send_confirmation_prompt(self, session: ConversationSession, email: str):
        prompt_text = session.translate("prompt_confirm_email", email=email)
        return WorkflowResult.waiting(
            reply=Reply(
                message_type="buttons",
                text=prompt_text,
                options=[
                    {"id": "YES_EMAIL", "title": session.translate("btn_yes_email")},
                    {"id": "NO_EMAIL", "title": session.translate("btn_no_email")},
                ],
            )
        )

    def Process(self, session: ConversationSession, message: Message):
        step = session.WorkflowData.get("email_step")

        if step == "asking_email":
            if not message.Text:
                return WorkflowResult.waiting()

            email = message.Text.strip()
            email_pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"

            if not re.match(email_pattern, email):
                return WorkflowResult.waiting(
                    reply=Reply("text", session.translate("register_invalid_email"))
                )

            # Valid email entered, now ask for confirmation
            session.WorkflowData["email_step"] = "confirming_email"
            session.WorkflowData["current_email"] = email
            return self._send_confirmation_prompt(session, email)

        elif step == "confirming_email":
            if message.InteractiveId == "YES_EMAIL":
                # Save to database and complete
                current_email = session.WorkflowData.get("current_email")
                if current_email:
                    api_client.update_customer_email(
                        session.PhoneNumber, current_email
                    )
                return WorkflowResult.completed()

            elif message.InteractiveId == "NO_EMAIL":
                # User wants to enter a different email
                session.WorkflowData["email_step"] = "asking_email"
                return WorkflowResult.waiting(
                    reply=Reply("text", session.translate("prompt_new_email"))
                )

        return WorkflowResult.waiting()

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
