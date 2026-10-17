import React, { useState } from 'react';
import { CreditCard, DollarSign, Building2, Smartphone, ArrowUpRight, ArrowDownLeft, Plus, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const PaymentAccountsPage: React.FC = () => {
  const { accounts, cashRegister } = useStore();
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [fromAcc, setFromAcc] = useState('acc-1');
  const [toAcc, setToAcc] = useState('acc-2');
  const [transferAmt, setTransferAmt] = useState('');

  const totalLiquidity = accounts.reduce((sum, a) => sum + a.balance, 0);

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Transfer of ৳${parseFloat(transferAmt || '0').toLocaleString()} between accounts processed successfully!`);
    setShowTransferModal(false);
    setTransferAmt('');
  };

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-100 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-blue-500" />
            Payment Accounts & Liquidity Balances
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage cash drawers, corporate current accounts, and bKash merchant gateways
          </p>
        </div>
        <button
          onClick={() => setShowTransferModal(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Transfer Funds Between Accounts</span>
        </button>
      </div>

      {/* Account Cards Grid */}
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
                <h3 className="font-bold text-xs text-white line-clamp-1">{acc.accountName}</h3>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">{acc.accountNumber}</div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-700">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Available Balance</div>
                <div className="text-lg font-extrabold text-emerald-400 font-mono">
                  ৳ {acc.balance.toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cash Drawer Reconciliation Summary */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm">
        <h2 className="font-bold text-sm text-white mb-3">Today's Cash Drawer Balance</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-medium">
          <div className="p-3 bg-slate-900 rounded-xl">
            <span className="text-slate-400">Opening Balance:</span>
            <div className="text-base font-bold text-white font-mono mt-1">৳ {cashRegister.openingCash.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl">
            <span className="text-slate-400">Cash Sales Collected Today:</span>
            <div className="text-base font-bold text-emerald-400 font-mono mt-1">৳ {cashRegister.cashSales.toLocaleString()}</div>
          </div>
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
            <span className="text-slate-300 font-bold">Total Cash in Hand:</span>
            <div className="text-lg font-extrabold text-emerald-400 font-mono mt-1">৳ {cashRegister.totalCash.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-md p-5 text-slate-100 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700 mb-3">
              <span className="font-bold text-sm">Transfer Funds Between Accounts</span>
              <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleTransfer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">From Account</label>
                <select value={fromAcc} onChange={e => setFromAcc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white">
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.accountName} (৳{a.balance.toLocaleString()})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">To Account</label>
                <select value={toAcc} onChange={e => setToAcc(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white">
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.accountName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Transfer Amount (৳)</label>
                <input
                  type="number"
                  required
                  placeholder="50000"
                  value={transferAmt}
                  onChange={e => setTransferAmt(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <button type="submit" className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition">
                Confirm Fund Transfer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
