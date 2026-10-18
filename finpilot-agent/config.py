"""Application configuration. Fails fast on missing required settings."""
import json
from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore", case_sensitive=False
    )

    # ── Database ──
    DATABASE_URL: str = Field(..., description="Real DB connection string")
    DB_READONLY_PASSWORD: str = Field("", description="Read-only role password")
    # Comma-separated in .env (List typing triggers premature JSON decode)
    ALLOWED_TABLES: str = Field(
        default="invoices,expenses,bank_accounts,customers,sales,inventory,payments,vendors"
    )

    # ── LLM (required in production) ──
    ANTHROPIC_API_KEY: str = Field(..., description="Anthropic API key")
    ANTHROPIC_BASE_URL: str = Field(default="https://api.miraiapi.com", description="Anthropic API base URL")
    LLM_MODEL: str = "claude-opus-4.8"
    LLM_MAX_TOKENS: int = 4096

    # ── Security ──
    API_KEY_SALT: str = Field(..., min_length=16)
    AUDIT_HMAC_SECRET: str = Field(..., min_length=16)
    # Shared key required in the X-API-Key header. Empty = unauthenticated.
    AGENT_API_KEY: str = Field("", description="Shared API key for /chat endpoints")

    # ── Server ──
    HOST: str = "0.0.0.0"
    PORT: int = 8100
    DEBUG: bool = False
    # Comma-separated in .env
    CORS_ORIGINS: str = Field(default="*")

    DEFAULT_CURRENCY: str = "CNY"
    DEFAULT_COUNTRY: str = "CN"

    @field_validator("DATABASE_URL")
    @classmethod
    def _validate_db_url(cls, v: str) -> str:
        """Validate scheme and normalize to SYNC drivers (engine is sync).

        The agent uses a synchronous SQLAlchemy engine executed in a threadpool,
        so async driver prefixes (asyncpg/aiomysql/aiosqlite) are normalized.
        """
        supported = ("postgresql", "postgres", "mysql", "sqlite")
        if not v.startswith(supported):
            raise ValueError(
                f"Unsupported DATABASE_URL scheme. Must start with one of {supported}"
            )
        # Strip async driver suffixes -> use synchronous drivers
        for async_drv, sync_drv in (
            ("postgresql+asyncpg", "postgresql+psycopg2"),
            ("postgresql+psycopg", "postgresql+psycopg2"),
            ("mysql+aiomysql", "mysql+pymysql"),
            ("sqlite+aiosqlite", "sqlite"),
        ):
            if v.startswith(async_drv):
                return v.replace(async_drv, sync_drv, 1)
        return v

    @property
    def allowed_tables_list(self) -> List[str]:
        """Parse ALLOWED_TABLES to list."""
        return [t.strip() for t in self.ALLOWED_TABLES.split(",") if t.strip()]

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS to list."""
        s = self.CORS_ORIGINS.strip()
        if s.startswith("["):
            import json
            return json.loads(s)
        return [o.strip() for o in s.split(",") if o.strip()]

    @property
    def dialect(self) -> str:
        if self.DATABASE_URL.startswith("postgresql"):
            return "postgresql"
        if self.DATABASE_URL.startswith("mysql"):
            return "mysql"
        return "sqlite"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()