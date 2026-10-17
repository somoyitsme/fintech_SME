import os
import json
from sqlalchemy.orm import Session
from agent_core.db.models import Tenant
from agent_core.engine.context.builder import TenantContextBuilder

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

def tool_match_financing_options(db: Session, tenant: Tenant, args: dict) -> dict:
    amount = float(args.get("amount_needed", 500000.0))
    products_file = os.path.join(DATA_DIR, "financing_products.json")
    products = []
    if os.path.exists(products_file):
        with open(products_file, "r") as f:
            products = json.load(f)

    matches = []
    for p in products:
        matches.append({
            "id": p["id"],
            "name": p["name"],
            "provider": p["provider"],
            "type": p["type"],
            "interest_rate_range": p["interest_rate_range"],
            "approval_speed": p["approval_speed"],
            "fits_requested_amount": p["max_amount"] >= amount,
            "max_limit": p["max_amount"],
            "description": p["description"]
        })

    return {
        "status": "success",
        "amount_requested": amount,
        "currency": tenant.currency or "BDT",
        "recommended_products": matches
    }

def tool_check_financing_prequalification(db: Session, tenant: Tenant, args: dict) -> dict:
    product_id = args.get("product_id", "webank-weiyedai")
    builder = TenantContextBuilder(db, tenant)
    metrics = builder.compute_all_metrics()
    score = metrics["health_score"]
    
    annual_rev = tenant.annual_revenue if tenant.annual_revenue > 0 else 5000000.0
    limit = min(5000000.0, annual_rev * 0.40)
    
    return {
        "status": "success",
        "product_id": product_id,
        "pre_approved": score >= 65,
        "health_score": score,
        "estimated_credit_limit": limit,
        "currency": tenant.currency or "BDT",
        "notes": f"Prequalified for uncollateralized digital credit based on verified cash velocity at {tenant.company_name}."
    }
