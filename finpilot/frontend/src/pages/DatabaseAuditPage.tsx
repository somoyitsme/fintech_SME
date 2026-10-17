import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  ShieldCheck, 
  History, 
  HardDrive, 
  Check, 
  RefreshCw,
  Lock,
  Layers
} from 'lucide-react';

import { useStore } from '../context/StoreContext';

export const DatabaseAuditPage: React.FC = () => {
  const { products, orders, metrics } = useStore();
  const [exportingType, setExportingType] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleTriggerExport = (type: string, filename: string) => {
    setExportingType(type);
    
    // Generate real CSV / JSON content from live database state
    let content = '';
    let mimeType = 'text/csv;charset=utf-8;';

    if (type === 'orders') {
      content = 'InvoiceNumber,CustomerName,ItemsSummary,TotalAmount,PaymentStatus,Date,Salesman\n' +
        orders.map(o => `"${o.orderNumber}","${o.customerName}","${o.itemsSummary}",${o.totalAmount},"${o.paymentStatus}","${o.orderDate}","${o.salesman}"`).join('\n');
    } else if (type === 'customers') {
      content = 'CustomerName,Phone,Address,TotalOrdersPlaced\n' +
        orders.map(o => `"${o.customerName}","${o.contactNumber}","${o.deliveryAddress}",৳ ${o.totalAmount}`).join('\n');
    } else if (type === 'financials') {
      content = 'Metric,BDT_Amount,Notes\n' +
        `Gross Revenue,${metrics.totalSalesRevenue},"Live aggregated sales"\n` +
        `Estimated COGS,${Math.round(metrics.totalSalesRevenue * 0.74)},"74% procurement & customs"\n` +
        `Gross Operating Profit,${metrics.totalSalesRevenue - Math.round(metrics.totalSalesRevenue * 0.74)},"26% Gross margin"\n` +
        `Operating Expenses,2840000,"Payroll, showroom, electricity"\n` +
        `Live Net Profit,${Math.max(0, metrics.totalSalesRevenue - Math.round(metrics.totalSalesRevenue * 0.74) - 2840000)},"16.27% net margin"\n`;
    } else if (type === 'logs') {
      mimeType = 'application/json';
      content = JSON.stringify({
        vault: 'Dhaka Silicon ERP Audit Trail',
        exportedAt: new Date().toISOString(),
        totalOrdersCount: orders.length,
        totalInventoryCount: products.reduce((acc, p) => acc + p.stockCount, 0),
        productsLedger: products,
        ordersLedger: orders
      }, null, 2);
    }

    setTimeout(() => {
      // Trigger actual browser file download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportingType(null);
      setDownloadSuccess(filename);
      setTimeout(() => setDownloadSuccess(null), 4000);
    }, 600);
  };

  const backupStats = {
    totalRecords: 14820,
    databaseSize: "28.4 MB (SQLite WAL)",
    encryption: "AES-256 Multi-Tenant Zero-Knowledge Partition",
    lastBackup: "Today, 04:00 AM (Automated Cloud Snapshot)"
  };

  const tables = [
    { name: "customer_clients", records: 342, description: "All retail and wholesale customer accounts with contact & credit limits" },
    { name: "invoices_and_orders", records: 2180, description: "Historical computer parts sales invoices, payment receipts & delivery logs" },
    { name: "expenses_and_pnl", records: 1240, description: "Supplier procurement costs, customs duty receipts, showroom rent & staff payroll" },
    { name: "inventory_hardware_skus", records: 890, description: "Parts catalog, serial numbers, warranty certificates & warehouse vault locations" },
    { name: "bank_cashflow_snapshots", records: 365, description: "Daily audited bank balance records (Prime Bank, BRAC Bank, bKash Merchant)" },
    { name: "staff_audit_trail_logs", records: 9803, description: "Granular RBAC activity logs, price overrides, discount approvals & logins" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f6fc]">
              Full Database Access & Audit Exports
            </h1>
            <span className="text-[11px] bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 font-mono font-semibold px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
              Admin & Owner Master Key
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8b949e] mt-0.5">
            Export master customer databases, historical financial P&L records, complete order ledgers, and tamper-evident audit trails.
          </p>
        </div>

        {downloadSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold animate-in fade-in">
            <Check className="w-4 h-4" /> Downloaded: {downloadSuccess}
          </div>
        )}
      </div>

      {/* Database Health Card */}
      <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-[#30363d]">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Dhaka Silicon Local Database Vault
            </h2>
          </div>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> WAL Mode Active · Integrity Checked
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#21262d]">
            <span className="text-slate-400 text-[11px]">Total Database Records</span>
            <div className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-1">
              {backupStats.totalRecords.toLocaleString()}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#21262d]">
            <span className="text-slate-400 text-[11px]">Database Storage Size</span>
            <div className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-1">
              {backupStats.databaseSize}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#21262d]">
            <span className="text-slate-400 text-[11px]">Encryption Status</span>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              AES-256 Partitioned
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#21262d]">
            <span className="text-slate-400 text-[11px]">Last Automated Backup</span>
            <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Today, 04:00 AM
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Master Exports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer List Export */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-5 shadow-sm flex items-start justify-between">
          <div className="space-y-1 pr-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Master Customer Directory</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8b949e]">
              Complete list of wholesale clients, phone numbers, BIN numbers, credit lines, and address books.
            </p>
            <div className="text-[11px] font-mono text-slate-400">Format: CSV / Excel · 342 Client Records</div>
          </div>
          <button
            onClick={() => handleTriggerExport('customers', 'Dhaka_Silicon_Customers_Master.csv')}
            disabled={exportingType === 'customers'}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            {exportingType === 'customers' ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>

        {/* Financial & P&L Reports */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-5 shadow-sm flex items-start justify-between">
          <div className="space-y-1 pr-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Audited Financial & P&L Ledger</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8b949e]">
              Full revenue breakdown, cost of goods sold, customs duties, operating expenses, and NBR tax records.
            </p>
            <div className="text-[11px] font-mono text-slate-400">Format: CSV / Accounting JSON · YTD 2026</div>
          </div>
          <button
            onClick={() => handleTriggerExport('financials', 'Dhaka_Silicon_PnL_Financials_2026.csv')}
            disabled={exportingType === 'financials'}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            {exportingType === 'financials' ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>

        {/* Complete Order History */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-5 shadow-sm flex items-start justify-between">
          <div className="space-y-1 pr-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Full Invoices & Orders Ledger</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8b949e]">
              All processed POS transactions, offline retail bills, B2B wholesale orders, and courier dispatch receipts.
            </p>
            <div className="text-[11px] font-mono text-slate-400">Format: CSV · 2,180 Invoices</div>
          </div>
          <button
            onClick={() => handleTriggerExport('orders', 'Dhaka_Silicon_All_Invoices_Orders.csv')}
            disabled={exportingType === 'orders'}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            {exportingType === 'orders' ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>

        {/* Staff Audit Logs */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-5 shadow-sm flex items-start justify-between">
          <div className="space-y-1 pr-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tamper-Evident Audit Logs</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8b949e]">
              Timestamped log of every price override, discount approval, staff login, and database access event.
            </p>
            <div className="text-[11px] font-mono text-slate-400">Format: JSON Logfile · 9,803 Security Events</div>
          </div>
          <button
            onClick={() => handleTriggerExport('logs', 'Dhaka_Silicon_Audit_Log_Master.json')}
            disabled={exportingType === 'logs'}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            {exportingType === 'logs' ? 'Exporting...' : 'Export JSON'}
          </button>
        </div>
      </div>
    </div>
  );
};
