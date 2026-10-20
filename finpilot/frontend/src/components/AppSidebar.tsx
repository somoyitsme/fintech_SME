import React from 'react';
import {
  BarChart3,
  CheckSquare,
  CreditCard,
  Database,
  Home,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Package,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Truck,
  UserCheck,
  Users,
  WalletCards,
} from 'lucide-react';

interface AppSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: string;
  userName?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ElementType;
  matches?: string[];
}

const navigation: { label: string; items: NavigationItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { id: 'home-dashboard', label: 'Dashboard', icon: Home },
      { id: 'agent-copilot', label: 'FinPilot AI Copilot', icon: Sparkles, matches: ['agent-'] },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { id: 'sell-all', label: 'Sales & orders', icon: ShoppingBag, matches: ['sell-'] },
      { id: 'sell-pos', label: 'Point of sale', icon: WalletCards, matches: ['sell-pos'] },
      { id: 'purchases-list', label: 'Purchasing', icon: Layers, matches: ['purchases-'] },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { id: 'products-list', label: 'Products', icon: Package, matches: ['products-'] },
      { id: 'stock-transfers-list', label: 'Stock transfers', icon: Truck, matches: ['stock-transfers-'] },
      { id: 'stock-adjustments-list', label: 'Stock adjustments', icon: SlidersHorizontal, matches: ['stock-adjustments-'] },
    ],
  },
  {
    label: 'Relationships',
    items: [
      { id: 'contacts-customers', label: 'Customers', icon: Users, matches: ['contacts-customers', 'contacts-groups', 'contacts-import'] },
      { id: 'contacts-suppliers', label: 'Suppliers', icon: Users, matches: ['contacts-suppliers'] },
    ],
  },
  {
    label: 'Finance & reports',
    items: [
      { id: 'accounts-list', label: 'Accounts', icon: CreditCard, matches: ['accounts-'] },
      { id: 'expenses-list', label: 'Expenses', icon: WalletCards, matches: ['expenses-'] },
      { id: 'reports-profit-loss', label: 'Reports', icon: BarChart3, matches: ['reports-'] },
    ],
  },
  {
    label: 'Administration',
    items: [
      { id: 'users-list', label: 'Staff & access', icon: UserCheck, matches: ['users-', 'hrm-'] },
      { id: 'essentials-todo', label: 'Operations checklist', icon: CheckSquare },
      { id: 'admin-database', label: 'Audit exports', icon: Database },
      { id: 'settings-business', label: 'Settings', icon: Settings, matches: ['settings-', 'admin-settings', 'notifications-', 'user-manual'] },
    ],
  },
];

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole = 'Managing Director',
  userName = 'MD Nazmul Hasan',
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const isSalesman = userRole.toLowerCase().includes('sales');

  const visibleSections = navigation
    .map((section) => {
      const filteredItems = section.items
        .map((item) => {
          if (isSalesman && item.id === 'home-dashboard') {
            return {
              ...item,
              id: 'sales-dashboard',
              label: 'Sales Dashboard',
              matches: ['sales-dashboard', 'home-dashboard']
            };
          }
          return item;
        })
        .filter((item) => {
          if (isSalesman) {
            const allowedForSalesman = [
              'sales-dashboard',
              'home-dashboard',
              'agent-copilot',
              'sell-all',
              'sell-pos',
              'products-list',
              'stock-transfers-list',
              'stock-adjustments-list',
              'contacts-customers',
              'essentials-todo',
            ];
            return allowedForSalesman.includes(item.id);
          }
          return true;
        });
      return { ...section, items: filteredItems };
    })
    .filter((section) => section.items.length > 0);

  const navigate = (tabId: string) => {
    setActiveTab(tabId);
    onCloseMobile?.();
  };

  const isActive = (item: NavigationItem) =>
    activeTab === item.id || item.matches?.some((match) => activeTab.startsWith(match)) || false;

  return (
    <>
      {isMobileOpen && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-stone-950/45 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        aria-label="Primary navigation"
        className={`${isCollapsed ? 'w-[260px] lg:w-[76px]' : 'w-[260px]'} flex-none bg-surface/95 backdrop-blur-sm border-r border-boundary-subtle h-screen fixed lg:sticky top-0 z-50 flex flex-col transition-[width,transform] duration-200 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl shadow-stone-900/10' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className={`flex h-[72px] items-center border-b border-boundary-subtle bg-surface-secondary/50 ${
          isCollapsed ? 'justify-center px-4 lg:px-2' : 'justify-between px-4'
        }`}>
          <div className={`flex min-w-0 items-center ${isCollapsed ? 'lg:justify-center' : ''}`}>
            <div className="group/brand relative h-9 w-9 shrink-0">
              <div
                title={isCollapsed ? 'Now_or_Never Console · Business operations' : undefined}
                className={`flex h-9 w-9 items-center justify-center rounded-xl bg-brand-ochre text-xs font-extrabold tracking-tight text-stone-950 shadow-sm transition-opacity ${
                  isCollapsed ? 'lg:group-hover/brand:opacity-0 lg:group-focus-within/brand:opacity-0' : ''
                }`}
              >
                NON
              </div>
              {isCollapsed && onToggleCollapse && (
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  aria-label="Expand sidebar"
                  aria-expanded={false}
                  title="Expand sidebar"
                  className="absolute inset-0 hidden h-9 w-9 items-center justify-center rounded-xl border border-boundary-strong bg-surface text-content-secondary opacity-0 shadow-sm transition hover:bg-surface-hover hover:text-content-primary focus:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ochre lg:flex lg:group-hover/brand:opacity-100 lg:group-focus-within/brand:opacity-100"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className={`ml-2.5 min-w-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className="truncate text-xs font-semibold text-content-primary">Now_or_Never Console</p>
              <p className="text-[10px] uppercase tracking-[0.12em] text-content-muted">
                {isSalesman ? 'Salesman Terminal' : 'Executive Console'}
              </p>
            </div>
          </div>
          {onToggleCollapse && !isCollapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Collapse sidebar"
              aria-expanded={true}
              title="Collapse sidebar"
              className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-transparent text-content-muted transition hover:border-boundary-subtle hover:bg-surface hover:text-content-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ochre lg:flex"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        <nav className={`flex-1 overflow-y-auto py-4 ${isCollapsed ? 'px-2 lg:px-2' : 'px-3'}`}>
          {visibleSections.map((section) => (
            <section key={section.label} className={`mb-5 last:mb-0 ${isCollapsed ? 'lg:mb-3' : ''}`}>
              <p className={`px-2.5 mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-content-muted ${isCollapsed ? 'lg:hidden' : ''}`}>{section.label}</p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item);
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigate(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      aria-label={isCollapsed ? item.label : undefined}
                      className={`w-full min-h-10 rounded-xl flex items-center text-left text-xs font-medium transition-all duration-150 ${isCollapsed ? 'justify-center px-1 lg:px-0' : 'gap-2.5 px-2.5'} ${
                        active
                          ? 'bg-brand-ochre/12 text-content-primary border border-brand-ochre/30 shadow-sm'
                          : 'text-content-secondary hover:bg-surface-secondary hover:text-content-primary'
                      }`}
                    >
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-brand-ochre/18' : 'bg-surface-secondary'}`}>
                        <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-brand-ochreDeep dark:text-brand-ochre' : 'text-content-muted'}`} />
                      </span>
                      <span className={`truncate ${isCollapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <div className={`border-t border-boundary-subtle bg-surface-secondary/40 ${isCollapsed ? 'p-2' : 'p-3'}`}>
          <div className={`flex items-center rounded-xl border border-boundary-subtle bg-surface shadow-sm ${isCollapsed ? 'justify-center p-1.5 lg:border-transparent lg:bg-transparent lg:shadow-none' : 'gap-2.5 px-2.5 py-2.5'}`}>
            <div
              title={isCollapsed ? `${userName} · ${userRole}` : undefined}
              className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold ${
                isSalesman
                  ? 'bg-brand-sage text-stone-950'
                  : 'bg-brand-ochre text-stone-950'
              }`}
            >
              {userName.split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className={`min-w-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className="text-xs font-semibold text-content-primary truncate">{userName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                  isSalesman
                    ? 'bg-brand-sage/30 text-stone-900 dark:text-brand-sage'
                    : 'bg-brand-ochre/20 text-brand-ochreDeep dark:text-brand-ochre'
                }`}>
                  {isSalesman ? 'Sales Staff (POS)' : 'Executive (Full)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
