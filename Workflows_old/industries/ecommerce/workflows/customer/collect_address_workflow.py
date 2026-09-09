from core.models.workflow_models import WorkflowResult, Reply, WorkflowStatus
from core.api_client import api_client
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
            customer = api_client.get_ecommerce_customer(session.PhoneNumber)
            if customer:
                api_client.update_ecommerce_customer(session.PhoneNumber, {"Address": message.Text})
            return WorkflowResult.completed()
            
        return WorkflowResult.waiting(Reply("text", "Please provide a valid address."))

    def Complete(self, session):
        return WorkflowResult.completed()
