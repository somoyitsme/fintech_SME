import React, { useState } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  MinusCircle, 
  TrendingUp, 
  CreditCard, 
  Package, 
  Calendar, 
  MapPin, 
  ChevronDown, 
  ArrowUpRight, 
  Phone, 
  Building2,
  ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { useStore } from '../context/StoreContext';

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
  userRole?: string;
  userName?: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ 
  onNavigateTab,
  userRole = "Managing Director",
  userName = "MD Nazmul Hasan"
}) => {
  const { products, orders, customers, metrics, selectedLocation, setSelectedLocation, dateFilter, setDateFilter } = useStore();

  const [dateFilterOpen, setDateFilterOpen] = useState(false);

  // Top 5 Products data for Pie Chart
  const topProductsPie = [
    { name: 'NVIDIA RTX 4070 Ti Super 16GB', value: 3450000, color: '#be123c' },
    { name: 'Intel Core i7-14700K 20-Core', value: 2850000, color: '#0284c7' },
    { name: 'AMD Ryzen 7 7800X3D Gaming', value: 2180000, color: '#059669' },
    { name: 'Samsung 990 Pro 2TB NVMe', value: 1650000, color: '#f59e0b' },
    { name: 'ASUS ROG Strix Z790-E Motherboard', value: 1420000, color: '#7c3aed' }
  ];

  // Top 10 Customers list from authentic StarTech customer data
  const topCustomers = customers.slice(0, 10).map((c, i) => {
    const custOrders = orders.filter(o => o.customerName === c.name);
    const spent = custOrders.reduce((sum, o) => sum + o.totalAmount, 0) || (c.totalPurchases || 450000);
    return {
      id: i + 1,
      name: c.name,
      mobile: c.contactNumber,
      totalSpent: spent
    };
  }).sort((a, b) => b.totalSpent - a.totalSpent);

  // 30 Days Sales Bar Chart Data
  const last30DaysSales = [
    { day: '01 Oct', sales: 420000 },
    { day: '03 Oct', sales: 680000 },
    { day: '05 Oct', sales: 310000 },
    { day: '07 Oct', sales: 540000 },
    { day: '09 Oct', sales: 490000 },
    { day: '11 Oct', sales: 780000 },
    { day: '13 Oct', sales: 620000 },
    { day: '15 Oct', sales: 890000 },
    { day: '17 Oct', sales: 950000 }
  ];

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-100 select-none">
      {/* 1. Header: Welcome & Filters (Location & Date) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Welcome {userName},
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time multi-location hardware distribution ERP & POS terminal
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Location Selector */}
          <div className="relative">
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="bg-white dark:bg-[#1e293b] border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm appearance-none font-medium cursor-pointer"
            >
              <option>All Locations</option>
              <option>Banani Central Vault & Warehouse</option>
              <option>Elephant Road Multiplan Branch</option>
              <option>BCS Computer City IDB Branch</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDateFilterOpen(!dateFilterOpen)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>
                {dateFilter === 'all' ? 'All 5-Month History' :
                 dateFilter === 'today' ? 'Today' :
                 dateFilter === 'month' ? 'This Month' : 'Past 30 Days'}
              </span>
              <ChevronDown className="w-3 h-3 ml-1" />
            </button>

            {dateFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 z-50 text-xs">
                {[
                  { id: 'today', label: 'Today (17 Oct)' },
                  { id: 'week', label: 'This Week' },
                  { id: 'month', label: 'This Month (October 2026)' },
                  { id: 'past30', label: 'Past 30 Days' },
                  { id: 'all', label: 'All 5-Month History (May-Oct)' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setDateFilter(item.id);
                      setDateFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition ${dateFilter === item.id ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. 8 KPI METRIC CARDS (Exact 2x4 Layout from Screenshot 1) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1: SALES */}
        <div 
          onClick={() => onNavigateTab('sell-all')}
          className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center gap-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SALES</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white truncate">
              Total Sales: ৳ {metrics.totalSales.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Sell Return: ৳ 0.00
            </div>
          </div>
        </div>

        {/* CARD 2: PURCHASE */}
        <div 
          onClick={() => onNavigateTab('purchases-list')}
          className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center gap-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-sky-500/15 border border-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PURCHASE</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white truncate">
              Total Purchase: ৳ {metrics.totalPurchase.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Purchase Return: ৳ 0.00
            </div>
          </div>
        </div>

        {/* CARD 3: EXPENSE */}
        <div 
          onClick={() => onNavigateTab('expenses-list')}
          className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center gap-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
            <MinusCircle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">EXPENSE</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white truncate">
              Total Expense: ৳ {metrics.totalExpense.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Expense Due: ৳ 0.00
            </div>
          </div>
        </div>

        {/* CARD 4: PROFIT */}
        <div 
          onClick={() => onNavigateTab('reports-profit-loss')}
          className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center gap-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PROFIT</div>
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
              Gross Profit: ৳ {metrics.grossProfit.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Net Profit: ৳ {metrics.netProfit.toLocaleString()}
            </div>
          </div>
        </div>

        {/* CARD 5: ACCOUNT PAYABLE */}
        <div 
          onClick={() => onNavigateTab('purchases-list')}
          className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center gap-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ACCOUNT PAYABLE</div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white truncate">
              ৳ {metrics.accountPayable.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Purchase Due: ৳ 0.00
            </div>
          </div>
        </div>

        {/* CARD 6: ACCOUNT RECEIVABLE */}
        <div 
          onClick={() => onNavigateTab('sell-all')}
          className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center gap-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ACCOUNT RECEIVABLE</div>
            <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 truncate">
              ৳ {metrics.accountReceivable.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Purchase Return Due: ৳ 0.00
            </div>
          </div>
        </div>

        {/* CARD 7 & 8: STOCK VALUATION (Span 2 Columns on desktop) */}
        <div 
          onClick={() => onNavigateTab('products-list')}
          className="col-span-1 sm:col-span-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex items-center gap-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">STOCK VALUATION</div>
            <div className="flex flex-wrap items-center gap-6 mt-0.5">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">By Sell Price: </span>
                <span className="text-base font-extrabold text-blue-600 dark:text-blue-400">
                  ৳ {metrics.stockSellPrice.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">By Purchase Cost: </span>
                <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                  ৳ {metrics.stockPurchasePrice.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                ({metrics.totalStockUnits} Total Hardware Units)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. CHARTS ROW: Top 5 Products Pie Chart & Top 10 Customers Table */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT: Top 5 Products based on sells (October 2026) */}
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Top 5 Products based on sells (October 2026)
            </h2>
            <button 
              onClick={() => onNavigateTab('products-list')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Catalog</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 mt-2 flex flex-col sm:flex-row items-center">
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topProductsPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {topProductsPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [`৳ ${Number(val).toLocaleString()}`, 'Total Sales']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="w-full sm:w-1/2 space-y-2 text-xs pr-2">
              {topProductsPie.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="text-slate-700 dark:text-slate-300 truncate font-medium">{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-900 dark:text-white font-bold text-[11px] flex-shrink-0">
                    ৳{(item.value / 100000).toFixed(1)}L
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Top 10 Customers (Oct 2026) */}
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Top 10 Customers (Oct 2026)
            </h2>
            <button 
              onClick={() => onNavigateTab('contacts-customers')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-2 overflow-x-auto max-h-64 scrollbar-thin">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 dark:border-slate-800 font-semibold text-[11px]">
                  <th className="py-2 px-1">#</th>
                  <th className="py-2 px-2">Name</th>
                  <th className="py-2 px-2">Mobile</th>
                  <th className="py-2 px-2 text-right">Total Amount Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {topCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-2 px-1 text-slate-400">{cust.id}</td>
                    <td className="py-2 px-2 font-semibold text-slate-900 dark:text-slate-200 truncate max-w-[140px]">
                      {cust.name}
                    </td>
                    <td className="py-2 px-2 text-slate-500 font-mono text-[11px]">
                      {cust.mobile}
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ৳ {cust.totalSpent.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. SALES LAST 30 DAYS (Progression Bar Chart) */}
      {/* ============================================================== */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              Sales Last 30 Days
            </h2>
            <div className="text-[11px] text-slate-400">
              Daily revenue volume across online delivery & in-store counter POS
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              ৳ 5,740,000.00
            </div>
            <div className="text-[10px] text-emerald-500 font-semibold font-mono">
              +14.8% vs Previous Month
            </div>
          </div>
        </div>

        <div className="h-60 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last30DaysSales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
                tickFormatter={(v) => `৳${v/1000}k`}
              />
              <Tooltip 
                formatter={(val: any) => [`৳ ${Number(val).toLocaleString()}`, 'Daily Sales']}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
              />
              <Bar dataKey="sales" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
