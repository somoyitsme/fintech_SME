import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "FinPilot"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "finpilot-super-secret-production-and-contest-key-2026-xyz"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = "sqlite:///./finpilot.db"
    
    # AI / LLM Configuration
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-2.0-flash"
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:8000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # App Limits & Safety
    MAX_UPLOAD_SIZE_MB: int = 10
    AUDIT_LOG_ENABLED: bool = True
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
