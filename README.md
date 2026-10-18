# FinPilot — Autonomous AI Financial Copilot & SME ERP Platform

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Claude%20Opus%20%2F%20Sonnet-8e24aa.svg)](https://anthropic.com)
[![Security](https://img.shields.io/badge/Security-Multi--Tenant%20Isolated-10b981.svg)]()
[![Contest](https://img.shields.io/badge/FinTechathon%202026-Topic%20E%20(AI%20Track)-gold.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **2026 Shenzhen International FinTech Competition (FinTechathon) · Topic E: SME Finance Copilot (AI Track)**  
> **Hosted by:** Tsinghua University PBC School of Finance & WeBank (微众银行)

FinPilot is a dual-offering financial intelligence and management suite built for small and medium enterprises (SMEs), retailers, hardware wholesalers, and commercial distributors:

1. **[FinPilot Agent (`finpilot-agent`)](finpilot-agent/README.md)**: An autonomous AI Financial Copilot microservice (Port `8100`) that connects directly to real SME databases, reflects schemas dynamically with **zero hardcoded assumptions**, computes **deterministic SQL metrics (zero hallucination)**, and embeds into any website via a 1-line auto-theming JavaScript SDK.
2. **[FinPilot SME ERP (`finpilot`)](finpilot/frontend/README.md)**: A production-ready reference SME management cockpit (Port `5173` & `8090`) for **Dhaka Silicon & Hardware Ltd.** featuring Point-of-Sale (POS), inventory transfers, invoice aging, expense tracking, and native AI Copilot integration.

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT LAYER                                          │
│                                                                                         │
│     [ SME ERP Management Cockpit ]                 [ External 3rd-Party SME Site ]      │
│      (http://localhost:5173)                             (Any CRM / Billing Portal)     │
└───────────────────────────┬──────────────────────────────────────────┬──────────────────┘
                            │                                          │
                            │                                          │ <script src="http://localhost:8100/sdk/loader.js" ...>
                            ▼                                          ▼
┌──────────────────────────────────────────────┐  ┌───────────────────────────────────────┐
│           SME ERP BACKEND (Port 8090)        │  │     FINPILOT AI AGENT (Port 8100)     │
│                                              │  │                                       │
│  • FastAPI REST APIs                         │  │  • 1-Line Drop-in Chameleon SDK       │
│  • Invoicing & PDF Generation                │  │  • Real-Time Thinking & Status Stream │
│  • POS Sales & Live Inventory Decrementing   │  │  • 6 Deterministic Financial Tools    │
│  • Contacts, Suppliers & Ledger Accounting   │  │  • Claude 3.5 Sonnet / Opus 4.8 LLM   │
└──────────────────────┬───────────────────────┘  └───────────────────┬───────────────────┘
                       │                                              │
                       │ Parameterized Read/Write                     │ Parameterized Read-Only SQL
                       ▼                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                LIVE BUSINESS DATABASE                                   │
│                   (SQLite / PostgreSQL / MySQL - Real Business Ledger)                  │
│                                                                                         │
│   Tables: cash_flow_snapshots, invoices, expenses, clients, income, invoice_items...    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 The 6 Core Problem-Solving Pillars

| Pillar | Real SME Crisis Solved | Autonomous Agent Action |
| :--- | :--- | :--- |
| **1. Cash Flow & Runway** | 82% of SMEs fail from unexpected liquidity crunches | Projects 30/60/90-day cash flow, monthly burn rate, and exact runway months from real bank balance and expenses. |
| **2. Financing & Credit Readiness** | $5.2T SME credit gap; painful collateral barriers | Evaluates turnover and verified sales to calculate WeBank Weiyedai (微业贷) pre-qualification score and loan capacity. |
| **3. Financial Health & P&L** | Business owners cannot decipher raw balance sheets | Calculates real-time revenue, COGS, gross/net profit margins, and DuPont financial ratios. |
| **4. AR Aging & Invoicing** | 60–90 day payment delays lock up working capital | Classifies overdue receivables into `0-30`, `31-60`, `61-90`, and `90+` days and targets high-risk clients. |
| **5. Tax Estimation & Calendar** | Late tax filing penalties and missed preferential rates | Computes estimated Corporate Income Tax (preferential 5% rate vs standard) and reconciles input/output VAT. |
| **6. Expense Optimization** | Subscription creep and unmonitored vendor inflation | Analyzes cost breakdowns by category and supplier to flag anomalous burn rate spikes. |

---

## 🔒 Enterprise Security & Multi-Tenancy

- **Deterministic Arithmetic Guarantee**: The LLM **NEVER computes mathematical operations**. All balances, totals, and ratios are calculated via parameterized SQL aggregations (`SUM`, `COUNT`, `AVG`).
- **Strict Multi-Tenant Row-Level Security**: Every SQL query strictly binds the tenant identifier (`WHERE tenant_id = :tenant_id`). Cross-tenant data leakage is structurally impossible.
- **Strictly Read-Only Database Role**: Write operations (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `GRANT`) are blocked by multi-layer regex security gates and database role privileges.
- **Prompt Injection Defense**: All user inputs are encapsulated within isolated `<user_query>` data tags, preventing system prompt overrides.

---

## 🚀 Quickstart Guide (Run Everything Locally)

### 1. Start the FinPilot AI Agent (Port 8100)
```bash
cd finpilot-agent
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8100
```
- Health Check: `http://localhost:8100/health` (Status: `healthy`, 7 tables reflected)
- Interactive API Docs: `http://localhost:8100/docs`

### 2. Start the SME ERP Backend (Port 8090)
```bash
cd finpilot/backend
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8090
```
- Backend Health Check: `http://localhost:8090/health`
- Backend API Docs: `http://localhost:8090/docs`

### 3. Start the SME ERP Frontend (Port 5173)
```bash
cd finpilot/frontend
npm run dev
```
- Open in Browser: `http://localhost:5173`
- The FinPilot AI Copilot widget will float automatically in the bottom-right corner.

---

## 🔌 Integrating the Copilot into ANY Third-Party SME Site

Add this single script tag right before `</body>`:

```html
<script 
  src="http://localhost:8100/sdk/loader.js" 
  data-api-key="fp_live_f407b24b5fcf1fc17c717429793a9ca4"
  data-tenant-id="28434594-e04c-4aae-aa17-d4612114e348"
  data-theme="auto"
  data-position="bottom-right">
</script>
```

### Chameleon Theme Auto-Adaptation:
The embedded widget automatically:
- Detects the host website's background color and switches between sleek Dark/Light modes.
- Inherits the primary brand accent color from the host page's buttons and CSS variables.
- Matches typography (`Inter`, `system-ui`) and border radii dynamically.

---

## 📂 Project Directory Structure

```
├── README.md                      # System Master Documentation
├── finpilot/                      # SME Management & ERP System
│   ├── backend/                   # FastAPI Backend (Port 8090)
│   │   ├── app/                   # Invoices, Expenses, Cash Flow, POS
│   │   └── finpilot.db            # Live SQLite SME Database
│   └── frontend/                  # React 18 + Vite + Tailwind ERP (Port 5173)
│       ├── src/pages/             # Sell (POS), Invoices, Products, Contacts...
│       └── index.html             # Embedded Copilot Loader
└── finpilot-agent/                # Standalone AI Copilot Microservice (Port 8100)
    ├── app/
    │   ├── agent/                 # Orchestrator, Live LLM Client, 6 Tools
    │   └── core/                  # Schema Reflection Engine & Security
    ├── sdk/                       # loader.js, widget.html, widget.js
    └── config.py                  # Dynamic Environment Settings
```

---

## 📄 License
This project is licensed under the MIT License.
