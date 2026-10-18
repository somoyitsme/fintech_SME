"""Cryptographic utilities for API keys, passwords, and audit signing."""
from __future__ import annotations

import hashlib
import hmac
import secrets
from typing import Literal

import bcrypt

from config import settings


def hash_password(password: str) -> str:
    """Hash password with bcrypt."""
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against bcrypt hash."""
    return bcrypt.checkpw(password.encode(), hashed.encode())


def generate_api_key(prefix: Literal["fp_live", "fp_test"] = "fp_live") -> str:
    """Generate a cryptographically secure API key.

    Format: fp_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx (32 random bytes hex)
    """
    random_part = secrets.token_hex(32)
    return f"{prefix}_{random_part}"


def hash_api_key(key: str) -> str:
    """SHA256 hash of API key for secure storage."""
    return hashlib.sha256(key.encode()).hexdigest()


def sign_audit_payload(payload: str) -> str:
    """HMAC-SHA256 signature for tamper-proof audit logs."""
    return hmac.new(
        settings.AUDIT_HMAC_SECRET.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()


def verify_audit_signature(payload: str, signature: str) -> bool:
    """Verify HMAC signature on audit log entry."""
    expected = sign_audit_payload(payload)
    return hmac.compare_digest(expected, signature)
