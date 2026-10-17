from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import Tenant, CashFlowSnapshot
from app.api.deps import get_current_tenant
from app.services.forecasting import calculate_cash_flow_metrics, forecast_cash_flow

router = APIRouter(prefix="/cashflow", tags=["Cash Flow"])

@router.get("/metrics")
def get_metrics(tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    return calculate_cash_flow_metrics(db, tenant.id)

@router.get("/forecast")
def get_forecast(
    days: int = Query(60, ge=7, le=180),
    tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    return forecast_cash_flow(db, tenant.id, days=days)

@router.get("/history")
def get_history(
    limit: int = Query(30, ge=7, le=180),
    tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    snapshots = (
        db.query(CashFlowSnapshot)
        .filter_by(tenant_id=tenant.id)
        .order_by(CashFlowSnapshot.snapshot_date.desc())
        .limit(limit)
        .all()
    )
    return [{
        "snapshot_date": s.snapshot_date.strftime("%Y-%m-%d"),
        "ending_balance": s.ending_balance,
        "cash_in": s.cash_in,
        "cash_out": s.cash_out,
        "net_cash": s.net_cash,
        "runway_months": s.runway_months
    } for s in reversed(snapshots)]
