import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart as PieIcon, 
  BarChart3, 
  FileText, 
  Download, 
  ShieldCheck, 
  Percent, 
  Calculator,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar 
} from 'recharts';
import { useStore } from '../context/StoreContext';

export const FinancialAnalyticsPage: React.FC = () => {
  const { metrics } = useStore();
  const [period, setPeriod] = useState<'Q3_2026' | 'YTD_2026'>('Q3_2026');

  const grossRevenue = metrics.totalSalesRevenue;
  const cogs = Math.round(grossRevenue * 0.74); // 74% COGS (Hardware wholesale purchase + customs)
  const grossProfit = grossRevenue - cogs;
  const operatingExpenses = 2840000; // Staff, Rent, Showroom
  const netProfit = Math.max(0, grossProfit - operatingExpenses);
  const netMargin = Number(((netProfit / grossRevenue) * 100).toFixed(2));
  const taxesDue = Math.round(netProfit * 0.10);
  const retainedEarnings = netProfit - taxesDue;

  const pnlData = {
    grossRevenue,
    cogs,
    grossProfit,
    grossMargin: 26.0,
    operatingExpenses,
    netProfit,
    netMargin,
    taxesDue,
    retainedEarnings
  };

  const monthlyProfitTrend = [
    { month: 'Apr', revenue: 7.2, cogs: 5.4, profit: 1.8 },
    { month: 'May', revenue: 8.5, cogs: 6.2, profit: 2.3 },
    { month: 'Jun', revenue: 6.8, cogs: 5.1, profit: 1.7 },
    { month: 'Jul', revenue: 9.1, cogs: 6.7, profit: 2.4 },
    { month: 'Aug', revenue: 7.9, cogs: 5.9, profit: 2.0 },
    { month: 'Sep', revenue: 10.4, cogs: 7.6, profit: 2.8 },
    { month: 'Oct', revenue: 9.8, cogs: 7.1, profit: 2.7 },
  ];

  const cogsBreakdown = [
    { component: 'GPU & Processor Import Customs (Chittagong Port)', cost: 12450000, percent: 57.6 },
    { component: 'Direct Vendor Procurement (Intel / ASUS / Kingston)', cost: 6840000, percent: 31.7 },
    { component: 'Shipping, Freight & Marine Cargo Insurance', cost: 1420000, percent: 6.6 },
    { component: 'Warehouse Inbound Handling & Warranty Buffer', cost: 898000, percent: 4.1 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f6fc]">
              Financial & Profit Analytics
            </h1>
            <span className="text-[11px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-mono font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Admin & Owner Confidential
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8b949e] mt-0.5">
            Executive financial audit: Net profit margins, Cost of Goods Sold (COGS), and NBR corporate tax provision.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
        >
          <Download className="w-3.5 h-3.5" /> Export Executive P&L PDF
        </button>
      </div>

      {/* 4 Core Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-2">
            ৳ {(pnlData.grossRevenue / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-emerald-500 flex items-center gap-1 mt-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" /> +24.8% YoY B2B Growth
          </div>
        </div>

        {/* Cost of Goods Sold */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>COGS (Procurement & Duties)</span>
            <Calculator className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-2">
            ৳ {(pnlData.cogs / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-500 dark:text-[#8b949e] mt-1 font-mono">
            74.0% of Gross Revenue
          </div>
        </div>

        {/* Gross Profit & Margin */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gross Profit</span>
            <Percent className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-2">
            ৳ {(pnlData.grossProfit / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            26.0% Gross Margin
          </div>
        </div>

        {/* Net Profit & Margin */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Net Operating Profit</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono mt-2">
            ৳ {(pnlData.netProfit / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 font-semibold">
            16.27% Net Margin
          </div>
        </div>
      </div>

      {/* Middle Row: Revenue vs COGS Trend & Cost Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Monthly Profitability Trajectory
              </h2>
              <p className="text-xs text-slate-400">Gross revenue vs hardware procurement cost (Million BDT)</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1 text-blue-600">
                <span className="w-2.5 h-2.5 rounded bg-blue-600"></span> Revenue
              </span>
              <span className="flex items-center gap-1 text-emerald-500">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Profit
              </span>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyProfitTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `৳${v}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COGS Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Cost of Goods Sold (COGS)
              </h2>
              <span className="text-xs font-mono text-slate-400">৳ 21.60M</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Breakdown of import duties, distributor contracts, and marine freight.
            </p>

            <div className="space-y-3.5">
              {cogsBreakdown.map((item, idx) => (
                <div key={idx} className="text-xs">
                  <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span className="truncate pr-2">{item.component}</span>
                    <span className="font-mono">{item.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full" 
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1 text-right">
                    ৳ {(item.cost / 1000000).toFixed(2)}M
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-[#30363d] text-xs flex justify-between items-center text-slate-500">
            <span>NBR VAT & Corporate Tax Provision:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">৳ 480,000</span>
          </div>
        </div>
      </div>
    </div>
  );
};
