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

router = APIRouter(tags=["legal"])


@router.get("/privacy", response_class=HTMLResponse, include_in_schema=False)
def privacy():
    return render_privacy_policy(
        app_name=APP_DISPLAY_NAME,
        controller_name=PRIVACY_CONTROLLER_NAME,
        contact_email=PRIVACY_CONTACT_EMAIL,
    )


@router.get("/data-deletion", response_class=HTMLResponse, include_in_schema=False)
def data_deletion():
    return render_data_deletion_instructions(
        app_name=APP_DISPLAY_NAME,
        controller_name=PRIVACY_CONTROLLER_NAME,
        contact_email=PRIVACY_CONTACT_EMAIL,
    )
