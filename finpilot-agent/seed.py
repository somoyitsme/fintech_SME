"""Seed database with a realistic Shenzhen SME demo tenant.

Creates:
- Demo tenant "Shenzhen Tech Hardware Co., Ltd"
- API key: fp_live_demo_key_000000000000
- Invoices, expenses, bank account with CNY data
"""
import asyncio
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import AsyncSession, init_db
from app.core.crypto import generate_api_key
from app.core.models import (
    ApiKey,
    BankAccount,
    Client,
    Expense,
    Invoice,
    Tenant,
)


async def seed():
    """Seed demo tenant with realistic data."""
    await init_db()

    async with AsyncSession() as session:
        # Check if already seeded
        stmt = select(Tenant).where(Tenant.name == "Shenzhen Tech Hardware Co., Ltd")
        existing = (await session.execute(stmt)).scalar_one_or_none()

        if existing:
            print(f"Tenant already exists: {existing.id}")
            return

        # Create tenant
        tenant = Tenant(
            name="Shenzhen Tech Hardware Co., Ltd",
            domain="sztech.example.com",
            country="CN",
            currency="CNY",
            industry="Electronics Manufacturing",
            settings={"timezone": "Asia/Shanghai"},
        )
        session.add(tenant)
        await session.flush()

        # Create API key
        plaintext, key_hash, key_prefix = generate_api_key()
        api_key = ApiKey(
            tenant_id=tenant.id,
            name="demo-key",
            key_hash=key_hash,
            key_prefix=key_prefix,
            scopes={"read": True, "write": True, "admin": False},
            rate_limit_per_min=600,  # 10 req/sec - generous for demo
        )
        session.add(api_key)

        # Create bank account
        bank = BankAccount(
            tenant_id=tenant.id,
            account_name="Operating Account",
            bank_name="WeBank",
            account_number_masked="****-****-****-1234",
            balance=Decimal("285000.00"),
            currency="CNY",
            as_of=date.today(),
        )
        session.add(bank)

        # Create clients
        client_a = Client(
            tenant_id=tenant.id,
            name="Shenzhen Electronics Ltd",
            contact_email="ap@sz-electronics.example.com",
            tax_id="91440300MA5XXXXXX",
            payment_terms_days=30,
            credit_limit=Decimal("500000"),
        )
        client_b = Client(
            tenant_id=tenant.id,
            name="Guangzhou Tech Solutions",
            contact_email="finance@gz-tech.example.com",
            payment_terms_days=45,
            credit_limit=Decimal("300000"),
        )
        session.add(client_a)
        session.add(client_b)
        await session.flush()

        # Create invoices (mix of paid and pending)
        today = date.today()
        invoices = [
            # Paid invoices
            Invoice(
                tenant_id=tenant.id,
                client_id=client_a.id,
                invoice_number="INV-2026-001",
                customer_name="Shenzhen Electronics Ltd",
                amount=Decimal("180000.00"),
                tax_rate=Decimal("0.13"),
                issue_date=today - timedelta(days=60),
                due_date=today - timedelta(days=30),
                paid_date=today - timedelta(days=25),
                status="paid",
            ),
            Invoice(
                tenant_id=tenant.id,
                client_id=client_b.id,
                invoice_number="INV-2026-002",
                customer_name="Guangzhou Tech Solutions",
                amount=Decimal("220000.00"),
                tax_rate=Decimal("0.13"),
                issue_date=today - timedelta(days=45),
                due_date=today - timedelta(days=15),
                paid_date=today - timedelta(days=10),
                status="paid",
            ),
            # Pending (overdue)
            Invoice(
                tenant_id=tenant.id,
                client_id=client_a.id,
                invoice_number="INV-2026-003",
                customer_name="Shenzhen Electronics Ltd",
                amount=Decimal("150000.00"),
                tax_rate=Decimal("0.13"),
                issue_date=today - timedelta(days=90),
                due_date=today - timedelta(days=60),
                status="pending",
            ),
            # Pending (current)
            Invoice(
                tenant_id=tenant.id,
                client_id=client_b.id,
                invoice_number="INV-2026-004",
                customer_name="Guangzhou Tech Solutions",
                amount=Decimal("180000.00"),
                tax_rate=Decimal("0.13"),
                issue_date=today - timedelta(days=35),
                due_date=today - timedelta(days=5),
                status="pending",
            ),
            Invoice(
                tenant_id=tenant.id,
                client_id=client_a.id,
                invoice_number="INV-2026-005",
                customer_name="Shenzhen Electronics Ltd",
                amount=Decimal("250000.00"),
                tax_rate=Decimal("0.13"),
                issue_date=today - timedelta(days=15),
                due_date=today + timedelta(days=15),
                status="pending",
            ),
        ]
        for inv in invoices:
            session.add(inv)

        # Create expenses
        expenses = [
            Expense(
                tenant_id=tenant.id,
                category="Rent",
                vendor="Shenzhen Office Park",
                description="Monthly office rent",
                amount=Decimal("25000.00"),
                expense_date=today - timedelta(days=30),
                is_recurring=True,
                is_deductible=True,
            ),
            Expense(
                tenant_id=tenant.id,
                category="Salaries",
                vendor=None,
                description="Monthly payroll (15 employees)",
                amount=Decimal("180000.00"),
                expense_date=today - timedelta(days=30),
                is_recurring=True,
                is_deductible=True,
            ),
            Expense(
                tenant_id=tenant.id,
                category="Raw Materials",
                vendor="Dongguan Components Co",
                description="PCB components",
                amount=Decimal("85000.00"),
                expense_date=today - timedelta(days=20),
                is_recurring=False,
                is_deductible=True,
            ),
            Expense(
                tenant_id=tenant.id,
                category="Utilities",
                vendor="Shenzhen Power Grid",
                description="Electricity bill",
                amount=Decimal("8500.00"),
                expense_date=today - timedelta(days=25),
                is_recurring=True,
                is_deductible=True,
            ),
            Expense(
                tenant_id=tenant.id,
                category="Software Subscriptions",
                vendor="Various SaaS",
                description="Cloud hosting, tools",
                amount=Decimal("12000.00"),
                expense_date=today - timedelta(days=15),
                is_recurring=True,
                is_deductible=True,
            ),
        ]
        for exp in expenses:
            session.add(exp)

        await session.commit()

        print("\n" + "="*60)
        print("Seed completed successfully!")
        print("="*60)
        print(f"Tenant ID:   {tenant.id}")
        print(f"Tenant Name: {tenant.name}")
        print(f"API Key:     {plaintext}")
        print(f"Key Prefix:  {key_prefix}")
        print("="*60)
        print("\nSave this API key - it will only be shown once!")


if __name__ == "__main__":
    asyncio.run(seed())