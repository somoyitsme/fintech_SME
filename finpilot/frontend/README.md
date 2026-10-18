# 🖥️ FinPilot Frontend — Modern SME Wholesale & Distribution ERP

[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com)
[![Lucide Icons](https://img.shields.io/badge/Icons-Lucide-f43f5e.svg)](https://lucide.dev)
[![Embedded AI](https://img.shields.io/badge/AI%20Copilot-FinPilot%20Inside-10b981.svg)]()

FinPilot Frontend is an enterprise-grade web application built for small-to-medium enterprises (SMEs), wholesalers, computer hardware retailers, and commercial distributors. Built as the reference implementation for **Dhaka Silicon & Hardware Ltd.**, it integrates complete ERP workflows with an embedded, auto-styling **Autonomous AI Financial Copilot**.

---

## 📸 Architecture & Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FinPilot Web Cockpit                            │
│  (React 18 + TypeScript + Vite + TailwindCSS + Context API)            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
│       SME REST API (Port 8090)       │  │    FinPilot AI Agent (Port 8100)     │
│   • Invoices, Products, Inventory    │  │   • 1-Line Embed Script (loader.js)  │
│   • Expenses, Customers, Cashflow    │  │   • Auto-Theme Shadow DOM / iframe   │
│   • PDF Invoice Generation           │  │   • Real-Time Thinking & SSE Stream  │
└──────────────────────────────────────┘  └──────────────────────────────────────┘
```

---

## 🚀 Key Modules & Capabilities

### 1. 📊 Executive & Operational Dashboards
- **Real-Time KPIs**: Total Revenue, Daily Inflow, Monthly Burn Rate, Net Margin, and Working Capital.
- **Cash Flow Trendline**: Interactive Recharts graphs with historical liquidity and 90-day predictive corridors.
- **Receivables & Payables Watch**: Immediate alert badges for delinquent client balances.

### 2. 🛒 Point-of-Sale (POS) & Billing (`/sell`)
- **Fast Cashier Terminal**: Rapid barcode/SKU search, category filtering, customer selection, and live inventory decrementing.
- **Custom Tax & Discounts**: Line-item discounts, percentage VAT/tax calculation, and multi-tender settlement (Cash, Bank Transfer, bKash/MFS).
- **Instant Printable Invoices**: Generates clean thermal receipts and formal A4 commercial invoices.

### 3. 📦 Stock & Inventory Management
- **Catalog Management (`/products`)**: Multi-category hardware catalog (Motherboards, GPUs, CPUs, RAM, SSDs) with serial tracking and cost margins.
- **Stock Transfers (`/stock-transfers`)**: Inter-warehouse and branch inventory relocation with dispatch and arrival confirmation.
- **Stock Adjustments (`/stock-adjustments`)**: Fast write-off, damage reconciliation, and audit adjustment logs.

### 4. 📑 Invoicing & Accounts Receivable (`/invoices`)
- **Aging Analysis**: Automatic classification into `0-30`, `31-60`, `61-90`, and `90+` days overdue.
- **One-Click PDF Generator**: Server-side ReportLab generation for instant download and client dispatch.
- **Payment Collection Tracking**: Split partial payments, settle balance, and log transaction references.

### 5. 💰 Expense Tracking & Cost Centers (`/expenses`)
- Categorization by COGS, Payroll, Office Rent, Utilities, Logistics, and Software Subscriptions.
- Tax-deductible expense flagging for simplified quarterly tax reconciliation.

### 6. 🤝 Customer & Supplier CRM (`/contacts`, `/suppliers`)
- Complete ledger history per supplier and client.
- Credit limits, payment terms (Net-15, Net-30), and outstanding balance monitoring.

### 7. 🤖 Embedded FinPilot AI Financial Copilot
- Dropped in via a single `<script>` tag in `index.html`.
- **Auto-Theme Chameleon**: Automatically detects host colors, typography (`Inter`), and dark/light mode preference.
- Answers complex queries (*"What's my cash runway?", "Show top overdue clients", "Check loan eligibility"*) directly using live database facts.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [React 18.3](https://react.dev/) + [TypeScript 5.5](https://www.typescriptlang.org/) |
| **Build Tool** | [Vite 5.4](https://vitejs.dev/) with Hot Module Replacement (HMR) |
| **Styling** | [TailwindCSS 3.4](https://tailwindcss.com/) + Custom Glassmorphism & Contrast Design System |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Charts & Visuals** | [Recharts 2.15](https://recharts.org/) |
| **Typography** | Google Fonts `Inter` (300 to 800 weights) |
| **State Management** | React Context (`StoreContext`, `ThemeContext`) |

---

## 🏃 Getting Started (Local Development)

### Prerequisites
- Node.js 18.0+ or Node 20.0+
- npm or pnpm / yarn

### Installation
```bash
# 1. Navigate to the frontend directory
cd finpilot/frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The web application will be live at: **`http://localhost:5173`**

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🔌 Connecting to the Backend & AI Copilot

The frontend automatically communicates with:
1. **SME ERP Backend API (`http://localhost:8090`)**: Defined in `src/api.ts`.
2. **FinPilot AI Agent (`http://localhost:8100`)**: Loaded automatically via `index.html`:
   ```html
   <script 
     src="http://localhost:8100/sdk/loader.js" 
     data-api-key="fp_live_f407b24b5fcf1fc17c717429793a9ca4" 
     data-tenant-id="28434594-e04c-4aae-aa17-d4612114e348">
   </script>
   ```

---

## 📄 License
This project is licensed under the MIT License.
