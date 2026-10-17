import json
import os
from typing import Any
from sqlalchemy.orm import Session
from app.db.models import Tenant, Invoice, Expense, Income, CashFlowSnapshot
from app.services.forecasting import calculate_cash_flow_metrics

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

def load_industry_benchmarks() -> dict[str, Any]:
    benchmark_path = os.path.join(DATA_DIR, "industry_benchmarks.json")
    if os.path.exists(benchmark_path):
        with open(benchmark_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def calculate_financial_health_score(db: Session, tenant_id: str) -> dict[str, Any]:
    """Calculates multidimensional 0-100 SME financial health rating and benchmarking."""
    tenant = db.query(Tenant).filter_by(id=tenant_id).first()
    if not tenant:
        return {"error": "Tenant not found"}

    benchmarks = load_industry_benchmarks().get(tenant.industry, {
        "burn_rate_safety_months": 4.0,
        "dso_days": 45,
        "operating_margin": 0.15
    })

    metrics = calculate_cash_flow_metrics(db, tenant_id)
    runway = metrics["runway_months"]

    # 1. Runway Score (0 - 30 pts)
    target_runway = benchmarks.get("burn_rate_safety_months", 4.0)
    runway_score = min(30.0, (runway / target_runway) * 30.0)

    # 2. Overdue Receivables Ratio Score (0 - 25 pts)
    invoices = db.query(Invoice).filter_by(tenant_id=tenant_id).all()
    total_ar = sum(inv.total for inv in invoices if inv.status in ["sent", "overdue"])
    overdue_ar = sum(inv.total for inv in invoices if inv.status == "overdue")
    
    overdue_ratio = (overdue_ar / total_ar) if total_ar > 0 else 0.0
    # Perfect score if 0% overdue, drops as overdue ratio rises
    ar_score = max(0.0, (1.0 - (overdue_ratio * 2.0)) * 25.0)

    # 3. Revenue & Operating Margin Score (0 - 25 pts)
    total_income = sum(inv.total for inv in invoices if inv.status == "paid")
    all_expenses = sum(e.amount for e in db.query(Expense).filter_by(tenant_id=tenant_id).all())
    net_operating_profit = total_income - all_expenses
    op_margin = (net_operating_profit / total_income) if total_income > 0 else 0.10
    
    margin_ratio = op_margin / max(0.01, benchmarks.get("operating_margin", 0.15))
    margin_score = min(25.0, max(5.0, margin_ratio * 25.0))

    # 4. Solvency & Working Capital Stability (0 - 20 pts)
    stability_score = 18.0 if metrics["current_balance"] > 500000.0 else 12.0

    total_score = round(runway_score + ar_score + margin_score + stability_score, 1)
    total_score = max(10.0, min(100.0, total_score))

    # Determine Grade and Recommendations
    if total_score >= 80:
        grade = "A (Strong & Resilient)"
        status = "Healthy"
    elif total_score >= 65:
        grade = "B (Stable - Working Capital Attention Recommended)"
        status = "Moderate"
    else:
        grade = "C (Vulnerable - Immediate Liquidity Intervention Required)"
        status = "Critical"

    insights = []
    if runway < target_runway:
        insights.append(f"Current cash runway ({runway} months) is below industry target ({target_runway} months).")
    if overdue_ratio > 0.15:
        insights.append(f"High overdue accounts receivable ratio ({round(overdue_ratio * 100, 1)}% of AR). Recommend immediate collection follow-ups.")
    if total_score >= 75:
        insights.append("Eligible for prime unsecured digital credit lines (such as WeBank Weiyedai) with preferential interest rates.")

    return {
        "tenant_id": tenant_id,
        "company_name": tenant.company_name,
        "industry": tenant.industry,
        "health_score": total_score,
        "grade": grade,
        "health_status": status,
        "subscores": {
            "runway_score": round(runway_score, 1),
            "receivables_health_score": round(ar_score, 1),
            "profitability_margin_score": round(margin_score, 1),
            "liquidity_buffer_score": round(stability_score, 1)
        },
        "key_metrics": {
            "runway_months": runway,
            "current_balance": metrics["current_balance"],
            "total_open_ar": round(total_ar, 2),
            "overdue_ar": round(overdue_ar, 2),
            "overdue_percentage": round(overdue_ratio * 100, 1)
        },
        "insights": insights
    }
