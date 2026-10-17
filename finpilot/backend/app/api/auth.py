import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.db.models import User, Tenant, ApiKey
from app.core.security import verify_password, get_password_hash, create_access_token, hash_api_key
from app.api.deps import get_current_user_and_tenant

router = APIRouter(prefix="/auth", tags=["Authentication"])

class RegisterRequest(BaseModel):
    company_name: str
    industry: str = "Technology"
    country: str = "CN"
    currency: str = "CNY"
    full_name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict
    tenant: dict

class CreateApiKeyRequest(BaseModel):
    name: str = "SDK Widget Key"
    permissions: list[str] = ["read", "write", "agent"]

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter_by(email=req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    tenant = Tenant(
        company_name=req.company_name,
        industry=req.industry,
        country=req.country,
        currency=req.currency
    )
    db.add(tenant)
    db.flush()

    user = User(
        tenant_id=tenant.id,
        email=req.email,
        password_hash=get_password_hash(req.password),
        role="admin",
        full_name=req.full_name
    )
    db.add(user)
    db.commit()

    token = create_access_token({"sub": user.id, "tenant_id": tenant.id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role},
        "tenant": {"id": tenant.id, "company_name": tenant.company_name, "currency": tenant.currency}
    }

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=req.email, is_active=True).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    tenant = db.query(Tenant).filter_by(id=user.tenant_id).first()
    token = create_access_token({"sub": user.id, "tenant_id": user.tenant_id})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "full_name": user.full_name, "role": user.role},
        "tenant": {"id": tenant.id, "company_name": tenant.company_name, "currency": tenant.currency, "industry": tenant.industry}
    }

@router.get("/me")
def get_me(auth_data = Depends(get_current_user_and_tenant)):
    user, tenant = auth_data
    return {
        "user": {
            "id": user.id if user else "service-account",
            "email": user.email if user else "api-key@service",
            "full_name": user.full_name if user else "API Service Account",
            "role": user.role if user else "admin"
        },
        "tenant": {
            "id": tenant.id,
            "company_name": tenant.company_name,
            "industry": tenant.industry,
            "country": tenant.country,
            "currency": tenant.currency,
            "annual_revenue": tenant.annual_revenue,
            "employee_count": tenant.employee_count,
            "risk_score": tenant.risk_score
        }
    }

@router.post("/api-keys")
def create_api_key(req: CreateApiKeyRequest, auth_data = Depends(get_current_user_and_tenant), db: Session = Depends(get_db)):
    _, tenant = auth_data
    raw_key = f"fp_live_{secrets.token_hex(16)}"
    prefix = raw_key[:12]
    hashed = hash_api_key(raw_key)

    api_key = ApiKey(
        tenant_id=tenant.id,
        name=req.name,
        key_hash=hashed,
        key_prefix=prefix,
        permissions=req.permissions
    )
    db.add(api_key)
    db.commit()

    return {
        "id": api_key.id,
        "name": api_key.name,
        "raw_key": raw_key,
        "key_prefix": prefix,
        "permissions": api_key.permissions,
        "created_at": api_key.created_at.isoformat(),
        "warning": "Copy this key immediately; it will not be displayed again in plain text."
    }

@router.get("/api-keys")
def list_api_keys(auth_data = Depends(get_current_user_and_tenant), db: Session = Depends(get_db)):
    _, tenant = auth_data
    keys = db.query(ApiKey).filter_by(tenant_id=tenant.id, is_active=True).all()
    return [{
        "id": k.id,
        "name": k.name,
        "key_prefix": k.key_prefix,
        "permissions": k.permissions,
        "created_at": k.created_at.isoformat() if k.created_at else None
    } for k in keys]
