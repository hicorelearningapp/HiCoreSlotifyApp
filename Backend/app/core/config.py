import os
from pydantic_settings import BaseSettings
from typing import List, Optional

# Path to Backend directory
# config.py -> core/ -> app/ -> Backend/
_BACKEND_DIR = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
_DEFAULT_SQLITE_PATH = os.path.join(_BACKEND_DIR, "appointments.db")


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
    ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "hicore")
    ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "hicore")
    
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
