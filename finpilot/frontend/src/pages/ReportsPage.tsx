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
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/common/Card';
import { MetricCard } from '../components/common/MetricCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { TabGroup } from '../components/common/TabGroup';
import { DataTable, TableHeader, TableHeadCell, TableBody, TableRow, TableCell } from '../components/common/DataTable';
import { PageHeader } from '../components/common/PageHeader';

interface ReportsPageProps {
  initialTab?: 'profit-loss' | 'purchases-sales' | 'tax' | 'contacts' | 'stock' | 'trending';
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ initialTab = 'profit-loss' }) => {
  const { metrics, products, orders, suppliers, customers } = useStore();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const totalVatCollected = Math.round(metrics.totalSales * 0.05);
  const vatPaidOnImports = 385000;
  const netVatPayable = totalVatCollected - vatPaidOnImports;

  const tabs = [
    { id: 'profit-loss', label: 'Profit / Loss' },
    { id: 'purchases-sales', label: 'Purchases vs Sales' },
    { id: 'tax', label: 'NBR Tax & VAT' },
    { id: 'contacts', label: 'Supplier & Customer Ledger' },
    { id: 'stock', label: 'Stock Valuation' },
    { id: 'trending', label: 'Velocity Ranking' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance & reports"
        title="Reports"
        description="Select a financial, tax, contacts, or inventory report and inspect its underlying records."
        actions={<Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
        >
          <Printer className="w-4 h-4 mr-1.5" />
          Print Audit Report
        </Button>}
      />

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-content-secondary">
        <span><strong className="font-semibold text-content-primary">৳ {metrics.totalSales.toLocaleString()}</strong> turnover</span>
        <span><strong className="font-semibold text-content-primary">৳ {metrics.grossProfit.toLocaleString()}</strong> gross profit</span>
        <span><strong className="font-semibold text-content-primary">৳ {metrics.netProfit.toLocaleString()}</strong> net profit</span>
        <span><strong className="font-semibold text-content-primary">৳ {netVatPayable.toLocaleString()}</strong> VAT payable</span>
      </div>

      {/* Sub Tabs Navigation */}
      <TabGroup
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* ============================================================== */}
      {/* 1. PROFIT & LOSS */}
      {/* ============================================================== */}
      {activeTab === 'profit-loss' && (
        <Card className="p-6 space-y-4 max-w-2xl mx-auto">
          <div className="text-center pb-3 border-b border-boundary-subtle">
            <h2 className="font-bold text-base text-content-primary uppercase">STATEMENT OF PROFIT & LOSS</h2>
            <div className="text-xs text-content-muted mt-0.5">5-Month Trading Period: May 2026 – October 2026</div>
          </div>

          <div className="space-y-2 text-xs font-medium">
            <div className="flex justify-between py-1.5 text-content-secondary">
              <span>Gross Sales Revenue ({orders.length} Invoices):</span>
              <span className="font-tabular font-bold text-content-primary">৳ {metrics.totalSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 text-content-muted">
              <span>Less: Estimated Cost of Goods Sold (COGS):</span>
              <span className="font-tabular font-semibold text-status-danger">- ৳ {Math.round(metrics.totalSales * 0.81).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-boundary-subtle font-bold text-status-success text-sm">
              <span>GROSS PROFIT MARGIN:</span>
              <span className="font-tabular font-bold">৳ {metrics.grossProfit.toLocaleString()}</span>
            </div>

            <div className="pt-2 text-content-muted space-y-1">
              <div className="font-bold text-content-primary text-[11px] uppercase">Operating Expenses:</div>
              <div className="flex justify-between pl-2">
                <span>Chittagong Port Customs & Import Tariffs:</span>
                <span className="font-tabular font-semibold text-status-danger">- ৳ 725,000</span>
              </div>
              <div className="flex justify-between pl-2">
                <span>Multiplan Center & Banani Vault Showroom Lease:</span>
                <span className="font-tabular font-semibold text-status-danger">- ৳ 325,000</span>
              </div>
              <div className="flex justify-between pl-2">
                <span>Staff Payroll & 2% Sales Commission:</span>
                <span className="font-tabular font-semibold text-status-danger">- ৳ {(metrics.salesmanCommission + 175000).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between py-2.5 border-t-2 border-boundary font-bold text-content-primary text-base">
              <span>NET OPERATING PROFIT:</span>
              <span className="font-tabular font-bold text-status-success">৳ {metrics.netProfit.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      )}

      {/* ============================================================== */}
      {/* 2. PURCHASE & SALE COMPARISON */}
      {/* ============================================================== */}
      {activeTab === 'purchases-sales' && (
        <Card className="p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-boundary-subtle">
            <div>
              <h3 className="font-bold text-content-primary text-sm">Monthly Purchase vs Sales Comparative Audit</h3>
              <p className="text-xs text-content-muted">5-month volume and margin velocity comparison</p>
            </div>
            <span className="text-xs text-brand-ochre font-mono font-bold">5-Month Turnover: ৳ {metrics.totalSales.toLocaleString()}</span>
          </div>

          <DataTable isEmpty={false}>
            <TableHeader>
              <tr>
                <TableHeadCell>Month</TableHeadCell>
                <TableHeadCell align="right">Purchase Volume (৳)</TableHeadCell>
                <TableHeadCell align="right">Sales Revenue (৳)</TableHeadCell>
                <TableHeadCell align="right">Gross Profit (৳)</TableHeadCell>
                <TableHeadCell align="center">Gross Margin %</TableHeadCell>
              </tr>
            </TableHeader>
            <TableBody>
              {[
                { month: "May 2026", purchase: 2150000, sales: 2680000, profit: 530000, margin: "19.8%" },
                { month: "June 2026", purchase: 2300000, sales: 2890000, profit: 590000, margin: "20.4%" },
                { month: "July 2026", purchase: 2450000, sales: 3050000, profit: 600000, margin: "19.7%" },
                { month: "August 2026", purchase: 2400000, sales: 2980000, profit: 580000, margin: "19.5%" },
                { month: "September 2026", purchase: 2520000, sales: 3122347, profit: 602347, margin: "19.3%" }
              ].map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-semibold text-content-primary">{row.month}</TableCell>
                  <TableCell align="right" tabular className="text-content-secondary">৳ {row.purchase.toLocaleString()}</TableCell>
                  <TableCell align="right" tabular className="font-bold text-content-primary">৳ {row.sales.toLocaleString()}</TableCell>
                  <TableCell align="right" tabular className="font-bold text-status-success">৳ {row.profit.toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <Badge variant="info" size="sm">{row.margin}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DataTable>
        </Card>
      )}

      {/* ============================================================== */}
      {/* 3. TAX & VAT */}
      {/* ============================================================== */}
      {activeTab === 'tax' && (
        <Card className="p-6 space-y-4 max-w-2xl mx-auto">
          <div className="text-center pb-3 border-b border-boundary-subtle">
            <h2 className="font-bold text-base text-content-primary">NBR 5% VALUE ADDED TAX (VAT) REPORT</h2>
            <div className="text-xs text-content-muted mt-0.5">National Board of Revenue Mushak 9.1 Return Schedule</div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 text-content-secondary">
              <span>Total Taxable Wholesale & Retail Turnover:</span>
              <span className="font-tabular font-bold text-content-primary">৳ {metrics.totalSales.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 text-content-secondary">
              <span>Output VAT Collected from Customers (5.0%):</span>
              <span className="font-tabular font-bold text-status-success">৳ {totalVatCollected.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 text-content-secondary">
              <span>Input VAT Rebatable on Port Imports (Customs Challan):</span>
              <span className="font-tabular font-bold text-brand-ochre">- ৳ {vatPaidOnImports.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-boundary font-bold text-sm text-content-primary pt-3">
              <span>NET VAT PAYABLE TO BANGLADESH GOVT:</span>
              <span className="font-tabular font-bold text-status-warning">৳ {netVatPayable.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      )}

      {/* ============================================================== */}
      {/* 4. SUPPLIER & CUSTOMER REPORT */}
      {/* ============================================================== */}
      {activeTab === 'contacts' && (
        <Card className="p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-boundary-subtle">
            <div>
              <h3 className="font-bold text-content-primary text-sm">Distributor & Customer Credit Ledger Report</h3>
              <p className="text-xs text-content-muted">Accounts Receivable and Payable aging audit</p>
            </div>
          </div>

          <DataTable isEmpty={false}>
            <TableHeader>
              <tr>
                <TableHeadCell>Contact Entity</TableHeadCell>
                <TableHeadCell>Type</TableHeadCell>
                <TableHeadCell align="right">Total Business (৳)</TableHeadCell>
                <TableHeadCell align="right">Settled (৳)</TableHeadCell>
                <TableHeadCell align="right">Current Due / Balance (৳)</TableHeadCell>
              </tr>
            </TableHeader>
            <TableBody>
              {suppliers.slice(0, 4).map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-semibold text-content-primary">{s.name}</TableCell>
                  <TableCell>
                    <Badge variant="info" size="sm">Distributor</Badge>
                  </TableCell>
                  <TableCell align="right" tabular className="text-content-secondary">৳ {s.totalPurchase.toLocaleString()}</TableCell>
                  <TableCell align="right" tabular className="text-content-secondary">৳ {(s.totalPurchase - s.totalDue).toLocaleString()}</TableCell>
                  <TableCell align="right" tabular className="font-bold text-status-danger">৳ {s.totalDue.toLocaleString()}</TableCell>
                </TableRow>
              ))}
              {customers.slice(0, 5).map((c) => {
                const purchased = c.totalPurchases || 85000;
                const due = c.customerType === 'Wholesale' ? 35000 : 0;
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold text-content-primary">{c.name}</TableCell>
                    <TableCell>
                      <Badge variant="success" size="sm">{c.customerType}</Badge>
                    </TableCell>
                    <TableCell align="right" tabular className="text-content-secondary">৳ {purchased.toLocaleString()}</TableCell>
                    <TableCell align="right" tabular className="text-content-secondary">৳ {(purchased - due).toLocaleString()}</TableCell>
                    <TableCell align="right" tabular className="font-bold text-status-warning">৳ {due.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </DataTable>
        </Card>
      )}

      {/* ============================================================== */}
      {/* 5. STOCK VALUATION */}
      {/* ============================================================== */}
      {activeTab === 'stock' && (
        <Card className="p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-boundary-subtle">
            <div>
              <h3 className="font-bold text-content-primary text-sm">Physical Inventory Stock Valuation</h3>
              <p className="text-xs text-content-muted">27 StarTech hardware SKUs with purchase cost vs retail valuation</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-content-muted font-mono font-tabular">At Cost: ৳ {metrics.stockPurchasePrice.toLocaleString()}</span>
              <span className="text-xs text-status-success font-mono font-tabular font-bold">At Retail: ৳ {metrics.stockSellPrice.toLocaleString()}</span>
            </div>
          </div>

          <DataTable isEmpty={false}>
            <TableHeader>
              <tr>
                <TableHeadCell>Hardware SKU</TableHeadCell>
                <TableHeadCell>Category</TableHeadCell>
                <TableHeadCell align="center">Stock Units</TableHeadCell>
                <TableHeadCell align="right">Cost Value (৳)</TableHeadCell>
                <TableHeadCell align="right">Retail Value (৳)</TableHeadCell>
              </tr>
            </TableHeader>
            <TableBody>
              {products.slice(0, 10).map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-semibold text-content-primary truncate max-w-xs">{p.name}</div>
                    <div className="text-[11px] text-content-muted font-mono">{p.sku}</div>
                  </TableCell>
                  <TableCell className="text-content-secondary">{p.category}</TableCell>
                  <TableCell align="center" tabular className="font-bold text-content-primary">{p.stockCount}</TableCell>
                  <TableCell align="right" tabular className="text-content-muted">৳ {(p.costPrice * p.stockCount).toLocaleString()}</TableCell>
                  <TableCell align="right" tabular className="font-bold text-status-success">৳ {(p.retailPrice * p.stockCount).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DataTable>
        </Card>
      )}

      {/* ============================================================== */}
      {/* 6. TRENDING PRODUCTS */}
      {/* ============================================================== */}
      {activeTab === 'trending' && (
        <Card className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-content-primary text-sm">Top Trending Hardware Velocity</h3>
            <p className="text-xs text-content-muted">Highest velocity products ranked by turnover speed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-surface-secondary border border-boundary-subtle rounded-xl space-y-2">
              <Badge variant="danger" size="sm">#1 Top Velocity</Badge>
              <div className="font-semibold text-sm text-content-primary">ASUS ROG Strix GeForce RTX 4080 Super</div>
              <div className="text-xs text-content-secondary">58 Units Sold across Dhaka eSports gaming clubs</div>
              <div className="font-tabular text-status-success font-bold text-sm">Revenue: ৳ 9,570,000</div>
            </div>
            <div className="p-4 bg-surface-secondary border border-boundary-subtle rounded-xl space-y-2">
              <Badge variant="info" size="sm">#2 Top Velocity</Badge>
              <div className="font-semibold text-sm text-content-primary">AMD Ryzen 7 7800X3D Processor</div>
              <div className="text-xs text-content-secondary">72 Units Sold across Multiplan retail partner stores</div>
              <div className="font-tabular text-status-success font-bold text-sm">Revenue: ৳ 3,744,000</div>
            </div>
            <div className="p-4 bg-surface-secondary border border-boundary-subtle rounded-xl space-y-2">
              <Badge variant="success" size="sm">#3 Top Velocity</Badge>
              <div className="font-semibold text-sm text-content-primary">Samsung 990 Pro 2TB PCIe Gen4 NVMe</div>
              <div className="text-xs text-content-secondary">110 Units Sold for content creator workstation rigs</div>
              <div className="font-tabular text-status-success font-bold text-sm">Revenue: ৳ 2,695,000</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
