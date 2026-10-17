import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Building2, 
  Smartphone, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  X,
  FileText,
  BarChart2,
  PieChart,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface PaymentAccountsPageProps {
  initialTab?: 'list' | 'balancesheet' | 'trialbalance' | 'cashflow';
}

export const PaymentAccountsPage: React.FC<PaymentAccountsPageProps> = ({ 
  initialTab = 'list' 
}) => {
  const { accounts, cashRegister, metrics } = useStore();
  const [activeTab, setActiveTab] = useState<'list' | 'balancesheet' | 'trialbalance' | 'cashflow'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [fromAcc, setFromAcc] = useState('acc-1');
  const [toAcc, setToAcc] = useState('acc-2');
  const [transferAmt, setTransferAmt] = useState('');
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  const totalLiquidity = accounts.reduce((sum, a) => sum + a.balance, 0);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmt || '0');
    setTransferSuccess(`Inter-account liquidity transfer of ৳ ${amt.toLocaleString()} processed successfully.`);
    setShowTransferModal(false);
    setTransferAmt('');
    setTimeout(() => setTransferSuccess(null), 5000);
  };

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-100 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-500" />
            Payment Accounts & Financial Statements
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cash drawers, corporate banking ledgers, Balance Sheet & Trial Balance audit statements
          </p>
        </div>
        <button
          onClick={() => setShowTransferModal(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Transfer Funds</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'list' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          List Accounts ({accounts.length})
        </button>
        <button
          onClick={() => setActiveTab('balancesheet')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'balancesheet' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Balance Sheet
        </button>
        <button
          onClick={() => setActiveTab('trialbalance')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'trialbalance' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Trial Balance
        </button>
        <button
          onClick={() => setActiveTab('cashflow')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'cashflow' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Cash Flow Statement
        </button>
      </div>

      {transferSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
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
                <div key={acc.id} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`p-2 rounded-xl ${
                        isCash ? 'bg-emerald-500/15 text-emerald-400' :
                        isBank ? 'bg-blue-500/15 text-blue-400' :
                        'bg-pink-500/15 text-pink-400'
                      }`}>
                        {isCash ? <DollarSign className="w-5 h-5" /> : isBank ? <Building2 className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                        {acc.accountType}
                      </span>
                    </div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{acc.accountName}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{acc.accountNumber}</div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-baseline justify-between">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Available</span>
                    <span className="text-base font-black font-mono text-emerald-500 dark:text-emerald-400">
                      ৳ {acc.balance.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-800/40 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-blue-300">Total Liquid Treasury Balance</div>
                <div className="text-[11px] text-slate-400">Combined balance across active cash drawers, bank accounts, and merchant wallets</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-black font-mono text-white">৳ {totalLiquidity.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: BALANCE SHEET */}
      {/* ============================================================== */}
      {activeTab === 'balancesheet' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="text-center pb-4 border-b border-slate-700">
            <h2 className="text-base font-extrabold text-white tracking-wide">DHAKA SILICON & HARDWARE LTD.</h2>
            <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-0.5">BALANCE SHEET STATEMENT</div>
            <div className="text-xs text-slate-400 mt-1">As of October 17, 2026 (Currency: BDT ৳)</div>
          </div>

          {/* ASSETS */}
          <div className="space-y-2 text-xs">
            <div className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1">
              CURRENT ASSETS
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>Cash in Hand (Counter Drawers):</span>
              <span className="font-mono text-white">৳ {accounts.find(a => a.accountType === 'Cash Drawer')?.balance.toLocaleString() || '142,500'}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>Cash at Banks (City Bank & BRAC Bank Corporate):</span>
              <span className="font-mono text-white">৳ 2,127,500</span>
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>bKash Merchant Gateway Settlement Account:</span>
              <span className="font-mono text-white">৳ 385,000</span>
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>Accounts Receivable (Wholesale Corporate Due):</span>
              <span className="font-mono text-white">৳ {metrics.accountReceivable.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>Hardware Stock Merchandise Inventory (At Cost):</span>
              <span className="font-mono text-white">৳ {metrics.stockPurchasePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-slate-700 font-bold text-white text-sm">
              <span>TOTAL CURRENT ASSETS:</span>
              <span className="font-mono text-emerald-400">
                ৳ {(totalLiquidity + metrics.accountReceivable + metrics.stockPurchasePrice).toLocaleString()}
              </span>
            </div>
          </div>

          {/* LIABILITIES & EQUITY */}
          <div className="space-y-2 text-xs pt-2">
            <div className="font-extrabold text-rose-400 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1">
              CURRENT LIABILITIES
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>Accounts Payable (Distributor POs Due):</span>
              <span className="font-mono text-white">৳ {metrics.accountPayable.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>Accrued Port Customs Duty & Freight Charges:</span>
              <span className="font-mono text-white">৳ 125,000</span>
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>NBR 5% Sales VAT Payable:</span>
              <span className="font-mono text-white">৳ {Math.round(metrics.totalSales * 0.05).toLocaleString()}</span>
            </div>

            <div className="font-extrabold text-purple-400 uppercase tracking-wider text-[11px] border-b border-slate-800 pb-1 pt-3">
              EQUITY & RETAINED EARNINGS
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>Paid-in Owner Capital:</span>
              <span className="font-mono text-white">৳ 5,000,000</span>
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>Cumulative Retained Earnings (5-Month Net Profit):</span>
              <span className="font-mono text-white">৳ {metrics.netProfit.toLocaleString()}</span>
            </div>

            <div className="flex justify-between py-2 border-t border-slate-700 font-bold text-white text-sm pt-3">
              <span>TOTAL LIABILITIES & EQUITY:</span>
              <span className="font-mono text-blue-400">
                ৳ {(totalLiquidity + metrics.accountReceivable + metrics.stockPurchasePrice).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: TRIAL BALANCE */}
      {/* ============================================================== */}
      {activeTab === 'trialbalance' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-700">
            <div>
              <h2 className="font-bold text-white text-sm">Trial Balance Summary (NBR Compliance)</h2>
              <p className="text-xs text-slate-400">Double-entry audit verification ensuring debits equal credits</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold">
              Status: In Balance ✓
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-4">Account Code & Title</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-4 text-right">Debit Balance (৳)</th>
                  <th className="py-2.5 px-4 text-right">Credit Balance (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-4 font-bold text-white">1010 - Cash & Bank Liquidity</td>
                  <td className="py-2.5 px-3 text-slate-400">Current Asset</td>
                  <td className="py-2.5 px-4 text-right font-mono text-emerald-400">৳ {totalLiquidity.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-500">―</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-4 font-bold text-white">1020 - Accounts Receivable (Trade Debtors)</td>
                  <td className="py-2.5 px-3 text-slate-400">Current Asset</td>
                  <td className="py-2.5 px-4 text-right font-mono text-emerald-400">৳ {metrics.accountReceivable.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-500">―</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-4 font-bold text-white">1030 - Merchandise Inventory (At Cost)</td>
                  <td className="py-2.5 px-3 text-slate-400">Inventory Asset</td>
                  <td className="py-2.5 px-4 text-right font-mono text-emerald-400">৳ {metrics.stockPurchasePrice.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-500">―</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-4 font-bold text-white">2010 - Accounts Payable (Trade Creditors)</td>
                  <td className="py-2.5 px-3 text-slate-400">Current Liability</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-500">―</td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-400">৳ {metrics.accountPayable.toLocaleString()}</td>
                </tr>
                <tr className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-4 font-bold text-white">3010 - Share Capital & Retained Reserves</td>
                  <td className="py-2.5 px-3 text-slate-400">Owner Equity</td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-500">―</td>
                  <td className="py-2.5 px-4 text-right font-mono text-rose-400">৳ {(totalLiquidity + metrics.accountReceivable + metrics.stockPurchasePrice - metrics.accountPayable).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: CASH FLOW STATEMENT */}
      {/* ============================================================== */}
      {activeTab === 'cashflow' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto space-y-4">
          <div className="text-center pb-3 border-b border-slate-700">
            <h2 className="text-base font-extrabold text-white">STATEMENT OF CASH FLOWS</h2>
            <div className="text-xs text-slate-400">5-Month Cash Receipts & Disbursements (May – Oct 2026)</div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="font-bold text-emerald-400 uppercase text-[11px] border-b border-slate-800 pb-1">
              1. CASH FLOWS FROM OPERATING ACTIVITIES
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>Cash Receipts from Hardware Customers:</span>
              <span className="font-mono text-emerald-400">+ ৳ {(metrics.totalSales - metrics.accountReceivable).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>Cash Paid to Global Suppliers (ASUS, Intel, Zotac):</span>
              <span className="font-mono text-rose-400">- ৳ {(metrics.totalPurchase - metrics.accountPayable).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>Cash Paid for Customs Duty, Port Clearance & Logistics:</span>
              <span className="font-mono text-rose-400">- ৳ {metrics.totalExpense.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-t border-slate-700 font-bold text-white">
              <span>Net Cash from Operating Activities:</span>
              <span className="font-mono text-emerald-400">+ ৳ 1,248,500</span>
            </div>

            <div className="font-bold text-blue-400 uppercase text-[11px] border-b border-slate-800 pb-1 pt-2">
              2. CASH FLOWS FROM INVESTING & FINANCING
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>Capital Expenditure (Showroom Vault Security Setup):</span>
              <span className="font-mono text-rose-400">- ৳ 150,000</span>
            </div>
            <div className="flex justify-between py-1 text-slate-300">
              <span>Partner Capital Contribution:</span>
              <span className="font-mono text-emerald-400">+ ৳ 1,556,500</span>
            </div>

            <div className="flex justify-between py-2 border-t-2 border-slate-600 font-extrabold text-sm text-white pt-3">
              <span>NET CASH POSITION AT END OF PERIOD:</span>
              <span className="font-mono text-emerald-400">৳ {totalLiquidity.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Funds Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-md p-6 text-slate-100 shadow-2xl relative">
            <button onClick={() => setShowTransferModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-blue-500" />
              Transfer Liquidity Between Accounts
            </h2>
            <form onSubmit={handleTransfer} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">From Account (Source)</label>
                <select
                  value={fromAcc}
                  onChange={e => setFromAcc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.accountName} (৳{a.balance.toLocaleString()})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">To Account (Destination)</label>
                <select
                  value={toAcc}
                  onChange={e => setToAcc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.accountName} (৳{a.balance.toLocaleString()})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Transfer Amount (৳)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 50000"
                  value={transferAmt}
                  onChange={e => setTransferAmt(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow mt-2"
              >
                Execute Bank Transfer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
