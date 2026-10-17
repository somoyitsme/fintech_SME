import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Clock, 
  ChevronRight, 
  ArrowUpRight, 
  Sparkles, 
  Zap, 
  AlertCircle, 
  Truck, 
  Cpu, 
  PackageCheck,
  Eye,
  FileText,
  CheckCircle2,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { useStore } from '../context/StoreContext';
import { api } from '../api';

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
  userRole?: string;
  userName?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onNavigateTab,
  userRole = "Owner & Managing Director",
  userName = "Farhan Chowdhury"
}) => {
  const { products, orders, metrics } = useStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const summary = await api.getDashboardSummary();
        setData(summary);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Order summary monthly stacked bar data (Online vs Offline sales)
  const orderSummaryData = [
    { month: 'Feb', offline: 38, online: 24 },
    { month: 'Mar', offline: 48, online: 32 },
    { month: 'Apr', offline: 55, online: 22 },
    { month: 'May', offline: 65, online: 20 },
    { month: 'Jun', offline: 35, online: 15 },
    { month: 'Jul', offline: 40, online: 35 },
    { month: 'Aug', offline: 25, online: 10 },
    { month: 'Sep', offline: 70, online: 45 },
    { month: 'Oct', offline: 52, online: 24 },
    { month: 'Nov', offline: 42, online: 20 },
    { month: 'Dec', offline: 60, online: 32 },
    { month: 'Jan', offline: 45, online: 28 },
  ];

  // Weekly Revenue sparkline data for the vibrant blue card
  const revenueTrendData = [
    { day: 'Mon', val: 120 },
    { day: 'Tue', val: 145 },
    { day: 'Wed', val: 110 },
    { day: 'Thu', val: 175 },
    { day: 'Fri', val: 160 },
    { day: 'Sat', val: 195 },
    { day: 'Sun', val: 185 },
  ];

  const currencySymbol = "৳";

  return (
    <div className="space-y-6">
      {/* Referral UI Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-[#f0f6fc] tracking-tight">
            Ecommerce Admin Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#8b949e] mt-0.5">
            Real-time wholesale sales overview, multi-channel offline vs online order summary, and cash earnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('admin-financials')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Financial P&L Report
          </button>
        </div>
      </div>

      {/* TOP ROW: 4 STAT CARDS (Exact Referral UI match with vibrant circular badges) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sales Today */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-100 dark:border-[#30363d] rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {metrics.salesTodayCount.toLocaleString()}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Sales Today
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Truck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Visitors Today */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-100 dark:border-[#30363d] rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              27,424
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Visitors Today
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
            <Zap className="w-6 h-6 fill-white" />
          </div>
        </div>

        {/* Card 3: Total Earnings / Revenue */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-100 dark:border-[#30363d] rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              ৳ {(metrics.totalSalesRevenue / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}k
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Total Earnings
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Pending Orders */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-100 dark:border-[#30363d] rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
              {metrics.pendingOrdersCount}
            </div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
              Pending Orders
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-400 text-white flex items-center justify-center shadow-md shadow-emerald-400/20">
            <Bell className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* MIDDLE ROW: ORDER SUMMARY & VIBRANT BLUE REVENUE CARD (Matching Referral UI) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left & Center: Order Summary (Stacked Bar Chart + Sales Overview list) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#161b22] border border-slate-100 dark:border-[#30363d] rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Order Summary</h2>
              <p className="text-xs text-slate-400">Offline counter sales vs online B2B ecommerce orders</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded bg-rose-500"></span> Offline
              </span>
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-3 h-3 rounded bg-blue-600"></span> Online
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Dual Bar Chart (8 cols) */}
            <div className="md:col-span-8 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderSummaryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="offline" stackId="a" fill="#f43f5e" radius={[0, 0, 0, 0]} barSize={12} />
                  <Bar dataKey="online" stackId="a" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sales Overview List (4 cols) */}
            <div className="md:col-span-4 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-100 dark:border-[#30363d] pt-4 md:pt-0 md:pl-5">
              <div>
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-3">
                  Live Sales Feed
                </h3>
                <div className="space-y-3 text-xs">
                  {orders.slice(0, 3).map((ord) => (
                    <div key={ord.id}>
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                          {ord.customerName}
                        </span>
                        <span className="text-emerald-500 font-mono">
                          +৳ {(ord.totalAmount / 1000).toFixed(1)}k
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {ord.orderDate} · {ord.items.length} items
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 dark:border-[#30363d]">
                <div className="text-xs text-slate-400">Total Sales Volume</div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">
                  ৳ {(metrics.totalSalesRevenue / 1000000).toFixed(2)}M
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-full w-4/5 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Vibrant Blue REVENUE Card (Exact Match) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/10 flex flex-col justify-between relative overflow-hidden">
          {/* Top Title & View Button */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-blue-200">
              REVENUE
            </span>
            <button
              onClick={() => onNavigateTab('admin-financials')}
              className="text-[11px] font-semibold px-3 py-1 rounded-full border border-white/40 hover:bg-white/10 transition"
            >
              View
            </button>
          </div>

          {/* Revenue Amount */}
          <div className="my-4">
            <div className="text-xs text-blue-100">Live Period Revenue</div>
            <div className="text-3xl font-extrabold font-mono mt-1">
              ৳ {(metrics.totalSalesRevenue / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 })}k
            </div>
            <div className="text-xs text-blue-200 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> +৳ {(metrics.salesTodayRevenue / 1000).toFixed(1)}k invoiced today
            </div>
          </div>

          {/* Sparkline Curve */}
          <div className="h-28 -mx-3 -mb-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrendData}>
                <defs>
                  <linearGradient id="blueRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="val" stroke="#ffffff" strokeWidth={2.5} fillOpacity={1} fill="url(#blueRevGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: TOP PRODUCTS & INVOICE LIST TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Top Products (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#161b22] border border-slate-100 dark:border-[#30363d] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Warehouse Catalog & Inventory
            </h2>
            <button
              onClick={() => onNavigateTab('sales-catalog')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Manage Stock
            </button>
          </div>

          <div className="space-y-3.5">
            {products.slice(0, 4).map((p) => {
              const stockVal = p.stockCount * p.retailPrice;
              return (
                <div key={p.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-[#21262d] flex items-center justify-center text-blue-600 font-bold">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-white truncate max-w-[160px]">{p.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{p.stockCount} {p.unit} in vault · {p.brand}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      ৳ {(stockVal / 1000000).toFixed(2)}M
                    </div>
                    <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-1 overflow-hidden ml-auto">
                      <div 
                        className={`h-full rounded-full ${p.stockCount > p.minThreshold ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                        style={{ width: `${Math.min(100, (p.stockCount / 50) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Invoice List Table (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#161b22] border border-slate-100 dark:border-[#30363d] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Sales Invoices
            </h2>
            <button
              onClick={() => onNavigateTab('sales-orders')}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              All Orders ({orders.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#21262d] text-slate-400 font-semibold border-y border-slate-100 dark:border-[#30363d]">
                <tr>
                  <th className="py-2.5 px-3">#Invoice</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Total (BDT)</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/70 dark:hover:bg-[#21262d]/50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                      {ord.customerName}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white">
                      ৳ {ord.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        ord.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {ord.orderDate}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onNavigateTab('sales-orders')}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 hover:text-blue-600"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
