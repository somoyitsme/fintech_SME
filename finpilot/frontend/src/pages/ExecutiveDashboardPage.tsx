import React, { useMemo } from 'react';
import { AlertTriangle, ArrowUpRight, CalendarDays, CircleDollarSign, Package, ReceiptText, ShoppingCart } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useStore } from '../context/StoreContext';
import { Button } from '../components/common/Button';
import { Card, CardContent, CardHeader } from '../components/common/Card';
import { DataTable, TableBody, TableCell, TableHeadCell, TableHeader, TableRow } from '../components/common/DataTable';
import { MetricCard } from '../components/common/MetricCard';
import { PageHeader } from '../components/common/PageHeader';
import { Select } from '../components/common/Select';
import { useTheme } from '../context/ThemeContext';

interface ExecutiveDashboardPageProps {
  onNavigateTab: (tab: string) => void;
  userName?: string;
}

export const ExecutiveDashboardPage: React.FC<ExecutiveDashboardPageProps> = ({ onNavigateTab, userName = 'there' }) => {
  const { dateFilter, metrics, orders, products, selectedLocation, setDateFilter, setSelectedLocation } = useStore();
  const { resolvedTheme } = useTheme();

  const salesTrend = useMemo(() => {
    const grouped = new Map<string, number>();
    orders.forEach((order) => grouped.set(order.orderDate, (grouped.get(order.orderDate) || 0) + order.totalAmount));
    return Array.from(grouped.entries()).slice(-8).map(([date, sales]) => ({ date, sales }));
  }, [orders]);

  const lowStock = products.filter((product) => product.stockCount <= product.minThreshold).slice(0, 3);
  const openOrders = orders.filter((order) => !['Delivered', 'Counter Collected'].includes(order.status));
  const creditOrders = orders.filter((order) => order.paymentStatus === 'Credit 30D' || order.paymentStatus === 'Partial');
  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title={`Good to see you, ${userName.split(' ')[0]}`}
        description="A focused view of sales performance, outstanding work, and inventory that needs attention."
        actions={
          <div className="flex flex-wrap gap-2">
            <Select aria-label="Location" value={selectedLocation} onChange={(event) => setSelectedLocation(event.target.value)} className="!w-[180px]">
              <option>All Locations</option>
              <option>Banani Central Vault & Warehouse</option>
              <option>Elephant Road Multiplan Branch</option>
              <option>BCS Computer City IDB Branch</option>
            </Select>
            <Select aria-label="Reporting period" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} className="!w-[148px]">
              <option value="today">Today</option>
              <option value="week">This week</option>
              <option value="month">This month</option>
              <option value="past30">Past 30 days</option>
              <option value="all">All history</option>
            </Select>
          </div>
        }
      />

      <section aria-label="Key business indicators" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <MetricCard label="Sales revenue" value={`৳ ${metrics.totalSales.toLocaleString()}`} subtitle="For the selected period" icon={<CircleDollarSign className="w-5 h-5" />} accent="ochre" onClick={() => onNavigateTab('sell-all')} />
        <MetricCard label="Net profit" value={`৳ ${metrics.netProfit.toLocaleString()}`} subtitle={`Gross profit ৳ ${metrics.grossProfit.toLocaleString()}`} icon={<ReceiptText className="w-5 h-5" />} accent="sage" onClick={() => onNavigateTab('reports-profit-loss')} />
        <MetricCard label="Receivables" value={`৳ ${metrics.accountReceivable.toLocaleString()}`} subtitle={`${creditOrders.length} credit or partial orders`} icon={<ShoppingCart className="w-5 h-5" />} accent="olive" onClick={() => onNavigateTab('sell-all')} />
        <MetricCard label="Inventory at cost" value={`৳ ${metrics.stockPurchasePrice.toLocaleString()}`} subtitle={`${metrics.totalStockUnits.toLocaleString()} units on hand`} icon={<Package className="w-5 h-5" />} accent="neutral" onClick={() => onNavigateTab('products-list')} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)] gap-5">
        <Card>
          <CardHeader
            title="Sales trend"
            subtitle="Order totals from the existing sales ledger"
            action={<Button variant="ghost" size="sm" onClick={() => onNavigateTab('reports-purchases-sales')} rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}>View report</Button>}
          />
          <CardContent>
            <div className="h-64">
              {salesTrend.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesTrend} margin={{ top: 8, right: 6, left: -12, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke={resolvedTheme === 'dark' ? '#2E382E' : '#E8E4D5'} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: resolvedTheme === 'dark' ? '#8E988A' : '#78716C', fontSize: 11 }} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `৳${Math.round(value / 1000)}k`} tick={{ fill: resolvedTheme === 'dark' ? '#8E988A' : '#78716C', fontSize: 11 }} />
                    <Tooltip formatter={(value) => [`৳ ${Number(value).toLocaleString()}`, 'Sales']} contentStyle={{ background: resolvedTheme === 'dark' ? '#181C18' : '#FFFFFF', borderColor: resolvedTheme === 'dark' ? '#404E40' : '#D5CEBE', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="sales" fill="#D4A373" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-full grid place-items-center text-sm text-content-muted">No sales are available for this period.</div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Needs attention" subtitle="Operational items requiring a follow-up" />
          <CardContent className="space-y-3">
            <button onClick={() => onNavigateTab('sell-all')} className="w-full text-left flex gap-3 rounded-md p-2.5 hover:bg-surface-secondary transition-colors">
              <span className="mt-0.5 w-7 h-7 rounded-md bg-brand-sand/60 text-brand-ochreDeep flex items-center justify-center"><CalendarDays className="w-4 h-4" /></span>
              <span><span className="block text-xs font-semibold text-content-primary">{openOrders.length} orders in progress</span><span className="block mt-0.5 text-[11px] text-content-muted">Review fulfilment and delivery status.</span></span>
            </button>
            <button onClick={() => onNavigateTab('sell-all')} className="w-full text-left flex gap-3 rounded-md p-2.5 hover:bg-surface-secondary transition-colors">
              <span className="mt-0.5 w-7 h-7 rounded-md bg-brand-olive/70 text-stone-800 flex items-center justify-center"><ReceiptText className="w-4 h-4" /></span>
              <span><span className="block text-xs font-semibold text-content-primary">{creditOrders.length} receivable orders</span><span className="block mt-0.5 text-[11px] text-content-muted">Outstanding credit should be reviewed.</span></span>
            </button>
            <button onClick={() => onNavigateTab('products-list')} className="w-full text-left flex gap-3 rounded-md p-2.5 hover:bg-surface-secondary transition-colors">
              <span className="mt-0.5 w-7 h-7 rounded-md bg-status-warningBg text-status-warning flex items-center justify-center"><AlertTriangle className="w-4 h-4" /></span>
              <span><span className="block text-xs font-semibold text-content-primary">{lowStock.length} low-stock products</span><span className="block mt-0.5 text-[11px] text-content-muted">{lowStock.map((product) => product.name).join(', ') || 'No low-stock items.'}</span></span>
            </button>
          </CardContent>
        </Card>
      </section>

      <section>
        <div className="flex items-end justify-between mb-3">
          <div><h2 className="section-heading">Recent sales activity</h2><p className="section-description">Latest transactions from the sales ledger.</p></div>
          <Button variant="ghost" size="sm" onClick={() => onNavigateTab('sell-all')}>All orders</Button>
        </div>
        <DataTable isEmpty={!recentOrders.length} emptyMessage="No sales have been recorded yet.">
          <TableHeader><tr><TableHeadCell>Order</TableHeadCell><TableHeadCell>Customer</TableHeadCell><TableHeadCell>Status</TableHeadCell><TableHeadCell align="right">Total</TableHeadCell></tr></TableHeader>
          <TableBody>{recentOrders.map((order) => <TableRow key={order.id} onClick={() => onNavigateTab('sell-all')}><TableCell><span className="font-semibold">{order.orderNumber}</span><span className="block mt-0.5 text-[11px] text-content-muted">{order.orderDate}</span></TableCell><TableCell>{order.customerName}</TableCell><TableCell className="text-content-secondary">{order.status}</TableCell><TableCell align="right" tabular className="font-semibold">৳ {order.totalAmount.toLocaleString()}</TableCell></TableRow>)}</TableBody>
        </DataTable>
      </section>
    </div>
  );
};
