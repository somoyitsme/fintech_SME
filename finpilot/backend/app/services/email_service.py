import logging
from typing import Any

logger = logging.getLogger(__name__)

def draft_payment_reminder_email(
    client_name: str,
    invoice_number: str,
    amount: float,
    currency: str,
    due_date: str,
    days_overdue: int = 0,
    tone: str = "polite"
) -> dict[str, str]:
    """Generates professional AR collection email drafts tailored by tone and overdue status."""
    if days_overdue > 0:
        if tone == "firm" or days_overdue > 15:
            subject = f"URGENT: Outstanding Payment Required for Invoice {invoice_number}"
            body = (
                f"Dear {client_name} Accounts Payable Team,\n\n"
                f"This is a formal notice regarding Invoice {invoice_number} in the amount of {currency} {amount:,.2f}, "
                f"which was due on {due_date} and is now {days_overdue} days past due.\n\n"
                f"To maintain our active services and prevent credit review holds, please confirm remittance or provide "
                f"a scheduled wire transfer transaction receipt by end of day.\n\n"
                f"Thank you for your prompt cooperation.\n\n"
                f"Finance Operations Team"
            )
        else:
            subject = f"Payment Reminder: Invoice {invoice_number} ({days_overdue} days overdue)"
            body = (
                f"Dear {client_name} Team,\n\n"
                f"We hope this note finds you well. We are following up regarding Invoice {invoice_number} "
                f"({currency} {amount:,.2f}), which was due on {due_date}.\n\n"
                f"Could you please check with your finance department on the payment disbursement timeline?\n\n"
                f"A copy of the invoice is available for your reference. Please let us know if you need any additional details.\n\n"
                f"Best regards,\nAccounts Receivable"
            )
    else:
        subject = f"Friendly Reminder: Upcoming Invoice {invoice_number} due {due_date}"
        body = (
            f"Dear {client_name} Team,\n\n"
            f"This is a friendly reminder that Invoice {invoice_number} for {currency} {amount:,.2f} is scheduled for "
            f"settlement on {due_date}.\n\n"
            f"Thank you for your continued partnership!\n\n"
            f"Best regards,\nFinance Team"
        )

    return {
        "subject": subject,
        "body": body,
        "recipient_name": client_name,
        "invoice_number": invoice_number,
        "amount": amount,
        "currency": currency,
        "days_overdue": days_overdue
    }

def send_simulated_email(recipient_email: str, subject: str, body: str) -> bool:
    """Simulates email delivery and logs message for audit."""
    logger.info(f"[SIMULATED EMAIL DISPATCH] To: {recipient_email} | Subject: {subject}")
    return True
