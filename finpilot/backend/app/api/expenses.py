from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.db.models import Expense, Tenant
from app.api.deps import get_current_tenant
from app.services.audit_logger import log_audit_event

router = APIRouter(prefix="/expenses", tags=["Expenses"])

class ExpenseCreate(BaseModel):
    category: str
    amount: float
    description: Optional[str] = None
    vendor: Optional[str] = None
    date: Optional[str] = None  # YYYY-MM-DD
    payment_method: str = "Corporate Account"
    tax_deductible: bool = True

@router.get("")
def list_expenses(
    category: Optional[str] = None,
    tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    query = db.query(Expense).filter(Expense.tenant_id == tenant.id)
    if category:
        query = query.filter(Expense.category == category)
    expenses = query.order_by(Expense.date.desc()).all()
    return [{
        "id": e.id,
        "category": e.category,
        "amount": e.amount,
        "currency": e.currency,
        "description": e.description,
        "vendor": e.vendor,
        "date": e.date.isoformat(),
        "payment_method": e.payment_method,
        "tax_deductible": e.tax_deductible,
        "status": e.status
    } for e in expenses]

@router.get("/summary")
def get_expenses_summary(tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    expenses = db.query(Expense).filter_by(tenant_id=tenant.id).all()
    total = sum(e.amount for e in expenses)
    by_category = {}
    for e in expenses:
        by_category[e.category] = by_category.get(e.category, 0.0) + e.amount

    return {
        "total_expenses": round(total, 2),
        "currency": tenant.currency,
        "category_breakdown": [{"category": k, "amount": round(v, 2), "percentage": round((v / total * 100), 1) if total > 0 else 0} for k, v in by_category.items()]
    }

@router.post("", status_code=status.HTTP_201_CREATED)
def create_expense(payload: ExpenseCreate, tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    expense_date = datetime.strptime(payload.date, "%Y-%m-%d").replace(tzinfo=timezone.utc) if payload.date else datetime.now(timezone.utc)
    expense = Expense(
        tenant_id=tenant.id,
        category=payload.category,
        amount=payload.amount,
        currency=tenant.currency,
        description=payload.description,
        vendor=payload.vendor,
        date=expense_date,
        payment_method=payload.payment_method,
        tax_deductible=payload.tax_deductible,
        status="approved"
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    log_audit_event(db, tenant.id, "create_expense", "expense", expense.id, details={"category": expense.category, "amount": expense.amount})
    return expense
