"""Multi-tenant Row-Level Security enforcement.

CRITICAL: All database queries MUST go through these helpers.
Any attempt to access a resource belonging to another tenant
raises ``CrossTenantViolation`` and triggers a security audit.
"""
from __future__ import annotations

from typing import Type, TypeVar

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import (
    AuditLog,
    BankAccount,
    CashFlow,
    Client,
    Conversation,
    Expense,
    Invoice,
    Message,
    PendingAction,
    User,
)
from app.core.crypto import sign_audit_log

# Explicit list of tenant-scoped models
TENANT_SCOPED_MODELS = [
    User,
    Client,
    Invoice,
    Expense,
    CashFlow,
    BankAccount,
    Conversation,
    Message,
    PendingAction,
]


class CrossTenantViolation(Exception):
    """Raised when a resource belonging to another tenant is accessed."""

    def __init__(self, resource_type: str, resource_id: str, tenant_id: str):
        self.resource_type = resource_type
        self.resource_id = resource_id
        self.tenant_id = tenant_id
        super().__init__(
            f"Cross-tenant access attempt: {resource_type}={resource_id} "
            f"by tenant={tenant_id}"
        )


async def _log_security_event(
    db: AsyncSession,
    tenant_id: str,
    action: str,
    resource_type: str,
    resource_id: str,
    details: dict,
):
    """Log a security event to the audit trail."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    signature = sign_audit_log(tenant_id, action, "blocked", now.isoformat())

    audit = AuditLog(
        tenant_id=tenant_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        permission_tier="restricted",
        outcome="blocked",
        details=details,
        signature=signature,
        created_at=now,
    )
    db.add(audit)
    await db.commit()


async def get_tenant_scoped(
    db: AsyncSession,
    model: Type,
    tenant_id: str,
    resource_id: str,
) -> object:
    """Fetch a resource by ID, enforcing tenant ownership.

    Raises:
        CrossTenantViolation: If resource belongs to a different tenant
    """
    stmt = select(model).where(
        model.id == resource_id,
        model.tenant_id == tenant_id,
    )
    result = await db.execute(stmt)
    resource = result.scalar_one_or_none()

    if resource is None:
        # Check if resource exists under a different tenant (violation)
        stmt_any = select(model).where(model.id == resource_id)
        result_any = await db.execute(stmt_any)
        exists = result_any.scalar_one_or_none()

        if exists is not None:
            await _log_security_event(
                db,
                tenant_id,
                action="SECURITY_CROSS_TENANT_ACCESS",
                resource_type=model.__name__,
                resource_id=resource_id,
                details={"attempted_tenant": tenant_id, "violation": "resource_belongs_to_other_tenant"},
            )
            raise CrossTenantViolation(model.__name__, resource_id, tenant_id)

        # Resource does not exist at all — don't leak existence
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{model.__name__} not found",
        )

    return resource


async def list_tenant_scoped(
    db: AsyncSession,
    model: Type,
    tenant_id: str,
    limit: int = 1000,
    offset: int = 0,
):
    """List all resources for a tenant with automatic scoping."""
    stmt = (
        select(model)
        .where(model.tenant_id == tenant_id)
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


def assert_tenant(resource, tenant_id: str) -> None:
    """Assert that a resource belongs to the given tenant."""
    if resource is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    if resource.tenant_id != tenant_id:
        raise CrossTenantViolation(
            resource.__class__.__name__,
            resource.id,
            tenant_id,
        )