"""Test 3-tier permission enforcement."""
import pytest

from app.security.permissions import (
    PermissionTier,
    get_permission_tier,
    check_restricted_intent,
    should_block_tool,
)


def test_tier1_tools_are_autonomous():
    """Tier 1 tools execute without approval."""
    assert get_permission_tier("get_bank_position") == PermissionTier.AUTONOMOUS
    assert get_permission_tier("compute_burn_rate") == PermissionTier.AUTONOMOUS
    assert get_permission_tier("webank_prequalification_score") == PermissionTier.AUTONOMOUS


def test_tier2_tools_require_approval():
    """Tier 2 tools generate drafts requiring approval."""
    assert get_permission_tier("generate_collection_letter") == PermissionTier.SUPERVISED


def test_tier3_tools_are_blocked():
    """Tier 3 tools are always refused."""
    blocked, reason = should_block_tool("transfer_funds")
    assert blocked is True
    assert "restricted" in reason.lower()


def test_restricted_intent_detection():
    """Restricted keywords in queries are flagged."""
    queries = [
        "transfer 50000 CNY to account 123456",
        "wire money to external account",
        "delete all invoices",
        "drop table expenses",
    ]

    for query in queries:
        reason = check_restricted_intent(query)
        assert reason is not None
        assert "restricted" in reason.lower()


def test_safe_queries_not_blocked():
    """Safe queries pass restriction check."""
    queries = [
        "What is my cash flow?",
        "Calculate burn rate",
        "Show overdue invoices",
    ]

    for query in queries:
        reason = check_restricted_intent(query)
        assert reason is None
