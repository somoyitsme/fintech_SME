import React, { useState, useEffect } from 'react';
import { 
  Award, 
  UserCheck, 
  CheckCircle2, 
  DollarSign, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3,
  UserPlus,
  Lock,
  Save,
  Check,
  X
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HrmStaffPageProps {
  initialTab?: 'users' | 'roles' | 'commission';
}

export const HrmStaffPage: React.FC<HrmStaffPageProps> = ({ initialTab = 'users' }) => {
  const { metrics } = useStore();
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'commission'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // 1. Staff & Users State
  const [usersList, setUsersList] = useState([
    { id: 'usr-1', name: "MD Nazmul Hasan", email: "nazmul@dhakasilicon.com", phone: "+880 1711-000001", role: "Managing Director", dept: "Executive Management", baseSalary: 120000, commission: 0, status: "Active" },
    { id: 'usr-2', name: "Tanvir Ahmed", email: "tanvir@dhakasilicon.com", phone: "+880 1711-000002", role: "Senior Sales & Inventory Lead", dept: "Showroom & Wholesale Sales", baseSalary: 45000, commission: metrics.salesmanCommission, status: "Active" },
    { id: 'usr-3', name: "Sabbir Hossain", email: "sabbir@dhakasilicon.com", phone: "+880 1711-000003", role: "Hardware Engineer & RMA Lead", dept: "Technical Support", baseSalary: 38000, commission: 8500, status: "Active" },
    { id: 'usr-4', name: "Fahim Chowdhury", email: "fahim@dhakasilicon.com", phone: "+880 1711-000004", role: "Vault Keeper & Logistics Lead", dept: "Warehouse & Courier", baseSalary: 35000, commission: 6200, status: "Active" },
    { id: 'usr-5', name: "Rifat Jahan", email: "rifat@dhakasilicon.com", phone: "+880 1711-000005", role: "Head of Accounts & NBR VAT", dept: "Finance & Accounts", baseSalary: 42000, commission: 0, status: "Active" }
  ]);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState('Sales Executive');
  const [newUserSalary, setNewUserSalary] = useState('30000');

  // 2. Roles & Permissions State
  const [roles, setRoles] = useState([
    {
      id: 'role-1',
      name: 'Managing Director / Admin',
      description: 'Unrestricted system access across all financial, sales, inventory, and audit modules',
      permissions: { viewSales: true, createSales: true, viewCostPrice: true, approvePO: true, adjustStock: true, manageUsers: true, viewFinancials: true }
    },
    {
      id: 'role-2',
      name: 'Showroom Manager',
      description: 'Operational control over POS, product catalogs, customer credit limits, and staff shifts',
      permissions: { viewSales: true, createSales: true, viewCostPrice: true, approvePO: true, adjustStock: true, manageUsers: false, viewFinancials: true }
    },
    {
      id: 'role-3',
      name: 'Sales Executive',
      description: 'Front-desk point of sale, customer quotation issuance, and courier booking',
      permissions: { viewSales: true, createSales: true, viewCostPrice: false, approvePO: false, adjustStock: false, manageUsers: false, viewFinancials: false }
    },
    {
      id: 'role-4',
      name: 'Cashier',
      description: 'Cash drawer receipt settlement, daily register closing, and invoice printing',
      permissions: { viewSales: true, createSales: true, viewCostPrice: false, approvePO: false, adjustStock: false, manageUsers: false, viewFinancials: false }
    },
    {
      id: 'role-5',
      name: 'Vault Keeper / Logistics',
      description: 'Physical stock intake, barcode scanning, inter-branch transfers, and dispatch packing',
      permissions: { viewSales: false, createSales: false, viewCostPrice: false, approvePO: false, adjustStock: true, manageUsers: false, viewFinancials: false }
    }
  ]);

  const [roleSaveSuccess, setRoleSaveSuccess] = useState(false);

  // 3. Commission Agents State
  const [payoutNotification, setPayoutNotification] = useState<string | null>(null);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName) return;
    const newUser = {
      id: `usr-${Date.now()}`,
      name: newUserName,
      email: newUserEmail || `${newUserName.toLowerCase().replace(/\s+/g, '')}@dhakasilicon.com`,
      phone: newUserPhone || '+880 1700-000000',
      role: newUserRole,
      dept: 'Sales & Operations',
      baseSalary: parseFloat(newUserSalary) || 30000,
      commission: 0,
      status: 'Active'
    };
    setUsersList([...usersList, newUser]);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setShowAddUserModal(false);
  };

  const handleTogglePermission = (roleId: string, permKey: string) => {
    setRoles(prev => prev.map(r => {
      if (r.id === roleId) {
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [permKey]: !((r.permissions as any)[permKey])
          }
        };
      }
      return r;
    }));
  };

  const handlePayCommission = (agentName: string, amount: number) => {
    setPayoutNotification(`৳ ${amount.toLocaleString()} commission paid successfully to ${agentName} via bKash Merchant Payroll!`);
    setTimeout(() => setPayoutNotification(null), 5000);
  };

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-100 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-blue-500" />
            User Management & Sales Agents
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            System logins, role-based access control (RBAC), and 2.0% monthly sales commission payouts
          </p>
        </div>

        {activeTab === 'users' && (
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'users' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          All Users ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'roles' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Roles & Permissions Matrix
        </button>
        <button
          onClick={() => setActiveTab('commission')}
          className={`px-3 py-1.5 rounded-xl transition ${activeTab === 'commission' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
        >
          Sales Commission Agents (2.0%)
        </button>
      </div>

      {payoutNotification && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{payoutNotification}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 1: USERS DIRECTORY */}
      {/* ============================================================== */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">User Name</th>
                  <th className="py-3 px-3">Email & Contact</th>
                  <th className="py-3 px-3">Role & Title</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3 text-right">Base Salary (৳)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {usersList.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-xs">{s.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {s.id}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-300 font-mono text-[11px]">{s.email}</div>
                      <div className="text-[10px] text-slate-500">{s.phone}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-semibold text-[11px] border border-blue-500/20">
                        {s.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{s.dept}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-300">৳ {s.baseSalary.toLocaleString()}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        ● {s.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => alert(`User permissions and login details for ${s.name} are active.`)}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition"
                        title="Edit User"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 2: ROLES & PERMISSIONS */}
      {/* ============================================================== */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
              <div>
                <h2 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Role-Based Access Control (RBAC) Permissions Matrix
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Toggle fine-grained permissions for each user role</p>
              </div>
              <button
                onClick={() => {
                  setRoleSaveSuccess(true);
                  setTimeout(() => setRoleSaveSuccess(false), 3000);
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Permissions</span>
              </button>
            </div>

            {roleSaveSuccess && (
              <div className="mb-4 p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Role permission changes saved to system security configuration!</span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Role Title</th>
                    <th className="py-3 px-3 text-center">View Sales</th>
                    <th className="py-3 px-3 text-center">Create Invoice</th>
                    <th className="py-3 px-3 text-center">Cost Price</th>
                    <th className="py-3 px-3 text-center">Approve PO</th>
                    <th className="py-3 px-3 text-center">Stock Audit</th>
                    <th className="py-3 px-3 text-center">Manage Users</th>
                    <th className="py-3 px-3 text-center">Financials</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {roles.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs">{r.name}</div>
                        <div className="text-[10px] text-slate-400">{r.description}</div>
                      </td>
                      {['viewSales', 'createSales', 'viewCostPrice', 'approvePO', 'adjustStock', 'manageUsers', 'viewFinancials'].map((perm) => (
                        <td key={perm} className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={(r.permissions as any)[perm]}
                            onChange={() => handleTogglePermission(r.id, perm)}
                            className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-TAB 3: SALES COMMISSION AGENTS */}
      {/* ============================================================== */}
      {activeTab === 'commission' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-700">
              <div>
                <h2 className="font-bold text-white text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  Monthly Sales Commission Ledger (2.0% Incentive Policy)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Calculated automatically on confirmed wholesale hardware shipments</p>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Total Commission Accrued</div>
                <div className="text-base font-extrabold text-emerald-400 font-mono">
                  ৳ {(metrics.salesmanCommission + 14700).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Sales Agent</th>
                    <th className="py-3 px-3">Target / Branch</th>
                    <th className="py-3 px-3 text-right">Closed Sales (৳)</th>
                    <th className="py-3 px-3 text-center">Rate</th>
                    <th className="py-3 px-3 text-right">Earned Commission (৳)</th>
                    <th className="py-3 px-4 text-center">Settlement Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">Tanvir Ahmed</div>
                      <div className="text-[10px] text-slate-400">Senior Wholesale Lead</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">Multiplan & Corporate Accounts</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white">৳ {Math.round(metrics.totalSales * 0.65).toLocaleString()}</td>
                    <td className="py-3 px-3 text-center font-mono text-blue-400 font-bold">2.0%</td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-400">৳ {metrics.salesmanCommission.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handlePayCommission('Tanvir Ahmed', metrics.salesmanCommission)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10.5px] font-bold shadow transition flex items-center gap-1 mx-auto"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Pay Commission</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">Sabbir Hossain</div>
                      <div className="text-[10px] text-slate-400">RMA & Custom Rig Specialist</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">Banani Tech Lab & Walk-in High End</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white">৳ 425,000</td>
                    <td className="py-3 px-3 text-center font-mono text-blue-400 font-bold">2.0%</td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-400">৳ 8,500</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handlePayCommission('Sabbir Hossain', 8500)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10.5px] font-bold shadow transition flex items-center gap-1 mx-auto"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Pay Commission</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">Fahim Chowdhury</div>
                      <div className="text-[10px] text-slate-400">Logistics & E-Commerce Fulfillment</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">Pathao / Steadfast Dispatch Desk</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white">৳ 310,000</td>
                    <td className="py-3 px-3 text-center font-mono text-blue-400 font-bold">2.0%</td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-400">৳ 6,200</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handlePayCommission('Fahim Chowdhury', 6200)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10.5px] font-bold shadow transition flex items-center gap-1 mx-auto"
                      >
                        <DollarSign className="w-3 h-3" />
                        <span>Pay Commission</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e293b] border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddUserModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-500" />
              Register New System User
            </h2>
            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arifur Rahman"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Corporate Email</label>
                <input
                  type="email"
                  placeholder="e.g. arif@dhakasilicon.com"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Mobile Number</label>
                <input
                  type="text"
                  placeholder="e.g. +880 1711-123456"
                  value={newUserPhone}
                  onChange={e => setNewUserPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Assigned Role</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="Showroom Manager">Showroom Manager</option>
                    <option value="Sales Executive">Sales Executive</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Vault Keeper / Logistics">Vault Keeper / Logistics</option>
                    <option value="Hardware Engineer">Hardware Engineer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Base Salary (৳)</label>
                  <input
                    type="number"
                    value={newUserSalary}
                    onChange={e => setNewUserSalary(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow mt-3"
              >
                Create User & Generate Credentials
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
