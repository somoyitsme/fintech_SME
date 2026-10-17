import React, { useState, useRef, useEffect } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Plus, 
  Calculator, 
  ShoppingBag, 
  DollarSign, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown, 
  Check, 
  X, 
  Globe, 
  Calendar,
  AlertTriangle,
  Package,
  Truck,
  Building2,
  Delete,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface NavbarProps {
  companyName: string;
  industry: string;
  currency: string;
  healthScore: number;
  userName?: string;
  userRole?: string;
  userEmail?: string;
  onLogout?: () => void;
  onSwitchUser?: (user: { name: string; role: string; email: string }) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenPos?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  companyName,
  industry,
  currency,
  healthScore,
  userName = "MD Nazmul Hasan",
  userRole = "Managing Director",
  userEmail = "nazmul@dhakasilicon.com",
  onLogout,
  onSwitchUser,
  onNavigateTab,
  onOpenPos
}) => {
  const { products, orders, cashRegister, openCashRegister, closeCashRegister, addNewProduct, addNewCustomer, addSupplier, addExpense } = useStore();
  
  // Header Modals & Dropdowns State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<'product' | 'customer' | 'supplier' | 'expense'>('product');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [language, setLanguage] = useState<'English' | 'বাংলা'>('English');

  // Calculator State
  const [calcInput, setCalcInput] = useState('0');
  const [calcPrev, setCalcPrev] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);

  // Quick Add Form States
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Graphics Cards');
  const [newProdBrand, setNewProdBrand] = useState('ASUS');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdCost, setNewProdCost] = useState('');
  const [newProdStock, setNewProdStock] = useState('10');

  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustType, setNewCustType] = useState<'Retail' | 'Wholesale' | 'Corporate'>('Wholesale');

  const [newSupName, setNewSupName] = useState('');
  const [newSupContact, setNewSupContact] = useState('');
  const [newSupPhone, setNewSupPhone] = useState('');
  const [newSupCategory, setNewSupCategory] = useState('Processors');

  const [newExpCat, setNewExpCat] = useState('Logistics & Couriers');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpVendor, setNewExpVendor] = useState('Pathao Logistics');
  const [newExpDesc, setNewExpDesc] = useState('');

  // Register opening amount input
  const [openingInput, setOpeningInput] = useState('50000');

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Calculator Logic
  const handleCalcDigit = (digit: string) => {
    if (calcInput === '0' && digit !== '.') {
      setCalcInput(digit);
    } else {
      setCalcInput(prev => prev + digit);
    }
  };

  const handleCalcOp = (op: string) => {
    setCalcPrev(parseFloat(calcInput));
    setCalcOp(op);
    setCalcInput('0');
  };

  const handleCalcEquals = () => {
    if (calcPrev === null || !calcOp) return;
    const current = parseFloat(calcInput);
    let res = 0;
    if (calcOp === '+') res = calcPrev + current;
    else if (calcOp === '-') res = calcPrev - current;
    else if (calcOp === '*') res = calcPrev * current;
    else if (calcOp === '/') res = current !== 0 ? calcPrev / current : 0;
    setCalcInput(res.toString());
    setCalcPrev(null);
    setCalcOp(null);
  };

  const handleCalcClear = () => {
    setCalcInput('0');
    setCalcPrev(null);
    setCalcOp(null);
  };

  // Quick Add Submissions
  const handleQuickAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    addNewProduct({
      name: newProdName,
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      category: newProdCategory,
      brand: newProdBrand,
      retailPrice: parseFloat(newProdPrice) || 0,
      costPrice: parseFloat(newProdCost) || parseFloat(newProdPrice) * 0.8,
      stockCount: parseInt(newProdStock) || 10,
      unit: 'Units',
      minThreshold: 5,
      location: 'Banani Central Vault #B1',
      warranty: '2 Years Official'
    });
    setNewProdName('');
    setNewProdPrice('');
    setNewProdCost('');
    setQuickAddOpen(false);
  };

  const handleQuickAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;
    addNewCustomer({
      name: newCustName,
      contactNumber: newCustPhone,
      deliveryAddress: newCustAddress || 'Dhaka, Bangladesh',
      customerType: newCustType,
      binNumber: `BIN-${Math.floor(100000000 + Math.random() * 900000000)}-01`,
      totalPurchases: 0
    });
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setQuickAddOpen(false);
  };

  const handleQuickAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupName) return;
    addSupplier({
      name: newSupName,
      contactPerson: newSupContact || 'Sales Rep',
      phone: newSupPhone || '+880 1700-000000',
      email: `${newSupName.toLowerCase().replace(/\\s+/g, '')}@supplier.bd`,
      address: 'Dhaka, Bangladesh',
      country: 'Bangladesh',
      category: newSupCategory,
      totalPurchase: 0,
      totalDue: 0
    });
    setNewSupName('');
    setNewSupContact('');
    setNewSupPhone('');
    setQuickAddOpen(false);
  };

  const handleQuickAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpAmount) return;
    addExpense({
      category: newExpCat,
      amount: parseFloat(newExpAmount) || 0,
      vendor: newExpVendor || 'General Vendor',
      description: newExpDesc || 'Daily operating expense',
      date: 'Today',
      paymentMethod: 'Cash',
      status: 'Approved'
    });
    setNewExpAmount('');
    setNewExpDesc('');
    setQuickAddOpen(false);
  };

  // Close dropdowns on outside click
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 bg-[#1e293b] text-white border-b border-[#334155] sticky top-0 z-40 flex items-center justify-between px-4 ml-64 shadow-md select-none">
      {/* Left: Brand / System indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-xs tracking-wide text-slate-200">
            {companyName}
          </span>
        </div>
        <span className="text-[11px] bg-slate-700/60 text-slate-300 px-2 py-0.5 rounded border border-slate-600 font-mono">
          Dhaka, BD (৳)
        </span>
      </div>

      {/* Right Controls: Exactly as in market ERP (Fullscreen, Quick Add, Calc, SALE POS, Cash Drawer, Date, Lang, Notifications, User) */}
      <div className="flex items-center gap-2">
        {/* 1. Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/70 transition"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* 2. Quick Add (+) Button */}
        <button
          onClick={() => setQuickAddOpen(true)}
          className="p-1.5 rounded-lg text-white bg-blue-600 hover:bg-blue-500 transition shadow-sm flex items-center justify-center font-bold"
          title="Quick Add (Product, Customer, Supplier, Expense)"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* 3. Calculator (🖩) Button */}
        <button
          onClick={() => setCalcOpen(true)}
          className="p-1.5 rounded-lg text-white bg-teal-600 hover:bg-teal-500 transition shadow-sm flex items-center justify-center"
          title="Open Calculator"
        >
          <Calculator className="w-4 h-4" />
        </button>

        {/* 4. SALE (POS) Direct Shortcut Button */}
        <button
          onClick={() => {
            if (onOpenPos) onOpenPos();
            else if (onNavigateTab) onNavigateTab('sell-pos');
          }}
          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition shadow-sm tracking-wider"
          title="Open POS Terminal"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>SALE</span>
        </button>

        {/* 5. Today's Cash Register / Cash Drawer (💵) Button */}
        <button
          onClick={() => setRegisterOpen(true)}
          className="p-1.5 rounded-lg text-white bg-emerald-700 hover:bg-emerald-600 transition shadow-sm flex items-center justify-center"
          title="Today's Cash Register Details"
        >
          <DollarSign className="w-4 h-4" />
        </button>

        {/* 6. Current Date Display */}
        <div className="hidden lg:flex items-center gap-1 text-xs text-slate-300 font-mono px-2 py-1 bg-slate-800/80 rounded border border-slate-700">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>17/10/2026</span>
        </div>

        {/* 7. Language Selector */}
        <button
          onClick={() => setLanguage(l => l === 'English' ? 'বাংলা' : 'English')}
          className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2 py-1 bg-slate-800/80 rounded border border-slate-700 transition"
          title="Switch Language"
        >
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>{language === 'English' ? 'Eng' : 'বাং'}</span>
        </button>

        {/* 8. Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setUserDropdownOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/70 transition relative"
            title="System Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1"></span>
          </button>

          {/* Notifications Popover */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl p-3 z-50 text-xs text-slate-200 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700 font-semibold text-slate-100">
                <span>Notifications (3 New)</span>
                <span className="text-[10px] text-blue-400">Mark all read</span>
              </div>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                <div className="p-2 rounded bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-200">Low Stock Alert: RTX 4080 Super</div>
                    <div className="text-[11px] text-slate-400">Only 14 units left in Banani Central Vault. Reorder threshold is 10.</div>
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                  <Truck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-200">Steadfast Courier Delivery Out</div>
                    <div className="text-[11px] text-slate-400">Consignment STDF-CTG-81920 out for delivery in Chattogram.</div>
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-800/80 border border-slate-700/60 flex items-start gap-2">
                  <Package className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-200">Customs Port Duty Cleared</div>
                    <div className="text-[11px] text-slate-400">PO-2026-ASUS-091 cleared customs at Chittagong Port.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 9. User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg text-slate-200 hover:text-white hover:bg-slate-700/70 transition text-xs font-medium"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[11px]">
              {userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <span className="hidden sm:inline font-semibold">{userName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Menu Dropdown */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs text-slate-200 animate-in fade-in">
              <div className="p-2.5 bg-slate-800/80 rounded-lg mb-2">
                <div className="font-bold text-white text-sm">{userName}</div>
                <div className="text-[11px] text-blue-400 font-mono">{userRole}</div>
                <div className="text-[10px] text-slate-400">{userEmail}</div>
              </div>

              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400">Switch Account</div>
                <button
                  onClick={() => {
                    if (onSwitchUser) onSwitchUser({
                      name: "MD Nazmul Hasan",
                      role: "Managing Director / Owner",
                      email: "nazmul@dhakasilicon.com"
                    });
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 flex items-center justify-between text-slate-300 hover:text-white"
                >
                  <div>
                    <div className="font-semibold">MD Nazmul Hasan</div>
                    <div className="text-[10px] text-slate-400">Managing Director</div>
                  </div>
                  {userName.includes("Nazmul") && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
                <button
                  onClick={() => {
                    if (onSwitchUser) onSwitchUser({
                      name: "Tanvir Ahmed",
                      role: "Senior Sales & Inventory Lead",
                      email: "tanvir@dhakasilicon.com"
                    });
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 flex items-center justify-between text-slate-300 hover:text-white"
                >
                  <div>
                    <div className="font-semibold">Tanvir Ahmed</div>
                    <div className="text-[10px] text-slate-400">Senior Sales Lead</div>
                  </div>
                  {userName.includes("Tanvir") && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-700">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full text-left px-2 py-1.5 rounded text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out of Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: WORKING CALCULATOR POPUP */}
      {/* ============================================================== */}
      {calcOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-80 shadow-2xl overflow-hidden p-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-teal-400" />
                <span className="font-bold text-sm">ERP POS Calculator</span>
              </div>
              <button onClick={() => setCalcOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Display */}
            <div className="my-3 p-3 bg-slate-900 border border-slate-700 rounded-xl text-right">
              <div className="text-xs text-slate-400 h-4 font-mono">
                {calcPrev !== null ? `${calcPrev} ${calcOp}` : ''}
              </div>
              <div className="text-2xl font-bold font-mono tracking-wider overflow-x-auto text-emerald-400">
                {calcInput}
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-2 text-sm font-semibold">
              <button onClick={handleCalcClear} className="p-3 bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-xl hover:bg-rose-600/50">C</button>
              <button onClick={() => handleCalcOp('/')} className="p-3 bg-slate-800 text-teal-400 border border-slate-700 rounded-xl hover:bg-slate-700">÷</button>
              <button onClick={() => handleCalcOp('*')} className="p-3 bg-slate-800 text-teal-400 border border-slate-700 rounded-xl hover:bg-slate-700">×</button>
              <button onClick={() => setCalcInput(prev => prev.length > 1 ? prev.slice(0, -1) : '0')} className="p-3 bg-slate-800 text-amber-400 border border-slate-700 rounded-xl hover:bg-slate-700">⌫</button>

              <button onClick={() => handleCalcDigit('7')} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700">7</button>
              <button onClick={() => handleCalcDigit('8')} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700">8</button>
              <button onClick={() => handleCalcDigit('9')} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700">9</button>
              <button onClick={() => handleCalcOp('-')} className="p-3 bg-slate-800 text-teal-400 border border-slate-700 rounded-xl hover:bg-slate-700">-</button>

              <button onClick={() => handleCalcDigit('4')} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700">4</button>
              <button onClick={() => handleCalcDigit('5')} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700">5</button>
              <button onClick={() => handleCalcDigit('6')} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700">6</button>
              <button onClick={() => handleCalcOp('+')} className="p-3 bg-slate-800 text-teal-400 border border-slate-700 rounded-xl hover:bg-slate-700">+</button>

              <button onClick={() => handleCalcDigit('1')} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700">1</button>
              <button onClick={() => handleCalcDigit('2')} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700">2</button>
              <button onClick={() => handleCalcDigit('3')} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700">3</button>
              <button onClick={handleCalcEquals} className="row-span-2 p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 font-bold flex items-center justify-center text-lg">=</button>

              <button onClick={() => handleCalcDigit('0')} className="col-span-2 p-3 bg-slate-800 rounded-xl hover:bg-slate-700">0</button>
              <button onClick={() => handleCalcDigit('.')} className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700">.</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: QUICK ADD MODAL (Product, Customer, Supplier, Expense) */}
      {/* ============================================================== */}
      {quickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden p-5 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-base">Quick Add Entry</span>
              </div>
              <button onClick={() => setQuickAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1.5 my-3 p-1 bg-slate-900 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setQuickAddTab('product')}
                className={`flex-1 py-1.5 rounded-lg transition ${quickAddTab === 'product' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                + Product
              </button>
              <button
                onClick={() => setQuickAddTab('customer')}
                className={`flex-1 py-1.5 rounded-lg transition ${quickAddTab === 'customer' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                + Customer
              </button>
              <button
                onClick={() => setQuickAddTab('supplier')}
                className={`flex-1 py-1.5 rounded-lg transition ${quickAddTab === 'supplier' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                + Supplier
              </button>
              <button
                onClick={() => setQuickAddTab('expense')}
                className={`flex-1 py-1.5 rounded-lg transition ${quickAddTab === 'expense' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                + Expense
              </button>
            </div>

            {/* TAB CONTENT */}
            {quickAddTab === 'product' && (
              <form onSubmit={handleQuickAddProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gigabyte GeForce RTX 4070 Windforce OC 12GB"
                    value={newProdName}
                    onChange={e => setNewProdName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Category</label>
                    <select
                      value={newProdCategory}
                      onChange={e => setNewProdCategory(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
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
                    <label className="block text-slate-400 mb-1">Brand</label>
                    <input
                      type="text"
                      value={newProdBrand}
                      onChange={e => setNewProdBrand(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Selling Price (৳)</label>
                    <input
                      type="number"
                      required
                      placeholder="85000"
                      value={newProdPrice}
                      onChange={e => setNewProdPrice(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Cost Price (৳)</label>
                    <input
                      type="number"
                      placeholder="68000"
                      value={newProdCost}
                      onChange={e => setNewProdCost(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Initial Stock</label>
                    <input
                      type="number"
                      value={newProdStock}
                      onChange={e => setNewProdStock(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow"
                >
                  Save Product to Catalog
                </button>
              </form>
            )}

            {quickAddTab === 'customer' && (
              <form onSubmit={handleQuickAddCustomer} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Customer / Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Star Gaming Zone BD"
                    value={newCustName}
                    onChange={e => setNewCustName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      required
                      placeholder="+880 1711-000000"
                      value={newCustPhone}
                      onChange={e => setNewCustPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Customer Type</label>
                    <select
                      value={newCustType}
                      onChange={e => setNewCustType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                    >
                      <option>Wholesale</option>
                      <option>Corporate</option>
                      <option>Retail</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Delivery Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Multiplan Center Level 4, Dhaka"
                    value={newCustAddress}
                    onChange={e => setNewCustAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow"
                >
                  Save Customer Record
                </button>
              </form>
            )}

            {quickAddTab === 'supplier' && (
              <form onSubmit={handleQuickAddSupplier} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Supplier Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gigabyte South Asia Logistics"
                    value={newSupName}
                    onChange={e => setNewSupName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Contact Person</label>
                    <input
                      type="text"
                      placeholder="e.g. Alan Walker"
                      value={newSupContact}
                      onChange={e => setNewSupContact(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Phone</label>
                    <input
                      type="text"
                      placeholder="+880 1819-000000"
                      value={newSupPhone}
                      onChange={e => setNewSupPhone(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Product Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Graphics Cards & Motherboards"
                    value={newSupCategory}
                    onChange={e => setNewSupCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow"
                >
                  Save Supplier Contact
                </button>
              </form>
            )}

            {quickAddTab === 'expense' && (
              <form onSubmit={handleQuickAddExpense} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Category</label>
                    <select
                      value={newExpCat}
                      onChange={e => setNewExpCat(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                    >
                      <option>Logistics & Couriers</option>
                      <option>Customs & Port Duty</option>
                      <option>Rent & Lease</option>
                      <option>Utilities & Fiber</option>
                      <option>Packaging & Transport</option>
                      <option>Salaries & Payroll</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Amount (৳)</label>
                    <input
                      type="number"
                      required
                      placeholder="15000"
                      value={newExpAmount}
                      onChange={e => setNewExpAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Vendor / Payee</label>
                  <input
                    type="text"
                    placeholder="e.g. Steadfast Logistics BD"
                    value={newExpVendor}
                    onChange={e => setNewExpVendor(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Description / Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Inter-city courier consignment shipping charge"
                    value={newExpDesc}
                    onChange={e => setNewExpDesc(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow"
                >
                  Record Expense
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: CASH REGISTER / DRAWER SUMMARY */}
      {/* ============================================================== */}
      {registerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-5 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-base">Cash Register / Drawer Status</span>
              </div>
              <button onClick={() => setRegisterOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-slate-800 rounded-lg">
                <span className="text-slate-400">Register Status</span>
                <span className={`px-2 py-0.5 rounded font-bold ${cashRegister.isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {cashRegister.isOpen ? '● OPEN' : 'CLOSED'}
                </span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-800 rounded-lg">
                <span className="text-slate-400">Opened At</span>
                <span className="font-mono text-slate-200">{cashRegister.openedAt}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-800 rounded-lg">
                <span className="text-slate-400">Opening Cash in Hand</span>
                <span className="font-mono font-bold text-white">৳{cashRegister.openingCash.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-800 rounded-lg">
                <span className="text-slate-400">Today's Cash Sales</span>
                <span className="font-mono font-bold text-emerald-400">+ ৳{cashRegister.cashSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl">
                <span className="font-bold text-slate-200">Total Cash in Drawer</span>
                <span className="font-mono font-extrabold text-base text-emerald-400">
                  ৳{cashRegister.totalCash.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {cashRegister.isOpen ? (
                <button
                  onClick={() => {
                    closeCashRegister();
                    setRegisterOpen(false);
                  }}
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition"
                >
                  Close & Reconcile Register
                </button>
              ) : (
                <div className="flex gap-2 w-full">
                  <input
                    type="number"
                    value={openingInput}
                    onChange={e => setOpeningInput(e.target.value)}
                    className="w-1/2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                    placeholder="Opening amount"
                  />
                  <button
                    onClick={() => {
                      openCashRegister(parseFloat(openingInput) || 50000);
                      setRegisterOpen(false);
                    }}
                    className="w-1/2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-xs"
                  >
                    Open Register
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
