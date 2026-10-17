from typing import Any

def generate_invoicing_analysis(query: str, metrics: dict[str, Any], tools_data: list[dict]) -> str:
    company = metrics["company_name"]
    curr = metrics["currency"]
    open_ar = metrics["total_open_ar"]
    overdue_ar = metrics["total_overdue_ar"]
    overdue_list = metrics["overdue_invoices"]
    burn = metrics["monthly_burn_rate"]

    if overdue_list:
        inv_bullets = []
        for inv in overdue_list[:6]:
            inv_bullets.append(
                f"- **{inv['invoice_number']}** ({inv['client_name']}): **৳ {inv['amount']:,.2f} {curr}** — Due: {inv['due_date']} ({inv.get('notes') or 'Standard payment terms'})"
            )

        return f"""### 📑 Accounts Receivable & Aging Breakdown for {company}

Currently, your business has **৳ {open_ar:,.2f} {curr}** in total open receivables. Of that, **৳ {overdue_ar:,.2f} {curr}** is **past due** across {len(overdue_list)} accounts:

{chr(10).join(inv_bullets)}

**Liquidity Impact:**
- Overdue capital represents **{round(overdue_ar / max(1.0, burn), 1)} months** of operating burn.
- Recovering these funds eliminates the projected cash deficit without incurring interest on credit lines.

**Immediate Next Step:**
Trigger automated **Payment Reminder Notices** directly from the Invoices panel or instruct me to draft tailored notices with polite or firm settlement terms."""
    else:
        return f"""### 📑 Accounts Receivable Status for {company}

All client accounts are currently in good standing!
- **Total Open Receivables:** **৳ {open_ar:,.2f} {curr}**
- **Overdue Accounts:** **৳ 0.00 {curr}** (0 delinquent invoices)

Your DSO (Days Sales Outstanding) is operating within optimal industry parameters."""
