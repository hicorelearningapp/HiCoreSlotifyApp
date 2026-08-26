import logging

logger = logging.getLogger("uvicorn")

class WhatsAppServiceStub:
    def send_template_message(self, *args, **kwargs):
        logger.info(f"[WhatsApp Notification Stub] send_template_message called: {args} {kwargs}")
        return {"status": "success", "message": "WhatsApp notification stub executed."}

    def send_text_message(self, *args, **kwargs):
        logger.info(f"[WhatsApp Notification Stub] send_text_message called: {args} {kwargs}")
        return {"status": "success", "message": "WhatsApp text stub executed."}

whatsapp = WhatsAppServiceStub()
