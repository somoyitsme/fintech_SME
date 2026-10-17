# FinPilot: Technical Architecture & System Design Documentation

**Contest Track:** Topic E: SME Finance Copilot (Artificial Intelligence Track)  
**2026 Shenzhen International FinTech Competition (FinTechathon)**  
**Target Platform:** Shenzhen Nebula Tech Co., Ltd. (Reference Implementation) + Universal Embeddable SDK

---

## 1. System Architecture Overview

FinPilot implements a decoupled **Three-Tier Architecture**:
1. **Multi-Agent Intelligence Tier**: Autonomous intent classification, 5 specialized domain agents, 20 deterministic financial tools, and an 8-layer guardrail verification pipeline.
2. **REST API & Ledger Service Tier**: Built with FastAPI, SQLAlchemy 2.0, ReportLab, and time-series forecasting engines. Reconciles multi-tenant company ledgers, invoices, receivables aging, and expenses.
3. **Presentation & SDK Tier**: A full-featured React 18/TypeScript management dashboard alongside an embeddable JavaScript SDK (`loader.js`) that injects an isolated iframe onto third-party SME platforms.

```
+-----------------------------------------------------------------------------------------+
|                                     CLIENT PLATFORMS                                    |
|   +------------------------------------+    +---------------------------------------+   |
|   |  FinPilot Native Management Web    |    |  3rd-Party SME Platform (ERP / CRM)   |   |
|   |  (React 18 + Tailwind + Recharts)  |    |  <script src="sdk/loader.js" ...>     |   |
|   +-----------------+------------------+    +-------------------+-------------------+   |
+---------------------|-------------------------------------------|-----------------------+
                      | Bearer JWT                                | X-API-Key / postMessage
                      v                                           v
+-----------------------------------------------------------------------------------------+
|                                 FASTAPI API GATEWAY                                     |
|  - Auth & Tenant Context Dependency        - Multi-tenant Isolation Check               |
|  - Invoices / AR Aging / PDF Generator     - Cash Flow Metrics & Prophet Forecasting    |
|  - Financing Matcher (WeBank Weiyedai)     - China SME Tax Optimization & Benchmarks    |
+---------------------------------------------+-------------------------------------------+
                                              |
                                              v
+-----------------------------------------------------------------------------------------+
|                               MULTI-AGENT COPILOT ENGINE                                |
|                                                                                         |
|   +---------------------------------------------------------------------------------+   |
|   | 8-Layer Guardrail Pipeline: PII Masking | Injection Filter | Permission Tiers   |   |
|   +----------------------------------------+----------------------------------------+   |
|                                            |                                            |
|                                            v                                            |
|                        +---------------------------------------+                        |
|                        |       Intent Router / Classifier      |                        |
|                        +-------------------+-------------------+                        |
|                                            |                                            |
|          +-----------------+---------------+----------------+----------------+          |
|          v                 v               v                v                v          |
|    +-----------+     +-----------+   +-----------+    +-----------+    +-----------+    |
|    | Cash Flow |     | Financing |   | Financial |    | Invoicing |    | Tax &     |    |
|    | Special.  |     | & WeBank  |   | Analyst   |    | & AR Aged |    | Complian. |    |
|    +-----+-----+     +-----+-----+   +-----+-----+    +-----+-----+    +-----+-----+    |
|          |                 |               |                |                |          |
|          +-----------------+---------------+----------------+----------------+          |
|                                            |                                            |
|                                            v                                            |
|                      +------------------------------------------+                       |
|                      |   20 Sandboxed Deterministic Math Tools  |                       |
|                      +---------------------+--------------------+                       |
|                                            |                                            |
+--------------------------------------------|--------------------------------------------+
                                             v
+-----------------------------------------------------------------------------------------+
|                            PERSISTENCE & AUDIT LEDGER                                   |
|  - PostgreSQL 16 / SQLite (12 Tables with UUID Primary Keys & Row-Level Foreign Keys)   |
|  - Cryptographic Audit Log Tracking (Every Tool Execution & Chat Inquiry)              |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Multi-Agent Engine & Specialist Responsibilities

Rather than relying on a monolithic prompt that is prone to hallucination, FinPilot partitions financial tasks across specialized sub-agents:

| Specialist Agent | Core Responsibility | Primary Deterministic Tools |
| :--- | :--- | :--- |
| **Cash Flow Specialist** | Daily liquidity tracking, runway calculation, 60-day forecasting | `get_cash_flow_metrics`, `forecast_cash_flow` |
| **Financing & WeBank Specialist** | Matches non-dilutive working capital products, computes WeBank Weiyedai pre-approval score | `match_financing_options`, `check_financing_prequalification` |
| **Financial Analyst** | Computes gross/net margins, DSO, and compares against Greater Bay Area industry benchmarks | `get_financial_health_score`, `compare_industry_benchmarks`, `get_pnl_summary` |
| **Invoicing & AR Specialist** | Monitors overdue invoices, flags credit risks, drafts customized collection emails | `get_overdue_invoices`, `get_open_invoices`, `draft_payment_reminder` |
| **Tax & Compliance Specialist** | Tracks preferential 5% SME CIT rate, input/output VAT balance, and deductible expenses | `get_tax_rules`, `calculate_estimated_tax` |

### Deterministic Calculation Guarantee
Financial figures (such as cash runway months, overdue balances, and loan interest ranges) are **strictly calculated in sandboxed Python functions**. The language model is used exclusively for natural-language synthesis, tone modulation, and context explanation.

---

## 3. Database Schema (12 Relational Entities)

1. `tenants`: Company master record (name, tax ID, industry, currency, risk score).
2. `users`: Multi-tenant user credentials (bcrypt hash, role: admin, accountant, viewer).
3. `api_keys`: SHA-256 hashed API keys for external platform widget authorization.
4. `clients`: B2B customers, credit limits, and payment terms (e.g. Net-30, Net-45).
5. `invoices`: Commercial invoices with issue dates, due dates, tax rates, and statuses.
6. `invoice_items`: Granular billable items with unit prices and tax rates.
7. `expenses`: Operational expenditures tagged with tax-deductible flags.
8. `income`: Reconciled income entries matched against settled invoices.
9. `cash_flow_snapshots`: Daily historical and projected balances with confidence intervals.
10. `agent_conversations`: Multi-turn chat sessions tied to tenant contexts.
11. `agent_messages`: Chat logs containing executed tool records, citations, and guardrail flags.
12. `audit_logs`: Immutable security records tracking every user and agent action.

---

## 4. Embeddable Widget SDK Architecture

The FinPilot widget (`loader.js`) solves the universal integration problem:
- **Footprint**: Less than 2KB in size.
- **Isolation**: Injects an `<iframe>` hosting `widget.html`, preventing CSS contamination and cross-origin DOM access.
- **Bi-directional Bridge**: Communicates with the host page via `window.postMessage` for resizing, opening, and closing events.
- **Authentication**: Uses `X-API-Key` headers scoped strictly to the host tenant.
