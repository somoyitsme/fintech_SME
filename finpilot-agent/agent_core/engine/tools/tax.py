import os
import json
from sqlalchemy.orm import Session
from agent_core.db.models import Tenant, SyncedInvoice, SyncedExpense

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

def tool_get_tax_rules(db: Session, tenant: Tenant, args: dict) -> dict:
    tax_file = os.path.join(DATA_DIR, "tax_rules.json")
    rules = {}
    if os.path.exists(tax_file):
        with open(tax_file, "r") as f:
            all_rules = json.load(f)
            rules = all_rules.get(tenant.country, all_rules.get("BD", {}))
    return {
        "status": "success",
        "country": tenant.country,
        "rules": rules
    }

def tool_calculate_estimated_tax(db: Session, tenant: Tenant, args: dict) -> dict:
    paid_invoices = db.query(SyncedInvoice).filter_by(tenant_id=tenant.id, status="paid").all()
    total_rev = sum(i.amount for i in paid_invoices)
    
    expenses = db.query(SyncedExpense).filter_by(tenant_id=tenant.id, tax_deductible=True).all()
    deductible = sum(e.amount for e in expenses)
    
    taxable_profit = max(0.0, total_rev - deductible)
    # Preferential SME Corporate Income Tax rate (5% - 20%)
    cit_rate = 0.05 if tenant.country == "BD" else 0.15
    cit_tax = taxable_profit * cit_rate
    
    return {
        "status": "success",
        "taxable_profit": taxable_profit,
        "estimated_cit_tax": cit_tax,
        "tax_rate_applied": f"{int(cit_rate * 100)}%",
        "deductible_expenses_total": deductible,
        "currency": tenant.currency or "BDT"
    }
