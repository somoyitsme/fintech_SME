"""8-Layer Security Guardrail Pipeline.

Execution order (any layer can abort with HTTPException):
1. API key authentication (handled by auth.py dependency)
2. Rate limiting (handled by auth.py)
3. Prompt injection detection
4. Intent classification (deferred to agent layer)
5. Tier-3 restricted keyword check
6. PII redaction
7. Tenant scoping enforcement (per-query via security.tenants)
8. HMAC-signed audit logging

This module provides the orchestration and audit logging.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import TenantContext
from app.core.crypto import sign_audit_log
from app.core.models import AuditLog
from app.security.injection import is_blocked as injection_blocked
from app.security.permissions import check_restricted_intent, PermissionTier
from app.security.pii import redact_pii


class GuardrailResult:
    """Result of security pipeline execution."""

    def __init__(
        self,
        blocked: bool,
        reason: str,
        sanitized_query: str,
        permission_tier: Optional[PermissionTier] = None,
    ):
        self.blocked = blocked
        self.reason = reason
        self.sanitized_query = sanitized_query
        self.permission_tier = permission_tier


class SecurityPipeline:
    """8-layer security guardrail orchestrator."""

    def __init__(self, db: AsyncSession, ctx: TenantContext):
        self.db = db
        self.ctx = ctx

    async def process(self, query: str) -> GuardrailResult:
        """Execute the 8-layer pipeline.

        Raises:
            HTTPException: if any layer blocks the request
        """
        # Layers 1-2: API key auth and rate limiting already handled by auth.py

        # Layer 3: Prompt injection detection
        blocked, reason = injection_blocked(query)
        if blocked:
            await self._audit("SECURITY_INJECTION_BLOCKED", "blocked", {"reason": reason, "query_sample": query[:100]})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Request blocked: {reason}",
            )

        # Layer 5: Tier-3 restricted keyword check (early abort)
        restricted_reason = check_restricted_intent(query)
        if restricted_reason:
            await self._audit("SECURITY_RESTRICTED_INTENT", "blocked", {"reason": restricted_reason})
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action not permitted: {restricted_reason}",
            )

        # Layer 6: PII redaction
        sanitized = redact_pii(query)

        # Layer 4: Intent classification happens in agent orchestrator (deferred)
        # Layer 7: Tenant scoping enforcement happens per-tool via security.tenants
        # Layer 8: Audit logging happens below

        await self._audit("QUERY_ACCEPTED", "ok", {"query_length": len(query), "pii_redacted": query != sanitized})

        return GuardrailResult(
            blocked=False,
            reason="",
            sanitized_query=sanitized,
            permission_tier=None,  # determined by orchestrator
        )

    async def _audit(self, action: str, outcome: str, details: dict):
        """Layer 8: Write HMAC-signed audit log."""
        now = datetime.now(timezone.utc)
        signature = sign_audit_log(
            self.ctx.tenant_id,
            action,
            outcome,
            now.isoformat(),
        )

        audit = AuditLog(
            tenant_id=self.ctx.tenant_id,
            api_key_id=self.ctx.api_key.id,
            action=action,
            outcome=outcome,
            details=details,
            ip_address=self.ctx.ip_address,
            signature=signature,
            created_at=now,
        )
        self.db.add(audit)
        await self.db.commit()

    async def audit_tool_execution(
        self,
        tool_name: str,
        permission_tier: PermissionTier,
        outcome: str,
        details: dict,
    ):
        """Log tool execution for Layer 8 audit trail."""
        await self._audit(
            action=f"TOOL_EXECUTE_{tool_name.upper()}",
            outcome=outcome,
            details={
                "tool": tool_name,
                "tier": permission_tier.value,
                **details,
            },
        )
