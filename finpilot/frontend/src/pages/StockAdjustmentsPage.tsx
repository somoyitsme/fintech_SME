import React, { useState } from 'react';
import { Sliders, Plus, Search, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface StockAdjustmentsPageProps {
  initialTab?: 'list' | 'add';
}

export const StockAdjustmentsPage: React.FC<StockAdjustmentsPageProps> = ({ initialTab = 'list' }) => {
  const { products, stockAdjustments, createStockAdjustment } = useStore();
  const [activeTab, setActiveTab] = useState<'list' | 'add'>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [prodId, setProdId] = useState(products[0]?.id || 'prod-1');
  const [location, setLocation] = useState('Banani Central Vault');
  const [adjType, setAdjType] = useState<'Damaged' | 'Audit Shortage' | 'Audit Surplus'>('Damaged');
  const [qty, setQty] = useState('2');
  const [reason, setReason] = useState('');

  const handleAdjSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = products.find(item => item.id === prodId) || products[0];
    const q = parseInt(qty) || 1;
    createStockAdjustment({
      location,
      productId: p.id,
      productName: p.name,
      adjustmentType: adjType,
      quantity: q,
      unitCost: p.costPrice,
      totalValue: p.costPrice * q,
      adjustmentDate: 'Today',
      reason: reason || 'Physical inventory audit adjustment'
    });
    setActiveTab('list');
  };

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-100 select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-blue-500" />
            Inventory Stock Adjustments
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit inventory variances, write-off damaged transit goods, or record physical audit surplus
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'list' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'}`}
        >
          List Stock Adjustments ({stockAdjustments.length})
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'add' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'}`}
        >
          Add Stock Adjustment
        </button>
      </div>

      {activeTab === 'add' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm max-w-lg mx-auto">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            Record Inventory Adjustment
          </h2>
          <form onSubmit={handleAdjSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Warehouse / Location</label>
              <select
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="Banani Central Vault">Banani Central Vault</option>
                <option value="Elephant Road Multiplan Branch">Elephant Road Multiplan Branch</option>
                <option value="IDB Bhaban Agargaon Branch">IDB Bhaban Agargaon Branch</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Hardware Product</label>
              <select
                value={prodId}
                onChange={e => setProdId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockCount})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Adjustment Type</label>
                <select
                  value={adjType}
                  onChange={e => setAdjType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Damaged">Damaged in Transit (-)</option>
                  <option value="Audit Shortage">Physical Audit Shortage (-)</option>
                  <option value="Audit Surplus">Audit Surplus (+)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Units Adjusted</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={qty}
                  onChange={e => setQty(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Reason & Audit Reference</label>
              <input
                type="text"
                placeholder="e.g. Minor carton damage during Chittagong to Dhaka port transit"
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow mt-2"
            >
              Commit Stock Adjustment
            </button>
          </form>
        </div>
      )}

      {activeTab === 'list' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Adjustment # & Date</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Product Name</th>
                <th className="py-3 px-3">Adjustment Type</th>
                <th className="py-3 px-3 text-center">Quantity</th>
                <th className="py-3 px-4 text-right">Adjusted Value (৳)</th>
                <th className="py-3 px-4">Audit Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {stockAdjustments.map((adj) => (
                <tr key={adj.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{adj.adjustmentNumber}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{adj.adjustmentDate}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {adj.location}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">
                    {adj.productName}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                      adj.adjustmentType === 'Damaged' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                      adj.adjustmentType === 'Audit Shortage' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {adj.adjustmentType}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                    {adj.adjustmentType === 'Audit Surplus' ? `+${adj.quantity}` : `-${adj.quantity}`} Units
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-slate-200">
                    ৳ {adj.totalValue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400 text-[11px] max-w-xs truncate">
                    {adj.reason}
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
