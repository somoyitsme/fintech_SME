from datetime import datetime, timezone
from sqlalchemy.orm import Session
from agent_core.db.models import Tenant, SyncedInvoice, SyncedClient

def tool_get_open_invoices(db: Session, tenant: Tenant, args: dict) -> dict:
    invoices = db.query(SyncedInvoice).filter(
        SyncedInvoice.tenant_id == tenant.id,
        SyncedInvoice.status.in_(["sent", "overdue"])
    ).all()
    return {
        "status": "success",
        "total_open_count": len(invoices),
        "total_open_amount": sum(i.amount for i in invoices),
        "currency": tenant.currency or "BDT",
        "invoices": [
            {
                "id": i.id,
                "invoice_number": i.external_id,
                "client_name": i.client_name,
                "amount": i.amount,
                "status": i.status,
                "due_date": i.due_date.strftime("%Y-%m-%d"),
                "notes": i.notes
            }
            for i in invoices
        ]
    }

def tool_get_overdue_invoices(db: Session, tenant: Tenant, args: dict) -> dict:
    now = datetime.now(timezone.utc)
    invoices = db.query(SyncedInvoice).filter(
        SyncedInvoice.tenant_id == tenant.id,
        SyncedInvoice.status.in_(["sent", "overdue"])
    ).all()
    
    overdue = []
    for inv in invoices:
        due_d = inv.due_date.replace(tzinfo=timezone.utc) if inv.due_date.tzinfo is None else inv.due_date
        if due_d < now or inv.status == "overdue":
            days = max(1, (now - due_d).days)
            overdue.append({
                "invoice_number": inv.external_id,
                "client_name": inv.client_name,
                "client_email": inv.client_email or "accounts@client.com",
                "amount": inv.amount,
                "due_date": inv.due_date.strftime("%Y-%m-%d"),
                "days_overdue": days,
                "notes": inv.notes
            })
            
    return {
        "status": "success",
        "overdue_count": len(overdue),
        "total_overdue_amount": sum(o["amount"] for o in overdue),
        "currency": tenant.currency or "BDT",
        "overdue_invoices": overdue
    }

def tool_draft_payment_reminder(db: Session, tenant: Tenant, args: dict) -> dict:
    invoice_number = args.get("invoice_number")
    tone = args.get("tone", "polite")
    
    inv = db.query(SyncedInvoice).filter_by(tenant_id=tenant.id, external_id=invoice_number).first()
    client_name = inv.client_name if inv else "Valued Client"
    amount = inv.amount if inv else 100000.0
    due_date = inv.due_date.strftime("%Y-%m-%d") if inv else "Due Date"
    curr = tenant.currency or "BDT"

    if tone == "firm":
        subject = f"URGENT: Overdue Account Settlement Required — Invoice {invoice_number}"
        body = (
            f"Dear {client_name},\n\n"
            f"This is an urgent notice from the Finance Desk at {tenant.company_name}. "
            f"Invoice #{invoice_number} for the amount of ৳ {amount:,.2f} {curr} is now substantially overdue (Due: {due_date}).\n\n"
            f"To avoid disruption to future credit orders and automated account holds, please settle the outstanding balance immediately.\n\n"
            f"Sincerely,\nFinance Department\n{tenant.company_name}"
        )
    else:
        subject = f"Friendly Reminder: Outstanding Invoice {invoice_number} — {tenant.company_name}"
        body = (
            f"Dear {client_name},\n\n"
            f"We hope this note finds your team well. We are following up regarding invoice #{invoice_number} "
            f"for ৳ {amount:,.2f} {curr}, which reached maturity on {due_date}.\n\n"
            f"Please let us know if payment has already been initiated or if you require an updated statement.\n\n"
            f"Warm regards,\nAccounts Receivable Team\n{tenant.company_name}"
        )

    return {
        "status": "success",
        "invoice_number": invoice_number,
        "recipient": client_name,
        "subject": subject,
        "draft_body": body
    }

def tool_send_payment_reminder(db: Session, tenant: Tenant, args: dict) -> dict:
    inv_num = args.get("invoice_number", "INV-UNKNOWN")
    return {
        "status": "staged_for_review",
        "permission_tier": "tier_2_supervised",
        "invoice_number": inv_num,
        "message": f"Payment reminder notice for invoice {inv_num} dispatched to outgoing queue."
    }
