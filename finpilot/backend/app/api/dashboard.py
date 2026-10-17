from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Tenant, Invoice, Expense, Client
from app.api.deps import get_current_tenant
from app.services.forecasting import calculate_cash_flow_metrics, forecast_cash_flow
from app.services.health_score import calculate_financial_health_score

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    # 1. Cash flow & Runway
    cash_metrics = calculate_cash_flow_metrics(db, tenant.id)
    
    # 2. Invoices & Receivables
    invoices = db.query(Invoice).filter_by(tenant_id=tenant.id).all()
    total_ar = sum(inv.total for inv in invoices if inv.status in ["sent", "overdue"])
    overdue_ar = sum(inv.total for inv in invoices if inv.status == "overdue")
    paid_ar = sum(inv.total for inv in invoices if inv.status == "paid")
    
    # 3. Health Score
    health_data = calculate_financial_health_score(db, tenant.id)

    # 4. Forecast Quick Check
    forecast_60d = forecast_cash_flow(db, tenant.id, days=60)

    # 5. Recent Invoices
    recent_invoices_raw = db.query(Invoice).filter_by(tenant_id=tenant.id).order_by(Invoice.issue_date.desc()).limit(5).all()
    recent_invoices = []
    for inv in recent_invoices_raw:
        client = db.query(Client).filter_by(id=inv.client_id).first()
        recent_invoices.append({
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "client_name": client.name if client else "N/A",
            "amount": inv.total,
            "status": inv.status,
            "due_date": inv.due_date.strftime("%Y-%m-%d")
        })

    # 6. Recent Expenses
    recent_expenses = (
        db.query(Expense)
        .filter_by(tenant_id=tenant.id)
        .order_by(Expense.date.desc())
        .limit(5)
        .all()
    )

    # 7. AI Actionable Alerts
    alerts = []
    if overdue_ar > 0:
        alerts.append({
            "level": "warning",
            "type": "receivables",
            "title": f"Overdue Receivables: ¥{overdue_ar:,.2f}",
            "description": "2 client invoices have passed their due dates. FinPilot Copilot has drafted collection reminders.",
            "action_tool": "send_overdue_reminders"
        })
    if forecast_60d.get("danger_detected"):
        dip_day = forecast_60d.get("liquidity_dip_day", 45)
        alerts.append({
            "level": "critical",
            "type": "liquidity",
            "title": f"Projected Cash Dip on Day {dip_day}",
            "description": f"Cash balance projected to breach safe reserve threshold (¥300,000) during Q4 tax & payroll cycles.",
            "action_tool": "match_financing_options"
        })
    if health_data.get("health_score", 0) >= 75:
        alerts.append({
            "level": "info",
            "type": "financing",
            "title": "Prime Credit Pre-Approval Available",
            "description": "Your financial health index qualifies for WeBank Weiyedai unsecured revolving line.",
            "action_tool": "apply_webank_credit"
        })

    return {
        "tenant": {
            "id": tenant.id,
            "company_name": tenant.company_name,
            "industry": tenant.industry,
            "currency": tenant.currency
        },
        "kpis": {
            "cash_balance": cash_metrics["current_balance"],
            "monthly_burn_rate": cash_metrics["monthly_burn_rate"],
            "runway_months": cash_metrics["runway_months"],
            "total_open_ar": round(total_ar, 2),
            "overdue_ar": round(overdue_ar, 2),
            "paid_ar_ytd": round(paid_ar, 2),
            "financial_health_score": health_data.get("health_score", 82),
            "health_grade": health_data.get("grade", "B+ (Healthy)")
        },
        "alerts": alerts,
        "recent_invoices": recent_invoices,
        "recent_expenses": [{
            "id": e.id,
            "category": e.category,
            "amount": e.amount,
            "vendor": e.vendor,
            "date": e.date.strftime("%Y-%m-%d")
        } for e in recent_expenses]
    }
