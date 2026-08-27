from core.workflows.workflow_models import WorkflowResult, Reply, WorkflowStatus
from backend_app.modules.ecommerce.services.customer_service import CustomerService
import core.schemas as schemas

class CollectAddressWorkflow:
    def Initialize(self, session):
        if session.WorkflowData.get("use_saved_details"):
            return WorkflowResult.completed()
            
        reply = Reply("text", "Please reply with your full delivery address:")
        return WorkflowResult.waiting(reply)

    def Process(self, session, message):
        if message.Text:
            session.WorkflowData["address"] = message.Text
            # Update customer if exists
            customer_service = CustomerService()
            customer = customer_service.get_customer_by_phone(session.PhoneNumber)
            if customer:
                customer_service.update_customer(customer.PatientId, schemas.CustomerUpdate(Address=message.Text))
            return WorkflowResult.completed()
            
        return WorkflowResult.waiting(Reply("text", "Please provide a valid address."))

    def Complete(self, session):
        return WorkflowResult.completed()
