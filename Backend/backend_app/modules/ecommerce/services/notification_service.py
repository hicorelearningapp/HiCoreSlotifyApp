from core.channels.whatsapp.services.whatsapp_service import whatsapp
from config import ADMIN_PHONE_NUMBER
from backend_app.modules.ecommerce.models.order import Order
from backend_app.core.database import db_session

class NotificationService:
    @staticmethod
    def notify_owner_new_order(order: Order, customer_name: str, product_name: str):
        if not ADMIN_PHONE_NUMBER:
            return
            
        text = f"🛒 *New Order #{order.id}!*\n\n"
        text += f"Customer: {customer_name}\n"
        text += f"Product: {product_name} x{order.items[0].quantity if order.items else 1}\n"
        text += f"Total: ₹{order.total}\n"
        text += f"Delivery: {order.delivery_slot}\n"
        text += f"Payment: {order.payment_method}\n"
        text += f"Address: {order.customer.address if order.customer else 'N/A'}\n"

        buttons = [
            {"id": f"MARK_PREPARING_{order.id}", "title": "Mark as Preparing"},
            {"id": f"VIEW_ORDER_{order.id}", "title": "View Details"}
        ]
        
        whatsapp.send_interactive_buttons(ADMIN_PHONE_NUMBER, text, buttons)
        
    @staticmethod
    def notify_customer_order_status(customer_phone: str, order_id: int, new_status: str):
        text = f"📦 *Order Update*\n\nYour order #{order_id} is now: *{new_status}*."
        if new_status == "Preparing":
            text += " 🍰 We are getting it ready!"
        elif new_status == "Delivered":
            text += " 🎉 Enjoy your order!"
            
        whatsapp.send_text(customer_phone, text)

notification_service = NotificationService()
