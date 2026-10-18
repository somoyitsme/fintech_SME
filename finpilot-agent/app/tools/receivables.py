"""Pillar 4: Accounts Receivable & Invoice Intelligence Tools (3 tools)."""
from datetime import date, timedelta
from decimal import Decimal
from typing import Any

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.models import Invoice, Client
from app.security.permissions import PermissionTier
from app.tools.registry import ToolDef


async def ar_aging_buckets(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Calculate AR aging buckets (0-30, 31-60, 61-90, 90+ days)."""

    today = date.today()
    pending_invoices = await db.execute(
        select(Invoice).where(
            Invoice.tenant_id == tenant_id,
            Invoice.status == "pending",
        )
    )
    invoices = pending_invoices.scalars().all()

    buckets = {
        "0-30": {"count": 0, "amount": 0.0},
        "31-60": {"count": 0, "amount": 0.0},
        "61-90": {"count": 0, "amount": 0.0},
        "90+": {"count": 0, "amount": 0.0},
    }

    total = 0.0
    for inv in invoices:
        days_overdue = (today - inv.due_date).days
        amount = float(inv.amount)
        total += amount

        if days_overdue <= 0:
            buckets["0-30"]["count"] += 1
            buckets["0-30"]["amount"] += amount
        elif days_overdue <= 30:
            buckets["0-30"]["count"] += 1
            buckets["0-30"]["amount"] += amount
        elif days_overdue <= 60:
            buckets["31-60"]["count"] += 1
            buckets["31-60"]["amount"] += amount
        elif days_overdue <= 90:
            buckets["61-90"]["count"] += 1
            buckets["61-90"]["amount"] += amount
        else:
            buckets["90+"]["count"] += 1
            buckets["90+"]["amount"] += amount

    return {
        "buckets": {k: {"count": v["count"], "amount": round(v["amount"], 2)} for k, v in buckets.items()},
        "total_receivables": round(total, 2),
        "invoice_count": len(invoices),
        "currency": "CNY",
    }


async def flag_customer_default_risk(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Flag customers with high default risk based on payment history."""

    aging = await ar_aging_buckets(tenant_id, db, {})

    # Get pending invoices with customer info
    result = await db.execute(
        select(Invoice).where(
            Invoice.tenant_id == tenant_id,
            Invoice.status == "pending",
        )
    )
    invoices = result.scalars().all()

    customer_risk = {}
    today = date.today()

    for inv in invoices:
        customer = inv.customer_name
        days_overdue = (today - inv.due_date).days

        if customer not in customer_risk:
            customer_risk[customer] = {
                "invoice_count": 0,
                "total_amount": 0.0,
                "max_days_overdue": 0,
                "risk_level": "low",
            }

        customer_risk[customer]["invoice_count"] += 1
        customer_risk[customer]["total_amount"] += float(inv.amount)
        customer_risk[customer]["max_days_overdue"] = max(
            customer_risk[customer]["max_days_overdue"], days_overdue
        )

    # Assign risk levels
    for customer, data in customer_risk.items():
        if data["max_days_overdue"] > 90:
            data["risk_level"] = "high"
        elif data["max_days_overdue"] > 60:
            data["risk_level"] = "medium"
        elif data["max_days_overdue"] > 30:
            data["risk_level"] = "low"

        data["total_amount"] = round(data["total_amount"], 2)

    high_risk = [c for c, d in customer_risk.items() if d["risk_level"] == "high"]

    return {
        "customer_risk": customer_risk,
        "high_risk_count": len(high_risk),
        "total_customers": len(customer_risk),
    }


async def generate_collection_letter(tenant_id: str, db: AsyncSession, args: dict) -> dict[str, Any]:
    """Draft collection letter (Tier 2: requires human approval before sending)."""

    customer = args.get("customer")
    tone = args.get("tone", "professional")  # polite, professional, firm

    if not customer:
        return {"error": "Customer name required"}

    result = await db.execute(
        select(Invoice).where(
            Invoice.tenant_id == tenant_id,
            Invoice.status == "pending",
            Invoice.customer_name == customer,
        )
    )
    invoices = result.scalars().all()

    if not invoices:
        return {"error": "No pending invoices found for this customer"}

    total = sum(float(inv.amount) for inv in invoices)
    oldest = min(inv.due_date for inv in invoices)
    days_overdue = (date.today() - oldest).days

    # Tone-based templates
    templates = {
        "polite": {
            "subject": f"Friendly Reminder: Outstanding Invoice(s) - {customer}",
            "body": f"""Dear {customer},

We hope this message finds you well. We wanted to gently remind you about the following outstanding invoice(s) on your account:

Total Outstanding: ¥{total:,.2f}
Oldest Invoice Due Date: {oldest.strftime('%B %d, %Y')}
Days Overdue: {days_overdue}

We understand that businesses can have busy periods, and we're happy to work with you on a payment schedule that suits your needs. Please let us know if you have any questions or need clarification on any of these invoices.

We value our business relationship and look forward to continuing our partnership.

Best regards,
Accounts Receivable Department""",
        },
        "professional": {
            "subject": f"Payment Reminder: Invoice(s) Past Due - {customer}",
            "body": f"""Dear Accounts Payable Team,

This is a formal notice regarding overdue invoice(s) on your account:

Total Outstanding: ¥{total:,.2f}
Oldest Invoice Due Date: {oldest.strftime('%B %d, %Y')}
Days Overdue: {days_overdue}

We request that payment be made at your earliest convenience to bring your account current. If payment has already been remitted, please disregard this notice and provide us with the payment details for our reconciliation.

If there are any issues preventing payment, please contact our accounts receivable team immediately so we can resolve them promptly.

Sincerely,
Accounts Receivable Department""",
        },
        "firm": {
            "subject": f"URGENT: Past Due Account - Immediate Payment Required - {customer}",
            "body": f"""Dear {customer},

Despite previous communications, the following invoice(s) remain unpaid:

Total Outstanding: ¥{total:,.2f}
Oldest Invoice Due Date: {oldest.strftime('%B %d, %Y')}
Days Overdue: {days_overdue}

Payment is now required immediately. Failure to remit payment within 10 business days may result in:
- Suspension of future services/deliveries
- Application of late payment penalties
- Referral to collections

Please arrange payment today or contact our office to discuss a formal payment plan.

Regards,
Credit & Collections Department""",
        },
    }

    template = templates.get(tone, templates["professional"])

    return {
        "requires_approval": True,  # Tier 2: must be human-approved
        "tone": tone,
        "customer": customer,
        "subject": template["subject"],
        "body": template["body"],
        "total_amount": round(total, 2),
        "invoice_count": len(invoices),
        "days_overdue": days_overdue,
        "status": "drafted_pending_approval",
    }


ar_aging_tool = ToolDef(
    name="ar_aging_buckets",
    pillar="receivables",
    description="Calculate accounts receivable aging buckets (0-30, 31-60, 61-90, 90+ days)",
    input_schema={"type": "object", "properties": {}},
    tier=PermissionTier.AUTONOMOUS,
    handler=ar_aging_buckets,
)

default_risk_tool = ToolDef(
    name="flag_customer_default_risk",
    pillar="receivables",
    description="Flag customers with high default risk based on payment delays",
    input_schema={"type": "object", "properties": {}},
    tier=PermissionTier.AUTONOMOUS,
    handler=flag_customer_default_risk,
)

collection_letter_tool = ToolDef(
    name="generate_collection_letter",
    pillar="receivables",
    description="Draft collection letter in Polite/Professional/Firm tone (requires approval)",
    input_schema={
        "type": "object",
        "properties": {
            "customer": {"type": "string", "description": "Customer name"},
            "tone": {"type": "string", "enum": ["polite", "professional", "firm"], "description": "Letter tone"},
        },
        "required": ["customer", "tone"],
    },
    tier=PermissionTier.SUPERVISED,
    handler=generate_collection_letter,
)
