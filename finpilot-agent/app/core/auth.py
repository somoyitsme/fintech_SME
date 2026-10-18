"""API key authentication and rate limiting.

Provides:
- ``get_tenant_id()``: FastAPI dependency extracting tenant ID from X-API-Key
- ``get_tenant_context()``: Returns full tenant + key metadata for audit
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.crypto import verify_api_key
from app.core.db import DBSession
from app.core.models import ApiKey, Tenant


class TenantContext:
    """Authenticated request context."""

    def __init__(
        self,
        tenant_id: str,
        tenant: Tenant,
        api_key: ApiKey,
        ip_address: Optional[str] = None,
    ):
        self.tenant_id = tenant_id
        self.tenant = tenant
        self.api_key = api_key
        self.ip_address = ip_address


async def get_tenant_id(
    request: Request,
    db: DBSession,
) -> str:
    """Extract and validate tenant ID from X-API-Key header.

    Raises:
        HTTPException(401): Missing or invalid API key
        HTTPException(429): Rate limit exceeded
    """
    api_key_header = request.headers.get("X-API-Key")
    if not api_key_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing X-API-Key header",
        )

    if not api_key_header.startswith("fp_live_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key format",
        )

    # Extract prefix for O(1) lookup candidate
    prefix = api_key_header[:16]
    stmt = select(ApiKey).where(ApiKey.key_prefix == prefix, ApiKey.is_active == True)
    result = await db.execute(stmt)
    api_key_record = result.scalar_one_or_none()

    if not api_key_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )

    # Verify full key hash
    if not verify_api_key(api_key_header, api_key_record.key_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )

    # Rate limiting check (simple per-key sliding window)
    if api_key_record.last_used_at and api_key_record.rate_limit_per_min:
        # Ensure both datetimes are timezone-aware
        now = datetime.now(timezone.utc)
        last_used = api_key_record.last_used_at
        if last_used.tzinfo is None:
            last_used = last_used.replace(tzinfo=timezone.utc)

        time_since_last = now - last_used
        min_interval = timedelta(seconds=60 / max(api_key_record.rate_limit_per_min, 1))
        if time_since_last < min_interval:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded: {api_key_record.rate_limit_per_min} requests/min",
            )

    # Update last_used_at
    await db.execute(
        update(ApiKey)
        .where(ApiKey.id == api_key_record.id)
        .values(last_used_at=datetime.now(timezone.utc))
    )
    await db.commit()

    return api_key_record.tenant_id


async def get_tenant_context(
    request: Request,
    tenant_id: Annotated[str, Depends(get_tenant_id)],
    db: DBSession,
) -> TenantContext:
    """Full authenticated context for audit logging and scoping."""
    stmt = select(Tenant).where(Tenant.id == tenant_id)
    result = await db.execute(stmt)
    tenant = result.scalar_one_or_none()

    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found",
        )

    # Retrieve API key (already validated by get_tenant_id)
    api_key_header = request.headers.get("X-API-Key", "")
    prefix = api_key_header[:16]
    stmt_key = select(ApiKey).where(ApiKey.key_prefix == prefix, ApiKey.tenant_id == tenant_id)
    result_key = await db.execute(stmt_key)
    api_key = result_key.scalar_one()

    ip_address = request.client.host if request.client else None

    return TenantContext(
        tenant_id=tenant_id,
        tenant=tenant,
        api_key=api_key,
        ip_address=ip_address,
    )


TenantID = Annotated[str, Depends(get_tenant_id)]
TenantCtx = Annotated[TenantContext, Depends(get_tenant_context)]
