import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Truck, 
  FileText, 
  DollarSign, 
  Clock, 
  ShieldCheck,
  Package
} from 'lucide-react';

import { useStore, Product } from '../context/StoreContext';

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  paymentTerms: string;
  activeOrdersValue: number;
  rating: string;
}

export const SupplierManagementPage: React.FC = () => {
  const { products, purchaseOrders, receivePurchaseOrder, createPurchaseOrder, addStock } = useStore();
  const [activeTab, setActiveTab] = useState<'suppliers' | 'orders' | 'reorder'>('suppliers');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPOModal, setShowPOModal] = useState(false);
  const [selectedProductForPO, setSelectedProductForPO] = useState<Product | null>(null);
  const [poQty, setPoQty] = useState(30);
  const [poSupplier, setPoSupplier] = useState('ASUS Regional Distribution (Singapore)');

  const suppliers: Supplier[] = [
    {
      id: 's1',
      name: 'ASUS Regional Distribution (Singapore)',
      contactPerson: 'Kenji Tan',
      email: 'b2b.procurement@asus-apac.com',
      phone: '+65 6789-0123',
      category: 'Motherboards, GPUs, Monitors',
      paymentTerms: 'LC 60-Day at Sight (Prime Bank)',
      activeOrdersValue: 8400000,
      rating: 'Tier 1 Prime Partner'
    },
    {
      id: 's2',
      name: 'Intel South Asia Authorized Distributor',
      contactPerson: 'Farida Yasmin',
      email: 'bd.distribution@intel.com',
      phone: '+880 2 987-6543',
      category: 'Core i5/i7/i9 Processors, Xeons',
      paymentTerms: 'Bank Wire 30% Advance, 70% Delivery',
      activeOrdersValue: 4800000,
      rating: 'Direct Manufacturer'
    },
    {
      id: 's3',
      name: 'Corsair APAC Direct Wholesaler',
      contactPerson: 'Alex Chen',
      email: 'distro.corsair@corsair-apac.com',
      phone: '+886 2 2345-6789',
      category: 'DDR5 Memory, Gold Modular PSUs, AIOs',
      paymentTerms: 'TT 45 Days (BRAC Bank Credit Line)',
      activeOrdersValue: 2650000,
      rating: 'Exclusive Distributor'
    },
    {
      id: 's4',
      name: 'Kingston Technology Global Logistics',
      contactPerson: 'David Wong',
      email: 'inbound.bd@kingston.com',
      phone: '+852 3456-7890',
      category: 'PCIe 4.0 SSDs, USB Storage, HyperX',
      paymentTerms: 'Confirmed Irrevocable LC',
      activeOrdersValue: 1950000,
      rating: 'Tier 1 Partner'
    }
  ];

  // Dynamically compute low stock alerts from actual real-time inventory
  const lowStockAlerts = products.filter((p) => p.stockCount <= p.minThreshold);

  const handleIssuePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForPO) return;
    createPurchaseOrder({
      supplierName: poSupplier,
      productId: selectedProductForPO.id,
      quantity: Number(poQty),
      totalCost: selectedProductForPO.costPrice * Number(poQty),
      itemsSummary: `${poQty}x ${selectedProductForPO.name}`
    });
    setShowPOModal(false);
    setActiveTab('orders');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f6fc]">
              Supplier & Purchase Management
            </h1>
            <span className="text-[11px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-mono font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              Executive Procurement
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8b949e] mt-0.5">
            Vendor contracts, wholesale purchase cost tracking, bulk supplier orders, and automatic reorder thresholds.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-white dark:bg-[#161b22] p-1 rounded-xl border border-slate-200 dark:border-[#30363d] text-xs font-medium shadow-sm">
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'suppliers' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 dark:text-slate-300'}`}
          >
            Vendors ({suppliers.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'orders' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 dark:text-slate-300'}`}
          >
            Purchase Orders ({purchaseOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('reorder')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'reorder' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 dark:text-slate-300'}`}
          >
            Reorder Alerts ({lowStockAlerts.length})
          </button>
        </div>
      </div>

      {/* Main Content Area Based on Active Tab */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-5 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{s.name}</h3>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">{s.category}</div>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  {s.rating}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#21262d] text-xs space-y-1 text-slate-600 dark:text-slate-300 font-mono">
                <div>Contact: <span className="font-semibold text-slate-800 dark:text-white">{s.contactPerson}</span> ({s.email})</div>
                <div>Payment Terms: <span className="font-semibold text-slate-800 dark:text-white">{s.paymentTerms}</span></div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Active Procurement Pipeline:</span>
                  <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                    ৳ {(s.activeOrdersValue / 1000000).toFixed(2)}M
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPoSupplier(s.name);
                    setSelectedProductForPO(products[0]);
                    setShowPOModal(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100 transition"
                >
                  Create Bulk PO
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="enterprise-table w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#21262d] text-slate-400 font-semibold border-b border-slate-200 dark:border-[#30363d]">
                <tr>
                  <th className="py-3 px-4">PO # & Date</th>
                  <th className="py-3 px-4">Vendor Partner</th>
                  <th className="py-3 px-4">Ordered Components</th>
                  <th className="py-3 px-4">Cost (BDT)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Expected Arrival</th>
                  <th className="py-3 px-4 text-right">Inbound Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/70 dark:hover:bg-[#21262d]/50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {po.poNumber}
                      <div className="text-[10px] text-slate-400 font-normal">{po.orderDate}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {po.supplierName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {po.items}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      ৳ {(po.totalCost / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        po.status === 'Port Customs'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                          : po.status === 'In Transit'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {po.expectedDelivery}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {po.status !== 'Received' ? (
                        <button
                          onClick={() => receivePurchaseOrder(po.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] shadow-sm transition flex items-center gap-1.5 ml-auto"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Receive & Restock
                        </button>
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Added to Vault
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reorder' && (
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-[#30363d] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Inventory Reorder Triggers ({lowStockAlerts.length} Parts Below Threshold)
              </h2>
              <p className="text-xs text-slate-400">Triggered dynamically when live product stock drops below safety minimum</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            {lowStockAlerts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                All hardware inventory is well above minimum stock safety thresholds.
              </div>
            ) : (
              <table className="enterprise-table w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#21262d] text-slate-400 font-semibold border-b border-slate-200 dark:border-[#30363d]">
                  <tr>
                    <th className="py-3 px-4">Hardware Component</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Safety Threshold</th>
                    <th className="py-3 px-4">Alert Level</th>
                    <th className="py-3 px-4">Recommended Batch</th>
                    <th className="py-3 px-4">Est. Wholesale Cost</th>
                    <th className="py-3 px-4 text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]">
                  {lowStockAlerts.map((p) => {
                    const batch = p.minThreshold * 2;
                    const estCost = batch * p.costPrice;
                    const isCritical = p.stockCount <= 10;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-[#21262d]/50 transition">
                        <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                          {p.name}
                          <div className="font-mono text-[10px] text-slate-400">{p.sku}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-rose-500">
                          {p.stockCount} {p.unit}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-500">
                          {p.minThreshold} {p.unit}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                            isCritical
                              ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
                              : 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400'
                          }`}>
                            {isCritical ? 'Critical Reorder' : 'Reorder Warning'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                          +{batch} {p.unit}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                          ৳ {(estCost / 1000000).toFixed(2)}M
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => addStock(p.id, batch)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                          >
                            + Restock {batch} {p.unit}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* PO Creation Modal */}
      {showPOModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-800 dark:text-slate-100">
            <h3 className="text-base font-bold mb-3">Issue Bulk Purchase Order</h3>
            <form onSubmit={handleIssuePO} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Supplier Partner</label>
                <select
                  value={poSupplier}
                  onChange={(e) => setPoSupplier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl focus:outline-none"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Hardware Part to Procure</label>
                <select
                  value={selectedProductForPO?.id || products[0].id}
                  onChange={(e) => {
                    const found = products.find((p) => p.id === e.target.value);
                    if (found) setSelectedProductForPO(found);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl focus:outline-none"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockCount})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Procurement Units Quantity</label>
                <input
                  type="number"
                  min="5"
                  required
                  value={poQty}
                  onChange={(e) => setPoQty(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl font-mono focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#21262d] text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Issue & Dispatch PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
