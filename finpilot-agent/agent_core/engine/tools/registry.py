from sqlalchemy.orm import Session
from agent_core.db.models import Tenant
from agent_core.security.permissions import enforce_permission_tier
from agent_core.engine.tools.financial import (
    tool_get_cash_flow_metrics,
    tool_forecast_cash_flow,
    tool_get_financial_health_score,
    tool_get_pnl_summary,
    tool_compare_industry_benchmarks
)
from agent_core.engine.tools.invoicing import (
    tool_get_open_invoices,
    tool_get_overdue_invoices,
    tool_draft_payment_reminder,
    tool_send_payment_reminder
)
from agent_core.engine.tools.tax import (
    tool_get_tax_rules,
    tool_calculate_estimated_tax
)
from agent_core.engine.tools.financing import (
    tool_match_financing_options,
    tool_check_financing_prequalification
)
from agent_core.engine.tools.client import tool_get_client_summary
from agent_core.engine.tools.pillars_engine import (
    calculate_cash_flow_forecast,
    run_what_if_scenario,
    match_financing_options as pillar_match_financing,
    analyze_financials as pillar_analyze_financials,
    track_invoices as pillar_track_invoices,
    draft_payment_reminder as pillar_draft_reminder,
    calculate_tax_and_compliance as pillar_calculate_tax
)

def tool_wrap_cash_flow_forecast(db: Session, tenant: Tenant, args: dict) -> dict:
    return calculate_cash_flow_forecast(
        current_balance=args.get("current_balance", 385000.0),
        daily_base_revenue=args.get("daily_base_revenue", 28500.0),
        days=args.get("days", 90),
        safety_buffer=args.get("safety_buffer", 50000.0)
    )

def tool_wrap_what_if(db: Session, tenant: Tenant, args: dict) -> dict:
    return run_what_if_scenario(
        base_params=args.get("base_params", {"current_balance": 385000.0, "daily_base_revenue": 28500.0}),
        scenario_changes=args.get("scenario_changes", [])
    )

def tool_wrap_financing_match(db: Session, tenant: Tenant, args: dict) -> dict:
    return pillar_match_financing(args.get("business_profile", {}))

def tool_wrap_analyze_financials(db: Session, tenant: Tenant, args: dict) -> dict:
    return pillar_analyze_financials(
        revenue_items=args.get("revenue_items"),
        expense_items=args.get("expense_items"),
        period=args.get("period", "Current Month"),
        industry=tenant.industry or "Computer Wholesale & Retail"
    )

def tool_wrap_track_invoices(db: Session, tenant: Tenant, args: dict) -> dict:
    return pillar_track_invoices(args.get("invoices"))

def tool_wrap_draft_reminder(db: Session, tenant: Tenant, args: dict) -> dict:
    return pillar_draft_reminder(
        invoice_data=args.get("invoice_data", {}),
        tone=args.get("tone", "firm"),
        channel=args.get("channel", "email")
    )

def tool_wrap_tax_compliance(db: Session, tenant: Tenant, args: dict) -> dict:
    return pillar_calculate_tax(
        annual_turnover=args.get("annual_turnover", tenant.annual_revenue or 8500000.0),
        annual_deductible_expenses=args.get("annual_deductible_expenses", 6800000.0)
    )

TOOL_REGISTRY = {
    "get_cash_flow_metrics": tool_get_cash_flow_metrics,
    "forecast_cash_flow": tool_forecast_cash_flow,
    "get_financial_health_score": tool_get_financial_health_score,
    "get_pnl_summary": tool_get_pnl_summary,
    "compare_industry_benchmarks": tool_compare_industry_benchmarks,
    "get_open_invoices": tool_get_open_invoices,
    "get_overdue_invoices": tool_get_overdue_invoices,
    "draft_payment_reminder": tool_draft_payment_reminder,
    "send_payment_reminder": tool_send_payment_reminder,
    "get_tax_rules": tool_get_tax_rules,
    "calculate_estimated_tax": tool_calculate_estimated_tax,
    "match_financing_options": tool_match_financing_options,
    "check_financing_prequalification": tool_check_financing_prequalification,
    "get_client_summary": tool_get_client_summary,
    # 5 Pillars Tools
    "calculate_cash_flow_forecast": tool_wrap_cash_flow_forecast,
    "run_what_if_scenario": tool_wrap_what_if,
    "match_financing_options_engine": tool_wrap_financing_match,
    "analyze_financials": tool_wrap_analyze_financials,
    "track_invoices": tool_wrap_track_invoices,
    "draft_payment_reminder_pillar": tool_wrap_draft_reminder,
    "calculate_tax_and_compliance": tool_wrap_tax_compliance
}

def execute_tool(name: str, args: dict, db: Session, tenant: Tenant) -> dict:
    """Executes a tool deterministically after enforcing 3-tier safety guardrails."""
    tier, allowed, message = enforce_permission_tier(name, args)
    if not allowed:
        return {"status": "refused", "permission_tier": tier, "error": message}

    handler = TOOL_REGISTRY.get(name)
    if not handler:
        return {"status": "error", "message": f"Tool '{name}' not found."}

    try:
        result = handler(db, tenant, args)
        result["permission_tier"] = tier
        return result
    except Exception as e:
        return {"status": "error", "error": str(e)}
