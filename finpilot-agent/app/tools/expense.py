"""Pillar 6: Expense Optimization & Unit Economics Tools (4 tools)."""
from datetime import date, timedelta
from decimal import Decimal
from typing import Any

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import Expense
from app.security.permissions import PermissionTier
from app.tools.registry import ToolDef


async def categorize_recurring_opex(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Categorize and summarize recurring operating expenses."""

    result = await db.execute(
        select(Expense.category, func.count(Expense.id), func.sum(Expense.amount))
        .where(
            Expense.tenant_id == tenant_id,
            Expense.is_recurring == True,
        )
        .group_by(Expense.category)
    )
    rows = result.all()

    categories = []
    total = 0.0

    for category, count, amount in rows:
        cat_amount = float(amount or Decimal("0"))
        total += cat_amount
        categories.append({
            "category": category,
            "count": count,
            "amount": round(cat_amount, 2),
        })

    # Sort by amount descending
    categories.sort(key=lambda x: x["amount"], reverse=True)

    return {
        "recurring_expenses": categories,
        "total_recurring": round(total, 2),
        "category_count": len(categories),
        "currency": "CNY",
    }


async def detect_anomaly_spikes(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Detect anomalous expense spikes compared to historical average."""

    days = args.get("days", 30)
    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    # Current period expenses
    result = await db.execute(
        select(Expense.category, func.sum(Expense.amount))
        .where(
            Expense.tenant_id == tenant_id,
            Expense.expense_date >= start_date,
            Expense.expense_date <= end_date,
        )
        .group_by(Expense.category)
    )
    current = {cat: float(amt or Decimal("0")) for cat, amt in result.all()}

    # Historical average (previous 90 days)
    hist_start = start_date - timedelta(days=90)
    hist_end = start_date - timedelta(days=1)
    result = await db.execute(
        select(Expense.category, func.sum(Expense.amount))
        .where(
            Expense.tenant_id == tenant_id,
            Expense.expense_date >= hist_start,
            Expense.expense_date <= hist_end,
        )
        .group_by(Expense.category)
    )
    historical = {cat: float(amt or Decimal("0")) / 90 * days for cat, amt in result.all()}

    # Detect anomalies (>50% increase)
    anomalies = []
    for category in current:
        hist_avg = historical.get(category, 0.0)
        curr_amt = current[category]

        if hist_avg > 0:
            pct_change = ((curr_amt - hist_avg) / hist_avg) * 100
            if pct_change > 50:
                anomalies.append({
                    "category": category,
                    "current_amount": round(curr_amt, 2),
                    "historical_avg": round(hist_avg, 2),
                    "percent_increase": round(pct_change, 1),
                })

    return {
        "anomalies": anomalies,
        "anomaly_count": len(anomalies),
        "period_days": days,
        "currency": "CNY",
    }


async def compute_unit_economics(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Compute unit economics (cost per unit sold, based on revenue/expense ratio)."""

    from app.tools.health import profit_loss_summary

    pl = await profit_loss_summary(tenant_id, db, {"days": 90})

    # Simplified: assume each invoice is a "unit" sold
    from app.core.models import Invoice
    result = await db.execute(
        select(func.count(Invoice.id))
        .where(
            Invoice.tenant_id == tenant_id,
            Invoice.status == "paid",
            Invoice.paid_date >= date.today() - timedelta(days=90),
        )
    )
    unit_count = result.scalar() or 1

    revenue = pl["revenue"]
    expenses = pl["expenses"]

    revenue_per_unit = revenue / unit_count
    cost_per_unit = expenses / unit_count
    profit_per_unit = revenue_per_unit - cost_per_unit

    return {
        "units_sold": unit_count,
        "revenue_per_unit": round(revenue_per_unit, 2),
        "cost_per_unit": round(cost_per_unit, 2),
        "profit_per_unit": round(profit_per_unit, 2),
        "unit_margin_pct": round((profit_per_unit / revenue_per_unit * 100), 2) if revenue_per_unit > 0 else 0,
        "currency": "CNY",
    }


async def recommend_cost_cuts(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Recommend cost-cutting opportunities based on expense analysis."""

    recurring = await categorize_recurring_opex(tenant_id, db, {})
    anomalies = await detect_anomaly_spikes(tenant_id, db, {"days": 30})

    recommendations = []

    # High recurring expenses
    if recurring["recurring_expenses"]:
        top = recurring["recurring_expenses"][0]
        if top["amount"] > 50000:
            recommendations.append({
                "priority": "high",
                "category": top["category"],
                "action": "Negotiate vendor rates or seek alternative suppliers",
                "potential_savings": round(top["amount"] * 0.15, 2),
                "reason": f"Highest recurring expense category (¥{top['amount']:,.2f}/period)",
            })

    # Anomalous spikes
    for anomaly in anomalies["anomalies"]:
        recommendations.append({
            "priority": "medium",
            "category": anomaly["category"],
            "action": "Investigate spike and implement spending controls",
            "potential_savings": round(anomaly["current_amount"] - anomaly["historical_avg"], 2),
            "reason": f"{anomaly['percent_increase']:.1f}% increase vs historical average",
        })

    # Generic recommendations
    if not recommendations:
        recommendations.append({
            "priority": "low",
            "category": "General",
            "action": "Audit subscription services and eliminate unused licenses",
            "potential_savings": 5000,
            "reason": "Standard cost optimization best practice",
        })

    return {
        "recommendations": recommendations,
        "total_potential_savings": sum(r["potential_savings"] for r in recommendations),
        "count": len(recommendations),
        "currency": "CNY",
    }


categorize_opex_tool = ToolDef(
    name="categorize_recurring_opex",
    pillar="expense",
    description="Categorize and summarize recurring operating expenses",
    input_schema={"type": "object", "properties": {}},
    tier=PermissionTier.AUTONOMOUS,
    handler=categorize_recurring_opex,
)

anomaly_tool = ToolDef(
    name="detect_anomaly_spikes",
    pillar="expense",
    description="Detect anomalous expense spikes (>50% increase vs historical)",
    input_schema={"type": "object", "properties": {"days": {"type": "integer", "description": "Analysis period (default 30)"}}},
    tier=PermissionTier.AUTONOMOUS,
    handler=detect_anomaly_spikes,
)

unit_econ_tool = ToolDef(
    name="compute_unit_economics",
    pillar="expense",
    description="Compute unit economics (cost per unit, profit per unit)",
    input_schema={"type": "object", "properties": {}},
    tier=PermissionTier.AUTONOMOUS,
    handler=compute_unit_economics,
)

cost_cuts_tool = ToolDef(
    name="recommend_cost_cuts",
    pillar="expense",
    description="Recommend cost-cutting opportunities with potential savings",
    input_schema={"type": "object", "properties": {}},
    tier=PermissionTier.AUTONOMOUS,
    handler=recommend_cost_cuts,
)
