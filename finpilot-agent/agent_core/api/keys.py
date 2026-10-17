from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from agent_core.db.database import get_db
from agent_core.db.models import Tenant, ApiKey
from agent_core.security.auth import generate_api_key, require_scopes

router = APIRouter(prefix="/keys", tags=["API Keys Management"])

class CreateKeyRequest(BaseModel):
    name: str = Field(..., example="Frontend Widget Embed Key")
    scopes: List[str] = Field(default=["agent", "read"], example=["agent", "read"])
    rate_limit_per_min: Optional[int] = Field(default=120)

@router.post("", status_code=status.HTTP_201_CREATED)
def create_api_key(
    payload: CreateKeyRequest,
    auth_data: tuple[Tenant, ApiKey] = Depends(require_scopes(["admin"])),
    db: Session = Depends(get_db)
):
    tenant, _ = auth_data
    raw_key, key_hash, key_prefix = generate_api_key()

    new_key = ApiKey(
        tenant_id=tenant.id,
        key_hash=key_hash,
        key_prefix=key_prefix,
        name=payload.name,
        scopes=payload.scopes,
        rate_limit_per_min=payload.rate_limit_per_min or 120
    )
    db.add(new_key)
    db.commit()

    return {
        "status": "success",
        "key_id": new_key.id,
        "name": new_key.name,
        "api_key": raw_key,
        "key_prefix": key_prefix,
        "scopes": new_key.scopes,
        "note": "Copy this key now. For security reasons, it cannot be viewed again."
    }

@router.get("")
def list_api_keys(
    auth_data: tuple[Tenant, ApiKey] = Depends(require_scopes(["admin"])),
    db: Session = Depends(get_db)
):
    tenant, _ = auth_data
    keys = db.query(ApiKey).filter_by(tenant_id=tenant.id).all()
    return {
        "tenant_id": tenant.id,
        "keys": [
            {
                "id": k.id,
                "name": k.name,
                "key_prefix": k.key_prefix,
                "scopes": k.scopes,
                "rate_limit_per_min": k.rate_limit_per_min,
                "is_active": k.is_active,
                "last_used_at": k.last_used_at.isoformat() if k.last_used_at else None,
                "created_at": k.created_at.isoformat()
            }
            for k in keys
        ]
    }

@router.delete("/{key_id}")
def revoke_api_key(
    key_id: str,
    auth_data: tuple[Tenant, ApiKey] = Depends(require_scopes(["admin"])),
    db: Session = Depends(get_db)
):
    tenant, current_key = auth_data
    if current_key.id == key_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot revoke the active API Key used for this request."
        )

    target_key = db.query(ApiKey).filter_by(id=key_id, tenant_id=tenant.id).first()
    if not target_key:
        raise HTTPException(status_code=404, detail="API Key not found.")

    target_key.is_active = False
    db.commit()
    return {"status": "success", "message": f"API Key '{target_key.name}' ({target_key.key_prefix}...) has been revoked."}
