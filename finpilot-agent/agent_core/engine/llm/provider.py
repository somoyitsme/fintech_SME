import os
import json
import logging
from typing import Any, Optional
from agent_core.config import settings
from agent_core.engine.specialists import (
    generate_cashflow_analysis,
    generate_invoicing_analysis,
    generate_tax_analysis,
    generate_financing_analysis,
    generate_analytics_analysis,
    generate_general_analysis
)

logger = logging.getLogger(__name__)

async def generate_agent_response(
    query: str,
    specialist: str,
    system_prompt: str,
    metrics: dict[str, Any],
    executed_tools: list[dict]
) -> tuple[str, list[str]]:
    """
    Synthesizes the final AI agent response.
    Uses Google Gemini 3.8 Flash model when API key is configured,
    or falls back to domain-specialist reasoning engine.
    """
    flags = ["deterministic_tools_verified"]
    api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY")

    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            enhanced_instructions = (
                f"{system_prompt}\n\n"
                f"ROLE & EXPERTISE:\n"
                f"You are FinPilot, an autonomous elite CFO & AI Financial Copilot tailored specifically for Bangladeshi businesses, "
                f"wholesalers, merchants, and retail enterprises. You provide comprehensive financial intelligence:\n"
                f"- Cash flow projections, runway monitoring, and working capital risk analysis\n"
                f"- SME bank loan and credit line matching across Bangladesh financial institutions\n"
                f"- Financial health scoring and banker-ready P&L reporting\n"
                f"- Accounts receivable tracking and professional payment reminder drafting\n"
                f"- Bangladesh NBR tax obligations, VAT Mushak 9.1 compliance, and AIT calendars\n\n"
                f"IMPORTANT OPERATIONAL RULES:\n"
                f"- Never refer to '5 pillars', 'Pillar 1', or contest staff jargon. Speak naturally as an executive financial copilot.\n"
                f"- All currency amounts must be in Bangladeshi Taka (৳ or BDT).\n"
                f"- Cite the verified deterministic tool calculation numbers below accurately. Do NOT invent new arithmetic.\n"
                f"- Communicate naturally, professionally, and warmly. You can understand and respond in English, Bengali, or conversational Banglish.\n"
                f"- Provide proactive, actionable recommendations with specific steps and dates.\n\n"
                f"VERIFIED DETERMINISTIC TOOL EXECUTION RESULTS:\n"
                f"{json.dumps(executed_tools, default=str, indent=2)}\n\n"
                f"USER QUERY: {query}\n\n"
                f"Provide a thorough, articulate, authoritative CFO-level response citing the verified numbers above."
            )
            # Try primary model and fast fallbacks
            candidate_models = []
            for m in [settings.GEMINI_MODEL, "gemini-3.5-flash", "gemini-flash-latest", "gemini-3.8-flash"]:
                if m and m not in candidate_models:
                    candidate_models.append(m)

            last_error = None
            for model_name in candidate_models:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=enhanced_instructions
                    )
                    if response and response.text:
                        flags.append(f"gemini_{model_name.replace('-', '_').replace('.', '_')}_generated")
                        return response.text, flags
                except Exception as model_err:
                    last_error = model_err
                    logger.warning(f"Gemini model {model_name} error: {model_err}, trying next fallback...")
                    continue

            logger.warning(f"All Gemini models exhausted, falling back to specialist: {last_error}")
        except Exception as e:
            logger.warning(f"Gemini API initialization error: {e}")

    # Fallback to rich domain specialist generative reasoning
    flags.append("specialist_engine_generated")
    if specialist == "cashflow":
        text = generate_cashflow_analysis(query, metrics, executed_tools)
    elif specialist == "invoice":
        text = generate_invoicing_analysis(query, metrics, executed_tools)
    elif specialist == "tax":
        text = generate_tax_analysis(query, metrics, executed_tools)
    elif specialist == "financing":
        text = generate_financing_analysis(query, metrics, executed_tools)
    elif specialist == "analyst":
        text = generate_analytics_analysis(query, metrics, executed_tools)
    else:
        text = generate_general_analysis(query, metrics, executed_tools)

    return text, flags
