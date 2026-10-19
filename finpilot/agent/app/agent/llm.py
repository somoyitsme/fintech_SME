"""Live Anthropic Claude integration with streaming and tool-use."""
from __future__ import annotations

import json
from typing import Any, AsyncIterator, Callable, Optional

from anthropic import AsyncAnthropic
from anthropic.types import MessageStreamEvent

from config import settings


class LLMClient:
    """Production LLM client with real Anthropic API."""

    def __init__(self):
        if not settings.ANTHROPIC_API_KEY or settings.ANTHROPIC_API_KEY.startswith("sk-ant-your"):
            raise ValueError(
                "ANTHROPIC_API_KEY required. Set real key in .env"
            )

        client_kwargs = {"api_key": settings.ANTHROPIC_API_KEY}
        if getattr(settings, "ANTHROPIC_BASE_URL", None) and settings.ANTHROPIC_BASE_URL.strip():
            client_kwargs["base_url"] = settings.ANTHROPIC_BASE_URL.strip()
        self.client = AsyncAnthropic(**client_kwargs)
        self.model = settings.LLM_MODEL
        self.max_tokens = settings.LLM_MAX_TOKENS

    async def execute_with_tools(
        self,
        user_query: str,
        system_prompt: str,
        tools: list[dict],
        tool_executor: Callable,
        max_iterations: int = 5,
    ) -> tuple[str, list[str]]:
        """Execute tool-use loop with Claude.

        Args:
            user_query: User's question
            system_prompt: System instructions + schema context
            tools: Anthropic tool definitions
            tool_executor: async fn(tool_name, args) -> dict
            max_iterations: Safety limit

        Returns:
            (final_text_response, list_of_tool_names_used)
        """
        messages = [{"role": "user", "content": user_query}]
        tools_used = []

        for iteration in range(max_iterations):
            response = await self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                system=system_prompt,
                tools=tools,
                messages=messages,
            )

            # Extract tool uses
            tool_blocks = [b for b in response.content if b.type == "tool_use"]

            if not tool_blocks:
                # No more tools → extract final text
                text = "".join(
                    b.text for b in response.content if b.type == "text"
                )
                return text, tools_used

            # Execute tools
            messages.append({"role": "assistant", "content": response.content})
            tool_results = []

            for tool_block in tool_blocks:
                tools_used.append(tool_block.name)
                try:
                    result = await tool_executor(tool_block.name, tool_block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool_block.id,
                        "content": json.dumps(result, default=str),
                    })
                except Exception as e:
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool_block.id,
                        "content": json.dumps({"error": str(e)}),
                        "is_error": True,
                    })

            messages.append({"role": "user", "content": tool_results})

        return "Analysis incomplete: max tool iterations reached", tools_used

    async def stream_with_tools(
        self,
        user_query: str,
        system_prompt: str,
        tools: list[dict],
        tool_executor: Callable,
        status_callback: Optional[Callable[[str], None]] = None,
    ) -> AsyncIterator[dict]:
        """Stream response with tool execution and status updates.

        Yields:
            {"type": "status", "message": "..."}
            {"type": "tool_start", "name": "..."}
            {"type": "tool_result", "name": "...", "result": {...}}
            {"type": "text_delta", "text": "..."}
            {"type": "complete", "response": "...", "tools_used": [...]}
        """
        messages = [{"role": "user", "content": user_query}]
        tools_used = []
        accumulated_text = []

        if status_callback:
            await status_callback("Analyzing intent...")

        for iteration in range(5):
            async with self.client.messages.stream(
                model=self.model,
                max_tokens=self.max_tokens,
                system=system_prompt,
                tools=tools,
                messages=messages,
            ) as stream:
                tool_blocks = []
                text_blocks = []

                async for event in stream:
                    if event.type == "content_block_start":
                        if event.content_block.type == "tool_use":
                            tool_name = event.content_block.name
                            yield {
                                "type": "tool_start",
                                "name": tool_name,
                            }

                    elif event.type == "content_block_delta":
                        if event.delta.type == "text_delta":
                            text = event.delta.text
                            accumulated_text.append(text)
                            yield {"type": "text_delta", "text": text}

                try:
                    message = await stream.get_final_message()
                    tool_blocks = [b for b in message.content if b.type == "tool_use"]
                    text_blocks = [b for b in message.content if b.type == "text"]
                except Exception:
                    resp = await self.client.messages.create(
                        model=self.model,
                        max_tokens=self.max_tokens,
                        system=system_prompt,
                        tools=tools,
                        messages=messages,
                    )
                    tool_blocks = [b for b in resp.content if b.type == "tool_use"]
                    text_blocks = [b for b in resp.content if b.type == "text"]
                    message = resp

            if not tool_blocks:
                final_text = "".join(accumulated_text)
                yield {
                    "type": "complete",
                    "response": final_text,
                    "tools_used": tools_used,
                }
                return

            # Execute tools
            messages.append({"role": "assistant", "content": message.content})
            tool_results = []

            for tool_block in tool_blocks:
                tools_used.append(tool_block.name)

                if status_callback:
                    await status_callback(f"Executing {tool_block.name}...")

                try:
                    result = await tool_executor(tool_block.name, tool_block.input)
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool_block.id,
                        "content": json.dumps(result, default=str),
                    })
                    yield {
                        "type": "tool_result",
                        "name": tool_block.name,
                        "result": result,
                    }
                except Exception as e:
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool_block.id,
                        "content": json.dumps({"error": str(e)}),
                        "is_error": True,
                    })

            messages.append({"role": "user", "content": tool_results})

            if status_callback:
                await status_callback("Synthesizing response...")


def get_llm_client() -> LLMClient:
    return LLMClient()
