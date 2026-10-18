# FinPilot Production Agent - Setup Guide

## 🎯 Understanding Database Configuration

### The Key Concept: Agent Connects to YOUR Existing Database

**IMPORTANT:** The FinPilot agent does NOT have its own separate database. Instead, it **connects directly to the same database as your demo SME site**.

```
┌─────────────────┐
│  Demo SME Site  │ ────┐
│ (React + API)   │     │
└─────────────────┘     │
                        ▼
                   ┌─────────────────┐
                   │  PostgreSQL DB  │ ← Both systems share this
                   │  (invoices,     │
                   │   expenses,     │
                   │   sales, etc.)  │
                   └─────────────────┘
                        ▲
┌─────────────────┐     │
│  FinPilot Agent │ ────┘
│  (AI Analyst)   │
└─────────────────┘
```

### Why This Design?

1. **Real Data**: Agent analyzes actual financial records from your SME system
2. **Zero Duplication**: No need to sync data between systems
3. **Real-Time**: Agent sees changes as soon as they're saved to the database
4. **Multi-Tenant Ready**: One agent can serve multiple SME sites by filtering on `tenant_id`

---

## 📋 Step-by-Step Setup

### 1. Find Your Demo SME Site's Database URL

Your demo SME site (`finpilot/backend/`) likely has a database connection string in its `.env` file.

**Check here:**
```bash
cat /media/somoy/Backup/Documents/China/finpilot/backend/.env | grep DATABASE_URL
```

**Example output:**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/demo_sme_db
```

### 2. Configure FinPilot Agent to Use the SAME Database

**Edit:** `/media/somoy/Backup/Documents/China/finpilot-agent/.env`

**Change this line:**
```bash
# Replace this testing value:
DATABASE_URL=sqlite+aiosqlite:///./test_sme.db

# With your actual demo database URL (add +asyncpg for async):
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/demo_sme_db
```

**Connection String Formats:**
- **PostgreSQL**: `postgresql+asyncpg://user:password@host:5432/database`
- **MySQL**: `mysql+aiomysql://user:password@host:3306/database`
- **SQLite** (testing only): `sqlite+aiosqlite:///./database.db`

### 3. Verify Database Tables

The agent needs these tables to analyze finances:
- `invoices` (or `sales`)
- `expenses`
- `bank_accounts` (or `transactions`)
- `customers`
- Optional: `inventory`, `payments`, `vendors`

**Check what tables exist:**
```bash
# For PostgreSQL:
psql postgresql://postgres:password@localhost:5432/demo_sme_db -c "\dt"

# Or check your SME site's schema files/migrations
```

### 4. Configure Which Tables the Agent Can Access

**Edit:** `.env` → `ALLOWED_TABLES` line

```bash
# List only the tables that contain financial data
ALLOWED_TABLES=invoices,expenses,bank_accounts,customers,sales,payments
```

The agent will **only read** these tables. It cannot:
- Write to any table
- Drop/modify schema
- Access tables not in this list

### 5. Get Anthropic API Key

**Required for live LLM responses.**

1. Go to: https://console.anthropic.com/
2. Create an account (or sign in)
3. Navigate to: **API Keys** → **Create Key**
4. Copy your key (starts with `sk-ant-...`)

**Edit:** `.env` → Replace placeholder:
```bash
ANTHROPIC_API_KEY=sk-ant-your-real-key-here  # Replace this
```

### 6. Generate Security Secrets

```bash
# Generate salt
openssl rand -hex 32

# Generate HMAC secret
openssl rand -hex 32
```

**Edit:** `.env` → Paste the generated values:
```bash
API_KEY_SALT=<paste-first-generated-value>
AUDIT_HMAC_SECRET=<paste-second-generated-value>
```

---

## 🚀 Running the Agent

### Install Dependencies

```bash
cd /media/somoy/Backup/Documents/China/finpilot-agent
pip install -r requirements.txt
```

### Start the Server

```bash
python -m app.main
```

**Expected output:**
```
============================================================
FinPilot Production Started
============================================================
Database: postgresql
Tables discovered: 6
  • invoices (12 columns)
  • expenses (10 columns)
  • bank_accounts (8 columns)
  • customers (15 columns)
  • sales (11 columns)
  • payments (7 columns)
============================================================

INFO:     Uvicorn running on http://0.0.0.0:8100
```

**If you see this, it's working!** The agent successfully:
1. Connected to your database
2. Introspected the schema
3. Started the API server

---

## 🔗 Embedding in Your Demo SME Site

### Option 1: Direct Embed (Simplest)

**Add to:** `finpilot/frontend/index.html` (before `</body>`)

```html
<script src="http://localhost:8100/sdk/loader.js" 
        data-api-key="YOUR_API_KEY_HERE" 
        data-theme="auto"></script>
```

### Option 2: React Integration

**Add to:** `finpilot/frontend/src/App.jsx`

```javascript
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'http://localhost:8100/sdk/loader.js';
    script.dataset.apiKey = 'YOUR_API_KEY_HERE';
    script.dataset.theme = 'auto';
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="app">
      {/* Your existing SME site content */}
    </div>
  );
}
```

### Getting Your API Key

For now, use a test key:
```
tenant_a
```

(In production, you'd generate real API keys via an admin endpoint)

---

## 🧪 Testing

### Test Schema Introspection

```bash
python verify_db.py
```

**Expected:**
```
Test schema created.
Dialect: sqlite
Tables discovered: ['bank_accounts', 'expenses', 'invoices']
✅ Introspection: tenant_id detected on all 3 tables
✅ Safe query returned: [{'customer_name': 'ABC Corp', 'amount': 150000}]
✅ Tenant B sees 0 rows (isolation working)
✅ Injection/write attempts blocked: 7/7
==================================================
ALL DB ENGINE CHECKS PASSED
==================================================
```

### Test API Endpoints

```bash
# Health check
curl http://localhost:8100/health

# Schema info
curl http://localhost:8100/schema

# Chat (requires API key)
curl -X POST http://localhost:8100/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"How is my cash flow?","tenant_id":"tenant_a"}'
```

---

## 🔐 Security Features

### Read-Only Database Access

The agent **cannot** modify your data:
- Only `SELECT` queries allowed
- `INSERT`, `UPDATE`, `DELETE`, `DROP` all blocked
- Validated before execution

### Multi-Tenant Isolation

If you embed the agent on multiple SME sites:
- Each gets a unique `tenant_id`
- Agent automatically filters: `WHERE tenant_id = 'site_a'`
- Site A cannot see Site B's data (enforced at SQL level)

### SQL Injection Protection

All queries are:
- Parameterized (`:param` placeholders)
- Validated against forbidden keywords
- Executed with row limits (max 1000 rows)

---

## ❓ FAQ

**Q: Do I need a separate database for the agent?**  
**A:** No! The agent connects to your existing demo SME database.

**Q: Will the agent modify my data?**  
**A:** No. The agent is read-only. It can only `SELECT` data, never write.

**Q: What if my database doesn't have `tenant_id` columns?**  
**A:** That's fine. Multi-tenant isolation only applies if you embed the agent on multiple sites. For a single site, `tenant_id` is optional.

**Q: Can I use SQLite for production?**  
**A:** SQLite works but is limited to single-machine deployments. PostgreSQL is recommended for production.

**Q: What if I don't have an Anthropic API key?**  
**A:** The agent requires a real API key to work. Get one free at https://console.anthropic.com/

**Q: How much does Anthropic API cost?**  
**A:** Claude Sonnet 3.5 (the model used) costs ~$3 per million input tokens, $15 per million output tokens. A typical financial query costs $0.01-0.05.

---

## 📂 Project Structure

```
finpilot-agent/
├── .env                    # Your configuration (database, API key)
├── .env.example           # Template with documentation
├── config.py              # Pydantic settings with validation
├── requirements.txt       # Python dependencies
│
├── app/
│   ├── main.py           # FastAPI server (run this)
│   ├── core/
│   │   └── db.py         # Database engine + schema introspection
│   └── agent/
│       ├── llm.py        # Anthropic Claude integration
│       ├── tools.py      # 6 financial analysis tools
│       └── orchestrator.py  # CFO-level prompt + execution
│
└── sdk/
    ├── loader.js         # Auto-theme detector + iframe injector
    ├── widget.html       # Chat UI
    └── widget.js         # SSE client + markdown renderer
```

---

## ✅ Quick Checklist

Before embedding the agent:

- [ ] `.env` configured with real `DATABASE_URL`
- [ ] `.env` has valid `ANTHROPIC_API_KEY`
- [ ] Security secrets generated (`API_KEY_SALT`, `AUDIT_HMAC_SECRET`)
- [ ] `ALLOWED_TABLES` lists your financial tables
- [ ] `CORS_ORIGINS` includes your SME site domain
- [ ] Agent server starts without errors
- [ ] `/health` endpoint returns success
- [ ] `/schema` shows your tables

Then add the one-line embed script to your SME site!

---

## 🆘 Troubleshooting

**"Field required" errors on startup:**
→ Check `.env` file exists and has all required fields

**"Unsupported DATABASE_URL scheme":**
→ URL must start with `postgresql`, `mysql`, or `sqlite`

**"No module named 'asyncpg'":**
→ Run: `pip install asyncpg` (or `aiomysql` for MySQL)

**"Connection refused" from widget:**
→ Ensure agent server is running on port 8100

**"Invalid API key":**
→ Check `ANTHROPIC_API_KEY` in `.env` starts with `sk-ant-`

**Widget doesn't appear:**
→ Check browser console for errors. Verify API key in embed script.

---

## 📚 Next Steps

1. **Configure** `.env` with your demo database URL
2. **Start** the agent: `python -m app.main`
3. **Verify** `/health` and `/schema` endpoints work
4. **Embed** SDK in your demo SME site
5. **Test** asking: "How is my cash flow?"

The agent will read real data from your database and provide CFO-level financial analysis!
