import React, { useState } from 'react';
import { 
  Home, 
  UserCheck, 
  Users, 
  ShoppingBag, 
  Package, 
  Layers, 
  TrendingUp, 
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
  ChevronDown, 
  ChevronRight,
  Truck,
  Building2,
  DollarSign,
  Cpu
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: string;
  userName?: string;
}

interface SubMenuItem {
  id: string;
  label: string;
}

interface MenuGroup {
  id: string;
  label: string;
  icon: any;
  subItems?: SubMenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  userRole = "Managing Director",
  userName = "MD Nazmul Hasan"
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

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const menuGroups: MenuGroup[] = [
    {
      id: 'home-dashboard',
      label: 'Home',
      icon: Home
    },
    {
      id: 'users',
      label: 'User Management',
      icon: UserCheck,
      subItems: [
        { id: 'users-list', label: 'Users' },
        { id: 'users-roles', label: 'Roles' },
        { id: 'users-commission', label: 'Sales Commission Agents' }
      ]
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: Users,
      subItems: [
        { id: 'contacts-suppliers', label: 'Suppliers' },
        { id: 'contacts-customers', label: 'Customers' },
        { id: 'contacts-groups', label: 'Customer Groups' },
        { id: 'contacts-import', label: 'Import Contacts' }
      ]
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      subItems: [
        { id: 'products-list', label: 'List Products' },
        { id: 'products-add', label: 'Add Product' },
        { id: 'products-prices', label: 'Update Price' },
        { id: 'products-labels', label: 'Print Labels' },
        { id: 'products-variations', label: 'Variations' },
        { id: 'products-import', label: 'Import Products' },
        { id: 'products-units', label: 'Units' },
        { id: 'products-categories', label: 'Categories' },
        { id: 'products-brands', label: 'Brands' },
        { id: 'products-warranties', label: 'Warranties' }
      ]
    },
    {
      id: 'purchases',
      label: 'Purchases',
      icon: Layers,
      subItems: [
        { id: 'purchases-list', label: 'List Purchases' },
        { id: 'purchases-add', label: 'Add Purchase' },
        { id: 'purchases-returns', label: 'List Purchase Return' }
      ]
    },
    {
      id: 'sell',
      label: 'Sell',
      icon: ShoppingBag,
      subItems: [
        { id: 'sell-all', label: 'All sales' },
        { id: 'sell-add', label: 'Add Sale' },
        { id: 'sell-pos-list', label: 'List POS' },
        { id: 'sell-pos', label: 'POS' },
        { id: 'sell-drafts', label: 'List Drafts' },
        { id: 'sell-quotations', label: 'List quotations' },
        { id: 'sell-returns', label: 'List Sell Return' },
        { id: 'sell-shipments', label: 'Shipments' },
        { id: 'sell-discounts', label: 'Discounts' },
        { id: 'sell-import', label: 'Import Sales' }
      ]
    },
    {
      id: 'transfers',
      label: 'Stock Transfers',
      icon: Truck,
      subItems: [
        { id: 'stock-transfers-list', label: 'List Stock Transfers' },
        { id: 'stock-transfers-add', label: 'Add Stock Transfer' }
      ]
    },
    {
      id: 'adjustments',
      label: 'Stock Adjustment',
      icon: Sliders,
      subItems: [
        { id: 'stock-adjustments-list', label: 'List Stock Adjustments' },
        { id: 'stock-adjustments-add', label: 'Add Stock Adjustment' }
      ]
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: MinusCircle,
      subItems: [
        { id: 'expenses-list', label: 'List Expenses' },
        { id: 'expenses-add', label: 'Add Expense' },
        { id: 'expenses-categories', label: 'Expense Categories' }
      ]
    },
    {
      id: 'accounts',
      label: 'Payment Accounts',
      icon: CreditCard,
      subItems: [
        { id: 'accounts-list', label: 'List Accounts' },
        { id: 'accounts-balancesheet', label: 'Balance Sheet' },
        { id: 'accounts-trialbalance', label: 'Trial Balance' },
        { id: 'accounts-cashflow', label: 'Cash Flow' }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      subItems: [
        { id: 'reports-profit-loss', label: 'Profit / Loss Report' },
        { id: 'reports-purchases-sales', label: 'Purchase & Sale Report' },
        { id: 'reports-tax', label: 'Tax Report (VAT)' },
        { id: 'reports-contacts', label: 'Supplier & Customer Report' },
        { id: 'reports-stock', label: 'Stock Report' },
        { id: 'reports-trending', label: 'Trending Products' }
      ]
    },
    {
      id: 'notifications-templates',
      label: 'Notification Templates',
      icon: Bell
    },
    {
      id: 'user-manual',
      label: 'User Manual',
      icon: BookOpen
    },
    {
      id: 'settings-business',
      label: 'Settings',
      icon: Settings
    },
    {
      id: 'hrm-staff',
      label: 'HRM',
      icon: Award
    },
    {
      id: 'essentials-todo',
      label: 'Essentials',
      icon: CheckSquare
    }
  ];

  return (
    <aside className="w-64 bg-[#111827] text-slate-300 border-r border-[#1f2937] flex flex-col justify-between h-screen fixed left-0 top-0 z-50 select-none shadow-xl">
      <div className="overflow-y-auto overflow-x-hidden flex-1 scrollbar-thin scrollbar-thumb-slate-700">
        {/* Brand Header: NAZMUL / Dhaka Silicon */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#1f2937] bg-[#0f172a]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow">
              N
            </div>
            <div className="font-extrabold tracking-wider text-white text-base">
              NAZMUL
            </div>
          </div>
          <span className="text-[10px] text-blue-400 font-mono bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800">
            ERP v4.2
          </span>
        </div>

        {/* Navigation List */}
        <nav className="p-2 space-y-0.5 text-xs">
          {menuGroups.map((group) => {
            const Icon = group.icon;
            const hasSub = group.subItems && group.subItems.length > 0;
            const isOpen = openSections[group.id] || false;
            const isGroupActive = activeTab === group.id || (group.subItems && group.subItems.some(s => s.id === activeTab));

            return (
              <div key={group.id} className="space-y-0.5">
                {hasSub ? (
                  <div>
                    <button
                      onClick={() => toggleSection(group.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition font-medium ${
                        isGroupActive 
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                          : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-slate-400" />
                        <span>{group.label}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-90 text-blue-400' : ''}`} />
                    </button>

                    {/* Submenu Items */}
                    {isOpen && (
                      <div className="ml-5 pl-2.5 my-1 space-y-0.5 border-l border-slate-700">
                        {group.subItems!.map((sub) => {
                          const isSubActive = activeTab === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => setActiveTab(sub.id)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-md text-[11.5px] transition flex items-center gap-1.5 ${
                                isSubActive
                                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                              }`}
                            >
                              <span className="text-slate-500 font-mono text-[9px]">―</span>
                              <span>{sub.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveTab(group.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition font-medium ${
                      activeTab === group.id 
                        ? 'bg-blue-600 text-white shadow' 
                        : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span>{group.label}</span>
                  </button>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-[#1f2937] bg-[#0f172a] text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow">
            {userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-slate-200 truncate">{userName}</div>
            <div className="text-[10px] text-emerald-400 font-mono truncate">● {userRole}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
