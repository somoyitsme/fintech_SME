"""Tool registry and metadata.

Each tool declares:
- name (matches function name in tools/*)
- pillar (1-6, or 'guard' for sentinel tools)
- description (for LLM tool selection)
- input schema (JSON schema for the LLM)
- permission tier (from security.permissions)
- handler (async function taking ctx + db + args)
"""
from dataclasses import dataclass, field
from typing import Any, Callable, Optional

from app.security.permissions import PermissionTier


@dataclass
class ToolDef:
    name: str
    pillar: str
    description: str
    input_schema: dict
    tier: PermissionTier
    handler: Callable


_REGISTRY: dict[str, ToolDef] = {}


def register(tool: ToolDef):
    _REGISTRY[tool.name] = tool
    return tool


def get_tool(name: str) -> Optional[ToolDef]:
    return _REGISTRY.get(name)


def all_tools() -> list[ToolDef]:
    return list(_REGISTRY.values())


def tools_for_pillar(pillar: str) -> list[ToolDef]:
    return [t for t in _REGISTRY.values() if t.pillar == pillar]


def anrthropic_tool_schema(tool: ToolDef) -> dict:
    """Convert ToolDef to Anthropic tool schema."""
    return {
        "name": tool.name,
        "description": tool.description,
        "input_schema": tool.input_schema,
    }


def tool_definitions_for_llm(tools: list[ToolDef]) -> list[dict]:
    return [anrthropic_tool_schema(t) for t in tools]


def _noop_schema() -> dict:
    return {"type": "object", "properties": {}}


# Build registry at import time from tool modules
def _load_all():
    from app.tools import cashflow, financing, health, receivables, tax, expense  # noqa
    for mod in (cashflow, financing, health, receivables, tax, expense):
        for obj in vars(mod).values():
            if isinstance(obj, ToolDef):
                _REGISTRY[obj.name] = obj


_load_all()