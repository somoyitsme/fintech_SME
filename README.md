# FinPilot — Standalone Autonomous AI Financial Agent & SME Management Platform

[![Contest](https://img.shields.io/badge/Shenzhen%20FinTechathon-2026-blue.svg)](https://fintechathon.g-ican.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-21%2F21%20Passing-brightgreen.svg)]()
[![Currency](https://img.shields.io/badge/Currency-BDT%20(%E0%A7%B3)-orange.svg)]()

FinPilot is an enterprise-grade, **fully decoupled autonomous AI Financial Copilot and Virtual CFO platform**. It is designed with a strict architectural separation:

1. **Standalone AI Agent Engine & Embeddable SDK**: A universal, plug-and-play AI microservice that can be connected to **ANY SME** (Retail, Wholesale, Pharmacy, Restaurant, Logistics, Manufacturing) via a 1-line script tag or REST API. The agent performs dynamic, situational reasoning (never static templates), multi-agent tool execution, and guardrail enforcement.
2. **SME Computer Hardware Wholesale Platform (Dhaka Silicon & Hardware Ltd.)**: A full-featured enterprise management system for a computer components and PC parts wholesaler/distributor (GPUs, CPUs, RAM, SSDs, Motherboards), featuring a **Salesman Account** for sales leads, real-time BDT (৳) cash ledgering, and NBR tax compliance.

---

## 🏗️ Decoupled System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          ANY EXTERNAL SME HOST SYSTEMS                           │
│   [ Pharmacy ERP ]       [ Restaurant POS ]       [ Dhaka Silicon Hardware ]     │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                   1-Line Embed Script Tag or REST API
              <script src=".../sdk/loader.js" data-api-key="fp_live_..."></script>
                                         │
┌────────────────────────────────────────▼────────────────────────────────────────┐
│               FINPILOT STANDALONE AI AGENT PLATFORM (Port 8090)                 │
│                                                                                 │
│   ├── Input Guardrails (PII Masking, Prompt Injection Classifier, Auth Scopes)  │
│   ├── Specialist Routing (Cashflow, Invoice Chaser, Financing, Tax, Analyst)    │
│   ├── Deterministic Tool Chain (20+ verified ledger, forecast & ratio tools)     │
│   ├── Dynamic Generative Reasoning (Situational math, CFO strategic trade-offs) │
│   └── Output Guardrails (Balance verification, data leakage sanitization)       │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼────────────────────────────────────────┐
│                        FINANCIAL PROTOCOLS & INTEGRATIONS                       │
│   ├── WeBank Weiyedai (微业贷) Digital Credit (up to ৳ 50 Lakh BDT, 4.2% APR)   │
│   ├── IT Hardware Supply Chain Invoice Factoring (up to ৳ 80 Lakh BDT)          │
│   └── Bangladesh NBR Tax Regime (Mushak 9.1 VAT 5% Concession, Customs AIT)     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (Running Locally)

The server runs on **Port 8090** (avoiding local PM2 port 8000 / NVR port 8080 conflicts).

### 1. Start Server
From the project root:
```bash
./run_backend.sh
```
Or with Make / npm:
```bash
make run
# or
npm start
```
Open **`http://localhost:8090`** in your browser.

---

## 👥 Demo Accounts & Credentials

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Salesman Lead** | `salesman@dhakasilicon.com` | `Sales123!` | Tanvir Ahmed (Senior Sales & Inventory Lead) |
| **Managing Director** | `admin@dhakasilicon.com` | `Admin123!` | Mahmudur Rahman (Admin & Financial Controller) |
| **Contest Auditor** | `admin@nebulatech.cn` | `Admin123456!` | Universal contest reviewer account |

---

## 🖥️ Feature Verification

Every single button across the application is 100% interactive and functional:

- **Cockpit Dashboard**: Real-time BDT liquidity balance (৳ 18.5 Lakh), monthly burn (৳ 6.57 Lakh), runway (2.8 months), and overdue invoice aging.
- **Invoices & AR Aging**:
  - `Create Parts Invoice`: Add new computer component invoices (RTX 4070 Super, i7-14700K).
  - `Download PDF`: Generate instant branded PDF invoices.
  - `Send AI Reminder`: Dispatch tone-adjusted collection notices (Polite, Professional, Firm).
  - `Mark Paid`: Instant ledger settlement.
- **Expenses & P&L**:
  - `Log Expense`: Record port customs clearance duties, showroom lease, and sales payroll.
- **Trade Financing & Credit**:
  - `WeBank Weiyedai Digital Credit`: Match pre-qualified revolving lines up to ৳ 50 Lakh BDT.
  - `Check Pre-Qualification`: Instant digital verification pack generation.
- **Tax & NBR Compliance**:
  - `Recalculate Indices`: Live re-scoring of financial health metrics.
  - `Export Mushak 9.1 Pack`: Download full VAT return filing payload (.json).
  - `Audit Dossier`: Generate official compliance audit dossier (.txt).
- **Standalone AI Agent Hub**:
  - `Multi-SME Sandbox`: Switch live context between **Dhaka Silicon**, **MediCare Pharma**, **Bengal Cloud Kitchens**, and **Apex FastLogistics**.
  - `1-Line Embed Script Tag`: Instant copy and test via isolated iframe widget.
  - `API Key Generator`: Create and manage scoped tenant tokens.

---

## 🧪 Automated Test Suite

All 21 backend unit and integration tests pass:
```bash
cd finpilot/backend
.venv/bin/pytest -v
```
Output:
```
tests/test_agent_tools.py::test_all_20_tools_registered PASSED
tests/test_agent_tools.py::test_tool_get_cash_flow_metrics PASSED
tests/test_agent_tools.py::test_tool_forecast_cash_flow PASSED
tests/test_agent_tools.py::test_tool_get_overdue_invoices PASSED
tests/test_agent_tools.py::test_tool_match_financing_options PASSED
tests/test_agent_tools.py::test_tool_get_financial_health_score PASSED
tests/test_auth.py::test_health_check PASSED
tests/test_auth.py::test_login_demo_admin PASSED
tests/test_auth.py::test_auth_me PASSED
tests/test_auth.py::test_create_and_list_api_keys PASSED
tests/test_guardrails.py::test_prompt_injection_blocking PASSED
tests/test_guardrails.py::test_pii_sanitization PASSED
tests/test_guardrails.py::test_permission_tier_enforcement PASSED
tests/test_guardrails.py::test_output_sanitization PASSED
tests/test_invoices.py::test_list_invoices PASSED
tests/test_invoices.py::test_invoice_pdf_generation PASSED
tests/test_invoices.py::test_send_invoice_reminder PASSED
tests/test_scenarios.py::test_scenario_a_cashflow_dip_alert PASSED
tests/test_scenarios.py::test_scenario_b_ar_overdue_reminders PASSED
tests/test_scenarios.py::test_scenario_c_webank_financing_recommendation PASSED
tests/test_scenarios.py::test_scenario_d_widget_chat_with_api_key PASSED

======================== 21 passed in 3.88s ========================
```
