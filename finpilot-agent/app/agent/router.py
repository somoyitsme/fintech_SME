"""Intent router: classify queries to the appropriate pillar.

Uses keyword/pattern matching rather than LLM for determinism and latency.
"""
from typing import Optional

# Pillar keyword mappings
PILLAR_KEYWORDS = {
    "cashflow": [
        "cash flow", "cashflow", "runway", "burn rate", "liquidity",
        "cash position", "projection", "forecast", "survive", "cash out",
    ],
    "financing": [
        "financing", "loan", "borrow", "credit", "webank", "weiyedai",
        "micro loan", "funding", "capital", "interest rate", "apr",
    ],
    "health": [
        "health", "profit", "margin", "p&l", "working capital", "dso",
        "benchmark", "industry", "ratios", "performance", "balance sheet",
    ],
    "receivables": [
        "receivable", "invoice", "aging", "overdue", "collection",
        "customer", "debtor", "ar", "chase", "follow up",
    ],
    "tax": [
        "tax", "vat", "cit", "compliance", "deadline", "deductible",
        "filing", "irs", "revenue service", "preferential",
    ],
    "expense": [
        "expense", "cost", "spend", "opex", "vendor", "anomaly",
        "spike", "unit economics", "save money", "cut",
    ],
}


def classify_intent(query: str) -> str:
    """Classify query to a pillar. Returns pillar name or 'general'."""
    lower = query.lower()

    # Count keyword matches per pillar
    scores = {}
    for pillar, keywords in PILLAR_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in lower)
        if score > 0:
            scores[pillar] = score

    if not scores:
        return "general"

    # Return highest scoring pillar
    return max(scores.items(), key=lambda x: x[1])[0]


def get_tools_for_pillar(pillar: str) -> list:
    """Get all tools for a given pillar."""
    from app.tools.registry import tools_for_pillar
    if pillar == "general":
        from app.tools.registry import all_tools
        return all_tools()
    return tools_for_pillar(pillar)