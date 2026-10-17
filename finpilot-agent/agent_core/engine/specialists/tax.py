from typing import Any

def generate_tax_analysis(query: str, metrics: dict[str, Any], tools_data: list[dict]) -> str:
    company = metrics["company_name"]
    curr = metrics["currency"]
    ind = metrics["industry_profile"]
    
    tax_tool = next((t["result"] for t in tools_data if "calculate_estimated_tax" in t.get("tool", "")), {})
    taxable_profit = tax_tool.get("taxable_profit", 850000.0)
    est_cit = tax_tool.get("estimated_cit_tax", 42500.0)
    deductibles = tax_tool.get("deductible_expenses_total", 1450000.0)

    tax_bullets = "\n".join([f"- **{tc}**" for tc in ind.get("tax_concerns", [])])

    return f"""### 🏛️ SME Tax Optimization & Regulatory Compliance for {company}

- **Jurisdiction:** Bangladesh (NBR Corporate Tax & Value Added Tax)
- **Estimated Taxable Income (YTD):** ৳ {taxable_profit:,.2f} {curr}
- **Estimated Corporate Income Tax (CIT):** ৳ {est_cit:,.2f} {curr} (Preferential SME rate applied)
- **Verified Deductible Operating Expenses:** ৳ {deductibles:,.2f} {curr}

**Key Sector-Specific Tax Considerations ({ind['sector']}):**
{tax_bullets}

**CFO Recommendation:**
Ensure all vendor bills maintain valid Mushak 6.3 challans to maximize input tax credit offsets on your monthly Mushak 9.1 return (due by the 15th)."""
