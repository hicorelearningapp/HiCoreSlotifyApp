from core.services.whatsapp_service import whatsapp
from config import ADMIN_PHONE_NUMBER

class NotificationService:
    @staticmethod
    def notify_owner_new_order(order_id: int, customer_name: str, product_name: str, total: float, delivery_slot: str = "N/A", payment_method: str = "COD", address: str = "N/A", quantity: int = 1):
        if not ADMIN_PHONE_NUMBER:
            return
            
        text = f"🛒 *New Order #{order_id}!*\n\n"
        text += f"Customer: {customer_name}\n"
        text += f"Product: {product_name} x{quantity}\n"
        text += f"Total: ₹{total}\n"
        text += f"Delivery: {delivery_slot}\n"
        text += f"Payment: {payment_method}\n"
        text += f"Address: {address}\n"

        buttons = [
            {"id": f"MARK_PREPARING_{order_id}", "title": "Mark as Preparing"},
            {"id": f"VIEW_ORDER_{order_id}", "title": "View Details"}
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
