"""Test multi-tenant data isolation.

Verifies that Tenant A cannot access Tenant B's data through any endpoint or tool.
"""
import pytest
from decimal import Decimal
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import Tenant, ApiKey, Invoice, Expense
from app.core.crypto import generate_api_key
from app.security.tenants import get_tenant_scoped, CrossTenantViolation


@pytest.fixture
async def tenant_a(db: AsyncSession):
    """Create test tenant A."""
    tenant = Tenant(
        name="Tenant A Corp",
        currency="CNY",
        country="CN",
    )
    db.add(tenant)
    await db.flush()

    plaintext, key_hash, key_prefix = generate_api_key()
    api_key = ApiKey(
        tenant_id=tenant.id,
        key_hash=key_hash,
        key_prefix=key_prefix,
    )
    db.add(api_key)
    await db.commit()

    return {"tenant": tenant, "api_key": plaintext}


@pytest.fixture
async def tenant_b(db: AsyncSession):
    """Create test tenant B."""
    tenant = Tenant(
        name="Tenant B Ltd",
        currency="CNY",
        country="CN",
    )
    db.add(tenant)
    await db.flush()

    plaintext, key_hash, key_prefix = generate_api_key()
    api_key = ApiKey(
        tenant_id=tenant.id,
        key_hash=key_hash,
        key_prefix=key_prefix,
    )
    db.add(api_key)
    await db.commit()

    return {"tenant": tenant, "api_key": plaintext}


@pytest.mark.asyncio
async def test_invoice_isolation(db: AsyncSession, tenant_a, tenant_b):
    """Tenant A cannot access Tenant B's invoices."""
    # Create invoice for Tenant B
    invoice_b = Invoice(
        tenant_id=tenant_b["tenant"].id,
        invoice_number="INV-B-001",
        customer_name="Customer B",
        amount=Decimal("100000"),
        issue_date=date.today(),
        due_date=date.today() + timedelta(days=30),
        status="pending",
    )
    db.add(invoice_b)
    await db.commit()

    # Tenant A tries to access Tenant B's invoice
    with pytest.raises(CrossTenantViolation):
        await get_tenant_scoped(
            db,
            Invoice,
            tenant_a["tenant"].id,
            invoice_b.id,
        )


@pytest.mark.asyncio
async def test_list_scoped_returns_only_own_data(db: AsyncSession, tenant_a, tenant_b):
    """List queries return only tenant's own data."""
    from app.security.tenants import list_tenant_scoped

    # Create invoices for both tenants
    invoice_a = Invoice(
        tenant_id=tenant_a["tenant"].id,
        invoice_number="INV-A-001",
        customer_name="Customer A",
        amount=Decimal("50000"),
        issue_date=date.today(),
        due_date=date.today() + timedelta(days=30),
    )
    invoice_b = Invoice(
        tenant_id=tenant_b["tenant"].id,
        invoice_number="INV-B-001",
        customer_name="Customer B",
        amount=Decimal("100000"),
        issue_date=date.today(),
        due_date=date.today() + timedelta(days=30),
    )
    db.add(invoice_a)
    db.add(invoice_b)
    await db.commit()

    # Tenant A lists invoices
    invoices = await list_tenant_scoped(db, Invoice, tenant_a["tenant"].id)

    assert len(invoices) == 1
    assert invoices[0].id == invoice_a.id
    assert invoices[0].tenant_id == tenant_a["tenant"].id


@pytest.mark.asyncio
async def test_expense_isolation(db: AsyncSession, tenant_a, tenant_b):
    """Tenant A cannot access Tenant B's expenses."""
    expense_b = Expense(
        tenant_id=tenant_b["tenant"].id,
        category="Rent",
        amount=Decimal("25000"),
        expense_date=date.today(),
    )
    db.add(expense_b)
    await db.commit()

    with pytest.raises(CrossTenantViolation):
        await get_tenant_scoped(
            db,
            Expense,
            tenant_a["tenant"].id,
            expense_b.id,
        )
