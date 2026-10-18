"""Prompt injection and jailbreak detection.

Multi-pattern defense blocking:
- Direct instruction overrides
- Role-play jailbreaks (DAN, developer mode)
- System prompt extraction attempts
- Instruction-embedded payloads
"""
import re
from typing import Optional


INJECTION_PATTERNS = [
    # Direct instruction override
    r"(?:ignore|disregard|forget)\s+(?:all\s+|previous\s+|above\s+|earlier\s+)?(?:instructions|prompts|rules)",
    r"(?:you\s+are\s+now|pretend\s+to\s+be|act\s+as\s+if)",
    r"(?:new\s+|updated\s+)?system\s*:\s*",
    r"<\s*/?\s*(?:system|assistant|prompt|instructions)\s*>",
    # Role-play jailbreaks
    r"\bDAN\b",
    r"developer\s+mode",
    r"jailbreak",
    r"bypass\s+(?:security|guardrail|filter|restriction)",
    r"(?:reveal|show|print|output)\s+(?:the\s+)?(?:system\s+prompt|instructions|rules|configuration)",
    # Injection with financial exfiltration intent
    r"(?:transfer|wire|send)\s+(?:money|funds|cash)\s+to",
    r"(?:drop|delete|truncate|alter)\s+(?:table|database|schema)",
    r"sql\s*(?:injection|exploit)",
    # Encoded/base64 attempt hints
    r"decode\s+(?:and\s+)?(?:execute|run)",
    r"eval\s*\(",
    r"exec\s*\(",
]


def detect_injection(text: str) -> Optional[str]:
    """Detect prompt injection. Returns pattern name if matched, else None."""
    lower = text.lower()
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, lower):
            return pattern
    return None


def is_blocked(text: str) -> tuple[bool, str]:
    """Return (should_block, reason)."""
    pattern = detect_injection(text)
    if pattern:
        return True, f"Prompt injection detected: {pattern}"
    return False, ""
