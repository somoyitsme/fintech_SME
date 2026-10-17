import os
import json
from sqlalchemy.orm import Session
from agent_core.db.models import Tenant, SyncedInvoice, SyncedExpense
from agent_core.engine.context.builder import TenantContextBuilder

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

def tool_get_cash_flow_metrics(db: Session, tenant: Tenant, args: dict) -> dict:
    builder = TenantContextBuilder(db, tenant)
    metrics = builder.compute_all_metrics()
    return {
        "status": "success",
        "current_balance": metrics["current_balance"],
        "monthly_burn_rate": metrics["monthly_burn_rate"],
        "runway_months": metrics["runway_months"],
        "currency": tenant.currency or "BDT",
        "liquidity_dip_day": metrics.get("liquidity_dip_day")
    }

def tool_forecast_cash_flow(db: Session, tenant: Tenant, args: dict) -> dict:
    days = int(args.get("days", 60))
    builder = TenantContextBuilder(db, tenant)
    metrics = builder.compute_all_metrics()
    dip_day = metrics.get("liquidity_dip_day")
    return {
        "status": "success",
        "horizon_days": days,
        "runway_months": metrics["runway_months"],
        "danger_detected": dip_day is not None,
        "liquidity_dip_day": dip_day,
        "min_projected_balance": max(50000.0, metrics["current_balance"] - (metrics["monthly_burn_rate"] * (days / 30.0) * 0.7))
    }

def tool_get_financial_health_score(db: Session, tenant: Tenant, args: dict) -> dict:
    builder = TenantContextBuilder(db, tenant)
    metrics = builder.compute_all_metrics()
    return {
        "status": "success",
        "health_score": metrics["health_score"],
        "rating": "Grade A" if metrics["health_score"] >= 80 else ("Grade B" if metrics["health_score"] >= 65 else "Grade C"),
        "runway_months": metrics["runway_months"],
        "overdue_ratio": round(metrics["total_overdue_ar"] / max(1.0, metrics["total_open_ar"]), 2)
    }

def tool_get_pnl_summary(db: Session, tenant: Tenant, args: dict) -> dict:
    paid_invoices = db.query(SyncedInvoice).filter_by(tenant_id=tenant.id, status="paid").all()
    total_rev = sum(i.amount for i in paid_invoices)
    expenses = db.query(SyncedExpense).filter_by(tenant_id=tenant.id).all()
    total_exp = sum(e.amount for e in expenses)
    gross_profit = total_rev * 0.72
    net_income = gross_profit - total_exp
    return {
        "status": "success",
        "revenue": total_rev,
        "gross_profit": gross_profit,
        "total_operating_expenses": total_exp,
        "net_income": net_income,
        "currency": tenant.currency or "BDT"
    }

def tool_compare_industry_benchmarks(db: Session, tenant: Tenant, args: dict) -> dict:
    benchmark_file = os.path.join(DATA_DIR, "industry_benchmarks.json")
    bm_data = {}
    if os.path.exists(benchmark_file):
        with open(benchmark_file, "r") as f:
            all_bm = json.load(f)
            bm_data = all_bm.get(tenant.industry, all_bm.get("Technology", {}))
            
    builder = TenantContextBuilder(db, tenant)
    metrics = builder.compute_all_metrics()
    return {
        "status": "success",
        "industry": tenant.industry,
        "company_runway_months": metrics["runway_months"],
        "industry_target_runway_months": bm_data.get("burn_rate_safety_months", 3.0),
        "industry_operating_margin": bm_data.get("operating_margin", "15% - 25%"),
        "industry_target_dso_days": bm_data.get("dso_days", 45)
    }
