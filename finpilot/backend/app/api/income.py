from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.db.models import Income, Tenant
from app.api.deps import get_current_tenant
from app.services.audit_logger import log_audit_event

router = APIRouter(prefix="/income", tags=["Income"])

class IncomeCreate(BaseModel):
    source: str
    amount: float
    description: Optional[str] = None
    date: Optional[str] = None
    payment_method: str = "Bank Transfer"

@router.get("")
def list_income(tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    income_records = db.query(Income).filter_by(tenant_id=tenant.id).order_by(Income.date.desc()).all()
    return [{
        "id": r.id,
        "source": r.source,
        "amount": r.amount,
        "currency": r.currency,
        "description": r.description,
        "date": r.date.isoformat(),
        "payment_method": r.payment_method,
        "invoice_id": r.invoice_id
    } for r in income_records]

@router.get("/summary")
def get_income_summary(tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    income_records = db.query(Income).filter_by(tenant_id=tenant.id).all()
    total = sum(r.amount for r in income_records)
    by_source = {}
    for r in income_records:
        by_source[r.source] = by_source.get(r.source, 0.0) + r.amount
    return {
        "total_income": round(total, 2),
        "currency": tenant.currency,
        "source_breakdown": [{"source": k, "amount": round(v, 2)} for k, v in by_source.items()]
    }

@router.post("", status_code=status.HTTP_201_CREATED)
def create_income(payload: IncomeCreate, tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    income_date = datetime.strptime(payload.date, "%Y-%m-%d").replace(tzinfo=timezone.utc) if payload.date else datetime.now(timezone.utc)
    record = Income(
        tenant_id=tenant.id,
        source=payload.source,
        amount=payload.amount,
        currency=tenant.currency,
        description=payload.description,
        date=income_date,
        payment_method=payload.payment_method
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    log_audit_event(db, tenant.id, "create_income", "income", record.id, details={"source": record.source, "amount": record.amount})
    return record
