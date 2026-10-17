# FinPilot — Autonomous AI Financial Copilot & SME ERP Platform

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev)
[![Gemini AI](https://img.shields.io/badge/AI%20Engine-Google%20Gemini-8e24aa.svg)](https://ai.google.dev)
[![Currency](https://img.shields.io/badge/Currency-BDT%20(%E0%A7%B3)-orange.svg)]()
[![Security](https://img.shields.io/badge/Security-3--Tier%20Guardrails-10b981.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

FinPilot is an enterprise-grade financial management platform tailored for Bangladeshi SMEs, retail merchants, wholesalers, and commercial distributors. The project is built on an architectural separation between an **Autonomous AI Financial Copilot Microservice** and an **SME Management & POS ERP System**.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CLIENT ACCESS LAYER                                    │
│                                                                                        │
│   [ Customer Copilot Portal ]        [ Platform Admin Console ]    [ SME Salesman POS] │
│      (http://localhost:8100)          (http://localhost:8100/admin)   (localhost:5173) │
└───────────────────────────┬───────────────────────────────┬────────────────────────────┘
                            │                               │
                            │ 1-Line Embed SDK or REST API  │ Internal ERP REST
                            ▼                               ▼
┌──────────────────────────────────────────────┐ ┌───────────────────────────────────────┐
│     STANDALONE AI AGENT PLATFORM (Port 8100) │ │        SME BACKEND ERP (Port 8090)    │
│                                              │ │                                       │
│  ├── Multi-Tenant Security & Isolation       │ │  ├── Role-Based Access Control (RBAC) │
│  │   (Cryptographic API keys, zero leak)     │ │  │   (Owner/Admin vs. Salesman)       │
│  ├── Admin Security Gate (Passphrase Auth)   │ │  ├── Dynamic POS & Inventory Engine   │
│  ├── 3-Tier Execution Guardrails:            │ │  │   (Real-time stock, custom disc)   │
│  │   • Tier 1: Autonomous Read & Analysis    │ │  ├── Courier Integration Hub          │
│  │   • Tier 2: Supervised Draft (HITL)       │ │  │   (Pathao, Steadfast COD API)      │
│  │   • Tier 3: Restricted Zero Fund Movement │ │  ├── Customer CRM & Phone Lookup      │
│  ├── Hybrid Reasoning Core:                  │ │  └── Accounting & Invoicing Ledgers   │
│  │   • Deterministic Python Tool Execution   │ └───────────────────────────────────────┘
│  │   • Google Gemini LLM Synthesis Engine    │
│  └── 5 Core Financial Capabilities:          │
│      1. Cash Flow & Runway Forecasting       │
│      2. SME Loan & Credit Matching           │
│      3. Financial Health & P&L Benchmarks    │
│      4. Receivables & Overdue Recovery       │
│      5. Bangladesh NBR Tax & VAT Calendar    │
└──────────────────────────────────────────────┘
```

---

## 🌟 Key Modules & Features

### 1. Autonomous AI Financial Copilot (`finpilot-agent`, Port 8100)
- **Natural AI Advisory**: Powered by Google Gemini (`gemini-flash-latest`, with fallback to `gemini-3.5-flash` and `gemini-3.8-flash`), acting as an executive fractional CFO for Bangladeshi businesses.
- **Zero Arithmetic Hallucination**: The LLM does not perform speculative mental arithmetic; all metrics, cash balances, tax estimates, and debt service ratios are computed by verified deterministic Python algorithms first and injected as verified tool context.
- **Rolling 90-Day Cash Flow Projections**: Evaluates daily cash inflows, recurring lease and payroll obligations, weekend velocity spikes (+38%), and Monte Carlo uncertainty corridors to identify buffer breach days (e.g. Day 38 floor risk).
- **Scenario Sandbox ("What-If" Analysis)**: Instant delta calculation for staffing changes, inventory purchase batches, and overdue collection acceleration without touching the live ledger.
- **Bangladesh Financing Matcher**: Multi-criteria matching engine against 30+ verified Bangladeshi loans and credit lines (BRAC Bank Uddokta, City Bank Shommilito, IDLC Factoring, Bangladesh Bank ICT Refinance Scheme, WeBank Weiyedai, bKash Merchant Credit).
- **Accounts Receivable Intelligence**: Delinquency categorization (0–30, 31–60, 60+ days) and automated tone-adjusted payment notice drafting (Polite, Firm, Formal Legal).
- **NBR Tax & VAT Calendar**: Automated Mushak 9.1 VAT estimation (due before the 15th of each month), quarterly Advance Income Tax (AIT), and deductible expense audits.

### 2. Dedicated Web Interfaces (Port 8100)
- **Customer Copilot Portal (`/` & `/customer`)**:
  - Minimalist, calm dark slate user experience.
  - No contest buzzwords or confusing labels.
  - Strict tenant isolation: Customers only see their own business workspace (`Dhaka Silicon & Hardware Ltd.`).
  - Interactive Copilot chat with rapid prompt suggestions and deep-dive analytics tabs.
- **Admin & Observability Console (`/admin`)**:
  - Protected behind an **Admin Security Gate** requiring the Master Passphrase.
  - Unauthenticated access is completely blocked.
  - Masked API keys (`fpk_live_ab...`) for tenant credential safety.
  - Real-time audit telemetry log and 3-Tier security policy inspection.

### 3. SME Management & POS ERP (`finpilot`, Port 5173 / 8090)
- **Role-Based Access Control (RBAC)**: Distinct permissions for Business Owner/Admin vs. Salesman.
- **Salesman POS & Catalog**:
  - Live stock tracking: Stock updates automatically upon sale.
  - Flexible checkout: Salesmen can adjust transaction amounts, unit prices, and offer custom discounts.
  - Customer lookup by phone number/ID to link existing members or automatically register new walk-in clients.
  - Courier Delivery Dispatch: One-click courier order creation for **Pathao** and **Steadfast** (Cash-on-Delivery) for online orders.

---

## 🔒 Security Architecture & Guardrails

| Permission Tier | Authority | Permitted Operations | Guardrail Policy |
| :--- | :--- | :--- | :--- |
| **Tier 1: Autonomous** | Read-Only Analysis | Forecast cash flow, compute health scores, calculate NBR taxes | Deterministic code execution; read-only database queries. |
| **Tier 2: Supervised** | Drafts & Notices | Draft payment collection notices, prepare bank loan pre-qualification packs | Human-in-the-Loop (HITL) review required before sending. |
| **Tier 3: Restricted** | Fund Movement | Wire transfers, bank withdrawals, loan disbursement | **Hard Blocked**: The agent has zero fund movement capability. |

- **Strict Tenant Privacy**: API keys (`fpk_live_...`) are cryptographically hashed using SHA-256 in the database. Tenants cannot view or access data belonging to any other business.
- **Secret Protection**: `.env` files containing live API keys and SQLite database files are excluded via `.gitignore` to guarantee zero credential leakage.

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- Git

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/somoyitsme/fintech_SME.git
cd fintech_SME
```

---

### Step 2: Configure Environment Variables

Create `.env` inside `finpilot-agent/`:
```bash
cp finpilot-agent/.env.example finpilot-agent/.env
```
Edit `finpilot-agent/.env` and add your Google Gemini API key:
```ini
APP_NAME="FinPilot Agent Service"
APP_ENV="development"
PORT=8100
HOST="0.0.0.0"
DEBUG=True
SECRET_KEY="your-secret-key-change-in-production"
ADMIN_PASSWORD="admin@finpilot2026"
DATABASE_URL="sqlite:///./agent.db"

# Google Gemini API Key
GEMINI_API_KEY="your-gemini-api-key-here"
GEMINI_MODEL="gemini-flash-latest"

DEFAULT_RATE_LIMIT_PER_MINUTE=120
CORS_ORIGINS=["*"]
```

---

### Step 3: Launch FinPilot AI Agent Service (Port 8100)

```bash
cd finpilot-agent
python3 -m venv .venv
source .venv/bin/activate
pip install -r <(python3 -c "import tomli; f=open('pyproject.toml','rb'); print('\n'.join(tomli.load(f)['project']['dependencies']))" 2>/dev/null || echo "fastapi uvicorn sqlalchemy pydantic pydantic-settings google-genai httpx")

# Run the agent server
uvicorn agent_core.main:app --host 0.0.0.0 --port 8100 --reload
```
Access the agent interfaces:
- **Customer Copilot Portal**: [http://localhost:8100/](http://localhost:8100/)
- **Admin Security Console**: [http://localhost:8100/admin](http://localhost:8100/admin) *(Passphrase: `admin@finpilot2026`)*
- **Interactive Swagger Docs**: [http://localhost:8100/docs](http://localhost:8100/docs)

---

### Step 4: Launch SME ERP Platform (Port 8090 & Port 5173)

**Terminal 1 — Backend (Port 8090):**
```bash
cd finpilot/backend
python3 -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn sqlalchemy pydantic pytest reportlab
uvicorn app.main:app --host 0.0.0.0 --port 8090 --reload
```

**Terminal 2 — Frontend (Port 5173):**
```bash
cd finpilot/frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 🔑 Demo Credentials

### Standalone Agent Platform (Port 8100)
| Portal | Access URL | Credentials | Role |
| :--- | :--- | :--- | :--- |
| **Customer Copilot** | `http://localhost:8100/` | Active Workspace Key: `fpk_live_dhaka_silicon` | Business Owner (Dhaka Silicon & Hardware Ltd.) |
| **Admin Console** | `http://localhost:8100/admin` | Master Passphrase: `admin@finpilot2026` | Platform Super Administrator |

### SME Management ERP (Port 5173)
| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Managing Director (Admin)** | `admin@dhakasilicon.com` | `Admin123!` | Full financial visibility, settings, staff management |
| **Salesman Lead** | `salesman@dhakasilicon.com` | `Sales123!` | POS checkout, inventory addition, courier dispatch |

---

## 🧪 Testing & Verification

Run the automated backend test suites:
```bash
# Agent test suite
cd finpilot-agent
pytest tests/ -v

# SME ERP test suite
cd ../finpilot/backend
pytest tests/ -v
```

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
