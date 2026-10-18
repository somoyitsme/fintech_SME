import React, { useState } from 'react';
import { 
  Award, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock, 
  ShoppingBag, 
  ChevronRight, 
  Zap, 
  ArrowUpRight,
  Sparkles,
  PhoneCall,
  Calendar
} from 'lucide-react';

import { useStore } from '../context/StoreContext';

interface SalesmanDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const SalesmanDashboardPage: React.FC<SalesmanDashboardProps> = ({ onNavigateTab }) => {
  const { orders, metrics } = useStore();
  const [salesPeriod, setSalesPeriod] = useState<'this_month' | 'last_month'>('this_month');

  const personalMetrics = {
    target: 2000000,
    achieved: metrics.salesmanMonthSales,
    achievementRate: Number(((metrics.salesmanMonthSales / 2000000) * 100).toFixed(1)),
    commissionRate: 2.0, // 2%
    commissionEarned: metrics.salesmanCommission,
    ordersCount: orders.length,
    activeLeads: 14,
    avgDealSize: Math.round(metrics.salesmanMonthSales / Math.max(1, orders.length)),
    ranking: "1st of 6 Sales Representatives"
  };

  const activeLeads = [
    { name: "Apex Computer Systems", contact: "Saiful Islam", part: "20x RTX 4070 Ti Super", value: 2370000, status: "Quotation Sent", stage: "hot" },
    { name: "Dhaka Cyber Net Cafe", contact: "Mahin Rahman", part: "15x Core i7-14700K + DDR5", value: 945000, status: "Negotiating Discount", stage: "warm" },
    { name: "Star IT Solutions", contact: "Kamrul Hasan", part: "10x Samsung 990 Pro 2TB", value: 225000, status: "Payment Awaited", stage: "hot" },
    { name: "North-South Lab Setup", contact: "Dr. Tariq", part: "8x Custom AI Workstations", value: 1680000, status: "Spec Approved", stage: "follow_up" }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5 text-yellow-300" /> Top Performer · October 2026
            </div>
            <h1 className="text-2xl font-bold">Welcome back, Tanvir!</h1>
            <p className="text-blue-100 text-xs mt-1 max-w-xl">
              You have exceeded your monthly sales quota by <strong className="text-white underline font-bold">22.5%</strong>. 
              Estimated commission payout for this cycle: <span className="font-mono font-bold text-yellow-300">৳ 49,000</span>.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('sales-pos')}
              className="bg-white hover:bg-slate-100 text-blue-700 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-md flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-blue-600" /> New POS Sale (Entry)
            </button>
            <button
              onClick={() => onNavigateTab('sales-orders')}
              className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-3.5 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5"
            >
              <Clock className="w-4 h-4" /> View My Orders
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Personal Target */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#8b949e] text-xs font-medium">
            <span>Monthly Quota</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-[#f0f6fc] mt-2 font-mono">
            ৳ {(personalMetrics.achieved / 1000000).toFixed(2)}M
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-[#8b949e] mb-1">
              <span>Target: ৳ 2.0M</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{personalMetrics.achievementRate}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-[#21262d] h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        {/* Commissions Earned */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#8b949e] text-xs font-medium">
            <span>Commission Earned</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-[#f0f6fc] mt-2 font-mono">
            ৳ {personalMetrics.commissionEarned.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> 2.0% on invoiced collections
          </p>
        </div>

        {/* Orders Booked */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#8b949e] text-xs font-medium">
            <span>Orders Closed</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-[#f0f6fc] mt-2 font-mono">
            {personalMetrics.ordersCount} <span className="text-xs font-normal text-slate-400">Invoices</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-[#8b949e] mt-2">
            Avg. deal size: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">৳ {personalMetrics.avgDealSize.toLocaleString()}</span>
          </p>
        </div>

        {/* Active Pipeline Leads */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-[#8b949e] text-xs font-medium">
            <span>My Active Leads</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 dark:text-[#f0f6fc] mt-2 font-mono">
            {personalMetrics.activeLeads} <span className="text-xs font-normal text-slate-400">Clients</span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-2 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> 4 High-priority closures today
          </p>
        </div>
      </div>

      {/* Middle Row: Active Hot Leads & Recent Commission Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hot Leads Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#f0f6fc] uppercase tracking-wider">
                My Active Customer Leads
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#8b949e]">Quotes currently in discussion with retail and corporate buyers</p>
            </div>
            <button
              onClick={() => onNavigateTab('sales-crm')}
              className="text-xs text-blue-600 dark:text-[#58a6ff] hover:underline font-semibold flex items-center gap-1"
            >
              Open CRM <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="enterprise-table w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#21262d] text-slate-500 dark:text-[#8b949e] font-semibold border-y border-slate-100 dark:border-[#30363d]">
                <tr>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Hardware Requirement</th>
                  <th className="py-2.5 px-3">Quoted Value</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]">
                {activeLeads.map((lead, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-[#21262d]/50 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800 dark:text-[#f0f6fc]">{lead.name}</div>
                      <div className="text-[11px] text-slate-500 dark:text-[#8b949e] flex items-center gap-1">
                        <PhoneCall className="w-3 h-3" /> {lead.contact}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                      {lead.part}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800 dark:text-[#f0f6fc]">
                      ৳ {lead.value.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        lead.stage === 'hot' 
                          ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400' 
                          : lead.stage === 'warm'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                            : 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigateTab('sales-pos')}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 text-[11px] font-semibold transition"
                      >
                        Convert to Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Commission Log (1 Col) */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-[#f0f6fc] uppercase tracking-wider">
                Recent Commissions
              </h2>
              <span className="text-[11px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
                Active Cycle
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#8b949e] mb-4">
              Real-time commission log calculated at 2% on paid customer invoices.
            </p>

            <div className="space-y-3">
              {orders.slice(0, 4).map((ord) => {
                const commission = Math.round(ord.totalAmount * 0.02);
                return (
                  <div key={ord.id} className="p-3 rounded-xl bg-slate-50 dark:bg-[#21262d] border border-slate-100 dark:border-[#30363d] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-[#f0f6fc] truncate max-w-[140px]">{ord.customerName}</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+৳ {commission.toLocaleString()}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#8b949e] mt-1 flex justify-between">
                      <span className="truncate max-w-[150px]">{ord.itemsSummary}</span>
                      <span className="font-mono font-semibold">৳ {ord.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {ord.orderDate} · {ord.orderNumber}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-[#30363d]">
            <button
              onClick={() => onNavigateTab('sales-orders')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] text-slate-700 dark:text-[#f0f6fc] text-xs font-semibold rounded-xl transition text-center"
            >
              View Full Order Ledger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
