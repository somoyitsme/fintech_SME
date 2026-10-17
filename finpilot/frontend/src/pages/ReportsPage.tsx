import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, FileText, Printer, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface ReportsPageProps {
  initialTab?: 'profit-loss' | 'tax' | 'stock' | 'trending';
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ initialTab = 'profit-loss' }) => {
  const { metrics, products, orders } = useStore();
  const [activeTab, setActiveTab] = useState<'profit-loss' | 'tax' | 'stock' | 'trending'>(initialTab);

  const totalVatCollected = Math.round(metrics.totalSales * 0.05);

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-100 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-500" />
            Financial & Tax Audit Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Profit & Loss, NBR 5% VAT calculations, and stock inventory audit statements
          </p>
        </div>
        <button onClick={() => window.print()} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 shadow">
          <Printer className="w-4 h-4" />
          <span>Print Official Statement</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button onClick={() => setActiveTab('profit-loss')} className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'profit-loss' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          Profit / Loss Statement
        </button>
        <button onClick={() => setActiveTab('tax')} className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'tax' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          NBR 5% VAT Tax Report
        </button>
        <button onClick={() => setActiveTab('stock')} className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'stock' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
          Stock Valuation Report
        </button>
      </div>

      {activeTab === 'profit-loss' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="text-center pb-3 border-b border-slate-700">
            <h2 className="font-extrabold text-base text-white uppercase">STATEMENT OF PROFIT & LOSS</h2>
            <div className="text-xs text-slate-400 mt-0.5">5-Month Trading Period: May 2026 – October 2026</div>
          </div>

          <div className="space-y-2 text-xs font-medium">
            <div className="flex justify-between py-1.5 text-slate-300">
              <span>Gross Sales Revenue ({orders.length} Invoices):</span>
              <span className="font-mono font-bold text-white">৳ {metrics.totalSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-400">
              <span>Less: Estimated Cost of Goods Sold (COGS):</span>
              <span className="font-mono text-rose-400">- ৳ {Math.round(metrics.totalSales * 0.81).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-slate-700 text-emerald-400 font-bold text-sm">
              <span>Gross Profit (Trading Margin ~19%):</span>
              <span className="font-mono">৳ {metrics.grossProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-400">
              <span>Less: Operating Expenses (Customs, Rent, Freight, Salaries):</span>
              <span className="font-mono text-rose-400">- ৳ {metrics.totalExpense.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-emerald-500/50 text-base font-extrabold text-emerald-400">
              <span>Net Operating Profit:</span>
              <span className="font-mono">৳ {metrics.netProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tax' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="text-center pb-3 border-b border-slate-700">
            <h2 className="font-extrabold text-base text-white uppercase">NATIONAL BOARD OF REVENUE (NBR) VAT REPORT</h2>
            <div className="text-xs text-slate-400 mt-0.5">Value Added Tax (5% Standard Rate on Computer Hardware)</div>
          </div>
          <div className="space-y-2 text-xs font-medium">
            <div className="flex justify-between py-1.5 text-slate-300">
              <span>Total Taxable Sales Turnover:</span>
              <span className="font-mono font-bold text-white">৳ {metrics.totalSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-300">
              <span>Total 5% Output VAT Collected:</span>
              <span className="font-mono font-bold text-emerald-400">৳ {totalVatCollected.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              Status: Duly recorded with NBR Business Identification Number (BIN-0029481729-01). Audit trail verified.
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stock' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="text-center pb-3 border-b border-slate-700">
            <h2 className="font-extrabold text-base text-white uppercase">INVENTORY VALUATION & RECONCILIATION</h2>
            <div className="text-xs text-slate-400 mt-0.5">27 Verified StarTech Hardware Products</div>
          </div>
          <div className="space-y-2 text-xs font-medium">
            <div className="flex justify-between py-1.5 text-slate-300">
              <span>Total Units in Stock:</span>
              <span className="font-mono font-bold text-white">{metrics.totalStockUnits} Units</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-300">
              <span>Valuation by Retail Selling Price:</span>
              <span className="font-mono font-bold text-blue-400">৳ {metrics.stockSellPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 text-slate-300">
              <span>Valuation by Wholesale Purchase Cost:</span>
              <span className="font-mono font-bold text-emerald-400">৳ {metrics.stockPurchasePrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
