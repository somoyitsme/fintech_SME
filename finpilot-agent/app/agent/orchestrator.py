"""Agent Orchestrator: coordinates intent routing, tool execution, and response generation.

Flow:
1. Receive query + tenant context
2. Emit status: Thinking & Analyzing Intent
3. Classify intent → determine pillar
4. Emit status: Verifying Security Guardrails
5. Load tools for pillar
6. Emit status: Querying Tenant Database
7. Run LLM tool-use loop (or fallback)
8. Emit status: Synthesizing Executive Summary
9. Return response
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.context import build_tenant_context
from app.agent.llm import llm_client
from app.agent.router import classify_intent, get_tools_for_pillar
from app.security.permissions import PermissionTier, should_block_tool, get_permission_tier
from app.security.pipeline import SecurityPipeline
from app.tools.registry import tool_definitions_for_llm
from app.streaming import StatusEmitter


async def execute_orchestrator(
    query: str,
    tenant_id: str,
    db: AsyncSession,
    emitter: Optional[StatusEmitter] = None,
    ctx=None,
) -> dict:
    """Main agent execution flow.

    Args:
        query: Sanitized user query
        tenant_id: Authenticated tenant ID
        db: Database session
        emitter: Status event emitter for streaming
        ctx: TenantContext for audit logging

    Returns:
        Dict with response, pillar, tools_used, etc.
    """
    # 1. Status: Thinking
    if emitter:
        await emitter.emit_status("Thinking & Analyzing Intent...")

    # 2. Classify intent
    pillar = classify_intent(query)

    # 3. Status: Verifying Security
    if emitter:
        await emitter.emit_status("Verifying Security Guardrails & Tenant Context...")

    # Build security pipeline if context available
    security = None
    if ctx:
        security = SecurityPipeline(db, ctx)
        await security.process(query)  # Re-validate (layers 3-8)

    # 4. Load tools for pillar
    tools = get_tools_for_pillar(pillar)
    tool_defs = [t for t in tools if t.tier != PermissionTier.RESTRICTED]
    anthropic_tools = tool_definitions_for_llm(tool_defs)

    # 5. Status: Querying Database
    if emitter:
        data_desc = f"Fetching {pillar.upper()} data..."
        await emitter.emit_status(f"Querying Tenant Database: {data_desc}...")

    # 6. Build tenant context (tenant-scoped)
    tenant_context = await build_tenant_context(tenant_id, db)
    context_json = str(tenant_context)

    # 7. Tool executor: wraps tool execution with tenant scoping and audit
    async def tool_executor(tool_name: str, args: dict) -> dict:
        # Check permission tier
        tier = get_permission_tier(tool_name)
        blocked, reason = should_block_tool(tool_name)
        if blocked:
            if security:
                await security.audit_tool_execution(tool_name, tier, "blocked", {"reason": reason})
            raise PermissionError(reason)

        # Execute tool with tenant scoping
        from app.tools.registry import get_tool
        tool_def = get_tool(tool_name)
        if not tool_def:
            raise ValueError(f"Unknown tool: {tool_name}")

        # Execute
        result = await tool_def.handler(tenant_id, db, args)

        # Audit log Tier-2 tools
        if security and tier == PermissionTier.SUPERVISED:
            await security.audit_tool_execution(tool_name, tier, "drafted", {"args": args})

        return result

    # 8. Run LLM tool-use loop
    if emitter:
        await emitter.emit_status("Running Deterministic Forecasting Engine...")

    response_text, tools_used = await llm_client.run_tool_loop(
        query=query,
        system_context=context_json,
        tools=anthropic_tools,
        tool_executor=tool_executor,
    )

    # 9. Status: Synthesizing
    if emitter:
        await emitter.emit_status("Synthesizing Executive Financial Summary...")

    # Check if response contains a Tier-2 draft
    requires_approval = "requires_approval" in response_text or "drafted" in response_text.lower()

    result = {
        "response": response_text,
        "pillar": pillar,
        "tools_used": tools_used,
        "requires_approval": requires_approval,
    }

    if emitter:
        await emitter.emit_complete(response_text)

    return result