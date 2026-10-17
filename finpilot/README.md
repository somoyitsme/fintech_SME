# FinPilot (智舵) — Autonomous AI SME Finance Copilot

> **2026 Shenzhen International FinTech Competition (FinTechathon) — International Track**  
> **Topic E: SME Finance Copilot (AI Track)**  
> **Host:** Tsinghua University PBC School of Finance & WeBank (微众银行)

---

## 🌟 Executive Summary

FinPilot is a dual-offering financial intelligence copilot built specifically for small-and-medium enterprises (SMEs) and digital micro-merchants:

1. **FinPilot Embeddable SDK (`loader.js`)**: A 1-line JavaScript drop-in script allowing **any existing third-party SME management software, ERP, or billing portal** to instantly embed our multi-agent AI copilot with DOM/CSS isolation.
2. **FinPilot Management Platform**: A full-stack reference SME financial cockpit (Invoices, Receivables Aging, Expenses, P&L, 60-Day Cash Flow Forecasting, and WeBank Credit Matching) with the multi-agent copilot natively integrated.

---

## 🏆 Key Features Grounded in Contest Criteria

### 1. 📊 Predictive Cash Flow Engine & Day 45 Liquidity Alert (Task Completion: 40%)
- Reconciles historical bank ledger ending balance, recurring burn rate, and expected receivables.
- Employs **Prophet-inspired statistical time-series forecasting** with 95% confidence interval bands.
- Automatically flags upcoming cash breaches (e.g. Day 45 liquidity dip caused by quarterly CIT prepayment + payroll cycles).

### 2. 📑 Autonomous AR Recovery & Payment Reminder Agent
- Monitors receivables aging and computes real Days Sales Outstanding (DSO).
- Generates professional collection reminder drafts tailored by tone (*Polite*, *Professional*, *Firm*).
- One-click PDF invoice generation via ReportLab.

### 3. 💼 WeBank Weiyedai (微业贷) & Credit Matching Engine
- Tailored for Shenzhen & Greater Bay Area SMEs.
- Features **WeBank Weiyedai (微业贷)** as the premier 100% digital unsecured revolving line (up to ¥3M, 3.6%–10.8% APR, <5 min approval, zero physical collateral).
- Digital Invoice Factoring and Shenzhen High-Tech Innovation R&D subsidy loans.
- Automatic Pre-Qualification Assessment (92% likelihood based on verified tax filings).

### 4. 🛡️ 8-Layer Enterprise Security Pipeline (Security & Compliance: 30%)
- **Deterministic Tool Execution**: LLMs **never calculate financial sums**; all numbers are calculated by sandboxed Python tools with formula validation.
- **Prompt Injection Defense**: Multi-pattern adversarial filter blocks jailbreaks, system prompt overrides, and unauthorized commands.
- **PII Masking**: Automatically redacts telephone numbers, bank card numbers, and credentials before LLM ingestion.
- **3-Tier Permission Hierarchy**:
  - *Tier 1 (Autonomous)*: Read-only queries, forecasts, health score checks.
  - *Tier 2 (Supervised)*: Draft invoices, create expenses, draft reminder emails (staged for human confirmation).
  - *Tier 3 (Restricted)*: Fund movement, wire transfers, database modification (strictly refused by design).
- **Immutable Audit Logging**: Every query, tool execution, and state change is cryptographically tracked in `audit_logs`.

### 5. 🔌 1-Line Embeddable SDK (Innovation & Interaction: 30%)
- Add to any website with:
  ```html
  <script src="http://localhost:8005/sdk/loader.js" data-api-key="fp_live_testdemo123456789abcdef"></script>
  ```
- Renders an isolated iframe widget that communicates via `postMessage` and authenticated REST APIs (`X-API-Key`).

---

## 🚀 Quickstart Guide (Run in 2 Minutes)

### Prerequisites
- Python 3.11+ (or uv)
- Node.js 18+ & npm
- Docker (optional)

### 1. Clone & Setup Backend
```bash
cd backend
# Using uv (recommended)
uv venv --python python3.12 .venv
source .venv/bin/activate
uv pip install -e .

# Or using standard pip
pip install -e .

# Run all 21 automated tests
pytest tests/ -v

# Start backend server (pre-seeded with Shenzhen Nebula Tech Co., Ltd. demo data)
uvicorn app.main:app --port 8000 --reload
```

### 2. Setup Frontend
```bash
cd ../frontend
npm install
npm run build   # Produces production bundle
npm run dev     # Starts local development Vite server on http://localhost:5173
```

### 3. View Full-Stack App
Open **http://localhost:8000** in your browser.  
FastAPI automatically serves the React application at the root, along with Swagger API documentation at `/docs`!

### 4. Test 3rd-Party ERP Integration
Open **http://localhost:8000/sdk/demo-host.html** in your browser to experience how an external ERP system embeds the FinPilot Copilot.

---

## 🧪 Automated Test Suite (100% Pass)
```
tests/test_agent_tools.py ......                                         [ 28%]
tests/test_auth.py ....                                                  [ 47%]
tests/test_guardrails.py ....                                            [ 66%]
tests/test_invoices.py ...                                               [ 80%]
tests/test_scenarios.py ....                                             [100%]
======================== 21 passed in 2.20s ========================
```

---

## 📁 Repository Structure
```
finpilot/
├── backend/
│   ├── app/
│   │   ├── agent/               # Multi-Agent Engine (Orchestrator, 20 tools, guardrails)
│   │   ├── api/                 # 11 REST API modules (Auth, Invoices, Cashflow, Widget...)
│   │   ├── core/                # JWT, security & hashing utilities
│   │   ├── data/                # WeBank products, benchmarks & tax rules
│   │   ├── db/                  # 12 SQLAlchemy models & database seeder
│   │   └── services/            # Forecasting, Health Score, PDF generator, email service
│   ├── tests/                   # 21 unit & scenario tests (Pytest)
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/                    # React 18 + TypeScript + Tailwind CSS + Recharts
│   ├── src/
│   │   ├── components/          # Sidebar, Navbar, CopilotChat drawer
│   │   └── pages/               # Dashboard, Cashflow, Invoices, Expenses, Financing, Tax
├── sdk/
│   ├── loader.js                # Embed script (<2KB)
│   ├── widget.html              # Standalone iframe chat UI
│   └── demo-host.html           # 3rd-party ERP integration demo
├── docs/                        # Complete competition submission deliverables
├── docker-compose.yml
└── README.md
```

---

## 👥 Authors & Team
- **Team:** FinPilot AI Engineering Team
- **Competition:** 2026 Shenzhen International FinTech Competition (FinTechathon)
