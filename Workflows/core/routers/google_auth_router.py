from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from core.services.google_oauth_service import GoogleOAuthService
from industries.healthcare.services.doctor_service import DoctorService


class GoogleAuthRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/google", tags=["Google Integration"])
        self.oauth_service = GoogleOAuthService()
        self._add_routes()

    def _add_routes(self):
        self.router.add_api_route("/login/master", self.google_login_master, methods=["GET"])
        self.router.add_api_route("/callback", self.google_callback, methods=["GET"])
        self.router.add_api_route("/calendar/{doctor_id}", self.get_doctor_calendar, methods=["GET"])

    def google_login_master(self):
        """Initiates the Google OAuth flow for the master calendar account"""
        try:
            # We pass 'master' as the state/doctor_id
            auth_url = self.oauth_service.get_authorization_url(doctor_id="master")
            return RedirectResponse(url=auth_url)
        except ValueError as e:
            raise HTTPException(status_code=500, detail=str(e))

    def google_callback(self, request: Request, code: str = None, state: str = None, error: str = None):
        """Handles the callback from Google after user grants permission"""
        if error:
            raise HTTPException(status_code=400, detail=f"Google OAuth Error: {error}")
        
        if not code or not state:
            raise HTTPException(status_code=400, detail="Missing code or state from Google")
            
        try:
            result = self.oauth_service.handle_callback(code, state)
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to connect Google account: {str(e)}")

    def get_doctor_calendar(self, doctor_id: str, time_min: str = None, time_max: str = None):
        """Fetches upcoming calendar events from the master calendar"""
        try:
            events = self.oauth_service.get_calendar_events(time_min, time_max)
            return {"events": events}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

router = GoogleAuthRouter().router

