import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Barcode, 
  Edit3, 
  AlertCircle, 
  CheckCircle2, 
  Printer, 
  X, 
  SlidersHorizontal,
  Layers,
  Award,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { useStore, Product } from '../context/StoreContext';

interface ProductsPageProps {
  initialTab?: 'list' | 'add' | 'prices' | 'labels' | 'categories' | 'brands' | 'warranties';
  onNavigateTab?: (tab: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ 
  initialTab = 'list',
  onNavigateTab 
}) => {
  const { products, addStock, addNewProduct } = useStore();
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'prices' | 'labels' | 'categories' | 'brands' | 'warranties'>(initialTab);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');

  // Modals
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [stockAddQty, setStockAddQty] = useState('10');
  const [stockAddCost, setStockAddCost] = useState('');

  // Barcode Label Generator State
  const [selectedForLabel, setSelectedForLabel] = useState<Product>(products[0] || null);
  const [labelQty, setLabelQty] = useState(8);

  // New Product Form State
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState('Graphics Cards');
  const [pBrand, setPBrand] = useState('ASUS');
  const [pPrice, setPPrice] = useState('');
  const [pCost, setPCost] = useState('');
  const [pStock, setPStock] = useState('15');
  const [pLocation, setPLocation] = useState('Banani Central Vault #B2');
  const [pWarranty, setPWarranty] = useState('3 Years Official');

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];
  const brands = ['All', ...Array.from(new Set(products.map(p => p.brand)))];

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    return matchSearch && matchCategory && matchBrand;
  });

  const handleStockAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalProduct) return;
    const qty = parseInt(stockAddQty) || 0;
    const cost = stockAddCost ? parseFloat(stockAddCost) : undefined;
    addStock(stockModalProduct.id, qty, cost);
    setStockModalProduct(null);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || !pPrice) return;
    addNewProduct({
      name: pName,
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      category: pCategory,
      brand: pBrand,
      retailPrice: parseFloat(pPrice) || 0,
      costPrice: parseFloat(pCost) || parseFloat(pPrice) * 0.8,
      stockCount: parseInt(pStock) || 10,
      unit: 'Units',
      minThreshold: 5,
      location: pLocation,
      warranty: pWarranty
    });
    setPName('');
    setPPrice('');
    setPCost('');
    setActiveTab('list');
  };

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-500" />
            Product & Inventory Catalog
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            27 authentic StarTech hardware SKUs with stock monitoring, barcodes & retail prices
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('labels')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition border border-slate-700"
          >
            <Barcode className="w-4 h-4 text-emerald-400" />
            <span>Print Labels</span>
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'list' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          List Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'add' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Add Product
        </button>
        <button
          onClick={() => setActiveTab('labels')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'labels' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Print Barcode Labels
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'categories' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Categories
        </button>
        <button
          onClick={() => setActiveTab('brands')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'brands' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Brands
        </button>
        <button
          onClick={() => setActiveTab('warranties')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'warranties' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Warranties
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: LIST PRODUCTS */}
      {/* ============================================================== */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1e293b] p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by product name, SKU or model..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
              </select>

              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                {brands.map(b => <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>)}
              </select>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Showing {filteredProducts.length} of {products.length} Products
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Hardware SKU & Model</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Brand</th>
                    <th className="py-3 px-3">Location</th>
                    <th className="py-3 px-3 text-center">Stock</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-3 text-right">Cost Price</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredProducts.map((p) => {
                    const isLow = p.stockCount <= p.minThreshold;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-blue-500 font-mono mt-0.5">
                            {p.sku} • {p.warranty}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10.5px]">
                            {p.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          {p.brand}
                        </td>
                        <td className="py-3 px-3 text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                          {p.location}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] inline-flex items-center gap-1 ${
                            isLow 
                              ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30 animate-pulse' 
                              : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                          }`}>
                            {p.stockCount} {p.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                          ৳ {p.retailPrice.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-400 text-xs">
                          ৳ {p.costPrice.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => {
                              setStockModalProduct(p);
                              setStockAddQty('10');
                            }}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold shadow-sm transition"
                          >
                            + Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ADD PRODUCT FORM */}
      {/* ============================================================== */}
      {activeTab === 'add' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            Add New Hardware Product to Master Catalog
          </h2>
          <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Product Title & Full Specifications</label>
              <input
                type="text"
                required
                value={pName}
                onChange={e => setPName(e.target.value)}
                placeholder="e.g. ASUS Dual GeForce RTX 4070 EVO OC Edition 12GB GDDR6X"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Category</label>
                <select
                  value={pCategory}
                  onChange={e => setPCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                >
                  <option>Graphics Cards</option>
                  <option>Processors</option>
                  <option>Motherboards</option>
                  <option>Memory (RAM)</option>
                  <option>Storage</option>
                  <option>Power Supplies</option>
                  <option>Cooling</option>
                  <option>Casings</option>
                  <option>Monitors</option>
                  <option>Laptops</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Brand / Manufacturer</label>
                <input
                  type="text"
                  required
                  value={pBrand}
                  onChange={e => setPBrand(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Retail Price (৳)</label>
                <input
                  type="number"
                  required
                  value={pPrice}
                  onChange={e => setPPrice(e.target.value)}
                  placeholder="85000"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Cost Price (৳)</label>
                <input
                  type="number"
                  value={pCost}
                  onChange={e => setPCost(e.target.value)}
                  placeholder="68000"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Initial Stock Units</label>
                <input
                  type="number"
                  value={pStock}
                  onChange={e => setPStock(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Warehouse Vault Location</label>
                <input
                  type="text"
                  value={pLocation}
                  onChange={e => setPLocation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Official Warranty</label>
                <input
                  type="text"
                  value={pWarranty}
                  onChange={e => setPWarranty(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow"
            >
              Add Product to System
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PRINT BARCODE LABELS */}
      {/* ============================================================== */}
      {activeTab === 'labels' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Barcode className="w-5 h-5 text-emerald-400" />
                Barcode Label Generator & Thermal Printing
              </h2>
              <p className="text-xs text-slate-400">
                Generate high-density product barcode stickers for showroom retail packaging
              </p>
            </div>
            <button 
              onClick={() => window.print()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Sticker Sheet</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 text-xs">Select Hardware Product</label>
              <select
                value={selectedForLabel ? selectedForLabel.id : ''}
                onChange={e => {
                  const found = products.find(p => p.id === e.target.value);
                  if (found) setSelectedForLabel(found);
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (৳{p.retailPrice.toLocaleString()})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 mb-1 text-xs">Number of Labels to Generate</label>
              <input
                type="number"
                min="1"
                max="32"
                value={labelQty}
                onChange={e => setLabelQty(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Barcode Stickers Grid Preview */}
          <div className="p-5 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Preview Printable Sheet ({labelQty} Stickers)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: labelQty }).map((_, i) => (
                <div key={i} className="p-3 bg-white text-black rounded-lg border border-slate-300 shadow-sm text-center flex flex-col justify-between h-32">
                  <div className="text-[10px] font-extrabold uppercase tracking-tight text-blue-900">
                    DHAKA SILICON LTD
                  </div>
                  <div className="text-[11px] font-bold line-clamp-2 text-slate-800 leading-tight">
                    {selectedForLabel?.name}
                  </div>
                  {/* Simulated Barcode */}
                  <div className="my-1 flex items-center justify-center gap-0.5 h-6">
                    {Array.from({ length: 28 }).map((_, bIdx) => (
                      <div 
                        key={bIdx} 
                        className={`h-full bg-black ${bIdx % 3 === 0 ? 'w-1' : bIdx % 2 === 0 ? 'w-0.5' : 'w-0.5 bg-transparent'}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono px-1">
                    <span className="text-slate-600">{selectedForLabel?.sku}</span>
                    <span className="font-extrabold text-black">৳{selectedForLabel?.retailPrice.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: CATEGORIES OVERVIEW */}
      {/* ============================================================== */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.filter(c => c !== 'All').map(cat => {
            const catProds = products.filter(p => p.category === cat);
            const totalStock = catProds.reduce((s, p) => s + p.stockCount, 0);
            const totalVal = catProds.reduce((s, p) => s + p.stockCount * p.retailPrice, 0);
            return (
              <div key={cat} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-blue-400">{cat}</span>
                  <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    {catProds.length} SKUs
                  </span>
                </div>
                <div className="text-xs text-slate-400 mb-1">
                  Units in Stock: <span className="font-bold text-white">{totalStock} Units</span>
                </div>
                <div className="text-xs text-slate-400">
                  Inventory Valuation: <span className="font-bold text-emerald-400 font-mono">৳{totalVal.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: BRANDS OVERVIEW */}
      {/* ============================================================== */}
      {activeTab === 'brands' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.filter(b => b !== 'All').map(brand => {
            const bProds = products.filter(p => p.brand === brand);
            const count = bProds.length;
            const units = bProds.reduce((s, p) => s + p.stockCount, 0);
            return (
              <div key={brand} className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm text-center">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 font-black text-sm flex items-center justify-center mx-auto mb-2">
                  {brand[0]}
                </div>
                <div className="font-bold text-slate-900 dark:text-white text-sm">{brand}</div>
                <div className="text-xs text-slate-400 mt-1">{count} Products • {units} Units</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: WARRANTIES */}
      {/* ============================================================== */}
      {activeTab === 'warranties' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mb-2" />
            <h3 className="font-bold text-sm text-white">3 Years Replacement Warranty</h3>
            <p className="text-xs text-slate-400 mt-1">
              Applicable to Intel 14th Gen, AMD Ryzen 7000 processors, and MSI/ASUS motherboards.
            </p>
          </div>
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-blue-400 mb-2" />
            <h3 className="font-bold text-sm text-white">5 Years / 10 Years Warranty</h3>
            <p className="text-xs text-slate-400 mt-1">
              Applicable to Samsung 990 Pro SSDs (5 Years) and Corsair RM850x Gold PSUs (10 Years official manufacturer guarantee).
            </p>
          </div>
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <ShieldCheck className="w-8 h-8 text-purple-400 mb-2" />
            <h3 className="font-bold text-sm text-white">Lifetime Official Warranty</h3>
            <p className="text-xs text-slate-400 mt-1">
              Applicable to Corsair Vengeance, G.Skill Trident Z5, and Team T-Force desktop DDR4/DDR5 memory modules.
            </p>
          </div>
        </div>
      )}

      {/* MODAL: ADD STOCK QUICK ACTION */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-md p-5 text-slate-100 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-700 mb-3">
              <span className="font-bold text-sm">Add Stock Units</span>
              <button onClick={() => setStockModalProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mb-3">
              <div className="font-bold text-sm text-white">{stockModalProduct.name}</div>
              <div className="text-xs text-blue-400 font-mono mt-0.5">Current Stock: {stockModalProduct.stockCount} {stockModalProduct.unit}</div>
            </div>
            <form onSubmit={handleStockAdd} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Additional Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockAddQty}
                  onChange={e => setStockAddQty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Unit Cost Price (৳, Optional to update)</label>
                <input
                  type="number"
                  placeholder={stockModalProduct.costPrice.toString()}
                  value={stockAddCost}
                  onChange={e => setStockAddCost(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition"
              >
                Confirm Restock
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
