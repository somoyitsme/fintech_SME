import React, { useState } from 'react';
import { Truck, Plus, Search, ArrowRight, CheckCircle2, Clock, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const StockTransfersPage: React.FC = () => {
  const { products, stockTransfers, createStockTransfer } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  const [fromLoc, setFromLoc] = useState('Banani Central Vault #B4');
  const [toLoc, setToLoc] = useState('Elephant Road Multiplan Branch');
  const [prodId, setProdId] = useState(products[0]?.id || 'prod-1');
  const [qty, setQty] = useState('5');
  const [notes, setNotes] = useState('');

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = products.find(item => item.id === prodId) || products[0];
    createStockTransfer({
      fromLocation: fromLoc,
      toLocation: toLoc,
      productId: p.id,
      productName: p.name,
      quantity: parseInt(qty) || 1,
      transferDate: 'Today',
      status: 'Completed',
      notes: notes || 'Showroom replenishment transfer'
    });
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-100 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-500" />
            Inter-Branch Stock Transfers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Relocate stock between Banani Central Vault, Multiplan Center & IDB Bhaban showrooms
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Stock Transfer</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Transfer # & Date</th>
                <th className="py-3 px-3">Hardware Product</th>
                <th className="py-3 px-3">From Location</th>
                <th className="py-3 px-3 text-center"></th>
                <th className="py-3 px-3">To Location</th>
                <th className="py-3 px-3 text-center">Quantity</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {stockTransfers.map((tr) => (
                <tr key={tr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{tr.transferNumber}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{tr.transferDate}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">
                    {tr.productName}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                    {tr.fromLocation}
                  </td>
                  <td className="py-3 px-3 text-center text-blue-500">
                    <ArrowRight className="w-3.5 h-3.5 mx-auto" />
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 text-[11px]">
                    {tr.toLocation}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-blue-400">
                    {tr.quantity} Units
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      ● {tr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-md p-5 text-slate-100 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700 mb-3">
              <span className="font-bold text-sm">Create Branch Transfer</span>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Select Hardware Product</label>
                <select
                  value={prodId}
                  onChange={e => setProdId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockCount})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">From Location</label>
                  <select
                    value={fromLoc}
                    onChange={e => setFromLoc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    <option>Banani Central Vault #B4</option>
                    <option>Banani Vault #A1</option>
                    <option>Warehouse Shelf #S1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">To Destination</label>
                  <select
                    value={toLoc}
                    onChange={e => setToLoc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  >
                    <option>Elephant Road Multiplan Branch</option>
                    <option>BCS Computer City IDB Branch</option>
                    <option>Banani Showroom Counter</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Transfer Units</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={qty}
                  onChange={e => setQty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Courier dispatch for weekend showroom promotion"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition"
              >
                Dispatch Stock Transfer
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
