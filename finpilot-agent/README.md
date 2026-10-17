# 🧠 FinPilot Agent — Standalone Universal AI Financial Copilot

FinPilot Agent is an autonomous, multi-tenant AI Financial Copilot microservice platform designed for the 2026 Shenzhen International FinTech Competition.

## 🚀 Key Features
- **Decoupled Architecture**: Operates as a completely independent service on port `8100`.
- **Universal 1-Line Embed SDK**: Any third-party SME site (pharmacy, hardware, restaurant) can integrate via `<script src="http://localhost:8100/sdk/finpilot-sdk.js" data-api-key="..."></script>`.
- **Self-Contextualizing Engine**: Automatically computes live cash balance, burn rate, runway, and sector risk profiles from synced data.
- **20+ Deterministic Financial Tools**: Cash runway forecasting, overdue AR chasing, PnL summary, tax deduction calculation, and WeBank Weiyedai digital credit pre-qualification.
- **3-Tier Permission Guardrails**: Tier 1 (Autonomous reads), Tier 2 (Supervised drafts), Tier 3 (Strictly restricted transfers/deletion).

## 🏃 Running the Service
```bash
./run.sh
```
Docs: `http://localhost:8100/docs`
SDK: `http://localhost:8100/sdk/finpilot-sdk.js`
Demo (Hardware): `http://localhost:8100/sdk/demo/demo-host.html`
Demo (Pharmacy): `http://localhost:8100/sdk/demo/demo-pharmacy.html`
