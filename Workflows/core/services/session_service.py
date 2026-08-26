from typing import List, Optional
import core.models as models
import core.schemas as schemas
from core.workflows.workflow_models import ConversationSession as DomainConversationSession
from core.workflows.workflow_models import SessionState
from datetime import datetime, timedelta
from backend_app.core.database import db_session

from core.channels.whatsapp.services.whatsapp_service import whatsapp
import logging
from core.channels.whatsapp.services.whatsapp_service import whatsapp
from core.services.message_logger import MessageLogger
import json

class SessionService:
    def __init__(self):
        self.db = db_session

    def create_session(self, session: schemas.SessionCreate) -> models.ConversationSession:
        db_obj = models.ConversationSession(
            PhoneNumber=session.PhoneNumber,
            StateData=session.StateData or {}  # dict, not a string
        )
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj

    def list_sessions(self, skip: int = 0, limit: int = 100) -> List[models.ConversationSession]:
        return self.db.query(models.ConversationSession).offset(skip).limit(limit).all()

    def get_session_by_id_or_phone(self, identifier: str) -> Optional[models.ConversationSession]:
        session_obj = self.db.query(models.ConversationSession).filter(models.ConversationSession.Id == identifier).first()
        if not session_obj:
            session_obj = self.db.query(models.ConversationSession).filter(models.ConversationSession.PhoneNumber == identifier).first()
        return session_obj

    @staticmethod
    def load_session(phone_number: str, business_phone_number: str = None) -> DomainConversationSession:
        session_svc = SessionService()
        session = session_svc.get_session_by_id_or_phone(phone_number)


        if not session or not session.StateData:
            from core.identify.IdentifyService import IdentifyServiceFactory
            from core.config.BusinessManager import BusinessManager
            
            config = BusinessManager.get_config(db_session, business_phone_number) if business_phone_number else BusinessManager._load_default_config()
            industry = config.get("industry", "default")
            
            identify_svc = IdentifyServiceFactory.get_service(industry)
            user = identify_svc.identify_user(phone_number, business_phone_number)
            from core.sequence.Sequence import SequenceFactory
            sequence_name = SequenceFactory.GetSequenceName(user.UserType, db_session, business_phone_number)
            seq = SequenceFactory.Get(sequence_name, db_session, business_phone_number)
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
                session_create = schemas.SessionCreate(PhoneNumber=phone_number, StateData=initial_state)
                session = session_svc.create_session(session_create)
            else:
                session_update = schemas.SessionUpdate(StateData=initial_state)
                session = session_svc.update_session_by_id_or_phone(phone_number, session_update)

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
            phone_number=session.PhoneNumber,
            state=state
        )

    def update_session_by_id_or_phone(self, identifier: str, session_update: schemas.SessionUpdate) -> Optional[models.ConversationSession]:
        session_obj = self.get_session_by_id_or_phone(identifier)
        if not session_obj:
            return None

        update_data = session_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(session_obj, key, value)

        self.db.commit()
        self.db.refresh(session_obj)
        return session_obj

    @staticmethod
    def save_session(domain_session: DomainConversationSession):
        """Serialises SessionState back to a dict and saves to DB."""
        session_svc = SessionService()
        session_update = schemas.SessionUpdate(
            StateData=domain_session.state.model_dump()  # dict, not model_dump_json()
        )
        session_svc.update_session_by_id_or_phone(domain_session.PhoneNumber, session_update)

    def reset_session(self, phone_number: str) -> Optional[models.ConversationSession]:
        session_obj = self.get_session_by_id_or_phone(phone_number)
        if session_obj:
            self.db.delete(session_obj)
            self.db.commit()
        return session_obj

    def reset_all_sessions(self) -> int:
        deleted_count = self.db.query(models.ConversationSession).delete()
        self.db.commit()
        return deleted_count

    def delete_inactive_sessions(self, timeout_minutes: int) -> int:
        threshold = datetime.utcnow() - timedelta(minutes=timeout_minutes)
        deleted_count = self.db.query(models.ConversationSession).filter(models.ConversationSession.UpdatedAt < threshold).delete()
        self.db.commit()
        return deleted_count

    def process_timeouts(self):
        sessions = self.list_sessions()
        now = datetime.utcnow()
        
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
            
            from core.sequence.Sequence import SequenceFactory
            time_out_enabled = SequenceFactory.get_setting(self.db, business_phone, "time_out_enabled", True)
            if not time_out_enabled:
                continue
                
            session_timeout_minutes = SequenceFactory.get_setting(self.db, business_phone, "session_timeout_minutes", 10)
            timeout_delta = timedelta(minutes=session_timeout_minutes)
            
            if (now - session.UpdatedAt) > timeout_delta:
                timeout_msg = f"⏰ You have been inactive for {session_timeout_minutes} minutes. We are closing your session. Type *hi* to get the main menu."
                try:
                    MessageLogger().log_sent(session.PhoneNumber, timeout_msg)
                    whatsapp.send_text(session.PhoneNumber, timeout_msg)
                except Exception as e:
                    logging.getLogger("uvicorn").error(f"Error sending timeout to {session.PhoneNumber}: {e}")
                
                self.reset_session(session.PhoneNumber)
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

