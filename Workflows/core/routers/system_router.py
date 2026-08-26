from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend_app.core.database import get_db
from core.services.system_service import SystemService
import core.models as models

class SystemRouter:
    def __init__(self):
        self.router = APIRouter(prefix="/system", tags=["System"])
        self._add_routes()

    def _add_routes(self):
        self.router.add_api_route("/reset-db", self.reset_database, methods=["POST"])

    def reset_database(self, db: Session = Depends(get_db)):
        # Clears all patient, appointment, session, and payment data from the database
        return SystemService.reset_database(db)

router = SystemRouter().router
