import hashlib
import hmac

def generate_signature(secret: str, payload: str) -> str:
    """Computes HMAC-SHA256 signature for webhook verification."""
    return hmac.new(secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256).hexdigest()

def verify_signature(secret: str, payload: str, signature: str) -> bool:
    """Constant-time comparison of webhook signature."""
    expected = generate_signature(secret, payload)
    return hmac.compare_digest(expected, signature)
