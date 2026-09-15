from core.models.workflow_models import WorkflowResult, Reply, WorkflowStatus, ConversationSession, Message


class SelectPaymentWorkflow:
    """
    Workflow to choose payment method (COD or Pay Online).
    """

    def Initialize(self, session: ConversationSession) -> WorkflowResult:
        if session.WorkflowData.get("payment_method"):
            return WorkflowResult.completed()

        options = [
            {"id": "PAY_COD", "title": "Cash on Delivery"},
            {"id": "PAY_ONLINE", "title": "Pay Online (UPI)"}
        ]
        return WorkflowResult.waiting(
            Reply("buttons", "💳 *Payment Method*\n\nHow would you like to pay for your order?", options=options)
        )

    def Process(self, session: ConversationSession, message: Message) -> WorkflowResult:
        text = message.Text.strip().lower() if message.Text else ""

        if (
            text in ["cod", "cash on delivery", "cash", "1"]
            or message.InteractiveId in ["PAY_COD", "cod"]
        ):
            session.WorkflowData["payment_method"] = "Cash on Delivery"
            if hasattr(session, "state") and hasattr(session.state, "WorkflowData"):
                session.state.WorkflowData["payment_method"] = "Cash on Delivery"
            return WorkflowResult.completed()
        elif (
            text in ["online", "pay online", "upi", "pay online (upi)", "2"]
            or message.InteractiveId in ["PAY_ONLINE", "online"]
        ):
            session.WorkflowData["payment_method"] = "Pay Online"
            if hasattr(session, "state") and hasattr(session.state, "WorkflowData"):
                session.state.WorkflowData["payment_method"] = "Pay Online"
            return WorkflowResult.completed()

        return WorkflowResult.waiting(
            Reply("text", "Please choose a valid payment method:\n1. Cash on Delivery (COD)\n2. Pay Online (UPI)")
        )

    def Complete(self, session: ConversationSession) -> WorkflowResult:
        return WorkflowResult.completed()
