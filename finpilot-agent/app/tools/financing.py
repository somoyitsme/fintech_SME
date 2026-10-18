"""Pillar 2: Financing & WeBank Weiyedai Tools (3 tools)."""
from datetime import date, timedelta
from decimal import Decimal
from typing import Any

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import Invoice, Expense, BankAccount
from app.security.permissions import PermissionTier
from app.tools.registry import ToolDef
from config import settings


async def webank_prequalification_score(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Calculate WeBank Weiyedai pre-qualification score (0-100%)."""

    # Factor 1: Revenue stability (30% weight)
    stmt = select(func.sum(Invoice.amount)).where(
        Invoice.tenant_id == tenant_id,
        Invoice.status == "paid",
        Invoice.paid_date >= date.today() - timedelta(days=180),
    )
    result = await db.execute(stmt)
    revenue_6mo = float(result.scalar() or Decimal("0"))
    revenue_score = min(revenue_6mo / 500000, 1.0) * 30  # Max at ¥500k

    # Factor 2: Cash position (25% weight)
    stmt = select(BankAccount).where(BankAccount.tenant_id == tenant_id).order_by(BankAccount.as_of.desc()).limit(1)
    result = await db.execute(stmt)
    account = result.scalar_one_or_none()
    balance = float(account.balance) if account else 0.0
    balance_score = min(balance / 100000, 1.0) * 25  # Max at ¥100k

    # Factor 3: Payment history (30% weight)
    stmt = select(func.count(Expense.id)).where(Expense.tenant_id == tenant_id)
    result = await db.execute(stmt)
    expense_count = result.scalar() or 0
    payment_score = min(expense_count / 50, 1.0) * 30  # Max at 50 transactions

    # Factor 4: Business age proxy (15% weight)
    stmt = select(func.count(Invoice.id)).where(Invoice.tenant_id == tenant_id)
    result = await db.execute(stmt)
    invoice_count = result.scalar() or 0
    age_score = min(invoice_count / 100, 1.0) * 15  # Max at 100 invoices

    total_score = revenue_score + balance_score + payment_score + age_score

    return {
        "score": round(total_score, 1),
        "max_score": 100,
        "factors": {
            "revenue_stability": round(revenue_score, 1),
            "cash_position": round(balance_score, 1),
            "payment_history": round(payment_score, 1),
            "business_age_proxy": round(age_score, 1),
        },
        "qualification": "high" if total_score >= 75 else "medium" if total_score >= 50 else "low",
    }


async def match_financing_products(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Match SME to financing products based on WeBank score."""

    score_result = await webank_prequalification_score(tenant_id, db, {})
    score = score_result["score"]

    products = []

    if score >= 50:
        # WeBank Weiyedai
        max_amount = min(score / 100 * settings.WEBANK_MAX_LOAN_AMOUNT, settings.WEBANK_MAX_LOAN_AMOUNT)
        apr = settings.WEBANK_MAX_APR - ((score - 50) / 50) * (settings.WEBANK_MAX_APR - settings.WEBANK_MIN_APR)

        products.append({
            "product": "WeBank Weiyedai (微业贷)",
            "type": "revolving_credit_line",
            "max_amount": round(max_amount, 0),
            "apr": round(apr, 2),
            "term": "12-36 months",
            "collateral": "none",
            "approval_time": "24 hours",
            "currency": "CNY",
        })

    if score >= 40:
        products.append({
            "product": "Invoice Factoring",
            "type": "accounts_receivable_financing",
            "max_amount": 500000,
            "discount_rate": 8.5,
            "term": "30-90 days",
            "collateral": "invoices",
            "approval_time": "48 hours",
            "currency": "CNY",
        })

    return {
        "score": score,
        "products": products,
        "count": len(products),
    }


async def estimate_loan_capacity(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Estimate affordable loan amount based on cash flow."""

    from app.tools.cashflow import compute_burn_rate
    burn = await compute_burn_rate(tenant_id, db, {"days": 30})
    monthly_burn = burn["monthly_burn_rate"]

    # Conservative: loan payment should be <30% of monthly burn
    max_monthly_payment = monthly_burn * 0.30

    # Assume 12-month term, 7% APR
    apr = 7.0
    term_months = 12
    monthly_rate = apr / 100 / 12

    # Loan formula: P = M * [(1 + r)^n - 1] / [r(1 + r)^n]
    loan_capacity = max_monthly_payment * ((1 + monthly_rate) ** term_months - 1) / (monthly_rate * (1 + monthly_rate) ** term_months)

    return {
        "loan_capacity": round(loan_capacity, 0),
        "max_monthly_payment": round(max_monthly_payment, 2),
        "assumed_apr": apr,
        "assumed_term_months": term_months,
        "currency": "CNY",
    }


webank_score_tool = ToolDef(
    name="webank_prequalification_score",
    pillar="financing",
    description="Calculate WeBank Weiyedai pre-qualification score (0-100%) based on revenue, cash, payment history",
    input_schema={"type": "object", "properties": {}},
    tier=PermissionTier.AUTONOMOUS,
    handler=webank_prequalification_score,
)

match_products_tool = ToolDef(
    name="match_financing_products",
    pillar="financing",
    description="Match SME to financing products (WeBank, invoice factoring) based on score",
    input_schema={"type": "object", "properties": {}},
    tier=PermissionTier.AUTONOMOUS,
    handler=match_financing_products,
)

loan_capacity_tool = ToolDef(
    name="estimate_loan_capacity",
    pillar="financing",
    description="Estimate affordable loan amount based on cash flow capacity",
    input_schema={"type": "object", "properties": {}},
    tier=PermissionTier.AUTONOMOUS,
    handler=estimate_loan_capacity,
)
