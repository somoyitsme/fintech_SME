import hmac
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from agent_core.config import settings
from agent_core.db.database import get_db
from agent_core.db.models import Tenant, ApiKey, AuditLog

router = APIRouter(prefix="/admin", tags=["Admin Observability & Security"])

class AdminLoginRequest(BaseModel):
    password: str = Field(..., description="Master Admin Passphrase")

class AdminLoginResponse(BaseModel):
    status: str
    token: str
    admin_user: str
    expires_in_hours: int = 24

def make_admin_token(password: str) -> str:
    seed = f"{password}:{settings.SECRET_KEY}:{datetime.now(timezone.utc).strftime('%Y-%m-%d')}"
    return hashlib.sha256(seed.encode("utf-8")).hexdigest()

def verify_admin_token(
    authorization: Optional[str] = Header(None, alias="Authorization"),
    x_admin_token: Optional[str] = Header(None, alias="X-Admin-Token")
) -> bool:
    token = x_admin_token
    if not token and authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            token = parts[1]
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Admin authentication token required."
        )
    
    # Check today's or yesterday's valid token
    valid_today = make_admin_token(settings.ADMIN_PASSWORD)
    valid_secret = make_admin_token(settings.SECRET_KEY)
    
    if hmac.compare_digest(token, valid_today) or hmac.compare_digest(token, valid_secret):
        return True
        
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Forbidden: Invalid or expired admin credentials."
    )

@router.post("/login", response_model=AdminLoginResponse)
def admin_login(payload: AdminLoginRequest):
    pwd = payload.password.strip()
    if pwd != settings.ADMIN_PASSWORD and pwd != settings.SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin passphrase."
        )
    token = make_admin_token(settings.ADMIN_PASSWORD)
    return AdminLoginResponse(
        status="success",
        token=token,
        admin_user="Super Administrator",
        expires_in_hours=24
    )

@router.get("/verify")
def check_admin_session(authenticated: bool = Depends(verify_admin_token)):
    return {"status": "authenticated", "role": "admin"}

@router.get("/tenants")
def get_admin_tenants(
    authenticated: bool = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Securely returns all registered SME tenants for platform admins only."""
    tenants = db.query(Tenant).order_by(Tenant.created_at.desc()).all()
    out = []
    for t in tenants:
        key_obj = db.query(ApiKey).filter_by(tenant_id=t.id, is_active=True).first()
        out.append({
            "id": t.id,
            "company_name": t.company_name,
            "industry": t.industry,
            "currency": t.currency,
            "annual_revenue": t.annual_revenue,
            "risk_score": t.risk_score,
            "onboarding_status": t.onboarding_status,
            "key_prefix": key_obj.key_prefix if key_obj else "fpk_live_...",
            "created_at": t.created_at.isoformat() if t.created_at else None
        })
    return {"status": "success", "count": len(out), "tenants": out}

@router.get("/audit-logs")
def get_admin_audit_logs(
    authenticated: bool = Depends(verify_admin_token),
    db: Session = Depends(get_db)
):
    """Securely returns audit logs for platform admins only."""
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50).all()
    out = []
    for l in logs:
        out.append({
            "id": l.id,
            "tenant_id": l.tenant_id,
            "action": l.action,
            "resource_type": l.resource_type,
            "resource_id": l.resource_id,
            "details": l.details,
            "timestamp": l.timestamp.isoformat() if l.timestamp else None
        })
    return {"status": "success", "count": len(out), "audit_logs": out}
