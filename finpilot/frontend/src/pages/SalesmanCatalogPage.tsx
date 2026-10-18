import React, { useState } from 'react';
import { 
  Cpu, 
  Search, 
  Plus, 
  Layers, 
  Package, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  X,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { useStore, Product } from '../context/StoreContext';

export const SalesmanCatalogPage: React.FC = () => {
  const { products, addNewProduct, addStock } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'low_stock'>('all');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState(10);

  // New product form state
  const [newProd, setNewProd] = useState({
    name: '',
    sku: '',
    category: 'Graphics Cards',
    brand: 'ASUS',
    retailPrice: 50000,
    costPrice: 40000,
    stockCount: 20,
    unit: 'Units',
    minThreshold: 15,
    location: 'Banani Central Vault #B1',
    warranty: '3 Years Official'
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.sku) return;
    addNewProduct({
      ...newProd,
      retailPrice: Number(newProd.retailPrice),
      costPrice: Number(newProd.costPrice),
      stockCount: Number(newProd.stockCount),
      minThreshold: Number(newProd.minThreshold)
    });
    setShowAddModal(false);
    setNewProd({
      name: '',
      sku: '',
      category: 'Graphics Cards',
      brand: 'ASUS',
      retailPrice: 50000,
      costPrice: 40000,
      stockCount: 20,
      unit: 'Units',
      minThreshold: 15,
      location: 'Banani Central Vault #B1',
      warranty: '3 Years Official'
    });
  };

  const handleApplyRestock = () => {
    if (restockProduct && restockQty > 0) {
      addStock(restockProduct.id, Number(restockQty));
      setRestockProduct(null);
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchStock = stockFilter === 'all' 
      ? true 
      : stockFilter === 'in_stock' 
        ? p.stockCount > p.minThreshold 
        : p.stockCount <= p.minThreshold;
    return matchSearch && matchCat && matchStock;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f6fc]">
              Hardware Catalog & Live Stock Management
            </h1>
            <span className="text-[11px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-mono font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              {products.length} SKUs Listed
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8b949e] mt-0.5">
            Add new hardware parts, restock existing inventory units, and monitor real-time stock levels.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
        >
          <Plus className="w-4 h-4" /> Add New Hardware Stock
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search catalog by component name, brand, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="py-2 px-3 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
        >
          <option value="All">All Categories</option>
          <option value="Graphics Cards">Graphics Cards</option>
          <option value="Processors">Processors</option>
          <option value="Memory (RAM)">Memory (RAM)</option>
          <option value="Storage">Storage</option>
          <option value="Motherboards">Motherboards</option>
          <option value="Power Supplies">Power Supplies</option>
          <option value="Cooling">Cooling</option>
        </select>

        <div className="flex rounded-xl bg-slate-100 dark:bg-[#21262d] p-1 text-xs">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition ${stockFilter === 'all' ? 'bg-white dark:bg-[#30363d] font-bold text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            All Stock
          </button>
          <button
            onClick={() => setStockFilter('in_stock')}
            className={`px-3 py-1 rounded-lg font-medium transition ${stockFilter === 'in_stock' ? 'bg-white dark:bg-[#30363d] font-bold text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            In Stock
          </button>
          <button
            onClick={() => setStockFilter('low_stock')}
            className={`px-3 py-1 rounded-lg font-medium transition ${stockFilter === 'low_stock' ? 'bg-white dark:bg-[#30363d] font-bold text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
          >
            Low Stock Alert
          </button>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="enterprise-table w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#21262d] text-slate-500 dark:text-[#8b949e] font-semibold border-b border-slate-200 dark:border-[#30363d]">
              <tr>
                <th className="py-3 px-4">Component & SKU</th>
                <th className="py-3 px-4">Category & Brand</th>
                <th className="py-3 px-4">Retail Rate (BDT)</th>
                <th className="py-3 px-4">Stock In Warehouse</th>
                <th className="py-3 px-4">Vault Location</th>
                <th className="py-3 px-4">Warranty</th>
                <th className="py-3 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]">
              {filtered.map((item) => {
                const isLow = item.stockCount <= item.minThreshold;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-[#21262d]/50 transition">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-bold text-slate-800 dark:text-[#f0f6fc]">{item.name}</div>
                      <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">{item.sku}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700 dark:text-slate-200">{item.category}</div>
                      <div className="text-[11px] text-slate-400">{item.brand}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                        ৳ {item.retailPrice.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Per {item.unit}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold font-mono text-[11px] ${
                        !isLow
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}>
                        {item.stockCount} {item.unit}
                        {isLow && <span className="text-[9px] font-bold uppercase">(Low Stock)</span>}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {item.location}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-[#8b949e]">
                      {item.warranty}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setRestockProduct(item);
                          setRestockQty(10);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 text-[11px] font-semibold transition"
                      >
                        + Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Add New Hardware Product / SKU */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#30363d]">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold">Add New Computer Hardware Stock</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="my-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Component Name & Full Specifications</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ASUS TUF GeForce RTX 4080 Super 16GB OC"
                  value={newProd.name}
                  onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">SKU Identification Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GPU-ASUS-4080S-16G"
                    value={newProd.sku}
                    onChange={(e) => setNewProd({ ...newProd, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Hardware Category</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl focus:outline-none"
                  >
                    <option value="Graphics Cards">Graphics Cards</option>
                    <option value="Processors">Processors</option>
                    <option value="Memory (RAM)">Memory (RAM)</option>
                    <option value="Storage">Storage</option>
                    <option value="Motherboards">Motherboards</option>
                    <option value="Power Supplies">Power Supplies</option>
                    <option value="Cooling">Cooling</option>
                    <option value="Chassis">Chassis</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Retail Rate (৳)</label>
                  <input
                    type="number"
                    required
                    value={newProd.retailPrice}
                    onChange={(e) => setNewProd({ ...newProd, retailPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={newProd.stockCount}
                    onChange={(e) => setNewProd({ ...newProd, stockCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl font-mono font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Unit Measure</label>
                  <select
                    value={newProd.unit}
                    onChange={(e) => setNewProd({ ...newProd, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl focus:outline-none"
                  >
                    <option value="Units">Units</option>
                    <option value="Pieces">Pieces</option>
                    <option value="Kits">Kits</option>
                    <option value="Boxes">Boxes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1">Vault / Shelf Location</label>
                  <input
                    type="text"
                    value={newProd.location}
                    onChange={(e) => setNewProd({ ...newProd, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Warranty Term</label>
                  <input
                    type="text"
                    value={newProd.warranty}
                    onChange={(e) => setNewProd({ ...newProd, warranty: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-[#30363d] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#21262d] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md"
                >
                  Save & Add to Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Quick Restock Existing Product */}
      {restockProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl max-w-sm w-full p-5 shadow-2xl text-slate-800 dark:text-slate-100">
            <h3 className="text-sm font-bold">Restock Hardware Product</h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{restockProduct.name}</p>
            <p className="text-[11px] text-slate-400 font-mono">Current Stock: {restockProduct.stockCount} {restockProduct.unit}</p>

            <div className="my-4">
              <label className="font-semibold text-xs block mb-1">Quantity to Add ({restockProduct.unit})</label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl font-mono font-bold text-sm"
              />
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                New Stock will be: {restockProduct.stockCount + Number(restockQty)} {restockProduct.unit}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRestockProduct(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-[#21262d] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyRestock}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
