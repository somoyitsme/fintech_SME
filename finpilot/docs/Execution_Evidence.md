# FinPilot: Execution Evidence & Test Verification Report

**Competition:** 2026 Shenzhen International FinTech Competition (FinTechathon)  
**Submission Item:** Execution Evidence (Proof of Functioning Software)  
**Verification Date:** October 17, 2026  
**Environment:** Linux / Python 3.12 / Node.js 18 / FastAPI 0.110+ / React 18

---

## 1. Automated Test Suite Execution (21 / 21 Passed)

Command executed:
```bash
.venv/bin/pytest tests/ -v
```

Execution Output:
```
============================= test session starts ==============================
platform linux -- Python 3.12.3, pytest-9.1.1, pluggy-1.7.0 -- finpilot/backend/.venv/bin/python3
rootdir: finpilot/backend
configfile: pyproject.toml
plugins: asyncio-1.4.0, anyio-4.15.1
collected 21 items

tests/test_agent_tools.py::test_all_20_tools_registered PASSED           [  4%]
tests/test_agent_tools.py::test_tool_get_cash_flow_metrics PASSED        [  9%]
tests/test_agent_tools.py::test_tool_forecast_cash_flow PASSED           [ 14%]
tests/test_agent_tools.py::test_tool_get_overdue_invoices PASSED         [ 19%]
tests/test_agent_tools.py::test_tool_match_financing_options PASSED      [ 23%]
tests/test_agent_tools.py::test_tool_get_financial_health_score PASSED   [ 28%]
tests/test_auth.py::test_health_check PASSED                             [ 33%]
tests/test_auth.py::test_login_demo_admin PASSED                         [ 38%]
tests/test_auth.py::test_auth_me PASSED                                  [ 42%]
tests/test_auth.py::test_create_and_list_api_keys PASSED                 [ 47%]
tests/test_guardrails.py::test_prompt_injection_blocking PASSED          [ 52%]
tests/test_guardrails.py::test_pii_sanitization PASSED                   [ 57%]
tests/test_guardrails.py::test_permission_tier_enforcement PASSED        [ 61%]
tests/test_guardrails.py::test_output_sanitization PASSED                [ 66%]
tests/test_invoices.py::test_list_invoices PASSED                        [ 71%]
tests/test_invoices.py::test_invoice_pdf_generation PASSED               [ 76%]
tests/test_invoices.py::test_send_invoice_reminder PASSED                [ 80%]
tests/test_scenarios.py::test_scenario_a_cashflow_dip_alert PASSED       [ 85%]
tests/test_scenarios.py::test_scenario_b_ar_overdue_reminders PASSED     [ 90%]
tests/test_scenarios.py::test_scenario_c_webank_financing_recommendation PASSED [ 95%]
tests/test_scenarios.py::test_scenario_d_widget_chat_with_api_key PASSED [100%]

======================== 21 passed in 2.20s ========================
```

---

## 2. API Endpoint Verification Logs

### Health Check:
```bash
$ curl -s http://localhost:8005/health
{"status":"healthy","service":"finpilot-backend"}
```

### Dashboard Summary (Reconciled Ledger):
```bash
$ curl -s http://localhost:8005/api/v1/dashboard/summary
{
  "tenant": {
    "company_name": "Shenzhen Nebula Tech Co., Ltd.",
    "industry": "Technology",
    "currency": "CNY"
  },
  "kpis": {
    "cash_balance": 842500.0,
    "monthly_burn_rate": 323900.0,
    "runway_months": 2.6,
    "total_open_ar": 951880.0,
    "overdue_ar": 268180.0
  }
}
```

### Embeddable SDK Loader Delivery:
```bash
$ curl -s -I http://localhost:8005/sdk/loader.js
HTTP/1.1 200 OK
content-type: text/javascript; charset=utf-8
```

### 3rd-Party ERP Demo Host Delivery:
```bash
$ curl -s -I http://localhost:8005/sdk/demo-host.html
HTTP/1.1 200 OK
content-type: text/html; charset=utf-8
```

---

## 3. Frontend Production Build Evidence
```bash
$ cd frontend && npm run build
vite v5.4.21 building for production...
✓ 2534 modules transformed.
dist/index.html                   0.46 kB │ gzip:   0.30 kB
dist/assets/index-DWvoncCW.css   26.14 kB │ gzip:   5.33 kB
dist/assets/index-gz8qXwU0.js   607.63 kB │ gzip: 174.60 kB
✓ built in 4.56s
```

---

## 4. Completed Deliverables Checklist
- [x] Complete Python Backend with FastAPI & SQLAlchemy 2.0
- [x] Multi-Agent Engine (5 Specialists + 20 Tools + 8 Guardrails)
- [x] Universal Embeddable JavaScript SDK (`loader.js` + `widget.html` + `demo-host.html`)
- [x] Full React 18/TypeScript Management Cockpit (7 Interactive Tabs)
- [x] WeBank Weiyedai (微业贷) Digital Unsecured Loan Feature
- [x] 21/21 Automated Unit & Scenario Tests Passing
- [x] Dockerfile & Docker Compose Config
- [x] Technical Architecture Documentation
- [x] Security Self-Assessment Report
- [x] 10-Minute Presentation Deck Script
- [x] 5-Minute Demo Video Walkthrough Script
