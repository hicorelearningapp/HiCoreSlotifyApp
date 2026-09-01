"""
Privacy policy and data-deletion instructions.

Meta App Review will not approve the app without both being reachable at the
origin registered in the dashboard, so they are served by whichever process
owns that origin -- this one.
"""
from fastapi import APIRouter
from fastapi.responses import HTMLResponse

from config import APP_DISPLAY_NAME, PRIVACY_CONTACT_EMAIL, PRIVACY_CONTROLLER_NAME
from utils.legal_pages import render_data_deletion_instructions, render_privacy_policy


class LegalRouter:
    def __init__(self):
        self.router = APIRouter(tags=["legal"])
        self._add_routes()

    def _add_routes(self):
        self.router.add_api_route("/privacy", self.privacy, methods=["GET"],
                                  response_class=HTMLResponse, include_in_schema=False)
        self.router.add_api_route("/data-deletion", self.data_deletion, methods=["GET"],
                                  response_class=HTMLResponse, include_in_schema=False)

    def privacy(self):
        return render_privacy_policy(
            app_name=APP_DISPLAY_NAME,
            controller_name=PRIVACY_CONTROLLER_NAME,
            contact_email=PRIVACY_CONTACT_EMAIL,
        )

    def data_deletion(self):
        return render_data_deletion_instructions(
            app_name=APP_DISPLAY_NAME,
            controller_name=PRIVACY_CONTROLLER_NAME,
            contact_email=PRIVACY_CONTACT_EMAIL,
        )


router = LegalRouter().router
