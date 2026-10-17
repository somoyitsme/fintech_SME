from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, Any
from app.db.database import get_db
from app.db.models import Tenant, ApiKey
from app.core.security import hash_api_key
from app.agent.orchestrator import run_copilot

router = APIRouter(prefix="/widget", tags=["Widget SDK"])

class WidgetChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    page_context: Optional[dict[str, Any]] = None

def verify_widget_api_key(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    db: Session = Depends(get_db)
) -> Tenant:
    if not x_api_key:
        # Fallback to default tenant for quick demo
        tenant = db.query(Tenant).first()
        if tenant:
            return tenant
        raise HTTPException(status_code=401, detail="X-API-Key header required")

    hashed = hash_api_key(x_api_key)
    api_key = db.query(ApiKey).filter_by(key_hash=hashed, is_active=True).first()
    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid API Key")

    tenant = db.query(Tenant).filter_by(id=api_key.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant

@router.get("/config")
def get_widget_config(tenant: Tenant = Depends(verify_widget_api_key)):
    return {
        "tenant_id": tenant.id,
        "company_name": tenant.company_name,
        "industry": tenant.industry,
        "currency": tenant.currency,
        "theme": {
            "primary_color": "#2563eb",
            "bot_name": "FinPilot Copilot",
            "welcome_message": f"Hello! I am your AI Finance Copilot for {tenant.company_name}. How can I assist you with cash flow, invoices, or credit matching today?"
        },
        "features": {
            "cash_flow_alerts": True,
            "invoice_chasing": True,
            "webank_financing": True,
            "tax_insights": True
        }
    }

@router.post("/chat")
async def widget_chat(
    payload: WidgetChatRequest,
    tenant: Tenant = Depends(verify_widget_api_key),
    db: Session = Depends(get_db)
):
    result = await run_copilot(
        query=payload.message,
        db=db,
        tenant=tenant,
        conversation_id=payload.conversation_id
    )
    return result
