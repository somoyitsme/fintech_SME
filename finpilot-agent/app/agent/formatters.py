"""Response formatters: Convert tool outputs to CFO-level markdown.

NO conversational fluff. Bottom-line first. Tables for numbers. Metric pills for KPIs. Action steps with dates.
"""
from datetime import date, datetime
from typing import Any, List, Dict


def format_table(headers: List[str], rows: List[List[Any]], align: str = "left") -> str:
    """Generate clean markdown table."""
    if not rows:
        return "_No data_"

    # Header
    table = "| " + " | ".join(headers) + " |\n"

    # Separator
    sep = "---" if align == "left" else ":---:" if align == "center" else "---:"
    table += "|" + "|".join([sep] * len(headers)) + "|\n"

    # Rows
    for row in rows:
        table += "| " + " | ".join(str(cell) for cell in row) + " |\n"

    return table


def metric_pill(label: str, value: Any, unit: str = "", alert: bool = False) -> str:
    """Generate metric pill callout."""
    icon = "⚠️" if alert else ""
    return f"> **{label}: {value}{unit}** {icon}"


def format_cash_flow_response(tools_results: Dict[str, Any]) -> str:
    """Format cash flow analysis with CFO precision."""
    burn = tools_results.get("compute_burn_rate", {})
    projection = tools_results.get("project_cash_flow_30_60_90", {})

    response = []

    # Bottom line first
    runway_mo = burn.get("runway_months")
    if runway_mo and runway_mo < 2:
        response.append(f"**URGENT**: Cash runway critical at {runway_mo} months.")
    elif runway_mo:
        response.append(f"**Cash Position**: {runway_mo}-month runway on current burn.")

    response.append("")

    # Metrics
    if burn:
        response.append(metric_pill("Balance", f"¥{burn['balance']:,.0f}", alert=burn['balance'] < 100000))
        response.append(metric_pill("Monthly Burn", f"¥{burn['monthly_burn_rate']:,.0f}"))
        if runway_mo:
            response.append(metric_pill("Runway", f"{runway_mo} Mo", alert=runway_mo < 2))
        response.append("")

    # Projection table
    if projection and projection.get("projections"):
        response.append("### 90-Day Cash Flow Projection\n")
        rows = []
        for proj in projection["projections"]:
            rows.append([
                proj["period"],
                f"¥{proj['inflows']:,.0f}",
                f"¥{proj['outflows']:,.0f}",
                f"¥{proj['net']:,.0f}",
                f"¥{proj['ending_balance']:,.0f}",
            ])
        response.append(format_table(
            ["Period", "Inflows", "Outflows", "Net", "Balance"],
            rows
        ))
        response.append("")

        # Alert on negative balance
        for proj in projection["projections"]:
            if proj["ending_balance"] < 0:
                response.append(f"⚠️ **Alert**: Cash balance turns negative in {proj['period']}.\n")
                break

    # Action steps
    response.append("### Recommended Actions\n")
    response.append("1. **Immediate**: Review and accelerate collection on overdue invoices")
    response.append("2. **This Week**: Evaluate WeBank Weiyedai credit line application")
    response.append("3. **This Month**: Defer non-essential OPEX by 30 days")

    return "\n".join(response)


def format_financing_response(tools_results: Dict[str, Any]) -> str:
    """Format financing match with WeBank Weiyedai focus."""
    score_result = tools_results.get("webank_prequalification_score", {})
    products = tools_results.get("match_financing_products", {})

    response = []

    score = score_result.get("score", 0)
    qual = score_result.get("qualification", "low")

    # Bottom line
    if score >= 75:
        response.append(f"**WeBank Weiyedai**: {score}% pre-qualified — HIGH approval likelihood.")
    elif score >= 50:
        response.append(f"**WeBank Weiyedai**: {score}% pre-qualified — MEDIUM approval likelihood.")
    else:
        response.append(f"**WeBank Weiyedai**: {score}% pre-qualified — LOW approval likelihood. Build credit history.")

    response.append("")
    response.append(metric_pill("Pre-Qualification Score", f"{score}%", alert=score < 50))
    response.append("")

    # Products table
    if products and products.get("products"):
        response.append("### Matched Financing Products\n")
        rows = []
        for p in products["products"]:
            rows.append([
                p["product"],
                p["type"].replace("_", " ").title(),
                f"¥{p.get('max_amount', 0):,.0f}",
                f"{p.get('apr', p.get('discount_rate', 0)):.1f}%",
                p["approval_time"],
            ])
        response.append(format_table(
            ["Product", "Type", "Max Amount", "Rate", "Approval"],
            rows
        ))

    response.append("")
    response.append("### Next Steps\n")
    response.append("1. **Apply Now**: WeBank Weiyedai online at cloud.webank.com/weiyedai")
    response.append("2. **Prepare Docs**: Bank statements (6 months), tax filings, business license")
    response.append("3. **Timeline**: Expect decision within 24 hours of submission")

    return "\n".join(response)


def format_generic_response(tools_results: Dict[str, Any]) -> str:
    """Fallback formatter for other pillars."""
    response = ["## Financial Analysis\n"]

    for tool_name, result in tools_results.items():
        response.append(f"### {tool_name.replace('_', ' ').title()}\n")

        # If result has recognizable patterns, format as table
        if isinstance(result, dict):
            if "buckets" in result:  # AR aging
                response.append(format_table(
                    ["Aging Bucket", "Count", "Amount"],
                    [[k, v["count"], f"¥{v['amount']:,.0f}"] for k, v in result["buckets"].items()]
                ))
            else:
                # Generic key-value display
                for k, v in result.items():
                    if isinstance(v, (int, float)):
                        response.append(f"- **{k}**: {v:,.2f}")
                    else:
                        response.append(f"- **{k}**: {v}")
        response.append("")

    return "\n".join(response)


def format_agent_response(pillar: str, tools_results: Dict[str, Any]) -> str:
    """Route to specialized formatter by pillar."""
    if pillar == "cashflow":
        return format_cash_flow_response(tools_results)
    elif pillar == "financing":
        return format_financing_response(tools_results)
    else:
        return format_generic_response(tools_results)
