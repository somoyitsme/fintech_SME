import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Maximize2, 
  Minimize2, 
  Plus, 
  Calculator, 
  ShoppingBag, 
  DollarSign, 
  Bell, 
  LogOut, 
  ChevronDown, 
  Check, 
  X, 
  Calendar,
  AlertTriangle,
  Package,
  Truck,
  Menu,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ThemeToggle } from './common/ThemeToggle';
import { Button } from './common/Button';
import { Badge } from './common/Badge';

interface NavbarProps {
  companyName: string;
  pageTitle?: string;
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
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  companyName,
  pageTitle = 'Dashboard',
  industry: _industry,
  currency: _currency,
  healthScore: _healthScore,
  userName = "MD Nazmul Hasan",
  userRole = "Managing Director",
  userEmail = "nazmul@dhakasilicon.com",
  onLogout,
  onSwitchUser,
  onNavigateTab,
  onOpenPos,
  onToggleMobileSidebar
}) => {
  const { products: _products, orders: _orders, cashRegister, openCashRegister, closeCashRegister, addNewProduct, addNewCustomer, addSupplier, addExpense } = useStore();
  
  // Header Modals & Dropdowns State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddTab, setQuickAddTab] = useState<'product' | 'customer' | 'supplier' | 'expense'>('product');
  const [registerOpen, setRegisterOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

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
      email: `${newSupName.toLowerCase().replace(/\s+/g, '')}@supplier.bd`,
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
  const notificationRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (!dropdownRef.current?.contains(target) && !notificationRef.current?.contains(target)) {
        setUserDropdownOpen(false);
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
    <header className="sticky top-0 z-30 h-16 overflow-visible border-b border-boundary-subtle bg-surface/90 backdrop-blur-sm shadow-[0_1px_0_rgba(17,24,39,0.02)] select-none transition-colors duration-200">
      <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-5 lg:px-6 overflow-visible">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-secondary transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-content-muted">
              <span className="hidden sm:inline">{companyName}</span>
              <span className="hidden sm:inline" aria-hidden="true">/</span>
              <span>Workspace</span>
            </div>
            <p className="text-sm font-semibold tracking-tight text-content-primary truncate">{pageTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex p-2 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-secondary transition"
            title="Toggle Fullscreen"
            aria-label="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setQuickAddOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-ochre text-stone-950 shadow-sm transition hover:bg-brand-ochreDark"
            title="Quick Add (Product, Customer, Supplier, Expense)"
            aria-label="Quick Add"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={() => setCalcOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-boundary-subtle bg-surface-secondary text-content-secondary transition hover:text-content-primary"
            title="Open POS Calculator"
            aria-label="Open Calculator"
          >
            <Calculator className="w-4 h-4" />
          </button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (onOpenPos) onOpenPos();
              else if (onNavigateTab) onNavigateTab('sell-pos');
            }}
            leftIcon={<ShoppingBag className="w-3.5 h-3.5 text-brand-ochre" />}
            className="hidden sm:inline-flex font-bold tracking-[0.12em]"
            title="Open POS Terminal"
          >
            <span>SALE</span>
          </Button>

          <button
            onClick={() => setRegisterOpen(true)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
              cashRegister.isOpen
                ? 'border-brand-sageDark/40 bg-brand-sage/20 text-stone-900 dark:text-brand-sage'
                : 'border-boundary-subtle bg-surface-secondary text-content-muted hover:text-content-primary'
            }`}
            title="Today's Cash Register Details"
            aria-label="Cash Register"
          >
            <DollarSign className="w-4 h-4" />
          </button>

          <div className="hidden xl:flex items-center gap-1.5 rounded-lg border border-boundary-subtle bg-surface-secondary px-2.5 py-1.5 text-[11px] text-content-muted font-tabular">
            <Calendar className="w-3.5 h-3.5 text-brand-ochreDeep dark:text-brand-ochre" />
            <span>17/10/2026</span>
          </div>

          <ThemeToggle variant="cycle" className="hidden sm:inline-flex" />
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setUserDropdownOpen(false);
            }}
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl text-content-secondary transition-colors hover:bg-surface-secondary hover:text-content-primary ${
              notificationsOpen ? 'bg-surface-secondary text-content-primary' : ''
            }`}
            title="System Notifications"
            aria-label={notificationsRead ? 'Notifications' : 'Notifications, 3 unread'}
            aria-expanded={notificationsOpen}
            aria-controls="notifications-panel"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {!notificationsRead && (
              <span
                aria-hidden="true"
                className="absolute -right-0.5 -top-0.5 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 border-surface bg-status-danger px-1 text-[10px] font-bold leading-none text-white shadow-sm"
              >
                3
              </span>
            )}
          </button>

          {notificationsOpen && (
            <section
              id="notifications-panel"
              aria-label="Notifications"
              className="absolute right-0 top-full z-50 mt-3 flex max-h-[min(34rem,calc(100dvh-5rem))] w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-boundary-strong bg-surface text-content-primary shadow-2xl shadow-stone-950/15 animate-in fade-in zoom-in-95"
            >
              <div className="flex items-start justify-between gap-3 border-b border-boundary-subtle px-4 py-3.5">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight">Notifications</h2>
                  <p className="mt-0.5 text-[11px] text-content-muted">
                    {notificationsRead ? 'You’re all caught up' : '3 unread alerts'}
                  </p>
                </div>
                {!notificationsRead && (
                  <button
                    type="button"
                    onClick={() => setNotificationsRead(true)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold text-content-secondary transition hover:bg-surface-secondary hover:text-content-primary"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto">
                <article className={`flex gap-3 border-b border-boundary-subtle px-4 py-3.5 transition-colors hover:bg-surface-secondary/60 ${notificationsRead ? '' : 'bg-brand-sand/20 dark:bg-brand-ochre/5'}`}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-status-warningBg text-status-warning">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-semibold leading-5">Low stock: RTX 4080 Super</h3>
                      {!notificationsRead && <span aria-label="Unread" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-ochre" />}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-4 text-content-secondary">Only 14 units left in Banani Central Vault. Reorder threshold is 10.</p>
                    <p className="mt-1.5 text-[10px] font-medium text-content-muted">Inventory</p>
                  </div>
                </article>
                <article className={`flex gap-3 border-b border-boundary-subtle px-4 py-3.5 transition-colors hover:bg-surface-secondary/60 ${notificationsRead ? '' : 'bg-brand-sand/20 dark:bg-brand-ochre/5'}`}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-status-successBg text-status-success">
                    <Truck className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-semibold leading-5">Courier delivery in progress</h3>
                      {!notificationsRead && <span aria-label="Unread" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-ochre" />}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-4 text-content-secondary">Consignment STDF-CTG-81920 is out for delivery in Chattogram.</p>
                    <p className="mt-1.5 text-[10px] font-medium text-content-muted">Delivery</p>
                  </div>
                </article>
                <article className={`flex gap-3 px-4 py-3.5 transition-colors hover:bg-surface-secondary/60 ${notificationsRead ? '' : 'bg-brand-sand/20 dark:bg-brand-ochre/5'}`}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-status-infoBg text-status-info">
                    <Package className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xs font-semibold leading-5">Customs duty cleared</h3>
                      {!notificationsRead && <span aria-label="Unread" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-ochre" />}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-4 text-content-secondary">PO-2026-ASUS-091 cleared customs at Chittagong Port.</p>
                    <p className="mt-1.5 text-[10px] font-medium text-content-muted">Purchasing</p>
                  </div>
                </article>
              </div>
            </section>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setUserDropdownOpen(!userDropdownOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg text-content-primary hover:bg-surface-secondary transition text-xs font-medium"
            aria-label="User profile menu"
          >
            <div className="w-6 h-6 rounded-full bg-brand-ochre flex items-center justify-center font-bold text-stone-950 text-[11px] shadow-xs">
              {userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <span className="hidden md:inline font-semibold text-content-primary truncate max-w-[120px]">{userName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-content-muted" />
          </button>

          {/* User Menu Dropdown */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 max-h-[calc(100vh-6rem)] overflow-y-auto bg-surface border border-boundary-strong rounded-xl shadow-xl p-2 z-50 text-xs text-content-primary animate-in fade-in zoom-in-95">
              <div className="p-2.5 bg-surface-secondary rounded-lg mb-2">
                <div className="font-bold text-content-primary text-sm">{userName}</div>
                <div className="text-[11px] text-brand-ochreDeep dark:text-brand-ochre font-mono font-medium">{userRole}</div>
                <div className="text-[10px] text-content-muted truncate">{userEmail}</div>
              </div>

              {/* Mobile theme toggle fallback */}
              <div className="sm:hidden px-2 py-1 mb-2 border-b border-boundary-subtle pb-2">
                <div className="text-[10px] uppercase font-bold text-content-muted mb-1">Theme</div>
                <ThemeToggle variant="buttons" className="w-full justify-between" />
              </div>

              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] uppercase font-bold text-content-muted">Switch Role</div>
                <button
                  onClick={() => {
                    if (onSwitchUser) onSwitchUser({
                      name: "MD Nazmul Hasan",
                      role: "Managing Director / Owner",
                      email: "nazmul@dhakasilicon.com"
                    });
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary flex items-center justify-between text-content-primary transition"
                >
                  <div>
                    <div className="font-semibold">MD Nazmul Hasan</div>
                    <div className="text-[10px] text-content-muted">Managing Director</div>
                  </div>
                  {userName.includes("Nazmul") && <Check className="w-3.5 h-3.5 text-status-success" />}
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
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-surface-secondary flex items-center justify-between text-content-primary transition"
                >
                  <div>
                    <div className="font-semibold">Tanvir Ahmed</div>
                    <div className="text-[10px] text-content-muted">Senior Sales Lead</div>
                  </div>
                  {userName.includes("Tanvir") && <Check className="w-3.5 h-3.5 text-status-success" />}
                </button>
              </div>

              <div className="pt-2 mt-2 border-t border-boundary-subtle">
                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-status-danger hover:bg-status-dangerBg flex items-center gap-2 font-medium transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out of Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

      {/* ============================================================== */}
      {/* MODAL 1: POS CALCULATOR */}
      {/* ============================================================== */}
      {calcOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-3 bg-stone-950/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="bg-surface border border-boundary-strong rounded-2xl w-80 max-h-[calc(100dvh-1.5rem)] overflow-y-auto shadow-2xl p-4 text-content-primary animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-boundary-subtle">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-brand-ochreDeep dark:text-brand-ochre" />
                <span className="font-bold text-sm">ERP POS Calculator</span>
              </div>
              <button onClick={() => setCalcOpen(false)} className="text-content-muted hover:text-content-primary p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Display */}
            <div className="my-3 p-3 bg-surface-secondary border border-boundary-subtle rounded-xl text-right">
              <div className="text-xs text-content-muted h-4 font-mono font-tabular">
                {calcPrev !== null ? `${calcPrev} ${calcOp}` : ''}
              </div>
              <div className="text-2xl font-bold font-mono font-tabular tracking-wider overflow-x-auto text-content-primary">
                {calcInput}
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-2 text-sm font-semibold">
              <button onClick={handleCalcClear} className="p-3 bg-status-dangerBg text-status-danger border border-status-dangerBorder rounded-xl hover:opacity-90 font-bold">C</button>
              <button onClick={() => handleCalcOp('/')} className="p-3 bg-surface-secondary text-brand-ochreDeep dark:text-brand-ochre border border-boundary-subtle rounded-xl hover:bg-surface-tertiary">÷</button>
              <button onClick={() => handleCalcOp('*')} className="p-3 bg-surface-secondary text-brand-ochreDeep dark:text-brand-ochre border border-boundary-subtle rounded-xl hover:bg-surface-tertiary">×</button>
              <button onClick={() => setCalcInput(prev => prev.length > 1 ? prev.slice(0, -1) : '0')} className="p-3 bg-surface-secondary text-status-warning border border-boundary-subtle rounded-xl hover:bg-surface-tertiary">⌫</button>

              <button onClick={() => handleCalcDigit('7')} className="p-3 bg-surface-secondary border border-boundary-subtle rounded-xl hover:bg-surface-tertiary">7</button>
              <button onClick={() => handleCalcDigit('8')} className="p-3 bg-surface-secondary border border-boundary-subtle rounded-xl hover:bg-surface-tertiary">8</button>
              <button onClick={() => handleCalcDigit('9')} className="p-3 bg-surface-secondary border border-boundary-subtle rounded-xl hover:bg-surface-tertiary">9</button>
              <button onClick={() => handleCalcOp('-')} className="p-3 bg-surface-secondary text-brand-ochreDeep dark:text-brand-ochre border border-boundary-subtle rounded-xl hover:bg-surface-tertiary">-</button>

              <button onClick={() => handleCalcDigit('4')} className="p-3 bg-surface-secondary border border-boundary-subtle rounded-xl hover:bg-surface-tertiary">4</button>
              <button onClick={() => handleCalcDigit('5')} className="p-3 bg-surface-secondary border border-boundary-subtle rounded-xl hover:bg-surface-tertiary">5</button>
              <button onClick={() => handleCalcDigit('6')} className="p-3 bg-surface-secondary border border-boundary-subtle rounded-xl hover:bg-surface-tertiary">6</button>
              <button onClick={() => handleCalcOp('+')} className="p-3 bg-surface-secondary text-brand-ochreDeep dark:text-brand-ochre border border-boundary-subtle rounded-xl hover:bg-surface-tertiary">+</button>

              <button onClick={() => handleCalcDigit('1')} className="p-3 bg-surface-secondary border border-boundary-subtle rounded-xl hover:bg-surface-tertiary">1</button>
              <button onClick={() => handleCalcDigit('2')} className="p-3 bg-surface-secondary border border-boundary-subtle rounded-xl hover:bg-surface-tertiary">2</button>
              <button onClick={() => handleCalcDigit('3')} className="p-3 bg-surface-secondary border border-boundary-subtle rounded-xl hover:bg-surface-tertiary">3</button>
              <button onClick={handleCalcEquals} className="row-span-2 p-3 bg-brand-ochre text-stone-950 font-bold rounded-xl hover:bg-brand-ochreDark flex items-center justify-center text-lg shadow-sm">=</button>

              <button onClick={() => handleCalcDigit('0')} className="col-span-2 p-3 bg-surface-secondary border border-boundary-subtle rounded-xl hover:bg-surface-tertiary">0</button>
              <button onClick={() => handleCalcDigit('.')} className="p-3 bg-surface-secondary border border-boundary-subtle rounded-xl hover:bg-surface-tertiary">.</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* MODAL 2: QUICK ADD MODAL */}
      {/* ============================================================== */}
      {quickAddOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-3 bg-stone-950/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="bg-surface border border-boundary-strong rounded-2xl w-full max-w-lg max-h-[calc(100dvh-1.5rem)] overflow-y-auto shadow-2xl p-5 text-content-primary animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-boundary-subtle">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-brand-ochre flex items-center justify-center text-stone-950 font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-content-primary">Quick Add Enterprise Entity</h3>
              </div>
              <button onClick={() => setQuickAddOpen(false)} className="text-content-muted hover:text-content-primary p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Add Sub-Tabs */}
            <div className="flex items-center gap-1 my-4 p-1 bg-surface-secondary rounded-xl border border-boundary-subtle text-xs">
              {(['product', 'customer', 'supplier', 'expense'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setQuickAddTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg capitalize font-semibold transition ${
                    quickAddTab === tab
                      ? 'bg-surface text-content-primary shadow-xs border border-boundary-subtle'
                      : 'text-content-muted hover:text-content-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* FORM 1: PRODUCT */}
            {quickAddTab === 'product' && (
              <form onSubmit={handleQuickAddProduct} className="space-y-3 text-xs">
                <div>
                  <label className="block text-content-secondary font-semibold mb-1">Product Hardware Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gigabyte RTX 4070 Windforce OC 12GB"
                    value={newProdName}
                    onChange={e => setNewProdName(e.target.value)}
                    className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-content-primary focus:border-brand-ochre focus:ring-1 focus:ring-brand-ochre"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-content-secondary font-semibold mb-1">Category</label>
                    <select
                      value={newProdCategory}
                      onChange={e => setNewProdCategory(e.target.value)}
                      className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-content-primary"
                    >
                      <option>Graphics Cards</option>
                      <option>Processors</option>
                      <option>Motherboards</option>
                      <option>Memory (RAM)</option>
                      <option>Storage (SSD)</option>
                      <option>Power Supplies</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-content-secondary font-semibold mb-1">Brand</label>
                    <select
                      value={newProdBrand}
                      onChange={e => setNewProdBrand(e.target.value)}
                      className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-content-primary"
                    >
                      <option>ASUS</option>
                      <option>MSI</option>
                      <option>Gigabyte</option>
                      <option>Intel</option>
                      <option>AMD</option>
                      <option>Samsung</option>
                      <option>Corsair</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-content-secondary font-semibold mb-1">Retail Price (৳)</label>
                    <input
                      type="number"
                      required
                      placeholder="85000"
                      value={newProdPrice}
                      onChange={e => setNewProdPrice(e.target.value)}
                      className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-content-primary font-tabular"
                    />
                  </div>
                  <div>
                    <label className="block text-content-secondary font-semibold mb-1">Cost Price (৳)</label>
                    <input
                      type="number"
                      placeholder="68000"
                      value={newProdCost}
                      onChange={e => setNewProdCost(e.target.value)}
                      className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-content-primary font-tabular"
                    />
                  </div>
                  <div>
                    <label className="block text-content-secondary font-semibold mb-1">Initial Units</label>
                    <input
                      type="number"
                      placeholder="10"
                      value={newProdStock}
                      onChange={e => setNewProdStock(e.target.value)}
                      className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-content-primary font-tabular"
                    />
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuickAddOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="brand" size="sm">Save Product</Button>
                </div>
              </form>
            )}

            {/* FORM 2: CUSTOMER */}
            {quickAddTab === 'customer' && (
              <form onSubmit={handleQuickAddCustomer} className="space-y-3 text-xs">
                <div>
                  <label className="block text-content-secondary font-semibold mb-1">Customer / Enterprise Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Star Computer Point"
                    value={newCustName}
                    onChange={e => setNewCustName(e.target.value)}
                    className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-content-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-content-secondary font-semibold mb-1">Phone / Mobile</label>
                    <input
                      type="text"
                      required
                      placeholder="+880 1711-000000"
                      value={newCustPhone}
                      onChange={e => setNewCustPhone(e.target.value)}
                      className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-content-primary font-tabular"
                    />
                  </div>
                  <div>
                    <label className="block text-content-secondary font-semibold mb-1">Client Tier</label>
                    <select
                      value={newCustType}
                      onChange={e => setNewCustType(e.target.value as any)}
                      className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-content-primary"
                    >
                      <option value="Wholesale">Wholesale Dealer</option>
                      <option value="Retail">Retail Walk-in</option>
                      <option value="Corporate">Corporate / Institute</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-content-secondary font-semibold mb-1">Delivery / Billing Address</label>
                  <input
                    type="text"
                    placeholder="Multiplan Center, Level 4, Shop 402, Elephant Road, Dhaka"
                    value={newCustAddress}
                    onChange={e => setNewCustAddress(e.target.value)}
                    className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-content-primary"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuickAddOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="brand" size="sm">Add Customer</Button>
                </div>
              </form>
            )}

            {/* FORM 3: SUPPLIER */}
            {quickAddTab === 'supplier' && (
              <form onSubmit={handleQuickAddSupplier} className="space-y-3 text-xs">
                <div>
                  <label className="block text-content-secondary font-semibold mb-1">Vendor / Principal Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gigabyte Regional APAC (Taiwan)"
                    value={newSupName}
                    onChange={e => setNewSupName(e.target.value)}
                    className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-content-primary"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-content-secondary font-semibold mb-1">Contact Person</label>
                    <input
                      type="text"
                      placeholder="e.g. Kelvin Chen (Sales Lead)"
                      value={newSupContact}
                      onChange={e => setNewSupContact(e.target.value)}
                      className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-content-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-content-secondary font-semibold mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+886 2 8912-4000"
                      value={newSupPhone}
                      onChange={e => setNewSupPhone(e.target.value)}
                      className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-content-primary font-tabular"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-content-secondary font-semibold mb-1">Product Category</label>
                  <select
                    value={newSupCategory}
                    onChange={e => setNewSupCategory(e.target.value)}
                    className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-content-primary"
                  >
                    <option>Graphics Cards & GPUs</option>
                    <option>Processors (CPUs)</option>
                    <option>Motherboards</option>
                    <option>Memory & SSD Storage</option>
                  </select>
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuickAddOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="brand" size="sm">Register Supplier</Button>
                </div>
              </form>
            )}

            {/* FORM 4: EXPENSE */}
            {quickAddTab === 'expense' && (
              <form onSubmit={handleQuickAddExpense} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-content-secondary font-semibold mb-1">Category</label>
                    <select
                      value={newExpCat}
                      onChange={e => setNewExpCat(e.target.value)}
                      className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-content-primary"
                    >
                      <option>Logistics & Couriers</option>
                      <option>Chittagong Port Customs</option>
                      <option>Showroom Rent & Utilities</option>
                      <option>Packaging & Supplies</option>
                      <option>Marketing & Promotion</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-content-secondary font-semibold mb-1">Amount (৳)</label>
                    <input
                      type="number"
                      required
                      placeholder="15000"
                      value={newExpAmount}
                      onChange={e => setNewExpAmount(e.target.value)}
                      className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-content-primary font-tabular"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-content-secondary font-semibold mb-1">Payee Vendor / Service</label>
                  <input
                    type="text"
                    placeholder="e.g. Steadfast Courier Ltd."
                    value={newExpVendor}
                    onChange={e => setNewExpVendor(e.target.value)}
                    className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-content-primary"
                  />
                </div>
                <div>
                  <label className="block text-content-secondary font-semibold mb-1">Notes / Description</label>
                  <input
                    type="text"
                    placeholder="Courier parcel consignment fees for 48 shipments"
                    value={newExpDesc}
                    onChange={e => setNewExpDesc(e.target.value)}
                    className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-content-primary"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setQuickAddOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="brand" size="sm">Record Expense</Button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* MODAL 3: CASH REGISTER DETAILS */}
      {/* ============================================================== */}
      {registerOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-3 bg-stone-950/60 dark:bg-black/80 backdrop-blur-xs">
          <div className="bg-surface border border-boundary-strong rounded-2xl w-full max-w-md max-h-[calc(100dvh-1.5rem)] overflow-y-auto shadow-2xl p-5 text-content-primary animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-boundary-subtle">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-brand-ochreDeep dark:text-brand-ochre" />
                <span className="font-bold text-sm">Today's Cash Drawer (Banani Vault)</span>
              </div>
              <button onClick={() => setRegisterOpen(false)} className="text-content-muted hover:text-content-primary p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-2.5 text-xs">
              <div className="p-3 bg-surface-secondary rounded-xl flex items-center justify-between border border-boundary-subtle">
                <span className="text-content-secondary">Drawer Status:</span>
                <Badge variant={cashRegister.isOpen ? 'success' : 'neutral'} dot>
                  {cashRegister.isOpen ? 'Open' : 'Closed'}
                </Badge>
              </div>
              <div className="p-3 bg-surface-secondary rounded-xl flex items-center justify-between border border-boundary-subtle font-tabular">
                <span className="text-content-secondary">Morning Opening Float:</span>
                <span className="font-bold text-content-primary">৳ {cashRegister.openingCash.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-surface-secondary rounded-xl flex items-center justify-between border border-boundary-subtle font-tabular">
                <span className="text-content-secondary">Total Inflows (In-store Cash):</span>
                <span className="font-bold text-status-success">+ ৳ {cashRegister.cashSales.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-brand-sage/20 dark:bg-brand-sage/10 rounded-xl flex items-center justify-between border border-brand-sageDark/30 font-tabular">
                <span className="font-bold text-content-primary">Expected Cash in Drawer:</span>
                <span className="text-base font-extrabold text-stone-900 dark:text-brand-sage">
                  ৳ {cashRegister.totalCash.toLocaleString()}
                </span>
              </div>
            </div>

            {!cashRegister.isOpen ? (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-content-secondary mb-1">Set Opening Cash Float (৳)</label>
                  <input
                    type="number"
                    value={openingInput}
                    onChange={e => setOpeningInput(e.target.value)}
                    className="w-full bg-surface border border-boundary-strong rounded-lg p-2 text-xs font-tabular text-content-primary"
                  />
                </div>
                <Button
                  variant="brand"
                  size="md"
                  className="w-full font-bold"
                  onClick={() => openCashRegister(parseFloat(openingInput) || 50000)}
                >
                  Open Cash Drawer for Trading
                </Button>
              </div>
            ) : (
              <div className="pt-2 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setRegisterOpen(false)}
                >
                  Dismiss
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1 font-bold"
                  onClick={() => {
                    closeCashRegister();
                    setRegisterOpen(false);
                  }}
                >
                  Reconcile & Close Register
                </Button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
