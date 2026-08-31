from core.Sequence import SequenceFactory
from core.models.workflow_models import Message, WorkflowStatus, WorkflowResult, Reply
from core.services.session_service import SessionService
from core.services.channel_messenger import channel_messenger as ChannelMessenger
from core.Sequence import Sequence
from core.workflows.ExitWorkflow import ExitWorkflow
from core.services.message_logger import MessageLogger
from core.database import db_session
from core.api_client import api_client as product_service
import asyncio
import logging
import re
from datetime import datetime

class ConversationManager:
    def __init__(self):
        self.Sequence = None
        self.Workflows = []
        self.CurrentWorkflowIndex = 0

    async def _handle_ecommerce_deep_link(self, session, message, customer_phone: str) -> bool:
        """Spot a product deep link arriving from Instagram or a QR code and jump to the order flow."""
        if not (message and message.Text and not session.workflow_initialized):
            return False

        def parse_order_text(text: str) -> dict | None:
            if not text: return None
            text = text.strip()
            match = re.match(r"Hi!\s*I'd like to order\s+(.+?)\s*\(id:(\d+),\s*ref:IG(\d+)\)", text, re.IGNORECASE)
            if match: return {"source": "instagram", "product_name": match.group(1).strip(), "product_id": match.group(2), "ig_user_id": match.group(3)}
            match = re.match(r"Hi!\s*I'd like to order\s+(.+?)\s*\(ref:IG(\d+)\)", text, re.IGNORECASE)
            if match: return {"source": "instagram", "product_name": match.group(1).strip(), "ig_user_id": match.group(2)}
            match = re.match(r"Hi!\s*I'd like to order\s+(.+?)\s*\(ref:QR(\d+)\)", text, re.IGNORECASE)
            if match: return {"source": "qr_code", "product_name": match.group(1).strip(), "product_id": match.group(2)}
            match = re.match(r"ORDER:(.+?):FROM_IG:(.+)", text, re.IGNORECASE)
            if match: return {"source": "instagram", "product_name": match.group(1).strip(), "ig_user_id": match.group(2).strip()}
            return None

        handoff_data = parse_order_text(message.Text)
        if not (handoff_data and "product_name" in handoff_data):
            return False

        identifier = handoff_data.get("product_id") or handoff_data["product_name"]
        product = product_service.get_product_by_name_or_id(identifier)
        if not product:
            return False

        # Deep link matched a product! Find the sequence to jump to.
        sequence_name = self._resolve_order_sequence(session, product.get("id"))
        if not sequence_name:
            logging.getLogger("uvicorn").warning(
                "Product deep link received for business %s but no "
                "order_handoff_sequence is configured; ignoring the jump.",
                session.state.BusinessPhoneNumber or "<default>",
            )
            return False

        try:
            self.Sequence = SequenceFactory.Get(
                sequence_name, session.state.BusinessPhoneNumber
            )
        except ValueError:
            logging.getLogger("uvicorn").warning(
                "order_handoff_sequence '%s' is not defined for business %s.",
                sequence_name, session.state.BusinessPhoneNumber or "<default>",
            )
            return False

        self.Workflows = self.Sequence.GetAll()
        session.state.SequenceName = sequence_name
        
        session.WorkflowData["product_id"] = product.get("id")
        session.WorkflowData["category"] = product.get("category")

        # Catalogues that carry variants start at the variant picker; the rest at quantity
        target_idx = self.Sequence.IndexOfName("SelectVariantWorkflow")
        if target_idx == -1:
            target_idx = self.Sequence.IndexOfName("SelectQuantityWorkflow")

        if target_idx != -1:
            session.state.WorkflowIndex = target_idx
            
        # We successfully intercepted. We want it to process the next workflow step!
        # Set message fields to None so it doesn't process the deep link text as input.
        message.Text = None
        message.InteractiveId = None
        return False

    def _resolve_order_sequence(self, session, product_id) -> str:
        """Which sequence a product deep link should land in."""
        per_product = SequenceFactory.get_setting(
            session.state.BusinessPhoneNumber, "product_order_sequences", {}
        ) or {}

        mapped = per_product.get(str(product_id))
        if mapped:
            return mapped
        return SequenceFactory.get_setting(
            session.state.BusinessPhoneNumber, "order_handoff_sequence", ""
        )

    async def process(self, customer_phone: str, message: Message | None):
        logger = MessageLogger()
        if message:
            logger.log_received(customer_phone, message.Text or message.InteractiveId)
        
        business_phone = message.BusinessPhoneNumber if message else None
        session = SessionService().load_session(customer_phone, business_phone)
        if message and message.BusinessPhoneNumber:
            session.state.BusinessPhoneNumber = message.BusinessPhoneNumber
            
        # --- GLOBAL RESET INTERCEPTION ---
        if message and message.Text and message.Text.strip().lower() in ["hi", "hello", "menu", "reset", "start", "0"]:
            SessionService().reset_session(customer_phone, business_phone)
            business_phone = message.BusinessPhoneNumber if message else None
            session = SessionService().load_session(customer_phone, business_phone)
            if message and message.BusinessPhoneNumber:
                session.state.BusinessPhoneNumber = message.BusinessPhoneNumber
            message = None # Clear message to start fresh at index 0
            
        # --- DEEP LINK INTERCEPTION ---
        stop_processing = await self._handle_ecommerce_deep_link(session, message, customer_phone)
        if stop_processing:
            return

        # --- GLOBAL CANCEL INTERCEPTION ---
        if message and (message.InteractiveId == "CANCEL_FLOW" or (message.Text and message.Text.strip().lower() in ["cancel", "quit", "exit"])):
            try:
                reply = Reply("text", session.translate("cancel_message", default="Your flow has been cancelled."))
                await ChannelMessenger.send_reply(customer_phone, reply, session.state.BusinessPhoneNumber)
                seq = SequenceFactory.Get(session.state.SequenceName, session.state.BusinessPhoneNumber)
                if ExitWorkflow in seq.GetAll():
                    session.state.WorkflowIndex = seq.IndexOf(ExitWorkflow)
                    session.current_workflow = "ExitWorkflow"
                    session.workflow_initialized = False
                    message = None
                    SessionService().save_session(session)
            except ValueError:
                pass
                
        try:
            self.Sequence = SequenceFactory.Get(session.state.SequenceName, session.state.BusinessPhoneNumber)
        except ValueError:
            SessionService().reset_session(customer_phone, business_phone)
            session = SessionService().load_session(customer_phone, business_phone)
            self.Sequence = SequenceFactory.Get(session.state.SequenceName, session.state.BusinessPhoneNumber)
            
        self.Workflows = self.Sequence.GetAll()
        self.CurrentWorkflowIndex = session.state.WorkflowIndex
        
        while True:
            seq = SequenceFactory.Get(session.state.SequenceName, session.state.BusinessPhoneNumber)
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
                    SessionService().save_session(session)
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
                    SessionService().save_session(session)
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
                SessionService().save_session(session)
                print(f"[DEBUG] [{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Looping to next workflow: {session.current_workflow}")
                continue

            if result.status == WorkflowStatus.FINISHED:
                SessionService().reset_session(customer_phone, session.state.BusinessPhoneNumber)
                break

            SessionService().save_session(session)
            break 

    def move_to_next_workflow(self, session) -> bool:
        seq = SequenceFactory.Get(session.state.SequenceName, session.state.BusinessPhoneNumber)
        next_workflow = seq.Next(session.state.WorkflowIndex)
        if next_workflow is None:
            return False  

        session.state.WorkflowIndex += 1
        session.current_workflow = next_workflow.__name__ if next_workflow else ""
        return True
