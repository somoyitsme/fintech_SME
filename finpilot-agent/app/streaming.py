"""Streaming status event system for real-time UI updates via SSE."""
import asyncio
from dataclasses import dataclass
from typing import AsyncIterator, Optional


@dataclass
class StatusEvent:
    """Status event sent to client during agent execution."""
    type: str  # "status" | "complete" | "error"
    message: Optional[str] = None
    content: Optional[str] = None
    error: Optional[str] = None


class StatusEmitter:
    """Event emitter for streaming status updates to SSE clients."""

    def __init__(self):
        self._queue: asyncio.Queue = asyncio.Queue()
        self._done = False

    async def emit_status(self, message: str):
        """Emit a status update (e.g., 'Fetching invoices...')."""
        await self._queue.put(StatusEvent(type="status", message=message))

    async def emit_complete(self, content: str):
        """Emit the final complete response."""
        await self._queue.put(StatusEvent(type="complete", content=content))
        self._done = True

    async def emit_error(self, error: str):
        """Emit an error event."""
        await self._queue.put(StatusEvent(type="error", error=error))
        self._done = True

    async def get_events(self) -> AsyncIterator[StatusEvent]:
        """Async iterator for consuming events."""
        while not self._done or not self._queue.empty():
            try:
                event = await asyncio.wait_for(self._queue.get(), timeout=0.5)
                yield event
            except asyncio.TimeoutError:
                if self._done:
                    break
                continue
