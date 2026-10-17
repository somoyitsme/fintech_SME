import json
import os
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Tenant
from app.api.deps import get_current_tenant
from app.services.health_score import calculate_financial_health_score
from app.services.audit_logger import log_audit_event

router = APIRouter(prefix="/financing", tags=["Financing"])

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

def load_financing_products() -> list[dict]:
    products_file = os.path.join(DATA_DIR, "financing_products.json")
    if os.path.exists(products_file):
        with open(products_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

class MatchFinancingRequest(BaseModel):
    amount_needed: float
    purpose: str = "working_capital"  # working_capital, inventory, expansion, bridging

@router.get("/products")
def list_financing_products():
    return load_financing_products()

@router.post("/match")
def match_financing(
    payload: MatchFinancingRequest,
    tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    products = load_financing_products()
    health = calculate_financial_health_score(db, tenant.id)
    score = health.get("health_score", 75)

    matches = []
    for p in products:
        # Check capacity & qualifications
        fits_amount = p["max_amount"] >= payload.amount_needed
        meets_revenue = (tenant.annual_revenue or 1000000) >= p["min_annual_revenue"]
        
        # Calculate fit score (0-100)
        fit_score = 90 if fits_amount and meets_revenue else 60
        if "weiyedai" in p["id"]:
            # Bonus match for digital unsecured loan if health score is high
            fit_score = 96 if score >= 75 else 80
        elif "factoring" in p["id"]:
            fit_score = 92 if payload.purpose in ["working_capital", "bridging"] else 75

        matches.append({
            **p,
            "fit_score": fit_score,
            "meets_revenue_criteria": meets_revenue,
            "eligible": fits_amount and meets_revenue and (score >= 60)
        })

    matches.sort(key=lambda x: x["fit_score"], reverse=True)
    log_audit_event(db, tenant.id, "match_financing", "financing", details={"amount": payload.amount_needed, "purpose": payload.purpose})
    return {
        "amount_requested": payload.amount_needed,
        "purpose": payload.purpose,
        "company_risk_score": score,
        "recommended_products": matches
    }

@router.post("/pre-qualify")
def pre_qualify_check(
    product_id: str = Query(...),
    tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    products = load_financing_products()
    selected = next((p for p in products if p["id"] == product_id), None)
    if not selected:
        return {"error": "Product not found"}

    health = calculate_financial_health_score(db, tenant.id)
    score = health.get("health_score", 75)

    approval_odds = "High (92%)" if score >= 75 else ("Medium (70%)" if score >= 60 else "Low (40%)")

    return {
        "product_id": selected["id"],
        "product_name": selected["name"],
        "provider": selected["provider"],
        "pre_qualification_status": "Pre-Approved" if score >= 70 else "Review Needed",
        "approval_likelihood": approval_odds,
        "recommended_credit_limit": min(selected["max_amount"], (tenant.annual_revenue or 2000000) * 0.35),
        "required_documents": [
            "Official Company Tax Clearance & Invoices (Automatically verified via FinPilot)",
            "Bank Settlement Account Statement (Past 6 months)",
            "Legal Representative Identity Verification"
        ]
    }
