from core.workflows.workflow_models import WorkflowResult, Reply, WorkflowStatus
from backend_app.modules.ecommerce.services.order_service import order_service
from backend_app.modules.ecommerce.services.product_service import product_service
from backend_app.modules.ecommerce.services.notification_service import notification_service
from backend_app.modules.ecommerce.services.customer_service import CustomerService
import core.schemas as schemas
from backend_app.core.database import db_session

class ConfirmOrderWorkflow:
    def Initialize(self, session):
        # Gather all data
        product_id = session.WorkflowData.get("product_id")
        quantity = session.WorkflowData.get("quantity", 1)
        
        product = product_service.get_product_by_id(db_session, product_id)
        if not product:
            return WorkflowResult.completed(Reply("text", "Error: Product not found."))
            
        variant_id = session.WorkflowData.get("variant_id")
        price = product.price
        
        if variant_id:
            variants = product_service.get_variants_by_product_id(db_session, product_id)
            variant = next((v for v in variants if v.id == variant_id), None)
            if variant and variant.price is not None:
                price = variant.price
                
        total = price * quantity
        session.WorkflowData["total"] = total
        
        payment_method = session.WorkflowData.get("payment_method", "Cash on Delivery")
        
        text = f"🧾 *Order Summary*\n\n"
        text += f"Product: {product.name} x{quantity}\n"
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
            customer_svc = CustomerService()
            # Create customer if doesn't exist
            customer = customer_svc.get_customer_by_phone(session.PhoneNumber)
            if not customer:
                customer_create = schemas.CustomerCreate(CustomerName=session.PhoneNumber, Name=session.PhoneNumber, PhoneNumber=session.PhoneNumber)
                customer = customer_svc.create_customer(customer_create)
            
            # Create Order
            product_id = session.WorkflowData.get("product_id")
            quantity = session.WorkflowData.get("quantity", 1)
            total = session.WorkflowData.get("total", 0.0)
            payment_method = session.WorkflowData.get("payment_method", "Cash on Delivery")
            
            order = order_service.create_order(
                db=db_session,
                customer_id=customer.AccountId,
                product_id=product_id,
                quantity=quantity,
                total=total,
                variant_id=session.WorkflowData.get("variant_id"),
                source_channel="whatsapp"
            )
            
            # Optionally update order details like address etc. here
            order_service.update_order_details(db_session, order.id, "Standard", payment_method)
            
            # Notify Owner
            product = product_service.get_product_by_id(db_session, product_id)
            notification_service.notify_owner_new_order(order, customer.CustomerName or session.PhoneNumber, product.name)
            
            if payment_method == "Pay Online":
                reply = Reply("text", f"🎉 Thank you! Your order #{order.id} has been confirmed.\n\nTo complete your purchase, please make a payment of ₹{total} to our UPI ID: *hicore.store@upi*\nOnce paid, please share the payment screenshot here.\n\nWe will process your order immediately after verification!")
            else:
                reply = Reply("text", f"🎉 Thank you! Your order #{order.id} has been confirmed.\n\nYou can pay cash upon delivery. We will notify you when it's ready to ship!")
            
            return WorkflowResult.finished(reply)
            
        elif message.InteractiveId == "CONFIRM_NO":
            return WorkflowResult.finished(Reply("text", "Your order has been cancelled."))
            
        return WorkflowResult.waiting(Reply("text", "Please select Yes or No."))

    def Complete(self, session):
        return WorkflowResult.finished()
