# FinPilot Production Deployment Guide

## Database Requirements

**⚠️ SQLite is for local testing only. Production REQUIRES PostgreSQL or MySQL.**

SQLite limitations:
- No concurrent writes (agent + SME site = conflicts)
- No network access (can't connect from multiple services)
- Limited performance with >100K rows
- No proper read-only role enforcement

### Production Setup

1. **Create read-only database role**

```sql
-- PostgreSQL
CREATE ROLE finpilot_ro LOGIN PASSWORD 'your-secure-password';
GRANT CONNECT ON DATABASE your_sme_db TO finpilot_ro;
GRANT USAGE ON SCHEMA public TO finpilot_ro;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO finpilot_ro;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO finpilot_ro;

-- MySQL
CREATE USER 'finpilot_ro'@'%' IDENTIFIED BY 'your-secure-password';
GRANT SELECT ON your_sme_db.* TO 'finpilot_ro'@'%';
FLUSH PRIVILEGES;
```

2. **Configure .env**

```bash
cp .env.example .env

# Edit .env with your production values:
DATABASE_URL=postgresql+asyncpg://finpilot_ro:password@db-host:5432/your_sme_db
ANTHROPIC_API_KEY=sk-ant-api-00-...
API_KEY_SALT=$(openssl rand -hex 32)
AUDIT_HMAC_SECRET=$(openssl rand -hex 32)
AGENT_API_KEY=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
CORS_ORIGINS=["https://yoursme.com","https://www.yoursme.com"]
```

3. **Security checklist before deploying**

- [ ] DATABASE_URL points to production PostgreSQL/MySQL (not SQLite)
- [ ] Read-only database role created and tested
- [ ] All secrets in `.env` are generated (no empty strings or placeholders)
- [ ] CORS_ORIGINS restricted to your actual domain (not `*`)
- [ ] `.env` is in `.gitignore` (never commit secrets)
- [ ] AGENT_API_KEY is strong (32+ characters, random)
- [ ] Anthropic API key rotated if ever committed to git

4. **Deploy**

```bash
# Install dependencies
pip install -r requirements.txt

# Test connection
python -c "from app.core.db import get_db_engine; get_db_engine()"

# Run with production server
uvicorn app.main:app --host 0.0.0.0 --port 8100 --workers 4
```

## Environment Variable Precedence

Production environment variables beat `.env` file values. This prevents a local `.env` from overriding container-injected secrets.

When deploying to:
- **Docker**: Pass secrets via `docker run -e DATABASE_URL=...` or compose `environment:`
- **Kubernetes**: Use ConfigMap + Secret, never bake secrets into images
- **Cloud platforms**: Use their native secrets manager (AWS Secrets, GCP Secret Manager, etc.)

## SDK Integration

The browser SDK needs the AGENT_API_KEY. Update `sdk/loader.js`:

```js
FinPilotSDK.init({
  apiUrl: 'https://your-api-domain.com',
  apiKey: 'YOUR_AGENT_API_KEY_HERE',  // Same as .env AGENT_API_KEY
  theme: 'light'
});
```

**Security**: The SDK runs client-side, so `AGENT_API_KEY` is visible to users. This is a shared key for basic protection, not per-user auth. For multi-tenant production, implement per-user JWT tokens instead.
