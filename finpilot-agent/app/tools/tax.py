"""Pillar 5: Tax Estimation & Compliance Tools (4 tools)."""
from datetime import date, timedelta
from decimal import Decimal
from typing import Any

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import Invoice, Expense
from app.security.permissions import PermissionTier
from app.tools.registry import ToolDef


async def reconcile_vat(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Reconcile input/output VAT (China VAT 13%)."""

    days = args.get("days", 90)
    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    # Output VAT (from sales)
    stmt = select(func.sum(Invoice.amount)).where(
        Invoice.tenant_id == tenant_id,
        Invoice.status == "paid",
        Invoice.paid_date >= start_date,
        Invoice.paid_date <= end_date,
    )
    result = await db.execute(stmt)
    sales = float(result.scalar() or Decimal("0"))
    output_vat = sales * 0.13 / 1.13  # VAT-exclusive calculation

    # Input VAT (from purchases, deductible expenses)
    stmt = select(func.sum(Expense.amount)).where(
        Expense.tenant_id == tenant_id,
        Expense.is_deductible == True,
        Expense.expense_date >= start_date,
        Expense.expense_date <= end_date,
    )
    result = await db.execute(stmt)
    purchases = float(result.scalar() or Decimal("0"))
    input_vat = purchases * 0.13 / 1.13

    net_vat = output_vat - input_vat

    return {
        "period_days": days,
        "sales": round(sales, 2),
        "output_vat": round(output_vat, 2),
        "purchases": round(purchases, 2),
        "input_vat": round(input_vat, 2),
        "net_vat_payable": round(net_vat, 2),
        "vat_rate": 13.0,
        "currency": "CNY",
    }


async def estimate_cit_preferential(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Estimate Corporate Income Tax with SME preferential rate."""

    from app.tools.health import profit_loss_summary
    pl = await profit_loss_summary(tenant_id, db, {"days": 365})

    taxable_income = pl["net_profit"]

    # China SME preferential: taxable income ≤¥3M → 5% effective (25% × 20%)
    # Taxable income >¥3M → standard 25%
    if taxable_income <= 3_000_000:
        cit_rate = 5.0
        tax = taxable_income * 0.05
        bracket = "SME preferential (5%)"
    else:
        cit_rate = 25.0
        tax = taxable_income * 0.25
        bracket = "Standard (25%)"

    return {
        "taxable_income": round(taxable_income, 2),
        "cit_rate_pct": cit_rate,
        "estimated_cit": round(tax, 2),
        "bracket": bracket,
        "currency": "CNY",
    }


async def validate_deductible_expenses(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Validate deductible vs non-deductible expenses."""

    result = await db.execute(
        select(func.sum(Expense.amount), Expense.is_deductible)
        .where(Expense.tenant_id == tenant_id)
        .group_by(Expense.is_deductible)
    )
    rows = result.all()

    deductible = 0.0
    non_deductible = 0.0

    for amount, is_ded in rows:
        if is_ded:
            deductible += float(amount or Decimal("0"))
        else:
            non_deductible += float(amount or Decimal("0"))

    return {
        "deductible_total": round(deductible, 2),
        "non_deductible_total": round(non_deductible, 2),
        "total": round(deductible + non_deductible, 2),
        "deductible_pct": round(deductible / (deductible + non_deductible) * 100, 1) if (deductible + non_deductible) > 0 else 0,
        "currency": "CNY",
    }


async def compliance_calendar(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Generate upcoming tax compliance deadlines."""

    today = date.today()

    # China tax deadlines (monthly)
    deadlines = [
        {"tax_type": "VAT", "due_date": (today.replace(day=15) + timedelta(days=30)).replace(day=15).isoformat(), "note": "Monthly VAT filing"},
        {"tax_type": "CIT (Prepayment)", "due_date": (today.replace(day=15) + timedelta(days=15)).replace(day=15).isoformat(), "note": "Quarterly CIT prepayment"},
        {"tax_type": "IIT", "due_date": today.replace(day=15).isoformat(), "note": "Individual income tax withholding"},
    ]

    upcoming = []
    for d in deadlines:
        due = date.fromisoformat(d["due_date"])
        if due >= today:
            days_until = (due - today).days
            d["days_until"] = days_until
            d["is_urgent"] = days_until <= 7
            upcoming.append(d)

    return {
        "today": today.isoformat(),
        "upcoming_deadlines": upcoming,
        "count": len(upcoming),
    }


vat_tool = ToolDef(
    name="reconcile_vat",
    pillar="tax",
    description="Reconcile input/output VAT (China VAT 13%)",
    input_schema={"type": "object", "properties": {"days": {"type": "integer", "description": "Period in days (default 90)"}}},
    tier=PermissionTier.AUTONOMOUS,
    handler=reconcile_vat,
)

cit_tool = ToolDef(
    name="estimate_cit_preferential",
    pillar="tax",
    description="Estimate Corporate Income Tax with SME preferential rate (5% if taxable ≤¥3M, else 25%)",
    input_schema={"type": "object", "properties": {}},
    tier=PermissionTier.AUTONOMOUS,
    handler=estimate_cit_preferential,
)

deductible_tool = ToolDef(
    name="validate_deductible_expenses",
    pillar="tax",
    description="Validate deductible vs non-deductible expenses for CIT",
    input_schema={"type": "object", "properties": {}},
    tier=PermissionTier.AUTONOMOUS,
    handler=validate_deductible_expenses,
)

compliance_tool = ToolDef(
    name="compliance_calendar",
    pillar="tax",
    description="Generate upcoming tax compliance deadlines (VAT, CIT, IIT)",
    input_schema={"type": "object", "properties": {}},
    tier=PermissionTier.AUTONOMOUS,
    handler=compliance_calendar,
)
