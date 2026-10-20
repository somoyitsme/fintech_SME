import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Barcode, 
  SlidersHorizontal,
  Layers,
  ShieldCheck,
  Tag,
  Printer,
  Boxes,
  ArrowDownLeft,
  FileSpreadsheet,
  Warehouse,
  Check,
  Building2
} from 'lucide-react';
import { useStore, Product } from '../context/StoreContext';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { DataTable, TableHeader, TableHeadCell, TableBody, TableRow, TableCell } from '../components/common/DataTable';
import { TabGroup, TabItem } from '../components/common/TabGroup';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Pagination } from '../components/common/Pagination';

interface ProductsPageProps {
  initialTab?: 'list' | 'add' | 'prices' | 'labels' | 'variations' | 'import' | 'units' | 'categories' | 'brands' | 'warranties' | 'branches';
  onNavigateTab?: (tab: string) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ 
  initialTab = 'list',
  onNavigateTab: _onNavigateTab 
}) => {
  const { products, addStock, addNewProduct, updateProduct } = useStore();
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'prices' | 'labels' | 'variations' | 'import' | 'units' | 'categories' | 'brands' | 'warranties' | 'branches'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All');

  // Pagination for main catalog
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Pagination for price adjuster
  const [pricePage, setPricePage] = useState(1);
  const [pricePageSize, setPricePageSize] = useState(10);

  // Batch price & margin adjuster state
  const [priceEdits, setPriceEdits] = useState<Record<string, { retailPrice: number; costPrice: number }>>({});
  const [savingPrices, setSavingPrices] = useState(false);
  const [priceSaveSuccess, setPriceSaveSuccess] = useState(false);

  // Quick price edit modal for individual product
  const [editPriceProduct, setEditPriceProduct] = useState<Product | null>(null);
  const [editRetailPrice, setEditRetailPrice] = useState('');
  const [editCostPrice, setEditCostPrice] = useState('');
  const [savingSinglePrice, setSavingSinglePrice] = useState(false);

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
  const branchOptions = [
    { id: 'All', label: 'All Branches & Vaults' },
    { id: 'Banani', label: 'Banani Central Vault & Warehouse' },
    { id: 'Multiplan', label: 'Elephant Road Multiplan Branch' },
    { id: 'IDB', label: 'BCS Computer City IDB Branch' }
  ];

  // Reset to page 1 on filter changes
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory, selectedBrand, selectedBranch]);

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    const matchBranch = selectedBranch === 'All' || p.location.toLowerCase().includes(selectedBranch.toLowerCase());
    return matchSearch && matchCategory && matchBrand && matchBranch;
  });

  const paginatedProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const handleStockAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalProduct) return;
    const qty = parseInt(stockAddQty) || 0;
    const cost = stockAddCost ? parseFloat(stockAddCost) : undefined;
    addStock(stockModalProduct.id, qty, cost);
    setStockModalProduct(null);
  };

  const handlePriceChange = (prodId: string, field: 'retailPrice' | 'costPrice', val: number) => {
    setPriceEdits(prev => {
      const prod = products.find(p => p.id === prodId);
      const current = prev[prodId] || { retailPrice: prod?.retailPrice || 0, costPrice: prod?.costPrice || 0 };
      return {
        ...prev,
        [prodId]: {
          ...current,
          [field]: Math.max(0, val)
        }
      };
    });
  };

  const handleCommitPrices = async () => {
    const entries = Object.entries(priceEdits);
    if (entries.length === 0) return;
    setSavingPrices(true);
    try {
      for (const [id, updates] of entries) {
        await updateProduct(id, updates);
      }
      setPriceEdits({});
      setPriceSaveSuccess(true);
      setTimeout(() => setPriceSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to commit price changes:", err);
    } finally {
      setSavingPrices(false);
    }
  };

  const handleSaveSinglePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPriceProduct) return;
    const retail = parseFloat(editRetailPrice) || editPriceProduct.retailPrice;
    const cost = parseFloat(editCostPrice) || editPriceProduct.costPrice;
    setSavingSinglePrice(true);
    try {
      await updateProduct(editPriceProduct.id, {
        retailPrice: retail,
        costPrice: cost
      });
      setEditPriceProduct(null);
    } catch (err) {
      console.error("Failed to update product price:", err);
    } finally {
      setSavingSinglePrice(false);
    }
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

  const tabs: TabItem[] = [
    { id: 'list', label: 'Product Catalog', count: products.length, icon: <Package className="w-3.5 h-3.5" /> },
    { id: 'add', label: 'Add Product', icon: <Plus className="w-3.5 h-3.5" /> },
    { id: 'prices', label: 'Update Prices & Margins', icon: <Tag className="w-3.5 h-3.5" /> },
    { id: 'branches', label: 'Branch Warehouses', icon: <Warehouse className="w-3.5 h-3.5" /> },
    { id: 'labels', label: 'Print Barcodes', icon: <Barcode className="w-3.5 h-3.5" /> },
    { id: 'variations', label: 'Variations', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> },
    { id: 'import', label: 'Import CSV', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
    { id: 'units', label: 'Measurement Units', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'categories', label: 'Categories', icon: <Boxes className="w-3.5 h-3.5" /> },
    { id: 'brands', label: 'Authorized Brands', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'warranties', label: 'Warranty Ledgers', icon: <ShieldCheck className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="space-y-5 select-none animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-boundary-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-content-primary flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-ochreDeep dark:text-brand-ochre" />
            Hardware & Inventory Catalog
          </h1>
          <p className="text-xs text-content-muted mt-0.5">
            Real-time multi-location warehouse stock, barcode generation & retail margins
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('labels')}
            leftIcon={<Barcode className="w-4 h-4 text-brand-ochreDeep dark:text-brand-ochre" />}
          >
            <span>Print Labels</span>
          </Button>
          <Button
            variant="brand"
            size="sm"
            onClick={() => setActiveTab('add')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {/* Segmented Sub-Navigation Tabs */}
      <TabGroup
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as any)}
      />

      {/* ============================================================== */}
      {/* TAB 1: LIST PRODUCTS */}
      {/* ============================================================== */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface p-3 sm:p-4 rounded-xl border border-boundary-subtle shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-content-muted" />
                <input
                  type="text"
                  placeholder="Search by hardware name, SKU or model..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-surface-secondary border border-boundary-subtle rounded-lg text-xs text-content-primary placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-brand-ochre"
                />
              </div>

              <select
                value={selectedBranch}
                onChange={e => setSelectedBranch(e.target.value)}
                className="bg-surface-secondary border border-boundary-subtle text-content-secondary text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-ochre cursor-pointer font-medium"
              >
                {branchOptions.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>

              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-surface-secondary border border-boundary-subtle text-content-secondary text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-ochre cursor-pointer"
              >
                {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
              </select>

              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                className="bg-surface-secondary border border-boundary-subtle text-content-secondary text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-ochre cursor-pointer"
              >
                {brands.map(b => <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>)}
              </select>
            </div>

            <div className="text-xs text-content-muted font-mono font-tabular">
              Showing {filteredProducts.length} of {products.length} SKUs
            </div>
          </div>

          {/* Responsive Data Table */}
          <DataTable className="[&_table]:min-w-[1040px]" isEmpty={filteredProducts.length === 0} emptyMessage="No hardware products found matching filter criteria.">
            <TableHeader>
              <tr>
                <TableHeadCell>Hardware Model & SKU</TableHeadCell>
                <TableHeadCell>Category</TableHeadCell>
                <TableHeadCell>Brand</TableHeadCell>
                <TableHeadCell>Vault Location</TableHeadCell>
                <TableHeadCell align="center">Stock Level</TableHeadCell>
                <TableHeadCell align="right">Selling Price</TableHeadCell>
                <TableHeadCell align="right">Cost Price</TableHeadCell>
                <TableHeadCell align="center">Action</TableHeadCell>
              </tr>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((p) => {
                const isLow = p.stockCount <= p.minThreshold;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="max-w-xs">
                      <div className="font-semibold text-content-primary text-[13px] leading-5 truncate">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-content-muted font-mono mt-0.5 truncate">
                        {p.sku} • {p.warranty}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-content-secondary whitespace-nowrap">
                      {p.category}
                    </TableCell>
                    <TableCell className="font-medium text-content-primary">
                      {p.brand}
                    </TableCell>
                    <TableCell className="text-content-muted text-[11px] truncate max-w-[130px]">
                      {p.location}
                    </TableCell>
                    <TableCell align="center">
                      <div className="inline-flex min-w-[104px] flex-col items-center gap-0.5">
                        <span className={`font-semibold font-tabular text-[13px] ${isLow ? 'text-status-danger' : 'text-content-primary'}`}>
                          {p.stockCount} <span className="text-[11px] font-medium text-content-muted">{p.unit}</span>
                        </span>
                        <span className={`text-[10px] font-medium ${isLow ? 'text-status-danger' : 'text-content-muted'}`}>
                          {isLow ? `Reorder at ${p.minThreshold}` : 'In stock'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell align="right" tabular className="font-bold text-content-primary text-sm">
                      ৳ {p.retailPrice.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" tabular className="text-content-muted text-xs">
                      ৳ {p.costPrice.toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setStockModalProduct(p);
                            setStockAddQty('10');
                          }}
                          leftIcon={<ArrowDownLeft className="w-3 h-3 text-status-success" />}
                        >
                          Add Stock
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditPriceProduct(p);
                            setEditRetailPrice(p.retailPrice.toString());
                            setEditCostPrice(p.costPrice.toString());
                          }}
                          leftIcon={<Tag className="w-3 h-3 text-brand-ochreDeep dark:text-brand-ochre" />}
                        >
                          Price
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </DataTable>

          {/* List Pagination */}
          <Pagination
            currentPage={page}
            totalItems={filteredProducts.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ADD PRODUCT */}
      {/* ============================================================== */}
      {activeTab === 'add' && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader
            title="Register New Hardware Product"
            subtitle="Add authentic computer components to the central warehouse catalog"
          />
          <CardContent>
            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              <Input
                label="Product Title & Model Specifications"
                required
                value={pName}
                onChange={e => setPName(e.target.value)}
                placeholder="e.g. ASUS ROG Strix GeForce RTX 4080 Super 16GB OC"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Hardware Category"
                  value={pCategory}
                  onChange={e => setPCategory(e.target.value)}
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
                </Select>

                <Input
                  label="Brand / Manufacturer"
                  required
                  value={pBrand}
                  onChange={e => setPBrand(e.target.value)}
                  placeholder="e.g. ASUS"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Selling Price (৳)"
                  type="number"
                  required
                  value={pPrice}
                  onChange={e => setPPrice(e.target.value)}
                  placeholder="148000"
                />

                <Input
                  label="Cost Price (৳)"
                  type="number"
                  value={pCost}
                  onChange={e => setPCost(e.target.value)}
                  placeholder="120000"
                />

                <Input
                  label="Initial Warehouse Units"
                  type="number"
                  value={pStock}
                  onChange={e => setPStock(e.target.value)}
                  placeholder="10"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Warehouse Storage Vault"
                  value={pLocation}
                  onChange={e => setPLocation(e.target.value)}
                  placeholder="Banani Central Vault #B1"
                />

                <Input
                  label="Official Warranty Duration"
                  value={pWarranty}
                  onChange={e => setPWarranty(e.target.value)}
                  placeholder="3 Years Official Replacement"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <Button type="button" variant="outline" onClick={() => setActiveTab('list')}>
                  Cancel
                </Button>
                <Button type="submit" variant="brand">
                  Save Product to Catalog
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 3: PRINT BARCODE LABELS */}
      {/* ============================================================== */}
      {activeTab === 'labels' && (
        <Card className="space-y-4">
          <CardHeader
            title="Barcode Label Generator & Thermal Printing"
            subtitle="Print high-density adhesive barcode stickers for showroom retail packaging"
            action={
              <Button
                variant="brand"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print Sticker Sheet
              </Button>
            }
          />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-content-secondary font-semibold mb-1 text-xs">Select Hardware SKU</label>
                <select
                  value={selectedForLabel ? selectedForLabel.id : ''}
                  onChange={e => {
                    const found = products.find(p => p.id === e.target.value);
                    if (found) setSelectedForLabel(found);
                  }}
                  className="w-full bg-surface border border-boundary-strong text-content-primary rounded-lg px-3 py-2 text-xs focus:outline-none"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (৳{p.retailPrice.toLocaleString()})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-content-secondary font-semibold mb-1 text-xs">Number of Labels</label>
                <input
                  type="number"
                  min="1"
                  max="32"
                  value={labelQty}
                  onChange={e => setLabelQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-surface border border-boundary-strong text-content-primary rounded-lg px-3 py-2 text-xs focus:outline-none font-tabular"
                />
              </div>
            </div>

            {/* Barcode Stickers Grid Preview */}
            <div className="p-4 sm:p-5 bg-surface-secondary rounded-xl border border-boundary-subtle">
              <div className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-3">
                Print Sheet Preview ({labelQty} Adhesive Labels)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Array.from({ length: labelQty }).map((_, i) => (
                  <div key={i} className="p-3 bg-white text-stone-900 rounded-lg border border-stone-300 shadow-xs text-center flex flex-col justify-between h-32">
                    <div className="text-[10px] font-black uppercase tracking-tight text-stone-950">
                      NOW_OR_NEVER CONSOLE
                    </div>
                    <div className="text-[10.5px] font-semibold line-clamp-2 text-stone-800 leading-tight">
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
                    <div className="flex justify-between items-center text-[10px] font-mono px-1 font-tabular">
                      <span className="text-stone-600">{selectedForLabel?.sku}</span>
                      <span className="font-extrabold text-stone-950">৳{selectedForLabel?.retailPrice.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
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
              <Card key={cat} hoverable>
                <CardHeader
                  title={cat}
                  action={<Badge variant="sand" size="sm">{catProds.length} SKUs</Badge>}
                />
                <CardContent className="space-y-1.5 text-xs">
                  <div className="text-content-secondary flex justify-between">
                    <span>Units in Stock:</span>
                    <span className="font-bold text-content-primary font-tabular">{totalStock} Units</span>
                  </div>
                  <div className="text-content-secondary flex justify-between">
                    <span>Valuation:</span>
                    <span className="font-bold text-status-success font-tabular">৳ {totalVal.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
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
              <Card key={brand} hoverable className="text-center p-4">
                <div className="w-10 h-10 rounded-full bg-brand-ochre/20 text-brand-ochreDeep dark:text-brand-ochre border border-brand-ochre/30 font-black text-sm flex items-center justify-center mx-auto mb-2">
                  {brand[0]}
                </div>
                <div className="font-bold text-content-primary text-sm">{brand}</div>
                <div className="text-xs text-content-muted mt-1 font-tabular">{count} Products • {units} Units</div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: WARRANTIES */}
      {/* ============================================================== */}
      {activeTab === 'warranties' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5">
              <ShieldCheck className="w-8 h-8 text-status-success mb-2" />
              <h3 className="font-bold text-sm text-content-primary">3 Years Replacement Warranty</h3>
              <p className="text-xs text-content-secondary mt-1">
                Applicable to Intel 14th Gen, AMD Ryzen 7000 processors, and MSI/ASUS motherboards.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <ShieldCheck className="w-8 h-8 text-brand-ochreDeep dark:text-brand-ochre mb-2" />
              <h3 className="font-bold text-sm text-content-primary">5 to 10 Years Warranty</h3>
              <p className="text-xs text-content-secondary mt-1">
                Applicable to Samsung 990 Pro SSDs (5 Years) and Corsair RM850x Gold PSUs (10 Years official guarantee).
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <ShieldCheck className="w-8 h-8 text-status-info mb-2" />
              <h3 className="font-bold text-sm text-content-primary">Lifetime Official Warranty</h3>
              <p className="text-xs text-content-secondary mt-1">
                Applicable to Corsair Vengeance, G.Skill Trident Z5, and Team T-Force desktop DDR4/DDR5 modules.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: UPDATE PRICES */}
      {/* ============================================================== */}
      {/* ============================================================== */}
      {/* TAB 7: UPDATE PRICES & MARGINS */}
      {/* ============================================================== */}
      {activeTab === 'prices' && (() => {
        const paginatedPriceProducts = products.slice((pricePage - 1) * pricePageSize, pricePage * pricePageSize);
        const pendingCount = Object.keys(priceEdits).length;

        return (
          <Card className="space-y-4">
            <CardHeader
              title="Batch Price Adjuster & Gross Margin Markup"
              subtitle="Update wholesale selling prices and margin multipliers across product catalog (live margin recalculation)"
              action={
                <div className="flex items-center gap-2">
                  {priceSaveSuccess && (
                    <span className="text-xs text-status-success font-medium flex items-center gap-1 animate-in fade-in">
                      <Check className="w-3.5 h-3.5" /> Changes saved to database!
                    </span>
                  )}
                  <Button
                    variant="brand"
                    size="sm"
                    disabled={pendingCount === 0 || savingPrices}
                    onClick={handleCommitPrices}
                  >
                    {savingPrices ? 'Committing...' : `Commit Price Changes ${pendingCount > 0 ? `(${pendingCount})` : ''}`}
                  </Button>
                </div>
              }
            />

            <DataTable isEmpty={products.length === 0} emptyMessage="No products available to adjust.">
              <TableHeader>
                <tr>
                  <TableHeadCell>Hardware Model & SKU</TableHeadCell>
                  <TableHeadCell>Brand</TableHeadCell>
                  <TableHeadCell align="right">Cost Price (৳)</TableHeadCell>
                  <TableHeadCell align="right">Selling Price (৳)</TableHeadCell>
                  <TableHeadCell align="right">Margin (%) & Profit</TableHeadCell>
                  <TableHeadCell align="right">Adjusted Price (৳)</TableHeadCell>
                </tr>
              </TableHeader>
              <TableBody>
                {paginatedPriceProducts.map((p) => {
                  const currentEdit = priceEdits[p.id];
                  const activeRetail = currentEdit !== undefined ? currentEdit.retailPrice : p.retailPrice;
                  const activeCost = currentEdit !== undefined ? currentEdit.costPrice : p.costPrice;
                  const marginAmt = activeRetail - activeCost;
                  const marginPct = activeRetail > 0 ? Math.round((marginAmt / activeRetail) * 100) : 0;
                  const isDirty = !!currentEdit && (currentEdit.retailPrice !== p.retailPrice || currentEdit.costPrice !== p.costPrice);

                  return (
                    <TableRow key={p.id} className={isDirty ? 'bg-brand-ochre/5' : undefined}>
                      <TableCell>
                        <div className="font-semibold text-content-primary truncate max-w-[240px]">{p.name}</div>
                        <div className="text-[10px] text-content-muted font-mono">{p.sku} • {p.location}</div>
                      </TableCell>
                      <TableCell className="text-content-secondary">{p.brand}</TableCell>
                      <TableCell align="right">
                        <input
                          type="number"
                          value={activeCost}
                          onChange={e => handlePriceChange(p.id, 'costPrice', parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 text-right bg-surface border border-boundary-strong rounded-lg text-content-secondary font-mono text-xs focus:outline-none focus:ring-1 focus:ring-brand-ochre font-tabular"
                        />
                      </TableCell>
                      <TableCell align="right" tabular className="font-bold text-content-primary text-xs">
                        ৳ {p.retailPrice.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <div className="flex flex-col items-end">
                          <span className={`font-bold tabular-nums text-xs ${marginPct >= 15 ? 'text-status-success' : marginPct > 0 ? 'text-brand-ochre' : 'text-status-danger'}`}>
                            +{marginPct}%
                          </span>
                          <span className="text-[10px] text-content-muted font-mono font-tabular">
                            {marginAmt >= 0 ? '+' : ''}৳{marginAmt.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell align="right">
                        <div className="flex items-center justify-end gap-1.5">
                          <input
                            type="number"
                            value={activeRetail}
                            onChange={e => handlePriceChange(p.id, 'retailPrice', parseFloat(e.target.value) || 0)}
                            className={`w-28 px-2 py-1 text-right bg-surface border rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-brand-ochre font-tabular font-bold ${isDirty ? 'border-brand-ochre text-brand-ochreDeep dark:text-brand-ochre' : 'border-boundary-strong text-content-primary'}`}
                          />
                          {isDirty && (
                            <span className="w-2 h-2 rounded-full bg-brand-ochre animate-pulse" title="Unsaved edit" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </DataTable>

            <Pagination
              currentPage={pricePage}
              totalItems={products.length}
              pageSize={pricePageSize}
              onPageChange={setPricePage}
              onPageSizeChange={setPricePageSize}
            />
          </Card>
        );
      })()}

      {/* ============================================================== */}
      {/* TAB: BRANCH WAREHOUSES & LOCATIONS */}
      {/* ============================================================== */}
      {activeTab === 'branches' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: 'Banani',
                name: 'Banani Central Vault & Warehouse',
                role: 'Central Headquarters & Customs Terminal',
                address: 'Plot 42, Road 11, Block D, Banani, Dhaka-1213',
                badge: 'Primary Warehouse',
                badgeVariant: 'brand' as const
              },
              {
                id: 'Multiplan',
                name: 'Elephant Road Multiplan Branch',
                role: 'High-Volume Wholesale & Retail Center',
                address: 'Level 4, Multiplan Center, New Elephant Road, Dhaka',
                badge: 'Retail Showroom',
                badgeVariant: 'sand' as const
              },
              {
                id: 'IDB',
                name: 'BCS Computer City IDB Branch',
                role: 'Corporate Enterprise & Gaming Pavilion',
                address: 'Ground Floor, IDB Bhaban, E/8-A Rokeya Sarani, Agargaon',
                badge: 'Retail Showroom',
                badgeVariant: 'neutral' as const
              }
            ].map(b => {
              const bProducts = products.filter(p => p.location.toLowerCase().includes(b.id.toLowerCase()));
              const totalUnits = bProducts.reduce((s, p) => s + p.stockCount, 0);
              const retailVal = bProducts.reduce((s, p) => s + p.stockCount * p.retailPrice, 0);
              const costVal = bProducts.reduce((s, p) => s + p.stockCount * p.costPrice, 0);
              const isSelected = selectedBranch === b.id;

              return (
                <Card 
                  key={b.id} 
                  hoverable 
                  className={`p-4 cursor-pointer transition border-2 ${isSelected ? 'border-brand-ochre shadow-md ring-1 ring-brand-ochre' : 'border-boundary-subtle'}`}
                  onClick={() => {
                    setSelectedBranch(isSelected ? 'All' : b.id);
                    setActiveTab('list');
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-brand-ochre/15 text-brand-ochreDeep dark:text-brand-ochre">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-content-primary">{b.name}</h4>
                        <p className="text-[11px] text-content-muted">{b.role}</p>
                      </div>
                    </div>
                    <Badge variant={b.badgeVariant} size="sm">{b.badge}</Badge>
                  </div>

                  <p className="text-[11px] text-content-muted mb-3 flex items-center gap-1">
                    <Warehouse className="w-3.5 h-3.5 text-content-muted flex-shrink-0" />
                    <span className="truncate">{b.address}</span>
                  </p>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-boundary-subtle text-xs">
                    <div className="bg-surface-secondary p-2 rounded-lg">
                      <div className="text-[10px] text-content-muted uppercase font-semibold">SKUs Stored</div>
                      <div className="text-base font-bold text-content-primary font-tabular mt-0.5">{bProducts.length}</div>
                    </div>
                    <div className="bg-surface-secondary p-2 rounded-lg">
                      <div className="text-[10px] text-content-muted uppercase font-semibold">Total Stock Units</div>
                      <div className="text-base font-bold text-brand-ochreDeep dark:text-brand-ochre font-tabular mt-0.5">{totalUnits.toLocaleString()}</div>
                    </div>
                    <div className="bg-surface-secondary p-2 rounded-lg col-span-2 flex justify-between items-center">
                      <span className="text-[11px] text-content-muted">Retail Valuation:</span>
                      <span className="font-bold text-status-success font-tabular">৳ {retailVal.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="p-4 bg-surface-secondary/40 border border-boundary-subtle">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-content-secondary">
                To move inventory between branches, create an Inter-Branch Transfer in the <strong>Stock Transfers</strong> tab.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('list')}
              >
                View Filtered Catalog
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 8: PRODUCT VARIATIONS */}
      {/* ============================================================== */}
      {activeTab === 'variations' && (
        <Card>
          <CardHeader
            title="Product Variation Attributes"
            subtitle="Attributes used for generating SKU matrices (RAM capacities, colors, form factors)"
            action={
              <Button
                variant="brand"
                size="sm"
                onClick={() => alert("Added new variation attribute: GPU Cooling Edition")}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Variation
              </Button>
            }
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-surface-secondary border border-boundary-subtle rounded-xl space-y-2">
                <div className="font-bold text-xs uppercase tracking-wider text-brand-ochreDeep dark:text-brand-ochre">RAM Capacity & Speed</div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="neutral" size="sm">16GB DDR5-6000MHz</Badge>
                  <Badge variant="neutral" size="sm">32GB DDR5-6000MHz</Badge>
                  <Badge variant="neutral" size="sm">64GB DDR5-6400MHz</Badge>
                </div>
              </div>
              <div className="p-4 bg-surface-secondary border border-boundary-subtle rounded-xl space-y-2">
                <div className="font-bold text-xs uppercase tracking-wider text-brand-ochreDeep dark:text-brand-ochre">Chassis Edition</div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="neutral" size="sm">Matte Stealth Black</Badge>
                  <Badge variant="neutral" size="sm">Arctic White Edition</Badge>
                  <Badge variant="neutral" size="sm">Titanium Silver</Badge>
                </div>
              </div>
              <div className="p-4 bg-surface-secondary border border-boundary-subtle rounded-xl space-y-2">
                <div className="font-bold text-xs uppercase tracking-wider text-brand-ochreDeep dark:text-brand-ochre">NVMe Storage Tier</div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="neutral" size="sm">1TB PCIe Gen4 NVMe</Badge>
                  <Badge variant="neutral" size="sm">2TB PCIe Gen4 NVMe</Badge>
                  <Badge variant="neutral" size="sm">4TB PCIe Gen5 NVMe</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 9: IMPORT PRODUCTS */}
      {/* ============================================================== */}
      {activeTab === 'import' && (
        <Card className="max-w-xl mx-auto text-center">
          <CardContent className="p-8 space-y-4">
            <Package className="w-12 h-12 text-brand-ochre mx-auto" />
            <h2 className="text-base font-bold text-content-primary">Import Products via CSV Spreadsheet</h2>
            <p className="text-xs text-content-muted">
              Bulk upload new computer hardware catalog items, starting stock, and distributor barcodes.
            </p>
            <div className="p-8 border-2 border-dashed border-boundary-strong rounded-xl bg-surface-secondary cursor-pointer hover:border-brand-ochre transition">
              <span className="text-xs text-content-muted">Drag and drop StarTech format .csv or .xlsx file here</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => alert("Downloaded products_import_template.csv")}
            >
              Download Products CSV Format Template
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 10: MEASUREMENT UNITS */}
      {/* ============================================================== */}
      {activeTab === 'units' && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader
            title="Measurement Units (UOM)"
            subtitle="Standard wholesale and retail inventory units"
            action={
              <Button
                variant="brand"
                size="sm"
                onClick={() => alert("Unit 'Reel / Spool' added successfully")}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Unit
              </Button>
            }
          />
          <div className="divide-y divide-boundary-subtle text-xs">
            <div className="p-4 flex justify-between items-center">
              <div>
                <span className="font-bold text-content-primary">Pieces (Pcs)</span>
                <span className="text-content-muted text-[11px] ml-2 font-mono">Code: pc</span>
              </div>
              <Badge variant="sage" size="sm">Base Unit (Default)</Badge>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <span className="font-bold text-content-primary">Box / Carton (10 Units)</span>
                <span className="text-content-muted text-[11px] ml-2 font-mono">Code: bx-10</span>
              </div>
              <Badge variant="neutral" size="sm">Multiplier: x10</Badge>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div>
                <span className="font-bold text-content-primary">Master Crate (50 Units)</span>
                <span className="text-content-muted text-[11px] ml-2 font-mono">Code: crt-50</span>
              </div>
              <Badge variant="neutral" size="sm">Multiplier: x50</Badge>
            </div>
          </div>
        </Card>
      )}

      {/* MODAL: ADD STOCK QUICK ACTION */}
      <Modal
        isOpen={!!stockModalProduct}
        onClose={() => setStockModalProduct(null)}
        title="Add Warehouse Stock Units"
        subtitle={stockModalProduct ? `${stockModalProduct.name} • Current: ${stockModalProduct.stockCount} ${stockModalProduct.unit}` : ''}
      >
        {stockModalProduct && (
          <form onSubmit={handleStockAdd} className="space-y-4 text-xs">
            <Input
              label="Additional Stock Quantity"
              type="number"
              min="1"
              required
              value={stockAddQty}
              onChange={e => setStockAddQty(e.target.value)}
              autoFocus
            />

            <Input
              label="Unit Cost Price (৳, Optional to update)"
              type="number"
              placeholder={stockModalProduct.costPrice.toString()}
              value={stockAddCost}
              onChange={e => setStockAddCost(e.target.value)}
            />

            <div className="pt-2 flex justify-end gap-2.5">
              <Button type="button" variant="outline" onClick={() => setStockModalProduct(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="brand">
                Confirm Restock
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL: EDIT PRODUCT PRICE & MARGIN */}
      <Modal
        isOpen={!!editPriceProduct}
        onClose={() => setEditPriceProduct(null)}
        title="Adjust Product Price & Margin"
        subtitle={editPriceProduct ? `${editPriceProduct.name} (${editPriceProduct.sku})` : ''}
      >
        {editPriceProduct && (() => {
          const retail = parseFloat(editRetailPrice) || 0;
          const cost = parseFloat(editCostPrice) || 0;
          const marginAmt = retail - cost;
          const marginPct = retail > 0 ? Math.round((marginAmt / retail) * 100) : 0;

          return (
            <form onSubmit={handleSaveSinglePrice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-surface-secondary rounded-xl border border-boundary-subtle">
                <div>
                  <span className="text-content-muted text-[11px]">Current Retail:</span>
                  <p className="font-bold text-sm text-content-primary font-tabular">৳{editPriceProduct.retailPrice.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-content-muted text-[11px]">Current Cost:</span>
                  <p className="font-bold text-sm text-content-muted font-tabular">৳{editPriceProduct.costPrice.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="New Selling Price (৳)"
                  type="number"
                  required
                  value={editRetailPrice}
                  onChange={e => setEditRetailPrice(e.target.value)}
                  autoFocus
                />
                <Input
                  label="Cost Price (৳)"
                  type="number"
                  required
                  value={editCostPrice}
                  onChange={e => setEditCostPrice(e.target.value)}
                />
              </div>

              {/* Live Margin Calculation Preview */}
              <div className="p-3 rounded-xl bg-surface border border-boundary-strong space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-content-secondary">Calculated Gross Margin:</span>
                  <span className={`text-sm font-bold font-tabular ${marginPct >= 15 ? 'text-status-success' : marginPct > 0 ? 'text-brand-ochre' : 'text-status-danger'}`}>
                    +{marginPct}% ({marginAmt >= 0 ? '+' : ''}৳{marginAmt.toLocaleString()} / unit)
                  </span>
                </div>
                <div className="w-full bg-surface-secondary rounded-full h-2 overflow-hidden border border-boundary-subtle">
                  <div 
                    className={`h-full transition-all duration-300 ${marginPct >= 20 ? 'bg-emerald-500' : marginPct >= 10 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(100, Math.max(0, marginPct))}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <Button type="button" variant="outline" onClick={() => setEditPriceProduct(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="brand" disabled={savingSinglePrice}>
                  {savingSinglePrice ? 'Updating...' : 'Save Price & Margin'}
                </Button>
              </div>
            </form>
          );
        })()}
      </Modal>
    </div>
  );
};
