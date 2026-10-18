# FinPilot Agent

**Autonomous AI SME Financial Copilot** for the 2026 Shenzhen International FinTech Competition (FinTechathon) - Topic E: SME Finance Copilot (AI Track).

A production-grade, embeddable financial decision agent that integrates into any SME website or ERP system with a single line of JavaScript.

## 🎯 Competition Scoring Alignment

- **Task Completion (40%)**: 24 deterministic tools across 6 problem-solving pillars, zero LLM arithmetic
- **Security & Compliance (30%)**: 8-layer guardrail pipeline, 3-tier permissions, multi-tenant isolation, HMAC audit trail
- **Innovation & Interaction (30%)**: Single-line SDK embed, real-time SSE status streaming, CFO-level responses with markdown tables

## ⚡ Quick Start

```bash
# 1. Install dependencies
cd finpilot-agent
pip install -r requirements.txt

# 2. Seed demo data
python seed.py

# 3. Run the agent
python main.py

# 4. Open demo page
# http://localhost:8100/sdk/demo-host.html
```

The seed script creates a demo tenant "Shenzhen Tech Hardware Co., Ltd" with realistic CNY financial data and prints the API key.

## 🏗️ Architecture

```
Any SME Site → SDK Loader (1-line embed) → Sandboxed iframe Widget
                                           ↓
                                 FastAPI Backend (8-Layer Security)
                                           ↓
                         Agent Orchestrator → 24 Tools → Multi-tenant DB
```

### 6 Problem-Solving Pillars

1. **Cash Flow Forecasting** - 30/60/90-day projections, burn rate, liquidity alerts
2. **Financing Matching** - WeBank Weiyedai pre-qualification (0-100%), loan capacity
3. **Financial Health Analysis** - P&L, margins, DuPont score, industry benchmarking
4. **Accounts Receivable** - Aging buckets, default risk, collection letter drafts
5. **Tax Compliance** - VAT reconciliation, CIT estimation, compliance calendar
6. **Expense Optimization** - OPEX categorization, anomaly detection, cost-cutting recommendations

### 24 Deterministic Math Tools

All financial calculations execute in pure Python functions. The LLM never performs arithmetic - it only selects tools and formats responses.

**Cash Flow (5 tools):**
- `get_bank_position`, `compute_burn_rate`, `project_cash_flow_30_60_90`, `detect_liquidity_dips`, `simulate_what_if`

**Financing (3 tools):**
- `webank_prequalification_score`, `match_financing_products`, `estimate_loan_capacity`

**Health (6 tools):**
- `profit_loss_summary`, `compute_margins`, `compute_working_capital`, `compute_dso`, `dupont_health_score`, `benchmark_vs_industry`

**Receivables (3 tools):**
- `ar_aging_buckets`, `flag_customer_default_risk`, `generate_collection_letter` (Tier 2)

**Tax (4 tools):**
- `reconcile_vat`, `estimate_cit_preferential`, `validate_deductible_expenses`, `compliance_calendar`

**Expense (4 tools):**
- `categorize_recurring_opex`, `detect_anomaly_spikes`, `compute_unit_economics`, `recommend_cost_cuts`

## 🔒 8-Layer Security Pipeline

1. **API Key Authentication** - Bcrypt hashing, O(1) prefix lookup
2. **Rate Limiting** - Per-key sliding window
3. **Prompt Injection Detection** - Multi-pattern jailbreak blocking
4. **Intent Classification** - Route to appropriate specialist
5. **Tier-3 Refusal** - Block fund transfers, schema modifications
6. **PII Redaction** - Mask bank cards, tax IDs, phone numbers before LLM
7. **Tenant Scoping** - Row-level security on ALL queries
8. **HMAC Audit Logging** - Cryptographically signed trail

### 3-Tier Permission Model

- **Tier 1 (Autonomous)**: Read/calculate operations execute immediately
- **Tier 2 (Supervised)**: Generate drafts requiring human approval (e.g., collection emails)
- **Tier 3 (Restricted)**: Always refuse (fund transfers, data deletion, schema changes)

## 🌐 Embeddable SDK

### Single-Line Integration

```html
<script src="http://localhost:8100/sdk/loader.js" data-api-key="fp_live_xxx"></script>
```

### Features

- Sandboxed `<iframe>` with CSS/DOM isolation
- Cross-origin `postMessage` API with validation
- Server-Sent Events (SSE) for real-time status streaming
- Responsive dark/light mode support
- Markdown table rendering with metric pills

### Demo

Open `http://localhost:8100/sdk/demo-host.html` to see the embedded widget in action.

## 📊 API Endpoints

### Chat

- `POST /api/v1/chat` - Synchronous chat (returns complete response)
- `POST /api/v1/chat/stream` - SSE streaming with real-time status badges

**Headers:**
```
X-API-Key: fp_live_xxx
Content-Type: application/json
```

**Request:**
```json
{
  "message": "How is my cash flow looking?",
  "conversation_id": "optional-uuid"
}
```

### Admin

- `GET /api/v1/admin/tenants/me` - Current tenant info
- `GET /api/v1/admin/audit` - Audit logs (HMAC-verified)
- `GET /api/v1/admin/metrics` - Usage statistics

### Data Sync

- `POST /api/v1/sync` - Sync invoices/expenses from external SME systems

## 🗄️ Multi-Tenant Database

**Critical Invariant**: Every table carries a non-nullable `tenant_id` foreign key.

```
tenants → api_keys (bcrypt hashed)
       → users, clients, invoices, expenses, cash_flows, bank_accounts
       → conversations → messages
       → audit_logs (HMAC signed)
       → pending_actions (Tier 2 drafts)
```

### Row-Level Security

All queries go through `app.security.tenants`:
- `get_tenant_scoped(db, Model, tenant_id, resource_id)` - Fetch with ownership check
- `list_tenant_scoped(db, Model, tenant_id)` - List scoped to tenant
- Cross-tenant access triggers `CrossTenantViolation` + security audit

## 🧪 Testing

```bash
# Run full test suite
pytest tests/

# Specific test categories
pytest tests/test_tenant_isolation.py       # Multi-tenant isolation
pytest tests/test_permissions.py            # 3-tier permission enforcement
pytest tests/test_tools_determinism.py      # Exact calculation verification
pytest tests/test_security.py               # Injection blocking, PII redaction
pytest tests/test_streaming.py              # SSE status events
```

## 🚀 Production Deployment

1. **Environment Variables**

```bash
cp .env.example .env
# Edit .env:
# - Set strong API_KEY_SALT and AUDIT_HMAC_SECRET
# - Add ANTHROPIC_API_KEY (optional, falls back to deterministic mode)
# - Switch to PostgreSQL: DATABASE_URL=postgresql+asyncpg://...
```

2. **Database Migration**

```bash
# For production, use Alembic migrations (TODO: setup alembic)
# For dev/demo:
python seed.py
```

3. **Run with Uvicorn**

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8100 --workers 4
```

4. **CORS Configuration**

Update `CORS_ORIGINS` in `.env` to restrict SDK embedding to specific domains:

```
CORS_ORIGINS=["https://yoursme.com", "https://demo.yoursme.com"]
```

## 📁 Project Structure

```
finpilot-agent/
├── main.py                      # Entry point
├── config.py                    # Pydantic settings
├── seed.py                      # Demo data generator
├── app/
│   ├── main.py                  # FastAPI app
│   ├── api/                     # REST endpoints
│   │   ├── chat.py              # Sync + SSE streaming
│   │   ├── admin_api.py         # Tenant management
│   │   └── sync.py              # External data sync
│   ├── core/                    # Foundation
│   │   ├── models.py            # SQLAlchemy ORM (ALL with tenant_id)
│   │   ├── schemas.py           # Pydantic v2 request/response
│   │   ├── db.py                # Async engine & sessions
│   │   ├── auth.py              # API key → tenant resolution
│   │   └── crypto.py            # Bcrypt + HMAC signing
│   ├── security/                # 8-layer pipeline
│   │   ├── pipeline.py          # Orchestrator
│   │   ├── injection.py         # Jailbreak detection
│   │   ├── pii.py               # PII redaction
│   │   ├── permissions.py       # 3-tier model
│   │   └── tenants.py           # Row-level security
│   ├── agent/                   # LLM orchestration
│   │   ├── orchestrator.py      # Main execution flow
│   │   ├── router.py            # Intent → pillar classifier
│   │   ├── llm.py               # Anthropic client + tool-use loop
│   │   └── context.py           # Tenant-scoped context builder
│   ├── tools/                   # 24 deterministic tools
│   │   ├── registry.py          # Tool definitions
│   │   ├── cashflow.py          # Pillar 1 (5 tools)
│   │   ├── financing.py         # Pillar 2 (3 tools)
│   │   ├── health.py            # Pillar 3 (6 tools)
│   │   ├── receivables.py       # Pillar 4 (3 tools)
│   │   ├── tax.py               # Pillar 5 (4 tools)
│   │   └── expense.py           # Pillar 6 (4 tools)
│   └── streaming.py             # SSE status event bus
├── sdk/                         # Embeddable widget
│   ├── loader.js                # 1-line embed script
│   ├── widget.html              # Iframe UI
│   ├── widget.css               # Isolated styling
│   ├── widget.js                # Client logic + SSE
│   └── demo-host.html           # Integration demo
└── tests/                       # Comprehensive test suite
```

## 🎓 Competition Context

### WeBank Weiyedai (微业贷)

China's largest digital bank's flagship SME product:
- 100% digital, unsecured revolving credit line
- Up to ¥3,000,000 (~$400k USD)
- 3.6%-10.8% APR
- Approval in 24 hours, zero collateral required
- Target: SMEs with stable revenue and clean payment history

### China SME Preferential Tax Rates

- **VAT**: 13% standard rate
- **CIT**: 5% effective rate for small low-profit enterprises (taxable income ≤¥3M), vs. 25% standard

## 📝 Response Style

FinPilot speaks with **CFO-level precision**:

✅ **DO:**
- Start with bottom-line / executive summary
- Format numbers in clean markdown tables
- Highlight critical metrics: `> **Cash Runway: 2.6 Mo**`
- End with numbered action steps (dates + CNY amounts)

❌ **DON'T:**
- No conversational pleasantries ("Hello", "I hope this helps")
- No generic AI disclaimers
- No empty confirmations

## 🤝 Integration with Demo SME Site

The `finpilot/` folder (untouched) is a full React + FastAPI SME ERP platform. To integrate:

1. Copy the API key from `python seed.py` output
2. Add to `finpilot/frontend/public/index.html`:

```html
<script src="http://localhost:8100/sdk/loader.js" data-api-key="fp_live_xxx"></script>
```

3. Start both services:
```bash
# Terminal 1: Agent
cd finpilot-agent && python main.py

# Terminal 2: SME site
cd finpilot && npm run dev
```

## 📄 License

Built for the 2026 Shenzhen International FinTech Competition.

## 🐛 Known Limitations

- LLM fallback mode (when ANTHROPIC_API_KEY unset) uses simple template responses
- Single-database setup (for multi-region, shard by tenant_id)
- No Alembic migrations yet (use `seed.py` for demo)

## 🔗 Resources

- Competition: Tsinghua PBC School of Finance + WeBank FinTechathon 2026
- WeBank Developer Docs: https://cloud.webank.com
- Anthropic Claude API: https://docs.anthropic.com
