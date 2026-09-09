from core.models.workflow_models import WorkflowResult, Reply, WorkflowStatus
from core.api_client import api_client
import core.schemas as schemas


class CollectNameWorkflow:
    def Initialize(self, session):
        # Check if customer has saved details
        customer = api_client.get_ecommerce_customer(session.PhoneNumber)
        
        # If they explicitly chose to enter new details, or no saved details
        prompt_new = session.WorkflowData.get("prompt_new_details", False)
        
        if customer and customer.get("CustomerName") and customer.get("Address") and not prompt_new:
            options = [
                {"id": "USE_SAVED", "title": "Use Saved Details"},
                {"id": "ENTER_NEW", "title": "Enter New Details"}
            ]
            reply_text = f"We have your details saved on file:\n*Name:* {customer.get('CustomerName')}\n*Address:* {customer.get('Address')}\n\nWould you like to use these saved details for this order?"
            
            # Using standard buttons format
            reply = Reply("buttons", reply_text, options=options)
            return WorkflowResult.waiting(reply)
            
        return WorkflowResult.waiting(Reply("text", "Please enter your full name:"))
        
    def Process(self, session, message):
        if message.InteractiveId == "USE_SAVED":
            customer = api_client.get_ecommerce_customer(session.PhoneNumber)
            if customer:
                session.WorkflowData["name"] = customer.get("CustomerName")
                session.WorkflowData["address"] = customer.get("Address")
            session.WorkflowData["use_saved_details"] = True
            return WorkflowResult.completed()
            
        elif message.InteractiveId == "ENTER_NEW":
            session.WorkflowData["prompt_new_details"] = True
            return self.Initialize(session)
            
        if message.Text:
            session.WorkflowData["name"] = message.Text
            # Update customer if exists, or create
            customer = api_client.get_ecommerce_customer(session.PhoneNumber)
            if not customer:
                api_client.create_ecommerce_customer({
                    "CustomerName": message.Text, 
                    "Name": message.Text, 
                    "PhoneNumber": session.PhoneNumber
                })
            else:
                api_client.update_ecommerce_customer(session.PhoneNumber, {"CustomerName": message.Text, "Name": message.Text})
            return WorkflowResult.completed()
            
        return WorkflowResult.waiting(Reply("text", "Please provide a valid name."))

    def Complete(self, session):
        return WorkflowResult.completed()
