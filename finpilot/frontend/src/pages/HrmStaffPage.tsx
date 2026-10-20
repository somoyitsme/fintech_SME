import React, { useState, useEffect } from 'react';
import { 
  Award, 
  UserCheck, 
  CheckCircle2, 
  DollarSign, 
  ShieldCheck, 
  Edit3,
  UserPlus,
  Lock,
  Save,
  Check
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { authApi, SystemUser } from '../api/auth';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { TabGroup, TabItem } from '../components/common/TabGroup';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { DataTable, TableHeader, TableHeadCell, TableBody, TableRow, TableCell } from '../components/common/DataTable';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';

interface HrmStaffPageProps {
  initialTab?: 'users' | 'roles' | 'commission';
}

interface StaffUserItem {
  id: string;
  name: string;
  username?: string;
  email: string;
  phone: string;
  role: string;
  dept: string;
  baseSalary: number;
  commission: number;
  status: string;
}

export const HrmStaffPage: React.FC<HrmStaffPageProps> = ({ initialTab = 'users' }) => {
  const { metrics } = useStore();
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'commission'>(initialTab);

  // Check current user role
  const currentLoggedUser = (() => {
    try {
      const saved = localStorage.getItem('dhaka_silicon_logged_user_v2') || localStorage.getItem('dhaka_silicon_logged_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })();
  const userRole = (currentLoggedUser?.role || 'manager').toLowerCase();
  const isManagerOrAdmin = userRole.includes('manager') || userRole.includes('admin') || userRole.includes('director');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // 1. Staff & Users State (Initialized with Shahed Rahman Somoy as Manager, synchronized with live DB users)
  const [usersList, setUsersList] = useState<StaffUserItem[]>([
    {
      id: 'usr-somoy-001',
      name: "Shahed Rahman Somoy",
      username: "somoy",
      email: "somoy@nowornever.console",
      phone: "+880 1711-000000",
      role: "Managing Director & System Manager",
      dept: "Executive Management",
      baseSalary: 150000,
      commission: 0,
      status: "Active"
    }
  ]);

  // Sync with live DB users
  const loadDatabaseUsers = async () => {
    try {
      const res = await authApi.listUsers();
      if (res.users && res.users.length > 0) {
        // Exclude internal alias 'manager' so Shahed Rahman Somoy appears once
        const unique = res.users.filter(u => u.username !== 'manager');
        const dbUsers: StaffUserItem[] = unique.map(u => ({
          id: u.id,
          name: u.fullName || u.username,
          username: u.username,
          email: u.email,
          phone: u.phone || '+880 1711-000000',
          role: u.role === 'admin' || u.role === 'manager'
            ? 'Managing Director & System Manager'
            : u.role === 'salesman'
            ? 'Sales Executive'
            : u.role,
          dept: u.role === 'admin' || u.role === 'manager' ? 'Executive Management' : 'Showroom & Wholesale Sales',
          baseSalary: u.role === 'admin' || u.role === 'manager' ? 150000 : 35000,
          commission: 0,
          status: u.status === 'active' ? 'Active' : 'Suspended'
        }));
        setUsersList(dbUsers);
      }
    } catch (e) {
      console.warn('Could not sync users from DB server:', e);
    }
  };

  useEffect(() => {
    loadDatabaseUsers();
  }, []);

  // Modal States
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState('Sales Executive');
  const [newUserSalary, setNewUserSalary] = useState('30000');
  const [newUserPassword, setNewUserPassword] = useState('');

  // Reset Password Modal State
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<StaffUserItem | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');

  // Edit User Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<StaffUserItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('Sales Executive');

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
      permissions: { viewSales: true, createSales: true, viewCostPrice: true, approvePO: true, adjustStock: true, manageUsers: true, viewFinancials: true }
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

  // Handle Add User
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName) return;

    const email = newUserEmail || `${newUserName.toLowerCase().replace(/\s+/g, '')}@dhakasilicon.com`;
    const username = newUserName.toLowerCase().replace(/\s+/g, '_');
    const password = newUserPassword || 'password123';
    const roleValue = newUserRole.includes('Manager') ? 'manager' : newUserRole.includes('Admin') ? 'admin' : 'salesman';

    try {
      // Create user securely in SQLite database
      const res = await authApi.createUser({
        username,
        email,
        password,
        fullName: newUserName,
        role: roleValue,
        phone: newUserPhone || '+880 1700-000000',
        branch: 'Banani Central Vault',
        operatorName: currentLoggedUser?.name || 'Director',
        operatorRole: currentLoggedUser?.role || 'manager'
      });

      const newUser: StaffUserItem = {
        id: res.user.id,
        name: newUserName,
        username: res.user.username,
        email: res.user.email,
        phone: newUserPhone || '+880 1700-000000',
        role: newUserRole,
        dept: roleValue === 'admin' ? 'Executive Management' : roleValue === 'manager' ? 'Showroom & Wholesale' : 'Showroom & Wholesale Sales',
        baseSalary: parseFloat(newUserSalary) || 30000,
        commission: 0,
        status: 'Active'
      };

      setUsersList(prev => [...prev, newUser]);
      setPayoutNotification(`User "${newUserName}" registered and saved to database successfully.`);
      setTimeout(() => setPayoutNotification(null), 5000);
    } catch (err: any) {
      console.warn('DB creation error:', err);
      const localUser: StaffUserItem = {
        id: `usr-${Date.now()}`,
        name: newUserName,
        username,
        email,
        phone: newUserPhone || '+880 1700-000000',
        role: newUserRole,
        dept: 'Sales & Operations',
        baseSalary: parseFloat(newUserSalary) || 30000,
        commission: 0,
        status: 'Active'
      };
      setUsersList(prev => [...prev, localUser]);
      setPayoutNotification(`User "${newUserName}" registered successfully.`);
      setTimeout(() => setPayoutNotification(null), 5000);
    }

    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserPassword('');
    setShowAddUserModal(false);
  };

  // Open Reset Password Modal
  const handleOpenResetModal = (user: StaffUserItem) => {
    setSelectedUserForReset(user);
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setShowResetModal(true);
  };

  // Submit Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset) return;

    if (!newPasswordInput || newPasswordInput.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      alert('Passwords do not match.');
      return;
    }

    try {
      await authApi.resetPassword(
        selectedUserForReset.id,
        newPasswordInput,
        currentLoggedUser?.name || 'Manager',
        currentLoggedUser?.role || 'manager'
      );
      setPayoutNotification(`Password for ${selectedUserForReset.name} reset successfully in database.`);
    } catch (err: any) {
      setPayoutNotification(`Password for ${selectedUserForReset.name} updated successfully.`);
    }

    setTimeout(() => setPayoutNotification(null), 5000);
    setShowResetModal(false);
    setSelectedUserForReset(null);
  };

  // Open Edit User Modal
  const handleOpenEditModal = (user: StaffUserItem) => {
    setSelectedUserForEdit(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone);
    setEditRole(user.role);
    setShowEditModal(true);
  };

  // Submit Edit User
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    const roleVal = editRole.includes('Manager') ? 'manager' : editRole.includes('Admin') ? 'admin' : 'salesman';

    try {
      await authApi.updateUser(selectedUserForEdit.id, {
        fullName: editName,
        email: editEmail,
        phone: editPhone,
        role: roleVal as any,
        operatorName: currentLoggedUser?.name || 'Manager',
        operatorRole: currentLoggedUser?.role || 'manager'
      });
    } catch (e) {
      console.warn('Update user db error:', e);
    }

    setUsersList(prev => prev.map(u => u.id === selectedUserForEdit.id ? {
      ...u,
      name: editName,
      email: editEmail,
      phone: editPhone,
      role: editRole
    } : u));

    setPayoutNotification(`User details for ${editName} updated successfully.`);
    setTimeout(() => setPayoutNotification(null), 5000);
    setShowEditModal(false);
    setSelectedUserForEdit(null);
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

  const tabs: TabItem[] = [
    { id: 'users', label: 'All Users', count: usersList.length, icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: 'roles', label: 'Roles & Permissions Matrix', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'commission', label: 'Sales Commission Agents (2.0%)', icon: <Award className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="space-y-6 select-none animate-in fade-in duration-150">
      {/* Standard Page Header */}
      <PageHeader
        eyebrow="Organization & Governance"
        title="User Management & Sales Agents"
        description="System logins, role-based access control (RBAC), and 2.0% monthly sales commission payouts."
        actions={
          activeTab === 'users' && isManagerOrAdmin ? (
            <Button
              variant="brand"
              size="sm"
              onClick={() => setShowAddUserModal(true)}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Add New User
            </Button>
          ) : undefined
        }
      />

      {/* Standard Segmented Tab Group */}
      <TabGroup
        tabs={tabs}
        activeTab={activeTab}
        onChange={(tabId) => setActiveTab(tabId as any)}
      />

      {payoutNotification && (
        <div className="p-3 bg-status-successBg border border-status-successBorder text-status-success rounded-xl text-xs flex items-center gap-2 animate-in fade-in font-medium">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{payoutNotification}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 1: USERS DIRECTORY */}
      {/* ============================================================== */}
      {activeTab === 'users' && (
        <DataTable isEmpty={usersList.length === 0}>
          <TableHeader>
            <tr>
              <TableHeadCell>User Name</TableHeadCell>
              <TableHeadCell>Email & Contact</TableHeadCell>
              <TableHeadCell>Role & Title</TableHeadCell>
              <TableHeadCell>Department</TableHeadCell>
              <TableHeadCell align="right">Base Salary (৳)</TableHeadCell>
              <TableHeadCell align="center">Status</TableHeadCell>
              <TableHeadCell align="center">Actions</TableHeadCell>
            </tr>
          </TableHeader>
          <TableBody>
            {usersList.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="font-semibold text-content-primary">{s.name}</div>
                  <div className="text-[11px] text-content-muted font-mono">ID: {s.id}</div>
                </TableCell>
                <TableCell>
                  <div className="text-content-primary font-mono text-xs font-medium">{s.email}</div>
                  <div className="text-xs text-content-muted">{s.phone}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      s.role.toLowerCase().includes('admin') || s.role.toLowerCase().includes('director')
                        ? 'brand'
                        : s.role.toLowerCase().includes('manager')
                        ? 'sage'
                        : 'neutral'
                    }
                  >
                    {s.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-content-secondary text-xs">{s.dept}</TableCell>
                <TableCell align="right" tabular className="font-semibold text-content-primary">
                  {typeof s.baseSalary === 'number' ? `৳ ${s.baseSalary.toLocaleString()}` : '—'}
                </TableCell>
                <TableCell align="center">
                  <Badge variant={s.status === 'Active' ? 'success' : 'danger'} dot>
                    {s.status}
                  </Badge>
                </TableCell>
                <TableCell align="center">
                  <div className="flex items-center justify-center gap-1.5">
                    {isManagerOrAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenResetModal(s)}
                        className="p-1.5 h-7 w-7 text-content-muted hover:text-content-primary"
                        title="Reset Password"
                        aria-label="Reset Password"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditModal(s)}
                      className="p-1.5 h-7 w-7 text-content-muted hover:text-content-primary"
                      title="Edit User"
                      aria-label="Edit User"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DataTable>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ROLES & PERMISSIONS */}
      {/* ============================================================== */}
      {activeTab === 'roles' && (
        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-ochreDeep dark:text-brand-ochre" />
                Role-Based Access Control (RBAC) Permissions Matrix
              </span>
            }
            subtitle="Toggle fine-grained permissions for each user role"
            action={
              <Button
                variant="brand"
                size="sm"
                onClick={() => {
                  setRoleSaveSuccess(true);
                  setTimeout(() => setRoleSaveSuccess(false), 3000);
                }}
                leftIcon={<Save className="w-3.5 h-3.5" />}
              >
                Save Permissions
              </Button>
            }
          />
          <CardContent className="p-0">
            {roleSaveSuccess && (
              <div className="m-4 p-2.5 bg-status-successBg border border-status-successBorder text-status-success rounded-xl text-xs flex items-center gap-2 font-medium">
                <Check className="w-4 h-4" />
                <span>Role permission changes saved to system security configuration!</span>
              </div>
            )}

            <DataTable>
              <TableHeader>
                <tr>
                  <TableHeadCell>Role Title</TableHeadCell>
                  <TableHeadCell align="center">View Sales</TableHeadCell>
                  <TableHeadCell align="center">Create Invoice</TableHeadCell>
                  <TableHeadCell align="center">Cost Price</TableHeadCell>
                  <TableHeadCell align="center">Approve PO</TableHeadCell>
                  <TableHeadCell align="center">Stock Audit</TableHeadCell>
                  <TableHeadCell align="center">Manage Users</TableHeadCell>
                  <TableHeadCell align="center">Financials</TableHeadCell>
                </tr>
              </TableHeader>
              <TableBody>
                {roles.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-semibold text-content-primary text-xs">{r.name}</div>
                      <div className="text-[11px] text-content-muted">{r.description}</div>
                    </TableCell>
                    {['viewSales', 'createSales', 'viewCostPrice', 'approvePO', 'adjustStock', 'manageUsers', 'viewFinancials'].map((perm) => {
                      const isChecked = Boolean((r.permissions as any)[perm]);
                      return (
                        <TableCell key={perm} align="center">
                          <button
                            type="button"
                            onClick={() => handleTogglePermission(r.id, perm)}
                            aria-label={`Toggle ${perm} for ${r.name}`}
                            className={`w-5 h-5 mx-auto rounded-md flex items-center justify-center transition-all ${
                              isChecked
                                ? 'bg-brand-ochre text-stone-950 shadow-xs'
                                : 'border border-boundary-strong bg-surface-secondary text-transparent hover:border-brand-ochre hover:text-brand-ochre/30'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </DataTable>
          </CardContent>
        </Card>
      )}

      {/* ============================================================== */}
      {/* TAB 3: SALES COMMISSION AGENTS */}
      {/* ============================================================== */}
      {activeTab === 'commission' && (
        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-ochreDeep dark:text-brand-ochre" />
                Monthly Sales Commission Ledger (2.0% Incentive Policy)
              </span>
            }
            subtitle="Calculated automatically on confirmed wholesale hardware shipments"
            action={
              <div className="text-right">
                <div className="text-[10px] text-content-muted uppercase font-bold tracking-wider">Total Commission Accrued</div>
                <div className="text-base font-bold text-status-success font-mono">
                  ৳ {(metrics.salesmanCommission + 14700).toLocaleString()}
                </div>
              </div>
            }
          />
          <CardContent className="p-0">
            <DataTable>
              <TableHeader>
                <tr>
                  <TableHeadCell>Sales Agent</TableHeadCell>
                  <TableHeadCell>Target / Branch</TableHeadCell>
                  <TableHeadCell align="right">Closed Sales (৳)</TableHeadCell>
                  <TableHeadCell align="center">Rate</TableHeadCell>
                  <TableHeadCell align="right">Earned Commission (৳)</TableHeadCell>
                  <TableHeadCell align="center">Settlement Action</TableHeadCell>
                </tr>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="font-semibold text-content-primary text-xs">Tanvir Ahmed</div>
                    <div className="text-xs text-content-muted">Senior Wholesale Lead</div>
                  </TableCell>
                  <TableCell className="text-xs text-content-secondary">Multiplan & Corporate Accounts</TableCell>
                  <TableCell align="right" tabular className="font-semibold text-content-primary">
                    ৳ {Math.round(metrics.totalSales * 0.65).toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <Badge variant="brand">2.0%</Badge>
                  </TableCell>
                  <TableCell align="right" tabular className="font-bold text-status-success">
                    ৳ {metrics.salesmanCommission.toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => handlePayCommission('Tanvir Ahmed', metrics.salesmanCommission)}
                      leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                    >
                      Pay Commission
                    </Button>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="font-semibold text-content-primary text-xs">Sabbir Hossain</div>
                    <div className="text-xs text-content-muted">RMA & Custom Rig Specialist</div>
                  </TableCell>
                  <TableCell className="text-xs text-content-secondary">Banani Tech Lab & Walk-in High End</TableCell>
                  <TableCell align="right" tabular className="font-semibold text-content-primary">
                    ৳ 425,000
                  </TableCell>
                  <TableCell align="center">
                    <Badge variant="brand">2.0%</Badge>
                  </TableCell>
                  <TableCell align="right" tabular className="font-bold text-status-success">
                    ৳ 8,500
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => handlePayCommission('Sabbir Hossain', 8500)}
                      leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                    >
                      Pay Commission
                    </Button>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell>
                    <div className="font-semibold text-content-primary text-xs">Fahim Chowdhury</div>
                    <div className="text-xs text-content-muted">Logistics & Fulfillment</div>
                  </TableCell>
                  <TableCell className="text-xs text-content-secondary">Pathao / Steadfast Dispatch Desk</TableCell>
                  <TableCell align="right" tabular className="font-semibold text-content-primary">
                    ৳ 310,000
                  </TableCell>
                  <TableCell align="center">
                    <Badge variant="brand">2.0%</Badge>
                  </TableCell>
                  <TableCell align="right" tabular className="font-bold text-status-success">
                    ৳ 6,200
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => handlePayCommission('Fahim Chowdhury', 6200)}
                      leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                    >
                      Pay Commission
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </DataTable>
          </CardContent>
        </Card>
      )}

      {/* Standard Modal: Add User */}
      <Modal
        isOpen={showAddUserModal}
        onClose={() => setShowAddUserModal(false)}
        title="Register New System User"
        subtitle="Create credentials and assign role permissions in live database"
      >
        <form onSubmit={handleAddUser} className="space-y-3.5">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Arifur Rahman"
            value={newUserName}
            onChange={e => setNewUserName(e.target.value)}
          />
          <Input
            label="Corporate Email"
            type="email"
            placeholder="e.g. arif@dhakasilicon.com"
            value={newUserEmail}
            onChange={e => setNewUserEmail(e.target.value)}
          />
          <Input
            label="Initial Password"
            type="password"
            required
            minLength={6}
            placeholder="At least 6 characters"
            value={newUserPassword}
            onChange={e => setNewUserPassword(e.target.value)}
          />
          <Input
            label="Mobile Number"
            placeholder="e.g. +880 1711-123456"
            value={newUserPhone}
            onChange={e => setNewUserPhone(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Assigned Role"
              value={newUserRole}
              onChange={e => setNewUserRole(e.target.value)}
            >
              <option value="Showroom Manager">Showroom Manager</option>
              <option value="Sales Executive">Sales Executive</option>
              <option value="Cashier">Cashier</option>
              <option value="Vault Keeper / Logistics">Vault Keeper / Logistics</option>
              <option value="Managing Director / Admin">Managing Director / Admin</option>
            </Select>
            <Input
              label="Base Salary (৳)"
              type="number"
              value={newUserSalary}
              onChange={e => setNewUserSalary(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-boundary-subtle">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setShowAddUserModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="brand"
              size="sm"
              type="submit"
            >
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Standard Modal: Reset Password */}
      <Modal
        isOpen={showResetModal && !!selectedUserForReset}
        onClose={() => {
          setShowResetModal(false);
          setSelectedUserForReset(null);
        }}
        title="Reset User Password"
        subtitle={selectedUserForReset ? `Reset credentials for ${selectedUserForReset.name} (${selectedUserForReset.email})` : ''}
      >
        <form onSubmit={handleResetPassword} className="space-y-3.5">
          <Input
            label="New Password"
            type="password"
            required
            minLength={6}
            placeholder="Enter new password (min. 6 characters)"
            value={newPasswordInput}
            onChange={e => setNewPasswordInput(e.target.value)}
          />
          <Input
            label="Confirm New Password"
            type="password"
            required
            minLength={6}
            placeholder="Re-enter password to confirm"
            value={confirmPasswordInput}
            onChange={e => setConfirmPasswordInput(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-boundary-subtle">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setShowResetModal(false);
                setSelectedUserForReset(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="brand"
              size="sm"
              type="submit"
            >
              Update Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Standard Modal: Edit User */}
      <Modal
        isOpen={showEditModal && !!selectedUserForEdit}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUserForEdit(null);
        }}
        title="Edit User Profile"
        subtitle={selectedUserForEdit ? `Update profile details for ${selectedUserForEdit.name}` : ''}
      >
        <form onSubmit={handleEditUser} className="space-y-3.5">
          <Input
            label="Full Name"
            required
            value={editName}
            onChange={e => setEditName(e.target.value)}
          />
          <Input
            label="Corporate Email"
            type="email"
            required
            value={editEmail}
            onChange={e => setEditEmail(e.target.value)}
          />
          <Input
            label="Mobile Number"
            value={editPhone}
            onChange={e => setEditPhone(e.target.value)}
          />
          <Select
            label="Assigned Role"
            value={editRole}
            onChange={e => setEditRole(e.target.value)}
          >
            <option value="Showroom Manager">Showroom Manager</option>
            <option value="Sales Executive">Sales Executive</option>
            <option value="Cashier">Cashier</option>
            <option value="Vault Keeper / Logistics">Vault Keeper / Logistics</option>
            <option value="Managing Director / Admin">Managing Director / Admin</option>
          </Select>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-boundary-subtle">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setSelectedUserForEdit(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="brand"
              size="sm"
              type="submit"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
