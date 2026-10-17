import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  ShieldCheck, 
  Lock, 
  Plus, 
  Activity, 
  Key, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  UserX
} from 'lucide-react';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'Owner & Managing Director' | 'Salesman Lead' | 'Sales Representative' | 'Warehouse Clerk';
  status: 'Active' | 'Suspended';
  lastActive: string;
  permissions: {
    canViewBankRunway: boolean;
    canViewCOGSAndPnL: boolean;
    canCreateInvoices: boolean;
    canApplyDiscountsMax5Pct: boolean;
    canManageSuppliers: boolean;
    canExportFullDatabase: boolean;
  };
}

export const StaffManagementPage: React.FC = () => {
  const [selectedStaff, setSelectedStaff] = useState<StaffUser | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [staffList, setStaffList] = useState<StaffUser[]>([
    {
      id: 'u1',
      name: 'Farhan Chowdhury',
      email: 'director@dhakasilicon.com',
      role: 'Owner & Managing Director',
      status: 'Active',
      lastActive: 'Active Now',
      permissions: {
        canViewBankRunway: true,
        canViewCOGSAndPnL: true,
        canCreateInvoices: true,
        canApplyDiscountsMax5Pct: true,
        canManageSuppliers: true,
        canExportFullDatabase: true
      }
    },
    {
      id: 'u2',
      name: 'Tanvir Ahmed',
      email: 'tanvir@dhakasilicon.com',
      role: 'Salesman Lead',
      status: 'Active',
      lastActive: '12 min ago',
      permissions: {
        canViewBankRunway: false,
        canViewCOGSAndPnL: false,
        canCreateInvoices: true,
        canApplyDiscountsMax5Pct: true,
        canManageSuppliers: false,
        canExportFullDatabase: false
      }
    },
    {
      id: 'u3',
      name: 'Rafiqul Islam',
      email: 'rafiqul@dhakasilicon.com',
      role: 'Sales Representative',
      status: 'Active',
      lastActive: '45 min ago',
      permissions: {
        canViewBankRunway: false,
        canViewCOGSAndPnL: false,
        canCreateInvoices: true,
        canApplyDiscountsMax5Pct: true,
        canManageSuppliers: false,
        canExportFullDatabase: false
      }
    },
    {
      id: 'u4',
      name: 'Shakil Mahmud',
      email: 'shakil.warehouse@dhakasilicon.com',
      role: 'Warehouse Clerk',
      status: 'Active',
      lastActive: '2 hours ago',
      permissions: {
        canViewBankRunway: false,
        canViewCOGSAndPnL: false,
        canCreateInvoices: false,
        canApplyDiscountsMax5Pct: false,
        canManageSuppliers: false,
        canExportFullDatabase: false
      }
    }
  ]);

  const activityLogs = [
    { user: 'Tanvir Ahmed (Salesman Lead)', action: 'Issued Invoice #INV-DS-9421 to Apex Computer Systems for ৳ 267,400', time: '10:15 AM' },
    { user: 'Farhan Chowdhury (Owner / MD)', action: 'Approved Purchase Order PO-2026-ASUS-091 for ৳ 5.25M with Prime Bank LC', time: '09:40 AM' },
    { user: 'Rafiqul Islam (Sales Rep)', action: 'Updated Order #ORD-1045 delivery status to Shipped via RedX Courier', time: '09:12 AM' },
    { user: 'Shakil Mahmud (Warehouse)', action: 'Scanned inbound receipt of 200x Corsair DDR5 kits into Banani shelf #R2', time: 'Yesterday, 05:40 PM' },
    { user: 'Tanvir Ahmed (Salesman Lead)', action: 'Applied 3% authorized discount on invoice #INV-DS-9418', time: 'Yesterday, 03:22 PM' },
  ];

  const handleTogglePermission = (userId: string, permKey: keyof StaffUser['permissions']) => {
    setStaffList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          return {
            ...u,
            permissions: {
              ...u.permissions,
              [permKey]: !u.permissions[permKey]
            }
          };
        }
        return u;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f6fc]">
              User & Staff Management (RBAC)
            </h1>
            <span className="text-[11px] bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-mono font-semibold px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
              Admin Control Panel
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8b949e] mt-0.5">
            Configure employee accounts, assign Role-Based Access Control (RBAC) permissions, and inspect live activity logs.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      {/* Staff Accounts Table */}
      <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-[#30363d] flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Dhaka Silicon Employees & Roles
          </h2>
          <span className="text-xs text-slate-400 font-mono">{staffList.length} Accounts Registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#21262d] text-slate-400 font-semibold border-b border-slate-200 dark:border-[#30363d]">
              <tr>
                <th className="py-3 px-4">Employee Name</th>
                <th className="py-3 px-4">Role Assignment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4">Financial Access</th>
                <th className="py-3 px-4 text-right">RBAC Permissions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#30363d]">
              {staffList.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-[#21262d]/50 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800 dark:text-white">{user.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      user.role.includes('Owner')
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                        : user.role.includes('Salesman Lead')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {user.lastActive}
                  </td>
                  <td className="py-3.5 px-4">
                    {user.permissions.canViewBankRunway ? (
                      <span className="text-emerald-600 font-semibold text-[11px] flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Full Unrestricted
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-amber-500" /> Hidden / Protected
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedStaff(user)}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-400 text-xs font-semibold transition"
                    >
                      Edit Granular RBAC
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Activity Logs */}
      <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Staff Operational Activity Logs
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Security Audit Trail</span>
        </div>

        <div className="space-y-2.5">
          {activityLogs.map((log, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-[#21262d] border border-slate-100 dark:border-[#30363d] flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white">{log.user}:</span>{' '}
                <span className="text-slate-600 dark:text-slate-300">{log.action}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono shrink-0 ml-4">
                {log.time}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Granular Permission Edit Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#30363d]">
              <div>
                <h3 className="text-base font-bold">Granular RBAC Permissions</h3>
                <p className="text-xs text-slate-400">{selectedStaff.name} · {selectedStaff.role}</p>
              </div>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-mono">
                {selectedStaff.role}
              </span>
            </div>

            <div className="my-4 space-y-3 text-xs">
              {[
                { key: 'canViewBankRunway', title: 'View Bank Liquidity & Cash Runway', desc: 'Allow viewing private company bank balance and runway months' },
                { key: 'canViewCOGSAndPnL', title: 'View Procurement COGS & P&L Margins', desc: 'Allow seeing wholesale supplier purchase costs and net margins' },
                { key: 'canCreateInvoices', title: 'Create Customer Invoices (POS)', desc: 'Process sales and issue official VAT-compliant bills' },
                { key: 'canApplyDiscountsMax5Pct', title: 'Apply Discounts (Capped at 5%)', desc: 'Prevent arbitrary price overrides by salesmen' },
                { key: 'canManageSuppliers', title: 'Manage Supplier Contracts & POs', desc: 'Issue procurement purchase orders to vendors' },
                { key: 'canExportFullDatabase', title: 'Export Full Database & Customer CRM', desc: 'Download CSV dumps of clients, financials, and logs' },
              ].map((perm) => (
                <div
                  key={perm.key}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-[#21262d] border border-slate-100 dark:border-[#30363d] flex items-center justify-between"
                >
                  <div className="pr-3">
                    <div className="font-bold text-slate-900 dark:text-white">{perm.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{perm.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={(selectedStaff.permissions as any)[perm.key]}
                    onChange={() => handleTogglePermission(selectedStaff.id, perm.key as any)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-[#30363d] flex justify-end gap-2">
              <button
                onClick={() => setSelectedStaff(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Save & Apply RBAC Policies
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
