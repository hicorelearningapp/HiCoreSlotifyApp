import re
from core.models.workflow_models import WorkflowResult, Reply, WorkflowStatus, ConversationSession, Message


WORD_TO_NUMBER = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10
}


class SelectQuantityWorkflow:
    """
    Workflow to collect item quantity from customer and compute order total.
    """

    def Initialize(self, session: ConversationSession) -> WorkflowResult:
        if session.WorkflowData.get("quantity"):
            return WorkflowResult.completed()

        reply = Reply(
            "text",
            "🔢 *Quantity*\n\nPlease enter the quantity you would like to order in the text box below (e.g. *1*, *2*, *5*):"
        )
        return WorkflowResult.waiting(reply)

    def Process(self, session: ConversationSession, message: Message) -> WorkflowResult:
        quantity = None

        # 1. Match from Interactive Button ID
        if message.InteractiveId:
            if message.InteractiveId.startswith("QTY_"):
                try:
                    quantity = int(message.InteractiveId.split("_")[1])
                except (ValueError, IndexError):
                    pass
            elif message.InteractiveId.isdigit():
                quantity = int(message.InteractiveId)

        # 2. Match from Text input
        if quantity is None and message.Text:
            raw_text = message.Text.strip().lower()

            if raw_text.isdigit():
                quantity = int(raw_text)
            elif raw_text in WORD_TO_NUMBER:
                quantity = WORD_TO_NUMBER[raw_text]
            else:
                # Extract any number from phrase (e.g. "2 pcs", "qty 3", "5 shirts")
                match = re.search(r"\b(\d+)\b", raw_text)
                if match:
                    try:
                        quantity = int(match.group(1))
                    except ValueError:
                        pass

        # 3. Validate positive quantity
        if quantity is not None and quantity > 0:
            product_info = session.WorkflowData.get("product_info", {})
            price = product_info.get("price") or session.WorkflowData.get("product_price", 0.0)
            total = float(price) * quantity

            session.WorkflowData["quantity"] = quantity
            session.WorkflowData["total"] = total

            if hasattr(session, "state") and hasattr(session.state, "WorkflowData"):
                session.state.WorkflowData["quantity"] = quantity
                session.state.WorkflowData["total"] = total

            return WorkflowResult.completed()

        return WorkflowResult.waiting(
            Reply("text", "❌ Please enter a valid quantity as a positive number (e.g. *1*, *2*, *5*):")
        )

    def Complete(self, session: ConversationSession) -> WorkflowResult:
        return WorkflowResult.completed()
