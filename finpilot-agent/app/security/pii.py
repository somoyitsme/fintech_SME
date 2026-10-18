"""PII redaction for sensitive data before LLM context insertion.

Masks:
- Chinese bank card numbers (16-19 digits)
- Chinese tax IDs (社会信用代码, 18 chars)
- Chinese phone numbers (+86 or 1[3-9]xxxxxxxxx)
- Chinese ID card numbers (18 digits)
"""
import re


PATTERNS = {
    "BANK_CARD": re.compile(r"\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}(?:\d{2,3})?\b"),
    "TAX_ID": re.compile(r"\b[0-9A-Z]{18}\b"),  # 统一社会信用代码
    "PHONE_CN": re.compile(r"(?:\+?86)?1[3-9]\d{9}\b"),
    "ID_CARD_CN": re.compile(r"\b\d{17}[\dXx]\b"),
}


def redact_pii(text: str) -> str:
    """Redact PII from text before passing to LLM."""
    result = text
    result = PATTERNS["BANK_CARD"].sub("[BANK_CARD]", result)
    result = PATTERNS["TAX_ID"].sub("[TAX_ID]", result)
    result = PATTERNS["PHONE_CN"].sub("[PHONE]", result)
    result = PATTERNS["ID_CARD_CN"].sub("[ID_CARD]", result)
    return result
