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
            onNavigateTab={setActiveTab} 
            userRole={currentUser.role}
            userName={currentUser.name}
          />
        );

      // 2. User Management & HRM
      case 'users-list':
      case 'users-roles':
      case 'users-commission':
      case 'hrm-staff':
      case 'admin-staff':
        return <HrmStaffPage />;

      // 3. Contacts
      case 'contacts-suppliers':
        return <ContactsPage initialTab="suppliers" onNavigateTab={setActiveTab} />;
      case 'contacts-customers':
      case 'sales-crm':
        return <ContactsPage initialTab="customers" onNavigateTab={setActiveTab} />;
      case 'contacts-groups':
        return <ContactsPage initialTab="groups" onNavigateTab={setActiveTab} />;
      case 'contacts-import':
        return <ContactsPage initialTab="import" onNavigateTab={setActiveTab} />;

      // 4. Products
      case 'products-list':
      case 'sales-catalog':
        return <ProductsPage initialTab="list" onNavigateTab={setActiveTab} />;
      case 'products-add':
        return <ProductsPage initialTab="add" onNavigateTab={setActiveTab} />;
      case 'products-prices':
        return <ProductsPage initialTab="list" onNavigateTab={setActiveTab} />;
      case 'products-labels':
        return <ProductsPage initialTab="labels" onNavigateTab={setActiveTab} />;
      case 'products-categories':
        return <ProductsPage initialTab="categories" onNavigateTab={setActiveTab} />;
      case 'products-brands':
        return <ProductsPage initialTab="brands" onNavigateTab={setActiveTab} />;
      case 'products-warranties':
        return <ProductsPage initialTab="warranties" onNavigateTab={setActiveTab} />;

      // 5. Purchases
      case 'purchases-list':
      case 'admin-suppliers':
        return <PurchasesPage initialTab="list" onNavigateTab={setActiveTab} />;
      case 'purchases-add':
        return <PurchasesPage initialTab="add" onNavigateTab={setActiveTab} />;
      case 'purchases-returns':
        return <PurchasesPage initialTab="returns" onNavigateTab={setActiveTab} />;

      // 6. Sell & POS
      case 'sell-all':
      case 'sales-orders':
        return <SellPage initialTab="all" onNavigateTab={setActiveTab} />;
      case 'sell-add':
      case 'sell-pos':
      case 'sell-pos-list':
      case 'sales-pos':
        return <SellPage initialTab="pos" onNavigateTab={setActiveTab} />;
      case 'sell-shipments':
        return <SellPage initialTab="shipments" onNavigateTab={setActiveTab} />;
      case 'sell-quotations':
        return <SellPage initialTab="quotations" onNavigateTab={setActiveTab} />;
      case 'sell-drafts':
      case 'sell-returns':
      case 'sell-discounts':
      case 'sell-import':
        return <SellPage initialTab="all" onNavigateTab={setActiveTab} />;

      // 7. Stock Transfers
      case 'stock-transfers-list':
      case 'stock-transfers-add':
        return <StockTransfersPage />;

      // 8. Stock Adjustment
      case 'stock-adjustments-list':
      case 'stock-adjustments-add':
        return <StockAdjustmentsPage />;

      // 9. Expenses
      case 'expenses-list':
      case 'expenses-add':
      case 'expenses-categories':
        return <ExpensesPage />;

      // 10. Payment Accounts
      case 'accounts-list':
      case 'accounts-balancesheet':
      case 'accounts-trialbalance':
      case 'accounts-cashflow':
      case 'admin-financials':
        return <PaymentAccountsPage />;

      // 11. Reports
      case 'reports-profit-loss':
      case 'reports-purchases-sales':
        return <ReportsPage initialTab="profit-loss" />;
      case 'reports-tax':
        return <ReportsPage initialTab="tax" />;
      case 'reports-contacts':
      case 'reports-stock':
      case 'reports-trending':
        return <ReportsPage initialTab="stock" />;

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
