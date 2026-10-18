# FinPilot Agent - Complete Implementation Guide

## 🎯 What You Asked For

1. ✅ **Admin Control Panel** - Manage which users/tenants access your agent
2. ✅ **Fixed API Key Issues** - Auto-detect real keys, no more "invalid API key"
3. ✅ **Real Agent Usage** - Production-ready with proper CFO-style responses
4. ✅ **SME Site Integration** - Step-by-step guide for any website

---

## 🚀 Quick Start (5 Minutes)

```bash
cd finpilot-agent

# 1. Install dependencies
pip install -r requirements.txt

# 2. Seed demo data (prints your API key)
python seed.py

# 3. Start the agent server
python main.py
```

**Server running at:** `http://localhost:8100`

---

## 🔑 Getting Your API Key

After running `python seed.py`, you'll see:

```
============================================================
Seed completed successfully!
============================================================
Tenant ID:   73ddb7f5-e8f5-451a-ad0f-f2738b77caa4
Tenant Name: Shenzhen Tech Hardware Co., Ltd
API Key:     fp_live_f407b24b5fcf1fc17c717429793a9ca4
Key Prefix:  fp_live_f407b24b
============================================================

Save this API key - it will only be shown once!
```

**IMPORTANT:** Copy and save that `fp_live_xxx` API key immediately!

---

## 👨‍💼 Admin Control Panel

### Access Admin Panel

Open in browser: **`http://localhost:8100/sdk/admin.html`**

**First time setup:**
1. Panel will prompt for admin API key
2. Paste the API key from seed.py output
3. It's saved in localStorage for future visits

### Admin Features

**Dashboard:**
- Total tenants count
- Active API keys
- Today's request metrics

**Tenant Management:**
- View all tenants
- Create new tenants
- Generate API keys for each tenant
- Enable/disable access
- Monitor usage per tenant

**API Key Management:**
- Generate new keys for any tenant
- Set rate limits (requests/minute)
- Revoke keys
- Track last used timestamp

### Creating a New Tenant (Customer)

1. Click **"+ Create New Tenant"** in admin panel
2. Fill in:
   - Company Name (required)
   - Domain (optional, e.g., `customer-site.com`)
   - Industry (e.g., "Electronics Manufacturing")
   - Country (CN for China)
   - Currency (CNY for Chinese Yuan)
3. Click **"Create Tenant"**
4. Click **"Generate API Key"** for the new tenant
5. **SAVE THE API KEY** - it's only shown once!
6. Give this API key to your customer

---

## 🌐 Integrating Into ANY SME Website

### Method 1: Single Line Embed (Easiest)

Add this **one line** before `</body>` in your HTML:

```html
<script src="http://localhost:8100/sdk/loader.js" data-api-key="YOUR_API_KEY_HERE"></script>
```

**Replace** `YOUR_API_KEY_HERE` with the actual key from seed.py or admin panel.

**Example:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>My SME Dashboard</title>
</head>
<body>
  <h1>Welcome to My Company ERP</h1>
  
  <!-- Your existing content -->
  
  <!-- FinPilot Agent - ADD THIS LINE -->
  <script src="http://localhost:8100/sdk/loader.js" data-api-key="fp_live_f407b24b5fcf1fc17c717429793a9ca4"></script>
</body>
</html>
```

**That's it!** The chat widget appears in bottom-right corner.

### Method 2: React/Vue/Angular Integration

```javascript
// In your React component or main.js
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'http://localhost:8100/sdk/loader.js';
  script.dataset.apiKey = 'fp_live_f407b24b5fcf1fc17c717429793a9ca4';
  document.body.appendChild(script);
  
  return () => document.body.removeChild(script);
}, []);
```

### Method 3: WordPress/PHP

Add to your `footer.php` or via "Custom HTML" widget:

```php
<script src="http://localhost:8100/sdk/loader.js" data-api-key="<?php echo get_option('finpilot_api_key'); ?>"></script>
```

### Method 4: Test Demo Page

Open: **`http://localhost:8100/sdk/demo-host.html`**

This shows a complete example SME dashboard with the agent embedded.

---

## 🔧 Fixing "Invalid API Key" Error

### Problem
Demo page shows "invalid API key" or widget doesn't load.

### Solutions

**1. Use the REAL API key from seed.py**

Don't use the hardcoded demo key. Always copy the actual key printed by `python seed.py`.

**2. Check your API key format**

Valid format: `fp_live_` followed by 32 hex characters
Example: `fp_live_f407b24b5fcf1fc17c717429793a9ca4`

**3. Verify server is running**

```bash
curl http://localhost:8100/health
# Should return: {"status":"healthy","version":"1.0.0"}
```

**4. Test API key directly**

```bash
curl -X POST http://localhost:8100/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY_HERE" \
  -d '{"message":"Test"}'
```

If you get `401 Unauthorized`, the key is wrong. Re-run `python seed.py` to get a fresh key.

**5. Database reset (if all else fails)**

```bash
rm finpilot_agent.db
python seed.py  # Get new API key
python main.py
```

---

## 📊 Using as a Real Agent

### What Questions Can Users Ask?

**Cash Flow & Liquidity:**
- "How is my cash flow?"
- "How many months of runway do I have?"
- "When will I run out of cash?"
- "What if a customer pays early?"

**Financing & Loans:**
- "Can I get a WeBank loan?"
- "What's my pre-qualification score?"
- "How much can I borrow?"
- "What financing options do I have?"

**Financial Health:**
- "What are my profit margins?"
- "How does my business compare to competitors?"
- "What's my financial health score?"
- "Calculate my working capital ratio"

**Accounts Receivable:**
- "Show me overdue invoices"
- "Which customers are high risk?"
- "Draft a collection email for ABC Corp"
- "What's my DSO?"

**Tax & Compliance:**
- "Estimate my tax liability"
- "What's my VAT balance?"
- "When are my tax deadlines?"
- "Can I use the SME preferential rate?"

**Expense Optimization:**
- "Where can I cut costs?"
- "Are there any spending anomalies?"
- "Show my recurring expenses"
- "What's my unit economics?"

### Response Quality

The agent provides **CFO-level responses** with:
- ✅ Executive summary (bottom line first)
- ✅ Markdown tables with currency formatting
- ✅ Metric pills for critical KPIs (e.g., **Cash Runway: 2.6 Mo**)
- ✅ Specific action steps with dates and amounts
- ❌ No conversational fluff ("As an AI...")
- ❌ No generic advice

### Real-Time Status Updates

While processing, users see:
- "Thinking & Analyzing Intent..."
- "Verifying Security Guardrails & Tenant Context..."
- "Querying Tenant Database: Fetching Cash Flow Data..."
- "Running Deterministic Forecasting Engine..."
- "Synthesizing Executive Financial Summary..."

---

## 🔒 Security Features (Built-In)

### Multi-Tenant Isolation

✅ **Every query is tenant-scoped** - Tenant A can NEVER see Tenant B's data
✅ **Database row-level security** - All tables have `tenant_id`
✅ **Cross-tenant violations logged** - Attempts trigger security alerts

### 8-Layer Security Pipeline

1. **API Key Auth** - Bcrypt hashed, O(1) prefix lookup
2. **Rate Limiting** - Per-key sliding window (default: 60 req/min)
3. **Prompt Injection Detection** - Blocks jailbreaks, DAN attacks
4. **PII Redaction** - Masks bank cards, tax IDs, phones before LLM
5. **Intent Classification** - Routes to appropriate specialist
6. **Permission Tier Check** - 3 tiers (Autonomous/Supervised/Restricted)
7. **Tenant Scoping Enforcement** - Injects tenant filter on ALL queries
8. **HMAC Audit Logging** - Cryptographically signed trail

### 3-Tier Permissions

**Tier 1 (Autonomous)** - Executes immediately:
- Read data, calculate forecasts, generate reports

**Tier 2 (Supervised)** - Requires human approval:
- Draft collection emails, generate invoices (nothing sent automatically)

**Tier 3 (Restricted)** - Always refused:
- Fund transfers, delete data, schema changes

---

## 📡 API Endpoints (For Advanced Integration)

### Chat API

**Sync (returns complete response):**
```bash
POST /api/v1/chat
Headers:
  X-API-Key: fp_live_xxx
  Content-Type: application/json
Body:
  {"message": "How is my cash flow?"}
```

**Streaming (real-time status via SSE):**
```bash
POST /api/v1/chat/stream
Headers: (same as above)
Body: (same as above)

Returns: Server-Sent Events stream
  data: {"type":"status","message":"Fetching data..."}
  data: {"type":"complete","content":"..."}
```

### Admin API

**Get current tenant info:**
```bash
GET /api/v1/admin/tenants/me
Headers: X-API-Key: fp_live_xxx
```

**Create new tenant:**
```bash
POST /api/v1/admin/tenants
Body: {
  "name": "New SME Corp",
  "domain": "newsme.com",
  "industry": "Manufacturing"
}
```

**Generate API key for tenant:**
```bash
POST /api/v1/admin/tenants/{tenant_id}/keys
Body: {
  "name": "production",
  "rate_limit_per_min": 120
}
```

**Get audit logs:**
```bash
GET /api/v1/admin/audit?limit=100
```

### Data Sync API

**Sync external data (from your ERP):**
```bash
POST /api/v1/sync
Body: {
  "invoices": [
    {
      "invoice_number": "INV-2026-001",
      "customer_name": "ABC Corp",
      "amount": 50000,
      "issue_date": "2026-01-15",
      "due_date": "2026-02-15",
      "status": "pending"
    }
  ],
  "expenses": [
    {
      "category": "Rent",
      "amount": 25000,
      "expense_date": "2026-01-01"
    }
  ]
}
```

This lets you programmatically push financial data from your existing ERP system.

---

## 🏭 Production Deployment

### Step 1: Environment Variables

```bash
cp .env.example .env
nano .env
```

**Critical settings to change:**

```bash
# Security (CHANGE THESE!)
API_KEY_SALT=your-random-32-char-salt-here
AUDIT_HMAC_SECRET=your-random-32-char-secret-here

# LLM (Optional - uses fallback if unset)
ANTHROPIC_API_KEY=sk-ant-xxx

# Database (Use PostgreSQL in production)
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/finpilot

# CORS (Restrict to your domains)
CORS_ORIGINS=["https://yoursme.com","https://app.yoursme.com"]
```

### Step 2: Use PostgreSQL (Production)

```bash
# Install PostgreSQL driver
pip install asyncpg psycopg2-binary

# Update .env
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/finpilot_prod

# Initialize database
python -c "from app.core.db import init_db; import asyncio; asyncio.run(init_db())"
```

### Step 3: Run with Production Server

```bash
# Install gunicorn
pip install gunicorn

# Run with workers
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8100 \
  --access-logfile -
```

### Step 4: Nginx Reverse Proxy

```nginx
server {
    listen 443 ssl;
    server_name finpilot.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:8100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }

    # SSE streaming support
    location /api/v1/chat/stream {
        proxy_pass http://localhost:8100;
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
    }
}
```

### Step 5: SDK URL Update

Update your embed code to use your domain:

```html
<script src="https://finpilot.yourdomain.com/sdk/loader.js" data-api-key="fp_live_xxx"></script>
```

---

## 🧪 Testing Everything Works

### 1. Health Check
```bash
curl http://localhost:8100/health
# Should return: {"status":"healthy","version":"1.0.0"}
```

### 2. Test Chat API
```bash
curl -X POST http://localhost:8100/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: fp_live_f407b24b5fcf1fc17c717429793a9ca4" \
  -d '{"message":"How is my cash flow?"}'
```

Should return structured JSON with CFO-style markdown.

### 3. Test Widget
Open `http://localhost:8100/sdk/demo-host.html` and try asking:
- "How is my cash flow?"
- "Can I get a WeBank loan?"
- "Show overdue invoices"

### 4. Test Admin Panel
Open `http://localhost:8100/sdk/admin.html` and verify you can see tenant info.

### 5. Run Test Suite
```bash
pytest tests/ -v
```

All tests should pass for:
- Multi-tenant isolation
- Security guardrails
- Tool determinism
- Permission enforcement

---

## 📝 Real-World Integration Example

### Scenario: Integrate into Existing React ERP

**File: `src/App.jsx`**

```javascript
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    // Load FinPilot agent
    const script = document.createElement('script');
    script.src = 'http://localhost:8100/sdk/loader.js';
    script.dataset.apiKey = process.env.REACT_APP_FINPILOT_KEY;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="erp-dashboard">
      <h1>My SME Dashboard</h1>
      {/* Your existing ERP content */}
      
      {/* FinPilot widget auto-appears in bottom-right */}
    </div>
  );
}
```

**File: `.env`**
```
REACT_APP_FINPILOT_KEY=fp_live_f407b24b5fcf1fc17c717429793a9ca4
```

---

## ❓ Troubleshooting

### Widget doesn't appear
- Check browser console for errors
- Verify API key is correct
- Ensure server is running on port 8100
- Check CORS settings if on different domain

### "Invalid API Key" error
- Don't use the hardcoded demo key
- Copy the actual key from `python seed.py` output
- Key format must be `fp_live_` + 32 hex chars

### Responses are JSON instead of formatted markdown
- This is the fallback mode (no ANTHROPIC_API_KEY set)
- Add `ANTHROPIC_API_KEY=sk-ant-xxx` to `.env` for better responses
- Fallback mode still works - just shows raw JSON

### Rate limit exceeded
- Default: 60 requests/minute per API key
- Increase in admin panel when generating keys
- Or update `rate_limit_per_min` in database

### Cross-tenant data visible
- **THIS SHOULD NEVER HAPPEN!**
- If it does, it's a critical security bug
- Check `app/security/tenants.py` is being used
- File a bug report immediately

---

## 📚 Additional Resources

**API Documentation:** `http://localhost:8100/docs` (Swagger UI)

**Competition Specs:** Tsinghua PBC + WeBank FinTechathon 2026

**WeBank Weiyedai Info:** https://cloud.webank.com/weiyedai

**Support:** Check `README.md` for full documentation

---

## ✅ You're Ready!

Your FinPilot agent is now:
- ✅ Running on `localhost:8100`
- ✅ Admin panel accessible
- ✅ Embeddable with one line of code
- ✅ Multi-tenant secure
- ✅ Production-ready

**Next steps:**
1. Open admin panel: `http://localhost:8100/sdk/admin.html`
2. Create tenants for your customers
3. Generate API keys for each tenant
4. Embed widget in their SME websites
5. Monitor usage in admin dashboard

**Questions?** All files are in `finpilot-agent/` folder with inline documentation.
