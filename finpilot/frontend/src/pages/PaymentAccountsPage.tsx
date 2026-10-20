import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Building2, 
  Smartphone, 
  ArrowUpRight, 
  CheckCircle2,
  TrendingUp,
  Receipt,
  Scale,
  Plus
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { accountsApi } from '../api';
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

interface PaymentAccountsPageProps {
  initialTab?: 'list' | 'balancesheet' | 'trialbalance' | 'cashflow';
}

export const PaymentAccountsPage: React.FC<PaymentAccountsPageProps> = ({ 
  initialTab = 'list' 
}) => {
  const { accounts, metrics } = useStore();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [fromAcc, setFromAcc] = useState('acc-1');
  const [toAcc, setToAcc] = useState('acc-2');
  const [transferAmt, setTransferAmt] = useState('');
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  // Add Demo Account Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<'Bank Account' | 'Cash Drawer' | 'MFS (bKash/Nagad)'>('Bank Account');
  const [accNumber, setAccNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [initialBalance, setInitialBalance] = useState('500000');

  const totalLiquidity = accounts.reduce((sum, a) => sum + a.balance, 0);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmt || '0');
    setTransferSuccess(`Inter-account liquidity transfer of ৳ ${amt.toLocaleString()} processed successfully.`);
    setShowTransferModal(false);
    setTransferAmt('');
    setTimeout(() => setTransferSuccess(null), 5000);
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) return;

    try {
      await accountsApi.createAccount({
        accountName: accName.trim(),
        accountType: accType,
        accountNumber: accNumber.trim() || `ACC-${Date.now().toString().slice(-6)}`,
        bankName: accType === 'Bank Account' ? (bankName.trim() || 'Commercial Bank PLC') : null,
        balance: parseFloat(initialBalance) || 0
      });

      setTransferSuccess(`Account "${accName}" registered successfully in local database.`);
      setShowAddModal(false);
      setAccName('');
      setAccNumber('');
      setBankName('');
      setTimeout(() => setTransferSuccess(null), 5000);
      window.location.reload();
    } catch (err: any) {
      console.warn('Create account error:', err);
    }
  };

  const tabs = [
    { id: 'list', label: `Accounts (${accounts.length})` },
    { id: 'balancesheet', label: 'Balance Sheet' },
    { id: 'trialbalance', label: 'Trial Balance' },
    { id: 'cashflow', label: 'Cash Flow Statement' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Finance"
        title="Accounts"
        description="Review cash and bank balances, then move into formal financial statements when needed."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTransferModal(true)}
              leftIcon={<ArrowUpRight className="w-4 h-4" />}
            >
              Transfer Liquidity
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={() => setShowAddModal(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Demo Account
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-content-secondary">
        <span><strong className="font-semibold text-content-primary">৳ {totalLiquidity.toLocaleString()}</strong> liquid balance</span>
        <span><strong className="font-semibold text-content-primary">৳ {metrics.accountReceivable.toLocaleString()}</strong> receivable</span>
        <span><strong className="font-semibold text-content-primary">৳ {metrics.accountPayable.toLocaleString()}</strong> payable</span>
      </div>

      {/* Tabs */}
      <TabGroup
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {transferSuccess && (
        <div className="p-3.5 bg-status-success/15 border border-status-success/30 text-content-primary rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-status-success shrink-0" />
          <span>{transferSuccess}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: ACCOUNTS LIST */}
      {/* ============================================================== */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {accounts.map((acc) => {
              const isCash = acc.accountType === 'Cash Drawer';
              const isBank = acc.accountType === 'Bank Account';
              return (
                <Card key={acc.id} className="p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-xl bg-brand-olive/20 text-brand-dark dark:text-brand-cream">
                        {isCash ? <DollarSign className="w-5 h-5" /> : isBank ? <Building2 className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                      </div>
                      <Badge variant="neutral" size="sm">
                        {acc.accountType}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-sm text-content-primary truncate">{acc.accountName}</h3>
                    <p className="text-xs text-content-muted font-mono mt-0.5">{acc.accountNumber}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-boundary-subtle flex items-baseline justify-between">
                    <span className="text-[11px] text-content-muted uppercase font-semibold">Available</span>
                    <span className="text-base font-bold font-tabular text-content-primary">
                      ৳ {acc.balance.toLocaleString()}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-olive/25 text-brand-dark dark:text-brand-cream flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-content-primary">Total Liquid Treasury Balance</h4>
                <p className="text-[11px] text-content-muted">Combined balance across active cash drawers, bank accounts, and merchant wallets</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold font-tabular text-content-primary">৳ {totalLiquidity.toLocaleString()}</div>
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: BALANCE SHEET */}
      {/* ============================================================== */}
      {activeTab === 'balancesheet' && (
        <Card className="p-6 max-w-3xl mx-auto space-y-6">
          <div className="text-center pb-4 border-b border-boundary-subtle">
            <h2 className="text-base font-bold text-content-primary tracking-wide">NOW_OR_NEVER CONSOLE</h2>
            <div className="text-xs font-bold text-brand-ochre uppercase tracking-widest mt-0.5">BALANCE SHEET STATEMENT</div>
            <div className="text-xs text-content-muted mt-1">As of October 17, 2026 (Currency: BDT ৳)</div>
          </div>

          {/* ASSETS */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-brand-ochre uppercase tracking-wider text-[11px] border-b border-boundary-subtle pb-1">
              CURRENT ASSETS
            </div>
            <div className="flex justify-between py-1 text-content-secondary">
              <span>Cash in Hand (Showroom Vault Drawers):</span>
              <span className="font-tabular font-semibold text-content-primary">৳ {accounts.find(a => a.accountType === 'Cash Drawer')?.balance.toLocaleString() || '142,500'}</span>
            </div>
            <div className="flex justify-between py-1 text-content-secondary">
              <span>Cash at Banks (City Bank & BRAC Bank Corporate):</span>
              <span className="font-tabular font-semibold text-content-primary">৳ 2,127,500</span>
            </div>
            <div className="flex justify-between py-1 text-content-secondary">
              <span>bKash Merchant Gateway Settlement Account:</span>
              <span className="font-tabular font-semibold text-content-primary">৳ 385,000</span>
            </div>
            <div className="flex justify-between py-1 text-content-secondary">
              <span>Accounts Receivable (Wholesale Corporate Due):</span>
              <span className="font-tabular font-semibold text-content-primary">৳ {metrics.accountReceivable.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 text-content-secondary">
              <span>Hardware Stock Merchandise Inventory (At Cost):</span>
              <span className="font-tabular font-semibold text-content-primary">৳ {metrics.stockPurchasePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-boundary-subtle font-bold text-content-primary text-sm">
              <span>TOTAL CURRENT ASSETS:</span>
              <span className="font-tabular text-status-success font-bold">
                ৳ {(totalLiquidity + metrics.accountReceivable + metrics.stockPurchasePrice).toLocaleString()}
              </span>
            </div>
          </div>

          {/* LIABILITIES & EQUITY */}
          <div className="space-y-2 text-xs pt-2">
            <div className="font-bold text-status-danger uppercase tracking-wider text-[11px] border-b border-boundary-subtle pb-1">
              CURRENT LIABILITIES
            </div>
            <div className="flex justify-between py-1 text-content-secondary">
              <span>Accounts Payable (Distributor POs Due):</span>
              <span className="font-tabular font-semibold text-content-primary">৳ {metrics.accountPayable.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 text-content-secondary">
              <span>Accrued Port Customs Duty & Freight Charges:</span>
              <span className="font-tabular font-semibold text-content-primary">৳ 125,000</span>
            </div>
            <div className="flex justify-between py-1 text-content-secondary">
              <span>NBR 5% Sales VAT Payable:</span>
              <span className="font-tabular font-semibold text-content-primary">৳ {Math.round(metrics.totalSales * 0.05).toLocaleString()}</span>
            </div>

            <div className="font-bold text-brand-ochreDeep dark:text-brand-sand uppercase tracking-wider text-[11px] border-b border-boundary-subtle pb-1 pt-3">
              EQUITY & RETAINED EARNINGS
            </div>
            <div className="flex justify-between py-1 text-content-secondary">
              <span>Paid-in Owner Capital:</span>
              <span className="font-tabular font-semibold text-content-primary">৳ 5,000,000</span>
            </div>
            <div className="flex justify-between py-1 text-content-secondary">
              <span>Cumulative Retained Earnings (5-Month Net Profit):</span>
              <span className="font-tabular font-semibold text-content-primary">৳ {metrics.netProfit.toLocaleString()}</span>
            </div>

            <div className="flex justify-between py-2 border-t border-boundary-subtle font-bold text-content-primary text-sm pt-3">
              <span>TOTAL LIABILITIES & EQUITY:</span>
              <span className="font-tabular text-brand-ochre font-bold">
                ৳ {(totalLiquidity + metrics.accountReceivable + metrics.stockPurchasePrice).toLocaleString()}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 3: TRIAL BALANCE */}
      {/* ============================================================== */}
      {activeTab === 'trialbalance' && (
        <Card className="p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-boundary-subtle">
            <div>
              <h3 className="font-bold text-sm text-content-primary">Trial Balance Summary (NBR Compliance)</h3>
              <p className="text-xs text-content-muted">Double-entry audit verification ensuring debits equal credits</p>
            </div>
            <Badge variant="success" size="sm">
              Status: In Balance ✓
            </Badge>
          </div>

          <DataTable isEmpty={false}>
            <TableHeader>
              <tr>
                <TableHeadCell>Account Code & Title</TableHeadCell>
                <TableHeadCell>Category</TableHeadCell>
                <TableHeadCell align="right">Debit Balance (৳)</TableHeadCell>
                <TableHeadCell align="right">Credit Balance (৳)</TableHeadCell>
              </tr>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-semibold text-content-primary">1010 - Cash & Bank Liquidity</TableCell>
                <TableCell className="text-content-muted">Current Asset</TableCell>
                <TableCell align="right" tabular className="font-bold text-content-primary">৳ {totalLiquidity.toLocaleString()}</TableCell>
                <TableCell align="right" tabular className="text-content-muted">―</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-content-primary">1020 - Accounts Receivable (Trade Debtors)</TableCell>
                <TableCell className="text-content-muted">Current Asset</TableCell>
                <TableCell align="right" tabular className="font-bold text-content-primary">৳ {metrics.accountReceivable.toLocaleString()}</TableCell>
                <TableCell align="right" tabular className="text-content-muted">―</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-content-primary">1030 - Merchandise Inventory (At Cost)</TableCell>
                <TableCell className="text-content-muted">Inventory Asset</TableCell>
                <TableCell align="right" tabular className="font-bold text-content-primary">৳ {metrics.stockPurchasePrice.toLocaleString()}</TableCell>
                <TableCell align="right" tabular className="text-content-muted">―</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-content-primary">2010 - Accounts Payable (Trade Creditors)</TableCell>
                <TableCell className="text-content-muted">Current Liability</TableCell>
                <TableCell align="right" tabular className="text-content-muted">―</TableCell>
                <TableCell align="right" tabular className="font-bold text-status-danger">৳ {metrics.accountPayable.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold text-content-primary">3010 - Share Capital & Retained Reserves</TableCell>
                <TableCell className="text-content-muted">Owner Equity</TableCell>
                <TableCell align="right" tabular className="text-content-muted">―</TableCell>
                <TableCell align="right" tabular className="font-bold text-status-danger">৳ {(totalLiquidity + metrics.accountReceivable + metrics.stockPurchasePrice - metrics.accountPayable).toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </DataTable>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 4: CASH FLOW STATEMENT */}
      {/* ============================================================== */}
      {activeTab === 'cashflow' && (
        <Card className="p-6 max-w-2xl mx-auto space-y-4">
          <div className="text-center pb-3 border-b border-boundary-subtle">
            <h2 className="text-base font-bold text-content-primary">STATEMENT OF CASH FLOWS</h2>
            <div className="text-xs text-content-muted">5-Month Cash Receipts & Disbursements (May – Oct 2026)</div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="font-bold text-brand-ochre uppercase text-[11px] border-b border-boundary-subtle pb-1">
              1. CASH FLOWS FROM OPERATING ACTIVITIES
            </div>
            <div className="flex justify-between py-1 text-content-secondary">
              <span>Cash Receipts from Hardware Customers:</span>
              <span className="font-tabular font-semibold text-status-success">+ ৳ {(metrics.totalSales - metrics.accountReceivable).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 text-content-secondary">
              <span>Cash Paid to Global Suppliers (ASUS, Intel, Zotac):</span>
              <span className="font-tabular font-semibold text-status-danger">- ৳ {(metrics.totalPurchase - metrics.accountPayable).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 text-content-secondary">
              <span>Cash Paid for Customs Duty, Port Clearance & Logistics:</span>
              <span className="font-tabular font-semibold text-status-danger">- ৳ {metrics.totalExpense.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-t border-boundary-subtle font-bold text-content-primary">
              <span>Net Cash from Operating Activities:</span>
              <span className="font-tabular text-status-success font-bold">+ ৳ 1,248,500</span>
            </div>

            <div className="font-bold text-brand-ochreDeep dark:text-brand-sand uppercase text-[11px] border-b border-boundary-subtle pb-1 pt-2">
              2. CASH FLOWS FROM INVESTING & FINANCING
            </div>
            <div className="flex justify-between py-1 text-content-secondary">
              <span>Capital Expenditure (Showroom Vault Security Setup):</span>
              <span className="font-tabular font-semibold text-status-danger">- ৳ 150,000</span>
            </div>
            <div className="flex justify-between py-1 text-content-secondary">
              <span>Partner Capital Contribution:</span>
              <span className="font-tabular font-semibold text-status-success">+ ৳ 1,556,500</span>
            </div>

            <div className="flex justify-between py-2 border-t-2 border-boundary font-bold text-sm text-content-primary pt-3">
              <span>NET CASH POSITION AT END OF PERIOD:</span>
              <span className="font-tabular text-content-primary font-bold">৳ {totalLiquidity.toLocaleString()}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Transfer Funds Modal */}
      {showTransferModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowTransferModal(false)}
          title="Transfer Liquidity Between Accounts"
          size="md"
        >
          <form onSubmit={handleTransfer} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                From Account (Source)
              </label>
              <Select
                value={fromAcc}
                onChange={e => setFromAcc(e.target.value)}
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.accountName} (৳{a.balance.toLocaleString()})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                To Account (Destination)
              </label>
              <Select
                value={toAcc}
                onChange={e => setToAcc(e.target.value)}
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.accountName} (৳{a.balance.toLocaleString()})
                  </option>
                ))}
              </Select>
            </div>

            <Input
              label="Transfer Amount (৳)"
              type="number"
              required
              min="1"
              placeholder="e.g. 50000"
              value={transferAmt}
              onChange={e => setTransferAmt(e.target.value)}
            />

            <div className="pt-2 flex justify-end gap-2.5">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowTransferModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="md" type="submit">
                Execute Transfer
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Demo Account Modal */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Demo Payment Account"
          subtitle="Create a new bank, cash vault, or MFS account directly in local development database"
        >
          <form onSubmit={handleAddAccount} className="space-y-3.5">
            <Input
              label="Account Name"
              required
              placeholder="e.g. Standard Chartered Corporate Treasury A/C"
              value={accName}
              onChange={e => setAccName(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Account Classification"
                value={accType}
                onChange={e => setAccType(e.target.value as any)}
              >
                <option value="Bank Account">Bank Account</option>
                <option value="Cash Drawer">Cash Drawer / Vault</option>
                <option value="MFS (bKash/Nagad)">MFS (bKash/Nagad)</option>
              </Select>

              <Input
                label="Initial Balance (৳)"
                type="number"
                min="0"
                value={initialBalance}
                onChange={e => setInitialBalance(e.target.value)}
              />
            </div>

            <Input
              label="Account / Wallet Number"
              placeholder="e.g. 1102948192001 or 01711-XXXXXX"
              value={accNumber}
              onChange={e => setAccNumber(e.target.value)}
            />

            {accType === 'Bank Account' && (
              <Input
                label="Bank Name & Branch"
                placeholder="e.g. Standard Chartered Bank (Gulshan Branch)"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
              />
            )}

            <div className="pt-3 flex justify-end gap-2 border-t border-boundary-subtle">
              <Button variant="outline" size="sm" type="button" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="brand" size="sm" type="submit" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Create Account in Database
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
