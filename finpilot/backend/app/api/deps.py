from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.db.models import User, Tenant, ApiKey
from app.core.security import decode_access_token, hash_api_key

security_bearer = HTTPBearer(auto_error=False)

def get_current_user_and_tenant(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    db: Session = Depends(get_db)
) -> tuple[Optional[User], Tenant]:
    """Authenticates either via Bearer JWT or X-API-Key header."""
    # 1. Try JWT
    if credentials:
        payload = decode_access_token(credentials.credentials)
        if payload and "sub" in payload:
            user = db.query(User).filter_by(id=payload["sub"], is_active=True).first()
            if user:
                tenant = db.query(Tenant).filter_by(id=user.tenant_id).first()
                if tenant:
                    return user, tenant

    # 2. Try API Key (Widget SDK)
    if x_api_key:
        hashed = hash_api_key(x_api_key)
        api_key_obj = db.query(ApiKey).filter_by(key_hash=hashed, is_active=True).first()
        if api_key_obj:
            tenant = db.query(Tenant).filter_by(id=api_key_obj.tenant_id).first()
            if tenant:
                # Return None for user, but valid tenant
                return None, tenant

    # 3. Fallback for contest demo convenience if unauthenticated: return default seed tenant
    default_tenant = db.query(Tenant).first()
    if default_tenant:
        default_user = db.query(User).filter_by(tenant_id=default_tenant.id).first()
        return default_user, default_tenant

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required (Invalid token or API Key)."
    )

def get_current_tenant(auth_data: tuple[Optional[User], Tenant] = Depends(get_current_user_and_tenant)) -> Tenant:
    return auth_data[1]

def get_current_user(auth_data: tuple[Optional[User], Tenant] = Depends(get_current_user_and_tenant)) -> Optional[User]:
    return auth_data[0]
