import os
from datetime import time
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

ACCESS_TOKEN = os.getenv("ACCESS_TOKEN", "")
PHONE_NUMBER_ID = os.getenv("PHONE_NUMBER_ID", "")
VERIFY_TOKEN = os.getenv("VERIFY_TOKEN", "")
APP_SECRET = os.getenv("APP_SECRET", "")
ADMIN_PHONE_NUMBER = os.getenv("ADMIN_PHONE_NUMBER", "")

SERVER_BASE_URL = os.getenv("SERVER_BASE_URL", "http://127.0.0.1:8000").strip().rstrip("/")
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "http://127.0.0.1:8001").strip().rstrip("/")

LANGUAGE_SELECTION_ENABLED = os.getenv("LANGUAGE_SELECTION_ENABLED", "false").strip().lower() in ("1", "true", "yes", "on")
NLU_ENABLED = os.getenv("NLU_ENABLED", "false").strip().lower() in ("1", "true", "yes", "on")
TIME_OUT_ENABLED = os.getenv("TIME_OUT_ENABLED", "true").strip().lower() in ("1", "true", "yes", "on")
SESSION_TIMEOUT_MINUTES = int(os.getenv("SESSION_TIMEOUT_MINUTES", "10"))
