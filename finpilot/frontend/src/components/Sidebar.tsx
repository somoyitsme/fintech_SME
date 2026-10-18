import React, { useState, useEffect } from 'react';
import { 
  Home, 
  UserCheck, 
  Users, 
  ShoppingBag, 
  Package, 
  Layers, 
  ArrowLeftRight, 
  Sliders, 
  MinusCircle, 
  CreditCard, 
  BarChart3, 
  Bell, 
  BookOpen, 
  Settings, 
  Award, 
  CheckSquare, 
  ChevronRight,
  Truck,
  Database,
  X,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: string;
  userName?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface SubMenuItem {
  id: string;
  label: string;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: any;
  category?: string;
  subItems?: SubMenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  userRole = "Managing Director",
  userName = "MD Nazmul Hasan",
  isMobileOpen = false,
  onCloseMobile
}) => {
  // Expandable sections state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    contacts: false,
    products: false,
    purchases: false,
    sell: false,
    transfers: false,
    adjustments: false,
    expenses: false,
    accounts: false,
    reports: false,
    users: false
  });

  // Auto-expand the active section based on the current active tab
  useEffect(() => {
    menuGroups.forEach(group => {
      if (group.subItems && group.subItems.some(sub => sub.id === activeTab)) {
        setOpenSections(prev => ({ ...prev, [group.id]: true }));
      }
    });
  }, [activeTab]);

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const menuGroups: MenuGroup[] = [
    {
      id: 'home-dashboard',
      label: 'Home Dashboard',
      icon: Home,
      category: 'Overview'
    },
    {
      id: 'sell',
      label: 'Sell & POS Terminal',
      icon: ShoppingBag,
      category: 'Operations',
      subItems: [
        { id: 'sell-all', label: 'All Sales Orders' },
        { id: 'sell-pos', label: 'POS Terminal (Cashier)' },
        { id: 'sell-pos-list', label: 'POS Receipts Ledger' },
        { id: 'sell-add', label: 'Add Manual Sale' },
        { id: 'sell-drafts', label: 'Draft Orders' },
        { id: 'sell-quotations', label: 'Quotations & Proformas' },
        { id: 'sell-returns', label: 'Sale Returns' },
        { id: 'sell-shipments', label: 'Courier Shipments' },
        { id: 'sell-discounts', label: 'Discounts & Promos' },
        { id: 'sell-import', label: 'Import Sales CSV' }
      ]
    },
    {
      id: 'products',
      label: 'Products & Inventory',
      icon: Package,
      category: 'Operations',
      subItems: [
        { id: 'products-list', label: 'List Products (Catalog)' },
        { id: 'products-add', label: 'Add New Product' },
        { id: 'products-prices', label: 'Update Prices' },
        { id: 'products-labels', label: 'Print Barcode Labels' },
        { id: 'products-variations', label: 'Product Variations' },
        { id: 'products-import', label: 'Import Products' },
        { id: 'products-units', label: 'Measurement Units' },
        { id: 'products-categories', label: 'Hardware Categories' },
        { id: 'products-brands', label: 'Authorized Brands' },
        { id: 'products-warranties', label: 'Warranty Ledgers' }
      ]
    },
    {
      id: 'purchases',
      label: 'Purchases & POs',
      icon: Layers,
      category: 'Operations',
      subItems: [
        { id: 'purchases-list', label: 'Purchase Orders' },
        { id: 'purchases-add', label: 'Create Purchase Order' },
        { id: 'purchases-returns', label: 'Purchase Returns' }
      ]
    },
    {
      id: 'transfers',
      label: 'Stock Transfers',
      icon: Truck,
      category: 'Operations',
      subItems: [
        { id: 'stock-transfers-list', label: 'Transfer Ledgers' },
        { id: 'stock-transfers-add', label: 'New Inter-Store Transfer' }
      ]
    },
    {
      id: 'adjustments',
      label: 'Stock Adjustments',
      icon: Sliders,
      category: 'Operations',
      subItems: [
        { id: 'stock-adjustments-list', label: 'Adjustment Audits' },
        { id: 'stock-adjustments-add', label: 'Add Stock Adjustment' }
      ]
    },
    {
      id: 'contacts',
      label: 'Contacts & CRM',
      icon: Users,
      category: 'Relations',
      subItems: [
        { id: 'contacts-suppliers', label: 'Hardware Suppliers' },
        { id: 'contacts-customers', label: 'Customer Directory' },
        { id: 'contacts-groups', label: 'Customer Pricing Groups' },
        { id: 'contacts-import', label: 'Import Contacts' }
      ]
    },
    {
      id: 'accounts',
      label: 'Payment Accounts',
      icon: CreditCard,
      category: 'Finance',
      subItems: [
        { id: 'accounts-list', label: 'Bank & Cash Ledgers' },
        { id: 'accounts-balancesheet', label: 'Balance Sheet' },
        { id: 'accounts-trialbalance', label: 'Trial Balance' },
        { id: 'accounts-cashflow', label: 'Cash Flow Audit' }
      ]
    },
    {
      id: 'expenses',
      label: 'Operating Expenses',
      icon: MinusCircle,
      category: 'Finance',
      subItems: [
        { id: 'expenses-list', label: 'Expense Ledgers' },
        { id: 'expenses-add', label: 'Record New Expense' },
        { id: 'expenses-categories', label: 'Expense Categories' }
      ]
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      category: 'Finance',
      subItems: [
        { id: 'reports-profit-loss', label: 'Profit & Loss Statement' },
        { id: 'reports-purchases-sales', label: 'Purchase vs Sales Audit' },
        { id: 'reports-tax', label: 'NBR Tax & VAT Report' },
        { id: 'reports-contacts', label: 'Client Ledger Summary' },
        { id: 'reports-stock', label: 'Stock Valuation Report' },
        { id: 'reports-trending', label: 'Trending Hardware SKUs' }
      ]
    },
    {
      id: 'users',
      label: 'Staff & Roles',
      icon: UserCheck,
      category: 'Administration',
      subItems: [
        { id: 'users-list', label: 'Staff Accounts' },
        { id: 'users-roles', label: 'Roles & Permissions' },
        { id: 'users-commission', label: 'Sales Commission Agents' }
      ]
    },
    {
      id: 'essentials-todo',
      label: 'Store Operations Checklist',
      icon: CheckSquare,
      category: 'Administration'
    },
    {
      id: 'admin-database',
      label: 'Database & Audit Export',
      icon: Database,
      category: 'Administration'
    },
    {
      id: 'settings-business',
      label: 'System & Gateway Settings',
      icon: Settings,
      category: 'Administration'
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-stone-950/60 dark:bg-black/80 backdrop-blur-xs lg:hidden transition-opacity duration-200"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`w-64 bg-surface-secondary dark:bg-[#161B16] border-r border-boundary-subtle flex flex-col justify-between h-screen fixed lg:sticky top-0 z-50 transition-transform duration-200 ease-in-out select-none shadow-md lg:shadow-none ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="overflow-y-auto overflow-x-hidden flex-1 scrollbar-thin">
          {/* Brand Header */}
          <div className="h-15 flex items-center justify-between px-4 border-b border-boundary-subtle bg-surface/80 dark:bg-[#181C18]/80 backdrop-blur-xs sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-ochre flex items-center justify-center text-stone-950 font-black text-xs shadow-xs tracking-wider">
                DS
              </div>
              <div className="leading-tight">
                <div className="font-bold text-content-primary text-xs tracking-tight">
                  Dhaka Silicon Ltd.
                </div>
                <div className="text-[10px] text-content-muted font-mono">
                  Hardware Wholesale ERP
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] font-semibold text-stone-800 dark:text-brand-sage bg-brand-sage/30 dark:bg-brand-sage/15 px-1.5 py-0.5 rounded border border-brand-sageDark/30">
                v4.2
              </span>
              {/* Close Button on Mobile Drawer */}
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1 rounded-md text-content-muted hover:text-content-primary hover:bg-surface-tertiary"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation List */}
          <nav className="p-2 space-y-1 text-xs">
            {menuGroups.map((group, index) => {
              const Icon = group.icon;
              const hasSub = group.subItems && group.subItems.length > 0;
              const isOpen = openSections[group.id] || false;
              const isGroupActive = activeTab === group.id || (group.subItems && group.subItems.some(s => s.id === activeTab));

              // Show category divider when category changes
              const prevGroup = index > 0 ? menuGroups[index - 1] : null;
              const showCategory = group.category && (!prevGroup || prevGroup.category !== group.category);

              return (
                <div key={group.id} className="space-y-0.5">
                  {showCategory && (
                    <div className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-content-muted/80">
                      {group.category}
                    </div>
                  )}

                  {hasSub ? (
                    <div>
                      <button
                        onClick={() => toggleSection(group.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg transition-all duration-150 font-medium ${
                          isGroupActive 
                            ? 'bg-brand-sage/30 text-stone-900 dark:bg-brand-sage/15 dark:text-brand-sage border border-brand-sageDark/30 font-semibold' 
                            : 'hover:bg-surface-tertiary/70 text-content-secondary hover:text-content-primary'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 flex-shrink-0 ${isGroupActive ? 'text-brand-ochreDeep dark:text-brand-ochre' : 'text-content-muted'}`} />
                          <span className="truncate">{group.label}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 text-content-muted transition-transform duration-150 flex-shrink-0 ${isOpen ? 'rotate-90 text-brand-ochreDeep dark:text-brand-ochre' : ''}`} />
                      </button>

                      {/* Submenu Items */}
                      {isOpen && (
                        <div className="ml-4 pl-2 my-1 space-y-0.5 border-l border-boundary-subtle">
                          {group.subItems!.map((sub) => {
                            const isSubActive = activeTab === sub.id;
                            return (
                              <button
                                key={sub.id}
                                onClick={() => handleNavClick(sub.id)}
                                className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11.5px] transition-all duration-100 flex items-center gap-1.5 ${
                                  isSubActive
                                    ? 'bg-brand-sage text-stone-950 font-bold shadow-xs'
                                    : 'text-content-secondary hover:text-content-primary hover:bg-surface-tertiary/60'
                                }`}
                              >
                                <span className={`text-[9px] ${isSubActive ? 'text-stone-950 font-bold' : 'text-content-muted'}`}>•</span>
                                <span className="truncate">{sub.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleNavClick(group.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 font-medium ${
                        activeTab === group.id 
                          ? 'bg-brand-sage text-stone-950 font-bold shadow-xs border border-brand-sageDark/30' 
                          : 'hover:bg-surface-tertiary/70 text-content-secondary hover:text-content-primary'
                      }`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 ${activeTab === group.id ? 'text-stone-950' : 'text-content-muted'}`} />
                      <span className="truncate">{group.label}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-boundary-subtle bg-surface/90 dark:bg-[#181C18]/90 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-ochre flex items-center justify-center font-bold text-stone-950 text-xs shadow-xs">
              {userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-content-primary truncate">{userName}</div>
              <div className="text-[10px] text-status-success font-medium flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-status-success inline-block"></span>
                <span>{userRole}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
