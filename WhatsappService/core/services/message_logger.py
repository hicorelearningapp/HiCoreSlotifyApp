import logging
from datetime import datetime
import os

class MessageLogger:
    def __init__(self):
        self.logger = logging.getLogger("whatsapp_messages")
        self.logger.setLevel(logging.INFO)
        
        # Ensure we only add handlers once
        if not self.logger.handlers:
            # Console handler
            ch = logging.StreamHandler()
            formatter = logging.Formatter('%(asctime)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
            ch.setFormatter(formatter)
            self.logger.addHandler(ch)

    def log_received(self, phone: str, text: str):
        self.logger.info(f"[RECEIVED] From {phone}: {text}")

    def log_sent(self, phone: str, text: str):
        self.logger.info(f"[SENT] To {phone}: {text}")
