import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Truck, 
  Search, 
  FileText, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Printer, 
  X, 
  User, 
  CreditCard,
  Percent,
  DollarSign,
  PackageCheck,
  Send,
  AlertCircle
} from 'lucide-react';
import { useStore, Order, Product } from '../context/StoreContext';

interface SellPageProps {
  initialTab?: 'all' | 'pos' | 'pos-list' | 'shipments' | 'quotations' | 'drafts' | 'returns' | 'discounts' | 'import';
  onNavigateTab?: (tab: string) => void;
}

export const SellPage: React.FC<SellPageProps> = ({ 
  initialTab = 'all',
  onNavigateTab 
}) => {
  const { products, orders, customers, createSaleOrder, updateOrderStatus, dispatchWithCourier } = useStore();
  const [activeTab, setActiveTab] = useState<'all' | 'pos' | 'pos-list' | 'shipments' | 'quotations' | 'drafts' | 'returns' | 'discounts' | 'import'>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Filters
  const [search, setSearch] = useState('');
  const [payFilter, setPayFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Invoice Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Dispatch Courier Modal
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const [courierProvider, setCourierProvider] = useState<'Pathao' | 'Steadfast' | 'RedX'>('Steadfast');

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
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'bank_transfer' | 'credit_30d'>('cash');
  const [posOrderType, setPosOrderType] = useState<'offline' | 'online'>('offline');
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

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const created = createSaleOrder({
      customerName: customerName || 'Walk-In Customer (Showroom Counter)',
      contactNumber: customerPhone || '+880 1700-000000',
      deliveryAddress: customerAddress || 'Banani Central Vault Showroom Counter, Dhaka',
      items: cart,
      discountPercent,
      discountAmountFlat,
      orderType: posOrderType,
      paymentMethod,
      salesman: 'Tanvir Ahmed (Sales Lead)'
    });

    setPosSuccessOrder(created);
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setDiscountAmountFlat(0);
    setDiscountPercent(0);
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

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-500" />
            Sales, POS & Courier Fulfillment
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            48 verified StarTech hardware orders across 5 months with Pathao & Steadfast logistics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('pos')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Open POS Terminal</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'all' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          All Sales ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('pos')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'pos' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          POS Register
        </button>
        <button
          onClick={() => setActiveTab('pos-list')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'pos-list' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          List POS Receipts
        </button>
        <button
          onClick={() => setActiveTab('drafts')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'drafts' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Draft Orders
        </button>
        <button
          onClick={() => setActiveTab('quotations')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'quotations' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Quotations
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'returns' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Sales Returns
        </button>
        <button
          onClick={() => setActiveTab('shipments')}
          className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${activeTab === 'shipments' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Shipments ({courierOrders.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('discounts')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'discounts' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Discounts & Promos
        </button>
        <button
          onClick={() => setActiveTab('import')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'import' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Import Sales
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ALL SALES LIST */}
      {/* ============================================================== */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1e293b] p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by order #, customer, or items..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <select
                value={payFilter}
                onChange={e => setPayFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                <option value="All">All Payments</option>
                <option value="Paid">Paid</option>
                <option value="Credit 30D">Credit 30D (Due)</option>
                <option value="COD Pending">COD Pending</option>
              </select>

              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                <option value="All">All Channels</option>
                <option value="online">Online Courier Delivery</option>
                <option value="offline">In-Store Counter POS</option>
              </select>
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Showing {filteredOrders.length} Sales Records
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Order # & Date</th>
                    <th className="py-3 px-3">Customer & Channel</th>
                    <th className="py-3 px-3">Items Summary</th>
                    <th className="py-3 px-3">Payment</th>
                    <th className="py-3 px-3 text-center">Fulfillment</th>
                    <th className="py-3 px-4 text-right">Total Amount (৳)</th>
                    <th className="py-3 px-3 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{o.orderNumber}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{o.orderDate}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{o.customerName}</div>
                        <div className="text-[10.5px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${o.orderType === 'online' ? 'bg-sky-400' : 'bg-emerald-400'}`}></span>
                          <span>{o.orderType === 'online' ? 'Online Courier' : 'Counter POS'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-xs text-slate-600 dark:text-slate-300 truncate">
                        {o.itemsSummary}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          o.paymentStatus === 'Paid' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                          o.paymentStatus === 'Credit 30D' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                          'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {o.paymentStatus}
                        </span>
                        <div className="text-[9.5px] text-slate-400 mt-0.5 uppercase font-mono">{o.paymentMethod.replace('_', ' ')}</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          o.status === 'Delivered' || o.status === 'Counter Collected' 
                            ? 'bg-emerald-500/15 text-emerald-400' 
                            : o.status === 'In Transit'
                            ? 'bg-blue-500/15 text-blue-400 animate-pulse'
                            : 'bg-amber-500/15 text-amber-400'
                        }`}>
                          {o.status}
                        </span>
                        {o.courier && (
                          <div className="text-[9.5px] text-sky-400 mt-0.5 font-mono">{o.courier.provider}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-extrabold text-blue-600 dark:text-blue-400 text-sm">
                        ৳ {o.totalAmount.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold transition"
                        >
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: LIVE POS TERMINAL */}
      {/* ============================================================== */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left 2 Cols: Product Catalog & Search */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-[#1e293b] p-3 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Barcode scan or type hardware name (RTX, i7, Ryzen, RAM, SSD)..."
                  value={posSearch}
                  onChange={e => setPosSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
              <select
                value={posCategory}
                onChange={e => setPosCategory(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs rounded-xl px-3 py-2 text-white focus:outline-none"
              >
                <option value="All">All Hardware</option>
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
              </select>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
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
                      className={`p-3 bg-white dark:bg-[#1e293b] border rounded-2xl cursor-pointer hover:border-blue-500 transition shadow-sm flex flex-col justify-between ${
                        inCart ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-400 font-bold">
                            {product.category.split(' ')[0]}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {product.stockCount} in stock
                          </span>
                        </div>
                        <h3 className="font-bold text-xs text-slate-900 dark:text-white mt-1.5 line-clamp-2">
                          {product.name}
                        </h3>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <span className="font-mono font-extrabold text-sm text-blue-600 dark:text-blue-400">
                          ৳{product.retailPrice.toLocaleString()}
                        </span>
                        <button className="w-6 h-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Right Col: Bill & Checkout Box */}
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-col justify-between h-[650px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Active Sale Terminal</span>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                  {cart.length} Items in Cart
                </span>
              </div>

              {/* Cart Items List */}
              <div className="my-3 space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Cart is empty. Click on products to add.
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex-1 pr-2">
                        <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">{item.product.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">৳{item.unitPrice.toLocaleString()} each</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateCartQty(item.product.id, -1)} className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-bold">-</button>
                        <span className="font-mono font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateCartQty(item.product.id, 1)} className="w-5 h-5 rounded bg-slate-800 text-slate-300 font-bold">+</button>
                        <span className="font-mono font-bold text-blue-400 w-16 text-right">
                          ৳{(item.unitPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Customer Inputs */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Customer Name..."
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Phone / Mobile..."
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={discountPercent || ''}
                      onChange={e => {
                        setDiscountPercent(parseFloat(e.target.value) || 0);
                        setDiscountAmountFlat(0);
                      }}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={e => setPaymentMethod(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-white"
                    >
                      <option value="cash">Cash (Drawer)</option>
                      <option value="bkash">bKash Merchant</option>
                      <option value="bank_transfer">Bank Wire</option>
                      <option value="credit_30d">Credit 30D</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Summary & Checkout Button */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono">৳{cartSubtotal.toLocaleString()}</span>
              </div>
              {calculatedDiscount > 0 && (
                <div className="flex justify-between text-rose-400 font-semibold">
                  <span>Discount:</span>
                  <span className="font-mono">- ৳{calculatedDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>NBR VAT (5%):</span>
                <span className="font-mono">৳{vatAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-emerald-400 pt-1 border-t border-slate-700">
                <span>Grand Total:</span>
                <span className="font-mono">৳{totalPayable.toLocaleString()}</span>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-extrabold text-sm rounded-xl transition shadow flex items-center justify-center gap-2 mt-2"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Complete Sale & Issue Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SHIPMENTS & COURIER DISPATCH */}
      {/* ============================================================== */}
      {activeTab === 'shipments' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-sky-400" />
                Bangladeshi Courier Logistics (Pathao / Steadfast)
              </h2>
              <p className="text-xs text-slate-400">
                Live consignment tracking with COD collection reconciliation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 font-mono text-xs font-bold">
                Steadfast API: Connected ✓
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold">
                Pathao API: Connected ✓
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Order # & Consignment</th>
                    <th className="py-3 px-3">Courier Provider</th>
                    <th className="py-3 px-3">Customer & Destination</th>
                    <th className="py-3 px-3 text-right">COD Collection</th>
                    <th className="py-3 px-3 text-center">Tracking Link</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {courierOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{o.orderNumber}</div>
                        <div className="text-[10px] text-sky-400 font-mono mt-0.5">
                          {o.courier?.consignmentId || 'Awaiting Booking'}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                          o.courier?.provider === 'Pathao' ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                          o.courier?.provider === 'Steadfast' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' :
                          'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}>
                          {o.courier?.provider || 'Courier Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{o.customerName}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{o.deliveryAddress}</div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                        ৳ {(o.courier?.codAmount !== undefined ? o.courier.codAmount : o.totalAmount).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {o.courier?.trackingUrl ? (
                          <a
                            href={o.courier.trackingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline font-mono"
                          >
                            <span>Track</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-500">No URL</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                          o.status === 'Delivered' ? 'bg-emerald-500/15 text-emerald-400' :
                          o.status === 'In Transit' ? 'bg-sky-500/15 text-sky-400 animate-pulse' :
                          'bg-amber-500/15 text-amber-400'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {!o.courier ? (
                          <button
                            onClick={() => {
                              dispatchWithCourier(o.id, 'Steadfast');
                            }}
                            className="px-2 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded text-[10.5px] font-bold shadow transition"
                          >
                            Dispatch
                          </button>
                        ) : (
                          <button
                            onClick={() => updateOrderStatus(o.id, 'Delivered')}
                            className="px-2 py-1 bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white rounded text-[10.5px] font-semibold transition"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: QUOTATIONS */}
      {/* ============================================================== */}
      {activeTab === 'quotations' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-700">
            <div>
              <h2 className="text-base font-bold text-white">Active Corporate Quotations</h2>
              <p className="text-xs text-slate-400">Institutional workstation quotes awaiting PO approval</p>
            </div>
            <button
              onClick={() => alert("New quotation draft template opened.")}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
            >
              + Create Quotation
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-sm text-white">QUOT-2026-DIU-001</div>
                <div className="text-xs text-slate-400">Client: Daffodil International University Robotics Lab</div>
                <div className="text-xs text-slate-400 mt-1">10x NVIDIA RTX 4070 Ti Super, 10x Core i7-14700K Processors</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-extrabold text-base text-blue-400">৳ 1,665,000.00</div>
                <button
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
                    alert("Quotation successfully converted to Confirmed Sale Order!");
                    setActiveTab('all');
                  }}
                  className="mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow"
                >
                  Convert to Confirmed Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: LIST POS RECEIPTS */}
      {/* ============================================================== */}
      {activeTab === 'pos-list' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
            <div>
              <h2 className="font-bold text-white text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                POS Counter Register Transactions
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Walk-in showroom cash and bKash counter receipts</p>
            </div>
            <button
              onClick={() => setActiveTab('pos')}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow transition"
            >
              <span>+ New POS Sale</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Items Summary</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3 text-right">Total (৳)</th>
                  <th className="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.filter(o => o.orderType === 'offline').slice(0, 10).map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-400">{o.orderNumber}</td>
                    <td className="py-3 px-3 text-slate-400">{o.orderDate}</td>
                    <td className="py-3 px-3 text-white font-medium">{o.customerName}</td>
                    <td className="py-3 px-3 text-slate-300 truncate max-w-[200px]">{o.itemsSummary}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">
                        {o.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">৳ {o.totalAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10.5px] font-semibold transition"
                      >
                        Print Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: DRAFT ORDERS */}
      {/* ============================================================== */}
      {activeTab === 'drafts' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700">
            <div>
              <h2 className="font-bold text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Unconfirmed Sales Drafts
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Orders saved during customer hardware consultations awaiting confirmation</p>
            </div>
            <button
              onClick={() => setActiveTab('pos')}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
            >
              + Create New Draft
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-sm text-white">DRAFT-2026-OCT-094</div>
                <div className="text-xs text-slate-400">Client: Star Tech Retail Partner (Banani Showroom)</div>
                <div className="text-xs text-amber-400 mt-1">2x AMD Ryzen 7 7800X3D, 2x MSI MAG B650 Tomahawk WiFi</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white text-sm mr-2">৳ 144,000</span>
                <button
                  onClick={() => {
                    alert("Draft loaded into POS terminal for final payment processing.");
                    setActiveTab('pos');
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition"
                >
                  Resume in POS
                </button>
                <button
                  onClick={() => alert("Draft DRAFT-2026-OCT-094 deleted.")}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 text-xs rounded-lg transition"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: SALES RETURNS */}
      {/* ============================================================== */}
      {activeTab === 'returns' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700">
            <div>
              <h2 className="font-bold text-white text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                Customer Sales Returns & Credit Note Issuance
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Customer component returns returned to showroom stock with credit note</p>
            </div>
            <button
              onClick={() => alert("Return slip CN-2026-033 generated. Stock restored to Banani Vault.")}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow transition"
            >
              <span>+ Record Sales Return</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Return # & Date</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Returned Component</th>
                  <th className="py-3 px-3">Return Reason</th>
                  <th className="py-3 px-3 text-right">Refund Value (৳)</th>
                  <th className="py-3 px-4 text-center">Stock Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr className="hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-white">RET-2026-029</div>
                    <div className="text-[10px] text-slate-400">04/10/2026</div>
                  </td>
                  <td className="py-3 px-3 text-slate-200 font-medium">NextGen Tech Solutions</td>
                  <td className="py-3 px-3 text-white">1x Corsair RM850x 850W Power Supply</td>
                  <td className="py-3 px-3 text-slate-300">Client ordered incorrect ATX form factor</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-rose-400">৳ 16,500</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      Restocked to Vault ✓
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 8: DISCOUNTS & COUPONS */}
      {/* ============================================================== */}
      {activeTab === 'discounts' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700 mb-4">
              <div>
                <h2 className="font-bold text-white text-sm flex items-center gap-2">
                  <Percent className="w-4 h-4 text-amber-400" />
                  Active Discounts & Wholesale Coupon Campaigns
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Automated discount codes and bulk tier price rules</p>
              </div>
              <button
                onClick={() => alert("Added coupon 'WINTER-TECH-7' with 7% discount across GPUs.")}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Coupon Rule</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-amber-400 text-sm">TECH-CLUB-5</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Active</span>
                </div>
                <div className="text-xs text-slate-300">5.0% Discount on Orders above ৳100,000</div>
                <div className="text-[10px] text-slate-400">Valid: 01 Oct 2026 – 31 Dec 2026</div>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-blue-400 text-sm">CORP-RIG-10</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Active</span>
                </div>
                <div className="text-xs text-slate-300">10.0% Discount for Educational / University Labs</div>
                <div className="text-[10px] text-slate-400">Min. Quantity: 5 Complete Workstation Bundles</div>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono font-bold text-purple-400 text-sm">MULTIPLAN-B2B</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">Active</span>
                </div>
                <div className="text-xs text-slate-300">৳2,500 Flat Cash Discount on High-End Motherboards</div>
                <div className="text-[10px] text-slate-400">Eligible: Verified Elephant Road Dealer Network</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 9: IMPORT SALES CSV */}
      {/* ============================================================== */}
      {activeTab === 'import' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm max-w-xl mx-auto text-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-blue-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Import Historical Sales via CSV</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Batch import legacy invoices, customer accounts, and sales ledger entries.
          </p>
          <div className="p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 cursor-pointer hover:border-blue-500 transition">
            <span className="text-xs text-slate-400">Drag and drop sales_ledger.csv or orders.xlsx here</span>
          </div>
          <button 
            onClick={() => alert("Downloaded sales_import_template.csv")}
            className="text-xs text-blue-500 hover:underline font-semibold block mx-auto"
          >
            Download Sales Import CSV Template
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* INVOICE PREVIEW MODAL */}
      {/* ============================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-lg p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-700">
              <div>
                <div className="text-xs font-bold text-blue-400 uppercase font-mono">OFFICIAL TAX INVOICE</div>
                <div className="text-base font-extrabold text-white">{selectedOrder.orderNumber}</div>
                <div className="text-xs text-slate-400">{selectedOrder.orderDate}</div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl space-y-1 text-xs">
              <div className="text-slate-400">Billed To:</div>
              <div className="font-bold text-white text-sm">{selectedOrder.customerName}</div>
              <div className="text-slate-400">{selectedOrder.contactNumber}</div>
              <div className="text-slate-400">{selectedOrder.deliveryAddress}</div>
            </div>

            {/* Line items */}
            <div className="space-y-1 text-xs max-h-40 overflow-y-auto">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex justify-between py-1 border-b border-slate-800">
                <span>Description</span>
                <span>Amount</span>
              </div>
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between py-1 border-b border-slate-800/50">
                  <span className="text-slate-300">{it.quantity}x {it.name}</span>
                  <span className="font-mono text-white">৳{it.total.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-700 space-y-1 text-xs font-medium">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono">৳{selectedOrder.subtotal.toLocaleString()}</span>
              </div>
              {selectedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>Discount:</span>
                  <span className="font-mono">- ৳{selectedOrder.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>NBR 5% VAT:</span>
                <span className="font-mono">৳{selectedOrder.vatAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-emerald-400 pt-1 border-t border-slate-700">
                <span>Grand Total:</span>
                <span className="font-mono">৳{selectedOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => window.print()} 
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POS SUCCESS MODAL */}
      {posSuccessOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-md p-6 text-slate-100 shadow-2xl text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="text-base font-extrabold text-white">Order Completed Successfully!</h2>
            <div className="font-mono text-xs text-blue-400 font-bold">{posSuccessOrder.orderNumber}</div>
            <div className="text-xs text-slate-400">
              Total ৳{posSuccessOrder.totalAmount.toLocaleString()} received via {posSuccessOrder.paymentMethod.replace('_', ' ')}. Stock updated.
            </div>
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  setSelectedOrder(posSuccessOrder);
                  setPosSuccessOrder(null);
                }}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl"
              >
                View Invoice
              </button>
              <button
                onClick={() => setPosSuccessOrder(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
              >
                New Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
