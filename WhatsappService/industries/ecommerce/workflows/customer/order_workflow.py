from core.models.workflow_models import WorkflowResult, Reply, WorkflowStatus, ConversationSession, Message


class OrderWorkFlow:
    """
    Intermediate order review workflow before payment and final confirmation.
    Presents the selected options, quantity, address, and subtotal to the customer.
    """

    def Initialize(self, session: ConversationSession) -> WorkflowResult:
        product_info = session.WorkflowData.get("product_info", {})
        product_name = product_info.get("name") or session.WorkflowData.get("product_name", "Product")
        quantity = session.WorkflowData.get("quantity", 1)
        price = product_info.get("price") or session.WorkflowData.get("product_price", 0.0)
        total = session.WorkflowData.get("total") or (float(price) * int(quantity))
        session.WorkflowData["total"] = total

        selected_options = session.WorkflowData.get("selected_options", {})
        options_lines = []
        for k, v in selected_options.items():
            options_lines.append(f"  • *{k}:* {v}")
        options_text = ("\n" + "\n".join(options_lines)) if options_lines else ""

        address = session.WorkflowData.get("address", "N/A")
        customer_name = session.WorkflowData.get("name") or session.WorkflowData.get("customer_name")
        customer_phone = session.WorkflowData.get("phone") or session.WorkflowData.get("number")

        recipient_line = ""
        if customer_name and customer_phone:
            recipient_line = f"• *Deliver To:* {customer_name} ({customer_phone})\n"
        elif customer_name:
            recipient_line = f"• *Deliver To:* {customer_name}\n"

        summary = (
            f"📦 *Order Review*\n\n"
            f"• *Product:* {product_name}\n"
            f"{'• *Selected Options:*' + options_text + chr(10) if options_text else ''}"
            f"• *Quantity:* {quantity}\n"
            f"• *Price:* ₹{float(price):,.2f} each\n"
            f"• *Subtotal:* ₹{float(total):,.2f}\n"
            f"{recipient_line}"
            f"• *Delivery Address:* {address}\n\n"
            f"Ready to choose your payment method?"
        )

        options = [
            {"id": "ORDER_PROCEED", "title": "Proceed to Pay"},
            {"id": "ORDER_CANCEL", "title": "Cancel"}
        ]
        return WorkflowResult.waiting(Reply("buttons", summary, options=options))

    def Process(self, session: ConversationSession, message: Message) -> WorkflowResult:
        text = message.Text.strip().lower() if message.Text else ""

        if (
            message.InteractiveId == "ORDER_PROCEED"
            or text in ["proceed", "proceed to pay", "pay", "yes", "1", "ok", "okay", "continue"]
        ):
            return WorkflowResult.completed()
        elif message.InteractiveId == "ORDER_CANCEL" or text in ["cancel", "no", "stop", "2", "exit", "quit"]:
            return WorkflowResult.end_sequence(
                Reply("text", "❌ Your order has been cancelled. Type *hi* or send a product ID anytime to start over.")
            )

        return WorkflowResult.waiting(
            Reply("text", "Please select *Proceed to Pay* to continue or *Cancel* to stop.")
        )

    def Complete(self, session: ConversationSession) -> WorkflowResult:
        return WorkflowResult.completed()
