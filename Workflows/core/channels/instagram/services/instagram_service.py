import requests
import threading
import time
from config import (
    INSTAGRAM_ACCESS_TOKEN,
    INSTAGRAM_GRAPH_HOST,
    INSTAGRAM_GRAPH_API_VERSION,
    INSTAGRAM_HTTP_TIMEOUT,
)
from core.services.message_logger import MessageLogger


class InstagramReplyError(RuntimeError):
    """A comment reply or private reply was rejected by Meta."""


class InstagramService:
    def __init__(self):
        self.sent_payloads = []
        self.url = "https://graph.facebook.com/v23.0/me/messages"
        
    def _post(self, payload, label, access_token=None):
        headers = {
            "Authorization": f"Bearer {access_token or INSTAGRAM_ACCESS_TOKEN}",
            "Content-Type": "application/json"
        }

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

    # ──────────────────────────────────────────────────────────────
    # Comment automation (Instagram Graph API)
    #
    # These are synchronous on purpose. _post above fires in a daemon thread
    # and returns None, but the caller needs the id Meta assigns to our reply
    # in order to record it for loop protection -- if we do not know our own
    # reply's comment id, Meta delivers it back to us and we answer ourselves.
    # ──────────────────────────────────────────────────────────────

    def _graph_url(self, path):
        return f"{INSTAGRAM_GRAPH_HOST}/{INSTAGRAM_GRAPH_API_VERSION}/{path.lstrip('/')}"

    def _graph_post(self, path, payload, label, access_token=None):
        # access_token is the vendor's own token, resolved from the Instagram
        # account that received the webhook. It falls back to the global env
        # token so a single-account install keeps working.
        headers = {
            "Authorization": f"Bearer {access_token or INSTAGRAM_ACCESS_TOKEN}",
            "Content-Type": "application/json",
        }
        self.sent_payloads.append({"endpoint": path, "payload": payload})

        try:
            response = requests.post(
                self._graph_url(path),
                headers=headers,
                json=payload,
                timeout=INSTAGRAM_HTTP_TIMEOUT,
            )
        except requests.exceptions.RequestException as e:
            raise InstagramReplyError(f"{label} request failed: {e}") from e

        try:
            data = response.json()
        except ValueError:
            data = {}

        if not 200 <= response.status_code < 300:
            error = data.get("error", {}) if isinstance(data, dict) else {}
            detail = error.get("message") if isinstance(error, dict) else None
            raise InstagramReplyError(
                f"{label} failed: {detail or f'Meta returned HTTP {response.status_code}'}"
            )

        return data if isinstance(data, dict) else {}

    def reply_publicly(self, comment_id, message, access_token=None):
        """Post a public reply under a comment. Returns the new comment id."""
        data = self._graph_post(
            f"{comment_id}/replies",
            {"message": message},
            "instagram public reply",
            access_token=access_token,
        )
        return str(data.get("id") or "") or None

    def send_private_reply(self, instagram_account_id, comment_id, message, access_token=None):
        """Send the comment-to-DM private reply. Returns the new message id.

        Meta permits exactly one private reply per comment, and only within a
        limited window after the comment was posted. A second attempt on the
        same comment is rejected, which is why duplicate suppression runs
        before we get here.
        """
        data = self._graph_post(
            f"{instagram_account_id}/messages",
            {
                "recipient": {"comment_id": comment_id},
                "message": {"text": message},
            },
            "instagram private reply",
            access_token=access_token,
        )
        return str(data.get("message_id") or data.get("id") or "") or None

    def send_text(self, recipient_id, body, access_token=None):
        payload = {
            "recipient": {"id": recipient_id},
            "message": {"text": body}
        }
        return self._post(payload, "instagram text message", access_token=access_token)

    def send_interactive_buttons(self, recipient_id, text, buttons, access_token=None):
        # Using quick replies for Instagram buttons
        quick_replies = []
        for btn in buttons:
            quick_replies.append({
                "content_type": "text",
                "title": btn["title"][:20],  # Title max length 20 chars
                "payload": str(btn["id"])
            })

        payload = {
            "recipient": {"id": recipient_id},
            "message": {
                "text": text,
                "quick_replies": quick_replies
            }
        }
        return self._post(payload, "instagram quick replies", access_token=access_token)
        
    def send_list_message(self, recipient_id, body_text, button_text, sections, access_token=None):
        # Instagram doesn't have native lists like WhatsApp.
        # We simulate it by numbering the options in the text, and using quick replies if possible.
        combined_text = body_text + "\n"
        quick_replies = []
        
        option_num = 1
        for section in sections:
            combined_text += f"\n*{section.get('title', '')}*\n"
            for row in section.get('rows', []):
                combined_text += f"{option_num}. {row.get('title', '')}\n"
                
                if len(quick_replies) < 13: # Instagram limit is 13 quick replies
                    quick_replies.append({
                        "content_type": "text",
                        "title": str(option_num), # Just the number as the button
                        "payload": str(row.get('id', ''))
                    })
                option_num += 1

        payload = {
            "recipient": {"id": recipient_id},
            "message": {
                "text": combined_text,
                "quick_replies": quick_replies
            }
        }
        return self._post(payload, "instagram simulated list", access_token=access_token)

    def send_workflow_response(self, recipient_id: str, response):
        if not response.Options:
            return self.send_text(recipient_id, response.Text)
            
        if len(response.Options) <= 13: # Instagram quick replies support up to 13
            return self.send_interactive_buttons(recipient_id, response.Text, response.Options)
            
        # Fallback to simulated list if too many options
        sections = [{
            "title": "Options",
            "rows": [
                {
                    "id": str(opt["id"]),
                    "title": opt["title"][:24],
                    "description": opt.get("description", "")[:72]
                }
                for opt in response.Options
            ]
        }]
        return self.send_list_message(
            recipient_id=recipient_id,
            body_text=response.Text,
            button_text="Select Option",
            sections=sections
        )

    async def send_reply(self, recipient_id: str, reply, access_token=None):
        import asyncio
        logger = MessageLogger()
        
        try:
            if reply.message_type == "text":
                logger.log_sent(f"ig_{recipient_id}", reply.text)
                self.send_text(recipient_id, reply.text, access_token=access_token)
            elif reply.message_type == "buttons":
                logger.log_sent(f"ig_{recipient_id}", f"[BUTTONS] {reply.text}")
                self.send_interactive_buttons(recipient_id, reply.text, reply.options, access_token=access_token)
            elif reply.message_type == "list":
                logger.log_sent(f"ig_{recipient_id}", f"[LIST] {reply.text}")
                self.send_list_message(recipient_id, reply.text, "Select Option", reply.sections, access_token=access_token)
            else:
                # Fallback for images/carousels (simplifying for MVP prototype)
                self.send_text(recipient_id, reply.text, access_token=access_token)
        except Exception as e:
            print(f"Failed to send reply to {recipient_id}: {e}")
            
        await asyncio.sleep(1.0)


instagram = InstagramService()
