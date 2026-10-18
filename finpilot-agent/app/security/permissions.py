"""3-Tier permission model enforcement.

Tier 1 (Autonomous): Execute immediately without confirmation
Tier 2 (Supervised): Generate draft, require human approval, no side effects
Tier 3 (Restricted): Always refuse, audit log violation
"""
from enum import Enum
from typing import Optional


class PermissionTier(str, Enum):
    AUTONOMOUS = "autonomous"
    SUPERVISED = "supervised"
    RESTRICTED = "restricted"


# Tool name → permission tier mapping
TOOL_PERMISSIONS = {
    # Tier 1: Read/calculate operations
    "get_bank_position": PermissionTier.AUTONOMOUS,
    "compute_burn_rate": PermissionTier.AUTONOMOUS,
    "project_cash_flow_30_60_90": PermissionTier.AUTONOMOUS,
    "detect_liquidity_dips": PermissionTier.AUTONOMOUS,
    "simulate_what_if": PermissionTier.AUTONOMOUS,
    "webank_prequalification_score": PermissionTier.AUTONOMOUS,
    "match_financing_products": PermissionTier.AUTONOMOUS,
    "estimate_loan_capacity": PermissionTier.AUTONOMOUS,
    "profit_loss_summary": PermissionTier.AUTONOMOUS,
    "compute_margins": PermissionTier.AUTONOMOUS,
    "compute_working_capital": PermissionTier.AUTONOMOUS,
    "compute_dso": PermissionTier.AUTONOMOUS,
    "dupont_health_score": PermissionTier.AUTONOMOUS,
    "benchmark_vs_industry": PermissionTier.AUTONOMOUS,
    "ar_aging_buckets": PermissionTier.AUTONOMOUS,
    "flag_customer_default_risk": PermissionTier.AUTONOMOUS,
    "reconcile_vat": PermissionTier.AUTONOMOUS,
    "estimate_cit_preferential": PermissionTier.AUTONOMOUS,
    "validate_deductible_expenses": PermissionTier.AUTONOMOUS,
    "compliance_calendar": PermissionTier.AUTONOMOUS,
    "categorize_recurring_opex": PermissionTier.AUTONOMOUS,
    "detect_anomaly_spikes": PermissionTier.AUTONOMOUS,
    "compute_unit_economics": PermissionTier.AUTONOMOUS,
    "recommend_cost_cuts": PermissionTier.AUTONOMOUS,
    # Tier 2: Draft generation (no side effects)
    "generate_collection_letter": PermissionTier.SUPERVISED,
    "draft_invoice": PermissionTier.SUPERVISED,
    "draft_expense_record": PermissionTier.SUPERVISED,
    # Tier 3: Strictly forbidden
    "transfer_funds": PermissionTier.RESTRICTED,
    "wire_transfer": PermissionTier.RESTRICTED,
    "delete_data": PermissionTier.RESTRICTED,
    "drop_table": PermissionTier.RESTRICTED,
    "modify_schema": PermissionTier.RESTRICTED,
}


RESTRICTED_KEYWORDS = [
    "transfer funds",
    "wire transfer",
    "send money",
    "move money",
    "pay invoice",
    "delete all",
    "drop table",
    "truncate",
    "drop database",
]


def get_permission_tier(tool_name: str) -> PermissionTier:
    """Get permission tier for a tool."""
    return TOOL_PERMISSIONS.get(tool_name, PermissionTier.AUTONOMOUS)


def check_restricted_intent(query: str) -> Optional[str]:
    """Check if query contains restricted intent. Returns reason if blocked."""
    lower = query.lower()
    for keyword in RESTRICTED_KEYWORDS:
        if keyword in lower:
            return f"Restricted action requested: '{keyword}'"
    return None


def should_block_tool(tool_name: str) -> tuple[bool, str]:
    """Return (should_block, reason) for a tool execution."""
    tier = get_permission_tier(tool_name)
    if tier == PermissionTier.RESTRICTED:
        return True, f"Tool '{tool_name}' is restricted (Tier 3: Always refuse)"
    return False, ""
