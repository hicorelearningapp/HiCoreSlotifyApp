from core.workflows.BaseWorkflow import Workflow
from core.workflows.workflow_models import ConversationSession, Message, WorkflowResult, Reply
# from core.services.language_manager import LanguageManager
from backend_app.core.database import db_session
import urllib.parse

class GreetingMessageWorkflow(Workflow):

    def Initialize(self, session: ConversationSession) -> WorkflowResult:
        role = session.WorkflowData.get("role", "customer")
        user_name = session.WorkflowData.get("name")
        
        # If the industry (e.g. healthcare) populated a custom name logic, we use it.
        # Otherwise, we fallback to generic translations.
        
        if role == "admin":
            greeting = session.translate("greeting_admin")
        elif role != "customer" and user_name:
            greeting = session.translate("greeting_staff", staff_name=user_name, role=role)
        elif user_name:
            greeting = session.translate("greeting_customer", user_name=user_name)
        else:
            greeting = session.translate("greeting_image_caption")
            
        business_phone = session.state.BusinessPhoneNumber
        from core.sequence.Sequence import SequenceFactory
        welcome_message_override = SequenceFactory.get_setting(db_session, business_phone, "welcome_message_override")
        if welcome_message_override and not user_name:
            greeting = welcome_message_override

        if role != "admin":
            
            language_selection_enabled = SequenceFactory.get_setting(db_session, business_phone, "language_selection_enabled", False)
            
            if not language_selection_enabled:
                image_filename = SequenceFactory.get_setting(db_session, business_phone, "welcome_image_filename", "welcome.png")
                if not image_filename:
                    return WorkflowResult.completed(
                        reply=Reply(message_type="text", text=greeting)
                    )
                from config import SERVER_BASE_URL
                image_url = f"{SERVER_BASE_URL}/images/{urllib.parse.quote(image_filename)}"
                return WorkflowResult.completed(
                    reply=Reply(message_type="image", text=greeting, image_url=image_url)
                )
            
            # lang_images = LanguageManager().get_all_greeting_image_filenames(business_phone=business_phone)
            
            user_lang = session.WorkflowData.get("Language", "en")
            
            # Put the user's language first, then the rest
            sorted_langs = [user_lang]
            for lang in lang_images.keys():
                if lang != user_lang:
                    sorted_langs.append(lang)
            
            cards = []
            from config import SERVER_BASE_URL
            for idx, lang in enumerate(sorted_langs):
                image_filename = lang_images.get(lang, lang_images["en"])
                image_url = f"{SERVER_BASE_URL}/images/{urllib.parse.quote(image_filename)}"
                
                cards.append({
                    "card_index": idx,
                    "components": [
                        {
                            "type": "header",
                            "parameters": [
                                {
                                    "type": "image",
                                    "image": {
                                        "link": image_url
                                    }
                                }
                            ]
                        },
                        {
                            "type": "button",
                            "sub_type": "quick_reply",
                            "index": 0,
                            "parameters": [
                                {
                                    "type": "payload",
                                    "payload": f"CONTINUE"
                                }
                            ]
                        }
                    ]
                })

            return WorkflowResult.completed(
                reply=Reply(message_type="carousel", text=None, carousel_cards=cards)
            )

        return WorkflowResult.completed(
            reply=Reply(message_type="text", text=greeting)
        )

    def Process(self, session: ConversationSession, message: Message) -> WorkflowResult:
        return WorkflowResult.completed()

    def Complete(self, session: ConversationSession) -> WorkflowResult:
        return WorkflowResult.success()
