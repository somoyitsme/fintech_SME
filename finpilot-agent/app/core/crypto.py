"""Cryptographic utilities: API key generation/hashing and HMAC audit signing.

API keys use a two-part structure:
- ``fp_live_<32-hex>``: the plaintext key (shown once to the tenant)
- We store only the bcrypt hash + prefix for O(1) lookup
"""
from __future__ import annotations

import hashlib
import hmac
import os
import secrets

import bcrypt

from config import settings


def generate_api_key() -> tuple[str, str, str]:
    """Generate a new API key.

    Returns:
        (plaintext_key, key_hash, key_prefix)
    """
    raw = secrets.token_hex(16)
    plaintext = f"fp_live_{raw}"
    key_hash = hash_api_key(plaintext)
    key_prefix = plaintext[:16]
    return plaintext, key_hash, key_prefix


def hash_api_key(key: str) -> str:
    """Hash an API key using bcrypt with the configured salt."""
    salt = bcrypt.gensalt(rounds=12, prefix=b"2b")
    return bcrypt.hashpw(key.encode("utf-8"), salt).decode("utf-8")


def verify_api_key(plaintext: str, stored_hash: str) -> bool:
    """Verify a plaintext key against a bcrypt hash."""
    try:
        return bcrypt.checkpw(plaintext.encode("utf-8"), stored_hash.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def sign_audit_log(tenant_id: str, action: str, outcome: str, timestamp: str) -> str:
    """Create HMAC-SHA256 signature for audit log integrity verification."""
    message = f"{tenant_id}:{action}:{outcome}:{timestamp}"
    return hmac.new(
        settings.AUDIT_HMAC_SECRET.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def verify_audit_signature(
    tenant_id: str, action: str, outcome: str, timestamp: str, signature: str
) -> bool:
    """Verify an audit log signature."""
    expected = sign_audit_log(tenant_id, action, outcome, timestamp)
    return hmac.compare_digest(expected, signature)
