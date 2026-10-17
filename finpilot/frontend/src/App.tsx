import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LoginPage } from './pages/LoginPage';

// Admin / Business Owner Pages
import { DashboardPage } from './pages/DashboardPage';
import { FinancialAnalyticsPage } from './pages/FinancialAnalyticsPage';
import { SupplierManagementPage } from './pages/SupplierManagementPage';
import { StaffManagementPage } from './pages/StaffManagementPage';
import { SystemSettingsPage } from './pages/SystemSettingsPage';
import { DatabaseAuditPage } from './pages/DatabaseAuditPage';

// Salesman / Staff Pages
import { SalesmanDashboardPage } from './pages/SalesmanDashboardPage';
import { SalesmanPosPage } from './pages/SalesmanPosPage';
import { SalesmanOrdersPage } from './pages/SalesmanOrdersPage';
import { SalesmanCatalogPage } from './pages/SalesmanCatalogPage';
import { SalesmanCrmPage } from './pages/SalesmanCrmPage';

export function App() {
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    role: string;
    email: string;
  } | null>(() => {
    const saved = localStorage.getItem('dhaka_silicon_logged_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const isOwner = currentUser?.role.toLowerCase().includes('owner') || 
                  currentUser?.role.toLowerCase().includes('director') || 
                  currentUser?.role.toLowerCase().includes('admin');

  // Initial active tab based on role
  const [activeTab, setActiveTab] = useState<string>(isOwner ? 'admin-dashboard' : 'sales-dashboard');

  const companyName = "Dhaka Silicon & Hardware Ltd.";
  const industry = "Computer Wholesale & Retail";
  const currency = "BDT";
  const healthScore = 92;

  const handleLogout = () => {
    localStorage.removeItem('dhaka_silicon_logged_user');
    setCurrentUser(null);
  };

  const handleLogin = (user: { name: string; role: string; email: string }) => {
    setCurrentUser(user);
    const newIsOwner = user.role.toLowerCase().includes('owner') || 
                       user.role.toLowerCase().includes('director') || 
                       user.role.toLowerCase().includes('admin');
    if (newIsOwner) {
      setActiveTab('admin-dashboard');
    } else {
      setActiveTab('sales-dashboard');
    }
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderActivePage = () => {
    if (isOwner) {
      // Admin / Business Owner Views
      switch (activeTab) {
        case 'admin-dashboard':
          return (
            <DashboardPage 
              onNavigateTab={setActiveTab} 
              userRole={currentUser.role}
              userName={currentUser.name}
            />
          );
        case 'admin-financials':
          return <FinancialAnalyticsPage />;
        case 'admin-suppliers':
          return <SupplierManagementPage />;
        case 'admin-staff':
          return <StaffManagementPage />;
        case 'admin-settings':
          return <SystemSettingsPage />;
        case 'admin-database':
          return <DatabaseAuditPage />;
        default:
          return (
            <DashboardPage 
              onNavigateTab={setActiveTab} 
              userRole={currentUser.role}
              userName={currentUser.name}
            />
          );
      }
    } else {
      // Salesman / Staff Views
      switch (activeTab) {
        case 'sales-dashboard':
          return (
            <SalesmanDashboardPage 
              onNavigateTab={setActiveTab} 
            />
          );
        case 'sales-pos':
          return <SalesmanPosPage />;
        case 'sales-orders':
          return <SalesmanOrdersPage />;
        case 'sales-catalog':
          return <SalesmanCatalogPage />;
        case 'sales-crm':
          return <SalesmanCrmPage />;
        default:
          return (
            <SalesmanDashboardPage 
              onNavigateTab={setActiveTab} 
            />
          );
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Fixed Left Sidebar with Role-Based Navigation */}
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
        />

        <main className="p-6 ml-64 flex-1">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

export default App;
