"""Tenant context builder: assembles sanitized, tenant-scoped data for LLM.

CRITICAL: This module ONLY reads through tenant-scoped queries.
No cross-tenant data can ever enter the LLM context window.
"""
from __future__ import annotations

from typing import Any

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import (
    BankAccount,
    CashFlow,
    Client,
    Conversation,
    Expense,
    Invoice,
    Message,
)
from app.security.pii import redact_pii


async def build_tenant_context(tenant_id: str, db: AsyncSession) -> dict[str, Any]:
    """Build a sanitized context snapshot for the LLM.

    Every query below is scoped by tenant_id — no cross-tenant leakage.
    """
    from datetime import date, timedelta

    today = date.today()

    # Tenant info
    stmt = select(func.count(Invoice.id)).where(Invoice.tenant_id == tenant_id)
    result = await db.execute(stmt)
    total_invoices = result.scalar() or 0

    stmt = select(func.count(Expense.id)).where(Expense.tenant_id == tenant_id)
    result = await db.execute(stmt)
    total_expenses = result.scalar() or 0

    # Bank position
    stmt = select(BankAccount).where(BankAccount.tenant_id == tenant_id).order_by(BankAccount.as_of.desc()).limit(1)
    result = await db.execute(stmt)
    account = result.scalar_one_or_none()

    context: dict[str, Any] = {
        "today": today.isoformat(),
        "data_summary": {
            "total_invoices": total_invoices,
            "total_expenses": total_expenses,
            "has_bank_data": account is not None,
        },
    }

    if account:
        context["bank_position"] = {
            "balance": float(account.balance),
            "currency": account.currency,
            "as_of": account.as_of.isoformat(),
        }

    # Recent pending invoices (overdue and upcoming)
    stmt = (
        select(Invoice)
        .where(
            Invoice.tenant_id == tenant_id,
            Invoice.status == "pending",
        )
        .order_by(Invoice.due_date)
        .limit(20)
    )
    result = await db.execute(stmt)
    pending = result.scalars().all()

    if pending:
        context["pending_invoices_summary"] = {
            "count": len(pending),
            "total_amount": round(sum(float(i.amount) for i in pending), 2),
            "oldest_due": min(i.due_date for i in pending).isoformat(),
            "sample": [
                {
                    "customer": redact_pii(i.customer_name)[:50],
                    "amount": float(i.amount),
                    "due_date": i.due_date.isoformat(),
                    "days_overdue": max((today - i.due_date).days, 0),
                }
                for i in pending[:5]
            ],
        }

    return context


async def load_conversation_history(
    tenant_id: str, conversation_id: str, db: AsyncSession, limit: int = 10
) -> list[dict]:
    """Load recent conversation messages, tenant-scoped."""
    stmt = (
        select(Message)
        .where(
            Message.tenant_id == tenant_id,
            Message.conversation_id == conversation_id,
        )
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    messages = result.scalars().all()

    return [
        {"role": m.role, "content": m.content, "timestamp": m.created_at.isoformat()}
        for m in reversed(messages)
    ]