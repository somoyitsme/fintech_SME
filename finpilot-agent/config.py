from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # App
    APP_NAME: str = "FinPilot"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    PORT: int = 8100
    HOST: str = "0.0.0.0"

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./finpilot_agent.db"
    DB_ECHO: bool = False

    # Security
    API_KEY_SALT: str = "finpilot-secure-salt-change-in-production"
    AUDIT_HMAC_SECRET: str = "audit-hmac-secret-change-in-production"
    RATE_LIMIT_PER_MINUTE: int = 60

    # LLM
    ANTHROPIC_API_KEY: Optional[str] = None
    LLM_MODEL: str = "claude-3-5-sonnet-20241022"
    LLM_MAX_TOKENS: int = 4096
    LLM_TEMPERATURE: float = 0.0

    # CORS
    CORS_ORIGINS: list[str] = ["*"]

    # Tenant defaults
    DEFAULT_CURRENCY: str = "CNY"
    DEFAULT_COUNTRY: str = "CN"

    # WeBank (competition-specific)
    WEBANK_MAX_LOAN_AMOUNT: int = 3_000_000  # ¥3M
    WEBANK_MIN_APR: float = 3.6
    WEBANK_MAX_APR: float = 10.8


settings = Settings()
