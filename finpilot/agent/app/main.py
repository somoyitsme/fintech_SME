"""FastAPI endpoints for chat and schema introspection."""
import hmac
import os
from typing import AsyncIterator, Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Load .env ONLY if not already set (production env wins)
if not os.getenv("DATABASE_URL"):
    load_dotenv()

from config import settings
from app.core.db import get_db_engine, get_catalog
from app.agent.orchestrator import execute_query, stream_query


app = FastAPI(title="FinPilot Production", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount SDK
app.mount("/sdk", StaticFiles(directory="sdk"), name="sdk")


# ── Startup: Connect DB and introspect schema ──
@app.on_event("startup")
async def startup():
    """Connect to real database and introspect schema."""
    engine = get_db_engine()
    catalog = get_catalog()
    print(f"\n{'='*60}")
    print(f"FinPilot Production Started")
    print(f"{'='*60}")
    print(f"Database: {engine.catalog.dialect}")
    print(f"Tables discovered: {len(catalog.tables)}")
    for table_name in catalog.table_names():
        tbl = catalog.get(table_name)
        print(f"  • {table_name} ({len(tbl.columns)} columns)")
    print(f"{'='*60}\n")


# ── Models ──
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000, description="User query")
    tenant_id: str = Field(..., min_length=1, max_length=64)
    session_id: Optional[str] = Field(None, description="Chat session identifier")
    history: Optional[list[ChatMessage]] = Field(default=[], description="Prior messages in this session")


class ChatResponse(BaseModel):
    response: str
    tools_used: list[str]
    session_id: Optional[str] = None


# ── Auth ──
async def require_api_key(
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
) -> None:
    """Constant-time shared-key check. Empty = unauthenticated/demo allowed."""
    expected = settings.AGENT_API_KEY
    if not expected:
        return
    if not x_api_key or not hmac.compare_digest(x_api_key, expected):
        raise HTTPException(status_code=401, detail="Invalid or missing X-API-Key header")


# ── Health check ──
@app.get("/health")
async def health():
    return {"status": "healthy", "tables": len(get_catalog().tables)}


# ── Schema introspection (requires auth: reveals DB structure) ──
@app.get("/schema", dependencies=[Depends(require_api_key)])
async def schema():
    catalog = get_catalog()
    return {
        "dialect": catalog.dialect,
        "tables": catalog.table_names(),
        "summary": catalog.summary_for_llm(),
    }


# ── Chat endpoint (sync) ──
@app.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest, _: None = Depends(require_api_key)):
    """Synchronous chat with real LLM and database."""
    history_dicts = [m.dict() for m in (body.history or [])]
    response, tools_used = await execute_query(
        user_query=body.message,
        tenant_id=body.tenant_id,
        conversation_history=history_dicts,
    )
    return ChatResponse(response=response, tools_used=tools_used, session_id=body.session_id)


# ── Chat streaming endpoint ──
@app.post("/chat/stream")
async def chat_stream(body: ChatRequest, _: None = Depends(require_api_key)):
    """Stream chat with real-time status updates."""
    history_dicts = [m.dict() for m in (body.history or [])]

    async def event_generator() -> AsyncIterator[str]:
        async for event in stream_query(
            user_query=body.message,
            tenant_id=body.tenant_id,
            conversation_history=history_dicts,
        ):
            import json
            yield f"data: {json.dumps(event, default=str)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
