from core.sequence.Sequence import SequenceFactory
from core.workflows.workflow_models import Message, WorkflowStatus, WorkflowResult, Reply
from core.services.session_service import SessionService
from core.services.channel_messenger import channel_messenger as ChannelMessenger
from core.sequence.Sequence import Sequence
from core.services.nl_router import NLRouter
from core.workflows.ExitWorkflow import ExitWorkflow
from config import NLU_ENABLED
from backend_app.core.database import db_session
from core.services.language_manager import LanguageManager
from core.services.message_logger import MessageLogger
import asyncio
import logging
from datetime import datetime

class BaseConversationManager:

    def __init__(self):
        self.Sequence = None
        self.Workflows = []
        self.CurrentWorkflowIndex = 0

    def _is_nlu_eligible(self, session) -> bool:
        """NLU is only allowed when the session is fresh or in GreetingMessageWorkflow."""
        is_uninitialized = not session.state.SequenceName
        is_greeting = session.current_workflow == "GreetingMessageWorkflow"
        return is_uninitialized or is_greeting

    async def apply_industry_interceptions(self, session, message, customer_phone: str):
        """Spot a product deep link arriving from Instagram or a QR code.

        Instagram and QR codes both hand a conversation to WhatsApp with the
        product encoded in the prefilled text. That is not specific to an
        ecommerce-configured business -- a clinic sharing one WhatsApp number
        with a shop receives exactly the same message -- so the detection lives
        here rather than in one industry's manager.

        Returns True to stop processing; subclasses may override.
        """
        if not (message and message.Text and not session.workflow_initialized):
            return False

        from industries.ecommerce.services.handoff_service import handoff_service
        from industries.ecommerce.services.product_service import product_service

        handoff_data = handoff_service.parse_order_text(message.Text)
        if not (handoff_data and "product_name" in handoff_data):
            return False

        # An id in the deep link wins over the name -- names can collide
        # across vendors, ids cannot.
        identifier = handoff_data.get("product_id") or handoff_data["product_name"]
        product = product_service.get_product_by_name_or_id(db_session, identifier)
        if product:
            session.WorkflowData["product_id"] = product.id
            session.WorkflowData["category_id"] = product.category_id
            session.WorkflowData["_handoff_pending"] = True

        return False

    def _resolve_order_sequence(self, session, product_id) -> str:
        """Which sequence a product deep link should land in.

        Config-driven so a business declares its own catalogue flows:
          product_order_sequences -- optional {product id: sequence} overrides
          order_handoff_sequence  -- the fallback for everything else
        """
        per_product = SequenceFactory.get_setting(
            db_session, session.state.BusinessPhoneNumber, "product_order_sequences", {}
        ) or {}
        mapped = per_product.get(str(product_id))
        if mapped:
            return mapped
        return SequenceFactory.get_setting(
            db_session, session.state.BusinessPhoneNumber, "order_handoff_sequence", ""
        )

    async def execute_industry_handoff_jump(self, session, message, customer_phone: str) -> Message | None:
        """Jump into the order flow once the sequence has been loaded."""
        if not session.WorkflowData.pop("_handoff_pending", False):
            return message

        sequence_name = self._resolve_order_sequence(
            session, session.WorkflowData.get("product_id")
        )
        if not sequence_name:
            logging.getLogger("uvicorn").warning(
                "Product deep link received for business %s but no "
                "order_handoff_sequence is configured; ignoring the jump.",
                session.state.BusinessPhoneNumber or "<default>",
            )
            return message

        try:
            self.Sequence = SequenceFactory.Get(
                sequence_name, db_session, session.state.BusinessPhoneNumber
            )
        except ValueError:
            logging.getLogger("uvicorn").warning(
                "order_handoff_sequence '%s' is not defined for business %s.",
                sequence_name, session.state.BusinessPhoneNumber or "<default>",
            )
            return message

        self.Workflows = self.Sequence.GetAll()
        session.state.SequenceName = sequence_name

        # Catalogues that carry variants start at the variant picker; the rest
        # start at quantity.
        target_idx = self.Sequence.IndexOfName("SelectVariantWorkflow")
        if target_idx == -1:
            target_idx = self.Sequence.IndexOfName("SelectQuantityWorkflow")

        if target_idx != -1:
            session.state.WorkflowIndex = target_idx
            return None  # consumed: the deep link is not a reply to anything

        return message

    async def process(self, customer_phone: str, message: Message | None):
        logger = MessageLogger()
        logger.log_received(customer_phone, message.Text or message.InteractiveId)
        business_phone = message.BusinessPhoneNumber if message else None
        session = SessionService.load_session(customer_phone, business_phone)
        if message and message.BusinessPhoneNumber:
            session.state.BusinessPhoneNumber = message.BusinessPhoneNumber
            
        # Load language context for this request
        LanguageManager().load_for_session(session, customer_phone)
            
        # --- GLOBAL RESET INTERCEPTION ---
        if message and message.Text and message.Text.strip().lower() in ["hi", "hello", "menu", "reset", "start", "0"]:
            SessionService().reset_session(customer_phone, business_phone)
            business_phone = message.BusinessPhoneNumber if message else None
            session = SessionService.load_session(customer_phone, business_phone)
            if message and message.BusinessPhoneNumber:
                session.state.BusinessPhoneNumber = message.BusinessPhoneNumber
            message = None # Clear message to start fresh at index 0
            
        # --- INDUSTRY SPECIFIC INTERCEPTION ---
        stop_processing = await self.apply_industry_interceptions(session, message, customer_phone)
        if stop_processing:
            return

        # --- GLOBAL CANCEL INTERCEPTION ---
        if message and (message.InteractiveId == "CANCEL_FLOW" or (message.Text and message.Text.strip().lower() in ["cancel", "quit", "exit"])):
            try:
                reply = Reply("text", session.translate("cancel_message", default="Your flow has been cancelled."))
                await ChannelMessenger.send_reply(customer_phone, reply, session.state.BusinessPhoneNumber)
                seq = SequenceFactory.Get(session.state.SequenceName, db_session, session.state.BusinessPhoneNumber)
                if ExitWorkflow in seq.GetAll():
                    session.state.WorkflowIndex = seq.IndexOf(ExitWorkflow)
                    session.current_workflow = "ExitWorkflow"
                    session.workflow_initialized = False
                    message = None
                    SessionService.save_session(session)
            except ValueError:
                pass
                
        try:
            self.Sequence = SequenceFactory.Get(session.state.SequenceName, db_session, session.state.BusinessPhoneNumber)
        except ValueError:
            SessionService().reset_session(customer_phone, business_phone)
            session = SessionService.load_session(customer_phone, business_phone)
            self.Sequence = SequenceFactory.Get(session.state.SequenceName, db_session, session.state.BusinessPhoneNumber)
            
        self.Workflows = self.Sequence.GetAll()
        
        # --- EXECUTE INDUSTRY HANDOFF JUMP ---
        message = await self.execute_industry_handoff_jump(session, message, customer_phone)

        self.CurrentWorkflowIndex = session.state.WorkflowIndex
        
        # NLU Interception Gate
        if message and message.Text and NLU_ENABLED and self._is_nlu_eligible(session):
            handled = NLRouter(db_session).dispatch(
                customer_phone,
                message={"type": "text", "text": {"body": message.Text}},
                session=session
            )
            if handled:
                return  # NLU fully handled this message, do not continue

        while True:
            seq = SequenceFactory.Get(session.state.SequenceName, db_session, session.state.BusinessPhoneNumber)
            workflow_class = seq.Current(session.state.WorkflowIndex)
            if not workflow_class:
                break
                
            session.current_workflow = workflow_class.__name__
            original_workflow = session.current_workflow
            workflow = workflow_class()

            # STEP 1 : Initialize
            skip_process = False
            if not session.workflow_initialized:
                result = workflow.Initialize(session)
                print(f"[DEBUG] [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Initialize {session.current_workflow} returned {result.status} with reply={bool(result.reply)}")

                if result.reply:
                    await ChannelMessenger.send_reply(customer_phone, result.reply, session.state.BusinessPhoneNumber)
                    if result.reply.message_type in ["image", "document", "audio", "video"]:
                        await asyncio.sleep(1.5)

                if result.status == WorkflowStatus.WAITING:
                    session.workflow_initialized = True
                    SessionService.save_session(session)
                    break
                elif result.status == WorkflowStatus.FINISHED:
                    SessionService().reset_session(customer_phone, session.state.BusinessPhoneNumber)
                    break
                elif result.status == WorkflowStatus.COMPLETED:
                    skip_process = True

                session.workflow_initialized = True
                
            # STEP 2 : Process
            if message and not skip_process:
                result = workflow.Process(session=session, message=message)
                
                print(f"[DEBUG] [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Process {session.current_workflow} returned {result.status} with reply={bool(result.reply)}")

                if result.reply:
                    await ChannelMessenger.send_reply(customer_phone, result.reply, session.state.BusinessPhoneNumber)
                    if result.reply.message_type in ["image", "document", "audio", "video"]:
                        await asyncio.sleep(1.5)

                if result.status == WorkflowStatus.WAITING:
                    SessionService.save_session(session)
                    break
                elif result.status == WorkflowStatus.FINISHED:
                    SessionService().reset_session(customer_phone, session.state.BusinessPhoneNumber)
                    break
            elif skip_process:
                result = WorkflowResult.completed()
                print(f"[DEBUG] [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Process skipped (Initialize returned COMPLETED)")
            else:
                result = WorkflowResult.completed()
                print(f"[DEBUG] [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Process skipped (message is None), assuming COMPLETED")

            # STEP 3 : Complete
            complete_result = workflow.Complete(session)
            print(f"[DEBUG] [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Complete {session.current_workflow} returned {complete_result.status} with reply={bool(complete_result.reply)}")
            if complete_result and complete_result.reply:
                await ChannelMessenger.send_reply(customer_phone, complete_result.reply, session.state.BusinessPhoneNumber)
                if complete_result.reply.message_type in ["image", "document", "audio", "video"]:
                    await asyncio.sleep(1.5)

            # Move to next workflow using factory sequence
            if result.status == WorkflowStatus.COMPLETED:
                if session.current_workflow == original_workflow:
                    moved = self.move_to_next_workflow(session)
                    print(f"[DEBUG] [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] move_to_next_workflow returned {moved}, new workflow: {session.current_workflow}")
                    if not moved:
                        SessionService().reset_session(customer_phone, session.state.BusinessPhoneNumber)
                        break

                session.workflow_initialized = False
                message = None
                SessionService.save_session(session)
                print(f"[DEBUG] [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Looping to next workflow: {session.current_workflow}")
                continue

            if result.status == WorkflowStatus.FINISHED:
                SessionService().reset_session(customer_phone, session.state.BusinessPhoneNumber)
                break

            SessionService.save_session(session)
            break 

    def move_to_next_workflow(self, session) -> bool:
        seq = SequenceFactory.Get(session.state.SequenceName, db_session, session.state.BusinessPhoneNumber)
        next_workflow = seq.Next(session.state.WorkflowIndex)
        if next_workflow is None:
            return False  

        session.state.WorkflowIndex += 1
        session.current_workflow = next_workflow.__name__ if next_workflow else ""
        return True
