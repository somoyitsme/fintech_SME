from typing import Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from agent_core.db.database import get_db
from agent_core.db.models import Tenant, ApiKey, AgentConversation, AgentMessage
from agent_core.security.auth import require_scopes
from agent_core.security.rate_limiter import enforce_rate_limit
from agent_core.engine.orchestrator import run_copilot

router = APIRouter(prefix="/chat", tags=["Agent Chat API"])

class ChatRequest(BaseModel):
    message: str = Field(..., example="What is my current cash runway and how can we extend it?")
    conversation_id: Optional[str] = Field(None, example="conv-uuid")
    context: Optional[dict[str, Any]] = None

@router.post("")
async def chat_with_copilot(
    payload: ChatRequest,
    auth_data: tuple[Tenant, ApiKey] = Depends(require_scopes(["agent"])),
    db: Session = Depends(get_db)
):
    """
    Main conversational endpoint for the standalone FinPilot AI Copilot.
    Protected by API key and sliding-window rate limiting.
    """
    tenant, api_key = auth_data

    # Rate limiting
    enforce_rate_limit(api_key.id, api_key.rate_limit_per_min or 120)

    result = await run_copilot(
        query=payload.message,
        db=db,
        tenant=tenant,
        conversation_id=payload.conversation_id,
        source="api"
    )
    return result

@router.get("/history/{conversation_id}")
def get_conversation_history(
    conversation_id: str,
    auth_data: tuple[Tenant, ApiKey] = Depends(require_scopes(["read"])),
    db: Session = Depends(get_db)
):
    tenant, _ = auth_data
    conv = db.query(AgentConversation).filter_by(id=conversation_id, tenant_id=tenant.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    return {
        "conversation_id": conv.id,
        "title": conv.title,
        "created_at": conv.created_at.isoformat(),
        "messages": [
            {
                "id": m.id,
                "sender": m.sender,
                "specialist": m.specialist,
                "content": m.content,
                "tool_calls": m.tool_calls,
                "citations": m.citations,
                "created_at": m.created_at.isoformat()
            }
            for m in conv.messages
        ]
    }
