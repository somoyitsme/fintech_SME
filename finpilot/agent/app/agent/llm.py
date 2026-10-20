"""Live Anthropic Claude integration with streaming and tool-use."""
import asyncio
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
        conversation_history: Optional[list[dict]] = None,
    ) -> tuple[str, list[str]]:
        """Execute tool-use loop with Claude, running parallel tools concurrently."""
        messages: list[dict[str, Any]] = []
        if conversation_history:
            for item in conversation_history:
                r = item.get("role", "user")
                c = item.get("content", "")
                if r in ("user", "assistant") and c:
                    messages.append({"role": r, "content": c})
        if not messages or messages[-1]["role"] != "user":
            messages.append({"role": "user", "content": user_query or "Please analyze and advise based on the data."})
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

            # Execute tools concurrently with asyncio.gather
            messages.append({"role": "assistant", "content": response.content})
            
            async def _run_tool(tb):
                try:
                    res = await tool_executor(tb.name, tb.input)
                    return {
                        "type": "tool_result",
                        "tool_use_id": tb.id,
                        "content": json.dumps(res, default=str),
                        "name": tb.name,
                        "raw_result": res,
                        "is_error": False,
                    }
                except Exception as e:
                    return {
                        "type": "tool_result",
                        "tool_use_id": tb.id,
                        "content": json.dumps({"error": str(e)}),
                        "name": tb.name,
                        "raw_result": {"error": str(e)},
                        "is_error": True,
                    }

            exec_results = await asyncio.gather(*[_run_tool(tb) for tb in tool_blocks])
            tool_results = []
            for res in exec_results:
                tools_used.append(res["name"])
                tr_dict = {
                    "type": "tool_result",
                    "tool_use_id": res["tool_use_id"],
                    "content": res["content"],
                }
                if res["is_error"]:
                    tr_dict["is_error"] = True
                tool_results.append(tr_dict)

            messages.append({"role": "user", "content": tool_results})

        return "Analysis incomplete: max tool iterations reached", tools_used

    async def stream_with_tools(
        self,
        user_query: str,
        system_prompt: str,
        tools: list[dict],
        tool_executor: Callable,
        status_callback: Optional[Callable[[str], None]] = None,
        conversation_history: Optional[list[dict]] = None,
    ) -> AsyncIterator[dict]:
        """Stream response with tool execution and status updates."""
        messages: list[dict[str, Any]] = []
        if conversation_history:
            for item in conversation_history:
                r = item.get("role", "user")
                c = item.get("content", "")
                if r in ("user", "assistant") and c:
                    messages.append({"role": r, "content": c})
        if not messages or messages[-1]["role"] != "user":
            messages.append({"role": "user", "content": user_query or "Please analyze and advise based on the data."})
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

            # Execute tools concurrently
            messages.append({"role": "assistant", "content": message.content})

            if status_callback and tool_blocks:
                tool_names = ", ".join(tb.name for tb in tool_blocks)
                await status_callback(f"Executing tools: {tool_names}...")

            async def _run_stream_tool(tb):
                try:
                    res = await tool_executor(tb.name, tb.input)
                    return {
                        "type": "tool_result",
                        "tool_use_id": tb.id,
                        "content": json.dumps(res, default=str),
                        "name": tb.name,
                        "raw_result": res,
                        "is_error": False,
                    }
                except Exception as e:
                    return {
                        "type": "tool_result",
                        "tool_use_id": tb.id,
                        "content": json.dumps({"error": str(e)}),
                        "name": tb.name,
                        "raw_result": {"error": str(e)},
                        "is_error": True,
                    }

            stream_results = await asyncio.gather(*[_run_stream_tool(tb) for tb in tool_blocks])
            tool_results = []
            for res in stream_results:
                tools_used.append(res["name"])
                tr_dict = {
                    "type": "tool_result",
                    "tool_use_id": res["tool_use_id"],
                    "content": res["content"],
                }
                if res["is_error"]:
                    tr_dict["is_error"] = True
                tool_results.append(tr_dict)
                yield {
                    "type": "tool_result",
                    "name": res["name"],
                    "result": res["raw_result"],
                }

            messages.append({"role": "user", "content": tool_results})

            if status_callback:
                await status_callback("Synthesizing response...")


_client_instance: Optional[LLMClient] = None


def get_llm_client() -> LLMClient:
    global _client_instance
    if _client_instance is None:
        _client_instance = LLMClient()
    return _client_instance

