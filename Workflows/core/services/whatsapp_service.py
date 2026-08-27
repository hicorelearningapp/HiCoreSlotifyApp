import requests
from config import ACCESS_TOKEN, PHONE_NUMBER_ID
from core.services.message_logger import MessageLogger
import threading
import time


class WhatsAppService:
    def __init__(self):
        self.sent_payloads = []
        self.url = f"https://graph.facebook.com/v23.0/{PHONE_NUMBER_ID}/messages"
        
    def _post(self, payload, label):
        headers = {
            "Authorization": f"Bearer {ACCESS_TOKEN}",
            "Content-Type": "application/json"
        }

        # Always append to sent_payloads so the local Simulator UI works even if offline
        self.sent_payloads.append(payload)

        def make_request():
            try:
                response = requests.post(self.url, headers=headers, json=payload, timeout=5)
                try:
                    print(f"[{label}] {response.status_code}: {response.text}")
                except UnicodeEncodeError:
                    print(f"[{label}] {response.status_code}: {response.text.encode('ascii', 'ignore').decode('ascii')}")
            except requests.exceptions.RequestException as e:
                print(f"Failed to send {label}: {e}")

        threading.Thread(target=make_request, daemon=True).start()

        time.sleep(1.0)

        return None

    @staticmethod
    def _media_object(media_id=None, link=None, caption=None, filename=None):
        """
        WhatsApp accepts EITHER an uploaded media id OR a public link for
        image/video/audio/document/sticker. Pass whichever you have.
        """
        if not media_id and not link:
            raise ValueError("Provide either media_id or link")

        obj = {"id": media_id} if media_id else {"link": link}
        if caption:
            obj["caption"] = caption
        if filename:
            obj["filename"] = filename
        return obj

    def upload_media(self, file_bytes: bytes, filename: str, mime_type: str) -> str | None:
        url = f"https://graph.facebook.com/v23.0/{PHONE_NUMBER_ID}/media"
        headers = {
            "Authorization": f"Bearer {ACCESS_TOKEN}"
        }
        files = {
            'file': (filename, file_bytes, mime_type)
        }
        data = {
            'messaging_product': 'whatsapp'
        }
        try:
            response = requests.post(url, headers=headers, data=data, files=files, timeout=15)
            if response.status_code == 200:
                return response.json().get("id")
            print(f"Failed to upload media: {response.text}")
        except Exception as e:
            print(f"Error uploading media: {e}")
        return None

    # ------------------------------------------------------------------
    # 1. Text
    # ------------------------------------------------------------------
    def send_text(self, phone, body, preview_url=False):
        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "text",
            "text": {
                "body": body,
                "preview_url": preview_url
            }
        }
        return self._post(payload, "text message")

    # ------------------------------------------------------------------
    # 2. Image
    # ------------------------------------------------------------------
    def send_image(self, phone, media_id=None, link=None, caption=None):
        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "image",
            "image": self._media_object(media_id, link, caption)
        }
        return self._post(payload, "image message")

    # ------------------------------------------------------------------
    # 3. Video
    # ------------------------------------------------------------------
    def send_video(self, phone, media_id=None, link=None, caption=None):
        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "video",
            "video": self._media_object(media_id, link, caption)
        }
        return self._post(payload, "video message")

    # ------------------------------------------------------------------
    # 4. Audio
    # ------------------------------------------------------------------
    def send_audio(self, phone, media_id=None, link=None):
        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "audio",
            "audio": self._media_object(media_id, link)
        }
        return self._post(payload, "audio message")

    # ------------------------------------------------------------------
    # 5. Document
    # ------------------------------------------------------------------
    def send_document(self, phone, media_id=None, link=None, caption=None, filename=None):
        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "document",
            "document": self._media_object(media_id, link, caption, filename)
        }
        return self._post(payload, "document message")

    # ------------------------------------------------------------------
    # 6. Sticker
    # ------------------------------------------------------------------
    def send_sticker(self, phone, media_id=None, link=None):
        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "sticker",
            "sticker": self._media_object(media_id, link)
        }
        return self._post(payload, "sticker message")

    # ------------------------------------------------------------------
    # 7. Location
    # ------------------------------------------------------------------
    def send_location(self, phone, latitude, longitude, name=None, address=None):
        location = {"latitude": latitude, "longitude": longitude}
        if name:
            location["name"] = name
        if address:
            location["address"] = address

        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "location",
            "location": location
        }
        return self._post(payload, "location message")

    # ------------------------------------------------------------------
    # 8. Contacts
    # ------------------------------------------------------------------
    def send_contacts(self, phone, contacts):
        """
        contacts: list of contact objects following Meta's contact schema, e.g.
        [{
            "name": {"formatted_name": "Jane Doe", "first_name": "Jane"},
            "phones": [{"phone": "+15551234567", "type": "WORK"}]
        }]
        """
        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "contacts",
            "contacts": contacts
        }
        return self._post(payload, "contacts message")

    # ------------------------------------------------------------------
    # 9. Reaction
    # ------------------------------------------------------------------
    def send_reaction(self, phone, message_id, emoji):
        """emoji='' removes a previously sent reaction."""
        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "reaction",
            "reaction": {
                "message_id": message_id,
                "emoji": emoji
            }
        }
        return self._post(payload, "reaction")

    # ------------------------------------------------------------------
    # 10. Template
    # ------------------------------------------------------------------
    def send_template(self, phone, template_name, language_code="en_US", components=None):
        template = {
            "name": template_name,
            "language": {"code": language_code}
        }
        if components:
            template["components"] = components

        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "template",
            "template": template
        }
        return self._post(payload, "template message")

    # ------------------------------------------------------------------
    # 11. Interactive — reply buttons (max 3)
    # ------------------------------------------------------------------
    def send_interactive_buttons(self, phone, text, buttons, header_text=None, footer_text=None):
        action_buttons = [
            {"type": "reply", "reply": {"id": btn["id"], "title": btn["title"]}}
            for btn in buttons
        ]

        interactive_data = {
            "type": "button",
            "body": {"text": text},
            "action": {"buttons": action_buttons}
        }
        if header_text:
            interactive_data["header"] = {"type": "text", "text": header_text}
        if footer_text:
            interactive_data["footer"] = {"text": footer_text}

        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "interactive",
            "interactive": interactive_data
        }
        return self._post(payload, "interactive buttons")

    # ------------------------------------------------------------------
    # 12. Interactive — list
    # ------------------------------------------------------------------
    def send_list_message(self, phone, body_text, button_text, sections, header_text=None, footer_text=None):
        sections = [s for s in (sections or []) if s.get("rows") and len(s["rows"]) > 0]
        interactive_data = {
            "type": "list",
            "body": {"text": body_text},
            "action": {
                "button": button_text,
                "sections": sections
            }
        }
        if header_text:
            interactive_data["header"] = {"type": "text", "text": header_text}
        if footer_text:
            interactive_data["footer"] = {"text": footer_text}

        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "interactive",
            "interactive": interactive_data
        }
        return self._post(payload, "list message")

    # ------------------------------------------------------------------
    # 13. Interactive — Carousel
    # ------------------------------------------------------------------
    def send_carousel(self, phone, cards, body_text=None):
        interactive_data = {
            "type": "carousel",
            "action": {
                "cards": cards
            }
        }
        if body_text:
            interactive_data["body"] = {"text": body_text}

        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "interactive",
            "interactive": interactive_data
        }
        return self._post(payload, "carousel message")

    # ------------------------------------------------------------------
    # Bonus: Interactive — CTA URL button (single button that opens a link)
    # ------------------------------------------------------------------
    def send_cta_url(self, phone, body_text, display_text, url, header_text=None, footer_text=None):
        interactive_data = {
            "type": "cta_url",
            "body": {"text": body_text},
            "action": {
                "name": "cta_url",
                "parameters": {"display_text": display_text, "url": url}
            }
        }
        if header_text:
            interactive_data["header"] = {"type": "text", "text": header_text}
        if footer_text:
            interactive_data["footer"] = {"text": footer_text}

        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "interactive",
            "interactive": interactive_data
        }
        return self._post(payload, "CTA URL message")

    def send_workflow_response(self, phone: str, response):
        """Sends a WorkflowResponse directly mapping to Text, Buttons, or List."""
        if not response.Options:
            return self.send_text(phone, response.Text)
            
        if len(response.Options) <= 3:
            return self.send_interactive_buttons(phone, response.Text, response.Options)
            
        # More than 3 options -> use a list message
        sections = [{
            "title": "Options",
            "rows": [
                {
                    "id": str(opt["id"]),
                    "title": opt["title"][:24], # WhatsApp limit is 24 chars for list titles
                    "description": opt.get("description", "")[:72]
                }
                for opt in response.Options
            ]
        }]
        return self.send_list_message(
            phone=phone,
            body_text=response.Text,
            button_text="Select Option",
            sections=sections
        )

    async def send_reply(self, to_phone: str, reply):
        import asyncio
        logger = MessageLogger()
        
        try:
            if reply.message_type == "text":
                logger.log_sent(to_phone, reply.text)
                self.send_text(to_phone, reply.text)
            elif reply.message_type == "buttons":
                if reply.options and len(reply.options) > 3:
                    logger.log_sent(to_phone, f"[LIST (FALLBACK FROM >3 BUTTONS)] {reply.text}")
                    sections = [{
                        "title": "Options",
                        "rows": [{"id": opt.get("id", str(i)), "title": opt.get("title", "")[:24]} for i, opt in enumerate(reply.options)]
                    }]
                    self.send_list_message(to_phone, reply.text, "Select Option", sections)
                else:
                    logger.log_sent(to_phone, f"[BUTTONS] {reply.text}")
                    self.send_interactive_buttons(to_phone, reply.text, reply.options)
            elif reply.message_type == "list":
                logger.log_sent(to_phone, f"[LIST] {reply.text}")
                self.send_list_message(to_phone, reply.text, "Select Option", reply.sections)
            elif reply.message_type == "image":
                logger.log_sent(to_phone, f"[IMAGE] {reply.text}")
                self.send_image(to_phone, link=reply.image_url, caption=reply.text)
            elif reply.message_type == "document":
                logger.log_sent(to_phone, f"[DOCUMENT] {reply.text}")
                self.send_document(to_phone, link=reply.document_url, filename=reply.filename, caption=reply.text)
            elif reply.message_type == "carousel":
                logger.log_sent(to_phone, f"[CAROUSEL] {reply.text if reply.text else 'Sending Carousel'}")
                self.send_carousel(to_phone, cards=reply.carousel_cards, body_text=reply.text)
        except Exception as e:
            print(f"Failed to send reply to {to_phone}: {e}")
            
        # Artificial delay to ensure WhatsApp delivers messages in chronological order
        # Images take longer for Facebook to process and deliver, so we wait longer
        delay = 3.0 if reply.message_type in ("image", "document", "video") else 1.0
        await asyncio.sleep(delay)



whatsapp = WhatsAppService()
