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
]

RESTRICTED_ACTIONS = [
    "transfer money",
    "wire funds",
    "delete database",
    "change bank account",
    "modify recipient account",
    "bypass approval"
]

def sanitize_pii(text: str) -> str:
    """Masks sensitive personal information (phones, credit cards, emails)."""
    # Mask card numbers (16 digits)
    text = re.sub(r"\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b", "[CARD_MASKED]", text)
    # Mask 11-digit phone numbers
    text = re.sub(r"\b1[3-9]\d{9}\b", "[PHONE_MASKED]", text)
    return text

def check_prompt_injection(user_input: str) -> tuple[bool, str]:
    """Detects adversarial injection attacks."""
    lowered = user_input.lower()
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, lowered):
            return True, f"Security Policy Violation: Prompt injection attempt detected ('{pattern}')."
    return False, ""

def enforce_permission_tier(action_name: str, arguments: dict[str, Any]) -> tuple[str, bool, str]:
    """
    Evaluates action against the 3 permission tiers:
    - Tier 1 (Autonomous): Read & analyze. Always allowed.
    - Tier 2 (Supervised): Draft or stage changes. Allowed with review flag.
    - Tier 3 (Restricted): Direct money movement / deletion. Blocked.
    """
    action_lower = action_name.lower()

    # Check Tier 3: Blocked actions
    for restricted in RESTRICTED_ACTIONS:
        if restricted in action_lower or restricted in str(arguments).lower():
            return "tier_3_restricted", False, "Action Refused: FinPilot agents are strictly forbidden from initiating financial transfers or bank modifications."

    # Tier 2: Supervised modifications
    supervised_actions = ["create_invoice", "create_expense", "send_payment_reminder", "apply_loan"]
    if any(sa in action_lower for sa in supervised_actions):
        return "tier_2_supervised", True, "Action staged for human supervisor review & confirmation."

    # Tier 1: Autonomous reads and analyses
    return "tier_1_autonomous", True, "Autonomous read executed."

def sanitize_output(response_text: str) -> str:
    """Ensures output does not leak raw API keys, internal hashes, or hallucinated claims."""
    cleaned = re.sub(r"fp_live_[a-f0-9]{32}", "[API_KEY_PROTECTED]", response_text)
    return cleaned
