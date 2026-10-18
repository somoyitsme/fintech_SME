import React, { useState } from 'react';
import { Plus, Search, FileSpreadsheet, ArrowUpRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { TabGroup } from '../components/common/TabGroup';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { DataTable, TableHeader, TableHeadCell, TableBody, TableRow, TableCell } from '../components/common/DataTable';
import { PageHeader } from '../components/common/PageHeader';

interface ContactsPageProps {
  initialTab?: 'suppliers' | 'customers' | 'groups' | 'import';
  onNavigateTab?: (tab: string) => void;
}

export const ContactsPage: React.FC<ContactsPageProps> = ({ 
  initialTab = 'customers',
  onNavigateTab 
}) => {
  const { customers, suppliers, addNewCustomer, addSupplier } = useStore();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [search, setSearch] = useState('');
  
  // Add Modals
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);

  // New Customer State
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custType, setCustType] = useState<'Wholesale' | 'Retail' | 'Corporate'>('Wholesale');

  // New Supplier State
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supCategory, setSupCategory] = useState('Processors');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.contactNumber.includes(search) ||
    c.deliveryAddress.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone) return;
    addNewCustomer({
      name: custName,
      contactNumber: custPhone,
      deliveryAddress: custAddress || 'Dhaka, Bangladesh',
      customerType: custType,
      binNumber: `BIN-${Math.floor(100000000 + Math.random() * 900000000)}-01`,
      totalPurchases: 0
    });
    setCustName('');
    setCustPhone('');
    setCustAddress('');
    setShowAddCustomer(false);
  };

  const handleAddSupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName) return;
    addSupplier({
      name: supName,
      contactPerson: supContact || 'Channel Manager',
      phone: supPhone || '+880 1700-000000',
      email: supEmail || `${supName.toLowerCase().replace(/\s+/g, '')}@supplier.bd`,
      address: supAddress || 'Dhaka, Bangladesh',
      country: 'Bangladesh',
      category: supCategory,
      totalPurchase: 0,
      totalDue: 0
    });
    setSupName('');
    setSupContact('');
    setSupPhone('');
    setSupEmail('');
    setSupAddress('');
    setShowAddSupplier(false);
  };

  // Metrics
  const wholesaleCount = customers.filter(c => c.customerType === 'Wholesale').length;

  const tabs = [
    { id: 'customers', label: `Customers (${customers.length})` },
    { id: 'suppliers', label: `Suppliers (${suppliers.length})` },
    { id: 'groups', label: 'Customer Groups' },
    { id: 'import', label: 'Import Contacts' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Relationships"
        title="Contacts"
        description="Manage customer and supplier records, commercial details, and contact imports."
        actions={<>
          {activeTab === 'customers' && (
            <Button
              variant="brand"
              size="sm"
              onClick={() => setShowAddCustomer(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Customer
            </Button>
          )}
          {activeTab === 'suppliers' && (
            <Button
              variant="brand"
              size="sm"
              onClick={() => setShowAddSupplier(true)}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Supplier
            </Button>
          )}
        </>}
      />

      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-content-secondary">
        <span><strong className="font-semibold text-content-primary">{customers.length}</strong> customers</span>
        <span><strong className="font-semibold text-content-primary">{suppliers.length}</strong> suppliers</span>
        <span><strong className="font-semibold text-content-primary">{wholesaleCount}</strong> wholesale accounts</span>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <TabGroup
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="w-full sm:w-72">
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-content-muted" />}
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: CUSTOMERS TABLE */}
      {/* ============================================================== */}
      {activeTab === 'customers' && (
        <DataTable isEmpty={filteredCustomers.length === 0} emptyMessage="No customers match your search query.">
          <TableHeader>
            <tr>
              <TableHeadCell>Customer Name</TableHeadCell>
              <TableHeadCell>Contact Mobile</TableHeadCell>
              <TableHeadCell>Customer Type</TableHeadCell>
              <TableHeadCell>BIN / Tax ID</TableHeadCell>
              <TableHeadCell>Delivery Address</TableHeadCell>
              <TableHeadCell align="right">Total Purchases</TableHeadCell>
              <TableHeadCell align="center">Action</TableHeadCell>
            </tr>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((cust) => {
              const typeVariant = cust.customerType === 'Wholesale' ? 'info' : cust.customerType === 'Corporate' ? 'neutral' : 'success';

              return (
                <TableRow key={cust.id}>
                  <TableCell>
                    <div className="font-semibold text-content-primary">{cust.name}</div>
                    <div className="text-[11px] text-content-muted font-mono">ID: {cust.id}</div>
                  </TableCell>
                  <TableCell className="font-mono text-content-secondary">
                    {cust.contactNumber}
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeVariant} size="sm">
                      {cust.customerType}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-content-muted">
                    {cust.binNumber || 'BIN-00829103-01'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-content-secondary text-xs">
                    {cust.deliveryAddress}
                  </TableCell>
                  <TableCell align="right" tabular className="font-bold text-content-primary">
                    ৳ {(cust.totalPurchases || 450000).toLocaleString()}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (onNavigateTab) onNavigateTab('sell-pos');
                      }}
                    >
                      New Sale
                      <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </DataTable>
      )}

      {/* ============================================================== */}
      {/* TAB 2: SUPPLIERS TABLE */}
      {/* ============================================================== */}
      {activeTab === 'suppliers' && (
        <DataTable isEmpty={filteredSuppliers.length === 0} emptyMessage="No suppliers found.">
          <TableHeader>
            <tr>
              <TableHeadCell>Supplier / Vendor</TableHeadCell>
              <TableHeadCell>Contact Person</TableHeadCell>
              <TableHeadCell>Phone & Email</TableHeadCell>
              <TableHeadCell>Hardware Category</TableHeadCell>
              <TableHeadCell>Country / Hub</TableHeadCell>
              <TableHeadCell align="right">Total Sourcing (৳)</TableHeadCell>
              <TableHeadCell align="center">Status</TableHeadCell>
            </tr>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.map((sup) => (
              <TableRow key={sup.id}>
                <TableCell>
                  <div className="font-semibold text-content-primary">{sup.name}</div>
                  <div className="text-[11px] text-content-muted">{sup.address}</div>
                </TableCell>
                <TableCell className="font-medium text-content-primary">
                  {sup.contactPerson}
                </TableCell>
                <TableCell className="font-mono text-xs text-content-secondary">
                  <div>{sup.phone}</div>
                  <div className="text-brand-ochre">{sup.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="neutral" size="sm">
                    {sup.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-content-muted">
                  {sup.country}
                </TableCell>
                <TableCell align="right" tabular className="font-bold text-content-primary">
                  ৳ {sup.totalPurchase.toLocaleString()}
                </TableCell>
                <TableCell align="center">
                  <Badge variant="success" size="sm">
                    Active Partner
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DataTable>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CUSTOMER GROUPS */}
      {/* ============================================================== */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-content-primary">Wholesale Tier A</span>
              <Badge variant="info" size="sm">5% Margin Rule</Badge>
            </div>
            <p className="text-xs text-content-secondary leading-relaxed">
              Multiplan Center & IDB Bhaban retail partner shops purchasing in bulk cartons with 30-day payment credit terms.
            </p>
            <div className="pt-2 border-t border-boundary-subtle text-xs font-semibold text-content-primary flex items-center justify-between">
              <span>Assigned Stores</span>
              <span className="font-mono text-brand-ochre">8 Partner Accounts</span>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-content-primary">Corporate & Institutional</span>
              <Badge variant="neutral" size="sm">Priority Supply</Badge>
            </div>
            <p className="text-xs text-content-secondary leading-relaxed">
              Universities, software firms, and eSports lounges with official corporate procurement requisitions and NBR Mushak-6.3 VAT invoices.
            </p>
            <div className="pt-2 border-t border-boundary-subtle text-xs font-semibold text-content-primary flex items-center justify-between">
              <span>Assigned Clients</span>
              <span className="font-mono text-brand-ochre">4 Institutional Accounts</span>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm text-content-primary">Direct Retail & Walk-in</span>
              <Badge variant="success" size="sm">Official Warranty</Badge>
            </div>
            <p className="text-xs text-content-secondary leading-relaxed">
              Walk-in PC builders purchasing individual components across Banani Vault showroom counter with instant cash/bKash receipts.
            </p>
            <div className="pt-2 border-t border-boundary-subtle text-xs font-semibold text-content-primary flex items-center justify-between">
              <span>Showroom Log</span>
              <span className="font-mono text-brand-ochre">3 Walk-in Accounts</span>
            </div>
          </Card>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: IMPORT CONTACTS */}
      {/* ============================================================== */}
      {activeTab === 'import' && (
        <Card className="p-8 max-w-xl mx-auto text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-olive/20 text-brand-ochre mx-auto flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-content-primary">Import Directory Contacts via CSV / Excel</h3>
          <p className="text-xs text-content-muted">
            Batch upload supplier records, client contacts, and addresses using standard ERP template.
          </p>
          <div className="p-6 border-2 border-dashed border-boundary-strong rounded-2xl bg-surface-secondary cursor-pointer hover:border-brand-ochre transition">
            <span className="text-xs text-content-muted">Drag and drop contacts_template.csv or excel sheet here</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => alert("CSV Contacts Template downloaded: contacts_template.csv")}
          >
            Download CSV Format Template
          </Button>
        </Card>
      )}

      {/* MODAL: ADD CUSTOMER */}
      {showAddCustomer && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddCustomer(false)}
          title="Add New Customer Account"
          size="md"
        >
          <form onSubmit={handleAddCustSubmit} className="space-y-3.5 text-xs">
            <Input
              label="Company / Customer Name"
              required
              value={custName}
              onChange={e => setCustName(e.target.value)}
              placeholder="e.g. Computer Source BD"
            />
            <Input
              label="Contact Phone"
              required
              value={custPhone}
              onChange={e => setCustPhone(e.target.value)}
              placeholder="+880 1711-000000"
            />
            <div>
              <label className="block text-xs font-semibold text-content-primary mb-1">
                Customer Group
              </label>
              <Select
                value={custType}
                onChange={e => setCustType(e.target.value as any)}
              >
                <option value="Wholesale">Wholesale Partner</option>
                <option value="Corporate">Corporate & Institutional</option>
                <option value="Retail">Retail Walk-in</option>
              </Select>
            </div>
            <Input
              label="Delivery Address"
              value={custAddress}
              onChange={e => setCustAddress(e.target.value)}
              placeholder="e.g. Shop 21, Multiplan Center, Dhaka"
            />
            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddCustomer(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Customer
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: ADD SUPPLIER */}
      {showAddSupplier && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddSupplier(false)}
          title="Add New Hardware Vendor"
          size="md"
        >
          <form onSubmit={handleAddSupSubmit} className="space-y-3.5 text-xs">
            <Input
              label="Supplier Company Name"
              required
              value={supName}
              onChange={e => setSupName(e.target.value)}
              placeholder="e.g. Sapphire Technology HK"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Contact Person"
                value={supContact}
                onChange={e => setSupContact(e.target.value)}
                placeholder="e.g. David Liu"
              />
              <Input
                label="Phone Number"
                value={supPhone}
                onChange={e => setSupPhone(e.target.value)}
                placeholder="+880 1819-000000"
              />
            </div>
            <Input
              label="Product Category"
              value={supCategory}
              onChange={e => setSupCategory(e.target.value)}
              placeholder="e.g. Graphics Cards & Motherboards"
            />
            <Input
              label="Address / Logistics Hub"
              value={supAddress}
              onChange={e => setSupAddress(e.target.value)}
              placeholder="e.g. Kowloon, Hong Kong"
            />
            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowAddSupplier(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Save Vendor
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
