from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, Any
from app.db.database import get_db
from app.db.models import Tenant, AgentConversation, AgentMessage
from app.api.deps import get_current_user_and_tenant
from app.agent.orchestrator import run_copilot
from app.services.audit_logger import log_audit_event

router = APIRouter(prefix="/agent", tags=["Agent"])

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    context: Optional[dict[str, Any]] = None

class CreateConversationRequest(BaseModel):
    title: Optional[str] = "Financial Consultation"
    context: Optional[dict[str, Any]] = None

@router.post("/chat")
async def chat(
    payload: ChatRequest,
    auth_data = Depends(get_current_user_and_tenant),
    db: Session = Depends(get_db)
):
    user, tenant = auth_data

    # Ensure conversation exists if requested
    conv_id = payload.conversation_id
    if not conv_id:
        conv = AgentConversation(
            tenant_id=tenant.id,
            user_id=user.id if user else None,
            title=payload.message[:30] + "...",
            context=payload.context or {}
        )
        db.add(conv)
        db.commit()
        conv_id = conv.id

    result = await run_copilot(
        query=payload.message,
        db=db,
        tenant=tenant,
        conversation_id=conv_id,
        context=payload.context
    )

    log_audit_event(
        db, tenant.id, "agent_chat_query", "agent",
        resource_id=conv_id,
        user_id=user.id if user else None,
        details={"specialist": result["specialist"]}
    )

    return {
        "conversation_id": conv_id,
        **result
    }

@router.get("/conversations")
def list_conversations(
    auth_data = Depends(get_current_user_and_tenant),
    db: Session = Depends(get_db)
):
    _, tenant = auth_data
    convs = (
        db.query(AgentConversation)
        .filter_by(tenant_id=tenant.id)
        .order_by(AgentConversation.updated_at.desc())
        .limit(20)
        .all()
    )
    return [{
        "id": c.id,
        "title": c.title,
        "created_at": c.created_at.isoformat(),
        "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        "message_count": len(c.messages)
    } for c in convs]

@router.get("/conversations/{conversation_id}")
def get_conversation_detail(
    conversation_id: str,
    auth_data = Depends(get_current_user_and_tenant),
    db: Session = Depends(get_db)
):
    _, tenant = auth_data
    conv = db.query(AgentConversation).filter_by(id=conversation_id, tenant_id=tenant.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.query(AgentMessage).filter_by(conversation_id=conv.id).order_by(AgentMessage.created_at.asc()).all()
    return {
        "id": conv.id,
        "title": conv.title,
        "context": conv.context,
        "messages": [{
            "id": m.id,
            "sender": m.sender,
            "specialist": m.specialist,
            "content": m.content,
            "tool_calls": m.tool_calls,
            "citations": m.citations,
            "guardrail_flags": m.guardrail_flags,
            "created_at": m.created_at.isoformat()
        } for m in messages]
    }

@router.post("/conversations")
def create_conversation(
    payload: CreateConversationRequest,
    auth_data = Depends(get_current_user_and_tenant),
    db: Session = Depends(get_db)
):
    user, tenant = auth_data
    conv = AgentConversation(
        tenant_id=tenant.id,
        user_id=user.id if user else None,
        title=payload.title,
        context=payload.context or {}
    )
    db.add(conv)
    db.commit()
    return {"id": conv.id, "title": conv.title}
