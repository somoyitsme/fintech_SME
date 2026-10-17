import json
import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Tenant, Invoice, Expense
from app.api.deps import get_current_tenant
from app.services.health_score import calculate_financial_health_score

router = APIRouter(prefix="/reports", tags=["Reports"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

@router.get("/pnl")
def get_pnl_report(tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    invoices = db.query(Invoice).filter(Invoice.tenant_id == tenant.id, Invoice.status == "paid").all()
    total_revenue = sum(inv.subtotal for inv in invoices)

    expenses = db.query(Expense).filter_by(tenant_id=tenant.id).all()
    expenses_by_cat = {}
    total_operating_expenses = 0.0

    for exp in expenses:
        expenses_by_cat[exp.category] = expenses_by_cat.get(exp.category, 0.0) + exp.amount
        total_operating_expenses += exp.amount

    gross_profit = total_revenue * 0.70  # Assuming 30% direct cost
    net_operating_income = gross_profit - total_operating_expenses
    estimated_tax = max(0.0, net_operating_income * 0.05)  # 5% effective SME rate in CN
    net_income = net_operating_income - estimated_tax

    return {
        "tenant_id": tenant.id,
        "company_name": tenant.company_name,
        "currency": tenant.currency,
        "revenue": round(total_revenue, 2),
        "estimated_cogs": round(total_revenue * 0.30, 2),
        "gross_profit": round(gross_profit, 2),
        "gross_margin_percentage": round((gross_profit / total_revenue * 100), 1) if total_revenue > 0 else 0,
        "operating_expenses": {
            "total": round(total_operating_expenses, 2),
            "breakdown": [{"category": k, "amount": round(v, 2)} for k, v in expenses_by_cat.items()]
        },
        "operating_income": round(net_operating_income, 2),
        "estimated_tax": round(estimated_tax, 2),
        "net_income": round(net_income, 2),
        "net_margin_percentage": round((net_income / total_revenue * 100), 1) if total_revenue > 0 else 0
    }

@router.get("/health")
def get_health_report(tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    return calculate_financial_health_score(db, tenant.id)

@router.get("/tax-summary")
def get_tax_summary(tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    tax_rules_file = os.path.join(DATA_DIR, "tax_rules.json")
    rules = {}
    if os.path.exists(tax_rules_file):
        with open(tax_rules_file, "r", encoding="utf-8") as f:
            rules = json.load(f).get(tenant.country, {})

    invoices = db.query(Invoice).filter_by(tenant_id=tenant.id).all()
    output_vat_collected = sum(inv.tax_amount for inv in invoices if inv.status == "paid")
    output_vat_pending = sum(inv.tax_amount for inv in invoices if inv.status in ["sent", "overdue"])

    expenses = db.query(Expense).filter_by(tenant_id=tenant.id).all()
    deductible_expenses = sum(e.amount for e in expenses if e.tax_deductible)

    return {
        "tenant_id": tenant.id,
        "country": tenant.country,
        "tax_id": tenant.tax_id or "91440300MA5DEF1234",
        "output_vat_collected": round(output_vat_collected, 2),
        "output_vat_pending": round(output_vat_pending, 2),
        "total_deductible_expenses": round(deductible_expenses, 2),
        "applicable_rules": rules
    }
