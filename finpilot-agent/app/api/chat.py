"""Chat API: sync and SSE streaming endpoints."""
import json
import uuid
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.orchestrator import execute_orchestrator
from app.core.auth import TenantCtx, TenantID
from app.core.db import DBSession
from app.core.models import Conversation, Message
from app.core.schemas import ChatRequest, ChatResponse, ChatStatusEvent
from app.streaming import StatusEmitter

router = APIRouter(prefix="/api/v1", tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    tenant_id: TenantID,
    db: DBSession,
):
    """Synchronous chat endpoint. Returns complete response."""
    conversation_id = body.conversation_id or str(uuid.uuid4())

    result = await execute_orchestrator(
        query=body.message,
        tenant_id=tenant_id,
        db=db,
    )

    # Store conversation
    _msg_user = Message(
        tenant_id=tenant_id,
        conversation_id=conversation_id,
        role="user",
        content=body.message,
    )
    db.add(_msg_user)

    _msg_assistant = Message(
        tenant_id=tenant_id,
        conversation_id=conversation_id,
        role="assistant",
        content=result["response"],
        pillar=result.get("pillar"),
        tools_used=result.get("tools_used", []),
    )
    db.add(_msg_assistant)
    await db.commit()

    return ChatResponse(
        conversation_id=conversation_id,
        response=result["response"],
        pillar=result.get("pillar"),
        tools_used=result.get("tools_used", []),
        requires_approval=result.get("requires_approval", False),
        created_at=datetime.now(timezone.utc),
    )


@router.post("/chat/stream")
async def chat_stream(
    body: ChatRequest,
    tenant_id: TenantID,
    db: DBSession,
):
    """SSE streaming endpoint with real-time status events."""
    emitter = StatusEmitter()
    conversation_id = body.conversation_id or str(uuid.uuid4())

    async def event_generator():
        # Kick off orchestrator in background
        import asyncio

        async def run_agent():
            try:
                result = await execute_orchestrator(
                    query=body.message,
                    tenant_id=tenant_id,
                    db=db,
                    emitter=emitter,
                )
            except Exception as e:
                await emitter.emit_error(str(e))

        task = asyncio.create_task(run_agent())

        # Stream events
        async for event in emitter.get_events():
            data = {
                "type": event.type,
                "message": event.message,
                "content": event.content,
                "error": event.error,
            }
            yield f"data: {json.dumps(data, default=str)}\n\n"

        await task

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )