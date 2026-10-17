# 🧠 SME Finance Copilot — Deep Product & Implementation Plan

> **Agent Name Proposal:** **"FinPilot"** — Your AI CFO for Small Business
> **Contest:** 2026 FinTechathon International Track · Topic E  
> **Scoring:** Task Completion (40%) · Security & Compliance (30%) · Innovation & Interaction (30%)

---

## Part 1: The Real-World Problem You're Solving

### The SME Financing Crisis — By the Numbers

Small and medium enterprises represent **99%+ of all businesses** in most economies, yet they face a systemic financial exclusion crisis:

| Problem | Reality |
|---------|---------|
| **Credit Gap** | SMEs in developing countries face a **$5.2 trillion** annual financing gap (IFC/World Bank) |
| **Cash Flow Deaths** | **82%** of small businesses fail due to cash flow mismanagement, not lack of demand |
| **The "Missing Middle"** | Too large for microfinance, too small/risky for corporate banking |
| **Information Asymmetry** | Most SMEs lack audited financials, making them "credit-invisible" to banks |
| **Delayed Payments** | Average payment cycle for SME invoices: **60-90 days** — while operating costs are due immediately |
| **No Dedicated CFO** | Business owners with 5-50 employees cannot afford a financial advisor |

### Why This Matters for the Contest

The judges are **WeBank industry experts** — the creators of **Weiyedai** (微业贷), China's first fully-digital unsecured SME loan product. They deeply understand these problems. Your agent must demonstrate that you understand the *real pain*, not just build a generic chatbot.

> [!IMPORTANT]
> **Winning Insight:** WeBank's Weiyedai philosophy is *"zero collateral, zero paperwork, 15-minute approval"* powered by alternative data and AI. Your agent should embody this same philosophy — making complex financial tasks effortless for SME owners who have no finance background.

---

## Part 2: What Your Agent Actually Does — The Five Pillars

Your copilot is **not a chatbot that answers questions**. It is an **autonomous AI financial agent** that takes actions on behalf of the SME owner. Each pillar maps directly to scoring criteria.

---

### 🔵 Pillar 1: Intelligent Cash Flow Forecasting & Alert System
**Scoring Target:** Task Completion (40%) + Innovation (30%)

#### The Problem It Solves
A street food vendor in Bangkok earns ฿80,000/month but pays rent (฿15,000), ingredients (฿40,000), staff (฿18,000), and loan repayments (฿8,000) on different dates. They have no visibility into when cash will run out. They discover it when their card declines.

#### What the Agent Does
1. **Ingests financial data** via natural conversation:
   - "I earn about 3,000 baht per day, more on weekends. Rent is 15,000 due on the 1st. I pay staff weekly on Friday."
   - Agent structures this into a financial model automatically
   
2. **Builds a rolling 90-day cash flow projection** using:
   - **Prophet model** for seasonal/cyclical business patterns (weekend spikes, month-end dips)
   - **Deterministic calculation** for known fixed costs (rent, loan payments, salaries)
   - **Monte Carlo simulation** for variable income uncertainty (generates best/worst/expected scenarios)

3. **Proactive Alerts** — the agent doesn't wait to be asked:
   - 🔴 "**Cash Crisis Alert:** At current burn rate, you'll have only ฿2,100 left by October 28 — below your ฿5,000 safety buffer. Consider delaying your ingredient bulk purchase by 3 days until after the weekend revenue."
   - 🟡 "**Heads Up:** Your Q4 tax payment of ฿12,000 is due in 18 days. Current projected balance at that date: ฿14,200. Tight but doable if Client A pays on time."
   - 🟢 "**Opportunity:** You've accumulated ฿45,000 in surplus cash over the past 6 weeks. Consider a 3-month term deposit at 2.1% to earn ฿236 in interest."

4. **"What-If" Scenario Engine:**
   - User: "What if I hire one more staff at 12,000/month?"
   - Agent: Reruns the model → "Your runway decreases from 4.2 months to 2.8 months. You'd need to increase daily revenue by ฿400 (~13%) to maintain the same buffer. Alternatively, consider a part-time hire at ฿6,000/month — this keeps your runway above 3.5 months."

#### Implementation Details
```
Tool: calculate_cash_flow_forecast
├── Input: income_streams[], fixed_costs[], variable_costs[], current_balance
├── Method: Prophet for trend + Monte Carlo for uncertainty bands
├── Output: {
│     daily_balances: [{date, projected_balance, lower_bound, upper_bound}],
│     alerts: [{severity, date, message, recommended_action}],
│     runway_months: float,
│     safety_buffer_breach_date: date | null
│   }
└── Execution: Sandboxed Python (deterministic math, NOT LLM-generated numbers)
```

```
Tool: run_what_if_scenario
├── Input: base_forecast, scenario_changes: [{type, description, amount, start_date}]
├── Output: {
│     comparison: {before: forecast, after: forecast},
│     impact_summary: string,
│     risk_delta: float
│   }
└── The LLM NEVER calculates numbers — it only interprets results from this tool
```

---

### 🟢 Pillar 2: Financing Option Matching & Eligibility Engine
**Scoring Target:** Task Completion (40%) + Innovation (30%)

#### The Problem It Solves
An SME owner needs ฿500,000 to expand. They have no idea:
- Which banks offer SME loans (there are 50+ products in any market)
- Whether they even qualify (each has different requirements)
- What documents they need
- Which option gives them the best terms for their situation

They waste weeks visiting banks, getting rejected, and damaging their credit score with hard inquiries.

#### What the Agent Does

1. **Business Profile Builder** — Through conversation, the agent extracts:
   ```
   Business Profile = {
     business_type: "Restaurant",
     years_in_operation: 2.5,
     monthly_revenue: 80000,
     monthly_expenses: 72000,
     existing_debt: 50000,
     collateral_available: ["equipment worth ~200,000"],
     number_of_employees: 4,
     tax_registration: true,
     digital_payment_history: true,  // e.g., PromptPay, LINE Pay
     purpose_of_loan: "kitchen expansion + 2 new staff"
   }
   ```

2. **Multi-Criteria Matching Engine:**
   - **Hard filters** eliminate products the business is ineligible for (e.g., minimum 3 years in operation, minimum revenue thresholds)
   - **Soft scoring** ranks remaining options by:
     - Effective APR (total cost of borrowing)
     - Approval probability (based on profile match to known criteria)
     - Repayment flexibility (aligned with seasonal cash flow patterns)
     - Speed of disbursement
   
3. **Outputs a ranked recommendation with plain-English explanation:**
   ```
   🏆 Best Match: WeBank Weiyedai — Working Capital Line
   ├── Credit Line: Up to ¥300,000 (≈฿1.5M)
   ├── Interest: 4.35% - 7.2% annual
   ├── Collateral: None required
   ├── Approval Time: ~15 minutes (fully digital)
   ├── Your Match Score: 87/100
   ├── Why It Fits: Your 2.5 years of operation and consistent
   │   digital payment history make you a strong candidate.
   │   No physical collateral needed.
   └── Gap Warning: Your debt-to-income ratio (62%) is borderline.
       Paying down ฿15,000 of existing debt would significantly
       improve your approval odds.

   🥈 Runner-Up: Government SME Soft Loan Program
   ├── ...
   ```

4. **Document Preparation Assistant:**
   - "To apply for Weiyedai, you'll need: (1) Business registration certificate, (2) Tax ID, (3) 6 months of bank statements. I can help you draft a summary of your financials to attach."

#### Implementation Details
```
Tool: match_financing_options
├── Input: business_profile: BusinessProfile
├── Data Source: Curated database of 30+ financing products with eligibility rules
│   (Structured as JSON rules engine, NOT LLM knowledge)
├── Method:
│   1. Hard-filter elimination (deterministic rule matching)
│   2. Soft-score ranking (weighted scoring model)
│   3. Gap analysis (what's missing for each option)
├── Output: {
│     ranked_matches: [{
│       product_name, provider, match_score, interest_rate,
│       max_amount, approval_time, requirements_met[],
│       requirements_missing[], recommendation_reason
│     }],
│     overall_advice: string
│   }
```

**The Financing Products Database** (pre-built, not hallucinated):
```json
{
  "products": [
    {
      "id": "webank_weiyedai",
      "name": "WeBank Weiyedai Working Capital",
      "type": "unsecured_credit_line",
      "max_amount": 3000000,
      "currency": "CNY",
      "interest_range": [4.35, 7.2],
      "min_years_operation": 1,
      "min_monthly_revenue": 30000,
      "requires_collateral": false,
      "requires_tax_registration": true,
      "digital_application": true,
      "approval_time_hours": 0.25,
      "eligibility_rules": [
        {"field": "years_in_operation", "operator": ">=", "value": 1},
        {"field": "tax_registration", "operator": "==", "value": true}
      ]
    },
    // ... 30+ products covering:
    // - Bank term loans
    // - Government SME grants/subsidies
    // - Invoice factoring / receivables financing
    // - Revenue-based financing
    // - Microfinance institutions
    // - P2P lending platforms
    // - Supply chain financing
  ]
}
```

---

### 🟡 Pillar 3: Business Financial Health Analysis & Reporting
**Scoring Target:** Task Completion (40%) + Innovation (30%)

#### The Problem It Solves
Most SME owners have:
- A pile of receipts
- A vague sense of "good month" vs "bad month"
- No understanding of P&L ratios, working capital, or break-even points
- No way to explain their financial health to a banker, investor, or partner

#### What the Agent Does

1. **Conversational Data Collection** — No spreadsheets required:
   - "Last month I made about 95,000 from sales. My costs were ingredients 38,000, rent 15,000, staff 18,000, electricity 3,500, loan payment 8,000. I think I also spent about 5,000 on marketing on Facebook."
   
2. **Automated P&L Generation:**
   ```
   ┌─────────────────────────────────────────────┐
   │   PROFIT & LOSS STATEMENT — September 2026  │
   ├─────────────────────────────────────────────┤
   │ Revenue                         ฿95,000     │
   │ ─────────────────────────────────────────── │
   │ Cost of Goods Sold (COGS)       ฿38,000     │
   │ Gross Profit                     ฿57,000     │
   │ Gross Margin                     60.0%       │
   │ ─────────────────────────────────────────── │
   │ Operating Expenses:                          │
   │   Rent                          ฿15,000     │
   │   Staff/Payroll                 ฿18,000     │
   │   Utilities                      ฿3,500     │
   │   Marketing                      ฿5,000     │
   │ Total Operating Expenses        ฿41,500     │
   │ ─────────────────────────────────────────── │
   │ EBITDA                          ฿15,500     │
   │ Operating Margin                 16.3%       │
   │ ─────────────────────────────────────────── │
   │ Loan Repayment                   ฿8,000     │
   │ Net Income                       ฿7,500     │
   │ Net Margin                        7.9%       │
   └─────────────────────────────────────────────┘
   ```

3. **Health Score Dashboard** — A single number the owner can understand:
   ```
   📊 Your Business Health Score: 68/100 (Fair)
   
   ✅ Strengths:
   • Gross margin (60%) is excellent for food service (industry avg: 55%)
   • Consistent revenue growth: +8% month-over-month
   
   ⚠️ Concerns:
   • Net margin (7.9%) is below industry average (12%)
   • Staff costs are 19% of revenue (industry avg: 15%)
   • Marketing ROI unclear — ฿5,000 spend with no tracked return
   
   🎯 Recommended Actions:
   1. Reduce staff overtime or consider shift optimization (potential savings: ฿2,000/mo)
   2. Track marketing ROI — add a promo code to Facebook ads to measure conversion
   3. Negotiate rent — your lease renewal is in 2 months; similar locations average ฿13,000
   ```

4. **Trend Analysis Over Time:**
   - "Your revenue has grown 23% over 6 months, but your costs grew 31%. If this continues, you'll be unprofitable by March 2027."

5. **Banker-Ready Report Export:**
   - Generate a clean PDF financial summary that the owner can attach to loan applications

#### Implementation Details
```
Tool: analyze_financials
├── Input: {
│     revenue_items: [{description, amount}],
│     expense_items: [{description, amount, category}],
│     period: "2026-09",
│     industry: "food_service"
│   }
├── Method: Deterministic calculation engine (NOT LLM math)
│   1. Auto-categorize expenses (COGS vs OpEx vs Debt Service)
│   2. Calculate all standard ratios
│   3. Compare against industry benchmarks (pre-loaded data)
│   4. Generate health score (weighted formula)
├── Output: {
│     pnl_statement: StructuredPnL,
│     ratios: {gross_margin, operating_margin, net_margin, current_ratio, ...},
│     health_score: int (0-100),
│     strengths: string[],
│     concerns: string[],
│     actions: [{priority, description, estimated_impact}],
│     industry_comparison: {metric, your_value, industry_avg, percentile}[]
│   }

Tool: generate_financial_report_pdf
├── Input: pnl_data, business_name, period
├── Output: PDF file path (banker-ready formatted report)
```

**Industry Benchmarks Database** (for comparison scoring):
```json
{
  "food_service": {
    "gross_margin": {"avg": 0.55, "good": 0.60, "excellent": 0.65},
    "net_margin": {"avg": 0.12, "good": 0.15, "excellent": 0.20},
    "staff_cost_ratio": {"avg": 0.15, "warning": 0.20, "critical": 0.25},
    "rent_ratio": {"avg": 0.10, "warning": 0.15, "critical": 0.20}
  },
  "retail": { ... },
  "e_commerce": { ... },
  "professional_services": { ... },
  "manufacturing": { ... }
}
```

---

### 🔴 Pillar 4: Accounts Receivable & Invoice Intelligence
**Scoring Target:** Task Completion (40%) + Innovation (30%)

#### The Problem It Solves
SME owners are owed money by clients but:
- Don't track which invoices are overdue
- Feel awkward chasing payments
- Don't know the impact of late payments on their cash flow
- Can't identify which clients are chronic late-payers

#### What the Agent Does

1. **Invoice Tracking Dashboard:**
   ```
   📋 Outstanding Invoices Summary:
   
   🔴 OVERDUE (3 invoices, ฿45,000 total):
   • INV-2024 | Client: ABC Corp | ฿25,000 | Due: Sep 15 | 31 days overdue
   • INV-2019 | Client: XYZ Ltd  | ฿12,000 | Due: Sep 20 | 26 days overdue  
   • INV-2022 | Client: 123 Co   | ฿8,000  | Due: Oct 1  | 15 days overdue
   
   🟡 DUE SOON (2 invoices, ฿18,000 total):
   • INV-2028 | Client: DEF Inc  | ฿10,000 | Due: Oct 20 | 4 days left
   • INV-2030 | Client: GHI Ltd  | ฿8,000  | Due: Oct 25 | 9 days left
   ```

2. **Smart Payment Reminder Drafting:**
   - Agent drafts professionally-worded reminder emails/messages
   - Tone adjusts based on how overdue: friendly (1-7 days) → firm (8-30 days) → formal (30+ days)
   - User reviews and sends — **agent never sends automatically** (Human-in-the-Loop)

3. **Client Payment Behavior Analysis:**
   - "ABC Corp has paid late on 4 of 6 invoices (avg 22 days late). Consider: (a) requiring 50% upfront, (b) offering 2% early-payment discount, or (c) adding a late-payment fee clause."

4. **Cash Flow Impact Calculation:**
   - "If all 3 overdue invoices were collected today, your cash buffer would increase from ฿12,000 to ฿57,000, extending your runway by 2.3 months."

#### Implementation Details
```
Tool: track_invoices
├── Input: invoices: [{id, client, amount, issue_date, due_date, status, paid_date?}]
├── Output: {
│     overdue: Invoice[], 
│     due_soon: Invoice[],
│     paid: Invoice[],
│     total_outstanding: number,
│     cash_flow_impact: CashFlowImpact,
│     client_reliability_scores: {client: string, score: number, avg_days_late: number}[]
│   }

Tool: draft_payment_reminder
├── Input: invoice: Invoice, tone: "friendly" | "firm" | "formal", channel: "email" | "message"
├── Output: {
│     subject: string,
│     body: string,
│     follow_up_date: date
│   }
├── Note: Agent drafts ONLY. Human must approve and send. (HITL guardrail)
```

---

### 🟣 Pillar 5: Tax Estimation & Compliance Calendar
**Scoring Target:** Security & Compliance (30%) + Task Completion (40%)

#### The Problem It Solves
SME owners:
- Don't know how much tax they owe until it's too late
- Miss filing deadlines and pay penalties
- Don't understand which expenses are deductible
- Can't plan for tax payments (sudden cash drain)

#### What the Agent Does

1. **Estimated Tax Calculation:**
   - Based on the P&L data already collected, estimate quarterly/annual tax obligations
   - Flag deductible expenses the owner might be missing
   
2. **Compliance Calendar with Proactive Reminders:**
   ```
   📅 Upcoming Compliance Deadlines:
   
   🔴 Oct 31, 2026 — Quarterly VAT Filing (Est. ฿4,200)
   🟡 Nov 15, 2026 — Social Security Contributions (฿3,400)
   🟢 Jan 31, 2027 — Annual Income Tax Filing (Est. ฿28,000)
   
   💡 Tax-Saving Tip: Your marketing expenses (฿5,000/month) are fully 
      deductible. Make sure you keep receipts/invoices as evidence.
   ```

3. **Cash Flow Integration:**
   - Tax obligations are automatically factored into the cash flow forecast
   - "Your estimated tax payment of ฿28,000 in January would reduce your projected cash to ฿3,200 — below your safety buffer. Start setting aside ฿7,000/month now."

---

## Part 3: Multi-Agent Architecture — How It All Fits Together

```
                        ┌──────────────────────────┐
                        │    SME Business Owner     │
                        │   (Chat Interface / UI)   │
                        └────────────┬─────────────┘
                                     │ Natural Language
                                     ▼
                    ┌────────────────────────────────────┐
                    │      🧠 ORCHESTRATOR AGENT          │
                    │  (Intent Router + Task Planner)     │
                    │                                     │
                    │  • Classifies user intent            │
                    │  • Decomposes complex requests       │
                    │  • Routes to specialist agents       │
                    │  • Synthesizes final responses       │
                    │  • Enforces guardrails               │
                    └──────┬────┬────┬────┬────┬─────────┘
                           │    │    │    │    │
              ┌────────────┘    │    │    │    └──────────────┐
              ▼                 ▼    │    ▼                   ▼
   ┌──────────────────┐  ┌─────────┐│┌──────────────┐  ┌──────────────┐
   │ 💰 CASH FLOW     │  │ 🏦 LOAN ││ 📊 FINANCIAL  │  │ 📋 INVOICE   │
   │    AGENT          │  │ MATCHER ││ ANALYST AGENT │  │    AGENT     │
   │                   │  │  AGENT  ││               │  │              │
   │ • Forecast        │  │         ││ • P&L Gen     │  │ • Track AR   │
   │ • Alerts          │  │ • Match ││ • Ratios      │  │ • Reminders  │
   │ • What-If         │  │ • Gaps  ││ • Health Score│  │ • Client     │
   │ • Scenarios       │  │ • Docs  ││ • Benchmarks  │  │   Scoring    │
   └────────┬─────────┘  └────┬────┘│└──────┬───────┘  └──────┬───────┘
            │                  │     │       │                  │
            └──────────────────┴─────┼───────┴──────────────────┘
                                     │
                              ┌──────▼──────────────────────────────┐
                              │       🔧 TOOL EXECUTION LAYER       │
                              │                                     │
                              │  • calculate_cash_flow_forecast()   │
                              │  • run_what_if_scenario()           │
                              │  • match_financing_options()        │
                              │  • analyze_financials()             │
                              │  • track_invoices()                 │
                              │  • draft_payment_reminder()         │
                              │  • estimate_tax_obligations()       │
                              │  • generate_financial_report_pdf()  │
                              │  • get_industry_benchmarks()        │
                              │  • search_financing_products_db()   │
                              │                                     │
                              │  ALL math runs here (Python sandbox)│
                              │  LLM NEVER generates numbers        │
                              └──────┬──────────────────────────────┘
                                     │
                              ┌──────▼──────────────────────────────┐
                              │       🗄️ DATA & KNOWLEDGE LAYER     │
                              │                                     │
                              │  • Financing Products DB (30+ items)│
                              │  • Industry Benchmarks DB           │
                              │  • Tax Rules & Deadlines DB         │
                              │  • User Session Memory (per-SME)    │
                              │  • RAG: Regulatory docs & policies  │
                              └─────────────────────────────────────┘
```

### Why Multi-Agent, Not Monolithic?

| Aspect | Monolithic (Single LLM Prompt) | Multi-Agent (Our Approach) |
|--------|-------------------------------|---------------------------|
| **Accuracy** | LLM might hallucinate financial numbers | Specialist agents use deterministic tools — math is always correct |
| **Scalability** | One massive system prompt = context window overflow | Each agent has a focused, smaller context |
| **Security** | Single point of failure | Each agent has scoped permissions (least privilege) |
| **Auditability** | "The AI said it" | Full trace: which agent, which tool, which data source |
| **Judges will notice** | Looks like a ChatGPT wrapper | Looks like a production financial system |

---

## Part 4: Security & Compliance Framework (30% of Score!)

> [!WARNING]
> This is where most teams will lose. They'll build cool features but ignore security. You must nail this to win.

### 4.1 Permission Tier Model

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERMISSION TIER SYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TIER 1 — AUTONOMOUS (No human approval needed)                │
│  ├── View financial analysis & reports                          │
│  ├── Run cash flow forecasts                                   │
│  ├── Search financing options                                   │
│  ├── View invoice status                                        │
│  ├── Get tax estimates                                          │
│  └── Answer financial Q&A                                       │
│                                                                 │
│  TIER 2 — SUPERVISED (Agent drafts, human confirms)            │
│  ├── Draft payment reminder messages                            │
│  ├── Generate formal financial reports                          │
│  ├── Pre-fill loan application forms                            │
│  └── Update business financial data                             │
│                                                                 │
│  TIER 3 — RESTRICTED (Agent cannot do, only advises)           │
│  ├── Submit loan applications                                   │
│  ├── Send communications to clients                             │
│  ├── Move money / make payments                                 │
│  ├── Modify tax filings                                         │
│  └── Share data with third parties                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Security Guardrails (Implement These)

| Guardrail | Implementation |
|-----------|---------------|
| **PII Masking** | Before any data reaches the LLM, mask sensitive fields: account numbers → `[ACCT-****1234]`, national IDs → `[ID-MASKED]` |
| **Prompt Injection Defense** | Input validation layer that rejects prompts containing "ignore previous", "system prompt", role-play attacks |
| **Hallucination Prevention** | ALL financial numbers come from deterministic tool calls, never from LLM generation. The LLM only narrates/explains the numbers |
| **Output Validation** | Post-generation filter checks: no unauthorized financial advice, no guarantees of loan approval, regulatory disclaimers attached |
| **Audit Trail** | Every interaction logged: `{timestamp, user_input, intent_classified, agent_routed, tools_called, tool_outputs, final_response}` |
| **Data Encryption** | All financial data encrypted at rest (AES-256) and in transit (TLS 1.3) |
| **Session Isolation** | Each SME business has an isolated data context — no cross-contamination |

### 4.3 Security Self-Assessment Report (Template)

This is a required submission item. Structure it as:

```markdown
# Security Self-Assessment Report — FinPilot

## 1. Data Classification
- HIGH: Financial data, revenue figures, bank details
- MEDIUM: Business profile, industry type, employee count  
- LOW: General financial education content, industry benchmarks

## 2. Permission Tiers
[Describe the 3-tier model above]

## 3. Known Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| LLM hallucinating financial figures | Medium | Critical | All math via deterministic tools |
| Prompt injection revealing system prompt | Low | Medium | Input sanitization + system prompt isolation |
| User entering real bank credentials | Medium | Critical | Explicit warning + input pattern detection |
| Cross-session data leakage | Low | Critical | Session isolation + data encryption |

## 4. Compliance Considerations
- Disclaimers on all financial advice ("This is informational, not financial advice")
- No guaranteed loan approval claims
- Data retention policy: session data deleted after 30 days
```

---

## Part 5: Innovation & Interaction Strategy (30% of Score)

### What Makes You Stand Out vs Other Teams

| Innovation Feature | Why It's Special | How to Implement |
|---|---|---|
| **🗣️ Voice-First Financial Input** | SME owners are busy — they talk, not type. Let them dictate "I spent 15,000 on supplies today" via voice | Use Gemini's audio input capability or Whisper API for speech-to-text → structured financial data extraction |
| **📊 Dynamic Visual Reports in Chat** | Don't just output text — generate actual charts (cash flow graph, P&L bar chart, health score radar) inline in the conversation | Use matplotlib/Plotly in the Python sandbox tool → return chart image in the response |
| **🔄 Proactive Agent Behavior** | Most chatbots are reactive (wait for user to ask). Yours should push alerts: "Your cash will run low in 12 days" | Implement a monitoring background loop that checks forecasts and triggers alerts |
| **🌏 Multi-Currency / Cross-Border** | Many SEA SMEs deal with suppliers in CNY, customers in THB/USD. Help them understand FX impact | Add currency conversion tool + FX risk analysis in the cash flow model |
| **📱 WeChat/LINE-Ready Architecture** | Show judges you designed for real SME channels, not just a web demo | Mention this in architecture docs — even if you only demo the web version |
| **🧮 "Explain Like I'm 5" Mode** | Financial literacy varies wildly among SME owners. Let them toggle between expert and simple explanations | System prompt parameter: `explanation_level: "simple" | "detailed" | "expert"` |
| **🔗 Alternative Credit Signal Generator** | Instead of just matching loans, help the business BUILD creditworthiness over time | Track digital payment consistency, revenue growth, on-time debt payments → generate an "alternative credit profile" document |

### Conversational UX Design (Make It Feel Premium)

```
┌──────────────────────────────────────────────────────────────┐
│  FinPilot — Your AI CFO                              🔒 ⚙️  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  🤖 Welcome back! Here's your daily financial briefing:      │
│                                                              │
│  💰 Current Cash Position: ฿42,500                           │
│  📈 Revenue this week: ฿21,200 (+5% vs last week)          │
│  ⚠️ 2 invoices overdue (฿37,000 total)                      │
│  📅 Next payment due: Rent ฿15,000 on Nov 1 (15 days)       │
│                                                              │
│  ───────────────────────────────────────────────────────     │
│                                                              │
│  Quick Actions:                                              │
│  [📊 Full Analysis] [💸 Check Loans] [📋 Invoice Status]    │
│  [🔮 What-If Scenario] [📑 Generate Report]                 │
│                                                              │
│  ───────────────────────────────────────────────────────     │
│                                                              │
│  👤 "What happens if I lose my biggest client?"              │
│                                                              │
│  🤖 Let me run that scenario for you...                      │
│                                                              │
│  [Running cash flow simulation...]                           │
│                                                              │
│  📉 If ABC Corp (฿25,000/month) stops paying:               │
│  • Your monthly net income drops from ฿7,500 to -฿17,500    │
│  • You'll burn through your ฿42,500 buffer in 2.4 months    │
│  • Your debt-to-income ratio jumps from 62% to 89%           │
│                                                              │
│  🛡️ Recommended Safety Plan:                                 │
│  1. Diversify: No single client should be >30% of revenue    │
│  2. Build 3-month emergency buffer (target: ฿75,000)         │
│  3. Consider a ฿100,000 credit line NOW while healthy        │
│     → [See matching loan options]                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Part 6: Tech Stack Recommendation

| Layer | Technology | Why |
|-------|-----------|-----|
| **LLM** | Gemini 2.0 Flash (via `google-genai` SDK) | Fast, cheap, excellent function calling, judges may appreciate Google/WeBank alignment |
| **Agent Framework** | Custom Python orchestrator (or LangGraph) | Full control over multi-agent routing, easier to audit |
| **Backend** | Python FastAPI | Async, fast, great for tool serving |
| **Frontend** | React + Tailwind (or plain HTML/CSS/JS) | Clean chat UI with chart rendering |
| **Database** | SQLite (demo) / PostgreSQL (production story) | Simple for hackathon, but document the production path |
| **Charts** | Plotly or Chart.js | Interactive financial visualizations in-chat |
| **PDF Generation** | WeasyPrint or ReportLab | For banker-ready financial reports |
| **Forecasting** | Prophet (Python) | Best balance of accuracy and simplicity for business time-series |
| **Security** | Custom guardrail middleware | Input/output filters, PII masking, audit logging |

---

## Part 7: Exactly How to Map Features → Scoring

### Task Completion (40%) — "Does it work?"

| Requirement | Your Feature | Evidence |
|-------------|-------------|---------|
| Financing-option matching | Pillar 2: 30+ product database, multi-criteria matching, gap analysis | Live demo: user describes business → ranked loan recommendations |
| Cash-flow management with alerts | Pillar 1: Prophet forecasting, Monte Carlo scenarios, proactive alerts | Live demo: show the alert system catching a cash crisis before it happens |
| Business financial analysis | Pillar 3: Auto P&L, health score, industry benchmarking | Live demo: conversational data input → full financial report |

### Security & Compliance (30%) — "Is it safe?"

| Requirement | Your Feature | Evidence |
|-------------|-------------|---------|
| Permission tiers | 3-tier model (Autonomous/Supervised/Restricted) | Document in Security Report + demo showing HITL gate |
| Known-risk list | Security Self-Assessment Report with risk matrix | Submitted document |
| Data protection | PII masking, encryption, session isolation | Show in technical documentation + code |
| Audit trail | Full interaction logging | Show log output in demo |

### Innovation & Interaction (30%) — "Is it impressive?"

| Requirement | Your Feature | Evidence |
|-------------|-------------|---------|
| Novel approach | Multi-agent architecture, NOT a chatbot wrapper | Architecture diagram in tech docs |
| UX quality | Daily briefing, quick actions, visual charts in-chat | Demo the "wow factor" UI |
| Real-world applicability | Designed for real SEA SME pain points, multi-currency, voice input | Presentation story |
| Proactive intelligence | Agent pushes alerts, doesn't wait to be asked | Demo the alert system |

---

## Part 8: Demo Scenarios (Script These In Advance)

### Demo Scenario 1: "The Street Food Vendor" (2 min)
1. New user onboarding — agent asks about the business conversationally
2. User provides income/expense data in plain language
3. Agent generates P&L + Health Score
4. Agent alerts: "Cash crisis in 18 days"
5. Agent recommends action: "Collect overdue invoice from ABC Corp"

### Demo Scenario 2: "The Growing Business" (1.5 min)
1. Owner asks: "I want to expand and need a loan"
2. Agent builds business profile through conversation
3. Agent returns ranked financing options with match scores
4. Agent shows: "Before applying, pay down ฿15,000 of existing debt to improve your approval odds by 23%"

### Demo Scenario 3: "The What-If Planner" (1.5 min)
1. Owner asks: "What if I hire 2 more staff and open a second location?"
2. Agent runs scenario simulation
3. Shows side-by-side comparison: current vs. projected
4. Recommends: "Your current cash flow can't support this. You'd need ฿200,000 in funding. Here are your best options → [matched loans]"

---

## Part 9: What NOT to Do (Common Mistakes That Lose)

| ❌ Mistake | ✅ Instead |
|-----------|-----------|
| Build a ChatGPT wrapper that "explains finance" | Build an agent that **does finance** — calculates, forecasts, matches, alerts |
| Let the LLM generate financial numbers | All numbers from deterministic Python tools |
| Ignore the Security & Compliance 30% | Dedicate real engineering effort to guardrails, tiers, audit logs |
| Build features nobody asked for | Every feature maps to the contest rubric |
| Demo with "Lorem ipsum" fake data | Pre-populate with realistic SME scenarios |
| Use generic colors and basic UI | Make the UI feel like a premium fintech product |
| Present without rehearsing | Script your 3 demo scenarios and practice transitions |
| Skip the Security Self-Assessment Report | It's a required submission item — missing it = auto-disqualification risk |

---

## Part 10: Competitive Edge Summary

> **Your agent wins because it is:**
>
> 1. **An agent, not a chatbot** — it takes actions via tools, not just answers questions
> 2. **Deterministically accurate** — financial math is never hallucinated
> 3. **Proactive** — it pushes alerts and insights, doesn't wait to be asked
> 4. **Security-first** — 3-tier permissions, PII masking, full audit trail (30% of score!)
> 5. **Grounded in real SME pain** — designed for actual business owners, not finance professionals
> 6. **WeBank-aligned** — your Financing Matcher includes Weiyedai, showing you understand the host's products
> 7. **Visually impressive** — charts, dashboards, health scores in-chat (not just text)
> 8. **Architecturally sound** — multi-agent system that mirrors production financial platforms
