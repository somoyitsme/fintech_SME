import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  Printer, 
  Search, 
  Receipt,
  FileCheck2,
  Truck,
  Store,
  UserPlus,
  X,
  Send,
  Package,
  Layers,
  CheckCircle2,
  ExternalLink,
  Percent,
  DollarSign,
  Phone,
  User,
  Crown,
  Sparkles,
  MapPin,
  FileText,
  BadgePercent
} from 'lucide-react';
import { useStore, Product, Customer } from '../context/StoreContext';

interface CartItem {
  product: Product;
  quantity: number;
  customUnitPrice: number; // Salesman editable fixed unit amount
}

export const SalesmanPosPage: React.FC = () => {
  const { products, customers, addNewCustomer, addStock, createSaleOrder, dispatchWithCourier } = useStore();
  
  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Order Configuration
  const [orderType, setOrderType] = useState<'online' | 'offline'>('offline');
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountFlat, setDiscountFlat] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bkash' | 'bank_transfer' | 'credit_30d'>('cash');
  
  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Modals & Processed State
  const [showQuickStockModal, setShowQuickStockModal] = useState<Product | null>(null);
  const [quickStockQty, setQuickStockQty] = useState<number>(10);
  const [orderProcessed, setOrderProcessed] = useState<any>(null);
  const [dispatchedCourier, setDispatchedCourier] = useState<any>(null);

  // CUSTOMER STATE: Initially treated as Regular New Customer
  const [isMember, setIsMember] = useState(false);
  const [matchedCustomer, setMatchedCustomer] = useState<Customer | null>(null);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('Regular Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('Banani Showroom Counter, Dhaka');
  const [customerType, setCustomerType] = useState<Customer['customerType']>('Retail');
  const [customerBin, setCustomerBin] = useState('');
  const [saveToRegistry, setSaveToRegistry] = useState(true);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  // Auto-search & match member by Phone Number or Customer ID
  const handleLookupCustomer = (input: string) => {
    setCustomerSearchQuery(input);
    const trimmed = input.trim();
    if (!trimmed) {
      if (isMember) {
        resetToRegularCustomer();
      }
      return;
    }

    const cleanDigits = trimmed.replace(/\D/g, '');

    // Check matches by Customer ID (cust-1, cust-2 etc.) or Phone number
    const found = customers.find((c) => {
      // Direct ID match
      if (c.id.toLowerCase() === trimmed.toLowerCase()) return true;
      // Phone number match (normalized)
      const cClean = c.contactNumber.replace(/\D/g, '');
      if (cleanDigits.length >= 6 && (cClean.includes(cleanDigits) || cleanDigits.includes(cClean))) {
        return true;
      }
      return false;
    });

    if (found) {
      applyMember(found);
    } else {
      if (isMember) {
        setIsMember(false);
        setMatchedCustomer(null);
      }
    }
  };

  const applyMember = (c: Customer) => {
    setIsMember(true);
    setMatchedCustomer(c);
    setCustomerName(c.name);
    setCustomerPhone(c.contactNumber);
    setCustomerAddress(c.deliveryAddress);
    setCustomerType(c.customerType);
    setCustomerBin(c.binNumber || '');
    setShowMemberDropdown(false);
  };

  const resetToRegularCustomer = () => {
    setIsMember(false);
    setMatchedCustomer(null);
    setCustomerSearchQuery('');
    setCustomerName('Regular Walk-in Customer');
    setCustomerPhone('');
    setCustomerAddress(orderType === 'online' ? 'Delivery Address, Dhaka' : 'Banani Showroom Counter, Dhaka');
    setCustomerType('Retail');
    setCustomerBin('');
  };

  // Add product to cart with custom unit price initialized to retailPrice
  const addToCart = (product: Product) => {
    if (product.stockCount <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockCount) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, customUnitPrice: product.retailPrice }];
    });
  };

  // Update quantity
  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQ = item.quantity + delta;
            if (newQ <= 0) return null;
            if (newQ > item.product.stockCount) return item;
            return { ...item, quantity: newQ };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Update editable unit price
  const updateItemPrice = (productId: string, newPrice: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, customUnitPrice: Math.max(0, newPrice) } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Quick stock addition
  const handleAddQuickStock = () => {
    if (showQuickStockModal && quickStockQty > 0) {
      addStock(showQuickStockModal.id, Number(quickStockQty));
      setShowQuickStockModal(null);
    }
  };

  // Live Financial Calculations (Custom unit prices & unrestricted discount)
  const subtotal = cart.reduce((sum, item) => sum + item.customUnitPrice * item.quantity, 0);
  
  let calculatedDiscount = 0;
  if (discountType === 'percent') {
    calculatedDiscount = Math.round((subtotal * Math.max(0, discountPercent)) / 100);
  } else {
    calculatedDiscount = Math.min(subtotal, Math.max(0, discountFlat));
  }

  const taxableAmount = Math.max(0, subtotal - calculatedDiscount);
  const vatAmount = Math.round(taxableAmount * 0.05); // 5% NBR VAT
  const grandTotal = taxableAmount + vatAmount;

  // Process the order
  const handleProcessOrder = () => {
    if (cart.length === 0) return;

    const finalCustomerName = customerName.trim() || 'Regular Walk-in Customer';
    const finalContact = customerPhone.trim() || (orderType === 'online' ? '+880 1700-000000' : 'In-Store Counter');
    const finalAddress = customerAddress.trim() || (orderType === 'online' ? 'Dhaka City' : 'Banani Counter');

    // If new customer and saveToRegistry is checked, register in persistent store
    if (!isMember && saveToRegistry && customerPhone.trim() && finalCustomerName !== 'Regular Walk-in Customer') {
      const alreadyExists = customers.some(c => c.contactNumber.replace(/\D/g, '') === customerPhone.replace(/\D/g, ''));
      if (!alreadyExists) {
        addNewCustomer({
          name: finalCustomerName,
          contactNumber: finalContact,
          deliveryAddress: finalAddress,
          customerType,
          binNumber: customerBin.trim() || undefined,
          totalPurchases: grandTotal
        });
      }
    }

    const newOrder = createSaleOrder({
      customerName: finalCustomerName,
      contactNumber: finalContact,
      deliveryAddress: finalAddress,
      items: cart.map(i => ({
        product: i.product,
        quantity: i.quantity,
        unitPrice: i.customUnitPrice
      })),
      discountPercent: discountType === 'percent' ? discountPercent : 0,
      discountAmountFlat: discountType === 'flat' ? discountFlat : undefined,
      orderType,
      paymentMethod,
      salesman: 'Tanvir Ahmed (Salesman Lead)'
    });

    setOrderProcessed(newOrder);
    setDispatchedCourier(null);
    setCart([]);
  };

  // One-click dispatch via courier for online order
  const handleOneClickDispatch = (provider: 'Pathao' | 'Steadfast' | 'RedX') => {
    if (!orderProcessed) return;
    dispatchWithCourier(orderProcessed.id, provider, {
      deliveryFee: orderProcessed.deliveryAddress.includes('Dhaka') ? 120 : 180,
      codAmount: orderProcessed.paymentStatus === 'Paid' ? 0 : orderProcessed.totalAmount
    });
    setDispatchedCourier({
      provider,
      trackingId: `${provider === 'Pathao' ? 'PATHAO-BD' : provider === 'Steadfast' ? 'STEADFAST-DHK' : 'REDX-LOG'}-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'Courier Request Dispatched & Awaiting Rider Pickup'
    });
  };

  const filteredCatalog = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f6fc]">
              Point of Sale & New Order Entry
            </h1>
            <span className="text-[11px] bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 font-mono font-semibold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              POS Terminal #01
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8b949e] mt-0.5">
            Default regular new customer billing, auto member lookup by phone/ID, flexible rates & Pathao/Steadfast 1-click dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Total Stock Active:</span>
          <span className="font-mono text-xs font-bold bg-white dark:bg-[#161b22] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#30363d]">
            {products.reduce((acc, p) => acc + p.stockCount, 0)} Units
          </span>
        </div>
      </div>

      {/* Main Grid: Catalog Left (7 Cols) + Order Form Right (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Product Catalog Selection */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Categories Bar */}
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search hardware by name, GPU chipset, SKU code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {['All', 'Graphics Cards', 'Processors', 'Memory (RAM)', 'Storage', 'Motherboards', 'Power Supplies', 'Cooling'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-[#21262d] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#30363d]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredCatalog.map((product) => {
              const inStock = product.stockCount > 0;
              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl p-4 shadow-sm transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-400 font-semibold">{product.sku}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          product.stockCount > product.minThreshold
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' 
                            : inStock 
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                        }`}>
                          {product.stockCount} {product.unit} left
                        </span>
                        {/* Quick stock button */}
                        <button
                          onClick={() => {
                            setShowQuickStockModal(product);
                            setQuickStockQty(10);
                          }}
                          className="text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-bold"
                          title="Quick restock units"
                        >
                          +Stock
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-[#f0f6fc] mt-1.5 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 dark:text-[#8b949e] mt-1">
                      {product.category} · {product.location}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-[#30363d]">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Standard Retail Rate</span>
                      <div className="text-sm font-bold text-slate-900 dark:text-[#f0f6fc] font-mono">
                        ৳ {product.retailPrice.toLocaleString()}
                      </div>
                    </div>
                    <button
                      disabled={!inStock}
                      onClick={() => addToCart(product)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1 ${
                        inStock
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" /> {inStock ? 'Add to Bill' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Cart & Customer Configuration */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-5 shadow-sm space-y-4">
            
            {/* Top: Invoice Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#30363d]">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-[#f0f6fc] uppercase tracking-wider">
                  Active Invoice
                </h2>
              </div>
              <span className="text-xs bg-slate-100 dark:bg-[#21262d] text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded-full font-mono font-bold">
                {cart.reduce((total, i) => total + i.quantity, 0)} Items
              </span>
            </div>

            {/* ORDER TYPE TOGGLE: Online Delivery vs Offline Counter */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-[#8b949e] uppercase block mb-1.5">
                Fulfillment & Order Type
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-[#21262d] rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setOrderType('offline');
                    if (!customerAddress || customerAddress.includes('Delivery Address')) {
                      setCustomerAddress('Banani Showroom Counter, Dhaka');
                    }
                  }}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    orderType === 'offline' 
                      ? 'bg-white dark:bg-[#161b22] text-blue-600 dark:text-blue-400 font-bold shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" /> Offline Counter Sale
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOrderType('online');
                    if (customerAddress.includes('Showroom Counter')) {
                      setCustomerAddress('');
                    }
                  }}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition ${
                    orderType === 'online' 
                      ? 'bg-white dark:bg-[#161b22] text-emerald-600 dark:text-emerald-400 font-bold shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" /> Online Courier Order
                </button>
              </div>
            </div>

            {/* CUSTOMER SECTION: Treat as Regular New Customer by default, Auto-detect membership by Phone/ID */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#21262d]/60 border border-slate-200 dark:border-[#30363d] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  {isMember ? (
                    <>
                      <Crown className="w-3.5 h-3.5 text-amber-500" />
                      <span>Existing Member Customer</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 text-blue-500" />
                      <span>Regular / New Customer</span>
                    </>
                  )}
                </span>

                {/* Switcher or Member List Toggle */}
                {isMember ? (
                  <button
                    type="button"
                    onClick={resetToRegularCustomer}
                    className="text-[11px] text-rose-500 hover:underline font-semibold"
                  >
                    Reset to Regular
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Browse Members
                  </button>
                )}
              </div>

              {/* Member Lookup by Phone Number or Customer ID */}
              <div>
                <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Customer Phone # or Member ID (Type to auto-detect membership)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. 01711234567 or cust-1"
                    value={customerPhone}
                    onChange={(e) => {
                      setCustomerPhone(e.target.value);
                      handleLookupCustomer(e.target.value);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-xl text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Dropdown to browse existing members */}
              {showMemberDropdown && (
                <div className="p-2 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-xl shadow-lg space-y-1 max-h-40 overflow-y-auto">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase px-2 py-1">Select Registered Member:</div>
                  {customers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => applyMember(c)}
                      className="w-full px-2 py-1.5 text-left text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-[#21262d] flex items-center justify-between transition"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{c.contactNumber} · {c.customerType}</div>
                      </div>
                      <span className="text-[10px] text-blue-500 font-bold">Select</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Member Status Badge if found */}
              {isMember && matchedCustomer && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between text-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="font-bold text-amber-900 dark:text-amber-200">
                        {matchedCustomer.name} ({matchedCustomer.customerType} Account)
                      </div>
                      <div className="text-[10px] text-amber-700 dark:text-amber-300">
                        Lifetime Purchases: ৳{(matchedCustomer.totalPurchases || 0).toLocaleString()} {matchedCustomer.binNumber ? `· BIN: ${matchedCustomer.binNumber}` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Details Form (Editable for regular or member) */}
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                    Customer / Business Name
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full px-3 py-1.5 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                    {orderType === 'online' ? 'Delivery Address for Courier *' : 'Pickup / Address'}
                  </label>
                  <input
                    type="text"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder={orderType === 'online' ? 'Courier delivery destination address...' : 'In-store location'}
                    className={`w-full px-3 py-1.5 bg-white dark:bg-[#161b22] border rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none ${
                      orderType === 'online' && !customerAddress ? 'border-amber-400' : 'border-slate-200 dark:border-[#30363d]'
                    }`}
                  />
                </div>

                {/* If regular new customer, show auto-register checkbox */}
                {!isMember && (
                  <label className="flex items-center gap-2 pt-1 cursor-pointer text-[11px] text-slate-500 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={saveToRegistry}
                      onChange={(e) => setSaveToRegistry(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0"
                    />
                    <span>Save to Customer Accounts for future orders</span>
                  </label>
                )}
              </div>
            </div>

            {/* Cart Items List with Editable Fixed Selling Rates */}
            <div>
              <div className="flex items-center justify-between mb-1 text-[11px] font-semibold text-slate-500 uppercase">
                <span>Components ({cart.length})</span>
                <span>Editable Fixed Rate / Line Total</span>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-7 text-slate-400 text-xs border border-dashed border-slate-200 dark:border-[#30363d] rounded-xl">
                    Cart is empty. Click "+ Add to Bill" from catalog to begin.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-[#21262d] border border-slate-100 dark:border-[#30363d] space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-2">
                          <div className="font-bold text-slate-800 dark:text-[#f0f6fc] line-clamp-1">{item.product.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{item.product.sku}</div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-[#30363d]">
                        {/* Quantity Counter */}
                        <div className="flex items-center bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-[#30363d] text-slate-600 dark:text-slate-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-mono font-bold text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-[#30363d] text-slate-600 dark:text-slate-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Editable Unit Price (Fixed Amount as Salesman wants) */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-mono">Rate ৳:</span>
                          <input
                            type="number"
                            min="0"
                            value={item.customUnitPrice}
                            onChange={(e) => updateItemPrice(item.product.id, Number(e.target.value))}
                            className="w-24 px-2 py-1 bg-white dark:bg-[#161b22] border border-blue-400/80 rounded-lg text-right font-mono font-bold text-xs text-blue-600 dark:text-blue-400 focus:outline-none"
                            title="Salesman editable selling rate per unit"
                          />
                        </div>

                        {/* Line Total */}
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                          ৳ {(item.customUnitPrice * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Calculations & Unrestricted Discount */}
            <div className="pt-3 border-t border-slate-100 dark:border-[#30363d] space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal (Calculated Items):</span>
                <span className="font-mono font-semibold">৳ {subtotal.toLocaleString()}</span>
              </div>

              {/* Salesman Custom Discount Section (Free / Unrestricted) */}
              <div className="p-2.5 bg-slate-50 dark:bg-[#21262d] rounded-xl border border-slate-100 dark:border-[#30363d] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Salesman Discount:</span>
                  <div className="flex bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg p-0.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setDiscountType('percent')}
                      className={`px-2 py-0.5 rounded ${discountType === 'percent' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                    >
                      % Percent
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('flat')}
                      className={`px-2 py-0.5 rounded ${discountType === 'flat' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}
                    >
                      ৳ Flat BDT
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {discountType === 'percent' ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                        placeholder="Discount %"
                        className="w-20 px-2 py-1 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg text-right font-mono font-bold text-xs"
                      />
                      <span className="text-slate-500 font-bold">%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-bold">৳</span>
                      <input
                        type="number"
                        min="0"
                        value={discountFlat}
                        onChange={(e) => setDiscountFlat(parseFloat(e.target.value) || 0)}
                        placeholder="Flat BDT"
                        className="w-28 px-2 py-1 bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-lg text-right font-mono font-bold text-xs"
                      />
                    </div>
                  )}
                  <span className="font-mono text-rose-500 font-bold text-xs">-৳ {calculatedDiscount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>NBR 5% Standard Wholesale VAT:</span>
                <span className="font-mono font-semibold">+৳ {vatAmount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-[#f0f6fc] pt-2 border-t border-slate-200 dark:border-[#30363d]">
                <span>Total Payable:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400 text-base">
                  ৳ {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2 border-t border-slate-100 dark:border-[#30363d]">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-[#8b949e] uppercase block mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'cash'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-[#21262d] border-slate-200 dark:border-[#30363d] text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Cash Counter
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'bkash'
                      ? 'bg-rose-50 border-rose-400 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      : 'bg-slate-50 dark:bg-[#21262d] border-slate-200 dark:border-[#30363d] text-slate-600 dark:text-slate-300'
                  }`}
                >
                  bKash Merchant
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'bank_transfer'
                      ? 'bg-blue-50 border-blue-400 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'bg-slate-50 dark:bg-[#21262d] border-slate-200 dark:border-[#30363d] text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Bank Wire / POS
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_30d')}
                  className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition ${
                    paymentMethod === 'credit_30d'
                      ? 'bg-purple-50 border-purple-400 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                      : 'bg-slate-50 dark:bg-[#21262d] border-slate-200 dark:border-[#30363d] text-slate-600 dark:text-slate-300'
                  }`}
                >
                  30-Day Credit (AR)
                </button>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                disabled={cart.length === 0}
                onClick={handleProcessOrder}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <FileCheck2 className="w-4 h-4" />
                {orderType === 'online' ? 'Book Online Order & Setup Courier' : 'Complete Counter Sale & Deduct Stock'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Quick Restock Units Modal */}
      {showQuickStockModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl max-w-sm w-full p-5 shadow-2xl text-slate-800 dark:text-slate-100">
            <h3 className="text-sm font-bold">Quick Restock Units</h3>
            <p className="text-xs text-slate-500 dark:text-[#8b949e] mt-0.5">{showQuickStockModal.name}</p>

            <div className="my-4 space-y-2 text-xs">
              <label className="font-semibold block">Add Quantity ({showQuickStockModal.unit}):</label>
              <input
                type="number"
                min="1"
                value={quickStockQty}
                onChange={(e) => setQuickStockQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl font-mono font-bold focus:outline-none"
              />
              <div className="text-[11px] text-slate-400">
                Current in vault: {showQuickStockModal.stockCount} {showQuickStockModal.unit} → New: {showQuickStockModal.stockCount + quickStockQty} {showQuickStockModal.unit}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowQuickStockModal(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#21262d] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddQuickStock}
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                Confirm Restock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Order Completed & Bangladeshi Courier Dispatch Modal */}
      {orderProcessed && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-800 dark:text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#30363d]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {orderProcessed.orderType === 'online' ? 'Online Delivery Order Booked!' : 'Offline Sale Completed!'}
                  </h3>
                  <div className="font-mono text-[11px] text-blue-600 dark:text-blue-400">{orderProcessed.orderNumber}</div>
                </div>
              </div>
              <button 
                onClick={() => {
                  setOrderProcessed(null);
                  resetToRegularCustomer();
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order Details Brief */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#21262d] border border-slate-100 dark:border-[#30363d] text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{orderProcessed.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery Address:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[240px]">{orderProcessed.deliveryAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hardware Sold:</span>
                <span className="font-medium truncate max-w-[240px]">{orderProcessed.itemsSummary}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200/50 dark:border-[#30363d] font-bold">
                <span>Invoiced Amount:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm">৳ {orderProcessed.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* IF ONLINE ORDER: Courier 1-Click Request Box */}
            {orderProcessed.orderType === 'online' && (
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      One-Click Bangladeshi Courier Dispatch
                    </span>
                  </div>
                  <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-mono font-semibold px-2 py-0.5 rounded-full">
                    API Ready
                  </span>
                </div>

                {dispatchedCourier ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs space-y-1 text-emerald-800 dark:text-emerald-300 animate-in fade-in">
                    <div className="font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Dispatched via {dispatchedCourier.provider} Courier!
                    </div>
                    <div>Tracking ID: <span className="font-mono font-bold">{dispatchedCourier.trackingId}</span></div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">{dispatchedCourier.status}</div>
                  </div>
                ) : (
                  <div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2.5">
                      Select courier partner to automatically create consignment, print shipping label, and request rider pickup:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Pathao */}
                      <button
                        type="button"
                        onClick={() => handleOneClickDispatch('Pathao')}
                        className="p-2.5 rounded-xl bg-white dark:bg-[#161b22] border border-rose-300 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold flex items-center justify-center gap-2 shadow-sm transition"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                        Pathao Courier
                      </button>

                      {/* Steadfast */}
                      <button
                        type="button"
                        onClick={() => handleOneClickDispatch('Steadfast')}
                        className="p-2.5 rounded-xl bg-white dark:bg-[#161b22] border border-emerald-300 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center gap-2 shadow-sm transition"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        Steadfast Courier
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#21262d] dark:hover:bg-[#30363d] text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" /> Print Invoice & Challan
              </button>
              <button
                onClick={() => {
                  setOrderProcessed(null);
                  resetToRegularCustomer();
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition"
              >
                Done / Next Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
