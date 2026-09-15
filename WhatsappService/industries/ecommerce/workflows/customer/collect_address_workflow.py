from core.models.workflow_models import WorkflowResult, Reply, WorkflowStatus, ConversationSession, Message
from core.api_client import api_client


class CollectAddressWorkflow:
    """
    Workflow to collect customer shipping address for each order.
    """

    def Initialize(self, session: ConversationSession) -> WorkflowResult:
        if session.WorkflowData.get("address"):
            return WorkflowResult.completed()

        reply = Reply(
            "text",
            "📍 *Delivery Address*\n\nPlease reply with your complete shipping address (House/Flat No, Street, Area, City, State, Pincode):"
        )
        return WorkflowResult.waiting(reply)

    def Process(self, session: ConversationSession, message: Message) -> WorkflowResult:
        if message.Text and len(message.Text.strip()) >= 3:
            address = message.Text.strip()
            session.WorkflowData["address"] = address
            if hasattr(session, "state") and hasattr(session.state, "WorkflowData"):
                session.state.WorkflowData["address"] = address

            # Update customer in backend if exists
            try:
                customer = api_client.get_ecommerce_customer(session.PhoneNumber)
                if customer:
                    api_client.update_ecommerce_customer(session.PhoneNumber, {"Address": address})
            except Exception as e:
                print(f"[CollectAddressWorkflow] Note: could not update customer address: {e}")

            return WorkflowResult.completed()

        return WorkflowResult.waiting(
            Reply("text", "Please provide a valid shipping address (at least street and city).")
        )

    def Complete(self, session: ConversationSession) -> WorkflowResult:
        return WorkflowResult.completed()
