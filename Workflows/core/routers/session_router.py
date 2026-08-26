from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional

import core.schemas as schemas
from core.services.session_service import SessionService


class SessionRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/sessions", tags=["Sessions"])
        self._add_routes()
        self.session_svc = SessionService()

    def _add_routes(self):
        self.router.add_api_route("", self.create_session, methods=["POST"], response_model=schemas.SessionOut, status_code=status.HTTP_201_CREATED)
        self.router.add_api_route("", self.list_sessions, methods=["GET"], response_model=List[schemas.SessionOut])
        self.router.add_api_route("/reset-all", self.reset_all_sessions, methods=["POST"])
        self.router.add_api_route("/{phone_number}/reset", self.reset_session, methods=["POST"], response_model=schemas.SessionOut)
        self.router.add_api_route("/{identifier}", self.get_session, methods=["GET"], response_model=schemas.SessionOut)
        self.router.add_api_route("/{identifier}", self.update_session, methods=["PUT"], response_model=schemas.SessionOut)
        self.router.add_api_route("/{identifier}", self.delete_session, methods=["DELETE"])

    def create_session(self, session: schemas.SessionCreate):
        existing = self.session_svc.get_session_by_id_or_phone(session.PhoneNumber)
        if existing:
            raise HTTPException(status_code=400, detail="Session for this phone number already exists")
        return self.session_svc.create_session(session)

    def list_sessions(self, skip: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=500)):
        return self.session_svc.list_sessions(skip=skip, limit=limit)

    def get_session(self, identifier: str):
        session_obj = self.session_svc.get_session_by_id_or_phone(identifier)
        if not session_obj:
            raise HTTPException(status_code=404, detail="Session not found")
        return session_obj

    def update_session(self, identifier: str, session_update: schemas.SessionUpdate):
        session_obj = self.session_svc.update_session_by_id_or_phone(identifier, session_update)
        if not session_obj:
            raise HTTPException(status_code=404, detail="Session not found")
        return session_obj

    def reset_session(self, phone_number: str):
        session_obj = self.session_svc.reset_session(phone_number)
        if not session_obj:
            raise HTTPException(status_code=404, detail="Session for this phone number not found")
        return session_obj

    def reset_all_sessions(self):
        deleted_count = self.session_svc.reset_all_sessions()
        return {"success": True, "message": "All sessions reset successfully", "count": deleted_count}

    def delete_session(self, identifier: str):
        success = self.session_svc.delete_session_by_id_or_phone(identifier)
        if not success:
            raise HTTPException(status_code=404, detail="Session not found")
        return {"success": True, "message": "Session deleted successfully"}


router = SessionRouter().router
