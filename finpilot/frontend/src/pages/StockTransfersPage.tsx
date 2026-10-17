import React, { useState } from 'react';
import { Truck, Plus, Search, ArrowRight, CheckCircle2, Clock, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface StockTransfersPageProps {
  initialTab?: 'list' | 'add';
}

export const StockTransfersPage: React.FC<StockTransfersPageProps> = ({ initialTab = 'list' }) => {
  const { products, stockTransfers, createStockTransfer } = useStore();
  const [activeTab, setActiveTab] = useState<'list' | 'add'>(initialTab);
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

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
    setActiveTab('list');
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
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'list' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          List Stock Transfers ({stockTransfers.length})
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'add' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Add Stock Transfer
        </button>
      </div>

      {activeTab === 'add' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm max-w-lg mx-auto">
          <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            Create Inter-Branch Stock Transfer
          </h2>
          <form onSubmit={handleTransferSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Source Warehouse</label>
              <select
                value={fromLoc}
                onChange={e => setFromLoc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="Banani Central Vault #B4">Banani Central Vault #B4</option>
                <option value="Elephant Road Multiplan Branch">Elephant Road Multiplan Branch</option>
                <option value="IDB Bhaban Agargaon Branch">IDB Bhaban Agargaon Branch</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Destination Showroom</label>
              <select
                value={toLoc}
                onChange={e => setToLoc(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="Elephant Road Multiplan Branch">Elephant Road Multiplan Branch</option>
                <option value="Banani Central Vault #B4">Banani Central Vault #B4</option>
                <option value="IDB Bhaban Agargaon Branch">IDB Bhaban Agargaon Branch</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Product to Transfer</label>
              <select
                value={prodId}
                onChange={e => setProdId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Available: {p.stockCount})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Units to Transfer</label>
              <input
                type="number"
                min="1"
                required
                value={qty}
                onChange={e => setQty(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Transit Challan Notes</label>
              <input
                type="text"
                placeholder="e.g. Replenish weekend showroom display counter"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow mt-2"
            >
              Dispatch Stock Transfer
            </button>
          </form>
        </div>
      )}

      {activeTab === 'list' && (
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
      )}

    </div>
  );
};
