from typing import List, Optional, cast
import json
import logging
from datetime import datetime, timedelta
from datetime import timezone

import core.models as models
import core.schemas as schemas
from core.models.workflow_models import ConversationSession as DomainConversationSession
from core.models.workflow_models import SessionState
from core.database import db_session
from core.services.whatsapp_service import whatsapp
from core.services.message_logger import MessageLogger
from core.SequenceManager import SequenceManager
from core.services.IdentifyService import IdentifyServiceFactory


class SessionService:
    def __init__(self):
        self.db = db_session

    def create_session(self, session: schemas.SessionCreate) -> models.ConversationSessionDB:
        db_obj = models.ConversationSessionDB(
            PhoneNumber=session.PhoneNumber,
            BusinessPhoneNumber=session.BusinessPhoneNumber or "",
            
            StateData=session.StateData or {}  # dict, not a string
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def list_sessions(self, skip: int = 0, limit: int = 100) -> List[models.ConversationSessionDB]:
        return self.db.query(models.ConversationSessionDB).offset(skip).limit(limit).all()

    def get_session(self, phone_number: str, business_phone_number: Optional[str] = None) -> Optional[models.ConversationSessionDB]:
        """The conversation this person is having with this business.

        A phone number is unique only per business, so the engine must always
        scope by both -- otherwise someone messaging two businesses resumes
        whichever conversation happens to be found first.
        """
        return (
            self.db.query(models.ConversationSessionDB)
            .filter(
                models.ConversationSessionDB.PhoneNumber == phone_number,
                models.ConversationSessionDB.BusinessPhoneNumber == (business_phone_number or ""),
            )
            .first()
        )

    def get_session_by_id_or_phone(self, identifier: str) -> Optional[models.ConversationSessionDB]:
        """Unscoped lookup for the admin routes, which only have an identifier."""
        session_obj = self.db.query(models.ConversationSessionDB).filter(models.ConversationSessionDB.Id == identifier).first()
        if not session_obj:
            session_obj = self.db.query(models.ConversationSessionDB).filter(models.ConversationSessionDB.PhoneNumber == identifier).first()
        return session_obj

    def load_session(self, phone_number: str, business_phone_number: Optional[str] = None) -> DomainConversationSession:
        biz_key = business_phone_number or ""
        session = self.get_session(phone_number, biz_key)

        if not session or not session.StateData:

            config = (
                SequenceManager.get_config(business_phone_number)
                if business_phone_number
                else SequenceManager._load_default_config()
            )
            industry = config.get("industry", "default") if isinstance(config, dict) else "default"

            biz_phone = business_phone_number or ""
            identify_svc = IdentifyServiceFactory.get_service(industry)
            user = identify_svc.identify_user(phone_number, biz_phone)
            from core.SequenceManager import SequenceFactory
            sequence_name = SequenceFactory.GetSequenceName(user.UserType, biz_phone)
            if not sequence_name:
                # The business config has no mapping for this user type. The
                # IdentifyService already worked out a sensible sequence for it,
                # so use that rather than handing SequenceFactory a None it can
                # only raise on.
                sequence_name = user.Sequence
                logging.getLogger("uvicorn").warning(
                    "No user_type_mapping for %s on business %s; falling back to %s",
                    user.UserType, biz_phone or "<default>", sequence_name,
                )
            seq = SequenceFactory.Get(sequence_name, biz_phone)
            first_workflow_class = seq.Current(0)
            current_workflow = first_workflow_class.__name__ if first_workflow_class else ""

            initial_state = {
                "SequenceName": sequence_name,
                "CurrentFlow": current_workflow,
                "WorkflowIndex": 0,
                "UserType": user.UserType,
                "WorkflowData": user.WorkflowData,
                "Initialized": False,
                "BusinessPhoneNumber": business_phone_number or ""
            }

            if not session:
                session_create = schemas.SessionCreate(
                    PhoneNumber=phone_number,
                    BusinessPhoneNumber=biz_key,
                    StateData=initial_state,
                )
                session = self.create_session(session_create)
            else:
                session.StateData = initial_state
                self.db.commit()
                self.db.refresh(session)

        assert session is not None, "Session must exist at this point"
        data = session.StateData or {}
        if isinstance(data, str):
            try:
                data = json.loads(data)
                if isinstance(data, str):  # in case it was double-encoded
                    data = json.loads(data)
            except json.JSONDecodeError:
                data = {}

        state = SessionState.model_validate(data)

        return DomainConversationSession(
            phone_number=str(session.PhoneNumber),
            state=state
        )

    def update_session_by_id_or_phone(self, identifier: str, session_update: schemas.SessionUpdate) -> Optional[models.ConversationSessionDB]:
        session_obj = self.get_session_by_id_or_phone(identifier)
        if not session_obj:
            return None

        update_data = session_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(session_obj, key, value)

        self.db.commit()
        self.db.refresh(session_obj)
        return session_obj

    def save_session(self, domain_session: DomainConversationSession):
        """Serialises SessionState back to a dict and saves to DB."""
        from core.SequenceManager import SequenceFactory
        session_obj = self.get_session(
            domain_session.PhoneNumber, domain_session.state.BusinessPhoneNumber
        )
        if not session_obj:
            return None
        session_obj.StateData = domain_session.state.model_dump()
        self.db.commit()
        self.db.refresh(session_obj)
        return session_obj

    def reset_session(self, phone_number: str, business_phone_number: Optional[str] = None) -> int:
        """Clear this person's conversation.

        Scoped to one business when the number is known. Without it every
        conversation for that phone is cleared, which is what the admin reset
        route wants and is harmless where only one business is in play.
        """
        query = self.db.query(models.ConversationSessionDB).filter(
            models.ConversationSessionDB.PhoneNumber == phone_number
        )
        if business_phone_number is not None:
            query = query.filter(
                models.ConversationSessionDB.BusinessPhoneNumber == business_phone_number
            )
        deleted = query.delete()
        self.db.commit()
        return deleted

    def reset_all_sessions(self) -> int:
        deleted_count = self.db.query(models.ConversationSessionDB).delete()
        self.db.commit()
        return deleted_count

    def delete_inactive_sessions(self, timeout_minutes: int) -> int:
        threshold = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(minutes=timeout_minutes)
        deleted_count = self.db.query(models.ConversationSessionDB).filter(models.ConversationSessionDB.UpdatedAt < threshold).delete()  # type: ignore
        self.db.commit()
        return deleted_count

    def process_timeouts(self):
        sessions = self.list_sessions()
        now = datetime.now(timezone.utc).replace(tzinfo=None)

        for session in sessions:
            if not session.UpdatedAt:
                continue

            data = session.StateData or {}
            if isinstance(data, str):
                try:
                    data = json.loads(data)
                    if isinstance(data, str):
                        data = json.loads(data)
                except json.JSONDecodeError:
                    data = {}

            business_phone = data.get("BusinessPhoneNumber", "")

            from core.SequenceManager import SequenceFactory
            time_out_enabled = SequenceFactory.get_setting(business_phone, "time_out_enabled", True)
            if not time_out_enabled:
                continue

            session_timeout_minutes = SequenceFactory.get_setting(business_phone, "session_timeout_minutes", 10)
            timeout_delta = timedelta(minutes=session_timeout_minutes)

            updated_at = cast(datetime, session.UpdatedAt)
            if (now - updated_at) > timeout_delta:
                timeout_msg = f"⏰ You have been inactive for {session_timeout_minutes} minutes. We are closing your session. Type *hi* to get the main menu."
                try:
                    MessageLogger().log_sent(str(session.PhoneNumber), timeout_msg)
                    whatsapp.send_text(str(session.PhoneNumber), timeout_msg)
                except Exception as e:
                    logging.getLogger("uvicorn").error(f"Error sending timeout to {session.PhoneNumber}: {e}")

                self.reset_session(str(session.PhoneNumber), str(session.BusinessPhoneNumber or ""))
                logging.getLogger("uvicorn").info(f"Closed inactive session for {session.PhoneNumber}")

    def delete_session_by_id_or_phone(self, identifier: str) -> bool:
        session_obj = self.get_session_by_id_or_phone(identifier)
        print("Deleting:", session_obj)
        if not session_obj:
            return False
        self.db.delete(session_obj)
        self.db.commit()
        print("Committed")
        return True

