import logging
from typing import Any, Optional
from sqlalchemy.orm import Session
from agent_core.db.models import Tenant, AgentConversation, AgentMessage, AuditLog
from agent_core.security.guardrails import (
    sanitize_pii,
    check_prompt_injection,
    sanitize_output
)
from agent_core.engine.tools.registry import execute_tool
from agent_core.engine.context.builder import TenantContextBuilder
from agent_core.engine.llm.provider import generate_agent_response

logger = logging.getLogger(__name__)

def classify_intent(query: str) -> tuple[str, list[str]]:
    """Intelligently detects domain focus and selects necessary verification tools."""
    lowered = query.lower()
    tools = []
    specialist = "general"

    # Tax & Duty
    if any(k in lowered for k in ["tax", "taxes", "vat", "mushak", "duty", "customs", "deductible", "deduction", "ait"]):
        specialist = "tax"
        tools.extend(["get_tax_rules", "calculate_estimated_tax"])

    # Financing & Credit
    elif any(k in lowered for k in ["loan", "financing", "borrow", "credit", "weiyedai", "webank", "factor", "factoring", "capital", "fund"]):
        specialist = "financing"
        tools.extend(["match_financing_options", "check_financing_prequalification", "get_cash_flow_metrics"])

    # Invoices, Overdue, Collection, Clients
    elif any(k in lowered for k in ["invoice", "invoices", "receivable", "overdue", "remind", "client", "customer", "unpaid", "collect", "owing", "debt"]):
        specialist = "invoice"
        tools.extend(["get_overdue_invoices", "get_open_invoices", "get_client_summary"])

    # Analysis, Profit, Margin, Performance, Health
    elif any(k in lowered for k in ["health", "score", "benchmark", "ratio", "pnl", "profit", "margin", "performance", "revenue", "loss"]):
        specialist = "analyst"
        tools.extend(["get_financial_health_score", "compare_industry_benchmarks", "get_pnl_summary"])

    # Cash flow & Runway (Default primary)
    elif any(k in lowered for k in ["cash", "burn", "runway", "balance", "deficit", "dip", "forecast", "liquidity"]):
        specialist = "cashflow"
        tools.extend(["get_cash_flow_metrics", "forecast_cash_flow", "get_overdue_invoices"])

    else:
        specialist = "general"
        tools.extend(["get_cash_flow_metrics", "get_financial_health_score"])

    return specialist, tools

async def run_copilot(
    query: str,
    db: Session,
    tenant: Tenant,
    conversation_id: Optional[str] = None,
    source: str = "sdk_widget"
) -> dict[str, Any]:
    """
    Main autonomous multi-agent execution pipeline.
    1. Guardrails check (prompt injection)
    2. PII sanitization
    3. Self-contextualization (compute live tenant metrics)
    4. Intent classification
    5. Deterministic tool execution on tenant's isolated data
    6. LLM synthesis (Gemini 2.0 Flash or domain specialist)
    7. Output leakage sanitization
    8. Database persistence & audit logging
    """
    # 1. Check Prompt Injection
    is_injection, msg = check_prompt_injection(query)
    if is_injection:
        return {
            "specialist": "guardrails",
            "content": msg,
            "tool_calls": [],
            "citations": [],
            "guardrail_flags": ["injection_blocked"],
            "conversation_id": conversation_id
        }

    # 2. Sanitize PII
    sanitized_query = sanitize_pii(query)

    # 3. Build live tenant financial context & system prompt
    context_builder = TenantContextBuilder(db, tenant)
    metrics = context_builder.compute_all_metrics()
    system_prompt = context_builder.build_system_prompt(metrics)

    # 4. Classify Intent & Extract Recommended Tools
    specialist, recommended_tools = classify_intent(sanitized_query)

    # 5. Deterministic Tool Execution
    executed_tool_records = []
    citations = []

    for tool_name in recommended_tools:
        result = execute_tool(tool_name, {}, db, tenant)
        executed_tool_records.append({
            "tool": tool_name,
            "args": {},
            "result": result,
            "status": result.get("status", "success")
        })
        citations.append({
            "tool": tool_name,
            "status": result.get("status")
        })

    # 6. Synthesize Output
    raw_content, flags = await generate_agent_response(
        query=sanitized_query,
        specialist=specialist,
        system_prompt=system_prompt,
        metrics=metrics,
        executed_tools=executed_tool_records
    )

    # 7. Sanitize Output
    clean_content = sanitize_output(raw_content)

    # 8. Persist Conversation & Messages
    if not conversation_id:
        new_conv = AgentConversation(
            tenant_id=tenant.id,
            source=source,
            title=sanitized_query[:60]
        )
        db.add(new_conv)
        db.commit()
        conversation_id = new_conv.id

    user_msg = AgentMessage(
        conversation_id=conversation_id,
        sender="user",
        content=sanitized_query
    )
    agent_msg = AgentMessage(
        conversation_id=conversation_id,
        sender="agent",
        specialist=specialist,
        content=clean_content,
        tool_calls=executed_tool_records,
        citations=citations,
        guardrail_flags=flags
    )
    db.add_all([user_msg, agent_msg])

    # Audit log entry
    audit = AuditLog(
        tenant_id=tenant.id,
        action="chat_query",
        resource_type="agent",
        resource_id=conversation_id,
        details={"query_length": len(query), "specialist": specialist, "tools_count": len(executed_tool_records)}
    )
    db.add(audit)
    db.commit()

    return {
        "specialist": specialist,
        "content": clean_content,
        "tool_calls": executed_tool_records,
        "citations": citations,
        "guardrail_flags": flags,
        "conversation_id": conversation_id
    }
