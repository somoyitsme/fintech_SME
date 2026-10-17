import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Building2, 
  PackageCheck, 
  ArrowDownLeft, 
  FileText,
  X,
  Truck
} from 'lucide-react';
import { useStore, SupplierPO } from '../context/StoreContext';

interface PurchasesPageProps {
  initialTab?: 'list' | 'add' | 'returns';
  onNavigateTab?: (tab: string) => void;
}

export const PurchasesPage: React.FC<PurchasesPageProps> = ({ 
  initialTab = 'list',
  onNavigateTab 
}) => {
  const { purchaseOrders, suppliers, products, createPurchaseOrder, receivePurchaseOrder } = useStore();
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'returns'>(initialTab);
  const [search, setSearch] = useState('');

  // New PO State
  const [poSupplier, setPoSupplier] = useState(suppliers[0]?.name || 'ASUS Regional Distribution (Singapore)');
  const [poProduct, setPoProduct] = useState(products[0]?.id || 'prod-1');
  const [poQty, setPoQty] = useState('20');
  const [poCost, setPoCost] = useState('');
  const [poNotes, setPoNotes] = useState('');

  const filteredPOs = purchaseOrders.filter(po => 
    po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
    po.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    po.items.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreatePOSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === poProduct) || products[0];
    const qty = parseInt(poQty) || 10;
    const unitC = poCost ? parseFloat(poCost) : prod.costPrice;
    const totCost = unitC * qty;

    createPurchaseOrder({
      supplierName: poSupplier,
      productId: prod.id,
      quantity: qty,
      totalCost: totCost,
      itemsSummary: `${qty}x ${prod.name}`
    });

    setActiveTab('list');
  };

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-blue-500" />
            Purchases & Supplier Supply Chain
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Procure wholesale GPU, CPU, RAM shipments from Singapore, Taiwan & authorized distributors
          </p>
        </div>

        <button
          onClick={() => setActiveTab('add')}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Purchase Requisition</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'list' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>All Purchase Orders ({purchaseOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'add' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Add Purchase</span>
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'returns' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span>Purchase Returns (RMA)</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search PO #, supplier, or items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: LIST PURCHASE ORDERS */}
      {/* ============================================================== */}
      {activeTab === 'list' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">PO Number & Date</th>
                  <th className="py-3 px-3">Supplier Name</th>
                  <th className="py-3 px-3">Hardware Items Summary</th>
                  <th className="py-3 px-3 text-center">Quantity</th>
                  <th className="py-3 px-4 text-right">Grand Total (৳)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredPOs.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-xs">{po.poNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{po.orderDate}</div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {po.supplierName}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {po.items}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-900 dark:text-white">
                      {po.quantity} Units
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-sky-600 dark:text-sky-400 text-sm">
                      ৳ {po.totalCost.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold inline-flex items-center gap-1 ${
                        po.status === 'Received' 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : po.status === 'Port Customs'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      }`}>
                        {po.status === 'Received' && <CheckCircle2 className="w-3 h-3" />}
                        {po.status === 'In Transit' && <Truck className="w-3 h-3" />}
                        <span>{po.status}</span>
                      </span>
                      <div className="text-[9.5px] text-slate-400 mt-0.5 truncate max-w-[120px]">{po.expectedDelivery}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {po.status !== 'Received' ? (
                        <button
                          onClick={() => receivePurchaseOrder(po.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10.5px] font-bold shadow-sm transition flex items-center gap-1 mx-auto"
                        >
                          <PackageCheck className="w-3 h-3" />
                          <span>Receive Stock</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-400 font-mono">Stock Added ✓</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ADD PURCHASE FORM */}
      {/* ============================================================== */}
      {activeTab === 'add' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm max-w-xl mx-auto">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            Create Supplier Purchase Requisition
          </h2>
          <form onSubmit={handleCreatePOSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Select Supplier</label>
              <select
                value={poSupplier}
                onChange={e => setPoSupplier(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name} ({s.country})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Product to Restock</label>
              <select
                value={poProduct}
                onChange={e => {
                  setPoProduct(e.target.value);
                  const p = products.find(prod => prod.id === e.target.value);
                  if (p) setPoCost(p.costPrice.toString());
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Current Stock: {p.stockCount})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Quantity to Order</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={poQty}
                  onChange={e => setPoQty(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Agreed Unit Cost Price (৳)</label>
                <input
                  type="number"
                  placeholder="Leave empty for standard cost"
                  value={poCost}
                  onChange={e => setPoCost(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Import Notes & C&F Instructions</label>
              <input
                type="text"
                placeholder="e.g. Air freight transit via DHL Express to Banani Vault"
                value={poNotes}
                onChange={e => setPoNotes(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow"
            >
              Issue Purchase Order
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PURCHASE RETURNS */}
      {/* ============================================================== */}
      {activeTab === 'returns' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm text-center max-w-xl mx-auto space-y-3">
          <ArrowDownLeft className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Purchase Returns & RMA Replacements</h2>
          <p className="text-xs text-slate-400">
            Zero RMA backlog. All supplier warranty replacements from ASUS and Intel regional warranty centers are fully reconciled.
          </p>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400">
            Total Purchase Return Due: ৳ 0.00
          </div>
        </div>
      )}
    </div>
  );
};
