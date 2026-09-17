from core.workflows.BaseWorkflow import Workflow
from core.models.workflow_models import ConversationSession, Message, WorkflowResult, Reply
from config import SERVER_BASE_URL
from core.api_client import api_client
import urllib.parse


class GreetingMessageWorkflow(Workflow):
    """
    Initial greeting workflow for Ecommerce.
    - If valid product found: Showcases product details (image, name, description, price, compare-at price)
      and smoothly continues the order booking sequence.
    - If invalid product ID: Sends a clear warning message and resets session so the customer can retry.
    """

    def Initialize(self, session: ConversationSession) -> WorkflowResult:
        product_info = session.WorkflowData.get("product_info") or {}
        
        if not product_info:
            product_id = session.WorkflowData.get("product_id") or session.state.ProductId
            if product_id:
                try:
                    product_data = api_client.get_product_config_by_id(product_id)
                    if product_data and "product_info" in product_data:
                        product_info = product_data["product_info"]
                        session.WorkflowData["product_info"] = product_info
                        session.WorkflowData["product_id"] = product_id
                except Exception as e:
                    print(f"Error fetching product: {e}")

        product_name = product_info.get("name") or session.WorkflowData.get("product_name")

        # 1. Valid Product Found -> Display Product Showcase & Continue Flow
        if product_info and product_name:
            category = product_info.get("category")
            price = product_info.get("price")
            compare_at = product_info.get("compare_at_price")
            description = product_info.get("description")
            images = product_info.get("images") or []

            price_str = f"₹{float(price):,.2f}" if price is not None else ""
            compare_str = f" (~₹{float(compare_at):,.2f}~)" if compare_at else ""

            greeting_text = (
                f"👋 *Welcome to our Store!*\n\n"
                f"🛍️ *{product_name}*\n"
                f"{f'📂 Category: {category}\n' if category else ''}"
                f"{f'📝 {description}\n' if description else ''}\n"
                f"{f'💰 *Price:* {price_str}{compare_str}\n\n' if price_str else ''}"
                f"Let's configure your order 👇"
            )

            if images and len(images) > 0:
                first_image = images[0]
                if first_image.startswith("http://") or first_image.startswith("https://"):
                    image_url = first_image
                elif first_image.startswith("/"):
                    image_url = f"{SERVER_BASE_URL.rstrip('/')}{first_image}"
                else:
                    image_url = f"{SERVER_BASE_URL.rstrip('/')}/images/products/{urllib.parse.quote(first_image)}"

                return WorkflowResult.completed(
                    reply=Reply(message_type="image", text=greeting_text, image_url=image_url)
                )

            return WorkflowResult.completed(
                reply=Reply(message_type="text", text=greeting_text)
            )

        # 2. Invalid / Wrong Product ID -> Send Warning & Finish Session
        product_id = (session.WorkflowData.get("product_id") or session.state.ProductId or "").strip()
        if not product_id or product_id.lower() in ["hi", "hello", "hey", "start", "menu", "help", "order"]:
            warning_text = (
                "👋 *Welcome to our Store!*\n\n"
                "⚠️ *Product Not Specified*\n\n"
                "Please click or send a valid *Product Link* or *Product ID* to view details and place an order."
            )
        else:
            warning_text = (
                f"⚠️ *Product Not Found*\n\n"
                f"We couldn't find any product matching ID:\n👉 *{product_id}*\n\n"
                f"Please check the Product ID or link and try again."
            )
        return WorkflowResult.end_sequence(
            reply=Reply(message_type="text", text=warning_text)
        )

    def Process(self, session: ConversationSession, message: Message) -> WorkflowResult:
        return WorkflowResult.completed()

    def Complete(self, session: ConversationSession) -> WorkflowResult:
        return WorkflowResult.success()
