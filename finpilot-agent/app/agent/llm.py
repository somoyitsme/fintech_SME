"""LLM integration: Anthropic Claude client with tool-use loop.

CRITICAL: The LLM NEVER performs arithmetic. It only:
1. Selects tools to call
2. Assembles prose/markdown over returned JSON data

If no ANTHROPIC_API_KEY is set, falls back to a deterministic
template-based response generator (useful for testing/offline demo).
"""
from __future__ import annotations

import json
from typing import Any, Optional

from config import settings


SYSTEM_PROMPT = """You are FinPilot, an elite autonomous financial decision agent for SMEs.

CORE RULES (NON-NEGOTIABLE):
1. You NEVER calculate financial numbers yourself. ALWAYS use tools.
2. You NEVER invent data. Only use data returned by tools.
3. Start with the BOTTOM LINE / executive summary — no pleasantries.
4. Format ALL numbers in clean markdown tables with units (¥, %, days).
5. Highlight critical metrics in bold callouts like: > **Cash Runway: 2.6 Mo**
6. End with numbered ACTION STEPS with exact dates and CNY amounts.
7. Eliminate conversational fluff: no "Hello", "I hope this helps", "As an AI".
8. Speak with the precision of a CFO briefing a board.

RESPONSE STRUCTURE:
- Executive summary (1-2 sentences with the answer)
- Data tables
- Metric pills for critical values
- Numbered action steps with dates + amounts"""


class LLMClient:
    """Anthropic Claude client wrapper with graceful fallback."""

    def __init__(self):
        self.client = None
        self.available = False

        if settings.ANTHROPIC_API_KEY:
            try:
                from anthropic import AsyncAnthropic
                self.client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
                self.available = True
            except Exception:
                self.available = False

    async def run_tool_loop(
        self,
        query: str,
        system_context: str,
        tools: list,
        tool_executor,
        max_iterations: int = 5,
    ) -> tuple[str, list[str]]:
        """Run the tool-use loop.

        Args:
            query: User's question
            system_context: Tenant data context
            tools: List of Anthropic tool schemas
            tool_executor: Async function(tool_name, args) -> dict

        Returns:
            (final_response_text, tools_used_list)
        """
        if not self.available:
            return await self._fallback_response(query, system_context, tools, tool_executor)

        messages = [{"role": "user", "content": query}]
        tools_used = []

        for _ in range(max_iterations):
            response = await self.client.messages.create(
                model=settings.LLM_MODEL,
                max_tokens=settings.LLM_MAX_TOKENS,
                temperature=settings.LLM_TEMPERATURE,
                system=f"{SYSTEM_PROMPT}\n\nTENANT CONTEXT:\n{system_context}",
                tools=tools,
                messages=messages,
            )

            # Check for tool use
            tool_uses = [b for b in response.content if b.type == "tool_use"]

            if not tool_uses:
                # No more tools — extract text response
                text = "".join(b.text for b in response.content if b.type == "text")
                return text, tools_used

            # Execute tools
            messages.append({"role": "assistant", "content": response.content})
            tool_results = []

            for tool_use in tool_uses:
                tools_used.append(tool_use.name)
                try:
                    result = await tool_executor(tool_use.name, tool_use.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool_use.id,
                        "content": json.dumps(result, default=str),
                    })
                except Exception as e:
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool_use.id,
                        "content": json.dumps({"error": str(e)}),
                        "is_error": True,
                    })

            messages.append({"role": "user", "content": tool_results})

        # Max iterations reached
        return "Analysis incomplete: maximum tool iterations reached.", tools_used

    async def _fallback_response(
        self, query: str, system_context: str, tools: list, tool_executor
    ) -> tuple[str, list[str]]:
        """Deterministic fallback when LLM is unavailable.

        Executes the most relevant tools and formats output using CFO-level formatters.
        """
        from app.agent.formatters import format_agent_response
        from app.agent.router import classify_intent

        tools_used = []
        results = {}

        for tool in tools[:4]:
            try:
                result = await tool_executor(tool["name"], {})
                results[tool["name"]] = result
                tools_used.append(tool["name"])
            except Exception as e:
                results[tool["name"]] = {"error": str(e)}

        # Determine pillar for formatting
        pillar = classify_intent(query)

        # Use CFO-level formatter
        response_text = format_agent_response(pillar, results)
        return response_text, tools_used


llm_client = LLMClient()