# from core.workflows.BaseWorkflow import Workflow
# from core.workflows.workflow_models import ConversationSession, Message, WorkflowResult, Reply
# from core.services.language_manager import LanguageManager
# from backend_app.modules.doctor_appointment.models.customer import Customer
# from backend_app.core.database import SessionLocal

# class LanguageSelectionWorkflow(Workflow):
#     def Initialize(self, session: ConversationSession) -> WorkflowResult:
#         # if not LanguageManager().should_prompt_for_language(session):
#             return WorkflowResult.completed()
            
#         options = []
#         # for lang in LanguageManager().LanguageOptions:
#         #     options.append({"id": lang["id"], "title": lang["title"], "description": lang["description"]})
        
#         return WorkflowResult.waiting(
#             reply=Reply(
#                 message_type="list",
#                 text=LanguageManager().text("language_selection_prompt"),
#                 button_text="Select Language",
#                 sections=[{
#                     "title": "Select Language",
#                     "rows": options
#                 }]
#             )
#         )

#     def Process(self, session: ConversationSession, message: Message) -> WorkflowResult:
#         if message.InteractiveId:
#             success = LanguageManager().save_language_selection(session, message.InteractiveId)
#             if success:
#                 return WorkflowResult.completed(
#                     reply=Reply("text", LanguageManager().text("language_updated"))
#                 )
            
#         return WorkflowResult.waiting(
#             reply=Reply("text", session.translate("invalid_option"))
#         )

#     def Complete(self, session: ConversationSession) -> WorkflowResult:
#         return WorkflowResult.success()
