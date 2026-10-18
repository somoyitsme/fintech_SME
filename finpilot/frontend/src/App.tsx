import React, { useState } from 'react';
import { AppSidebar } from './components/AppSidebar';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';

// Core ERP Pages
import { ExecutiveDashboardPage } from './pages/ExecutiveDashboardPage';
import { ContactsPage } from './pages/ContactsPage';
import { ProductsPage } from './pages/ProductsPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { SellPage } from './pages/SellPage';
import { StockTransfersPage } from './pages/StockTransfersPage';
import { StockAdjustmentsPage } from './pages/StockAdjustmentsPage';
import { PaymentAccountsPage } from './pages/PaymentAccountsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { HrmStaffPage } from './pages/HrmStaffPage';
import { EssentialsPage } from './pages/EssentialsPage';
import { SystemSettingsPage } from './pages/SystemSettingsPage';
import { DatabaseAuditPage } from './pages/DatabaseAuditPage';

const getPageTitle = (activeTab: string) => {
  if (activeTab.startsWith('sell-')) return activeTab === 'sell-pos' ? 'Point of sale' : 'Sales & orders';
  if (activeTab.startsWith('products-')) return 'Products';
  if (activeTab.startsWith('purchases-')) return 'Purchasing';
  if (activeTab.startsWith('stock-transfers-')) return 'Stock transfers';
  if (activeTab.startsWith('stock-adjustments-')) return 'Stock adjustments';
  if (activeTab.startsWith('contacts-')) return 'Contacts';
  if (activeTab.startsWith('accounts-')) return 'Accounts';
  if (activeTab.startsWith('expenses-')) return 'Expenses';
  if (activeTab.startsWith('reports-')) return 'Reports';
  if (activeTab.startsWith('users-')) return 'Staff & access';
  if (activeTab === 'essentials-todo') return 'Operations checklist';
  if (activeTab === 'admin-database') return 'Audit exports';
  if (activeTab.startsWith('settings-')) return 'Settings';
  return 'Dashboard';
};

export function App() {
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    role: string;
    email: string;
  } | null>(() => {
    const saved = localStorage.getItem('dhaka_silicon_logged_user_v2') || localStorage.getItem('dhaka_silicon_logged_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      name: "MD Nazmul Hasan",
      role: "Managing Director",
      email: "nazmul@dhakasilicon.com"
    };
  });

  const [activeTab, setActiveTab] = useState<string>('home-dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(
    () => localStorage.getItem('finpilot_sidebar_collapsed') === 'true'
  );

  const companyName = "Dhaka Silicon & Hardware Ltd.";
  const industry = "Computer Wholesale & Retail";
  const currency = "BDT";
  const healthScore = 92;

  const handleLogout = () => {
    localStorage.removeItem('dhaka_silicon_logged_user_v2');
    localStorage.removeItem('dhaka_silicon_logged_user');
    setCurrentUser(null);
  };

  const handleLogin = (user: { name: string; role: string; email: string }) => {
    localStorage.setItem('dhaka_silicon_logged_user_v2', JSON.stringify(user));
    localStorage.setItem('dhaka_silicon_logged_user', JSON.stringify(user));
    setCurrentUser(user);
    setActiveTab('home-dashboard');
  };

  const handleSwitchUser = (user: { name: string; role: string; email: string }) => {
    localStorage.setItem('dhaka_silicon_logged_user_v2', JSON.stringify(user));
    localStorage.setItem('dhaka_silicon_logged_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      // 1. Home Dashboard
      case 'home-dashboard':
      case 'admin-dashboard':
      case 'sales-dashboard':
        return (
          <ExecutiveDashboardPage 
            key="home-dashboard"
            onNavigateTab={setActiveTab} 
            userName={currentUser.name}
          />
        );

      // 2. User Management & HRM
      case 'users-list':
      case 'admin-staff':
        return <HrmStaffPage key="users-list" initialTab="users" />;
      case 'users-roles':
        return <HrmStaffPage key="users-roles" initialTab="roles" />;
      case 'users-commission':
      case 'hrm-staff':
        return <HrmStaffPage key="users-commission" initialTab="commission" />;

      // 3. Contacts
      case 'contacts-suppliers':
        return <ContactsPage key="contacts-suppliers" initialTab="suppliers" onNavigateTab={setActiveTab} />;
      case 'contacts-customers':
      case 'sales-crm':
        return <ContactsPage key="contacts-customers" initialTab="customers" onNavigateTab={setActiveTab} />;
      case 'contacts-groups':
        return <ContactsPage key="contacts-groups" initialTab="groups" onNavigateTab={setActiveTab} />;
      case 'contacts-import':
        return <ContactsPage key="contacts-import" initialTab="import" onNavigateTab={setActiveTab} />;

      // 4. Products
      case 'products-list':
      case 'sales-catalog':
        return <ProductsPage key="products-list" initialTab="list" onNavigateTab={setActiveTab} />;
      case 'products-add':
        return <ProductsPage key="products-add" initialTab="add" onNavigateTab={setActiveTab} />;
      case 'products-prices':
        return <ProductsPage key="products-prices" initialTab="prices" onNavigateTab={setActiveTab} />;
      case 'products-labels':
        return <ProductsPage key="products-labels" initialTab="labels" onNavigateTab={setActiveTab} />;
      case 'products-variations':
        return <ProductsPage key="products-variations" initialTab="variations" onNavigateTab={setActiveTab} />;
      case 'products-import':
        return <ProductsPage key="products-import" initialTab="import" onNavigateTab={setActiveTab} />;
      case 'products-units':
        return <ProductsPage key="products-units" initialTab="units" onNavigateTab={setActiveTab} />;
      case 'products-categories':
        return <ProductsPage key="products-categories" initialTab="categories" onNavigateTab={setActiveTab} />;
      case 'products-brands':
        return <ProductsPage key="products-brands" initialTab="brands" onNavigateTab={setActiveTab} />;
      case 'products-warranties':
        return <ProductsPage key="products-warranties" initialTab="warranties" onNavigateTab={setActiveTab} />;

      // 5. Purchases
      case 'purchases-list':
      case 'admin-suppliers':
        return <PurchasesPage key="purchases-list" initialTab="list" onNavigateTab={setActiveTab} />;
      case 'purchases-add':
        return <PurchasesPage key="purchases-add" initialTab="add" onNavigateTab={setActiveTab} />;
      case 'purchases-returns':
        return <PurchasesPage key="purchases-returns" initialTab="returns" onNavigateTab={setActiveTab} />;

      // 6. Sell & POS
      case 'sell-all':
      case 'sales-orders':
        return <SellPage key="sell-all" initialTab="all" onNavigateTab={setActiveTab} />;
      case 'sell-add':
      case 'sell-pos':
      case 'sales-pos':
        return <SellPage key="sell-pos" initialTab="pos" onNavigateTab={setActiveTab} />;
      case 'sell-pos-list':
        return <SellPage key="sell-pos-list" initialTab="pos-list" onNavigateTab={setActiveTab} />;
      case 'sell-drafts':
        return <SellPage key="sell-drafts" initialTab="drafts" onNavigateTab={setActiveTab} />;
      case 'sell-quotations':
        return <SellPage key="sell-quotations" initialTab="quotations" onNavigateTab={setActiveTab} />;
      case 'sell-returns':
        return <SellPage key="sell-returns" initialTab="returns" onNavigateTab={setActiveTab} />;
      case 'sell-shipments':
        return <SellPage key="sell-shipments" initialTab="shipments" onNavigateTab={setActiveTab} />;
      case 'sell-discounts':
        return <SellPage key="sell-discounts" initialTab="discounts" onNavigateTab={setActiveTab} />;
      case 'sell-import':
        return <SellPage key="sell-import" initialTab="import" onNavigateTab={setActiveTab} />;

      // 7. Stock Transfers
      case 'stock-transfers-list':
        return <StockTransfersPage key="stock-transfers-list" initialTab="list" />;
      case 'stock-transfers-add':
        return <StockTransfersPage key="stock-transfers-add" initialTab="add" />;

      // 8. Stock Adjustment
      case 'stock-adjustments-list':
        return <StockAdjustmentsPage key="stock-adjustments-list" initialTab="list" />;
      case 'stock-adjustments-add':
        return <StockAdjustmentsPage key="stock-adjustments-add" initialTab="add" />;

      // 9. Expenses
      case 'expenses-list':
        return <ExpensesPage key="expenses-list" initialTab="list" />;
      case 'expenses-add':
        return <ExpensesPage key="expenses-add" initialTab="add" />;
      case 'expenses-categories':
        return <ExpensesPage key="expenses-categories" initialTab="categories" />;

      // 10. Payment Accounts
      case 'accounts-list':
      case 'admin-financials':
        return <PaymentAccountsPage key="accounts-list" initialTab="list" />;
      case 'accounts-balancesheet':
        return <PaymentAccountsPage key="accounts-balancesheet" initialTab="balancesheet" />;
      case 'accounts-trialbalance':
        return <PaymentAccountsPage key="accounts-trialbalance" initialTab="trialbalance" />;
      case 'accounts-cashflow':
        return <PaymentAccountsPage key="accounts-cashflow" initialTab="cashflow" />;

      // 11. Reports
      case 'reports-profit-loss':
        return <ReportsPage key="reports-profit-loss" initialTab="profit-loss" />;
      case 'reports-purchases-sales':
        return <ReportsPage key="reports-purchases-sales" initialTab="purchases-sales" />;
      case 'reports-tax':
        return <ReportsPage key="reports-tax" initialTab="tax" />;
      case 'reports-contacts':
        return <ReportsPage key="reports-contacts" initialTab="contacts" />;
      case 'reports-stock':
        return <ReportsPage key="reports-stock" initialTab="stock" />;
      case 'reports-trending':
        return <ReportsPage key="reports-trending" initialTab="trending" />;

      // 12. Settings, User Manual & Audit
      case 'notifications-templates':
      case 'user-manual':
      case 'settings-business':
      case 'admin-settings':
        return <SystemSettingsPage />;
      case 'admin-database':
        return <DatabaseAuditPage />;

      // 13. Essentials
      case 'essentials-todo':
        return <EssentialsPage />;

      default:
        return (
          <ExecutiveDashboardPage 
            key="default-dashboard"
            onNavigateTab={setActiveTab} 
            userName={currentUser.name}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(212,163,115,0.12),_transparent_30%),var(--bg-app)] text-content-primary flex transition-colors duration-200">
      <AppSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={currentUser.role}
        userName={currentUser.name}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => {
          const nextCollapsed = !isSidebarCollapsed;
          localStorage.setItem('finpilot_sidebar_collapsed', String(nextCollapsed));
          setIsSidebarCollapsed(nextCollapsed);
        }}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          companyName={companyName}
          pageTitle={getPageTitle(activeTab)}
          industry={industry}
          currency={currency}
          healthScore={healthScore}
          userName={currentUser.name}
          userRole={currentUser.role}
          userEmail={currentUser.email}
          onLogout={handleLogout}
          onSwitchUser={handleSwitchUser}
          onNavigateTab={setActiveTab}
          onOpenPos={() => setActiveTab('sell-pos')}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        <main className="flex-1 w-full max-w-[1700px] mx-auto p-3 sm:p-5 lg:p-6">
          <div className="space-y-6">
            {renderActivePage()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
