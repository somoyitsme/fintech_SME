import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Settings, 
  Database, 
  Building2, 
  Cpu, 
  Bot, 
  Award, 
  Truck, 
  Layers, 
  UserCheck, 
  Receipt,
  FileSpreadsheet,
  ChevronDown
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole?: string;
  userName?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  userRole = "Salesman",
  userName = "Tanvir Ahmed"
}) => {
  const isOwner = userRole.toLowerCase().includes('owner') || 
                  userRole.toLowerCase().includes('director') || 
                  userRole.toLowerCase().includes('admin');

  // Menu items for Admin / Business Owner View
  const adminMenuItems: MenuItem[] = [
    { id: 'admin-dashboard', label: 'Ecommerce Dashboard', icon: LayoutDashboard },
    { id: 'admin-financials', label: 'Financial & Profit Analytics', icon: TrendingUp },
    { id: 'admin-suppliers', label: 'Supplier & Purchase Mgmt', icon: Building2 },
    { id: 'admin-staff', label: 'User & Staff Management', icon: Users },
    { id: 'admin-settings', label: 'System & Integration Settings', icon: Settings },
    { id: 'admin-database', label: 'Full Database & Audit', icon: Database },
  ];

  // Menu items for Salesman / Staff View
  const salesmanMenuItems: MenuItem[] = [
    { id: 'sales-dashboard', label: 'Personal Performance', icon: Award },
    { id: 'sales-pos', label: 'POS / New Order Entry', icon: ShoppingBag },
    { id: 'sales-orders', label: 'Order Management', icon: Truck },
    { id: 'sales-catalog', label: 'Catalog & Stock Check', icon: Layers },
    { id: 'sales-crm', label: 'Customer CRM', icon: Users },
  ];

  const currentMenu = isOwner ? adminMenuItems : salesmanMenuItems;
  const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <aside className="w-64 bg-[#161b22] border-r border-[#30363d] flex flex-col justify-between h-screen fixed left-0 top-0 z-20">
      <div className="overflow-y-auto">
        {/* Brand Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-[#30363d]">
          <div className="w-8 h-8 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-[#f0f6fc] text-sm tracking-tight flex items-center gap-1.5">
              Dhaka Silicon <span className="text-[10px] bg-[#388bfd]/15 text-[#58a6ff] px-1.5 py-0.2 rounded font-mono font-medium">PC Parts</span>
            </div>
            <div className="text-[11px] text-[#8b949e]">
              {isOwner ? "Admin Control Center" : "Sales Terminal"}
            </div>
          </div>
        </div>

        {/* Quick System Tag */}
        <div className="px-5 py-2.5 border-b border-[#30363d]/50 bg-[#161b22] flex items-center justify-between text-[11px] text-[#8b949e]">
          <span className="flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Live Portal
          </span>
          <span className="font-mono text-[#58a6ff] text-[10px] bg-[#388bfd]/10 px-1.5 py-0.5 rounded border border-[#388bfd]/20">
            Dhaka, BD
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          <div className="px-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#8b949e]">
            {isOwner ? "Owner & Admin Modules" : "Sales Transactions"}
          </div>

          {currentMenu.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d] shadow-sm font-semibold'
                    : 'text-[#8b949e] hover:bg-[#21262d]/60 hover:text-[#e6edf3]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#58a6ff]' : 'text-[#8b949e]'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-[#30363d]/60 text-center">
        <div className="text-[11px] text-[#8b949e] font-mono">
          Dhaka Silicon ERP v2.4
        </div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          Standalone Wholesale Management
        </div>
      </div>
    </aside>
  );
};
