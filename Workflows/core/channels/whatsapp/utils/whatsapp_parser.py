from fastapi import Request
from core.models.workflow_models import Message


class ParseManager:
    @staticmethod
    async def ParseWhatsapp(request: Request) -> Message:
        body = await request.json()
        value = body["entry"][0]["changes"][0]["value"]
        if "messages" not in value:
            return None

        raw_message = value["messages"][0]
        phone_number = raw_message["from"]

        metadata = value.get("metadata", {})
        business_phone_number = (
            metadata.get("display_phone_number")
            or metadata.get("display_phone_number: ")
            or metadata.get("display_phone_number ")
            or metadata.get("phone_number")
        )
        if business_phone_number:
            business_phone_number = str(business_phone_number).strip()

        text = None
        interactive_id = None

        msg_type = raw_message.get("type")
        if msg_type == "text":
            text = raw_message["text"]["body"]
        elif msg_type == "interactive":
            interactive_type = raw_message["interactive"]["type"]
            if interactive_type == "button_reply":
                interactive_id = raw_message["interactive"]["button_reply"]["id"]
            elif interactive_type == "list_reply":
                interactive_id = raw_message["interactive"]["list_reply"]["id"]

        print(f"Customer is chatting with Business Number: {business_phone_number}")
        return Message(
            phone_number=phone_number,
            text=text,
            interactive_id=interactive_id,
            business_phone_number=business_phone_number,
        )
