import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  TrendingDown, 
  Receipt,
  FileText,
  DollarSign,
  TrendingUp,
  Tag
} from 'lucide-react';
import { api } from '../api';
import { Card } from '../components/common/Card';
import { MetricCard } from '../components/common/MetricCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { TabGroup } from '../components/common/TabGroup';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { DataTable, TableHeader, TableHeadCell, TableBody, TableRow, TableCell } from '../components/common/DataTable';
import { PageHeader } from '../components/common/PageHeader';

interface ExpensesPageProps {
  initialTab?: 'list' | 'add' | 'categories';
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({ initialTab = 'list' }) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [pnl, setPnl] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Form fields
  const [cat, setCat] = useState('Import Customs & Port Clearance Duty');
  const [amt, setAmt] = useState('125000');
  const [vendor, setVendor] = useState('Chittagong Port Customs Authority');
  const [desc, setDesc] = useState('Customs assessment & port duty on graphics card shipment');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [expList, expSum, pnlData] = await Promise.all([
        api.getExpenses(),
        api.getExpensesSummary(),
        api.getPnlReport()
      ]);
      setExpenses(expList);
      setSummary(expSum);
      setPnl(pnlData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createExpense({
        category: cat,
        amount: parseFloat(amt),
        vendor: vendor,
        description: desc,
        tax_deductible: true
      });
      setShowAddModal(false);
      setActiveTab('list');
      loadData();
    } catch (err: any) {
      alert(`Error creating expense: ${err.message}`);
    }
  };

  const tabs = [
    { id: 'list', label: `Expenses Log (${expenses.length})` },
    { id: 'add', label: 'Post Expense' },
    { id: 'categories', label: 'Category Analysis' }
  ];

  const totalExpenseVal = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Expenses"
        description="Record operating expenditure and review its effect on the current profit-and-loss position."
        actions={<Button
          variant="brand"
          size="sm"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Log New Expense
        </Button>}
      />

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-content-secondary">
        <span><strong className="font-semibold text-content-primary">৳ {totalExpenseVal.toLocaleString()}</strong> recorded expenses</span>
        <span><strong className="font-semibold text-content-primary">{expenses.length}</strong> entries</span>
        {pnl && <span><strong className="font-semibold text-content-primary">{pnl.gross_margin_percentage}%</strong> gross margin</span>}
      </div>

      {/* P&L Executive Summary Card */}
      {pnl && (
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-content-primary uppercase tracking-wider">
              Computer Hardware Trading P&L (YTD)
            </h3>
            <Badge variant="success" size="sm">
              Gross Margin: {pnl.gross_margin_percentage}%
            </Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="bg-surface-secondary p-3 rounded-xl border border-boundary-subtle">
              <span className="text-content-muted text-[11px] block">Gross Revenue</span>
              <div className="text-sm font-bold text-content-primary mt-1 font-tabular">
                ৳ {pnl.revenue?.toLocaleString()}
              </div>
            </div>
            <div className="bg-surface-secondary p-3 rounded-xl border border-boundary-subtle">
              <span className="text-content-muted text-[11px] block">Cost of Goods (COGS)</span>
              <div className="text-sm font-bold text-content-secondary mt-1 font-tabular">
                ৳ {pnl.estimated_cogs?.toLocaleString()}
              </div>
            </div>
            <div className="bg-surface-secondary p-3 rounded-xl border border-boundary-subtle">
              <span className="text-content-muted text-[11px] block">Gross Trade Profit</span>
              <div className="text-sm font-bold text-content-primary mt-1 font-tabular">
                ৳ {pnl.gross_profit?.toLocaleString()}
              </div>
            </div>
            <div className="bg-surface-secondary p-3 rounded-xl border border-boundary-subtle">
              <span className="text-content-muted text-[11px] block">Operating Expenses</span>
              <div className="text-sm font-bold text-status-danger mt-1 font-tabular">
                ৳ {pnl.operating_expenses?.total?.toLocaleString()}
              </div>
            </div>
            <div className="bg-surface-secondary p-3 rounded-xl border border-boundary-subtle col-span-2 sm:col-span-1">
              <span className="text-content-muted text-[11px] block">Net Income</span>
              <div className="text-sm font-bold text-status-success mt-1 font-tabular">
                ৳ {pnl.net_income?.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <TabGroup
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* ============================================================== */}
      {/* TAB 1: EXPENSES TABLE */}
      {/* ============================================================== */}
      {activeTab === 'list' && (
        <DataTable isEmpty={expenses.length === 0} emptyMessage="No expenses recorded yet.">
          <TableHeader>
            <tr>
              <TableHeadCell>Date</TableHeadCell>
              <TableHeadCell>Category</TableHeadCell>
              <TableHeadCell>Vendor / Authority</TableHeadCell>
              <TableHeadCell>Description & Reference</TableHeadCell>
              <TableHeadCell align="center">Tax Status</TableHeadCell>
              <TableHeadCell align="right">Amount (৳)</TableHeadCell>
            </tr>
          </TableHeader>
          <TableBody>
            {expenses.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-mono text-xs text-content-muted">
                  {e.date?.slice(0, 10)}
                </TableCell>
                <TableCell>
                  <Badge variant="neutral" size="sm">
                    {e.category}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-content-primary">
                  {e.vendor}
                </TableCell>
                <TableCell className="text-content-secondary max-w-xs truncate text-xs">
                  {e.description}
                </TableCell>
                <TableCell align="center">
                  {e.tax_deductible ? (
                    <Badge variant="success" size="sm">
                      Tax Deductible ✓
                    </Badge>
                  ) : (
                    <span className="text-xs text-content-muted">Standard</span>
                  )}
                </TableCell>
                <TableCell align="right" tabular className="font-bold text-status-danger">
                  - ৳ {e.amount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DataTable>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ADD EXPENSE FORM */}
      {/* ============================================================== */}
      {activeTab === 'add' && (
        <Card className="p-6 max-w-xl mx-auto space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-boundary-subtle">
            <div className="p-1.5 rounded-lg bg-brand-olive/20 text-brand-dark dark:text-brand-cream">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-content-primary">Log Operational Hardware Expenditure</h3>
              <p className="text-xs text-content-muted">Record rent, utility, port tariff, or sales commission payouts</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">Expense Category</label>
              <Select
                value={cat}
                onChange={e => setCat(e.target.value)}
              >
                <option value="Import Customs & Port Clearance Duty">Import Customs & Port Clearance Duty</option>
                <option value="Showroom & Vault Lease / Rent">Showroom & Vault Lease / Rent</option>
                <option value="Logistics & Courier Delivery">Logistics & Courier Delivery (Steadfast / Pathao)</option>
                <option value="Electricity & High-Load Lab Utilities">Electricity & High-Load Lab Utilities</option>
                <option value="Staff Payroll & Sales Commission">Staff Payroll & Sales Commission</option>
              </Select>
            </div>

            <Input
              label="Vendor / Authority Paid"
              required
              value={vendor}
              onChange={e => setVendor(e.target.value)}
            />

            <Input
              label="Amount (BDT ৳)"
              type="number"
              required
              min="1"
              value={amt}
              onChange={e => setAmt(e.target.value)}
            />

            <Input
              label="Expense Description & Reference"
              required
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />

            <div className="pt-2 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" type="button" onClick={() => setActiveTab('list')}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                Post Expense Entry
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CATEGORY ANALYSIS */}
      {/* ============================================================== */}
      {activeTab === 'categories' && summary && (
        <Card className="p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-content-primary">Hardware Expenditures by Category</h3>
            <p className="text-xs text-content-muted">Proportional breakdown of operating burn across showroom departments</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {summary.category_breakdown?.map((catItem: any) => (
              <div key={catItem.category} className="bg-surface-secondary border border-boundary-subtle p-3.5 rounded-xl text-xs space-y-1">
                <div className="text-content-muted text-[11px] truncate font-medium">{catItem.category}</div>
                <div className="text-base font-bold text-content-primary font-tabular">
                  ৳ {catItem.amount.toLocaleString()}
                </div>
                <div className="text-[11px] text-brand-ochre font-medium font-mono">
                  {catItem.percentage}% of total operating burn
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          title="Log Operational Hardware Expenditure"
          size="md"
        >
          <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">Expense Category</label>
              <Select
                value={cat}
                onChange={e => setCat(e.target.value)}
              >
                <option value="Import Customs & Port Clearance Duty">Import Customs & Port Clearance Duty</option>
                <option value="Showroom & Vault Lease / Rent">Showroom & Vault Lease / Rent</option>
                <option value="Logistics & Courier Delivery">Logistics & Courier Delivery (Steadfast / Pathao)</option>
                <option value="Electricity & High-Load Lab Utilities">Electricity & High-Load Lab Utilities</option>
                <option value="Staff Payroll & Sales Commission">Staff Payroll & Sales Commission</option>
              </Select>
            </div>

            <Input
              label="Vendor / Authority Paid"
              required
              value={vendor}
              onChange={e => setVendor(e.target.value)}
            />

            <Input
              label="Amount (BDT ৳)"
              type="number"
              required
              min="1"
              value={amt}
              onChange={e => setAmt(e.target.value)}
            />

            <Input
              label="Expense Description & Reference"
              required
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />

            <div className="pt-2 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                Post Expense Entry
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
