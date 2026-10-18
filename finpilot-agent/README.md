# 🧠 FinPilot Agent — Universal Autonomous AI Financial Copilot

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)](https://fastapi.tiangolo.com)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-red.svg)](https://www.sqlalchemy.org)
[![Claude AI](https://img.shields.io/badge/LLM-Claude%20Opus%20%2F%20Sonnet-8e24aa.svg)](https://anthropic.com)
[![Contest Track](https://img.shields.io/badge/FinTechathon%202026-Topic%20E%20(AI%20Track)-gold.svg)]()
[![Security](https://img.shields.io/badge/Multi--Tenant-Zero%20Data%20Leak-10b981.svg)]()

> **2026 Shenzhen International FinTech Competition (FinTechathon) · Topic E: SME Finance Copilot (AI Track)**  
> **Hosted by:** Tsinghua University PBC School of Finance & WeBank (微众银行)

FinPilot Agent is an enterprise-grade, standalone **Autonomous AI Financial Copilot** engineered for small-and-medium enterprises (SMEs). It connects directly to live business databases, reflects table schemas automatically with **zero hardcoded assumptions**, executes **deterministic SQL calculations (zero hallucinations)**, and embeds into any third-party SME website with an auto-styling, 1-line JavaScript SDK.

---

## 📑 Table of Contents
1. [System Architecture](#-system-architecture)
2. [The 6 Real-World SME Problem-Solving Pillars](#-the-6-real-world-sme-problem-solving-pillars)
3. [Zero-Mock Real Database Engine](#-zero-mock-real-database-engine)
4. [Enterprise Security & Multi-Tenant Isolation](#-enterprise-security--multi-tenant-isolation)
5. [Universal 1-Line Embeddable SDK](#-universal-1-line-embeddable-sdk)
6. [Integration Methods](#-integration-methods)
7. [Quickstart & Configuration](#-quickstart--configuration)
8. [API Reference & Streaming](#-api-reference--streaming)
9. [Production Deployment Guide](#-production-deployment-guide)
10. [Troubleshooting & FAQ](#-troubleshooting--faq)

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Any SME Web Platform                          │
│     (React, Vue, Django, Laravel, WordPress, or Plain HTML/PHP)        │
│                                                                        │
│   <script src="http://localhost:8100/sdk/loader.js" ...></script>      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ window.postMessage & SSE
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   FinPilot Agent Microservice (Port 8100)              │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐  │
│  │ Security & Guardrails │  │ LLM Client (Anthropic / Mirai Proxy)  │  │
│  │ • API Key Validation  │  │ • Claude 3.5 Sonnet / Opus 4.8        │  │
│  │ • Table Allowlisting  │  │ • Tool Calling Engine                 │  │
│  │ • Injection Blocker   │  │ • SSE Status & Token Streaming        │  │
│  └───────────┬───────────┘  └───────────────────▲───────────────────┘  │
│              │                                  │                       │
│              ▼                                  │ Context & Aggregates  │
│  ┌──────────────────────────────────────────────┴───────────────────┐  │
│  │               6 Deterministic Financial Tools                    │  │
│  │   1. analyze_cash_flow           4. analyze_financing_readiness  │  │
│  │   2. analyze_financial_health    5. analyze_tax_liability        │  │
│  │   3. analyze_ar_aging            6. analyze_expense_breakdown    │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                                     │ Parameterized Read-Only SQL      │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Live Business Database                          │
│                (PostgreSQL / MySQL / SQLite - Real SME Data)           │
│                                                                        │
│   Tables: invoices, expenses, cash_flow_snapshots, clients, income... │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 The 6 Real-World SME Problem-Solving Pillars

| Pillar | Real SME Crisis Solved | Autonomous Agent Action |
| :--- | :--- | :--- |
| **1. Cash Flow & Runway** | 82% of SMEs fail from unexpected liquidity crunches | Projects 30/60/90-day cash flow, monthly burn rate, and exact runway months from real bank balance and expenses. |
| **2. Financing & Credit Readiness** | $5.2T SME credit gap; painful collateral barriers | Evaluates turnover and verified sales to calculate WeBank Weiyedai (微业贷) pre-qualification score and loan capacity. |
| **3. Financial Health & P&L** | Business owners cannot decipher raw balance sheets | Calculates real-time revenue, COGS, gross/net profit margins, and DuPont financial ratios. |
| **4. AR Aging & Invoicing** | 60–90 day payment delays lock up working capital | Classifies overdue receivables into `0-30`, `31-60`, `61-90`, and `90+` days and targets high-risk clients. |
| **5. Tax Estimation & Calendar** | Late tax filing penalties and missed preferential rates | Computes estimated Corporate Income Tax (preferential 5% rate vs standard) and reconciles input/output VAT. |
| **6. Expense Optimization** | Subscription creep and unmonitored vendor inflation | Analyzes cost breakdowns by category and supplier to flag anomalous burn rate spikes. |

---

## 🗄️ Zero-Mock Real Database Engine

FinPilot connects directly to real production databases with **zero dummy or simulated data**:
- **Automatic Schema Discovery**: On startup, the engine reflects real database tables, identifying numeric, date, and text columns dynamically.
- **Deterministic Math Guarantee**: The LLM **never calculates financial sums or averages**. All numbers are generated via parameterized SQL aggregations (`SUM`, `COUNT`, `AVG`).
- **Universal Database Support**: Connects seamlessly with PostgreSQL, MySQL, MariaDB, and SQLite.

---

## 🔒 Enterprise Security & Multi-Tenant Isolation

1. **Strictly Read-Only Database Privileges**: Write operations (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `GRANT`, `TRUNCATE`) are blocked by multi-layer regex security guards and database role privileges.
2. **Absolute Multi-Tenant Row-Level Security**: Every SQL query strictly binds the tenant identifier (`WHERE tenant_id = :tenant_id`). Cross-tenant data leakage is physically impossible.
3. **Prompt Injection Defense**: All user queries are strictly encapsulated as isolated data payloads (`<user_query>`), preventing system prompt overrides.
4. **Credential Safety**: All API keys and secrets are loaded via environment variables (`.env`) which are excluded from Git version control.

---

## 🔌 Universal 1-Line Embeddable SDK

Embed the AI Copilot into ANY web application in seconds:

```html
<script 
  src="http://localhost:8100/sdk/loader.js" 
  data-api-key="YOUR_AGENT_API_KEY"
  data-tenant-id="YOUR_TENANT_ID"
  data-theme="auto"
  data-position="bottom-right">
</script>
```

### ✨ Auto-Theme Chameleon
The widget automatically detects the host website's:
1. **Background Color & Luminance** (auto dark/light mode switching)
2. **Primary Brand Accent Color** (inherits from buttons, CSS variables, or links)
3. **Typography & Font Family** (inherits host fonts seamlessly)
4. **Border Radii** (matches host UI design language)

---

## 🚀 Integration Methods

### Method 1: Drop-In Browser SDK (Zero-Code)
Add the loader script right before `</body>` in HTML or inside React/Vue components:
```html
<script 
  src="http://localhost:8100/sdk/loader.js" 
  data-api-key="YOUR_AGENT_API_KEY" 
  data-tenant-id="your-tenant-uuid">
</script>
```

### Method 2: Backend REST API (Direct HTTP)
Query FinPilot from your Node.js, Python, PHP, or Go backend:
```bash
curl -X POST http://localhost:8100/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_AGENT_API_KEY" \
  -d '{
    "message": "What is our current cash runway?",
    "tenant_id": "your-tenant-uuid"
  }'
```

### Method 3: Server-Sent Events (SSE Streaming)
Stream real-time thinking states and markdown responses via `POST /chat/stream`:
```python
import requests, json

url = "http://localhost:8100/chat/stream"
headers = {"X-API-Key": "YOUR_AGENT_API_KEY"}
payload = {"message": "Show AR aging summary", "tenant_id": "your-tenant-uuid"}

with requests.post(url, json=payload, headers=headers, stream=True) as resp:
    for line in resp.iter_lines():
        if line.startswith(b"data: "):
            event = json.loads(line[6:])
            if event.get("type") == "status":
                print("Status:", event["message"])
            elif event.get("type") == "text_delta":
                print(event["text"], end="", flush=True)
```

---

## ⚡ Quickstart & Configuration

### 1. Installation
```bash
cd finpilot-agent
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment (`.env`)
Create `.env` using `.env.example` as a template:
```ini
# ── Database Connection (Real SME Database) ──
# SQLite example:
DATABASE_URL=sqlite:////absolute/path/to/your/finpilot.db
# PostgreSQL example:
# DATABASE_URL=postgresql+psycopg2://ro_user:PASSWORD@localhost:5432/your_sme_db

# ── LLM Configuration (Direct Anthropic or Mirai Proxy) ──
ANTHROPIC_API_KEY=YOUR_ANTHROPIC_OR_PROXY_KEY
ANTHROPIC_BASE_URL=https://api.miraiapi.com
LLM_MODEL=claude-opus-4.8
LLM_MAX_TOKENS=4096

# ── Security Secrets ──
API_KEY_SALT=generate-a-random-hex-string-32-chars
AUDIT_HMAC_SECRET=generate-a-random-hex-string-32-chars
AGENT_API_KEY=your-client-api-key-for-widget

# ── Server & CORS ──
HOST=0.0.0.0
PORT=8100
DEBUG=false
CORS_ORIGINS=["http://localhost:5173","http://localhost:8090","*"]

# ── Allowed Database Tables ──
ALLOWED_TABLES=invoices,expenses,clients,income,cash_flow_snapshots,invoice_items,tenants
```

### 3. Verify Database Introspection
```bash
python verify_db.py
```

### 4. Start the Agent Service
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8100
```
Status check:
```bash
curl http://localhost:8100/health
# Response: {"status":"healthy","tables":7}
```

---

## 📡 API Reference & Streaming

| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | None | Returns service health and count of reflected database tables |
| `/schema` | `GET` | `X-API-Key` | Returns live schema catalog summary and table descriptors |
| `/chat` | `POST` | `X-API-Key` | Synchronous inquiry executing tools and returning CFO summary |
| `/chat/stream` | `POST` | `X-API-Key` | Server-Sent Events (SSE) streaming with live status updates |

---

## 🚢 Production Deployment Guide

### Recommended Setup (Linux / Ubuntu + Systemd + Nginx)

#### 1. Systemd Service (`/etc/systemd/system/finpilot-agent.service`)
```ini
[Unit]
Description=FinPilot AI Financial Copilot Agent
After=network.target

[Service]
User=www-data
WorkingDirectory=/var/www/finpilot-agent
EnvironmentFile=/var/www/finpilot-agent/.env
ExecStart=/var/www/finpilot-agent/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8100 --workers 4
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

#### 2. Nginx Reverse Proxy Configuration
```nginx
server {
    listen 80;
    server_name agent.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SSE Streaming support
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
        proxy_buffering off;
        proxy_cache off;
    }
}
```

---

## ❓ Troubleshooting & FAQ

**Q: Does the agent leak data across different tenants?**  
A: No. Every tool enforces mandatory tenant isolation via `WHERE tenant_id = :tenant_id`. Cross-tenant queries are blocked.

**Q: Can the agent modify or delete records in our database?**  
A: No. The agent's query parser rejects any query containing `INSERT`, `UPDATE`, `DELETE`, or `DROP`. Furthermore, in production, the database user role should be granted `SELECT` only.

**Q: What LLM providers can be used?**  
A: FinPilot natively supports Anthropic Claude (Claude 3.5 Sonnet, Claude Opus 4.8) directly via `api.anthropic.com` or via any OpenAI/Anthropic-compatible proxy (such as Mirai API) configured via `ANTHROPIC_BASE_URL`.

---

## 📄 License
This project is licensed under the MIT License.
