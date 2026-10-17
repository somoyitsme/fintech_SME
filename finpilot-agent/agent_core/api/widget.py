from typing import Optional, Any
from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from agent_core.db.database import get_db
from agent_core.db.models import Tenant, ApiKey
from agent_core.security.auth import get_tenant_from_api_key
from agent_core.engine.orchestrator import run_copilot
from agent_core.engine.context.builder import TenantContextBuilder

router = APIRouter(prefix="/widget", tags=["Widget SDK Endpoints"])

class WidgetChatRequest(BaseModel):
    message: str = Field(..., example="What is my cash runway?")
    conversation_id: Optional[str] = None
    page_context: Optional[dict[str, Any]] = None

@router.get("/config")
def get_widget_config(
    auth_data: tuple[Tenant, ApiKey] = Depends(get_tenant_from_api_key),
    db: Session = Depends(get_db)
):
    """Returns dynamic branding and operational context for the embeddable chat widget."""
    tenant, _ = auth_data
    builder = TenantContextBuilder(db, tenant)
    metrics = builder.compute_all_metrics()

    return {
        "tenant_id": tenant.id,
        "company_name": tenant.company_name,
        "industry": tenant.industry,
        "currency": tenant.currency or "BDT",
        "theme": {
            "primary_color": "#10b981",
            "bot_name": f"{tenant.company_name} AI Copilot",
            "welcome_message": (
                f"Hello! I am your autonomous AI Financial Copilot for **{tenant.company_name}**. "
                f"I am actively monitoring your cash runway, delinquent receivables, and credit lines. "
                f"How may I assist you today?"
            )
        },
        "live_summary": {
            "runway_months": metrics["runway_months"],
            "health_score": metrics["health_score"],
            "overdue_receivables": metrics["total_overdue_ar"]
        },
        "features": {
            "cash_flow_alerts": True,
            "invoice_chasing": True,
            "digital_credit_matching": True,
            "tax_insights": True
        }
    }

@router.post("/chat")
async def widget_chat(
    payload: WidgetChatRequest,
    auth_data: tuple[Tenant, ApiKey] = Depends(get_tenant_from_api_key),
    db: Session = Depends(get_db)
):
    """Chat endpoint consumed by the iframe widget."""
    tenant, _ = auth_data
    result = await run_copilot(
        query=payload.message,
        db=db,
        tenant=tenant,
        conversation_id=payload.conversation_id,
        source="sdk_widget"
    )
    return result
