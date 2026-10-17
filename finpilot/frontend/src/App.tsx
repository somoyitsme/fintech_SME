import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';

// Core ERP Pages
import { DashboardPage } from './pages/DashboardPage';
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

export function App() {
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    role: string;
    email: string;
  } | null>(() => {
    const saved = localStorage.getItem('dhaka_silicon_logged_user_v2');
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

  const companyName = "Dhaka Silicon & Hardware Ltd.";
  const industry = "Computer Wholesale & Retail";
  const currency = "BDT";
  const healthScore = 92;

  const handleLogout = () => {
    localStorage.removeItem('dhaka_silicon_logged_user_v2');
    setCurrentUser(null);
  };

  const handleLogin = (user: { name: string; role: string; email: string }) => {
    localStorage.setItem('dhaka_silicon_logged_user_v2', JSON.stringify(user));
    setCurrentUser(user);
    setActiveTab('home-dashboard');
  };

  const handleSwitchUser = (user: { name: string; role: string; email: string }) => {
    localStorage.setItem('dhaka_silicon_logged_user_v2', JSON.stringify(user));
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
          <DashboardPage 
            key="home-dashboard"
            onNavigateTab={setActiveTab} 
            userRole={currentUser.role}
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
          <DashboardPage 
            key="default-dashboard"
            onNavigateTab={setActiveTab} 
            userRole={currentUser.role}
            userName={currentUser.name}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Expandable Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={currentUser.role}
        userName={currentUser.name}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          companyName={companyName}
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
        />

        <main className="p-6 ml-64 flex-1">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

export default App;
