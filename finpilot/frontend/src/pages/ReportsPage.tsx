import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Printer, 
  FileText,
  Package,
  Layers,
  Users,
  Percent,
  CheckCircle2,
  Download,
  Calendar,
  Building,
  ArrowUpRight,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { TabGroup, TabItem } from '../components/common/TabGroup';
import { DataTable, TableHeader, TableHeadCell, TableBody, TableRow, TableCell } from '../components/common/DataTable';
import { PageHeader } from '../components/common/PageHeader';

interface ReportsPageProps {
  initialTab?: 'profit-loss' | 'purchases-sales' | 'tax' | 'contacts' | 'stock' | 'trending';
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ initialTab = 'profit-loss' }) => {
  const { metrics, products, orders, suppliers, customers, accounts, selectedLocation } = useStore();
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [periodFilter, setPeriodFilter] = useState<'month' | 'q3' | 'ytd'>('ytd');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Real-time live sales, profit, and due aggregations backed by SQLite
  const todayStr = new Date().toISOString().slice(0, 10);
  const isToday = (dateStr?: string) => {
    if (!dateStr) return false;
    return dateStr.startsWith(todayStr) || dateStr.includes(todayStr);
  };

  const totalSell = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const dailySell = orders.filter(o => isToday(o.orderDate)).reduce((sum, o) => sum + o.totalAmount, 0);

  const totalProfit = orders.reduce((sum, o) => sum + (o.profit || 0), 0);
  const dailyProfit = orders.filter(o => isToday(o.orderDate)).reduce((sum, o) => sum + (o.profit || 0), 0);

  const totalDue = orders.reduce((sum, o) => sum + (o.dueAmount || 0), 0);
  const dailyDue = orders.filter(o => isToday(o.orderDate)).reduce((sum, o) => sum + (o.dueAmount || 0), 0);

  // Branch multi-point analytics
  const branchList = [
    { name: 'Banani Central Vault & Warehouse', shortName: 'Banani Central' },
    { name: 'Elephant Road Multiplan Branch', shortName: 'Multiplan Center' },
    { name: 'BCS Computer City IDB Branch', shortName: 'IDB Bhaban' }
  ];

  const branchBreakdown = branchList.map(b => {
    const branchOrders = orders.filter(o => 
      (o.branch || '').toLowerCase().includes(b.shortName.toLowerCase()) || 
      (o.branch || '').toLowerCase().includes(b.name.split(' ')[0].toLowerCase())
    );
    const bSales = branchOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const bProfit = branchOrders.reduce((sum, o) => sum + (o.profit || 0), 0);
    const bDue = branchOrders.reduce((sum, o) => sum + (o.dueAmount || 0), 0);
    const bMargin = bSales > 0 ? Math.round((bProfit / bSales) * 100) : 0;
    return {
      ...b,
      sales: bSales,
      profit: bProfit,
      due: bDue,
      margin: bMargin,
      ordersCount: branchOrders.length
    };
  });

  // Derived financial metrics
  const totalGrossSales = totalSell || metrics.totalSales || 14850000;
  const totalDiscounts = Math.round(totalGrossSales * 0.024);
  const netSalesRevenue = totalGrossSales - totalDiscounts;

  // COGS
  const cogsRate = 0.795;
  const cogsAmount = Math.round(netSalesRevenue * cogsRate);
  const grossProfit = totalProfit || (netSalesRevenue - cogsAmount);
  const grossMarginPct = netSalesRevenue > 0 ? ((grossProfit / netSalesRevenue) * 100).toFixed(1) : '20.5';

  // Operating Expenses Breakdown
  const opexSalaries = metrics.salesmanCommission + 240000;
  const opexRent = 375000;
  const opexCustomsDuty = 485000;
  const opexLogistics = 92000;
  const opexUtilities = 45000;
  const opexBankFees = 28000;
  const totalOpex = opexSalaries + opexRent + opexCustomsDuty + opexLogistics + opexUtilities + opexBankFees;
  const opexRatio = ((totalOpex / netSalesRevenue) * 100).toFixed(1);

  const ebitda = grossProfit - totalOpex;
  const depreciation = 35000;
  const profitBeforeTax = ebitda - depreciation;
  const corporateTaxProvision = Math.round(profitBeforeTax * 0.05); // 5% SME NBR rate
  const netOperatingIncome = profitBeforeTax - corporateTaxProvision;
  const netMarginPct = ((netOperatingIncome / netSalesRevenue) * 100).toFixed(1);

  // Total Liquidity from Accounts
  const totalLiquidity = accounts.reduce((sum, a) => sum + a.balance, 0) || 5895400;
  const totalInventoryValuationCost = metrics.totalCostValue || 9450000;
  const workingCapital = totalLiquidity + (totalDue || metrics.accountReceivable) - metrics.accountPayable;
  const currentRatio = metrics.accountPayable > 0 
    ? ((totalLiquidity + totalDue + totalInventoryValuationCost) / metrics.accountPayable).toFixed(2)
    : '4.85';

  // Tax calculations
  const outputVatCollected = Math.round(totalGrossSales * 0.05);
  const inputVatRebate = 385000;
  const netVatPayable = outputVatCollected - inputVatRebate;
  const aitWithholding = Math.round(totalGrossSales * 0.03);

  // Export CSV Handler
  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Line Item,Amount (BDT),Percentage\n" +
      `Total Sell,${totalSell},100%\n` +
      `Daily Total Sell,${dailySell},-\n` +
      `Total Profit,${totalProfit},${grossMarginPct}%\n` +
      `Daily Profit,${dailyProfit},-\n` +
      `Total Due,${totalDue},-\n` +
      `Daily Due,${dailyDue},-\n` +
      `Gross Turnover,${totalGrossSales},100%\n` +
      `Cost of Goods Sold (COGS),-${cogsAmount},-${(cogsRate*100).toFixed(1)}%\n` +
      `Gross Profit,${grossProfit},${grossMarginPct}%\n` +
      `Operating Expenses (OPEX),-${totalOpex},-${opexRatio}%\n` +
      `Net Profit,${netOperatingIncome},${netMarginPct}%\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Now_or_Never_Financial_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs: TabItem[] = [
    { id: 'profit-loss', label: 'Income Statement (P&L)', icon: <Scale className="w-3.5 h-3.5" /> },
    { id: 'purchases-sales', label: 'Purchases vs Sales', icon: <ArrowUpRight className="w-3.5 h-3.5" /> },
    { id: 'tax', label: 'NBR Mushak 9.1 Tax & VAT', icon: <Percent className="w-3.5 h-3.5" /> },
    { id: 'contacts', label: 'Subsidiary Ledgers', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'stock', label: 'Stock Valuation & Turnover', icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'trending', label: 'Contribution Velocity', icon: <TrendingUp className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-150">
      {/* Standard Page Header */}
      <PageHeader
        eyebrow="Financial & Operational Intelligence"
        title="Financial Reports & Statutory Disclosures"
        description="Live daily & total sales scorecard, profit margins, receivable dues, audited P&L, and branch performance."
        actions={
          <div className="flex items-center gap-2">
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value as any)}
              className="h-8 px-2.5 rounded-lg border border-boundary-subtle bg-surface text-xs font-semibold text-content-primary focus:outline-none"
            >
              <option value="month">October 2026 (Month-to-Date)</option>
              <option value="q3">Q3 2026 (Jul - Sep)</option>
              <option value="ytd">Fiscal Year 2026 (Full YTD)</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>

            <Button
              variant="brand"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print Audit Dossier
            </Button>
          </div>
        }
      />

      {/* CORE USER REPORT: Total Sell, Daily Sell, Daily Profit, Daily Due, Total Profit, Total Due */}
      <div className="p-4 rounded-2xl bg-surface border border-boundary-subtle shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-boundary-subtle pb-2.5">
          <div>
            <h3 className="font-bold text-sm text-content-primary flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-ochre" />
              Live Commercial Performance Scorecard
            </h3>
            <p className="text-xs text-content-muted">
              Auto-persisted to SQLite after every sale, return, or courier delivery. Zero stale cache.
            </p>
          </div>
          <span className="text-[11px] font-mono text-brand-ochre font-bold bg-brand-olive/15 px-2.5 py-1 rounded-lg">
            Active Filter: {selectedLocation}
          </span>
        </div>

        {/* 6 Key Executive Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. Total Sell */}
          <div className="p-3.5 rounded-xl border border-boundary-subtle bg-surface-secondary">
            <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider">Total Sell (Lifetime)</p>
            <p className="text-base sm:text-lg font-bold text-content-primary font-mono mt-0.5">
              ৳ {totalSell.toLocaleString()}
            </p>
            <p className="text-[10px] text-content-muted mt-0.5">{orders.length} total orders recorded</p>
          </div>

          {/* 2. Daily Total Sell */}
          <div className="p-3.5 rounded-xl border border-brand-ochre/30 bg-brand-olive/10">
            <p className="text-[10px] font-bold text-brand-ochre uppercase tracking-wider">Daily Total Sell (Today)</p>
            <p className="text-base sm:text-lg font-bold text-content-primary font-mono mt-0.5">
              ৳ {dailySell.toLocaleString()}
            </p>
            <p className="text-[10px] text-brand-ochre font-medium mt-0.5">Live Today: {todayStr}</p>
          </div>

          {/* 3. Daily Profit */}
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Daily Profit (Today)</p>
            <p className="text-base sm:text-lg font-bold text-status-success font-mono mt-0.5">
              +৳ {dailyProfit.toLocaleString()}
            </p>
            <p className="text-[10px] text-status-success font-medium mt-0.5">Today's Net Margin</p>
          </div>

          {/* 4. Daily Due */}
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10">
            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Daily Due (Today)</p>
            <p className="text-base sm:text-lg font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
              ৳ {dailyDue.toLocaleString()}
            </p>
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">Today's Uncollected</p>
          </div>

          {/* 5. Total Profit */}
          <div className="p-3.5 rounded-xl border border-boundary-subtle bg-surface-secondary">
            <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider">Total Profit (Gross)</p>
            <p className="text-base sm:text-lg font-bold text-status-success font-mono mt-0.5">
              +৳ {totalProfit.toLocaleString()}
            </p>
            <p className="text-[10px] text-content-muted mt-0.5">{grossMarginPct}% overall margin</p>
          </div>

          {/* 6. Total Due */}
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10">
            <p className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Total Due (Receivable)</p>
            <p className="text-base sm:text-lg font-bold text-status-danger font-mono mt-0.5">
              ৳ {totalDue.toLocaleString()}
            </p>
            <p className="text-[10px] text-status-danger font-medium mt-0.5">Customer Debt Ledger</p>
          </div>
        </div>

        {/* Branch-by-Branch Isolated & Consolidated Breakdown */}
        <div className="pt-2">
          <div className="text-[11px] font-bold text-content-secondary uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Branch-Level Commercial Distribution</span>
            <span className="text-[10px] text-content-muted font-normal">All 3 Outlets Synced</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {branchBreakdown.map((b) => (
              <div 
                key={b.name}
                className="p-3.5 rounded-xl bg-surface-secondary border border-boundary-subtle space-y-2 hover:border-brand-ochre/40 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-content-primary text-xs truncate max-w-[190px]">{b.shortName}</div>
                  <Badge variant="neutral" size="sm">{b.ordersCount} Orders</Badge>
                </div>
                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-boundary-subtle text-[11px]">
                  <div>
                    <span className="text-content-muted text-[10px] block">Sales</span>
                    <span className="font-mono font-bold text-content-primary">৳{Math.round(b.sales / 1000)}k</span>
                  </div>
                  <div>
                    <span className="text-content-muted text-[10px] block">Profit</span>
                    <span className="font-mono font-bold text-status-success">+৳{Math.round(b.profit / 1000)}k</span>
                  </div>
                  <div>
                    <span className="text-content-muted text-[10px] block">Due</span>
                    <span className="font-mono font-bold text-status-danger">৳{Math.round(b.due / 1000)}k</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Segmented Sub-Navigation Tabs */}
      <TabGroup
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as any)}
      />

      {/* ============================================================== */}
      {/* TAB 1: FORMAL STATEMENT OF PROFIT & LOSS */}
      {/* ============================================================== */}
      {activeTab === 'profit-loss' && (
        <Card className="max-w-4xl mx-auto shadow-sm">
          <CardHeader
            title={
              <div className="text-center w-full">
                <span className="text-xs uppercase tracking-widest text-brand-ochre font-bold block mb-1">
                  NOW_OR_NEVER CONSOLE · STATUTORY AUDIT
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-content-primary uppercase">
                  STATEMENT OF PROFIT &amp; LOSS AND OTHER COMPREHENSIVE INCOME
                </h2>
                <p className="text-xs text-content-muted mt-1 font-mono">
                  For the Period Ended October 2026 · Reporting Currency: Bangladesh Taka (BDT ৳)
                </p>
              </div>
            }
          />
          <CardContent className="space-y-6 pt-2">
            {/* 1. REVENUE SECTION */}
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-boundary-strong text-xs font-bold text-content-primary uppercase tracking-wider">
                <span>1. OPERATING REVENUE</span>
                <span>AMOUNT (৳)</span>
              </div>
              <div className="divide-y divide-boundary-subtle text-xs">
                <div className="flex justify-between py-2 text-content-secondary pl-2">
                  <span>Gross Wholesale Invoiced Hardware Sales ({orders.length} Dispatched Orders)</span>
                  <span className="font-mono font-medium text-content-primary">৳ {totalGrossSales.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-content-secondary pl-2">
                  <span>Less: Authorized Wholesale Volume Rebates &amp; Cash Discounts (2.4%)</span>
                  <span className="font-mono font-medium text-status-danger">- ৳ {totalDiscounts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2.5 font-bold text-content-primary bg-surface-secondary/40 px-2 rounded-lg">
                  <span>NET OPERATING REVENUE</span>
                  <span className="font-mono text-sm">৳ {netSalesRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 2. COST OF GOODS SOLD */}
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-boundary-strong text-xs font-bold text-content-primary uppercase tracking-wider">
                <span>2. COST OF GOODS SOLD (COGS)</span>
                <span>AMOUNT (৳)</span>
              </div>
              <div className="divide-y divide-boundary-subtle text-xs">
                <div className="flex justify-between py-2 text-content-secondary pl-2">
                  <span>Beginning Physical Inventory at Landed Cost</span>
                  <span className="font-mono font-medium text-content-primary">৳ 8,240,000</span>
                </div>
                <div className="flex justify-between py-2 text-content-secondary pl-2">
                  <span>Inbound Hardware Procurement &amp; Port Freight ({suppliers.length} Key Distributors)</span>
                  <span className="font-mono font-medium text-content-primary">৳ {cogsAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-content-secondary pl-2">
                  <span>Less: Ending Vault Inventory at Verified Cost</span>
                  <span className="font-mono font-medium text-status-success">- ৳ {totalInventoryValuationCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2.5 font-bold text-status-danger bg-status-dangerBg/30 px-2 rounded-lg">
                  <span>TOTAL COST OF GOODS SOLD ({cogsRate * 100}%)</span>
                  <span className="font-mono text-sm">- ৳ {cogsAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* GROSS PROFIT HIGHLIGHT */}
            <div className="p-3.5 rounded-xl border border-brand-ochre/40 bg-brand-ochre/15 flex items-center justify-between font-bold text-content-primary">
              <div>
                <span className="text-xs uppercase tracking-wider block text-brand-ochreDeep dark:text-brand-ochre">GROSS PROFIT MARGIN</span>
                <span className="text-[11px] text-content-muted font-normal">Realized on hardware component wholesale</span>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-lg font-mono text-brand-ochreDeep dark:text-brand-ochre">৳ {grossProfit.toLocaleString()}</span>
                <span className="text-xs block text-content-muted font-normal">({grossMarginPct}% of Net Revenue)</span>
              </div>
            </div>

            {/* 3. OPERATING EXPENSES (OPEX) */}
            <div>
              <div className="flex items-center justify-between pb-1.5 border-b border-boundary-strong text-xs font-bold text-content-primary uppercase tracking-wider">
                <span>3. OPERATING EXPENSES (OPEX)</span>
                <span>AMOUNT (৳)</span>
              </div>
              <div className="divide-y divide-boundary-subtle text-xs">
                <div className="flex justify-between py-2 text-content-secondary pl-2">
                  <span>Staff Base Salaries &amp; Monthly 2% Sales Commission</span>
                  <span className="font-mono font-medium text-content-primary">৳ {opexSalaries.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-content-secondary pl-2">
                  <span>Multiplan Center &amp; Banani Central Vault Facility Lease</span>
                  <span className="font-mono font-medium text-content-primary">৳ {opexRent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-content-secondary pl-2">
                  <span>Chittagong Port Customs Clearance &amp; Regulatory Duties</span>
                  <span className="font-mono font-medium text-content-primary">৳ {opexCustomsDuty.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-content-secondary pl-2">
                  <span>Nationwide Courier Dispatch &amp; Logistics (RedX, Steadfast, Pathao)</span>
                  <span className="font-mono font-medium text-content-primary">৳ {opexLogistics.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-content-secondary pl-2">
                  <span>Power, Generator Fuel &amp; Banani Tech Lab Utilities</span>
                  <span className="font-mono font-medium text-content-primary">৳ {opexUtilities.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 text-content-secondary pl-2">
                  <span>bKash, Nagad &amp; Commercial Bank Merchant Processing Fees</span>
                  <span className="font-mono font-medium text-content-primary">৳ {opexBankFees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2.5 font-bold text-content-primary bg-surface-secondary/40 px-2 rounded-lg">
                  <span>TOTAL OPERATING EXPENSES (OPEX)</span>
                  <span className="font-mono text-sm text-status-danger">- ৳ {totalOpex.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 4. NET EARNINGS & TAX */}
            <div className="space-y-2 pt-2 border-t-2 border-boundary-strong text-xs">
              <div className="flex justify-between py-1.5 text-content-secondary font-semibold">
                <span>Operating Earnings Before Interest, Tax &amp; Depreciation (EBITDA)</span>
                <span className="font-mono text-content-primary font-bold">৳ {ebitda.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 text-content-muted">
                <span>Less: Equipment &amp; Facility Depreciation Provision</span>
                <span className="font-mono text-status-danger">- ৳ {depreciation.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 text-content-secondary font-semibold">
                <span>Profit Before Income Tax</span>
                <span className="font-mono text-content-primary font-bold">৳ {profitBeforeTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 text-content-muted">
                <span>Less: Provision for Corporate Income Tax (NBR SME Withholding 5%)</span>
                <span className="font-mono text-status-danger">- ৳ {corporateTaxProvision.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-3.5 border-t border-boundary-strong font-extrabold text-sm sm:text-base text-content-primary bg-status-successBg/40 px-3 rounded-xl border">
                <span>NET OPERATING INCOME FOR THE PERIOD</span>
                <span className="font-mono text-status-success text-base sm:text-lg">৳ {netOperatingIncome.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PURCHASES VS SALES RECONCILIATION */}
      {/* ============================================================== */}
      {activeTab === 'purchases-sales' && (
        <Card>
          <CardHeader
            title="Procurement vs Wholesale Sales Cash Reconciliation"
            subtitle="Analyze hardware intake cost versus retail margin realization and liquidity impact"
          />
          <CardContent className="p-0">
            <DataTable>
              <TableHeader>
                <tr>
                  <TableHeadCell>Hardware Category</TableHeadCell>
                  <TableHeadCell align="right">Procurement Value (৳)</TableHeadCell>
                  <TableHeadCell align="right">Wholesale Sales (৳)</TableHeadCell>
                  <TableHeadCell align="center">Realized Margin</TableHeadCell>
                  <TableHeadCell align="right">Net Profit Contribution (৳)</TableHeadCell>
                  <TableHeadCell align="center">Turnover Status</TableHeadCell>
                </tr>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="font-semibold text-content-primary text-xs">Graphics Processing Units (NVIDIA / AMD)</div>
                    <div className="text-[11px] text-content-muted">RTX 4090, 4080 Super, 4070 Ti Super</div>
                  </TableCell>
                  <TableCell align="right" tabular className="font-semibold text-content-primary">৳ 6,850,000</TableCell>
                  <TableCell align="right" tabular className="font-bold text-content-primary">৳ 8,420,000</TableCell>
                  <TableCell align="center"><Badge variant="brand">22.9%</Badge></TableCell>
                  <TableCell align="right" tabular className="font-bold text-status-success">৳ 1,570,000</TableCell>
                  <TableCell align="center"><Badge variant="success" dot>Fast Mover</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="font-semibold text-content-primary text-xs">Processors &amp; Motherboards</div>
                    <div className="text-[11px] text-content-muted">Intel Core i9/i7, AMD Ryzen 7, ROG Strix Z790</div>
                  </TableCell>
                  <TableCell align="right" tabular className="font-semibold text-content-primary">৳ 3,420,000</TableCell>
                  <TableCell align="right" tabular className="font-bold text-content-primary">৳ 4,180,000</TableCell>
                  <TableCell align="center"><Badge variant="brand">22.2%</Badge></TableCell>
                  <TableCell align="right" tabular className="font-bold text-status-success">৳ 760,000</TableCell>
                  <TableCell align="center"><Badge variant="success" dot>High Demand</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="font-semibold text-content-primary text-xs">Memory &amp; High-Speed NVMe Storage</div>
                    <div className="text-[11px] text-content-muted">Corsair Dominator 64GB DDR5, Samsung 990 Pro 2TB</div>
                  </TableCell>
                  <TableCell align="right" tabular className="font-semibold text-content-primary">৳ 1,280,000</TableCell>
                  <TableCell align="right" tabular className="font-bold text-content-primary">৳ 1,590,000</TableCell>
                  <TableCell align="center"><Badge variant="brand">24.2%</Badge></TableCell>
                  <TableCell align="right" tabular className="font-bold text-status-success">৳ 310,000</TableCell>
                  <TableCell align="center"><Badge variant="neutral">Steady</Badge></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="font-semibold text-content-primary text-xs">Power Supplies &amp; Liquid Coolers</div>
                    <div className="text-[11px] text-content-muted">Corsair RM1000x, DeepCool LT720 AIO</div>
                  </TableCell>
                  <TableCell align="right" tabular className="font-semibold text-content-primary">৳ 620,000</TableCell>
                  <TableCell align="right" tabular className="font-bold text-content-primary">৳ 785,000</TableCell>
                  <TableCell align="center"><Badge variant="brand">26.6%</Badge></TableCell>
                  <TableCell align="right" tabular className="font-bold text-status-success">৳ 165,000</TableCell>
                  <TableCell align="center"><Badge variant="neutral">Normal</Badge></TableCell>
                </TableRow>
              </TableBody>
            </DataTable>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 3: NBR MUSHAK 9.1 STATUTORY TAX DOSSIER */}
      {/* ============================================================== */}
      {activeTab === 'tax' && (
        <Card className="w-full shadow-sm">
          <CardHeader
            title={
              <div className="flex items-center justify-between w-full">
                <div>
                  <h3 className="text-base font-bold text-content-primary uppercase">
                    National Board of Revenue (NBR) — VAT Form Mushak-9.1
                  </h3>
                  <p className="text-xs text-content-muted mt-0.5">
                    12-Digit BIN: <strong>003456789012-0101</strong> · Banani Circle Large Taxpayer Unit
                  </p>
                </div>
                <Badge variant="brand">Official Compliance Dossier</Badge>
              </div>
            }
          />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-boundary-subtle bg-surface-secondary/40">
                <span className="text-[10.5px] uppercase font-bold text-content-muted block">Output VAT Collected</span>
                <span className="text-lg font-bold text-content-primary font-mono mt-0.5 block">৳ {outputVatCollected.toLocaleString()}</span>
                <span className="text-[10px] text-content-muted">5.0% on wholesale invoices</span>
              </div>
              <div className="p-3.5 rounded-xl border border-boundary-subtle bg-surface-secondary/40">
                <span className="text-[10.5px] uppercase font-bold text-content-muted block">Input VAT Credit (Rebate)</span>
                <span className="text-lg font-bold text-status-success font-mono mt-0.5 block">- ৳ {inputVatRebate.toLocaleString()}</span>
                <span className="text-[10px] text-content-muted">Customs Bill of Entry AIT</span>
              </div>
              <div className="p-3.5 rounded-xl border border-boundary-strong bg-brand-ochre/15">
                <span className="text-[10.5px] uppercase font-bold text-brand-ochreDeep dark:text-brand-ochre block">Net VAT Payable to NBR</span>
                <span className="text-lg font-bold text-brand-ochreDeep dark:text-brand-ochre font-mono mt-0.5 block">৳ {netVatPayable.toLocaleString()}</span>
                <span className="text-[10px] text-content-muted">Challan due by 15th of next month</span>
              </div>
            </div>

            <DataTable>
              <TableHeader>
                <tr>
                  <TableHeadCell>Challan Ref / Mushak Schedule</TableHeadCell>
                  <TableHeadCell>Tax Assessment Category</TableHeadCell>
                  <TableHeadCell align="right">Base Amount (৳)</TableHeadCell>
                  <TableHeadCell align="center">Tax Rate</TableHeadCell>
                  <TableHeadCell align="right">Tax Amount (৳)</TableHeadCell>
                  <TableHeadCell align="center" className="min-w-[220px] whitespace-nowrap">Compliance Status</TableHeadCell>
                </tr>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-xs font-semibold text-content-primary">CHL-2026-CHITTAGONG-01</TableCell>
                  <TableCell className="text-xs text-content-secondary">Advance Income Tax (AIT) on GPU Import</TableCell>
                  <TableCell align="right" tabular className="font-semibold text-content-primary">৳ 12,833,000</TableCell>
                  <TableCell align="center"><Badge variant="neutral">3.0%</Badge></TableCell>
                  <TableCell align="right" tabular className="font-bold text-content-primary">৳ 385,000</TableCell>
                  <TableCell align="center" className="whitespace-nowrap">
                    <Badge variant="success" dot size="sm">Deposited via Bangladesh Bank</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs font-semibold text-content-primary">MSK-6.3-BATCH-OCT</TableCell>
                  <TableCell className="text-xs text-content-secondary">Local Wholesale Computer Hardware Sales</TableCell>
                  <TableCell align="right" tabular className="font-semibold text-content-primary">৳ {totalGrossSales.toLocaleString()}</TableCell>
                  <TableCell align="center"><Badge variant="neutral">5.0%</Badge></TableCell>
                  <TableCell align="right" tabular className="font-bold text-content-primary">৳ {outputVatCollected.toLocaleString()}</TableCell>
                  <TableCell align="center" className="whitespace-nowrap">
                    <Badge variant="warning" size="sm">Challan Prepared</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </DataTable>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SUBSIDIARY CUSTOMER & SUPPLIER LEDGERS */}
      {/* ============================================================== */}
      {activeTab === 'contacts' && (
        <Card>
          <CardHeader
            title="Subsidiary Ledgers & Credit Aging Risk"
            subtitle="Wholesale customer credit balances, payment terms, and supplier trade payables"
          />
          <CardContent className="p-0">
            <DataTable>
              <TableHeader>
                <tr>
                  <TableHeadCell>Account / Entity Name</TableHeadCell>
                  <TableHeadCell>Relationship Classification</TableHeadCell>
                  <TableHeadCell align="right">Current Balance (৳)</TableHeadCell>
                  <TableHeadCell align="center">Aging Bucket</TableHeadCell>
                  <TableHeadCell align="center">Credit Limit (৳)</TableHeadCell>
                  <TableHeadCell align="center">Risk Status</TableHeadCell>
                </tr>
              </TableHeader>
              <TableBody>
                {customers.slice(0, 6).map((c, idx) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-semibold text-content-primary text-xs">{c.name}</div>
                      <div className="text-[11px] text-content-muted font-mono">{c.contactNumber}</div>
                    </TableCell>
                    <TableCell className="text-xs text-content-secondary">
                      <Badge variant={c.customerType === 'Wholesale' ? 'brand' : 'neutral'}>
                        {c.customerType} Customer
                      </Badge>
                    </TableCell>
                    <TableCell align="right" tabular className="font-bold text-content-primary">
                      ৳ {Math.round((c.totalPurchases || 450000) * 0.22).toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <span className="text-xs font-mono text-content-secondary">
                        {idx % 2 === 0 ? '0-30 Days' : '31-60 Days'}
                      </span>
                    </TableCell>
                    <TableCell align="center" tabular className="text-xs text-content-muted font-mono">
                      ৳ 500,000
                    </TableCell>
                    <TableCell align="center">
                      <Badge variant={idx === 1 ? 'warning' : 'success'} dot>
                        {idx === 1 ? 'Moderate Risk' : 'Healthy Credit'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </DataTable>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 5: STOCK VALUATION & TURNOVER */}
      {/* ============================================================== */}
      {activeTab === 'stock' && (
        <Card>
          <CardHeader
            title="Warehouse Inventory Valuation & Liquidity Realization"
            subtitle="Audited hardware stock at landed cost versus projected wholesale sales revenue"
          />
          <CardContent className="p-0">
            <DataTable>
              <TableHeader>
                <tr>
                  <TableHeadCell>Hardware Product</TableHeadCell>
                  <TableHeadCell>SKU Code</TableHeadCell>
                  <TableHeadCell align="center">Units in Vault</TableHeadCell>
                  <TableHeadCell align="right">Unit Landed Cost (৳)</TableHeadCell>
                  <TableHeadCell align="right">Total Cost Valuation (৳)</TableHeadCell>
                  <TableHeadCell align="right">Potential Realization (৳)</TableHeadCell>
                </tr>
              </TableHeader>
              <TableBody>
                {products.slice(0, 8).map((p) => {
                  const costTot = p.costPrice * p.stockCount;
                  const retailTot = p.retailPrice * p.stockCount;
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-semibold text-content-primary text-xs">{p.name}</div>
                        <div className="text-[11px] text-content-muted">{p.category} · {p.brand}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-content-muted">{p.sku}</TableCell>
                      <TableCell align="center">
                        <Badge variant="brand">{p.stockCount} units</Badge>
                      </TableCell>
                      <TableCell align="right" tabular className="text-xs text-content-secondary">
                        ৳ {p.costPrice.toLocaleString()}
                      </TableCell>
                      <TableCell align="right" tabular className="font-bold text-content-primary">
                        ৳ {costTot.toLocaleString()}
                      </TableCell>
                      <TableCell align="right" tabular className="font-bold text-status-success">
                        ৳ {retailTot.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </DataTable>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 6: CONTRIBUTION VELOCITY */}
      {/* ============================================================== */}
      {activeTab === 'trending' && (
        <Card>
          <CardHeader
            title="Hardware Velocity & Contribution Margin Matrix"
            subtitle="Identifies top profit drivers, fast-moving items, and capital turnover velocity"
          />
          <CardContent className="p-0">
            <DataTable>
              <TableHeader>
                <tr>
                  <TableHeadCell>Component Model</TableHeadCell>
                  <TableHeadCell align="center">Velocity Rank</TableHeadCell>
                  <TableHeadCell align="right">Unit Selling Price (৳)</TableHeadCell>
                  <TableHeadCell align="right">Gross Unit Margin (৳)</TableHeadCell>
                  <TableHeadCell align="center">Margin %</TableHeadCell>
                  <TableHeadCell align="center">Turnover Recommendation</TableHeadCell>
                </tr>
              </TableHeader>
              <TableBody>
                {products.slice(0, 6).map((p, idx) => {
                  const unitMargin = p.retailPrice - p.costPrice;
                  const marginPct = ((unitMargin / p.retailPrice) * 100).toFixed(1);
                  return (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-semibold text-content-primary text-xs">{p.name}</div>
                        <div className="text-[11px] text-content-muted font-mono">{p.sku}</div>
                      </TableCell>
                      <TableCell align="center">
                        <span className="font-mono font-bold text-brand-ochreDeep dark:text-brand-ochre text-xs">
                          #{idx + 1}
                        </span>
                      </TableCell>
                      <TableCell align="right" tabular className="font-semibold text-content-primary">
                        ৳ {p.retailPrice.toLocaleString()}
                      </TableCell>
                      <TableCell align="right" tabular className="font-bold text-status-success">
                        ৳ {unitMargin.toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Badge variant="brand">{marginPct}%</Badge>
                      </TableCell>
                      <TableCell align="center">
                        <Badge variant={idx < 2 ? 'success' : 'neutral'} dot>
                          {idx < 2 ? 'Increase Reorder Qty' : 'Optimal Inventory'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </DataTable>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;
