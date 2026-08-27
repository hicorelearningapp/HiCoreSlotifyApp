from core.models.workflow_models import WorkflowResult, Reply, WorkflowStatus
from core.api_client import api_client as order_service
from core.api_client import api_client as product_service
from core.api_client import api_client as notification_service
from core.api_client import api_client
import core.schemas as schemas
from core.api_client import BackendAPIClient

class ConfirmOrderWorkflow:
    def Initialize(self, session):
        # Gather all data
        product_id = session.WorkflowData.get("product_id")
        quantity = session.WorkflowData.get("quantity", 1)
        
        product = api_client.get_product(product_id)
        if not product:
            return WorkflowResult.completed(Reply("text", "Error: Product not found."))
            
        variant_id = session.WorkflowData.get("variant_id")
        price = product.get("price", 0.0)
        
        if variant_id:
            variants = api_client.get_variants(product_id)
            variant = next((v for v in variants if v.get("id") == variant_id), None)
            if variant and variant.get("price") is not None:
                price = variant.get("price")
                
        total = price * quantity
        session.WorkflowData["total"] = total
        
        payment_method = session.WorkflowData.get("payment_method", "Cash on Delivery")
        
        text = f"🧾 *Order Summary*\n\n"
        text += f"Product: {product.get('name')} x{quantity}\n"
        text += f"Address: {session.WorkflowData.get('address', 'N/A')}\n"
        text += f"Payment Method: {payment_method}\n"
        text += f"Total: ₹{total}\n\n"
        text += "Do you want to confirm this order?"
        
        options = [
            {"id": "CONFIRM_YES", "title": "Yes, Confirm"},
            {"id": "CONFIRM_NO", "title": "No, Cancel"}
        ]
        
        reply = Reply("buttons", text, options=options)
        return WorkflowResult.waiting(reply)

    def Process(self, session, message):
        if message.InteractiveId == "CONFIRM_YES":
            customer = api_client.get_ecommerce_customer(session.PhoneNumber)
            if not customer:
                customer = api_client.create_ecommerce_customer({
                    "CustomerName": session.PhoneNumber,
                    "Name": session.PhoneNumber,
                    "PhoneNumber": session.PhoneNumber
                })
            
            # Create Order
            product_id = session.WorkflowData.get("product_id")
            quantity = session.WorkflowData.get("quantity", 1)
            total = session.WorkflowData.get("total", 0.0)
            payment_method = session.WorkflowData.get("payment_method", "Cash on Delivery")
            
            product = api_client.get_product(product_id)
            price = product.get("price", 0)
            
            order = api_client.create_order({
                "customer_phone": session.PhoneNumber,
                "customer_name": customer.get("CustomerName") if customer else None,
                "shipping_address": session.WorkflowData.get("address", "N/A"),
                "city": "Unknown",
                "state": "Unknown",
                "pincode": "000000",
                "payment_method": payment_method,
                "items": [
                    {
                        "product_id": product_id,
                        "quantity": quantity,
                        "unit_price": price
                    }
                ],
                "store_id": "default"
            })
            
            # Optionally update order details like address etc. here
            # order_service.update_order_details(order.id, "Standard", payment_method)
            
            # Notify Owner (Would need an API method for this if not handled in Backend)
            
            if payment_method == "Pay Online":
                reply = Reply("text", f"🎉 Thank you! Your order #{order.get('id')} has been confirmed.\n\nTo complete your purchase, please make a payment of ₹{total} to our UPI ID: *hicore.store@upi*\nOnce paid, please share the payment screenshot here.\n\nWe will process your order immediately after verification!")
            else:
                reply = Reply("text", f"🎉 Thank you! Your order #{order.get('id')} has been confirmed.\n\nYou can pay cash upon delivery. We will notify you when it's ready to ship!")
            
            return WorkflowResult.finished(reply)
            
        elif message.InteractiveId == "CONFIRM_NO":
            return WorkflowResult.finished(Reply("text", "Your order has been cancelled."))
            
        return WorkflowResult.waiting(Reply("text", "Please select Yes or No."))

    def Complete(self, session):
        return WorkflowResult.finished()
