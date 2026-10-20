import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Truck, 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Plus, 
  Printer, 
  PackageCheck,
  TrendingUp,
  Receipt,
  RotateCcw,
  Upload,
  Percent,
  DollarSign
} from 'lucide-react';
import { useStore, Order, Product } from '../context/StoreContext';
import { Card } from '../components/common/Card';
import { MetricCard } from '../components/common/MetricCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { TabGroup } from '../components/common/TabGroup';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { DataTable, TableHeader, TableHeadCell, TableBody, TableRow, TableCell } from '../components/common/DataTable';
import { PageHeader } from '../components/common/PageHeader';
import { printTaxInvoice } from '../utils/printInvoice';

interface SellPageProps {
  initialTab?: 'all' | 'pos' | 'pos-list' | 'shipments' | 'quotations' | 'drafts' | 'returns' | 'discounts' | 'import';
  onNavigateTab?: (tab: string) => void;
}

export const SellPage: React.FC<SellPageProps> = ({ 
  initialTab = 'all',
  onNavigateTab 
}) => {
  const { products, orders, customers, selectedLocation, createSaleOrder, updateOrderStatus, dispatchWithCourier } = useStore();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Filters
  const [search, setSearch] = useState('');
  const [payFilter, setPayFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Invoice Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // ==========================================
  // POS TERMINAL STATE
  // ==========================================
  const [posSearch, setPosSearch] = useState('');
  const [posCategory, setPosCategory] = useState('All');
  const [cart, setCart] = useState<{ product: Product; quantity: number; unitPrice: number }[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountAmountFlat, setDiscountAmountFlat] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'bank_transfer' | 'credit_30d' | 'due'>('cash');
  const [posPaidNowAmount, setPosPaidNowAmount] = useState<number>(0);
  const [posOrderType] = useState<'offline' | 'online'>('offline');
  const [posSuccessOrder, setPosSuccessOrder] = useState<Order | null>(null);

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, unitPrice: product.retailPrice }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as { product: Product; quantity: number; unitPrice: number }[]
    );
  };

  const cartSubtotal = cart.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);
  const calculatedDiscount = discountAmountFlat > 0 
    ? discountAmountFlat 
    : Math.round((cartSubtotal * discountPercent) / 100);
  const taxableSubtotal = Math.max(0, cartSubtotal - calculatedDiscount);
  const vatAmount = Math.round(taxableSubtotal * 0.05); // 5% NBR VAT
  const totalPayable = taxableSubtotal + vatAmount;

  // Real Cost & Gross Profit Calculations for POS
  const cartTotalCost = cart.reduce((acc, curr) => acc + (curr.product.costPrice || 0) * curr.quantity, 0);
  const posEstimatedProfit = Math.max(0, taxableSubtotal - cartTotalCost);
  const posMarginPct = taxableSubtotal > 0 ? ((posEstimatedProfit / taxableSubtotal) * 100).toFixed(1) : '0';

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const finalPaid = paymentMethod === 'due' ? Number(posPaidNowAmount) : totalPayable;
    const finalDue = paymentMethod === 'due' ? Math.max(0, totalPayable - finalPaid) : 0;
    const activeBranch = selectedLocation && selectedLocation !== 'All Locations'
      ? selectedLocation
      : 'Banani Central Vault & Warehouse';

    const created = createSaleOrder({
      customerName: customerName || 'Walk-In Customer (Showroom Counter)',
      contactNumber: customerPhone || '+880 1700-000000',
      deliveryAddress: customerAddress || 'Banani Central Vault Showroom Counter, Dhaka',
      items: cart,
      discountPercent,
      discountAmountFlat,
      orderType: posOrderType,
      paymentMethod,
      paidAmount: finalPaid,
      dueAmount: finalDue,
      branch: activeBranch,
      salesman: 'Tanvir Ahmed (Sales Lead)'
    });

    setPosSuccessOrder(created);
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setDiscountAmountFlat(0);
    setDiscountPercent(0);
    setPosPaidNowAmount(0);
  };

  // Filtered Orders for All Sales
  const filteredOrders = orders.filter(o => {
    const matchSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
                        o.itemsSummary.toLowerCase().includes(search.toLowerCase());
    const matchPay = payFilter === 'All' || o.paymentStatus === payFilter;
    const matchType = typeFilter === 'All' || o.orderType === typeFilter;
    return matchSearch && matchPay && matchType;
  });

  // Filtered Online Shipments
  const courierOrders = orders.filter(o => o.orderType === 'online' || o.courier);

  // Revenue Metrics
  const totalSalesVolume = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const completedOrdersCount = orders.filter(o => o.status === 'Delivered' || o.status === 'Counter Collected').length;
  const inTransitCount = orders.filter(o => o.status === 'In Transit').length;
  const avgOrderValue = orders.length > 0 ? Math.round(totalSalesVolume / orders.length) : 0;

  const tabs = [
    { id: 'all', label: `All Sales (${orders.length})` },
    { id: 'pos', label: 'POS Terminal' },
    { id: 'pos-list', label: 'POS Receipts' },
    { id: 'shipments', label: `Shipments (${courierOrders.length})` },
    { id: 'quotations', label: 'Quotations' },
    { id: 'drafts', label: 'Draft Orders' },
    { id: 'returns', label: 'Sales Returns' },
    { id: 'discounts', label: 'Discounts & Rules' },
    { id: 'import', label: 'Import Sales' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Commerce"
        title="Sales & orders"
        description="Manage customer orders, point-of-sale receipts, delivery fulfilment, and sales exceptions."
        actions={<>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('shipments')}
            leftIcon={<Truck className="h-4 w-4" aria-hidden="true" />}
            className="h-9 whitespace-nowrap"
          >
            Courier Board
          </Button>
          <Button
            variant="brand"
            size="sm"
            onClick={() => setActiveTab('pos')}
            leftIcon={<ShoppingBag className="h-4 w-4" aria-hidden="true" />}
            className="h-9 whitespace-nowrap"
          >
            Open POS Terminal
          </Button>
        </>}
      />

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-content-secondary">
        <span><strong className="font-semibold text-content-primary">৳ {totalSalesVolume.toLocaleString()}</strong> sales</span>
        <span><strong className="font-semibold text-content-primary">{Math.round((completedOrdersCount / (orders.length || 1)) * 100)}%</strong> fulfilled</span>
        <span><strong className="font-semibold text-content-primary">{inTransitCount}</strong> in transit</span>
        <span><strong className="font-semibold text-content-primary">৳ {avgOrderValue.toLocaleString()}</strong> average order</span>
      </div>

      {/* Sub Tabs Navigation */}
      <TabGroup
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* ============================================================== */}
      {/* TAB 1: ALL SALES */}
      {/* ============================================================== */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          <Card className="p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                <div className="flex-1 min-w-[240px]">
                  <Input
                    placeholder="Search by order #, customer, item..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leftIcon={<Search className="w-4 h-4 text-content-muted" />}
                  />
                </div>
                <div className="w-44">
                  <Select
                    value={payFilter}
                    onChange={(e) => setPayFilter(e.target.value)}
                  >
                    <option value="All">All Payment States</option>
                    <option value="Paid">Paid in Full</option>
                    <option value="Credit 30D">Credit 30D (Due)</option>
                    <option value="COD Pending">COD Pending</option>
                  </Select>
                </div>
                <div className="w-44">
                  <Select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="All">All Channels</option>
                    <option value="online">Courier Delivery</option>
                    <option value="offline">Counter POS</option>
                  </Select>
                </div>
              </div>

              <div className="text-xs text-content-muted font-mono font-medium">
                {filteredOrders.length} records matching
              </div>
            </div>
          </Card>

          <DataTable isEmpty={filteredOrders.length === 0} emptyMessage="No sales orders match your filter criteria.">
            <TableHeader>
              <tr>
                <TableHeadCell>Order # & Date</TableHeadCell>
                <TableHeadCell>Customer & Branch</TableHeadCell>
                <TableHeadCell>Items Summary</TableHeadCell>
                <TableHeadCell>Payment Status</TableHeadCell>
                <TableHeadCell align="center">Fulfillment</TableHeadCell>
                <TableHeadCell align="right">Total (৳)</TableHeadCell>
                <TableHeadCell align="right">Gross Profit (৳)</TableHeadCell>
                <TableHeadCell align="center">Action</TableHeadCell>
              </tr>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((o) => {
                const payVariant = o.paymentStatus === 'Paid' ? 'success' : o.paymentStatus === 'Credit 30D' ? 'danger' : 'warning';
                const isCompleted = o.status === 'Delivered' || o.status === 'Counter Collected';
                const isInTransit = o.status === 'In Transit';
                const profitMargin = o.totalAmount > 0 ? Math.round(((o.profit || 0) / o.totalAmount) * 100) : 0;

                return (
                  <TableRow 
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className="cursor-pointer hover:bg-surface-secondary/80 transition group"
                  >
                    <TableCell>
                      <div className="font-semibold text-content-primary group-hover:text-brand-ochre transition">{o.orderNumber}</div>
                      <div className="text-[11px] text-content-muted font-mono">{o.orderDate}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-content-primary">{o.customerName}</div>
                      <div className="text-[11px] text-content-muted flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${o.orderType === 'online' ? 'bg-sky-500' : 'bg-emerald-500'}`} />
                        <span>{o.orderType === 'online' ? 'Courier Delivery' : 'Showroom Counter'}</span>
                        <span>·</span>
                        <span className="text-brand-ochre font-medium">{o.branch ? o.branch.split(' ')[0] : 'Banani'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-content-secondary">
                      {o.itemsSummary}
                    </TableCell>
                    <TableCell>
                      <Badge variant={payVariant} size="sm">{o.paymentStatus}</Badge>
                      <div className="text-[10px] text-content-muted uppercase font-mono mt-0.5">{o.paymentMethod.replace('_', ' ')}</div>
                      {o.dueAmount !== undefined && o.dueAmount > 0 && (
                        <div className="text-[10.5px] font-bold font-mono text-rose-600 dark:text-rose-400 mt-0.5">
                          Due: ৳{o.dueAmount.toLocaleString()}
                        </div>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <div className="flex flex-col items-center">
                        <Badge variant={isCompleted ? 'success' : isInTransit ? 'info' : 'warning'} size="sm">
                          {o.status}
                        </Badge>
                        {o.courier && (
                          <span className="text-[10px] text-content-muted font-mono mt-0.5">{o.courier.provider}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell align="right" tabular className="font-bold text-content-primary">
                      ৳{o.totalAmount.toLocaleString()}
                    </TableCell>
                    <TableCell align="right" tabular className="font-bold text-status-success">
                      +৳{(o.profit || 0).toLocaleString()}
                      <div className="text-[10px] text-content-muted font-normal font-mono">
                        {profitMargin}% margin
                      </div>
                    </TableCell>
                    <TableCell align="center">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }}>
                        <Receipt className="w-3.5 h-3.5 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </DataTable>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: LIVE POS TERMINAL */}
      {/* ============================================================== */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Product Catalog & Fast Hardware Selection (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="p-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="flex-1">
                  <Input
                    placeholder="Search hardware by name, SKU or barcode (RTX, i7, Ryzen, RAM)..."
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    leftIcon={<Search className="w-4 h-4 text-content-muted" />}
                  />
                </div>
                <div className="sm:w-48">
                  <Select
                    value={posCategory}
                    onChange={(e) => setPosCategory(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    <option value="Graphics Cards">Graphics Cards</option>
                    <option value="Processors">Processors</option>
                    <option value="Motherboards">Motherboards</option>
                    <option value="Memory (RAM)">Memory (RAM)</option>
                    <option value="Storage">Storage</option>
                    <option value="Power Supplies">Power Supplies</option>
                    <option value="Cooling">Cooling</option>
                    <option value="Casings">Casings</option>
                    <option value="Monitors">Monitors</option>
                    <option value="Laptops">Laptops</option>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[620px] overflow-y-auto pr-1 scrollbar-thin">
              {products
                .filter(p => {
                  const matchS = p.name.toLowerCase().includes(posSearch.toLowerCase()) || p.sku.toLowerCase().includes(posSearch.toLowerCase());
                  const matchC = posCategory === 'All' || p.category === posCategory;
                  return matchS && matchC;
                })
                .map(product => {
                  const inCart = cart.find(c => c.product.id === product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                        inCart 
                          ? 'bg-brand-olive/20 dark:bg-brand-sage/20 border-brand-ochre ring-1 ring-brand-ochre/30' 
                          : 'bg-surface hover:bg-surface-secondary border-boundary-subtle hover:border-brand-ochre/50 shadow-xs'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-ochre">
                            {product.category.split(' ')[0]}
                          </span>
                          <span className="text-[11px] font-mono text-content-muted">
                            {product.stockCount} left
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-content-primary line-clamp-2 leading-snug">
                          {product.name}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2 border-t border-boundary-subtle flex items-center justify-between">
                        <span className="font-tabular font-bold text-sm text-content-primary">
                          ৳{product.retailPrice.toLocaleString()}
                        </span>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition ${
                          inCart ? 'bg-brand-ochre text-stone-950 font-black' : 'bg-surface-secondary text-content-secondary hover:bg-brand-ochre hover:text-stone-950'
                        }`}>
                          {inCart ? inCart.quantity : '+'}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Column: Checkout Cart & Drawer (5 cols) */}
          <div className="lg:col-span-5">
            <Card className="p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-boundary-subtle">
                  <div>
                    <h3 className="font-bold text-sm text-content-primary flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4 text-brand-ochre" />
                      Active POS Register
                    </h3>
                    <p className="text-[11px] text-content-muted">Banani Central Vault Showroom</p>
                  </div>
                  <Badge variant={cart.length > 0 ? 'success' : 'neutral'} size="sm">
                    {cart.reduce((acc, c) => acc + c.quantity, 0)} Units in Cart
                  </Badge>
                </div>

                {/* Cart Items List */}
                <div className="my-3 space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                  {cart.length === 0 ? (
                    <div className="py-8 text-center text-xs text-content-muted">
                      Cart is empty. Select hardware items on the left to add.
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.product.id} className="p-2.5 rounded-xl bg-surface-secondary border border-boundary-subtle flex items-center justify-between text-xs">
                        <div className="flex-1 pr-2 min-w-0">
                          <div className="font-semibold text-content-primary truncate">{item.product.name}</div>
                          <div className="text-[11px] text-content-muted font-tabular">৳{item.unitPrice.toLocaleString()} each</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.product.id, -1)}
                            className="w-6 h-6 rounded-md bg-surface border border-boundary-subtle text-content-primary font-bold hover:bg-surface-secondary transition flex items-center justify-center text-xs"
                          >
                            -
                          </button>
                          <span className="font-tabular font-bold w-5 text-center text-content-primary">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQty(item.product.id, 1)}
                            className="w-6 h-6 rounded-md bg-surface border border-boundary-subtle text-content-primary font-bold hover:bg-surface-secondary transition flex items-center justify-center text-xs"
                          >
                            +
                          </button>
                          <span className="font-tabular font-bold text-content-primary w-20 text-right">
                            ৳{(item.unitPrice * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Customer Details Form */}
                <div className="pt-3 border-t border-boundary-subtle space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Customer Name..."
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                    <Input
                      placeholder="Phone / Mobile..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-medium text-content-secondary block mb-1">
                        Discount (%)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={discountPercent || ''}
                        onChange={(e) => {
                          setDiscountPercent(parseFloat(e.target.value) || 0);
                          setDiscountAmountFlat(0);
                        }}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-content-secondary block mb-1">
                        Payment Method
                      </label>
                      <Select
                        value={paymentMethod}
                        onChange={(e) => {
                          setPaymentMethod(e.target.value as any);
                          if (e.target.value !== 'due') setPosPaidNowAmount(0);
                        }}
                      >
                        <option value="cash">Cash (Showroom Drawer)</option>
                        <option value="due">Due / Customer Credit</option>
                        <option value="bkash">bKash Merchant</option>
                        <option value="bank_transfer">Bank Wire / EFTN</option>
                        <option value="credit_30d">Corporate Credit (30D)</option>
                      </Select>
                    </div>
                  </div>

                  {paymentMethod === 'due' && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-content-primary">Paid Now (Advance BDT):</span>
                        <input
                          type="number"
                          min="0"
                          max={totalPayable}
                          value={posPaidNowAmount}
                          onChange={(e) => setPosPaidNowAmount(Math.max(0, Math.min(totalPayable, Number(e.target.value) || 0)))}
                          placeholder="0"
                          className="w-24 px-2 py-1 bg-surface border border-boundary-strong rounded-lg text-right font-mono font-bold text-xs"
                        />
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-boundary-subtle">
                        <span className="font-bold text-content-primary">Remaining Due:</span>
                        <span className="font-mono font-bold text-status-danger">
                          ৳{Math.max(0, totalPayable - posPaidNowAmount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Total Calculation & Checkout */}
              <div className="pt-4 mt-3 border-t border-boundary-subtle space-y-2 text-xs">
                <div className="flex justify-between text-content-secondary">
                  <span>Subtotal:</span>
                  <span className="font-tabular">৳{cartSubtotal.toLocaleString()}</span>
                </div>
                {calculatedDiscount > 0 && (
                  <div className="flex justify-between text-status-danger font-medium">
                    <span>Discount:</span>
                    <span className="font-tabular">- ৳{calculatedDiscount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-content-secondary">
                  <span>NBR VAT (5%):</span>
                  <span className="font-tabular">৳{vatAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-content-primary pt-2 border-t border-boundary-subtle">
                  <span>Total Payable:</span>
                  <span className="font-tabular">৳{totalPayable.toLocaleString()}</span>
                </div>

                {/* Gross Profit Badge */}
                <div className="flex justify-between items-center p-2 rounded-xl bg-brand-olive/15 border border-brand-ochre/30 text-xs">
                  <span className="font-semibold text-content-primary">Gross Profit:</span>
                  <span className="font-mono font-bold text-status-success">
                    +৳{posEstimatedProfit.toLocaleString()} ({posMarginPct}%)
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-3"
                  disabled={cart.length === 0}
                  onClick={handleCheckout}
                >
                  <PackageCheck className="w-5 h-5 mr-2" />
                  Complete Sale & Print Tax Invoice
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SHIPMENTS & COURIER DISPATCH */}
      {/* ============================================================== */}
      {activeTab === 'shipments' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-content-primary flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-ochre" />
                  Courier Logistics Integration (Pathao & Steadfast)
                </h3>
                <p className="text-xs text-content-muted mt-0.5">
                  Consignment tracking, COD collection reconciliation, and direct warehouse dispatch
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success" size="sm">Steadfast API: Connected ✓</Badge>
                <Badge variant="success" size="sm">Pathao API: Connected ✓</Badge>
              </div>
            </div>
          </Card>

          <DataTable isEmpty={courierOrders.length === 0} emptyMessage="No courier shipments logged.">
            <TableHeader>
              <tr>
                <TableHeadCell>Order # & Consignment</TableHeadCell>
                <TableHeadCell>Courier Provider</TableHeadCell>
                <TableHeadCell>Customer & Destination</TableHeadCell>
                <TableHeadCell align="right">COD Collection (৳)</TableHeadCell>
                <TableHeadCell align="center">Tracking</TableHeadCell>
                <TableHeadCell align="center">Fulfillment Status</TableHeadCell>
                <TableHeadCell align="center">Action</TableHeadCell>
              </tr>
            </TableHeader>
            <TableBody>
              {courierOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <div className="font-semibold text-content-primary">{o.orderNumber}</div>
                    <div className="text-[11px] text-content-muted font-mono">
                      {o.courier?.consignmentId || 'Awaiting Consignment'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={o.courier?.provider === 'Pathao' ? 'danger' : 'info'} size="sm">
                      {o.courier?.provider || 'Pending Booking'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-content-primary">{o.customerName}</div>
                    <div className="text-[11px] text-content-muted truncate max-w-xs">{o.deliveryAddress}</div>
                  </TableCell>
                  <TableCell align="right" tabular className="font-bold text-content-primary">
                    ৳{(o.courier?.codAmount !== undefined ? o.courier.codAmount : o.totalAmount).toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    {o.courier?.trackingUrl ? (
                      <a
                        href={o.courier.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-brand-ochre hover:underline font-mono"
                      >
                        <span>Track</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-content-muted">—</span>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Badge variant={o.status === 'Delivered' ? 'success' : o.status === 'In Transit' ? 'info' : 'warning'} size="sm">
                      {o.status}
                    </Badge>
                  </TableCell>
                  <TableCell align="center">
                    {!o.courier ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dispatchWithCourier(o.id, 'Steadfast')}
                      >
                        Dispatch Steadfast
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={o.status === 'Delivered'}
                        onClick={() => updateOrderStatus(o.id, 'Delivered')}
                      >
                        {o.status === 'Delivered' ? 'Completed' : 'Mark Delivered'}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DataTable>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: LIST POS RECEIPTS */}
      {/* ============================================================== */}
      {activeTab === 'pos-list' && (
        <div className="space-y-4">
          <Card className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-content-primary flex items-center gap-2">
                <Receipt className="w-4 h-4 text-brand-ochre" />
                Showroom POS Counter Receipts
              </h3>
              <p className="text-xs text-content-muted mt-0.5">
                Audit trail for cash drawer and instant electronic payments at showroom terminals
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setActiveTab('pos')}>
              <Plus className="w-4 h-4 mr-1" />
              New POS Sale
            </Button>
          </Card>

          <DataTable isEmpty={orders.filter(o => o.orderType === 'offline').length === 0} emptyMessage="No offline POS receipts available.">
            <TableHeader>
              <tr>
                <TableHeadCell>Receipt #</TableHeadCell>
                <TableHeadCell>Date & Time</TableHeadCell>
                <TableHeadCell>Customer</TableHeadCell>
                <TableHeadCell>Items</TableHeadCell>
                <TableHeadCell>Payment Channel</TableHeadCell>
                <TableHeadCell align="right">Total Paid (৳)</TableHeadCell>
                <TableHeadCell align="center">Receipt</TableHeadCell>
              </tr>
            </TableHeader>
            <TableBody>
              {orders.filter(o => o.orderType === 'offline').map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <span className="font-mono font-semibold text-content-primary">{o.orderNumber}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-content-muted text-xs font-mono">{o.orderDate}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium text-content-primary">{o.customerName}</span>
                  </TableCell>
                  <TableCell className="text-content-secondary truncate max-w-xs">
                    {o.itemsSummary}
                  </TableCell>
                  <TableCell>
                    <Badge variant="neutral" size="sm">
                      {o.paymentMethod.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell align="right" tabular className="font-bold text-content-primary">
                    ৳{o.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(o)}>
                      <Printer className="w-3.5 h-3.5 mr-1" />
                      Print
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </DataTable>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: QUOTATIONS */}
      {/* ============================================================== */}
      {activeTab === 'quotations' && (
        <Card className="p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-boundary-subtle">
            <div>
              <h3 className="font-bold text-sm text-content-primary">Corporate & Institutional Quotations</h3>
              <p className="text-xs text-content-muted">Commercial bids awaiting client purchase order release</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => alert("New quotation draft initiated.")}>
              <Plus className="w-4 h-4 mr-1" />
              Create Quotation
            </Button>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-surface-secondary border border-boundary-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-content-primary">QUOT-2026-DIU-001</span>
                  <Badge variant="warning" size="sm">Pending Client PO</Badge>
                </div>
                <div className="text-xs text-content-primary font-medium mt-1">Daffodil International University Robotics Lab</div>
                <div className="text-xs text-content-muted mt-0.5">10x NVIDIA RTX 4070 Ti Super, 10x Intel Core i7-14700K Processors</div>
              </div>
              <div className="text-right">
                <div className="font-tabular font-extrabold text-base text-content-primary">৳ 1,665,000.00</div>
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    createSaleOrder({
                      customerName: "Daffodil International University Robotics Lab",
                      contactNumber: "+880 1515-456789",
                      deliveryAddress: "Engineering Dept, Daffodil Smart City, Ashulia, Dhaka",
                      items: [
                        { product: products[0], quantity: 10, unitPrice: products[0].retailPrice },
                        { product: products[4], quantity: 10, unitPrice: products[4].retailPrice }
                      ],
                      discountPercent: 5,
                      paymentMethod: "credit_30d",
                      salesman: "Tanvir Ahmed (Sales Lead)"
                    });
                    alert("Quotation converted to Confirmed Order!");
                    setActiveTab('all');
                  }}
                >
                  Convert to Confirmed Order
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 6: DRAFT ORDERS */}
      {/* ============================================================== */}
      {activeTab === 'drafts' && (
        <Card className="p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-boundary-subtle">
            <div>
              <h3 className="font-bold text-sm text-content-primary">Saved Sales Drafts</h3>
              <p className="text-xs text-content-muted">Pre-filled carts saved during showroom consultation</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setActiveTab('pos')}>
              <Plus className="w-4 h-4 mr-1" />
              New Draft
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-surface-secondary border border-boundary-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="font-mono font-bold text-content-primary">DRAFT-2026-OCT-094</div>
              <div className="text-xs text-content-primary font-medium mt-1">Star Tech Retail Partner (Banani Showroom)</div>
              <div className="text-xs text-content-muted mt-0.5">2x AMD Ryzen 7 7800X3D, 2x MSI MAG B650 Tomahawk WiFi</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-tabular font-bold text-content-primary text-sm">৳ 144,000</span>
              <Button variant="primary" size="sm" onClick={() => setActiveTab('pos')}>
                Resume in POS
              </Button>
              <Button variant="ghost" size="sm" onClick={() => alert("Draft deleted.")}>
                Discard
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 7: SALES RETURNS */}
      {/* ============================================================== */}
      {activeTab === 'returns' && (
        <Card className="p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-boundary-subtle">
            <div>
              <h3 className="font-bold text-sm text-content-primary flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-status-danger" />
                Sales Returns & Credit Notes
              </h3>
              <p className="text-xs text-content-muted">Customer RMA returns restored to inventory</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => alert("Return slip CN-2026-033 created.")}>
              <Plus className="w-4 h-4 mr-1" />
              Record Return
            </Button>
          </div>

          <DataTable isEmpty={false}>
            <TableHeader>
              <tr>
                <TableHeadCell>Return # & Date</TableHeadCell>
                <TableHeadCell>Customer</TableHeadCell>
                <TableHeadCell>Item</TableHeadCell>
                <TableHeadCell>Reason</TableHeadCell>
                <TableHeadCell align="right">Refund (৳)</TableHeadCell>
                <TableHeadCell align="center">Inventory Status</TableHeadCell>
              </tr>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <span className="font-mono font-bold text-content-primary">RET-2026-029</span>
                  <div className="text-xs text-content-muted">04/10/2026</div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-content-primary">NextGen Tech Solutions</span>
                </TableCell>
                <TableCell>
                  <span className="text-content-secondary">1x Corsair RM850x 850W Power Supply</span>
                </TableCell>
                <TableCell>
                  <span className="text-content-muted text-xs">Client ordered incorrect ATX form factor</span>
                </TableCell>
                <TableCell align="right" tabular className="font-bold text-status-danger">
                  ৳ 16,500
                </TableCell>
                <TableCell align="center">
                  <Badge variant="success" size="sm">Restocked to Vault ✓</Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </DataTable>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 8: DISCOUNTS & RULES */}
      {/* ============================================================== */}
      {activeTab === 'discounts' && (
        <Card className="p-5 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-boundary-subtle">
            <div>
              <h3 className="font-bold text-sm text-content-primary flex items-center gap-2">
                <Percent className="w-4 h-4 text-brand-ochre" />
                Active Wholesale Discounts & Promotions
              </h3>
              <p className="text-xs text-content-muted">Automated promo coupons and tier margin thresholds</p>
            </div>
            <Button variant="primary" size="sm" onClick={() => alert("Added coupon 'WINTER-TECH-7'.")}>
              <Plus className="w-4 h-4 mr-1" />
              Add Promo Code
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-surface-secondary border border-boundary-subtle space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-brand-ochre text-sm">TECH-CLUB-5</span>
                <Badge variant="success" size="sm">Active</Badge>
              </div>
              <p className="text-xs text-content-secondary">5.0% Wholesale discount on hardware orders above ৳100,000</p>
              <div className="text-[11px] text-content-muted font-mono">Valid: 01 Oct 2026 – 31 Dec 2026</div>
            </div>

            <div className="p-4 rounded-xl bg-surface-secondary border border-boundary-subtle space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-brand-ochre text-sm">CORP-RIG-10</span>
                <Badge variant="success" size="sm">Active</Badge>
              </div>
              <p className="text-xs text-content-secondary">10.0% Institutional grant discount for University Engineering Labs</p>
              <div className="text-[11px] text-content-muted font-mono">Min. 5 Complete Workstation Bundles</div>
            </div>

            <div className="p-4 rounded-xl bg-surface-secondary border border-boundary-subtle space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-brand-ochre text-sm">MULTIPLAN-B2B</span>
                <Badge variant="success" size="sm">Active</Badge>
              </div>
              <p className="text-xs text-content-secondary">৳2,500 Flat Cash Rebate on High-End Motherboards</p>
              <div className="text-[11px] text-content-muted font-mono">Eligible: Elephant Road Registered Dealers</div>
            </div>
          </div>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 9: IMPORT SALES CSV */}
      {/* ============================================================== */}
      {activeTab === 'import' && (
        <Card className="p-8 max-w-xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-olive/20 text-brand-ochre mx-auto flex items-center justify-center">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-content-primary">Import Legacy Sales & Receipts</h3>
          <p className="text-xs text-content-muted">
            Batch import legacy ERP invoices, customer ledgers, and transaction records via standard CSV.
          </p>
          <div className="p-8 border-2 border-dashed border-boundary-strong rounded-2xl bg-surface-secondary cursor-pointer hover:border-brand-ochre transition">
            <span className="text-xs text-content-muted">Drag and drop sales_ledger.csv or orders.xlsx here</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => alert("Downloaded sales_template.csv")}>
            Download CSV Template
          </Button>
        </Card>
      )}

      {/* ============================================================== */}
      {/* INVOICE & CUSTOMER INTELLIGENCE DOSSIER MODAL */}
      {/* ============================================================== */}
      {selectedOrder && (() => {
        const custDetails = customers.find(c => 
          c.name.toLowerCase() === selectedOrder.customerName.toLowerCase() || 
          (selectedOrder.contactNumber && c.contactNumber.replace(/\D/g, '') === selectedOrder.contactNumber.replace(/\D/g, ''))
        ) || selectedOrder.customerDetails;

        const netProfit = selectedOrder.profit !== undefined ? selectedOrder.profit : 0;
        const profitMargin = selectedOrder.totalAmount > 0 ? Math.round((netProfit / selectedOrder.totalAmount) * 100) : 0;

        return (
          <Modal
            isOpen={true}
            onClose={() => setSelectedOrder(null)}
            title={`Sales Order Dossier & Invoice — ${selectedOrder.orderNumber}`}
            size="lg"
          >
            <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
              {/* Customer Intelligence Dossier Card */}
              <div className="p-4 rounded-xl bg-surface-secondary border border-boundary-subtle text-xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-boundary-subtle pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-brand-ochre">
                      Purchasing Customer Profile
                    </span>
                    <Badge variant="neutral" size="sm">
                      {custDetails?.customerType || 'Wholesale / Retail'}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-content-muted font-mono font-medium">
                    Branch: {selectedOrder.branch || 'Banani Central Vault & Warehouse'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="font-bold text-content-primary text-sm">{selectedOrder.customerName}</div>
                    <div className="text-content-secondary mt-0.5">{selectedOrder.contactNumber}</div>
                    <div className="text-content-muted mt-0.5">{selectedOrder.deliveryAddress}</div>
                    {custDetails?.binNumber && (
                      <div className="text-[11px] text-content-muted font-mono mt-1">
                        BIN: {custDetails.binNumber}
                      </div>
                    )}
                  </div>

                  <div className="bg-surface p-3 rounded-lg border border-boundary-subtle space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-content-muted">Lifetime Volume:</span>
                      <span className="font-mono font-bold text-content-primary">
                        ৳{(custDetails?.totalPurchases || selectedOrder.totalAmount).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-content-muted">Total Due Balance:</span>
                      <span className={`font-mono font-bold ${(custDetails?.totalDue || selectedOrder.dueAmount || 0) > 0 ? 'text-status-danger' : 'text-status-success'}`}>
                        ৳{(custDetails?.totalDue !== undefined ? custDetails.totalDue : (selectedOrder.dueAmount || 0)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-content-muted">Sales Representative:</span>
                      <span className="font-medium text-content-secondary">{selectedOrder.salesman || 'Tanvir Ahmed'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itemized Hardware & Profit Breakdown Table */}
              <div className="space-y-1.5 text-xs">
                <div className="text-[11px] font-bold uppercase tracking-wider text-content-muted grid grid-cols-12 py-1.5 border-b border-boundary-subtle">
                  <span className="col-span-5">Hardware Description</span>
                  <span className="col-span-2 text-right">Selling Rate</span>
                  <span className="col-span-2 text-right">Cost Price</span>
                  <span className="col-span-3 text-right">Line Profit</span>
                </div>
                {selectedOrder.items.map((it, idx) => {
                  const unitCost = it.costPrice || 0;
                  const itemProfit = it.profit !== undefined ? it.profit : (it.unitPrice - unitCost) * it.quantity;
                  return (
                    <div key={idx} className="grid grid-cols-12 py-2 border-b border-boundary-subtle/50 items-center">
                      <div className="col-span-5 pr-2">
                        <div className="font-semibold text-content-primary line-clamp-1">{it.quantity}x {it.name}</div>
                        {it.sku && <div className="text-[10px] text-content-muted font-mono">{it.sku}</div>}
                      </div>
                      <div className="col-span-2 text-right font-tabular text-content-primary font-medium">
                        ৳{it.unitPrice.toLocaleString()}
                      </div>
                      <div className="col-span-2 text-right font-tabular text-content-muted">
                        ৳{unitCost.toLocaleString()}
                      </div>
                      <div className="col-span-3 text-right font-tabular font-bold text-status-success">
                        +৳{itemProfit.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Financial Totals & Due Status */}
              <div className="pt-2 border-t border-boundary-subtle space-y-1.5 text-xs font-medium">
                <div className="flex justify-between text-content-secondary">
                  <span>Subtotal:</span>
                  <span className="font-tabular">৳{selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-status-danger">
                    <span>Discount Applied:</span>
                    <span className="font-tabular">- ৳{selectedOrder.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-content-secondary">
                  <span>NBR 5% Standard VAT:</span>
                  <span className="font-tabular">৳{selectedOrder.vatAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-content-primary pt-1 border-t border-boundary-subtle">
                  <span>Total Invoiced:</span>
                  <span className="font-tabular">৳{selectedOrder.totalAmount.toLocaleString()}</span>
                </div>

                {/* Paid vs Due Split */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2.5 rounded-lg bg-surface-secondary border border-boundary-subtle flex justify-between items-center">
                    <span className="text-content-muted text-[11px]">Paid Amount:</span>
                    <span className="font-mono font-bold text-content-primary">
                      ৳{(selectedOrder.paidAmount !== undefined ? selectedOrder.paidAmount : selectedOrder.totalAmount).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-secondary border border-boundary-subtle flex justify-between items-center">
                    <span className="text-content-muted text-[11px]">Due Balance:</span>
                    <span className={`font-mono font-bold ${(selectedOrder.dueAmount || 0) > 0 ? 'text-status-danger' : 'text-status-success'}`}>
                      ৳{(selectedOrder.dueAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Net Gross Profit for this Sale */}
                <div className="p-3 rounded-xl bg-brand-olive/20 border border-brand-ochre/40 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-content-primary">Total Gross Profit from this Sale</div>
                    <div className="text-[11px] text-content-muted font-mono">{profitMargin}% Gross Margin realized</div>
                  </div>
                  <span className="font-mono font-extrabold text-status-success text-base">
                    +৳{netProfit.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Courier Delivery Tracking Link */}
              {selectedOrder.courier && (
                <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-content-primary">
                      <Truck className="w-4 h-4 text-sky-500" />
                      <span>{selectedOrder.courier.provider} Courier Consignment</span>
                    </div>
                    <Badge variant="info" size="sm">{selectedOrder.courier.status}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1">
                    <span className="text-content-muted">Consignment ID: <span className="font-mono font-bold text-content-primary">{selectedOrder.courier.consignmentId}</span></span>
                    {selectedOrder.courier.trackingUrl && (
                      <a
                        href={selectedOrder.courier.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-500 hover:text-sky-600 font-semibold flex items-center gap-1"
                      >
                        Live Tracking <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                <Button variant="brand" size="sm" onClick={() => printTaxInvoice(selectedOrder, custDetails)}>
                  <Printer className="w-4 h-4 mr-1.5" />
                  Print / Download PDF (Mushak-6.3)
                </Button>
              </div>
            </div>
          </Modal>
        );
      })()}

      {/* ============================================================== */}
      {/* POS SALE SUCCESS MODAL */}
      {/* ============================================================== */}
      {posSuccessOrder && (
        <Modal
          isOpen={true}
          onClose={() => setPosSuccessOrder(null)}
          title="Transaction Completed"
          size="sm"
        >
          <div className="text-center space-y-3 py-2">
            <div className="w-12 h-12 rounded-full bg-status-success/15 text-status-success mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-content-primary">Sale Recorded Successfully</h3>
            <div className="font-mono text-xs font-bold text-brand-ochre">
              {posSuccessOrder.orderNumber}
            </div>
            <p className="text-xs text-content-muted">
              Total ৳{posSuccessOrder.totalAmount.toLocaleString()} collected via {posSuccessOrder.paymentMethod.replace('_', ' ')}. Inventory balances deducted in real-time.
            </p>
            <div className="pt-3 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setPosSuccessOrder(null)}
              >
                New Sale
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setSelectedOrder(posSuccessOrder);
                  setPosSuccessOrder(null);
                }}
              >
                View Invoice
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
