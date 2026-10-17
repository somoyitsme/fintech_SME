from typing import Any

RESTRICTED_ACTIONS = [
    "transfer money",
    "wire funds",
    "delete database",
    "change bank account",
    "modify recipient account",
    "bypass approval",
    "delete tenant",
    "drop table"
]

SUPERVISED_ACTIONS = [
    "create_invoice",
    "create_expense",
    "send_payment_reminder",
    "apply_loan",
    "dispatch_email",
    "stage_draft"
]

def enforce_permission_tier(action_name: str, arguments: dict[str, Any]) -> tuple[str, bool, str]:
    """
    Evaluates action against the 3 permission tiers:
    - Tier 1 (Autonomous): Read, calculate, analyze, forecast, benchmark. Always allowed.
    - Tier 2 (Supervised): Draft, stage, or prepare external notices. Allowed with supervisor flag.
    - Tier 3 (Restricted): Direct money movement / ledger deletion / account hijacking. Strictly refused.
    """
    action_lower = action_name.lower()
    args_str = str(arguments).lower()

    # Check Tier 3: Blocked actions
    for restricted in RESTRICTED_ACTIONS:
        if restricted in action_lower or restricted in args_str:
            return (
                "tier_3_restricted",
                False,
                "Action Refused: FinPilot agents are strictly forbidden from initiating financial transfers, altering bank accounts, or deleting core tenant records."
            )

    # Tier 2: Supervised modifications
    if any(sa in action_lower for sa in SUPERVISED_ACTIONS):
        return (
            "tier_2_supervised",
            True,
            "Action staged for human supervisor review & confirmation before execution."
        )

    # Tier 1: Autonomous reads and analyses
    return "tier_1_autonomous", True, "Autonomous analysis executed."
