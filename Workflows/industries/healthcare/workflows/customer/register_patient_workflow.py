from core.workflows.BaseWorkflow import Workflow
from core.workflows.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from core.services.customer_service import CustomerService
import core.schemas as schemas
from core.services.language_manager import LanguageManager


class RegisterPatientWorkflow(Workflow):
    def Initialize(self, session: ConversationSession):
        customer = CustomerService().get_customer_by_phone(session.PhoneNumber)
        if customer and customer.PatientName and customer.PatientName != "Guest":
            return WorkflowResult.completed()
        return WorkflowResult.waiting(
            reply=Reply("text", session.translate("register_prompt_name"))
        )

    def Process(self, session: ConversationSession, message: Message):
        if not message.Text:
            return WorkflowResult.waiting()
            
        name = message.Text.strip()

        customer_service = CustomerService()
        customer = customer_service.get_customer_by_phone(session.PhoneNumber)
        
        if not customer:
            customer_create = schemas.CustomerCreate(CustomerName=name, PatientName=name, PhoneNumber=session.PhoneNumber)
            lang = session.state.WorkflowData.get("Language") if hasattr(session, 'state') else session.WorkflowData.get("Language")
            customer_service.create_customer(customer=customer_create, language=lang)
        else:
            customer_service.update_customer_name(session.PhoneNumber, name)

        return WorkflowResult.completed(
            reply=Reply("text", session.translate("register_thanks", name=name))
        )

    def Complete(self, session: ConversationSession):
        return WorkflowResult.success()
