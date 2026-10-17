# 🏗️ FinPilot — Complete Blueprint: From Scratch to Production

> **Two Products, One System:**
> 1. **FinPilot Agent** — Embeddable AI agent (SDK + API) that any SME platform can integrate
> 2. **FinPilot Platform** — Full SME management app with the agent built-in (your contest demo + reference implementation)
>
> **Future Model:** Free now → Paid SaaS with monthly subscription later

---

## Table of Contents

1. [Product Vision & Business Model](#part-1-product-vision--business-model)
2. [Complete Tech Stack](#part-2-complete-tech-stack)
3. [System Architecture (Big Picture)](#part-3-system-architecture)
4. [Project Directory Structure](#part-4-project-directory-structure)
5. [Database Schema (Every Table)](#part-5-database-schema)
6. [Backend API (Every Endpoint)](#part-6-backend-api)
7. [The AI Agent Engine (Core Brain)](#part-7-the-ai-agent-engine)
8. [All Agent Tools (Complete Specs)](#part-8-all-agent-tools)
9. [Embeddable Widget SDK](#part-9-embeddable-widget-sdk)
10. [Frontend: SME Management Platform (Every Page)](#part-10-frontend-sme-management-platform)
11. [Security & Compliance Framework](#part-11-security--compliance-framework)
12. [Deployment & Infrastructure](#part-12-deployment--infrastructure)
13. [Build Plan (Day-by-Day)](#part-13-build-plan)
14. [Contest Submission Mapping](#part-14-contest-submission-mapping)

---

## Part 1: Product Vision & Business Model

### What You're Building

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   PRODUCT 1: FinPilot Agent (The Core — Reusable Engine)       │
│   ════════════════════════════════════════════════════════       │
│   • Multi-agent AI engine with financial tools                  │
│   • REST API + WebSocket streaming                              │
│   • Embeddable JS widget (like Intercom for SME finance)        │
│   • API keys for third-party integration                        │
│   • Any existing SME software can plug this in                  │
│                                                                 │
│   PRODUCT 2: FinPilot Platform (The Showcase — Full App)       │
│   ════════════════════════════════════════════════════════       │
│   • Complete SME management dashboard                           │
│   • Invoicing, Expenses, Clients, Cash Flow, Reports            │
│   • FinPilot Agent embedded natively                            │
│   • This IS your contest demo + reference implementation        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Future SaaS Model (Mention in Presentation)

| Tier | Price | What They Get |
|------|-------|--------------|
| **Free** | $0/mo | Agent widget with 50 queries/month, basic financial analysis |
| **Starter** | $29/mo | 500 queries, cash flow forecasting, invoice tracking, 1 user |
| **Business** | $79/mo | Unlimited queries, loan matching, multi-user, API access |
| **Enterprise** | Custom | White-label, custom tools, dedicated support, on-premise option |

---

## Part 2: Complete Tech Stack

| Layer | Technology | Why This Choice |
|-------|-----------|----------------|
| **Language** | Python 3.11+ | Best for AI/ML, financial math, agent frameworks |
| **Backend Framework** | FastAPI | Async, auto-docs (Swagger), Pydantic validation, WebSocket support |
| **Frontend Framework** | Next.js 14 (App Router) | SSR, fast, great DX, easy deployment |
| **UI Components** | shadcn/ui + Tailwind CSS | Premium look, accessible, composable |
| **Charts** | Recharts (React) | Clean financial visualizations |
| **Database** | PostgreSQL (via Supabase or local) | NUMERIC precision, RLS for multi-tenant, JSON support |
| **ORM** | SQLAlchemy 2.0 + Alembic | Type-safe, migration support |
| **LLM** | Gemini 2.0 Flash (google-genai SDK) | Fast, cheap, excellent function calling |
| **Agent Framework** | Custom Python (or LangGraph if time allows) | Full control over multi-agent routing |
| **Auth** | JWT (python-jose) + bcrypt | Stateless, scalable |
| **PDF Generation** | ReportLab (Python) | Financial report PDFs |
| **Embeddable Widget** | Vanilla JS + iframe isolation | Lightweight, no dependencies for integrators |
| **Deployment** | Docker + Railway/Render (backend) + Vercel (frontend) | Free tiers available, fast deploy |
| **Dev Tools** | uv (Python pkg mgr), pnpm (JS pkg mgr) | Fast installs |

---

## Part 3: System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL INTEGRATIONS                             │
│                                                                          │
│   Any SME Platform ──► Embeddable Widget (iframe + loader.js)           │
│   Any SME Backend ───► REST API (/api/v1/agent/*)                       │
│                                                                          │
└──────────────────────┬───────────────────────┬───────────────────────────┘
                       │                       │
                       ▼                       ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     FINPILOT PLATFORM (Next.js)                          │
│                                                                          │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │Dashboard│ │ Invoices │ │ Expenses │ │ Clients  │ │  Reports      │  │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┬───────┘  │
│       │           │            │            │               │           │
│  ┌────▼───────────▼────────────▼────────────▼───────────────▼─────────┐ │
│  │              FinPilot Agent Chat Panel (embedded)                   │ │
│  │              Always accessible from right sidebar                  │ │
│  └────────────────────────────┬────────────────────────────────────────┘ │
└───────────────────────────────┬──────────────────────────────────────────┘
                                │ HTTPS / WebSocket
                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      FASTAPI BACKEND                                     │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                    API GATEWAY LAYER                                │  │
│  │  • JWT Auth Middleware     • Rate Limiter                          │  │
│  │  • Tenant Context Setter  • Request Logger                        │  │
│  │  • PII Masking Layer      • CORS Handler                          │  │
│  └───────────┬────────────────────────────────────┬───────────────────┘  │
│              │                                    │                      │
│   ┌──────────▼──────────┐           ┌─────────────▼────────────────┐    │
│   │  PLATFORM ROUTES    │           │     AGENT ENGINE              │    │
│   │                     │           │                               │    │
│   │  /api/v1/auth/*     │           │  ┌─────────────────────────┐ │    │
│   │  /api/v1/invoices/* │           │  │  ORCHESTRATOR AGENT     │ │    │
│   │  /api/v1/expenses/* │           │  │  (Intent → Route)       │ │    │
│   │  /api/v1/clients/*  │           │  └──┬────┬────┬────┬──────┘ │    │
│   │  /api/v1/dashboard/*│           │     │    │    │    │        │    │
│   │  /api/v1/reports/*  │           │  ┌──▼┐ ┌─▼─┐ ┌▼──┐ ┌▼────┐ │    │
│   │                     │           │  │CF │ │LM │ │FA │ │INV │ │    │
│   │  These routes read/ │           │  │Agt│ │Agt│ │Agt│ │Agt │ │    │
│   │  write the DB and   │◄─────────►│  └──┬┘ └─┬─┘ └┬──┘ └┬────┘ │    │
│   │  feed data TO the   │  DB data  │     │    │    │    │        │    │
│   │  agent when needed  │           │  ┌──▼────▼────▼────▼──────┐ │    │
│   │                     │           │  │   TOOL EXECUTION LAYER  │ │    │
│   │                     │           │  │   (Sandboxed Python)     │ │    │
│   └─────────────────────┘           │  └─────────────────────────┘ │    │
│                                     └──────────────────────────────┘    │
│              │                                    │                      │
│   ┌──────────▼────────────────────────────────────▼───────────────────┐  │
│   │                     POSTGRESQL DATABASE                           │  │
│   │  • Row-Level Security (tenant isolation)                          │  │
│   │  • NUMERIC(12,2) for all financial data                          │  │
│   │  • Audit log table for every agent interaction                    │  │
│   └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **The key insight:** The Platform CRUD routes and the Agent Engine share the SAME database. When the agent needs to analyze invoices, it queries the SAME invoices table that the platform UI manages. This makes the agent's analysis real and grounded — not based on hallucinated data.

---

## Part 4: Project Directory Structure

```
finpilot/
├── README.md                          # Setup & deployment instructions
├── docker-compose.yml                 # Local dev: postgres + backend + frontend
├── .env.example                       # Environment variables template
│
├── backend/                           # ══ FASTAPI BACKEND ══
│   ├── pyproject.toml                 # Python dependencies (uv)
│   ├── alembic.ini                    # DB migration config
│   ├── alembic/                       # Migration scripts
│   │   └── versions/
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # FastAPI app entry + middleware setup
│   │   ├── config.py                  # Settings (env vars, secrets)
│   │   │
│   │   ├── db/                        # ── Database Layer ──
│   │   │   ├── __init__.py
│   │   │   ├── engine.py              # SQLAlchemy engine + session factory
│   │   │   ├── models.py              # ALL database models (see Part 5)
│   │   │   └── tenant.py              # Tenant context manager (RLS)
│   │   │
│   │   ├── auth/                      # ── Authentication ──
│   │   │   ├── __init__.py
│   │   │   ├── router.py              # /auth/register, /auth/login, /auth/me
│   │   │   ├── service.py             # JWT creation, password hashing
│   │   │   └── dependencies.py        # get_current_user dependency
│   │   │
│   │   ├── routes/                    # ── Platform CRUD Routes ──
│   │   │   ├── __init__.py
│   │   │   ├── dashboard.py           # GET /dashboard/summary
│   │   │   ├── invoices.py            # CRUD /invoices
│   │   │   ├── expenses.py            # CRUD /expenses
│   │   │   ├── clients.py             # CRUD /clients
│   │   │   ├── income.py              # CRUD /income
│   │   │   ├── reports.py             # GET /reports/pnl, /reports/cashflow
│   │   │   └── products.py            # GET /financing-products (loan DB)
│   │   │
│   │   ├── agent/                     # ── AI AGENT ENGINE ──
│   │   │   ├── __init__.py
│   │   │   ├── router.py              # POST /agent/chat, WS /agent/stream
│   │   │   ├── orchestrator.py        # Main orchestrator (intent → specialist)
│   │   │   ├── specialists/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── cashflow_agent.py  # Cash flow forecasting specialist
│   │   │   │   ├── loan_agent.py      # Financing matcher specialist
│   │   │   │   ├── analyst_agent.py   # Financial analysis specialist
│   │   │   │   ├── invoice_agent.py   # Invoice/AR specialist
│   │   │   │   └── tax_agent.py       # Tax & compliance specialist
│   │   │   │
│   │   │   ├── tools/                 # ── DETERMINISTIC TOOLS ──
│   │   │   │   ├── __init__.py
│   │   │   │   ├── cashflow_tools.py  # forecast, what_if, alerts
│   │   │   │   ├── loan_tools.py      # match, eligibility, gap_analysis
│   │   │   │   ├── analysis_tools.py  # pnl, ratios, health_score, benchmarks
│   │   │   │   ├── invoice_tools.py   # track, overdue, draft_reminder
│   │   │   │   ├── tax_tools.py       # estimate, deadlines, deductions
│   │   │   │   └── chart_tools.py     # generate_chart (returns image bytes)
│   │   │   │
│   │   │   ├── guardrails/            # ── SECURITY GUARDRAILS ──
│   │   │   │   ├── __init__.py
│   │   │   │   ├── input_filter.py    # Prompt injection defense
│   │   │   │   ├── output_filter.py   # Financial advice disclaimers
│   │   │   │   ├── pii_masker.py      # Mask sensitive data before LLM
│   │   │   │   └── permission_gate.py # Tier 1/2/3 action gating
│   │   │   │
│   │   │   ├── memory.py              # Session memory (per-tenant context)
│   │   │   └── prompts.py             # System prompts for all agents
│   │   │
│   │   ├── sdk/                       # ── INTEGRATION SDK BACKEND ──
│   │   │   ├── __init__.py
│   │   │   ├── router.py              # /sdk/session, /sdk/message (for widget)
│   │   │   └── api_keys.py            # API key management for integrators
│   │   │
│   │   ├── data/                      # ── STATIC DATA FILES ──
│   │   │   ├── financing_products.json # 30+ loan/grant products
│   │   │   ├── industry_benchmarks.json # Benchmarks by industry
│   │   │   └── tax_rules.json         # Tax deadlines & rates by country
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── pdf_generator.py       # Financial report PDF generation
│   │       └── audit_logger.py        # Immutable audit trail
│   │
│   ├── tests/
│   │   ├── test_agent.py
│   │   ├── test_invoices.py
│   │   ├── test_expenses.py
│   │   └── test_guardrails.py
│   │
│   └── Dockerfile
│
├── frontend/                          # ══ NEXT.JS FRONTEND ══
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   │
│   ├── src/
│   │   ├── app/                       # ── App Router Pages ──
│   │   │   ├── layout.tsx             # Root layout (sidebar + agent panel)
│   │   │   ├── page.tsx               # Landing / redirect to dashboard
│   │   │   │
│   │   │   ├── (auth)/               # Auth group
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   │
│   │   │   ├── (dashboard)/          # Protected dashboard group
│   │   │   │   ├── layout.tsx         # Dashboard layout (sidebar + topbar)
│   │   │   │   ├── dashboard/page.tsx # Main dashboard (KPIs + charts)
│   │   │   │   ├── invoices/
│   │   │   │   │   ├── page.tsx       # Invoice list
│   │   │   │   │   ├── new/page.tsx   # Create invoice
│   │   │   │   │   └── [id]/page.tsx  # Invoice detail
│   │   │   │   ├── expenses/
│   │   │   │   │   ├── page.tsx       # Expense list
│   │   │   │   │   └── new/page.tsx   # Add expense
│   │   │   │   ├── clients/
│   │   │   │   │   ├── page.tsx       # Client list
│   │   │   │   │   └── [id]/page.tsx  # Client detail
│   │   │   │   ├── income/
│   │   │   │   │   └── page.tsx       # Income entries
│   │   │   │   ├── cashflow/
│   │   │   │   │   └── page.tsx       # Cash flow forecast view
│   │   │   │   ├── financing/
│   │   │   │   │   └── page.tsx       # Loan marketplace
│   │   │   │   ├── reports/
│   │   │   │   │   └── page.tsx       # P&L, reports, PDF export
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx       # Business profile, API keys
│   │   │   │
│   │   │   └── api/                   # Next.js API routes (proxy to backend)
│   │   │
│   │   ├── components/                # ── Reusable Components ──
│   │   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Topbar.tsx
│   │   │   │   └── AgentPanel.tsx     # ★ Sliding agent chat panel
│   │   │   ├── dashboard/
│   │   │   │   ├── KpiCard.tsx
│   │   │   │   ├── CashFlowChart.tsx
│   │   │   │   ├── ExpenseBreakdown.tsx
│   │   │   │   └── AlertsBanner.tsx
│   │   │   ├── invoices/
│   │   │   │   ├── InvoiceTable.tsx
│   │   │   │   ├── InvoiceForm.tsx
│   │   │   │   └── StatusBadge.tsx
│   │   │   ├── expenses/
│   │   │   │   ├── ExpenseTable.tsx
│   │   │   │   └── ExpenseForm.tsx
│   │   │   ├── agent/
│   │   │   │   ├── ChatWindow.tsx     # ★ Main agent chat UI
│   │   │   │   ├── ChatMessage.tsx
│   │   │   │   ├── QuickActions.tsx
│   │   │   │   ├── ChartRenderer.tsx  # Renders inline charts from agent
│   │   │   │   └── ToolCallDisplay.tsx # Shows what tools agent is using
│   │   │   └── charts/
│   │   │       ├── LineChart.tsx
│   │   │       ├── BarChart.tsx
│   │   │       ├── DonutChart.tsx
│   │   │       └── HealthScore.tsx    # Radial gauge component
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts                 # Axios/fetch wrapper for backend
│   │   │   ├── auth.ts                # Auth context + token management
│   │   │   └── agent-client.ts        # WebSocket client for agent streaming
│   │   │
│   │   └── styles/
│   │       └── globals.css
│   │
│   └── Dockerfile
│
├── widget/                            # ══ EMBEDDABLE WIDGET SDK ══
│   ├── loader.js                      # <2KB script tag integrators paste
│   ├── widget.html                    # Iframe-hosted chat UI
│   ├── widget.js                      # Chat logic inside iframe
│   ├── widget.css                     # Isolated styles
│   └── README.md                      # Integration documentation
│
└── docs/                              # ══ CONTEST SUBMISSIONS ══
    ├── technical_documentation.md      # System architecture + algorithms
    ├── security_self_assessment.md     # Permission tiers + risk matrix
    ├── presentation_deck.pptx          # ≤10 min slide deck
    └── demo_script.md                  # Pre-scripted demo scenarios
```

---

## Part 5: Database Schema

### Complete Entity-Relationship Diagram

```mermaid
erDiagram
    TENANTS ||--o{ USERS : has
    TENANTS ||--o{ CLIENTS : has
    TENANTS ||--o{ INVOICES : has
    TENANTS ||--o{ EXPENSES : has
    TENANTS ||--o{ INCOME_ENTRIES : has
    TENANTS ||--o{ AGENT_SESSIONS : has
    TENANTS ||--o{ API_KEYS : has
    TENANTS ||--o{ ALERTS : has
    CLIENTS ||--o{ INVOICES : receives
    INVOICES ||--o{ INVOICE_ITEMS : contains
    AGENT_SESSIONS ||--o{ AGENT_MESSAGES : contains
    AGENT_SESSIONS ||--o{ AUDIT_LOGS : generates

    TENANTS {
        uuid id PK
        string company_name
        string industry
        string country
        string currency
        decimal safety_buffer_amount
        timestamp created_at
    }

    USERS {
        uuid id PK
        uuid tenant_id FK
        string email
        string password_hash
        string full_name
        string role
        timestamp created_at
    }

    CLIENTS {
        uuid id PK
        uuid tenant_id FK
        string name
        string email
        string phone
        string address
        string payment_terms
        timestamp created_at
    }

    INVOICES {
        uuid id PK
        uuid tenant_id FK
        uuid client_id FK
        string invoice_number
        string status
        date issue_date
        date due_date
        date paid_date
        decimal subtotal
        decimal tax_amount
        decimal total
        text notes
        timestamp created_at
    }

    INVOICE_ITEMS {
        uuid id PK
        uuid invoice_id FK
        string description
        decimal quantity
        decimal unit_price
        decimal total
    }

    EXPENSES {
        uuid id PK
        uuid tenant_id FK
        string category
        string vendor
        decimal amount
        date expense_date
        string payment_method
        string description
        string receipt_url
        boolean is_tax_deductible
        timestamp created_at
    }

    INCOME_ENTRIES {
        uuid id PK
        uuid tenant_id FK
        string source
        string category
        decimal amount
        date income_date
        string description
        boolean is_recurring
        string recurrence_period
        timestamp created_at
    }

    AGENT_SESSIONS {
        uuid id PK
        uuid tenant_id FK
        uuid user_id FK
        string source
        jsonb business_context
        timestamp created_at
        timestamp last_message_at
    }

    AGENT_MESSAGES {
        uuid id PK
        uuid session_id FK
        string role
        text content
        jsonb tool_calls
        jsonb tool_results
        jsonb metadata
        timestamp created_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid tenant_id FK
        uuid session_id FK
        string action_type
        string permission_tier
        jsonb input_data
        jsonb output_data
        string tools_used
        boolean human_approved
        timestamp created_at
    }

    API_KEYS {
        uuid id PK
        uuid tenant_id FK
        string key_hash
        string key_prefix
        string label
        string permissions
        boolean is_active
        timestamp created_at
        timestamp last_used_at
    }

    ALERTS {
        uuid id PK
        uuid tenant_id FK
        string alert_type
        string severity
        string title
        text message
        text recommended_action
        boolean is_read
        date trigger_date
        timestamp created_at
    }

    FINANCING_PRODUCTS {
        uuid id PK
        string name
        string provider
        string product_type
        decimal min_amount
        decimal max_amount
        decimal interest_rate_min
        decimal interest_rate_max
        boolean requires_collateral
        integer min_years_operation
        decimal min_monthly_revenue
        boolean digital_application
        decimal approval_time_hours
        jsonb eligibility_rules
        text description
        timestamp updated_at
    }

    INDUSTRY_BENCHMARKS {
        uuid id PK
        string industry_code
        string industry_name
        jsonb metrics
        timestamp updated_at
    }
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `NUMERIC(12,2)` for all money | Never use FLOAT for financial data — rounding errors |
| `tenant_id` on every business table | Multi-tenant isolation — foundation for SaaS |
| Separate `INCOME_ENTRIES` table | Not all income comes from invoices (walk-in sales, cash) |
| `AGENT_MESSAGES.tool_calls` as JSONB | Store the complete tool interaction trace for audit |
| `AUDIT_LOGS` table | Required for Security & Compliance scoring (30%) |
| `FINANCING_PRODUCTS` as its own table | Static reference data — not tenant-specific |
| `ALERTS` table | Agent generates alerts that persist and display on dashboard |

---

## Part 6: Backend API (Every Endpoint)

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Create account + tenant |
| POST | `/api/v1/auth/login` | Get JWT token |
| GET | `/api/v1/auth/me` | Get current user + tenant info |
| PUT | `/api/v1/auth/profile` | Update business profile |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/summary` | KPIs: total revenue, expenses, net cash, outstanding invoices |
| GET | `/api/v1/dashboard/cashflow-chart` | Monthly income vs expenses (last 12 months) |
| GET | `/api/v1/dashboard/expense-breakdown` | Expenses grouped by category |
| GET | `/api/v1/dashboard/alerts` | Active agent-generated alerts |

### Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/invoices` | List all invoices (filterable: status, client, date range) |
| POST | `/api/v1/invoices` | Create invoice with line items |
| GET | `/api/v1/invoices/{id}` | Get invoice detail |
| PUT | `/api/v1/invoices/{id}` | Update invoice |
| PATCH | `/api/v1/invoices/{id}/status` | Change status (draft→sent→paid→overdue) |
| DELETE | `/api/v1/invoices/{id}` | Delete draft invoice |
| GET | `/api/v1/invoices/{id}/pdf` | Download invoice as PDF |

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/expenses` | List all expenses (filterable: category, date, vendor) |
| POST | `/api/v1/expenses` | Log new expense |
| GET | `/api/v1/expenses/{id}` | Get expense detail |
| PUT | `/api/v1/expenses/{id}` | Update expense |
| DELETE | `/api/v1/expenses/{id}` | Delete expense |
| GET | `/api/v1/expenses/categories` | Get expense category breakdown |

### Income

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/income` | List all income entries |
| POST | `/api/v1/income` | Log income entry |
| PUT | `/api/v1/income/{id}` | Update income entry |
| DELETE | `/api/v1/income/{id}` | Delete income entry |

### Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/clients` | List all clients |
| POST | `/api/v1/clients` | Add client |
| GET | `/api/v1/clients/{id}` | Client detail + invoice history |
| PUT | `/api/v1/clients/{id}` | Update client |
| DELETE | `/api/v1/clients/{id}` | Delete client |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/reports/pnl?period=2026-09` | P&L statement for period |
| GET | `/api/v1/reports/cashflow?months=6` | Cash flow report |
| GET | `/api/v1/reports/health-score` | Business health score + breakdown |
| GET | `/api/v1/reports/tax-estimate` | Estimated tax obligations |
| GET | `/api/v1/reports/export/pdf?type=pnl&period=2026-09` | Download report as PDF |

### Financing Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/financing/products` | List all available financing products |
| POST | `/api/v1/financing/match` | Match business profile to best products |
| GET | `/api/v1/financing/products/{id}` | Product detail + eligibility check |

### Agent (Core AI Engine)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/agent/chat` | Send message, get response (non-streaming) |
| WS | `/api/v1/agent/stream` | WebSocket for streaming agent responses |
| GET | `/api/v1/agent/sessions` | List past conversation sessions |
| GET | `/api/v1/agent/sessions/{id}` | Get full conversation history |
| GET | `/api/v1/agent/audit-log` | View audit trail (for security demo) |

### SDK / Integration (For Embeddable Widget)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/sdk/session` | Initialize widget session (from external site) |
| POST | `/api/v1/sdk/message` | Send message via widget (SSE streaming response) |
| GET | `/api/v1/sdk/config` | Get widget config (brand color, welcome msg) |

### Settings / API Keys

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/settings/api-keys` | List API keys |
| POST | `/api/v1/settings/api-keys` | Generate new API key |
| DELETE | `/api/v1/settings/api-keys/{id}` | Revoke API key |
| PUT | `/api/v1/settings/business-profile` | Update business info |

---

## Part 7: The AI Agent Engine

### Orchestrator Flow

```python
# Simplified pseudocode — app/agent/orchestrator.py

async def process_message(user_message: str, session: AgentSession, db: Session):
    
    # 1. GUARDRAILS: Input filtering
    filtered_input = input_filter.scan(user_message)
    if filtered_input.blocked:
        return "I can't process that request for security reasons."
    
    # 2. PII MASKING: Mask sensitive data before sending to LLM
    masked_input = pii_masker.mask(filtered_input.text)
    
    # 3. CONTEXT BUILDING: Load business context from DB
    business_context = await load_business_context(session.tenant_id, db)
    # Includes: recent income, expenses, invoices, business profile
    
    # 4. LLM CALL with FUNCTION CALLING
    response = await gemini_client.generate_content(
        model="gemini-2.0-flash",
        system_instruction=ORCHESTRATOR_SYSTEM_PROMPT,
        contents=[
            *session.message_history,
            {"role": "user", "parts": [masked_input]}
        ],
        tools=ALL_AGENT_TOOLS,  # Function declarations
        config={"temperature": 0.1}  # Low temp for financial accuracy
    )
    
    # 5. TOOL EXECUTION LOOP
    while response.has_function_calls:
        tool_results = []
        for call in response.function_calls:
            
            # Permission gate check
            tier = permission_gate.check(call.name)
            if tier == "RESTRICTED":
                tool_results.append({"error": "Action requires manual approval"})
                continue
            if tier == "SUPERVISED":
                # Flag for human review, but still execute
                await flag_for_review(call, session)
            
            # Execute the tool
            result = await execute_tool(call.name, call.args, session.tenant_id, db)
            tool_results.append(result)
            
            # Audit log every tool call
            await audit_logger.log(session, call, result)
        
        # Send tool results back to LLM for synthesis
        response = await gemini_client.generate_content(
            contents=[*messages, {"role": "tool", "parts": tool_results}],
            tools=ALL_AGENT_TOOLS
        )
    
    # 6. OUTPUT GUARDRAILS
    final_text = output_filter.scan(response.text)
    
    # 7. PII UNMASKING in response (if needed)
    final_text = pii_masker.unmask(final_text)
    
    # 8. SAVE to message history
    await save_messages(session, user_message, final_text, tool_calls)
    
    return final_text
```

### Agent System Prompts

```python
ORCHESTRATOR_SYSTEM_PROMPT = """
You are FinPilot, an AI CFO assistant for small business owners. 
You help SME owners understand their finances, forecast cash flow, 
find financing options, and manage invoices.

CRITICAL RULES:
1. NEVER calculate financial numbers yourself. ALWAYS use the provided tools.
2. NEVER guarantee loan approval or specific interest rates.
3. ALWAYS add disclaimer: "This is informational analysis, not financial advice."
4. If the user asks you to send money, submit applications, or take actions 
   that affect real finances — REFUSE and explain they must do it manually.
5. When uncertain, ASK for clarification rather than guessing.
6. Speak in simple, non-technical language unless the user asks for detail.

You have access to the user's actual business data (invoices, expenses, 
income) stored in the system. Use the tools to query this data — never 
make up numbers.

AVAILABLE SPECIALIST CAPABILITIES:
- Cash Flow: Forecasting, what-if scenarios, proactive alerts
- Financing: Match business to loan products, eligibility analysis
- Analysis: P&L generation, health scoring, industry benchmarking
- Invoices: Track receivables, identify overdue, draft reminders
- Tax: Estimate obligations, deadline reminders, deduction tips
"""
```

---

## Part 8: All Agent Tools (Complete Specs)

### Tool Registry (What the LLM sees as function declarations)

```python
ALL_AGENT_TOOLS = [
    # ═══ CASH FLOW TOOLS ═══
    {
        "name": "get_cash_position",
        "description": "Get current cash balance, recent inflows/outflows, and basic runway calculation",
        "parameters": {
            "type": "object",
            "properties": {
                "as_of_date": {"type": "string", "description": "Date in YYYY-MM-DD format, defaults to today"}
            }
        }
    },
    {
        "name": "forecast_cashflow",
        "description": "Generate a 90-day cash flow forecast with confidence intervals and alerts",
        "parameters": {
            "type": "object",
            "properties": {
                "horizon_days": {"type": "integer", "default": 90},
                "include_pending_invoices": {"type": "boolean", "default": True}
            }
        }
    },
    {
        "name": "run_what_if_scenario",
        "description": "Simulate a financial scenario and compare against current baseline",
        "parameters": {
            "type": "object",
            "properties": {
                "scenario_description": {"type": "string"},
                "changes": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "type": {"type": "string", "enum": ["add_expense", "remove_expense", "add_income", "lose_income", "one_time_cost"]},
                            "description": {"type": "string"},
                            "amount_monthly": {"type": "number"},
                            "start_date": {"type": "string"}
                        }
                    }
                }
            },
            "required": ["changes"]
        }
    },
    
    # ═══ FINANCING TOOLS ═══
    {
        "name": "get_business_profile",
        "description": "Get the current business profile used for financing matching",
        "parameters": {"type": "object", "properties": {}}
    },
    {
        "name": "match_financing_options",
        "description": "Match business profile against financing products database and return ranked recommendations",
        "parameters": {
            "type": "object",
            "properties": {
                "desired_amount": {"type": "number"},
                "purpose": {"type": "string"},
                "urgency": {"type": "string", "enum": ["immediate", "within_month", "planning"]}
            },
            "required": ["desired_amount", "purpose"]
        }
    },
    {
        "name": "check_loan_eligibility",
        "description": "Check eligibility for a specific financing product and identify gaps",
        "parameters": {
            "type": "object",
            "properties": {
                "product_id": {"type": "string"}
            },
            "required": ["product_id"]
        }
    },
    
    # ═══ FINANCIAL ANALYSIS TOOLS ═══
    {
        "name": "generate_pnl",
        "description": "Generate a Profit & Loss statement for a given period from actual database records",
        "parameters": {
            "type": "object",
            "properties": {
                "period": {"type": "string", "description": "YYYY-MM or YYYY-Q1 format"},
            },
            "required": ["period"]
        }
    },
    {
        "name": "calculate_health_score",
        "description": "Calculate overall business health score (0-100) with breakdown and industry comparison",
        "parameters": {
            "type": "object",
            "properties": {
                "period": {"type": "string"}
            }
        }
    },
    {
        "name": "get_financial_ratios",
        "description": "Calculate key financial ratios: gross margin, net margin, current ratio, debt-to-income",
        "parameters": {
            "type": "object",
            "properties": {
                "period": {"type": "string"}
            }
        }
    },
    {
        "name": "compare_periods",
        "description": "Compare financial performance between two periods (month-over-month or year-over-year)",
        "parameters": {
            "type": "object",
            "properties": {
                "period_a": {"type": "string"},
                "period_b": {"type": "string"}
            },
            "required": ["period_a", "period_b"]
        }
    },
    
    # ═══ INVOICE TOOLS ═══
    {
        "name": "get_invoice_summary",
        "description": "Get summary of all invoices: overdue, due soon, paid, with totals",
        "parameters": {"type": "object", "properties": {}}
    },
    {
        "name": "get_overdue_invoices",
        "description": "List all overdue invoices with client info and days overdue",
        "parameters": {"type": "object", "properties": {}}
    },
    {
        "name": "analyze_client_payment_behavior",
        "description": "Analyze payment reliability of a specific client or all clients",
        "parameters": {
            "type": "object",
            "properties": {
                "client_id": {"type": "string", "description": "Optional, omit for all clients"}
            }
        }
    },
    {
        "name": "draft_payment_reminder",
        "description": "Draft a payment reminder message for an overdue invoice. DOES NOT SEND — user must approve.",
        "parameters": {
            "type": "object",
            "properties": {
                "invoice_id": {"type": "string"},
                "tone": {"type": "string", "enum": ["friendly", "firm", "formal"]},
                "channel": {"type": "string", "enum": ["email", "sms", "message"]}
            },
            "required": ["invoice_id"]
        }
    },
    
    # ═══ TAX TOOLS ═══
    {
        "name": "estimate_tax_obligations",
        "description": "Estimate upcoming tax obligations based on income and expenses data",
        "parameters": {
            "type": "object",
            "properties": {
                "tax_year": {"type": "string"}
            }
        }
    },
    {
        "name": "get_compliance_calendar",
        "description": "Get upcoming tax and compliance deadlines",
        "parameters": {"type": "object", "properties": {}}
    },
    {
        "name": "find_tax_deductions",
        "description": "Analyze expenses to identify potential tax deductions the business might be missing",
        "parameters": {
            "type": "object",
            "properties": {
                "period": {"type": "string"}
            }
        }
    },
    
    # ═══ VISUALIZATION TOOLS ═══
    {
        "name": "generate_chart",
        "description": "Generate a financial chart (line, bar, donut, gauge) and return as image",
        "parameters": {
            "type": "object",
            "properties": {
                "chart_type": {"type": "string", "enum": ["line", "bar", "donut", "gauge", "comparison"]},
                "data_source": {"type": "string", "enum": ["cashflow", "expenses_by_category", "revenue_trend", "health_score", "scenario_comparison"]},
                "period": {"type": "string"}
            },
            "required": ["chart_type", "data_source"]
        }
    }
]
```

> [!IMPORTANT]
> **Every single tool queries the REAL database.** When the agent calls `generate_pnl(period="2026-09")`, the tool runs an actual SQL query against the `income_entries` and `expenses` tables for that tenant. No fake data, no hallucination.

---

## Part 9: Embeddable Widget SDK

### How External SME Platforms Integrate

**Step 1:** Business signs up on FinPilot, gets an API key from Settings.

**Step 2:** They paste this snippet into their website:

```html
<!-- FinPilot Widget -->
<script>
  window.FinPilotConfig = {
    api_key: "fp_live_abc123...",
    theme: "dark",              // "dark" | "light" | "auto"
    position: "bottom-right",   // "bottom-right" | "bottom-left"
    brand_color: "#6366f1",
    welcome_message: "Hi! I'm your AI finance assistant. Ask me anything about your business finances.",
    user: {                     // Optional: pass logged-in user context
      id: "user_123",
      name: "John Doe",
      email: "john@sme.com"
    }
  };
  (function(d,t){var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
  g.src="https://cdn.finpilot.ai/sdk/v1/loader.js";g.async=true;
  s.parentNode.insertBefore(g,s);}(document,"script"));
</script>
```

**Step 3:** A floating chat button appears. When clicked, the FinPilot agent opens with full SME finance capabilities.

### Widget Architecture

```
Host Website DOM
│
├── loader.js (2KB) — Loaded async, creates iframe
│
└── <div id="finpilot-root" style="position:fixed;bottom:20px;right:20px;z-index:2147483647">
    └── <iframe src="https://cdn.finpilot.ai/sdk/v1/widget.html?key=fp_live_abc123">
        │
        │  ── Inside iframe (isolated DOM + CSS) ──
        │
        ├── Floating Action Button (collapsed state)
        │   └── FinPilot logo, pulse animation
        │
        └── Chat Window (expanded state)
            ├── Header (FinPilot branding + minimize button)
            ├── Message Stream (scrollable)
            │   ├── Agent messages (with charts, tables, alerts)
            │   └── User messages
            ├── Quick Action Buttons
            │   └── [📊 Analyze] [💰 Cash Flow] [🏦 Find Loans] [📋 Invoices]
            └── Input Bar (text input + send button)
    
    Communication: iframe ↔ parent via postMessage (resize, close)
    Backend calls: iframe → HTTPS SSE → /api/v1/sdk/message
```

### Why This Matters for the Contest

You can demo TWO things:
1. The full FinPilot Platform (main demo)
2. "And here's how ANY existing SME tool integrates our agent in 30 seconds" (paste the snippet into a blank HTML page → agent works)

This shows **product thinking** + **business scalability** = high Innovation score.

---

## Part 10: Frontend — SME Management Platform (Every Page)

### Page-by-Page Specification

#### 1. Dashboard (`/dashboard`)

```
┌─────────────────────────────────────────────────────────────────────┐
│  FinPilot                    Dashboard    Oct 2026    👤 John  ⚙️   │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│ 📊 Dash  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ 📋 Inv.  │  │ Revenue  │ │ Expenses │ │ Net Cash │ │ Overdue  │  │
│ 💸 Exp.  │  │ ฿95,000  │ │ ฿79,500  │ │ ฿42,500  │ │ ฿37,000  │  │
│ 👥 Clnt. │  │ ↑ 8%     │ │ ↑ 3%     │ │ ↑ 12%    │ │ 3 items  │  │
│ 💰 Inc.  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│ 📈 Cash  │                                                          │
│ 🏦 Loans │  ┌─────────────────────────────────────────────────────┐ │
│ 📑 Rpts. │  │        Cash Flow — Last 6 Months                    │ │
│ ⚙️ Sett. │  │  ฿100k ┤  📈 Income                                │ │
│          │  │   ฿80k ┤  📉 Expenses                              │ │
│          │  │   ฿60k ┤     ═══════════════                        │ │
│          │  │   ฿40k ┤                                            │ │
│          │  │        └─── May Jun Jul Aug Sep Oct                  │ │
│          │  └─────────────────────────────────────────────────────┘ │
│          │                                                          │
│          │  ┌────────────────────┐  ┌────────────────────────────┐ │
│          │  │ Expense Breakdown  │  │ ⚠️ Alerts                  │ │
│          │  │    🍩 Donut Chart  │  │ 🔴 Cash low in 18 days    │ │
│          │  │  Rent 19%          │  │ 🟡 VAT due Oct 31         │ │
│          │  │  Staff 23%         │  │ 🟡 INV-2024 overdue 31d   │ │
│          │  │  COGS 48%          │  │ 🟢 Revenue up 8% MoM      │ │
│          │  │  Other 10%         │  │                            │ │
│          │  └────────────────────┘  └────────────────────────────┘ │
│          │                                                          │
│          │  ┌─── 🤖 FinPilot Agent ─────────────────────────────┐ │
│          │  │  Floating button at bottom-right OR sidebar panel  │ │
│          │  │  Opens the full chat interface                     │ │
│          │  └───────────────────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────────────────┘
```

**Data Source:** `GET /api/v1/dashboard/summary` + `/cashflow-chart` + `/expense-breakdown` + `/alerts`

#### 2. Invoices (`/invoices`)

| Element | Details |
|---------|---------|
| **Table Columns** | Invoice #, Client, Amount, Issue Date, Due Date, Status, Actions |
| **Status Badges** | Draft (gray), Sent (blue), Paid (green), Overdue (red) |
| **Filters** | Status dropdown, Client dropdown, Date range picker |
| **Actions** | View, Edit, Mark as Paid, Download PDF, Delete (draft only) |
| **Create Invoice** | Form: Client selector, line items (description, qty, unit price), tax %, notes, issue/due dates |
| **Auto-calculation** | Subtotal, tax, total computed in real-time as line items change |

#### 3. Expenses (`/expenses`)

| Element | Details |
|---------|---------|
| **Table Columns** | Date, Vendor, Category, Amount, Payment Method, Tax Deductible? |
| **Categories** | Rent, Payroll, COGS/Supplies, Utilities, Marketing, Transport, Insurance, Loan Payment, Other |
| **Add Expense** | Form: vendor, amount, date, category (dropdown), payment method, description, receipt upload, deductible toggle |
| **Summary Cards** | Total this month, vs last month %, top spending category |

#### 4. Income (`/income`)

| Element | Details |
|---------|---------|
| **Table Columns** | Date, Source, Category, Amount, Recurring?, Description |
| **Categories** | Sales Revenue, Service Revenue, Interest, Refund, Other |
| **Add Income** | Form: source, amount, date, category, recurring toggle (weekly/monthly), description |
| **Note** | Paid invoices auto-create income entries |

#### 5. Clients (`/clients`)

| Element | Details |
|---------|---------|
| **Table Columns** | Name, Email, Phone, Total Invoiced, Outstanding, Payment Score |
| **Client Detail** | Contact info + full invoice history + payment behavior analysis |
| **Payment Score** | Auto-calculated: avg days to pay, % on-time, reliability grade (A-F) |

#### 6. Cash Flow Forecast (`/cashflow`)

| Element | Details |
|---------|---------|
| **Main Chart** | 90-day projection line chart with confidence bands (best/expected/worst) |
| **Alerts Panel** | Any projected cash shortfalls highlighted with date and amount |
| **What-If Panel** | "Add a scenario" → dropdowns for type, amount, date → reruns forecast |
| **Runway Indicator** | "At current burn rate, you have X.X months of runway" |

#### 7. Financing Marketplace (`/financing`)

| Element | Details |
|---------|---------|
| **Business Profile Card** | Summary of your business profile used for matching |
| **Match Button** | "Find My Best Options" → calls `/api/v1/financing/match` |
| **Results Cards** | Ranked financing products with match score, APR, max amount, requirements |
| **Gap Analysis** | For each product: what you meet ✅, what's missing ❌, how to fix it |

#### 8. Reports (`/reports`)

| Element | Details |
|---------|---------|
| **P&L Statement** | Generated from actual data, formatted table |
| **Health Score** | Radial gauge (0-100) with breakdown radar chart |
| **Period Comparison** | Side-by-side months |
| **Export** | Download PDF button (banker-ready format) |

#### 9. Settings (`/settings`)

| Element | Details |
|---------|---------|
| **Business Profile** | Company name, industry, country, currency, safety buffer |
| **API Keys** | Generate, view (prefix only), revoke keys for widget integration |
| **Widget Preview** | Live preview of your embeddable widget |
| **Integration Code** | Copy-paste snippet for embedding in other sites |

---

## Part 11: Security & Compliance Framework

### Architecture-Level Security

```
                     User Request
                         │
                    ┌────▼─────────────────┐
                    │  1. RATE LIMITER       │  100 req/min per tenant
                    └────┬─────────────────┘
                         │
                    ┌────▼─────────────────┐
                    │  2. JWT AUTH           │  Verify token, extract tenant_id
                    └────┬─────────────────┘
                         │
                    ┌────▼─────────────────┐
                    │  3. TENANT CONTEXT    │  Set PostgreSQL RLS variable
                    └────┬─────────────────┘
                         │
                    ┌────▼─────────────────┐
                    │  4. INPUT FILTER      │  Block prompt injection attempts
                    │     (Agent only)      │  Regex patterns + deny list
                    └────┬─────────────────┘
                         │
                    ┌────▼─────────────────┐
                    │  5. PII MASKER        │  Mask account #, SSN, etc.
                    │     (Agent only)      │  before sending to Gemini
                    └────┬─────────────────┘
                         │
                    ┌────▼─────────────────┐
                    │  6. BUSINESS LOGIC    │  CRUD routes OR Agent engine
                    └────┬─────────────────┘
                         │
                    ┌────▼─────────────────┐
                    │  7. OUTPUT FILTER     │  Add disclaimers, block
                    │     (Agent only)      │  unauthorized advice
                    └────┬─────────────────┘
                         │
                    ┌────▼─────────────────┐
                    │  8. AUDIT LOGGER      │  Log everything to audit_logs
                    └────┬─────────────────┘
                         │
                         ▼
                      Response
```

### Permission Tiers (Detailed)

| Tier | Tools | Agent Behavior | UI Indicator |
|------|-------|---------------|--------------|
| **T1: Autonomous** | `get_cash_position`, `forecast_cashflow`, `generate_pnl`, `calculate_health_score`, `get_financial_ratios`, `get_invoice_summary`, `get_overdue_invoices`, `match_financing_options`, `check_loan_eligibility`, `estimate_tax_obligations`, `get_compliance_calendar`, `find_tax_deductions`, `generate_chart`, `compare_periods`, `analyze_client_payment_behavior`, `get_business_profile` | Executes immediately, returns result | 🟢 |
| **T2: Supervised** | `draft_payment_reminder`, `run_what_if_scenario` (with side effects) | Executes but flags: "I've drafted this — please review before sending" | 🟡 + Review button |
| **T3: Restricted** | Any money movement, sending communications, modifying tax filings, sharing data externally | Agent explains what the user should do manually, provides instructions | 🔴 + "Manual action required" |

---

## Part 12: Deployment & Infrastructure

### For Contest (Simple)

```
┌────────────────────────────────────────────┐
│              LOCAL / DEMO SETUP             │
│                                             │
│  docker-compose up                          │
│  ├── postgres:16 (port 5432)               │
│  ├── backend (FastAPI, port 8000)          │
│  └── frontend (Next.js, port 3000)         │
│                                             │
│  Widget: Served from backend /static/sdk/  │
└────────────────────────────────────────────┘
```

### For Cloud Deploy (Free Tiers)

| Service | Platform | Cost |
|---------|----------|------|
| Database | Supabase (free tier: 500MB) or Neon | $0 |
| Backend | Railway or Render (free tier) | $0 |
| Frontend | Vercel (free tier) | $0 |
| Widget CDN | Vercel Edge or Cloudflare Pages | $0 |

### Docker Compose (Local Development)

```yaml
version: "3.9"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_DB: finpilot
      POSTGRES_USER: finpilot
      POSTGRES_PASSWORD: finpilot_dev
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]

  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      DATABASE_URL: postgresql://finpilot:finpilot_dev@db:5432/finpilot
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
    depends_on: [db]
    volumes: ["./backend:/app"]
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    depends_on: [backend]
    volumes: ["./frontend:/app"]
    command: npm run dev

volumes:
  pgdata:
```

---

## Part 13: Build Plan (Day-by-Day)

> [!WARNING]
> You have **4 days** (Oct 16–20). This plan is aggressive but achievable with focused execution.

### Day 1 (Oct 17): Foundation — Backend + Database + Auth

| Time | Task | Deliverable |
|------|------|-------------|
| 2h | Project setup: repo, Docker, env files, directory structure | Repo running locally |
| 2h | Database: All models in SQLAlchemy, Alembic migrations, seed data | All tables created |
| 1h | Auth: Register/Login/Me endpoints + JWT | Auth working |
| 1h | Seed: Load `financing_products.json` and `industry_benchmarks.json` | Reference data ready |
| 2h | CRUD routes: Invoices (create, list, detail, update status) | Invoice API working |
| 1h | CRUD routes: Expenses + Income | Expense/Income API working |
| 1h | CRUD routes: Clients + Dashboard summary | Dashboard data ready |

**End of Day 1:** Complete backend API (minus agent), all database tables, auth, CRUD for all entities.

---

### Day 2 (Oct 18): Agent Engine + Tools

| Time | Task | Deliverable |
|------|------|-------------|
| 2h | Agent engine: Orchestrator with Gemini function calling | Basic agent chatting |
| 1h | Tool: `get_cash_position` + `forecast_cashflow` (Prophet) | Cash flow tools working |
| 1h | Tool: `generate_pnl` + `calculate_health_score` + `get_financial_ratios` | Analysis tools working |
| 1h | Tool: `match_financing_options` + `check_loan_eligibility` | Loan matching working |
| 1h | Tool: `get_invoice_summary` + `get_overdue_invoices` + `draft_payment_reminder` | Invoice tools working |
| 1h | Tool: `estimate_tax_obligations` + `get_compliance_calendar` | Tax tools working |
| 1h | Tool: `generate_chart` (matplotlib → base64 image) | Charts in agent responses |
| 1h | Guardrails: Input filter + output filter + PII masker + permission gate | Security layer active |
| 1h | Agent API routes: `POST /agent/chat` + `WS /agent/stream` | Agent accessible via API |

**End of Day 2:** Full agent engine working with all tools, connected to real database, security guardrails active.

---

### Day 3 (Oct 19): Frontend + Widget + Integration

| Time | Task | Deliverable |
|------|------|-------------|
| 1h | Next.js setup: Tailwind, shadcn/ui, layout with sidebar | App shell ready |
| 1h | Auth pages: Login + Register (connecting to backend) | Auth flow complete |
| 2h | Dashboard page: KPI cards + cash flow chart + expense donut + alerts | Dashboard live |
| 1.5h | Invoice pages: List + Create + Detail (with PDF download) | Invoice management done |
| 1h | Expense pages: List + Add expense form | Expense tracking done |
| 0.5h | Client pages: List + Detail | Client management done |
| 1h | Agent Chat Panel: Sliding sidebar with chat UI, streaming messages, chart rendering | Agent embedded in platform |
| 1h | Cash Flow page: Forecast chart + What-If panel | Cash flow view done |
| 0.5h | Financing page: Match results display | Loan marketplace done |
| 0.5h | Reports page: P&L view + Health Score gauge + PDF export | Reports done |
| 1h | Embeddable widget: `loader.js` + `widget.html` + iframe chat | Widget SDK ready |

**End of Day 3:** Complete frontend application with all pages, agent embedded, widget SDK working.

---

### Day 4 (Oct 20 — DEADLINE DAY): Testing, Docs, Demo, Submit

| Time | Task | Deliverable |
|------|------|-------------|
| 1h | Seed realistic demo data: 6 months of income, expenses, invoices, 5 clients | Rich demo environment |
| 1h | End-to-end testing: Run all 3 demo scenarios through the agent | Agent handles real queries |
| 1h | Technical Documentation: Architecture diagram, algorithm descriptions, security design | `docs/technical_documentation.md` |
| 1h | Security Self-Assessment Report: Tiers, risk matrix, mitigations | `docs/security_self_assessment.md` |
| 1h | Presentation Deck: 10 slides, 10 min max | `docs/presentation_deck.pptx` |
| 1h | Demo Video: Screen record the 3 scenarios (≤5 min) | Video file ready |
| 1h | README: Setup instructions, deployment guide, test cases | `README.md` complete |
| 1h | Final review + push to GitHub + SUBMIT on platform | ✅ SUBMITTED |

**Submit before 23:59 Beijing Time (UTC+8)!**

---

## Part 14: Contest Submission Mapping

### Submission Checklist → Your Deliverables

| # | Required Item | Your Deliverable | Where |
|---|---------------|------------------|-------|
| 01 | Technical Documentation | System architecture, multi-agent engine, tool specs, DB schema, security design | `docs/technical_documentation.md` |
| 02 | Presentation Deck (≤10 min) | 10 slides: Problem → Solution → Demo → Architecture → Security → Business Model | `docs/presentation_deck.pptx` |
| 03 | Demo Video (≤5 min, optional) | Screen recording of 3 demo scenarios through the platform | `docs/demo_video.mp4` |
| 04 | Source Code | Full repo with README, deployment instructions (Docker), test cases | GitHub repo |
| 05 | Security Self-Assessment | Permission tiers, risk matrix, PII handling, audit logs | `docs/security_self_assessment.md` |
| 06 | Execution Evidence | Agent operation logs (audit_logs table export) + demo video | Exported JSON + video |

### Scoring → Feature Mapping

```
TASK COMPLETION (40%)
═══════════════════════
✅ Financing-option matching  → Pillar 2 + /financing page + match_financing_options tool
✅ Cash-flow management       → Pillar 1 + /cashflow page + forecast_cashflow tool + alerts
✅ Business financial analysis → Pillar 3 + /reports page + generate_pnl + health_score tools
✅ Bonus: Invoice tracking     → Pillar 4 + /invoices page + invoice tools
✅ Bonus: Tax estimation       → Pillar 5 + tax tools

SECURITY & COMPLIANCE (30%)
════════════════════════════
✅ Permission tiers    → 3-tier model (T1/T2/T3) in permission_gate.py
✅ PII protection      → pii_masker.py (masks before LLM, unmasks after)
✅ Prompt injection     → input_filter.py (regex + deny patterns)
✅ Audit trail          → audit_logs table + audit_logger.py
✅ Data isolation       → PostgreSQL RLS + tenant context middleware
✅ Risk documentation   → docs/security_self_assessment.md
✅ Disclaimers          → output_filter.py adds "not financial advice"

INNOVATION & INTERACTION (30%)
═══════════════════════════════
✅ Multi-agent architecture → Not a ChatGPT wrapper
✅ Embeddable SDK/widget    → Any platform can integrate in 30 seconds
✅ SaaS business model      → Free → Paid subscription story
✅ Proactive alerts          → Agent pushes alerts, doesn't wait to be asked
✅ Visual charts in chat     → generate_chart tool → inline images
✅ What-If simulator         → Scenario planning for business decisions
✅ Real data grounding       → Agent queries actual DB, not hallucinated data
✅ Industry benchmarking     → Health score compared to industry averages
✅ Premium UI                → shadcn/ui + charts + dark mode dashboard
```

---

## Quick Reference: Environment Variables

```bash
# .env.example
DATABASE_URL=postgresql://finpilot:finpilot_dev@localhost:5432/finpilot
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here_generate_with_openssl
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost:3000,https://your-domain.com
WIDGET_CDN_URL=http://localhost:8000/static/sdk
```

---

> [!TIP]
> **The single most important thing:** When judges see your demo, they should see the agent analyzing REAL data from the management platform — not fake hardcoded responses. The connection between "I created this invoice in the platform UI" and "the agent just told me I have ฿37,000 in overdue invoices" is the **wow moment** that wins.
