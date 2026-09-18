from datetime import datetime
from core.models.workflow_models import WorkflowResult, Reply, WorkflowStatus, ConversationSession, Message
from core.api_client import api_client


class ConfirmOrderWorkflow:
    """
    Final confirmation workflow to place the Ecommerce order.
    Presents the full order summary and creates the order in the backend upon confirmation.
    """

    def Initialize(self, session: ConversationSession) -> WorkflowResult:
        product_info = session.WorkflowData.get("product_info") or {}
        product_name = product_info.get("name") or session.WorkflowData.get("product_name", "Product")
        quantity = session.WorkflowData.get("quantity", 1)
        price = product_info.get("price") or session.WorkflowData.get("product_price", 0.0)
        total = session.WorkflowData.get("total") or (float(price) * int(quantity))
        session.WorkflowData["total"] = total

        selected_options = session.WorkflowData.get("selected_options") or {}
        options_lines = []
        for k, v in selected_options.items():
            options_lines.append(f"  • *{k}:* {v}")
        options_text = ("\n" + "\n".join(options_lines)) if options_lines else ""

        address = session.WorkflowData.get("address", "N/A")
        payment_method = session.WorkflowData.get("payment_method", "Cash on Delivery")

        summary = (
            f"🧾 *Confirm Your Order*\n\n"
            f"• *Product:* {product_name}\n"
            f"{'• *Selected Options:*' + options_text + chr(10) if options_text else ''}"
            f"• *Quantity:* {quantity}\n"
            f"• *Delivery Address:* {address}\n"
            f"• *Payment Method:* {payment_method}\n"
            f"• *Total Amount:* ₹{float(total):,.2f}\n\n"
            f"Would you like to place this order now?"
        )

        options = [
            {"id": "CONFIRM_YES", "title": "✅ Place Order"},
            {"id": "CONFIRM_NO", "title": "❌ Cancel"}
        ]

        reply = Reply("buttons", summary, options=options)
        return WorkflowResult.waiting(reply)

    def Process(self, session: ConversationSession, message: Message) -> WorkflowResult:
        text = message.Text.strip().lower() if message.Text else ""

        if (
            message.InteractiveId == "CONFIRM_YES"
            or text in ["yes", "confirm", "place order", "1", "ok", "yes, place order", "yes, confirm"]
        ):
            # 1. Look up or create ecommerce customer
            customer = None
            try:
                customer = api_client.get_ecommerce_customer(session.PhoneNumber)
                if not customer:
                    customer = api_client.create_ecommerce_customer({
                        "CustomerName": session.PhoneNumber,
                        "Name": session.PhoneNumber,
                        "PhoneNumber": session.PhoneNumber
                    })
            except Exception as e:
                print(f"[ConfirmOrderWorkflow] Customer lookup/create note: {e}")

            # 2. Extract order details
            product_id = session.WorkflowData.get("product_id") or session.state.ProductId
            product_info = session.WorkflowData.get("product_info") or {}
            product_name = product_info.get("name") or session.WorkflowData.get("product_name", "Product")
            quantity = session.WorkflowData.get("quantity", 1)
            price = product_info.get("price") or session.WorkflowData.get("product_price", 0.0)
            total = session.WorkflowData.get("total") or (float(price) * int(quantity))
            payment_method = session.WorkflowData.get("payment_method", "Cash on Delivery")
            address = session.WorkflowData.get("address", "N/A")
            selected_options = session.WorkflowData.get("selected_options") or {}

            # 3. Customer name from collect name workflow
            customer_name = (
                session.WorkflowData.get("name")
                or (customer.get("CustomerName") if isinstance(customer, dict) else None)
                or (customer.get("ProfileName") if isinstance(customer, dict) else None)
                or (customer.get("Name") if isinstance(customer, dict) else None)
                or session.PhoneNumber
            )

            # 4. Correct seller_id (Business UUID, not phone number)
            seller_id = (
                session.WorkflowData.get("seller_id")
                or (product_info.get("seller_id") if isinstance(product_info, dict) else None)
                or (product_info.get("SellerId") if isinstance(product_info, dict) else None)
            )
            if not seller_id:
                if product_id:
                    try:
                        prod_obj = api_client.get_product(product_id)
                        if prod_obj and isinstance(prod_obj, dict) and prod_obj.get("SellerId"):
                            seller_id = prod_obj.get("SellerId")
                    except Exception as ex:
                        print(f"[ConfirmOrderWorkflow] Product lookup for seller_id note: {ex}")

                if not seller_id:
                    biz_phone = session.state.BusinessPhoneNumber
                    if biz_phone:
                        try:
                            biz = api_client.get_business_by_phone(biz_phone)
                            if biz and isinstance(biz, dict):
                                seller_id = biz.get("Id") or biz.get("id")
                        except Exception as ex:
                            print(f"[ConfirmOrderWorkflow] Business lookup for seller_id note: {ex}")

            # 5. Build order payload with seller_id, customer name, and empty string for uncollected fields
            order_payload = {
                "CustomerPhone": session.PhoneNumber,
                "CustomerName": customer_name,
                "ShippingAddress": address,
                "City": session.WorkflowData.get("city") or "",
                "State": session.WorkflowData.get("state") or "",
                "Pincode": session.WorkflowData.get("pincode") or "",
                "PaymentMethod": "Online" if payment_method == "Pay Online" else "COD",
                "SellerId": str(seller_id),
                "OrderData": {
                    "selected_options": selected_options,
                },
                "Items": [
                    {
                        "ProductId": str(product_id),
                        "ProductName": product_name,
                        "Quantity": int(quantity),
                        "UnitPrice": float(price),
                        "ItemData": selected_options
                    }
                ]
            }

            order = None
            try:
                order = api_client.create_order(order_payload)
            except Exception as e:
                print(f"[ConfirmOrderWorkflow] Error creating order via API: {e}")

            order_id = (
                order.get("OrderNumber") or order.get("Id") or order.get("id")
                if (order and isinstance(order, dict))
                else f"ORD-{int(datetime.now().timestamp()) % 100000}"
            )

            if payment_method == "Pay Online":
                reply = Reply(
                    "text",
                    f"🎉 *Thank you! Your order #{order_id} has been placed.*\n\n"
                    f"💰 *Total Amount:* ₹{float(total):,.2f}\n\n"
                    f"To complete your purchase, please make the payment via UPI to:\n"
                    f"👉 *hicore.store@upi*\n\n"
                    f"Once paid, please reply with your payment reference or screenshot here.\n"
                    f"We will process your shipment immediately after verification! ✨"
                )
            else:
                reply = Reply(
                    "text",
                    f"🎉 *Thank you! Your order #{order_id} has been placed successfully.*\n\n"
                    f"💰 *Total Amount:* ₹{float(total):,.2f}\n"
                    f"🚚 *Payment Mode:* Cash on Delivery\n"
                    f"📍 *Delivery to:* {address}\n\n"
                    f"We will notify you once your order is on the way! ✨"
                )

            return WorkflowResult.end_sequence(reply)

        elif message.InteractiveId == "CONFIRM_NO" or text in ["no", "cancel", "stop", "2", "exit"]:
            return WorkflowResult.end_sequence(
                Reply("text", "❌ Your order has been cancelled. Type *hi* or send a product ID anytime to start over.")
            )

        return WorkflowResult.waiting(
            Reply("text", "Please select *Place Order* to confirm or *Cancel* to stop.")
        )

    def Complete(self, session: ConversationSession) -> WorkflowResult:
        return WorkflowResult.end_sequence()
