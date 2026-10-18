"""Data sync API: external SME sites push data here."""
from fastapi import APIRouter, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import TenantID
from app.core.db import DBSession
from app.core.models import Invoice, Expense
from app.core.schemas import SyncRequest

router = APIRouter(prefix="/api/v1", tags=["sync"])


@router.post("/sync")
async def sync_data(
    body: SyncRequest,
    tenant_id: TenantID,
    db: DBSession,
):
    """Sync invoices and expenses from external SME systems."""
    synced_invoices = 0
    synced_expenses = 0

    # Sync invoices
    for inv_data in body.invoices:
        # Check if invoice already exists by invoice_number
        from sqlalchemy import select
        stmt = select(Invoice).where(
            Invoice.tenant_id == tenant_id,
            Invoice.invoice_number == inv_data.invoice_number,
        )
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()

        if not existing:
            invoice = Invoice(
                tenant_id=tenant_id,
                invoice_number=inv_data.invoice_number,
                customer_name=inv_data.customer_name,
                amount=inv_data.amount,
                tax_rate=inv_data.tax_rate,
                currency=inv_data.currency,
                issue_date=inv_data.issue_date,
                due_date=inv_data.due_date,
                status=inv_data.status,
            )
            db.add(invoice)
            synced_invoices += 1

    # Sync expenses
    for exp_data in body.expenses:
        expense = Expense(
            tenant_id=tenant_id,
            category=exp_data.category,
            vendor=exp_data.vendor,
            description=exp_data.description,
            amount=exp_data.amount,
            currency=exp_data.currency,
            expense_date=exp_data.expense_date,
            is_recurring=exp_data.is_recurring,
            is_deductible=exp_data.is_deductible,
        )
        db.add(expense)
        synced_expenses += 1

    await db.commit()

    return {
        "synced_invoices": synced_invoices,
        "synced_expenses": synced_expenses,
        "status": "ok",
    }
