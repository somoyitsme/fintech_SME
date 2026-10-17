from typing import Any

def generate_cashflow_analysis(query: str, metrics: dict[str, Any], tools_data: list[dict]) -> str:
    company = metrics["company_name"]
    curr = metrics["currency"]
    balance = metrics["current_balance"]
    burn = metrics["monthly_burn_rate"]
    runway = metrics["runway_months"]
    dip_day = metrics.get("liquidity_dip_day")
    overdue = metrics["total_overdue_ar"]
    ind = metrics["industry_profile"]

    dip_text = (
        f"⚠️ **Liquidity Risk Detected around Day {dip_day}:** Without receivables acceleration, your cash reserves will breach the safety threshold of ৳ 500,000 due to recurring operational overhead and inventory purchase commitments.\n\n"
        if dip_day else
        f"✅ **Liquidity Buffer Stable:** Operating balances comfortably exceed safety thresholds across the 60-day horizon.\n\n"
    )

    return f"""### 📊 Real-Time Liquidity & Runway Diagnosis for {company}

- **Current Liquid Balance:** **৳ {balance:,.2f} {curr}**
- **Net Monthly Burn Rate:** **৳ {burn:,.2f} {curr}**
- **Operational Cash Runway:** **{runway} Months**
- **Typical Industry Working Capital Cycle:** {ind['working_capital_cycle']}

{dip_text}**Fractional CFO Strategic Action Plan:**
1. **Accelerate Past-Due Collections:** You currently have **৳ {overdue:,.2f} {curr}** in overdue client accounts. Collecting even 60% of this extends runway by **+{round((overdue * 0.6) / max(1.0, burn), 1)} months**.
2. **Buffer with Non-Dilutive Revolving Credit:** Activate our pre-approved **{ind['optimal_financing']}** (e.g. WeBank Weiyedai up to ৳ 50 Lakh) to fund bulk order cycles without depleting liquid cash.
3. **Expense Optimization:** Monitor the top operational cost drivers in {ind['sector']}: *{', '.join(ind['critical_cost_drivers'][:2])}*."""
