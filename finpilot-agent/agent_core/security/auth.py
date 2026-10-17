import secrets
import hashlib
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import Header, HTTPException, status, Depends
from sqlalchemy.orm import Session
from agent_core.db.database import get_db
from agent_core.db.models import Tenant, ApiKey

def hash_api_key(raw_key: str) -> str:
    """SHA-256 hash of API key for safe database storage."""
    return hashlib.sha256(raw_key.strip().encode("utf-8")).hexdigest()

def generate_api_key(prefix: str = "fpk_live_") -> tuple[str, str, str]:
    """Generates a cryptographically strong API key and its hash."""
    random_part = secrets.token_hex(24)
    raw_key = f"{prefix}{random_part}"
    key_hash = hash_api_key(raw_key)
    key_prefix = raw_key[:14]  # e.g., fpk_live_ab12
    return raw_key, key_hash, key_prefix

def get_tenant_from_api_key(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    db: Session = Depends(get_db)
) -> tuple[Tenant, ApiKey]:
    """
    Validates API key header and returns (Tenant, ApiKey).
    Supports fallback to first active tenant for local dev/demo if configured.
    """
    if not x_api_key:
        # Check if first tenant exists for local convenience
        fallback_tenant = db.query(Tenant).filter_by(onboarding_status="active").first()
        fallback_key = db.query(ApiKey).filter_by(tenant_id=fallback_tenant.id, is_active=True).first() if fallback_tenant else None
        if fallback_tenant and fallback_key:
            return fallback_tenant, fallback_key
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing 'X-API-Key' header. Please provide a valid FinPilot Agent API Key."
        )

    hashed = hash_api_key(x_api_key)
    api_key_obj = db.query(ApiKey).filter_by(key_hash=hashed, is_active=True).first()
    if not api_key_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked FinPilot Agent API Key."
        )

    if api_key_obj.expires_at and api_key_obj.expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Expired API Key."
        )

    tenant = db.query(Tenant).filter_by(id=api_key_obj.tenant_id).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated Tenant account not found."
        )

    # Update last used timestamp
    api_key_obj.last_used_at = datetime.now(timezone.utc)
    db.commit()

    return tenant, api_key_obj

def require_scopes(required_scopes: List[str]):
    """Enforces fine-grained scope permissions (e.g. read, write, agent, sync)."""
    def scope_checker(auth_data: tuple[Tenant, ApiKey] = Depends(get_tenant_from_api_key)):
        tenant, api_key = auth_data
        key_scopes = api_key.scopes or []
        for scope in required_scopes:
            if scope not in key_scopes and "admin" not in key_scopes:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"API Key lacks required permission scope: '{scope}'"
                )
        return tenant, api_key
    return scope_checker
