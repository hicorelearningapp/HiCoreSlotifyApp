from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.api_client import api_client


class RegisterPatientWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        customer = api_client.get_customer_by_phone(session.PhoneNumber)
        if customer and customer.get("PatientName") and customer.get("PatientName") != "Guest":
            return WorkflowResult.completed()
        return WorkflowResult.waiting(
            reply=Reply("text", session.translate("register_prompt_name"))
        )

    def Process(self, session: ConversationSession, message: Message):
        if not message.Text:
            return WorkflowResult.waiting()
            
        name = message.Text.strip()

        customer = api_client.get_customer_by_phone(session.PhoneNumber)
        
        if not customer:
            customer_create = {"CustomerName": name, "PatientName": name, "PhoneNumber": session.PhoneNumber}
            lang = session.state.WorkflowData.get("Language") if hasattr(session, 'state') else session.WorkflowData.get("Language")
            # Wait, api_client.create_customer doesn't take `language` right now, I'll pass it in the dict if needed
            api_client.create_customer(data=customer_create)
        else:
            api_client._request("PATCH", f"/customers/by-phone/{session.PhoneNumber}/name", params={"patient_name": name})

        return WorkflowResult.completed(
            reply=Reply("text", session.translate("register_thanks", name=name))
        )

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
