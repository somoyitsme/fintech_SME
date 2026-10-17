from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from agent_core.db.database import get_db
from agent_core.db.models import Tenant, ApiKey
from agent_core.security.auth import generate_api_key, get_tenant_from_api_key

router = APIRouter(prefix="/tenants", tags=["Tenants Management"])

class TenantRegistrationRequest(BaseModel):
    company_name: str = Field(..., example="MedCare Pharma & Surgical Ltd")
    industry: str = Field(..., example="Pharmacy & Healthcare")
    country: str = Field(default="BD", example="BD")
    currency: str = Field(default="BDT", example="BDT")
    annual_revenue: Optional[float] = Field(default=5000000.0, example=8500000.0)
    employee_count: Optional[int] = Field(default=5, example=12)

class TenantProfileResponse(BaseModel):
    tenant_id: str
    company_name: str
    industry: str
    country: str
    currency: str
    annual_revenue: float
    employee_count: int
    risk_score: float
    onboarding_status: str

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_tenant(payload: TenantRegistrationRequest, db: Session = Depends(get_db)):
    """Registers a new external SME tenant and issues their primary FinPilot Agent API Key."""
    new_tenant = Tenant(
        company_name=payload.company_name,
        industry=payload.industry,
        country=payload.country,
        currency=payload.currency,
        annual_revenue=payload.annual_revenue or 0.0,
        employee_count=payload.employee_count or 1,
        onboarding_status="active"
    )
    db.add(new_tenant)
    db.flush()

    # Generate primary live API Key
    raw_key, key_hash, key_prefix = generate_api_key()
    api_key = ApiKey(
        tenant_id=new_tenant.id,
        key_hash=key_hash,
        key_prefix=key_prefix,
        name="Primary Master Key",
        scopes=["read", "write", "agent", "sync", "admin"]
    )
    db.add(api_key)
    db.commit()

    return {
        "status": "success",
        "message": f"Tenant '{new_tenant.company_name}' successfully onboarded.",
        "tenant_id": new_tenant.id,
        "api_key": raw_key,
        "key_prefix": key_prefix,
        "embed_script_tag": f'<script src="http://localhost:8100/sdk/finpilot-sdk.js" data-api-key="{raw_key}"></script>',
        "docs_url": "http://localhost:8100/docs"
    }

@router.get("/profile", response_model=TenantProfileResponse)
def get_tenant_profile(auth_data: tuple[Tenant, ApiKey] = Depends(get_tenant_from_api_key)):
    tenant, _ = auth_data
    return TenantProfileResponse(
        tenant_id=tenant.id,
        company_name=tenant.company_name,
        industry=tenant.industry,
        country=tenant.country,
        currency=tenant.currency,
        annual_revenue=tenant.annual_revenue,
        employee_count=tenant.employee_count,
        risk_score=tenant.risk_score,
        onboarding_status=tenant.onboarding_status
    )
