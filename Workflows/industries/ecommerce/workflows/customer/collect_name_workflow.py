from core.models.workflow_models import WorkflowResult, Reply, WorkflowStatus
from backend_app.modules.ecommerce.services.customer_service import CustomerService
import core.schemas as schemas

class CollectNameWorkflow:
    def Initialize(self, session):
        customer_service = CustomerService()
        # Check if customer has saved details
        customer = customer_service.get_customer_by_phone(session.PhoneNumber)
        
        # If they explicitly chose to enter new details, or no saved details
        prompt_new = session.WorkflowData.get("prompt_new_details", False)
        
        if customer and customer.CustomerName and customer.Address and not prompt_new:
            options = [
                {"id": "USE_SAVED", "title": "Use Saved Details"},
                {"id": "ENTER_NEW", "title": "Enter New Details"}
            ]
            reply_text = f"We have your details saved on file:\n*Name:* {customer.CustomerName}\n*Address:* {customer.Address}\n\nWould you like to use these saved details for this order?"
            
            # Using standard buttons format
            reply = Reply("buttons", reply_text, options=options)
            return WorkflowResult.waiting(reply)
            
        return WorkflowResult.waiting(Reply("text", "Please enter your full name:"))
        
    def Process(self, session, message):
        customer_service = CustomerService()
        if message.InteractiveId == "USE_SAVED":
            customer = customer_service.get_customer_by_phone(session.PhoneNumber)
            session.WorkflowData["name"] = customer.CustomerName
            session.WorkflowData["address"] = customer.Address
            session.WorkflowData["use_saved_details"] = True
            return WorkflowResult.completed()
            
        elif message.InteractiveId == "ENTER_NEW":
            session.WorkflowData["prompt_new_details"] = True
            return self.Initialize(session)
            
        if message.Text:
            session.WorkflowData["name"] = message.Text
            # Update customer if exists, or create
            customer = customer_service.get_customer_by_phone(session.PhoneNumber)
            if not customer:
                customer_create = schemas.CustomerCreate(CustomerName=message.Text, Name=message.Text, PhoneNumber=session.PhoneNumber)
                customer_service.create_customer(customer_create)
            else:
                customer_service.update_customer_name(session.PhoneNumber, message.Text)
            return WorkflowResult.completed()
            
        return WorkflowResult.waiting(Reply("text", "Please provide a valid name."))

    def Complete(self, session):
        return WorkflowResult.completed()
