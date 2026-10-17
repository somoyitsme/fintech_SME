import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Printer, 
  CheckCircle2,
  Calendar,
  Layers,
  Users,
  Package,
  ArrowUpRight
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface ReportsPageProps {
  initialTab?: 'profit-loss' | 'purchases-sales' | 'tax' | 'contacts' | 'stock' | 'trending';
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ initialTab = 'profit-loss' }) => {
  const { metrics, products, orders, suppliers, customers } = useStore();
  const [activeTab, setActiveTab] = useState<'profit-loss' | 'purchases-sales' | 'tax' | 'contacts' | 'stock' | 'trending'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const totalVatCollected = Math.round(metrics.totalSales * 0.05);
  const vatPaidOnImports = 385000;
  const netVatPayable = totalVatCollected - vatPaidOnImports;

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            Executive Financial & Analytics Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time Profit & Loss, NBR VAT audit, inventory valuation, and supplier-customer ledgers
          </p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 shadow transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print Audit Report</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button 
          onClick={() => setActiveTab('profit-loss')} 
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'profit-loss' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'}`}
        >
          Profit / Loss Statement
        </button>
        <button 
          onClick={() => setActiveTab('purchases-sales')} 
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'purchases-sales' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'}`}
        >
          Purchase & Sale Report
        </button>
        <button 
          onClick={() => setActiveTab('tax')} 
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'tax' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'}`}
        >
          Tax & VAT Report
        </button>
        <button 
          onClick={() => setActiveTab('contacts')} 
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'contacts' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'}`}
        >
          Supplier & Customer Report
        </button>
        <button 
          onClick={() => setActiveTab('stock')} 
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'stock' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'}`}
        >
          Stock Valuation Report
        </button>
        <button 
          onClick={() => setActiveTab('trending')} 
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'trending' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'}`}
        >
          Trending Products
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. PROFIT & LOSS */}
      {/* ============================================================== */}
      {activeTab === 'profit-loss' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white uppercase">STATEMENT OF PROFIT & LOSS</h2>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">5-Month Trading Period: May 2026 – October 2026</div>
          </div>

          <div className="space-y-2 text-xs font-medium">
            <div className="flex justify-between py-1.5 text-slate-700 dark:text-slate-300">
              <span>Gross Sales Revenue ({orders.length} Invoices):</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">৳ {metrics.totalSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-600 dark:text-slate-400">
              <span>Less: Estimated Cost of Goods Sold (COGS):</span>
              <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">- ৳ {Math.round(metrics.totalSales * 0.81).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-slate-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              <span>GROSS PROFIT MARGIN:</span>
              <span className="font-mono font-black">৳ {metrics.grossProfit.toLocaleString()}</span>
            </div>

            <div className="pt-2 text-slate-600 dark:text-slate-400 space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase">Operating Expenses:</div>
              <div className="flex justify-between pl-2">
                <span>Chittagong Port Customs & Import Tariffs:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">- ৳ 725,000</span>
              </div>
              <div className="flex justify-between pl-2">
                <span>Multiplan Center & Banani Vault Showroom Lease:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">- ৳ 325,000</span>
              </div>
              <div className="flex justify-between pl-2">
                <span>Staff Payroll & 2% Sales Commission:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">- ৳ {(metrics.salesmanCommission + 175000).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between py-2.5 border-t-2 border-slate-300 dark:border-slate-600 font-extrabold text-slate-900 dark:text-white text-base">
              <span>NET OPERATING PROFIT:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-black">৳ {metrics.netProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. PURCHASE & SALE COMPARISON */}
      {/* ============================================================== */}
      {activeTab === 'purchases-sales' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">Monthly Purchase vs Sales Comparative Audit</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">5-month volume and margin velocity comparison</p>
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-mono font-bold">5-Month Gross Turnover: ৳ {metrics.totalSales.toLocaleString()}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-4">Month</th>
                  <th className="py-2.5 px-3 text-right">Purchase Volume (৳)</th>
                  <th className="py-2.5 px-3 text-right">Sales Revenue (৳)</th>
                  <th className="py-2.5 px-3 text-right">Gross Profit (৳)</th>
                  <th className="py-2.5 px-4 text-center">Gross Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {[
                  { month: "May 2026", purchase: 2150000, sales: 2680000, profit: 530000, margin: "19.8%" },
                  { month: "June 2026", purchase: 2300000, sales: 2890000, profit: 590000, margin: "20.4%" },
                  { month: "July 2026", purchase: 2450000, sales: 3050000, profit: 600000, margin: "19.7%" },
                  { month: "August 2026", purchase: 2400000, sales: 2980000, profit: 580000, margin: "19.5%" },
                  { month: "September 2026", purchase: 2520000, sales: 3122347, profit: 602347, margin: "19.3%" }
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{row.month}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300 font-medium">৳ {row.purchase.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">৳ {row.sales.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">৳ {row.profit.toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-blue-600 dark:text-blue-400">{row.margin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. TAX & VAT */}
      {/* ============================================================== */}
      {activeTab === 'tax' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="text-center pb-3 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white">NBR 5% VALUE ADDED TAX (VAT) REPORT</h2>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">National Board of Revenue Mushak 9.1 Return Schedule</div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 text-slate-700 dark:text-slate-300">
              <span>Total Taxable Wholesale & Retail Turnover:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">৳ {metrics.totalSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-700 dark:text-slate-300">
              <span>Output VAT Collected from Customers (5.0%):</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">৳ {totalVatCollected.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-700 dark:text-slate-300">
              <span>Input VAT Rebatable on Port Imports (Customs Challan):</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">- ৳ {vatPaidOnImports.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-slate-300 dark:border-slate-600 font-extrabold text-sm text-slate-900 dark:text-white pt-3">
              <span>NET VAT PAYABLE TO BANGLADESH GOVT:</span>
              <span className="font-mono text-amber-600 dark:text-amber-400 font-black">৳ {netVatPayable.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SUPPLIER & CUSTOMER REPORT */}
      {/* ============================================================== */}
      {activeTab === 'contacts' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">Distributor & Customer Credit Ledger Report</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Accounts Receivable and Payable aging audit</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-4">Contact Entity</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3 text-right">Total Business (৳)</th>
                  <th className="py-2.5 px-3 text-right">Settled (৳)</th>
                  <th className="py-2.5 px-4 text-right">Current Due / Balance (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {suppliers.slice(0, 4).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                    <td className="py-2.5 px-3 text-blue-600 dark:text-blue-400 font-semibold">Distributor</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">৳ {s.totalPurchase.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">৳ {(s.totalPurchase - s.totalDue).toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400">৳ {s.totalDue.toLocaleString()}</td>
                  </tr>
                ))}
                {customers.slice(0, 5).map((c) => {
                  const purchased = c.totalPurchases || 85000;
                  const due = c.customerType === 'Wholesale' ? 35000 : 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{c.name}</td>
                      <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400 font-semibold">{c.customerType}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">৳ {purchased.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">৳ {(purchased - due).toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-600 dark:text-amber-400">৳ {due.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. STOCK VALUATION */}
      {/* ============================================================== */}
      {activeTab === 'stock' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">Physical Inventory Stock Valuation</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">27 StarTech hardware SKUs with purchase cost vs retail valuation</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-600 dark:text-slate-300 font-mono">At Cost: ৳ {metrics.stockPurchasePrice.toLocaleString()}</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">At Retail: ৳ {metrics.stockSellPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-4">Hardware SKU</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Stock Units</th>
                  <th className="py-2.5 px-3 text-right">Cost Value (৳)</th>
                  <th className="py-2.5 px-4 text-right">Retail Value (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.slice(0, 10).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white truncate max-w-[240px]">{p.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{p.sku}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{p.category}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900 dark:text-white">{p.stockCount}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">৳ {(p.costPrice * p.stockCount).toLocaleString()}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">৳ {(p.retailPrice * p.stockCount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. TRENDING PRODUCTS */}
      {/* ============================================================== */}
      {activeTab === 'trending' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm">Top Trending Hardware Velocity</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Highest velocity products ranked by turnover speed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold">#1 Top Velocity</span>
              <div className="font-bold text-sm text-slate-900 dark:text-white">ASUS ROG Strix GeForce RTX 4080 Super</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">58 Units Sold across Dhaka eSports gaming clubs</div>
              <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">Revenue: ৳ 9,570,000</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">#2 Top Velocity</span>
              <div className="font-bold text-sm text-slate-900 dark:text-white">AMD Ryzen 7 7800X3D Processor</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">72 Units Sold across Multiplan retail partner stores</div>
              <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">Revenue: ৳ 3,744,000</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">#3 Top Velocity</span>
              <div className="font-bold text-sm text-slate-900 dark:text-white">Samsung 990 Pro 2TB PCIe Gen4 NVMe</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">110 Units Sold for content creator workstation rigs</div>
              <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm">Revenue: ৳ 2,695,000</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
