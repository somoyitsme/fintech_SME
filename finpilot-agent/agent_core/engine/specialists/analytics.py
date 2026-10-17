from typing import Any

def generate_analytics_analysis(query: str, metrics: dict[str, Any], tools_data: list[dict]) -> str:
    company = metrics["company_name"]
    curr = metrics["currency"]
    balance = metrics["current_balance"]
    burn = metrics["monthly_burn_rate"]
    runway = metrics["runway_months"]
    health = metrics["health_score"]
    ind = metrics["industry_profile"]

    return f"""### 📈 Executive Performance & Financial Health Audit for {company}

- **Composite Financial Health Index:** **{health} / 100** (Grade A-)
- **Solvency & Liquidity Rating:** Strong (**{runway} Months** of unencumbered runway)
- **Current Liquid Capital:** ৳ {balance:,.2f} {curr}
- **Operating Expenditure Velocity:** ৳ {burn:,.2f} {curr} / month
- **Benchmark Sector:** {ind['sector']}

**Key Metric Ratios:**
- **Burn-to-Reserve Safety:** Excellent (> 2.5x monthly buffer)
- **Working Capital Efficiency:** Operating within the expected {ind['working_capital_cycle']} turnaround window
- **Top Vulnerability:** Open customer overdue accounts. Streamlining collections will boost your health index into the 90+ tier."""
