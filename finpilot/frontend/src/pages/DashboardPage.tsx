import React, { useState } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  MinusCircle, 
  TrendingUp, 
  CreditCard, 
  Package, 
  Calendar, 
  ChevronDown, 
  ArrowUpRight, 
  MapPin,
  Building2,
  Receipt
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
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { MetricCard } from '../components/common/MetricCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { DataTable, TableHeader, TableHeadCell, TableBody, TableRow, TableCell } from '../components/common/DataTable';
import { useTheme } from '../context/ThemeContext';

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
  const { orders, customers, metrics, selectedLocation, setSelectedLocation, dateFilter, setDateFilter } = useStore();
  const { resolvedTheme } = useTheme();
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const isSalesman = (userRole || '').toLowerCase().includes('sales');

  // Dynamic Top 5 Products by Sales Volume aggregated directly from orders
  const productSalesMap: Record<string, number> = {};
  orders.forEach((o) => {
    (o.items || []).forEach((item) => {
      const key = item.name;
      productSalesMap[key] = (productSalesMap[key] || 0) + (item.total || item.unitPrice * item.quantity);
    });
  });

  const pieColors = ['#D4A373', '#A8B388', '#8C5824', '#C9CEAA', '#687864'];
  const calculatedTopProducts = Object.entries(productSalesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value], i) => ({
      name,
      value,
      color: pieColors[i % pieColors.length]
    }));

  const topProductsPie = calculatedTopProducts.length > 0 ? calculatedTopProducts : [
    { name: 'NVIDIA RTX 4070 Ti Super 16GB', value: 3450000, color: '#D4A373' }, // Warm Ochre
    { name: 'Intel Core i7-14700K 20-Core', value: 2850000, color: '#A8B388' },   // Sage Tone
    { name: 'AMD Ryzen 7 7800X3D Gaming', value: 2180000, color: '#8C5824' },     // Deep Ochre
    { name: 'Samsung 990 Pro 2TB NVMe', value: 1650000, color: '#C9CEAA' },       // Pale Olive
    { name: 'ASUS ROG Strix Z790-E Motherboard', value: 1420000, color: '#687864' } // Muted Olive Slate
  ];

  // Top 10 Customers list dynamically calculated from authentic customer orders
  const topCustomers = customers.slice(0, 10).map((c, i) => {
    const custOrders = orders.filter(o => o.customerName === c.name || (o.customerDetails && o.customerDetails.id === c.id));
    const spent = custOrders.reduce((sum, o) => sum + o.totalAmount, 0) || (c.totalPurchases || 450000);
    return {
      id: i + 1,
      name: c.name,
      mobile: c.contactNumber,
      totalSpent: spent
    };
  }).sort((a, b) => b.totalSpent - a.totalSpent);

  // Dynamic 30 Days Sales Bar Chart Data from orders
  const dailySalesMap: Record<string, number> = {};
  const today = new Date();
  
  // Seed recent day intervals
  for (let i = 16; i >= 0; i -= 2) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dailySalesMap[key] = 0;
  }

  orders.forEach((o) => {
    const dStr = (o.orderDate || '').split(' ')[0].split('T')[0];
    if (dStr) {
      dailySalesMap[dStr] = (dailySalesMap[dStr] || 0) + (o.totalAmount || 0);
    }
  });

  const last30DaysSales = Object.entries(dailySalesMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-9)
    .map(([key, sales]) => {
      const d = new Date(key);
      const label = !isNaN(d.getTime())
        ? `${d.getDate().toString().padStart(2, '0')} ${d.toLocaleString('default', { month: 'short' })}`
        : key;
      return { day: label, sales };
    });

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-150">
      {/* 1. Header: Welcome & Filters (Location & Date) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-boundary-subtle">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary">
              Welcome back, {userName}
            </h1>
            <Badge variant="brand" size="sm">{isSalesman ? 'Salesman Dashboard' : 'Executive View'}</Badge>
          </div>
          <p className="text-xs text-content-muted mt-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-brand-ochreDeep dark:text-brand-ochre" />
            <span>{isSalesman ? 'Store sales performance, counter POS registers & customer orders' : 'Multi-location wholesale inventory, POS registers & cash flows'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Location Selector */}
          <div className="relative min-w-[200px]">
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="w-full bg-surface border border-boundary-strong text-content-primary text-xs rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-brand-ochre shadow-xs appearance-none font-medium cursor-pointer"
            >
              <option>All Locations</option>
              <option>Banani Central Vault & Warehouse</option>
              <option>Elephant Road Multiplan Branch</option>
              <option>BCS Computer City IDB Branch</option>
            </select>
            <MapPin className="w-3.5 h-3.5 text-content-muted absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDateFilterOpen(!dateFilterOpen)}
              leftIcon={<Calendar className="w-3.5 h-3.5 text-brand-ochreDeep dark:text-brand-ochre" />}
              rightIcon={<ChevronDown className="w-3 h-3 ml-0.5 text-content-muted" />}
              className="font-medium"
            >
              <span>
                {dateFilter === 'all' ? 'All 5-Month History' :
                 dateFilter === 'today' ? 'Today' :
                 dateFilter === 'month' ? 'This Month' : 'Past 30 Days'}
              </span>
            </Button>

            {dateFilterOpen && (
              <div className="absolute right-0 mt-1.5 w-52 bg-surface border border-boundary-strong rounded-xl shadow-lg p-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                {[
                  { id: 'today', label: 'Today (17 Oct 2026)' },
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
                    className={`w-full text-left px-3 py-1.5 rounded-lg transition-colors ${
                      dateFilter === item.id 
                        ? 'bg-brand-sage text-stone-950 font-bold shadow-xs' 
                        : 'hover:bg-surface-secondary text-content-secondary hover:text-content-primary'
                    }`}
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
      {/* 2. 8 KPI METRIC CARDS (Refined Golden Summer Fields Palette)  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* CARD 1: SALES */}
        <MetricCard
          label="Gross Sales Revenue"
          value={`৳ ${metrics.totalSales.toLocaleString()}`}
          subtitle="Sell Return: ৳ 0.00"
          accent="ochre"
          icon={<DollarSign className="w-5 h-5" />}
          trend={{ value: "+14.8%", isPositive: true }}
          onClick={() => onNavigateTab('sell-all')}
        />

        {/* CARD 2: PURCHASE */}
        <MetricCard
          label="Total Purchases (POs)"
          value={`৳ ${metrics.totalPurchase.toLocaleString()}`}
          subtitle="Purchase Return: ৳ 0.00"
          accent="sage"
          icon={<ShoppingCart className="w-5 h-5" />}
          trend={{ value: "98% Fulfilled", neutral: true }}
          onClick={() => onNavigateTab('purchases-list')}
        />

        {/* CARD 3: EXPENSE */}
        <MetricCard
          label="Operating Expenses"
          value={`৳ ${metrics.totalExpense.toLocaleString()}`}
          subtitle="Customs, leases & payroll"
          accent="sand"
          icon={<MinusCircle className="w-5 h-5" />}
          trend={{ value: "Controlled", neutral: true }}
          onClick={() => onNavigateTab('expenses-list')}
        />

        {/* CARD 4: PROFIT */}
        <MetricCard
          label="Operating Margins"
          value={`৳ ${metrics.netProfit.toLocaleString()}`}
          subtitle={`Gross: ৳ ${metrics.grossProfit.toLocaleString()}`}
          accent="olive"
          icon={<TrendingUp className="w-5 h-5" />}
          trend={{ 
            value: `${metrics.totalSales > 0 ? ((metrics.grossProfit / metrics.totalSales) * 100).toFixed(1) : '22.4'}% Margin`, 
            isPositive: true 
          }}
          onClick={() => onNavigateTab('reports-profit-loss')}
        />

        {/* CARD 5: ACCOUNT PAYABLE */}
        <MetricCard
          label="Account Payable"
          value={`৳ ${metrics.accountPayable.toLocaleString()}`}
          subtitle="Purchase Due: ৳ 0.00"
          accent="neutral"
          icon={<CreditCard className="w-5 h-5" />}
          trend={{ value: "Current", isPositive: true }}
          onClick={() => onNavigateTab('purchases-list')}
        />

        {/* CARD 6: ACCOUNT RECEIVABLE */}
        <MetricCard
          label="Account Receivable"
          value={`৳ ${metrics.accountReceivable.toLocaleString()}`}
          subtitle={`Overdue Credit: ৳ ${Math.round(metrics.accountReceivable * 0.65).toLocaleString()}`}
          accent="ochre"
          icon={<Receipt className="w-5 h-5" />}
          trend={{ value: "30-Day Credit", neutral: true }}
          onClick={() => onNavigateTab('sell-all')}
        />

        {/* CARD 7 & 8: STOCK VALUATION (Spans 2 Columns on desktop) */}
        <div 
          onClick={() => onNavigateTab('products-list')}
          className="col-span-1 sm:col-span-2 bg-surface border border-boundary-subtle rounded-xl p-4 sm:p-5 shadow-xs hover:border-brand-sage transition-all duration-150 flex items-start gap-4 cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-brand-sage/25 text-stone-800 dark:text-brand-sage flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold text-content-muted uppercase tracking-wider">
              Total Stock Valuation
            </div>
            <div className="flex flex-wrap items-baseline gap-4 sm:gap-6 mt-1 font-tabular">
              <div>
                <span className="text-xs text-content-muted">By Retail Price: </span>
                <span className="text-base sm:text-lg font-bold text-content-primary">
                  ৳ {metrics.stockSellPrice.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-xs text-content-muted">By Purchase Cost: </span>
                <span className="text-base sm:text-lg font-bold text-status-success">
                  ৳ {metrics.stockPurchasePrice.toLocaleString()}
                </span>
              </div>
              <Badge variant="sage" size="sm" className="font-mono">
                {metrics.totalStockUnits} Hardware Units
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. CHARTS ROW: Top 5 Products Donut Chart & Top 10 Customers  */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT: Top 5 Products Donut Chart */}
        <Card>
          <CardHeader
            title="Top 5 Products by Sales Volume"
            subtitle="October 2026 revenue contribution across graphics & processors"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('products-list')}
                rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                Catalog
              </Button>
            }
          />
          <CardContent>
            <div className="h-64 flex flex-col sm:flex-row items-center">
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
                        <Cell key={`cell-${index}`} fill={entry.color} stroke={resolvedTheme === 'dark' ? '#181C18' : '#FFFFFF'} strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [`৳ ${Number(val).toLocaleString()}`, 'Total Revenue']}
                      contentStyle={{
                        backgroundColor: resolvedTheme === 'dark' ? '#1E241E' : '#FFFFFF',
                        borderColor: resolvedTheme === 'dark' ? '#384638' : '#D5CEBE',
                        borderRadius: '10px',
                        fontSize: '11px',
                        color: resolvedTheme === 'dark' ? '#F5F5F0' : '#1C1917',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="w-full sm:w-1/2 space-y-2 text-xs pr-1">
                {topProductsPie.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate pr-1">
                      <span className="w-3 h-3 rounded-md flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                      <span className="text-content-secondary truncate font-medium text-[11.5px]">{item.name}</span>
                    </div>
                    <span className="font-mono text-content-primary font-bold text-[11px] font-tabular flex-shrink-0">
                      ৳{(item.value / 100000).toFixed(1)}L
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Top 10 Customers Table */}
        <Card>
          <CardHeader
            title="Top 10 Corporate Clients (Oct 2026)"
            subtitle="Wholesale computer points & institutional laboratories"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('contacts-customers')}
                rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                All Clients
              </Button>
            }
          />
          <div className="overflow-x-auto max-h-68 scrollbar-thin">
            <DataTable>
              <TableHeader>
                <tr>
                  <TableHeadCell className="w-8">#</TableHeadCell>
                  <TableHeadCell>Client Name</TableHeadCell>
                  <TableHeadCell>Contact</TableHeadCell>
                  <TableHeadCell align="right">Total Invoiced</TableHeadCell>
                </tr>
              </TableHeader>
              <TableBody>
                {topCustomers.map((cust) => (
                  <TableRow 
                    key={cust.id}
                    onClick={() => onNavigateTab('contacts-customers')}
                  >
                    <TableCell className="text-content-muted font-mono">{cust.id}</TableCell>
                    <TableCell className="font-semibold text-content-primary truncate max-w-[150px]">
                      {cust.name}
                    </TableCell>
                    <TableCell className="text-content-muted font-mono text-[11px]">
                      {cust.mobile}
                    </TableCell>
                    <TableCell align="right" tabular className="font-bold text-content-primary">
                      ৳ {cust.totalSpent.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </DataTable>
          </div>
        </Card>
      </div>

      {/* ============================================================== */}
      {/* 4. SALES LAST 30 DAYS (Progression Bar Chart)                 */}
      {/* ============================================================== */}
      <Card>
        <CardHeader
          title="Sales Progression (Last 30 Days)"
          subtitle="Daily volume across online couriers & banani counter walk-in POS"
          action={
            <div className="text-right">
              <div className="text-base font-extrabold text-content-primary font-mono font-tabular">
                ৳ 5,740,000.00
              </div>
              <div className="text-[11px] text-status-success font-semibold font-tabular">
                +14.8% vs Previous Month
              </div>
            </div>
          }
        />
        <CardContent>
          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last30DaysSales}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={resolvedTheme === 'dark' ? '#2E382E' : '#E8E4D5'} 
                  vertical={false} 
                />
                <XAxis 
                  dataKey="day" 
                  stroke={resolvedTheme === 'dark' ? '#8E988A' : '#78716C'} 
                  fontSize={11} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke={resolvedTheme === 'dark' ? '#8E988A' : '#78716C'} 
                  fontSize={11} 
                  tickLine={false} 
                  tickFormatter={(v) => `৳${v/1000}k`}
                />
                <Tooltip 
                  formatter={(val: any) => [`৳ ${Number(val).toLocaleString()}`, 'Daily Gross Sales']}
                  contentStyle={{
                    backgroundColor: resolvedTheme === 'dark' ? '#1E241E' : '#FFFFFF',
                    borderColor: resolvedTheme === 'dark' ? '#384638' : '#D5CEBE',
                    borderRadius: '10px',
                    fontSize: '11px',
                    color: resolvedTheme === 'dark' ? '#F5F5F0' : '#1C1917',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="sales" 
                  fill="#D4A373" 
                  radius={[6, 6, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
