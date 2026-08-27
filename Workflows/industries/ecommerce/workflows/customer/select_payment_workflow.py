from core.models.workflow_models import WorkflowResult, Reply, WorkflowStatus

class SelectPaymentWorkflow:
    def Initialize(self, session):
        options = [
            {"id": "cod", "title": "Cash on Delivery"},
            {"id": "online", "title": "Pay Online"}
        ]
        return WorkflowResult.waiting(
            Reply("buttons", "How would you like to pay for this order?", options=options)
        )
        
    def Process(self, session, message):
        text = message.Text.strip().lower() if message.Text else ""
        print(f"[DEBUG] SelectPaymentWorkflow processed message. Text='{text}', InteractiveId='{message.InteractiveId}'")
        
        if text in ["cod", "cash on delivery", "cash", "1"] or message.InteractiveId == "cod":
            session.state.WorkflowData["payment_method"] = "Cash on Delivery"
            return WorkflowResult.completed()
        elif text in ["online", "pay online", "2"] or message.InteractiveId == "online":
            session.state.WorkflowData["payment_method"] = "Pay Online"
            return WorkflowResult.completed()
            
        return WorkflowResult.waiting(
            Reply("text", "Please select a valid payment method from the options above.")
        )

    def Complete(self, session):
        return WorkflowResult.completed()
