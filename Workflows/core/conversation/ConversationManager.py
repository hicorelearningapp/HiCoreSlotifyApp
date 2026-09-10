from pyasn1_modules.rfc2985 import sequenceNumber

from core.SequenceFactory import SequenceFactory, BaseSequenceManager
from core.SequenceManager import SequenceManager
from core.models.workflow_models import Message, WorkflowStatus, WorkflowResult, Reply
from core.services.session_service import SessionService
from core.services.channel_messenger import channel_messenger as ChannelMessenger
from core.SequenceFactory import Sequence
from core.services.message_logger import MessageLogger
from core.database import db_session
from core.api_client import api_client as product_service
import asyncio
import logging
import re
from datetime import datetime

# Common greetings/menu keywords a fresh conversation may open with -- these must
# never be treated as a candidate Product ID by _handle_bare_product_id().
PRODUCT_ID_LOOKUP_SKIP_WORDS = {
    "hi", "hello", "hey", "menu", "start", "reset", "cancel", "exit", "quit",
    "yes", "no", "ok", "okay", "0", "1", "2", "3",
}

class ConversationManager:
    def __init__(self):
        self.Sequence = None
        self.Workflows = []
        self.CurrentWorkflowIndex = 0

    async def process(self, message: Message | None):
        logger = MessageLogger()

        customer_phone = message.PhoneNumber

        if message:
            logger.log_received(customer_phone, message.Text or message.InteractiveId)

        print(f"[DEBUG MESSAGE] Phone: {message.PhoneNumber}, Text: {message.Text}, InteractiveId: {message.InteractiveId}")
        business_phone = message.BusinessPhoneNumber if message else None
        session = SessionService().load_session(message)
        sequenceManager = SequenceFactory.GetSequenceManager(session.state.IndustryName)

        try:
            self.Sequence = sequenceManager.GetSequence(session)
        except ValueError:
            SessionService().reset_session(customer_phone, business_phone)
            # session = SessionService().load_session(message)
            # self.Sequence = sequenceManager.GetSequence(session)

        self.Workflows = self.Sequence.Workflows
        self.CurrentWorkflowIndex = session.state.WorkflowIndex

        while True:
            seq = sequenceManager.GetSequence(session)
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
                    await ChannelMessenger.send_reply(customer_phone, result.reply, session.state.BusinessPhoneNumber, session.state.BusinessPhoneNumberId)
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
                    await ChannelMessenger.send_reply(customer_phone, result.reply, session.state.BusinessPhoneNumber, session.state.BusinessPhoneNumberId)
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
                await ChannelMessenger.send_reply(customer_phone, complete_result.reply, session.state.BusinessPhoneNumber, session.state.BusinessPhoneNumberId)
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
        sequenceManager = SequenceFactory.GetBaseSequenceManager(session.state.IndustryName)
        seq = sequenceManager.GetSequence(session)
        next_workflow = seq.Next(session.state.WorkflowIndex)
        if next_workflow is None:
            return False  

        session.state.WorkflowIndex += 1
        session.current_workflow = next_workflow.__name__ if next_workflow else ""
        return True
