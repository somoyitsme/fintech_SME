from typing import Optional, Any
from sqlalchemy.orm import Session
from app.db.models import AuditLog

def log_audit_event(
    db: Session,
    tenant_id: str,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    user_id: Optional[str] = None,
    details: Optional[dict[str, Any]] = None,
    ip_address: Optional[str] = None
) -> AuditLog:
    """Records an immutable audit event for security and compliance."""
    log_entry = AuditLog(
        tenant_id=tenant_id,
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details or {},
        ip_address=ip_address
    )
    db.add(log_entry)
    db.commit()
    return log_entry
