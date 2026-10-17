import re
from typing import Any

INJECTION_PATTERNS = [
    r"ignore previous instructions",
    r"disregard all instructions",
    r"bypass security",
    r"system prompt override",
    r"you are now DAN",
    r"jailbreak",
    r"reveal secret key",
    r"delete from tenants",
    r"drop table",
    r"dump database",
    r"show all tenant keys",
]

def sanitize_pii(text: str) -> str:
    """Masks sensitive personal information (phones, credit cards, emails)."""
    # Mask credit/debit card numbers (16 digits)
    text = re.sub(r"\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b", "[CARD_MASKED]", text)
    # Mask Bangladesh / International phone numbers (11 digits e.g. 017xxxxxxxx or +8801xxxxxxxxx)
    text = re.sub(r"(\+?88)?01[3-9]\d{8}", "[PHONE_MASKED]", text)
    # Mask raw email addresses partially (preserve domain)
    text = re.sub(r"\b[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b", r"***@\1", text)
    return text

def check_prompt_injection(user_input: str) -> tuple[bool, str]:
    """Detects adversarial injection attacks."""
    lowered = user_input.lower()
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, lowered):
            return True, f"Security Policy Violation: Prompt injection attempt detected ('{pattern}')."
    return False, ""

def sanitize_output(response_text: str) -> str:
    """Ensures output does not leak raw API keys, internal hashes, or tenant IDs."""
    cleaned = re.sub(r"fpk_live_[a-f0-9]{24,48}", "[API_KEY_PROTECTED]", response_text)
    cleaned = re.sub(r"[a-f0-9]{64}", "[INTERNAL_HASH_PROTECTED]", cleaned)
    return cleaned
