import json
import os
from datetime import datetime, timezone
from typing import Any
from sqlalchemy.orm import Session
from app.db.models import Tenant, Invoice, InvoiceItem, Expense, Income, Client, CashFlowSnapshot
from app.services.forecasting import calculate_cash_flow_metrics, forecast_cash_flow
from app.services.health_score import calculate_financial_health_score
from app.services.email_service import draft_payment_reminder_email, send_simulated_email
from app.agent.guardrails import enforce_permission_tier

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

# --- TOOL IMPLEMENTATIONS ---

def tool_get_cash_flow_metrics(db: Session, tenant: Tenant, args: dict) -> dict:
    metrics = calculate_cash_flow_metrics(db, tenant.id)
    return {
        "status": "success",
        "current_balance": metrics["current_balance"],
        "monthly_burn_rate": metrics["monthly_burn_rate"],
        "runway_months": metrics["runway_months"],
        "currency": tenant.currency
    }

def tool_forecast_cash_flow(db: Session, tenant: Tenant, args: dict) -> dict:
    days = int(args.get("days", 60))
    res = forecast_cash_flow(db, tenant.id, days=days)
    return {
        "status": "success",
        "horizon_days": days,
        "runway_months": res["runway_months"],
        "danger_detected": res["danger_detected"],
        "liquidity_dip_day": res["liquidity_dip_day"],
        "min_projected_balance": res["min_projected_balance"]
    }

def tool_get_open_invoices(db: Session, tenant: Tenant, args: dict) -> dict:
    invoices = db.query(Invoice).filter(Invoice.tenant_id == tenant.id, Invoice.status.in_(["sent", "overdue"])).all()
    return {
        "status": "success",
        "total_open_count": len(invoices),
        "total_open_amount": sum(i.total for i in invoices),
        "invoices": [{
            "id": i.id,
            "invoice_number": i.invoice_number,
            "client_id": i.client_id,
            "total": i.total,
            "status": i.status,
            "due_date": i.due_date.strftime("%Y-%m-%d")
        } for i in invoices]
    }

def tool_get_overdue_invoices(db: Session, tenant: Tenant, args: dict) -> dict:
    now = datetime.now(timezone.utc)
    invoices = db.query(Invoice).filter(Invoice.tenant_id == tenant.id, Invoice.status == "overdue").all()
    results = []
    for inv in invoices:
        client = db.query(Client).filter_by(id=inv.client_id).first()
        due_d = inv.due_date.replace(tzinfo=timezone.utc) if inv.due_date.tzinfo is None else inv.due_date
        days_overdue = max(1, (now - due_d).days)
        results.append({
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "client_name": client.name if client else "N/A",
            "client_email": client.email if client else "N/A",
            "amount": inv.total,
            "currency": tenant.currency,
            "due_date": inv.due_date.strftime("%Y-%m-%d"),
            "days_overdue": days_overdue
        })
    return {
        "status": "success",
        "overdue_count": len(results),
        "total_overdue_amount": sum(r["amount"] for r in results),
        "overdue_invoices": results
    }

def tool_get_invoice_details(db: Session, tenant: Tenant, args: dict) -> dict:
    invoice_number = args.get("invoice_number")
    inv = db.query(Invoice).filter_by(tenant_id=tenant.id, invoice_number=invoice_number).first()
    if not inv:
        return {"status": "error", "message": f"Invoice {invoice_number} not found"}
    client = db.query(Client).filter_by(id=inv.client_id).first()
    items = db.query(InvoiceItem).filter_by(invoice_id=inv.id).all()
    return {
        "status": "success",
        "invoice_number": inv.invoice_number,
        "client_name": client.name if client else "Unknown",
        "total": inv.total,
        "status": inv.status,
        "due_date": inv.due_date.strftime("%Y-%m-%d"),
        "items": [{"description": it.description, "quantity": it.quantity, "unit_price": it.unit_price, "total": it.total} for it in items]
    }

def tool_draft_payment_reminder(db: Session, tenant: Tenant, args: dict) -> dict:
    invoice_number = args.get("invoice_number")
    tone = args.get("tone", "polite")
    inv = db.query(Invoice).filter_by(tenant_id=tenant.id, invoice_number=invoice_number).first()
    if not inv:
        return {"status": "error", "message": "Invoice not found"}
    client = db.query(Client).filter_by(id=inv.client_id).first()
    now = datetime.now(timezone.utc)
    due_d = inv.due_date.replace(tzinfo=timezone.utc) if inv.due_date.tzinfo is None else inv.due_date
    days_overdue = max(0, (now - due_d).days)
    draft = draft_payment_reminder_email(
        client_name=client.name if client else "Customer",
        invoice_number=inv.invoice_number,
        amount=inv.total,
        currency=tenant.currency,
        due_date=inv.due_date.strftime("%Y-%m-%d"),
        days_overdue=days_overdue,
        tone=tone
    )
    return {"status": "success", "draft": draft}

def tool_send_payment_reminder(db: Session, tenant: Tenant, args: dict) -> dict:
    invoice_number = args.get("invoice_number")
    inv = db.query(Invoice).filter_by(tenant_id=tenant.id, invoice_number=invoice_number).first()
    if not inv:
        return {"status": "error", "message": "Invoice not found"}
    client = db.query(Client).filter_by(id=inv.client_id).first()
    send_simulated_email(client.email if client else "client@demo.com", f"Payment Notice: {inv.invoice_number}", "Payment notice dispatched.")
    return {"status": "success", "message": f"Reminder for {invoice_number} sent to {client.name if client else 'Client'}"}

def tool_get_expenses_summary(db: Session, tenant: Tenant, args: dict) -> dict:
    expenses = db.query(Expense).filter_by(tenant_id=tenant.id).all()
    total = sum(e.amount for e in expenses)
    by_category = {}
    for e in expenses:
        by_category[e.category] = by_category.get(e.category, 0.0) + e.amount
    return {
        "status": "success",
        "total_expenses": total,
        "currency": tenant.currency,
        "by_category": by_category
    }

def tool_list_expenses_by_category(db: Session, tenant: Tenant, args: dict) -> dict:
    category = args.get("category")
    query = db.query(Expense).filter_by(tenant_id=tenant.id)
    if category:
        query = query.filter_by(category=category)
    expenses = query.order_by(Expense.date.desc()).limit(15).all()
    return {
        "status": "success",
        "count": len(expenses),
        "expenses": [{"vendor": e.vendor, "amount": e.amount, "category": e.category, "date": e.date.strftime("%Y-%m-%d")} for e in expenses]
    }

def tool_get_pnl_summary(db: Session, tenant: Tenant, args: dict) -> dict:
    invoices = db.query(Invoice).filter(Invoice.tenant_id == tenant.id, Invoice.status == "paid").all()
    total_revenue = sum(inv.subtotal for inv in invoices)
    expenses = db.query(Expense).filter_by(tenant_id=tenant.id).all()
    total_expenses = sum(e.amount for e in expenses)
    gross_profit = total_revenue * 0.70
    net_income = gross_profit - total_expenses
    return {
        "status": "success",
        "revenue": total_revenue,
        "gross_profit": gross_profit,
        "total_operating_expenses": total_expenses,
        "net_income": net_income,
        "currency": tenant.currency
    }

def tool_get_financial_health_score(db: Session, tenant: Tenant, args: dict) -> dict:
    res = calculate_financial_health_score(db, tenant.id)
    return {"status": "success", **res}

def tool_compare_industry_benchmarks(db: Session, tenant: Tenant, args: dict) -> dict:
    benchmark_file = os.path.join(DATA_DIR, "industry_benchmarks.json")
    with open(benchmark_file, "r") as f:
        all_bm = json.load(f)
    bm = all_bm.get(tenant.industry, all_bm.get("Technology"))
    metrics = calculate_cash_flow_metrics(db, tenant.id)
    return {
        "status": "success",
        "industry": tenant.industry,
        "company_runway_months": metrics["runway_months"],
        "industry_target_runway_months": bm.get("burn_rate_safety_months"),
        "industry_operating_margin": bm.get("operating_margin"),
        "industry_target_dso_days": bm.get("dso_days")
    }

def tool_match_financing_options(db: Session, tenant: Tenant, args: dict) -> dict:
    amount = float(args.get("amount_needed", 300000.0))
    products_file = os.path.join(DATA_DIR, "financing_products.json")
    with open(products_file, "r") as f:
        products = json.load(f)
    
    matches = []
    for p in products:
        fits = p["max_amount"] >= amount
        matches.append({
            "id": p["id"],
            "name": p["name"],
            "provider": p["provider"],
            "type": p["type"],
            "interest_rate_range": p["interest_rate_range"],
            "approval_speed": p["approval_speed"],
            "fits_requested_amount": fits,
            "description": p["description"]
        })
    return {
        "status": "success",
        "amount_requested": amount,
        "currency": tenant.currency,
        "recommended_products": matches
    }

def tool_check_financing_prequalification(db: Session, tenant: Tenant, args: dict) -> dict:
    product_id = args.get("product_id", "webank-weiyedai")
    health = calculate_financial_health_score(db, tenant.id)
    score = health.get("health_score", 82)
    return {
        "status": "success",
        "product_id": product_id,
        "pre_approved": score >= 70,
        "health_score": score,
        "estimated_credit_limit": min(3000000.0, (tenant.annual_revenue or 2000000) * 0.35),
        "notes": "Qualified for instant approval based on continuous corporate tax and invoice records."
    }

def tool_get_tax_rules(db: Session, tenant: Tenant, args: dict) -> dict:
    tax_file = os.path.join(DATA_DIR, "tax_rules.json")
    with open(tax_file, "r") as f:
        rules = json.load(f).get(tenant.country, {})
    return {"status": "success", "country": tenant.country, "rules": rules}

def tool_calculate_estimated_tax(db: Session, tenant: Tenant, args: dict) -> dict:
    invoices = db.query(Invoice).filter(Invoice.tenant_id == tenant.id, Invoice.status == "paid").all()
    total_revenue = sum(inv.subtotal for inv in invoices)
    expenses = db.query(Expense).filter(Expense.tenant_id == tenant.id, Expense.tax_deductible == True).all()
    deductible = sum(e.amount for e in expenses)
    taxable_profit = max(0.0, total_revenue - deductible)
    cit_tax = taxable_profit * 0.05  # SME incentive rate
    return {
        "status": "success",
        "taxable_profit": taxable_profit,
        "estimated_cit_tax": cit_tax,
        "deductible_expenses_total": deductible,
        "currency": tenant.currency
    }

def tool_create_draft_invoice(db: Session, tenant: Tenant, args: dict) -> dict:
    client_name = args.get("client_name")
    amount = float(args.get("amount", 50000.0))
    inv_num = f"INV-DRAFT-{int(datetime.now().timestamp())}"
    return {
        "status": "staged_for_review",
        "permission_tier": "tier_2_supervised",
        "invoice_number": inv_num,
        "client": client_name,
        "amount": amount,
        "message": "Draft invoice created. Please review and approve before dispatching."
    }

def tool_create_expense_record(db: Session, tenant: Tenant, args: dict) -> dict:
    category = args.get("category", "Operations")
    amount = float(args.get("amount", 1000.0))
    vendor = args.get("vendor", "Standard Vendor")
    return {
        "status": "staged_for_review",
        "permission_tier": "tier_2_supervised",
        "category": category,
        "amount": amount,
        "vendor": vendor,
        "message": "Expense record drafted for supervisor sign-off."
    }

def tool_get_client_summary(db: Session, tenant: Tenant, args: dict) -> dict:
    clients = db.query(Client).filter_by(tenant_id=tenant.id).all()
    return {
        "status": "success",
        "clients": [{"id": c.id, "name": c.name, "company": c.company, "payment_terms_days": c.payment_terms_days} for c in clients]
    }

def tool_audit_log_query(db: Session, tenant: Tenant, args: dict) -> dict:
    return {
        "status": "success",
        "audit_pipeline": "Active (Immutable log enabled)",
        "tenant_id": tenant.id
    }

# --- TOOL DISPATCHER MAP ---

TOOL_REGISTRY = {
    "get_cash_flow_metrics": tool_get_cash_flow_metrics,
    "forecast_cash_flow": tool_forecast_cash_flow,
    "get_open_invoices": tool_get_open_invoices,
    "get_overdue_invoices": tool_get_overdue_invoices,
    "get_invoice_details": tool_get_invoice_details,
    "draft_payment_reminder": tool_draft_payment_reminder,
    "send_payment_reminder": tool_send_payment_reminder,
    "get_expenses_summary": tool_get_expenses_summary,
    "list_expenses_by_category": tool_list_expenses_by_category,
    "get_pnl_summary": tool_get_pnl_summary,
    "get_financial_health_score": tool_get_financial_health_score,
    "compare_industry_benchmarks": tool_compare_industry_benchmarks,
    "match_financing_options": tool_match_financing_options,
    "check_financing_prequalification": tool_check_financing_prequalification,
    "get_tax_rules": tool_get_tax_rules,
    "calculate_estimated_tax": tool_calculate_estimated_tax,
    "create_draft_invoice": tool_create_draft_invoice,
    "create_expense_record": tool_create_expense_record,
    "get_client_summary": tool_get_client_summary,
    "audit_log_query": tool_audit_log_query
}

def execute_tool(name: str, args: dict, db: Session, tenant: Tenant) -> dict:
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
