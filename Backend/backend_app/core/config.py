import os
from pydantic_settings import BaseSettings
from typing import List, Optional

# Backend/ and Workflows/ are separate processes with separate working
# directories. A relative sqlite path would give each of them its own
# appointments.db, so the default is anchored to the repo root instead.
# config.py -> core/ -> backend_app/ -> Backend/ -> repo root
_REPO_ROOT = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
)
_DEFAULT_SQLITE_PATH = os.path.join(_REPO_ROOT, "appointments.db")


class Settings(BaseSettings):
    PROJECT_NAME: str = "HiCore Slotify API Platform"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", f"sqlite:///{_DEFAULT_SQLITE_PATH.replace(os.sep, '/')}"
    )
    
    # Authentication & Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "hicore_platform_super_secret_jwt_key_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")
    
    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # WhatsApp
    WHATSAPP_TOKEN: str = os.getenv("WHATSAPP_TOKEN", "")
    WHATSAPP_PHONE_NUMBER_ID: str = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
    WHATSAPP_VERIFY_TOKEN: str = os.getenv("WHATSAPP_VERIFY_TOKEN", "")
    
    # Instagram
    INSTAGRAM_APP_ID: str = os.getenv("INSTAGRAM_APP_ID", "")
    INSTAGRAM_APP_SECRET: str = os.getenv("INSTAGRAM_APP_SECRET", "")
    INSTAGRAM_VERIFY_TOKEN: str = os.getenv("INSTAGRAM_VERIFY_TOKEN", "hicore_insta_verify_token")
    INSTAGRAM_WORKER_POLL_SECONDS: float = 2.0
    
    # Razorpay
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
