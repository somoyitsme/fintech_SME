import os
from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    APP_NAME: str = "FinPilot Agent Service"
    APP_ENV: str = "development"
    PORT: int = 8100
    HOST: str = "0.0.0.0"
    DEBUG: bool = True
    SECRET_KEY: str = "finpilot-agent-super-secret-key-contest-2026-v1"
    ADMIN_PASSWORD: str = "admin@finpilot2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Agent Database (Completely separate from any SME's internal DB)
    DATABASE_URL: str = "sqlite:///./agent.db"
    
    # LLM Settings
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-flash-latest"
    
    # Rate Limiting & Safety
    DEFAULT_RATE_LIMIT_PER_MINUTE: int = 120
    AUDIT_LOG_ENABLED: bool = True
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
