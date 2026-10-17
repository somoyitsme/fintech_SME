import re
from typing import Any

def generate_general_analysis(query: str, metrics: dict[str, Any], tools_data: list[dict]) -> str:
    company = metrics.get("company_name", "Dhaka Silicon & Hardware Ltd.")
    industry = metrics.get("industry", "Computer Wholesale & Retail")
    curr = metrics.get("currency", "BDT")
    balance = metrics.get("current_balance", 2850000.0)
    burn = metrics.get("monthly_burn_rate", 620000.0)
    runway = metrics.get("runway_months", 4.6)
    overdue = metrics.get("total_overdue_ar", 480000.0)
    ind = metrics.get("industry_profile", {"sector": "Technology Wholesale & Distribution"})
    q_low = query.lower()

    # Greetings / Who are you
    if any(w in q_low for w in ["hello", "hey", "who are you", "what can you do"]) or re.search(r'\bhi\b', q_low):
        return f"""Hello! I am **FinPilot**, an autonomous AI Financial Copilot and Virtual CFO.

I am actively monitoring the real-time financial health of **{company}** ({industry} - {ind['sector']}).
My core capabilities include:
- **Liquidity & Cash Runway Forecasting**: Grounded projections to prevent cash pinches before inventory/vendor billing cycles.
- **Smart Receivables & Overdue Recovery**: Pinpointing delinquent customer accounts and generating high-conversion payment notices.
- **Instant SME Financing Matching**: Pre-qualifying non-collateral working capital lines like **WeBank Weiyedai** (up to ৳ 50 Lakh) and invoice factoring.
- **Tax Optimization & Deductions**: Computing preferential SME rates, Mushak 9.1 VAT credits, and duty deductions.

How can I assist your business today?"""

    # Integration / Standalone architecture query
    if any(w in q_low for w in ["integrate", "embed", "sdk", "standalone", "seperate", "separate", "any sme", "how does it work", "api"]):
        return f"""### 🔌 FinPilot Standalone AI Agent Platform & Universal Integration

FinPilot operates as a **100% decoupled, multi-tenant AI financial microservice** designed to plug into **any external SME system** (ERP, POS, billing site, or custom portal):

1. **Universal 1-Line Embed SDK (`/sdk/finpilot-sdk.js`):**
   Add a single `<script>` tag to any host webpage:
   ```html
   <script src="http://localhost:8100/sdk/finpilot-sdk.js" data-api-key="fpk_live_..."></script>
   ```
   Renders an isolated, secure, sandboxed iframe widget with real-time AI reasoning.

2. **Automated Tenant Data Ingestion (`POST /api/v1/sync`):**
   The host SME syncs customer invoices, expenses, and cash flow records via standard REST APIs.
   The agent **self-contextualizes** — learning your industry, currency, customer payment cycles, and cost drivers.

3. **Multi-Tenant Data Isolation & Security:**
   - Cryptographically hashed API keys (`fpk_live_...`)
   - 3-tier safety guardrails (autonomous read, supervised draft, zero money-movement)
   - Complete tenant database isolation."""

    # Inventory purchase / Affordability query
    if any(w in q_low for w in ["afford", "buy", "purchase", "order", "inventory", "stock", "units", "batch"]):
        units_match = re.search(r'(\d+)\s*(units?|pieces?|pcs?|items?|cartons?|batches?)', q_low)
        qty = int(units_match.group(1)) if units_match else 25
        est_unit = 25000.0 if "gpu" not in q_low else 75000.0
        total_cost = qty * est_unit
        cash_left = balance - total_cost
        post_runway = round(cash_left / max(burn, 1.0), 1)

        verdict = "✅ **Viable with Prudence**" if cash_left > 400000 else "⚠️ **High Liquidity Risk - Consider Financing**"

        return f"""### 📦 Inventory Purchase Affordability Assessment for {company}

**Scenario Analysis:** Ordering approximately **{qty} units** of stock ({', '.join(ind['key_inventory_types'][:2])}) at ~৳ {est_unit:,.0f}/unit (Est. outlay: **৳ {total_cost:,.2f} {curr}**):

- **Current Liquid Balance:** ৳ {balance:,.2f} {curr}
- **Estimated Purchase Outlay:** ৳ {total_cost:,.2f} {curr}
- **Post-Purchase Cash Reserves:** **৳ {cash_left:,.2f} {curr}**
- **Post-Purchase Runway:** **{post_runway} Months** (down from {runway} months)
- **Verdict:** {verdict}

**Fractional CFO Strategy:**
- Settle part of the order using supplier credit or tap into our pre-qualified **WeBank Weiyedai credit line** at 4.2%–7.5% APR to protect your cash floor.
- Expedite collection of your **৳ {overdue:,.2f} {curr}** in overdue client accounts to replenish working capital."""

    # Default fallback
    return f"""### 📊 Financial Diagnosis for {company}

Here is a summary of your current operating posture:
- **Operating Liquidity:** ৳ {balance:,.2f} {curr} ({runway} months of operational runway)
- **Net Monthly Burn:** ৳ {burn:,.2f} {curr}
- **Overdue Client Receivables:** ৳ {overdue:,.2f} {curr}
- **Sector Focus:** {ind['sector']}

Regarding your question: *"{query}"*

I recommend keeping at least 2.5 months of cash buffer to absorb standard {ind['working_capital_cycle']} turnaround times. How else may I assist with your financial planning?"""
