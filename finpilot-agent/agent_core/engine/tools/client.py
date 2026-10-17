from sqlalchemy.orm import Session
from agent_core.db.models import Tenant, SyncedClient

def tool_get_client_summary(db: Session, tenant: Tenant, args: dict) -> dict:
    clients = db.query(SyncedClient).filter_by(tenant_id=tenant.id).all()
    return {
        "status": "success",
        "total_clients": len(clients),
        "clients": [
            {
                "id": c.id,
                "name": c.name,
                "company": c.company or c.name,
                "payment_terms_days": c.payment_terms_days,
                "credit_limit": c.credit_limit
            }
            for c in clients
        ]
    }
