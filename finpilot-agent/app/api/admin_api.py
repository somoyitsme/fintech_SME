"""Admin API: tenant/key management, audit logs, metrics."""
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import TenantID
from app.core.crypto import generate_api_key
from app.core.db import DBSession
from app.core.models import ApiKey, AuditLog, Tenant
from app.core.schemas import TenantResponse, AuditLogResponse


class CreateTenantRequest(BaseModel):
    name: str
    domain: Optional[str] = None
    country: str = "CN"
    currency: str = "CNY"
    industry: Optional[str] = None


class GenerateKeyRequest(BaseModel):
    name: str = "default"
    rate_limit_per_min: int = 60


router = APIRouter(prefix="/api/v1/admin", tags=["admin"])


@router.get("/tenants/me", response_model=TenantResponse)
async def get_current_tenant(
    tenant_id: TenantID,
    db: DBSession,
):
    """Get current authenticated tenant info."""
    stmt = select(Tenant).where(Tenant.id == tenant_id)
    result = await db.execute(stmt)
    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    return tenant


@router.get("/tenants", response_model=List[TenantResponse])
async def list_all_tenants(
    tenant_id: TenantID,  # Must be admin tenant
    db: DBSession,
):
    """List all tenants (admin only)."""
    stmt = select(Tenant).order_by(Tenant.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/tenants", response_model=TenantResponse)
async def create_tenant(
    body: CreateTenantRequest,
    tenant_id: TenantID,  # Must be admin
    db: DBSession,
):
    """Create a new tenant."""
    tenant = Tenant(
        name=body.name,
        domain=body.domain,
        country=body.country,
        currency=body.currency,
        industry=body.industry,
    )
    db.add(tenant)
    await db.commit()
    await db.refresh(tenant)
    return tenant


@router.post("/tenants/{target_tenant_id}/keys")
async def generate_key_for_tenant(
    target_tenant_id: str,
    body: GenerateKeyRequest,
    tenant_id: TenantID,  # Must be admin
    db: DBSession,
):
    """Generate API key for a tenant."""
    plaintext, key_hash, key_prefix = generate_api_key()

    api_key = ApiKey(
        tenant_id=target_tenant_id,
        name=body.name,
        key_hash=key_hash,
        key_prefix=key_prefix,
        rate_limit_per_min=body.rate_limit_per_min,
    )
    db.add(api_key)
    await db.commit()

    return {
        "api_key": plaintext,
        "key_prefix": key_prefix,
        "tenant_id": target_tenant_id,
        "warning": "Save this key - it will only be shown once",
    }


@router.get("/audit", response_model=List[AuditLogResponse])
async def get_audit_logs(
    tenant_id: TenantID,
    db: DBSession,
    limit: int = 100,
    offset: int = 0,
):
    """Get audit logs for tenant."""
    stmt = (
        select(AuditLog)
        .where(AuditLog.tenant_id == tenant_id)
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/metrics")
async def get_metrics(
    tenant_id: TenantID,
    db: DBSession,
):
    """Get usage metrics for tenant."""
    from app.core.models import Invoice, Expense, Conversation

    # Count records
    stmt = select(func.count(Invoice.id)).where(Invoice.tenant_id == tenant_id)
    invoice_count = (await db.execute(stmt)).scalar() or 0

    stmt = select(func.count(Expense.id)).where(Expense.tenant_id == tenant_id)
    expense_count = (await db.execute(stmt)).scalar() or 0

    stmt = select(func.count(Conversation.id)).where(Conversation.tenant_id == tenant_id)
    conversation_count = (await db.execute(stmt)).scalar() or 0

    return {
        "tenant_id": tenant_id,
        "invoices": invoice_count,
        "expenses": expense_count,
        "conversations": conversation_count,
    }
