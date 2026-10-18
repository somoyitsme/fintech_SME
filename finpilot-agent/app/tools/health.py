"""Pillar 3: Financial Health Analysis Tools (6 tools)."""
from datetime import date, timedelta
from decimal import Decimal
from typing import Any

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import Invoice, Expense, CashFlow, BankAccount, Client
from app.security.permissions import PermissionTier
from app.tools.registry import ToolDef


async def profit_loss_summary(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Generate P&L summary for trailing period."""
    days = args.get("days", 90)
    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    # Revenue (paid invoices)
    stmt = select(func.sum(Invoice.amount)).where(
        Invoice.tenant_id == tenant_id,
        Invoice.status == "paid",
        Invoice.paid_date >= start_date,
        Invoice.paid_date <= end_date,
    )
    result = await db.execute(stmt)
    revenue = float(result.scalar() or Decimal("0"))

    # Expenses
    stmt = select(func.sum(Expense.amount)).where(
        Expense.tenant_id == tenant_id,
        Expense.expense_date >= start_date,
        Expense.expense_date <= end_date,
    )
    result = await db.execute(stmt)
    expenses = float(result.scalar() or Decimal("0"))

    net = revenue - expenses

    return {
        "period_days": days,
        "revenue": round(revenue, 2),
        "expenses": round(expenses, 2),
        "net_profit": round(net, 2),
        "currency": "CNY",
    }


async def compute_margins(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Calculate gross and net margins."""
    pl = await profit_loss_summary(tenant_id, db, {"days": 90})

    revenue = pl["revenue"]
    expenses = pl["expenses"]
    net = pl["net_profit"]

    # Assume COGS is 60% of expenses for SME (simplified)
    cogs = expenses * 0.60
    gross_profit = revenue - cogs
    gross_margin = (gross_profit / revenue * 100) if revenue > 0 else 0
    net_margin = (net / revenue * 100) if revenue > 0 else 0

    return {
        "gross_margin_pct": round(gross_margin, 2),
        "net_margin_pct": round(net_margin, 2),
        "gross_profit": round(gross_profit, 2),
        "net_profit": round(net, 2),
        "currency": "CNY",
    }


async def compute_working_capital(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Calculate working capital ratio."""

    # Current assets (bank + pending invoices)
    stmt = select(BankAccount).where(BankAccount.tenant_id == tenant_id).order_by(BankAccount.as_of.desc()).limit(1)
    result = await db.execute(stmt)
    account = result.scalar_one_or_none()
    cash = float(account.balance) if account else 0.0

    stmt = select(func.sum(Invoice.amount)).where(
        Invoice.tenant_id == tenant_id,
        Invoice.status == "pending",
    )
    result = await db.execute(stmt)
    receivables = float(result.scalar() or Decimal("0"))

    current_assets = cash + receivables

    # Current liabilities (trailing 30-day expenses as proxy)
    stmt = select(func.sum(Expense.amount)).where(
        Expense.tenant_id == tenant_id,
        Expense.expense_date >= date.today() - timedelta(days=30),
    )
    result = await db.execute(stmt)
    current_liabilities = float(result.scalar() or Decimal("0"))

    ratio = (current_assets / current_liabilities) if current_liabilities > 0 else float("inf")

    return {
        "current_assets": round(current_assets, 2),
        "current_liabilities": round(current_liabilities, 2),
        "working_capital_ratio": round(ratio, 2) if ratio != float("inf") else None,
        "health": "healthy" if ratio >= 1.5 else "adequate" if ratio >= 1.0 else "poor",
        "currency": "CNY",
    }


async def compute_dso(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Calculate Days Sales Outstanding."""

    # Revenue (last 90 days)
    stmt = select(func.sum(Invoice.amount)).where(
        Invoice.tenant_id == tenant_id,
        Invoice.status.in_(["paid", "pending"]),
        Invoice.issue_date >= date.today() - timedelta(days=90),
    )
    result = await db.execute(stmt)
    revenue_90 = float(result.scalar() or Decimal("0"))

    # Accounts receivable (pending)
    stmt = select(func.sum(Invoice.amount)).where(
        Invoice.tenant_id == tenant_id,
        Invoice.status == "pending",
    )
    result = await db.execute(stmt)
    ar = float(result.scalar() or Decimal("0"))

    dso = (ar / (revenue_90 / 90)) if revenue_90 > 0 else 0

    return {
        "dso_days": round(dso, 1),
        "accounts_receivable": round(ar, 2),
        "avg_daily_revenue": round(revenue_90 / 90, 2) if revenue_90 > 0 else 0,
        "health": "excellent" if dso <= 30 else "good" if dso <= 45 else "needs_improvement",
        "currency": "CNY",
    }


async def dupont_health_score(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Simplified DuPont-style financial health score (0-100)."""

    margins = await compute_margins(tenant_id, db, {})
    wc = await compute_working_capital(tenant_id, db, {})
    dso = await compute_dso(tenant_id, db, {})

    # Scoring (simplified)
    margin_score = min(margins["net_margin_pct"] / 20 * 40, 40)  # 40 pts max
    wc_score = min(wc["working_capital_ratio"] / 2 * 30, 30) if wc["working_capital_ratio"] else 0  # 30 pts max
    dso_score = max(30 - (dso["dso_days"] / 45 * 30), 0)  # 30 pts max (lower DSO is better)

    total = margin_score + wc_score + dso_score

    return {
        "health_score": round(total, 1),
        "max_score": 100,
        "components": {
            "profitability": round(margin_score, 1),
            "liquidity": round(wc_score, 1),
            "efficiency": round(dso_score, 1),
        },
        "rating": "excellent" if total >= 80 else "good" if total >= 60 else "fair" if total >= 40 else "poor",
    }


async def benchmark_vs_industry(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Benchmark against industry averages (mock data for competition)."""

    health = await dupont_health_score(tenant_id, db, {})
    margins = await compute_margins(tenant_id, db, {})
    dso = await compute_dso(tenant_id, db, {})

    # Mock industry benchmarks (Shenzhen SME manufacturing)
    industry = {
        "net_margin_pct": 8.5,
        "dso_days": 42,
        "health_score": 65,
    }

    return {
        "your_metrics": {
            "net_margin_pct": margins["net_margin_pct"],
            "dso_days": dso["dso_days"],
            "health_score": health["health_score"],
        },
        "industry_avg": industry,
        "percentile": {
            "net_margin": "above_avg" if margins["net_margin_pct"] > industry["net_margin_pct"] else "below_avg",
            "dso": "above_avg" if dso["dso_days"] < industry["dso_days"] else "below_avg",
            "overall": "above_avg" if health["health_score"] > industry["health_score"] else "below_avg",
        },
    }


# Tool definitions
pl_summary_tool = ToolDef(
    name="profit_loss_summary",
    pillar="health",
    description="Generate P&L summary (revenue, expenses, net profit) for trailing period",
    input_schema={"type": "object", "properties": {"days": {"type": "integer", "description": "Period in days (default 90)"}}},
    tier=PermissionTier.AUTONOMOUS,
    handler=profit_loss_summary,
)

margins_tool = ToolDef(
    name="compute_margins",
    pillar="health",
    description="Calculate gross and net profit margins",
    input_schema={"type": "object", "properties": {}},
    tier=PermissionTier.AUTONOMOUS,
    handler=compute_margins,
)

wc_tool = ToolDef(
    name="compute_working_capital",
    pillar="health",
    description="Calculate working capital ratio (current assets / current liabilities)",
    input_schema={"type": "object", "properties": {}},
    tier=PermissionTier.AUTONOMOUS,
    handler=compute_working_capital,
)

dso_tool = ToolDef(
    name="compute_dso",
    pillar="health",
    description="Calculate Days Sales Outstanding (DSO) - efficiency of receivables collection",
    input_schema={"type": "object", "properties": {}},
    tier=PermissionTier.AUTONOMOUS,
    handler=compute_dso,
)

dupont_tool = ToolDef(
    name="dupont_health_score",
    pillar="health",
    description="Comprehensive DuPont-style financial health score (0-100) combining profitability, liquidity, efficiency",
    input_schema={"type": "object", "properties": {}},
    tier=PermissionTier.AUTONOMOUS,
    handler=dupont_health_score,
)

benchmark_tool = ToolDef(
    name="benchmark_vs_industry",
    pillar="health",
    description="Benchmark company metrics against industry averages",
    input_schema={"type": "object", "properties": {}},
    tier=PermissionTier.AUTONOMOUS,
    handler=benchmark_vs_industry,
)
