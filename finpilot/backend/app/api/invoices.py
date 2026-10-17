from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from app.db.database import get_db
from app.db.models import Invoice, InvoiceItem, Client, Tenant, Income
from app.api.deps import get_current_tenant
from app.services.pdf_generator import generate_invoice_pdf
from app.services.email_service import draft_payment_reminder_email, send_simulated_email
from app.services.audit_logger import log_audit_event

router = APIRouter(prefix="/invoices", tags=["Invoices"])

class InvoiceItemPayload(BaseModel):
    description: str
    quantity: float = 1.0
    unit_price: float
    tax_rate: float = 0.06

class InvoiceCreate(BaseModel):
    client_id: str
    invoice_number: str
    due_date: str  # YYYY-MM-DD
    items: list[InvoiceItemPayload]
    notes: Optional[str] = None
    tax_rate: float = 0.06

class InvoiceStatusUpdate(BaseModel):
    status: str
    paid_at: Optional[str] = None
    payment_method: Optional[str] = "Bank Transfer"

@router.get("")
def list_invoices(
    status: Optional[str] = None,
    client_id: Optional[str] = None,
    tenant: Tenant = Depends(get_current_tenant),
    db: Session = Depends(get_db)
):
    query = db.query(Invoice).filter(Invoice.tenant_id == tenant.id)
    if status:
        query = query.filter(Invoice.status == status)
    if client_id:
        query = query.filter(Invoice.client_id == client_id)
    invoices = query.order_by(Invoice.issue_date.desc()).all()

    now = datetime.now(timezone.utc)
    results = []
    for inv in invoices:
        client = db.query(Client).filter_by(id=inv.client_id).first()
        due_d = inv.due_date.replace(tzinfo=timezone.utc) if inv.due_date.tzinfo is None else inv.due_date
        days_overdue = max(0, (now - due_d).days) if inv.status == "overdue" or (inv.status == "sent" and now > due_d) else 0

        results.append({
            "id": inv.id,
            "invoice_number": inv.invoice_number,
            "client_id": inv.client_id,
            "client_name": client.name if client else "Unknown Client",
            "issue_date": inv.issue_date.isoformat(),
            "due_date": inv.due_date.isoformat(),
            "status": inv.status,
            "subtotal": inv.subtotal,
            "tax_rate": inv.tax_rate,
            "tax_amount": inv.tax_amount,
            "total": inv.total,
            "days_overdue": days_overdue,
            "paid_at": inv.paid_at.isoformat() if inv.paid_at else None,
            "notes": inv.notes
        })
    return results

@router.post("", status_code=status.HTTP_201_CREATED)
def create_invoice(payload: InvoiceCreate, tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    client = db.query(Client).filter_by(id=payload.client_id, tenant_id=tenant.id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    due_dt = datetime.strptime(payload.due_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)

    subtotal = sum(item.quantity * item.unit_price for item in payload.items)
    tax_amt = round(subtotal * payload.tax_rate, 2)
    total = round(subtotal + tax_amt, 2)

    invoice = Invoice(
        tenant_id=tenant.id,
        client_id=client.id,
        invoice_number=payload.invoice_number,
        issue_date=datetime.now(timezone.utc),
        due_date=due_dt,
        status="sent",
        subtotal=subtotal,
        tax_rate=payload.tax_rate,
        tax_amount=tax_amt,
        total=total,
        notes=payload.notes
    )
    db.add(invoice)
    db.flush()

    for item in payload.items:
        item_total = round(item.quantity * item.unit_price * (1 + item.tax_rate), 2)
        inv_item = InvoiceItem(
            invoice_id=invoice.id,
            description=item.description,
            quantity=item.quantity,
            unit_price=item.unit_price,
            tax_rate=item.tax_rate,
            total=item_total
        )
        db.add(inv_item)

    db.commit()
    log_audit_event(db, tenant.id, "create_invoice", "invoice", invoice.id, details={"number": invoice.invoice_number, "total": total})
    return invoice

@router.get("/{invoice_id}")
def get_invoice(invoice_id: str, tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter_by(id=invoice_id, tenant_id=tenant.id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    client = db.query(Client).filter_by(id=invoice.client_id).first()
    items = db.query(InvoiceItem).filter_by(invoice_id=invoice.id).all()

    return {
        "invoice": invoice,
        "client": client,
        "items": items
    }

@router.get("/{invoice_id}/pdf")
def get_invoice_pdf(invoice_id: str, tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter_by(id=invoice_id, tenant_id=tenant.id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    client = db.query(Client).filter_by(id=invoice.client_id).first() or Client(name="Valued Client")
    items = db.query(InvoiceItem).filter_by(invoice_id=invoice.id).all()

    inv_dict = {"invoice_number": invoice.invoice_number, "issue_date": invoice.issue_date, "due_date": invoice.due_date, "status": invoice.status, "total": invoice.total, "notes": invoice.notes}
    items_list = [{"description": it.description, "quantity": it.quantity, "unit_price": it.unit_price, "tax_rate": it.tax_rate, "total": it.total} for it in items]
    client_dict = {"name": client.name, "company": client.company or "", "email": client.email or "", "tax_number": client.tax_number or ""}
    tenant_dict = {"company_name": tenant.company_name, "currency": tenant.currency, "tax_id": tenant.tax_id or ""}

    pdf_bytes = generate_invoice_pdf(inv_dict, items_list, client_dict, tenant_dict)
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"inline; filename={invoice.invoice_number}.pdf"})

@router.post("/{invoice_id}/reminder")
def send_reminder(invoice_id: str, tone: str = "polite", tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter_by(id=invoice_id, tenant_id=tenant.id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    client = db.query(Client).filter_by(id=invoice.client_id).first()
    if not client:
        raise HTTPException(status_code=400, detail="Invoice has no associated client")

    now = datetime.now(timezone.utc)
    due_d = invoice.due_date.replace(tzinfo=timezone.utc) if invoice.due_date.tzinfo is None else invoice.due_date
    days_overdue = max(0, (now - due_d).days)

    draft = draft_payment_reminder_email(
        client_name=client.name,
        invoice_number=invoice.invoice_number,
        amount=invoice.total,
        currency=tenant.currency,
        due_date=invoice.due_date.strftime("%Y-%m-%d"),
        days_overdue=days_overdue,
        tone=tone
    )
    send_simulated_email(client.email or "client@demo.com", draft["subject"], draft["body"])
    log_audit_event(db, tenant.id, "send_invoice_reminder", "invoice", invoice.id, details={"tone": tone, "days_overdue": days_overdue})
    return {"message": "Payment reminder dispatched successfully", "draft": draft}

@router.post("/{invoice_id}/mark-paid")
def mark_invoice_paid(invoice_id: str, payload: InvoiceStatusUpdate, tenant: Tenant = Depends(get_current_tenant), db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter_by(id=invoice_id, tenant_id=tenant.id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice.status = "paid"
    invoice.paid_at = datetime.now(timezone.utc)
    invoice.payment_method = payload.payment_method or "Bank Transfer"

    # Add income record
    income = Income(
        tenant_id=tenant.id,
        source="Client Invoice Settlement",
        amount=invoice.total,
        currency=tenant.currency,
        description=f"Payment for {invoice.invoice_number}",
        date=invoice.paid_at,
        payment_method=invoice.payment_method,
        invoice_id=invoice.id
    )
    db.add(income)
    db.commit()
    log_audit_event(db, tenant.id, "mark_invoice_paid", "invoice", invoice.id, details={"amount": invoice.total})
    return {"message": f"Invoice {invoice.invoice_number} marked as paid", "invoice": invoice}
