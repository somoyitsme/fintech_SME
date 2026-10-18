"""Pillar 1: Cash Flow Forecasting & Liquidity Tools (5 tools).

All calculations are deterministic Python math — the LLM never performs arithmetic.
"""
from datetime import date, timedelta
from decimal import Decimal
from typing import Any

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import BankAccount, CashFlow, Expense, Invoice
from app.security.permissions import PermissionTier
from app.tools.registry import ToolDef


async def get_bank_position(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Get current bank balance and as-of date."""
    stmt = select(BankAccount).where(BankAccount.tenant_id == tenant_id).order_by(BankAccount.as_of.desc()).limit(1)
    result = await db.execute(stmt)
    account = result.scalar_one_or_none()

    if not account:
        return {"balance": 0, "currency": "CNY", "as_of": date.today().isoformat(), "account_name": "Unknown"}

    return {
        "balance": float(account.balance),
        "currency": account.currency,
        "as_of": account.as_of.isoformat(),
        "account_name": account.account_name,
    }


async def compute_burn_rate(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Calculate trailing 30-day burn rate and runway months."""
    days = args.get("days", 30)
    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    # Get bank balance
    stmt = select(BankAccount).where(BankAccount.tenant_id == tenant_id).order_by(BankAccount.as_of.desc()).limit(1)
    result = await db.execute(stmt)
    account = result.scalar_one_or_none()
    balance = float(account.balance) if account else 0.0

    # Sum expenses in trailing period
    stmt_exp = select(func.sum(Expense.amount)).where(
        Expense.tenant_id == tenant_id,
        Expense.expense_date >= start_date,
        Expense.expense_date <= end_date,
    )
    result_exp = await db.execute(stmt_exp)
    total_expenses = result_exp.scalar() or Decimal("0")

    daily_burn = float(total_expenses) / days if days > 0 else 0.0
    monthly_burn = daily_burn * 30

    runway_days = balance / daily_burn if daily_burn > 0 else float("inf")
    runway_months = runway_days / 30

    return {
        "balance": balance,
        "daily_burn_rate": round(daily_burn, 2),
        "monthly_burn_rate": round(monthly_burn, 2),
        "runway_days": round(runway_days, 1) if runway_days != float("inf") else None,
        "runway_months": round(runway_months, 1) if runway_months != float("inf") else None,
        "period_days": days,
        "currency": "CNY",
    }


async def project_cash_flow_30_60_90(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Project cash flow for next 30, 60, 90 days based on scheduled invoices and recurring expenses."""
    today = date.today()

    # Get current balance
    stmt = select(BankAccount).where(BankAccount.tenant_id == tenant_id).order_by(BankAccount.as_of.desc()).limit(1)
    result = await db.execute(stmt)
    account = result.scalar_one_or_none()
    current_balance = float(account.balance) if account else 0.0

    # Expected inflows: pending invoices due in next 90 days
    stmt_inv = select(Invoice).where(
        Invoice.tenant_id == tenant_id,
        Invoice.status == "pending",
        Invoice.due_date <= today + timedelta(days=90),
    )
    result_inv = await db.execute(stmt_inv)
    pending_invoices = result_inv.scalars().all()

    # Expected outflows: historical burn rate
    burn_result = await compute_burn_rate(tenant_id, db, {"days": 30})
    daily_burn = burn_result["daily_burn_rate"]

    # Build 30/60/90 projections
    periods = [
        {"label": "Days 1-30", "days": 30, "end_date": today + timedelta(days=30)},
        {"label": "Days 31-60", "days": 30, "end_date": today + timedelta(days=60)},
        {"label": "Days 61-90", "days": 30, "end_date": today + timedelta(days=90)},
    ]

    projections = []
    running_balance = current_balance

    for period in periods:
        inflows = sum(
            float(inv.amount)
            for inv in pending_invoices
            if inv.due_date <= period["end_date"] and inv.due_date > (period["end_date"] - timedelta(days=period["days"]))
        )
        outflows = daily_burn * period["days"]
        net = inflows - outflows
        running_balance += net

        projections.append({
            "period": period["label"],
            "inflows": round(inflows, 2),
            "outflows": round(outflows, 2),
            "net": round(net, 2),
            "ending_balance": round(running_balance, 2),
        })

    return {
        "current_balance": current_balance,
        "projections": projections,
        "currency": "CNY",
    }


async def detect_liquidity_dips(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Flag projected liquidity dips where balance drops below threshold."""
    threshold = args.get("threshold", 50000)  # Default ¥50k safety buffer

    projection = await project_cash_flow_30_60_90(tenant_id, db, {})
    alerts = []

    for proj in projection["projections"]:
        if proj["ending_balance"] < threshold:
            alerts.append({
                "period": proj["period"],
                "projected_balance": proj["ending_balance"],
                "shortfall": round(threshold - proj["ending_balance"], 2),
            })

    return {
        "threshold": threshold,
        "alerts": alerts,
        "has_alerts": len(alerts) > 0,
        "currency": "CNY",
    }


async def simulate_what_if(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Simulate what-if scenarios: e.g., 'what if customer pays early' or 'what if we defer expense'."""
    scenario = args.get("scenario", "accelerate_receivables")
    amount = args.get("amount", 100000)

    base = await project_cash_flow_30_60_90(tenant_id, db, {})
    base_30 = base["projections"][0]["ending_balance"]

    simulated_balance = base_30
    if scenario == "accelerate_receivables":
        simulated_balance += amount
    elif scenario == "defer_expense":
        simulated_balance += amount
    elif scenario == "new_loan":
        simulated_balance += amount

    improvement = simulated_balance - base_30

    return {
        "scenario": scenario,
        "amount": amount,
        "base_balance_30d": base_30,
        "simulated_balance_30d": round(simulated_balance, 2),
        "improvement": round(improvement, 2),
        "currency": "CNY",
    }


# Tool definitions
get_bank_position_tool = ToolDef(
    name="get_bank_position",
    pillar="cashflow",
    description="Get current bank account balance and as-of date",
    input_schema={"type": "object", "properties": {}},
    tier=PermissionTier.AUTONOMOUS,
    handler=get_bank_position,
)

compute_burn_rate_tool = ToolDef(
    name="compute_burn_rate",
    pillar="cashflow",
    description="Calculate trailing burn rate and runway months",
    input_schema={
        "type": "object",
        "properties": {"days": {"type": "integer", "description": "Trailing period in days (default 30)"}},
    },
    tier=PermissionTier.AUTONOMOUS,
    handler=compute_burn_rate,
)

project_cash_flow_tool = ToolDef(
    name="project_cash_flow_30_60_90",
    pillar="cashflow",
    description="Project 30/60/90-day cash flow based on scheduled invoices and burn rate",
    input_schema={"type": "object", "properties": {}},
    tier=PermissionTier.AUTONOMOUS,
    handler=project_cash_flow_30_60_90,
)

detect_liquidity_dips_tool = ToolDef(
    name="detect_liquidity_dips",
    pillar="cashflow",
    description="Flag projected liquidity dips below safety threshold",
    input_schema={
        "type": "object",
        "properties": {"threshold": {"type": "number", "description": "Minimum safe balance (default ¥50,000)"}},
    },
    tier=PermissionTier.AUTONOMOUS,
    handler=detect_liquidity_dips,
)

simulate_what_if_tool = ToolDef(
    name="simulate_what_if",
    pillar="cashflow",
    description="Simulate what-if scenarios (accelerate receivables, defer expense, new loan)",
    input_schema={
        "type": "object",
        "properties": {
            "scenario": {"type": "string", "enum": ["accelerate_receivables", "defer_expense", "new_loan"]},
            "amount": {"type": "number", "description": "Scenario amount in CNY"},
        },
        "required": ["scenario", "amount"],
    },
    tier=PermissionTier.AUTONOMOUS,
    handler=simulate_what_if,
)
