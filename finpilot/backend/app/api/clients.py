from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.db.models import Client, Invoice, Tenant
from app.api.deps import get_current_tenant
from app.services.audit_logger import log_audit_event

router = APIRouter(prefix="/clients", tags=["Clients"])

class ClientCreate(BaseModel):
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    tax_number: Optional[str] = None
    payment_terms_days: int = 30
    credit_limit: float = 100000.0
    notes: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    address: Optional[str] = None
    tax_number: Optional[str] = None
    payment_terms_days: Optional[int] = None
    credit_limit: Optional[float] = None
    notes: Optional[str] = None

@router.get("")
def list_clients(tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    clients = db.query(Client).filter_by(tenant_id=tenant.id).order_by(Client.name).all()
    results = []
    for c in clients:
        invoices = db.query(Invoice).filter_by(client_id=c.id).all()
        outstanding = sum(inv.total for inv in invoices if inv.status in ["sent", "overdue"])
        overdue = sum(inv.total for inv in invoices if inv.status == "overdue")
        results.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "company": c.company,
            "tax_number": c.tax_number,
            "payment_terms_days": c.payment_terms_days,
            "credit_limit": c.credit_limit,
            "notes": c.notes,
            "total_invoices": len(invoices),
            "outstanding_balance": round(outstanding, 2),
            "overdue_balance": round(overdue, 2)
        })
    return results

@router.post("", status_code=status.HTTP_201_CREATED)
def create_client(payload: ClientCreate, tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    client = Client(tenant_id=tenant.id, **payload.model_dump())
    db.add(client)
    db.commit()
    db.refresh(client)
    log_audit_event(db, tenant.id, "create_client", "client", client.id, details={"name": client.name})
    return client

@router.get("/{client_id}")
def get_client(client_id: str, tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    client = db.query(Client).filter_by(id=client_id, tenant_id=tenant.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    invoices = db.query(Invoice).filter_by(client_id=client.id).order_by(Invoice.issue_date.desc()).all()
    return {
        "client": client,
        "invoices": [{
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "total": inv.total,
            "status": inv.status,
            "issue_date": inv.issue_date.isoformat() if inv.issue_date else None,
            "due_date": inv.due_date.isoformat() if inv.due_date else None
        } for inv in invoices]
    }

@router.put("/{client_id}")
def update_client(client_id: str, payload: ClientUpdate, tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    client = db.query(Client).filter_by(id=client_id, tenant_id=tenant.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    for key, val in payload.model_dump(exclude_unset=True).items():
        setattr(client, key, val)
    db.commit()
    return client

@router.delete("/{client_id}")
def delete_client(client_id: str, tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    client = db.query(Client).filter_by(id=client_id, tenant_id=tenant.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(client)
    db.commit()
    return {"message": "Client deleted successfully"}
