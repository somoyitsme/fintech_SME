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

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

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
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <span>All Purchase Orders ({purchaseOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'add' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <span>Add Purchase</span>
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'returns' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
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
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px] tracking-wider">
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
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{po.orderDate}</div>
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
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                          : po.status === 'Port Customs'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse'
                          : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      }`}>
                        {po.status === 'Received' && <CheckCircle2 className="w-3 h-3" />}
                        {po.status === 'In Transit' && <Truck className="w-3 h-3" />}
                        <span>{po.status}</span>
                      </span>
                      <div className="text-[9.5px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[120px]">{po.expectedDelivery}</div>
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
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">Stock Added ✓</span>
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
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Select Supplier</label>
              <select
                value={poSupplier}
                onChange={e => setPoSupplier(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
              >
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name} ({s.country})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Product to Restock</label>
              <select
                value={poProduct}
                onChange={e => {
                  setPoProduct(e.target.value);
                  const p = products.find(prod => prod.id === e.target.value);
                  if (p) setPoCost(p.costPrice.toString());
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
              >
                {products.map(p => <option key={p.id} value={p.id}>{p.name} (Current Stock: {p.stockCount})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Quantity to Order</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={poQty}
                  onChange={e => setPoQty(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Agreed Unit Cost Price (৳)</label>
                <input
                  type="number"
                  placeholder="Leave empty for standard cost"
                  value={poCost}
                  onChange={e => setPoCost(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Import Notes & C&F Instructions</label>
              <input
                type="text"
                placeholder="e.g. Air freight transit via DHL Express to Banani Vault"
                value={poNotes}
                onChange={e => setPoNotes(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
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
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <ArrowDownLeft className="w-4 h-4 text-rose-500" />
                Supplier Purchase Returns & RMA Dispatch
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Defective units dispatched back to Singapore / HK distributor authorized service centers
              </p>
            </div>
            <button
              onClick={() => alert("Recorded new RMA claim RMA-2026-089 for ASUS APAC warranty replacement.")}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Record RMA Return</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">RMA # & Date</th>
                  <th className="py-3 px-3">Supplier</th>
                  <th className="py-3 px-3">Item Returned</th>
                  <th className="py-3 px-3">Defect Reason</th>
                  <th className="py-3 px-3 text-right">Credit Value (৳)</th>
                  <th className="py-3 px-4 text-center">RMA Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white font-mono">RMA-2026-081</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">12/09/2026</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">ASUS Regional Distribution (Singapore)</td>
                  <td className="py-3 px-3 text-slate-900 dark:text-white">2x ASUS ROG Strix GeForce RTX 4080 Super</td>
                  <td className="py-3 px-3 text-rose-500 dark:text-rose-400">Memory Artifacting on Cold Boot</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">৳ 290,000</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      ● Replacement Received
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white font-mono">RMA-2026-082</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">28/09/2026</div>
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300">Intel Authorized Distributor (BD Hub)</td>
                  <td className="py-3 px-3 text-slate-900 dark:text-white">1x Intel Core i9-14900K Processor</td>
                  <td className="py-3 px-3 text-rose-500 dark:text-rose-400">Vmin Instability / Crash under Prime95</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">৳ 62,000</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                      ● Credit Note Reconciled
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
