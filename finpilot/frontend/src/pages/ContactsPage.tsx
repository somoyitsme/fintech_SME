import React, { useState } from 'react';
import { 
  Users, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  Search, 
  ExternalLink, 
  DollarSign, 
  CheckCircle2, 
  X,
  CreditCard,
  FileSpreadsheet
} from 'lucide-react';
import { useStore, Customer, Supplier } from '../context/StoreContext';

interface ContactsPageProps {
  initialTab?: 'suppliers' | 'customers' | 'groups' | 'import';
  onNavigateTab?: (tab: string) => void;
}

export const ContactsPage: React.FC<ContactsPageProps> = ({ 
  initialTab = 'customers',
  onNavigateTab 
}) => {
  const { customers, suppliers, addNewCustomer, addSupplier } = useStore();
  const [activeTab, setActiveTab] = useState<'suppliers' | 'customers' | 'groups' | 'import'>(initialTab);

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
      email: supEmail || `${supName.toLowerCase().replace(/\\s+/g, '')}@supplier.bd`,
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

  return (
    <div className="space-y-5 text-slate-800 dark:text-slate-100 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-500" />
            Contacts Directory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage wholesale clients, corporate accounts, retail walk-ins & global hardware vendors
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'customers' && (
            <button
              onClick={() => setShowAddCustomer(true)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          )}
          {activeTab === 'suppliers' && (
            <button
              onClick={() => setShowAddSupplier(true)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supplier</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'customers' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customers ({customers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'suppliers' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Suppliers ({suppliers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'groups' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Customer Groups
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'import' 
                ? 'bg-blue-600 text-white shadow' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, phone, address..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: CUSTOMERS TABLE */}
      {/* ============================================================== */}
      {activeTab === 'customers' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-3">Contact Mobile</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">BIN / Tax ID</th>
                  <th className="py-3 px-3">Delivery Address</th>
                  <th className="py-3 px-4 text-right">Total Purchases</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-[13px]">{cust.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {cust.id}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {cust.contactNumber}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cust.customerType === 'Wholesale' ? 'bg-blue-500/15 text-blue-500 border border-blue-500/30' :
                        cust.customerType === 'Corporate' ? 'bg-purple-500/15 text-purple-500 border border-purple-500/30' :
                        'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                      }`}>
                        {cust.customerType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {cust.binNumber || 'BIN-00829103-01'}
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 max-w-xs truncate text-[11.5px]">
                      {cust.deliveryAddress}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ৳ {(cust.totalPurchases || 450000).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button 
                        onClick={() => {
                          if (onNavigateTab) onNavigateTab('sell-pos');
                        }}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold transition"
                      >
                        New Sale
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
      {/* TAB 2: SUPPLIERS TABLE */}
      {/* ============================================================== */}
      {activeTab === 'suppliers' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Supplier / Vendor</th>
                  <th className="py-3 px-3">Contact Person</th>
                  <th className="py-3 px-3">Phone & Email</th>
                  <th className="py-3 px-3">Hardware Category</th>
                  <th className="py-3 px-3">Country / Hub</th>
                  <th className="py-3 px-4 text-right">Total Purchase (৳)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredSuppliers.map((sup) => (
                  <tr key={sup.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white text-[13px]">{sup.name}</div>
                      <div className="text-[10px] text-slate-400">{sup.address}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium">
                      {sup.contactPerson}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      <div>{sup.phone}</div>
                      <div className="text-blue-500">{sup.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-400 border border-slate-700 text-[10px] font-bold">
                        {sup.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                      {sup.country}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-sky-600 dark:text-sky-400 text-sm">
                      ৳ {sup.totalPurchase.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                        ● Active Partner
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CUSTOMER GROUPS */}
      {/* ============================================================== */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-sm text-blue-500">Wholesale Tier A</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-xs font-bold">5% Discount</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Multiplan Center & IDB Bhaban retail partner shops purchasing in bulk cartons with 30-day payment terms.
            </p>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">8 Partner Stores Assigned</div>
          </div>

          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-sm text-purple-500">Corporate & Institutional</span>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-xs font-bold">Priority Delivery</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Universities, software firms, eSports gaming lounges with corporate purchase requisitions and GST/BIN invoices.
            </p>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">4 Accounts Assigned</div>
          </div>

          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-sm text-emerald-500">Direct Retail & Walk-in</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold">Official Warranty</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Walk-in PC builders purchasing individual components across Banani Vault showroom counter.
            </p>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">3 Showroom Walk-ins</div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: IMPORT CONTACTS */}
      {/* ============================================================== */}
      {activeTab === 'import' && (
        <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm max-w-xl mx-auto text-center space-y-4">
          <FileSpreadsheet className="w-12 h-12 text-blue-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Import Contacts via CSV / Excel</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bulk upload supplier records, client contacts, and addresses using standard ERP template.
          </p>
          <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 cursor-pointer hover:border-blue-500 transition">
            <span className="text-xs text-slate-500 dark:text-slate-400">Drag and drop .csv file here, or click to browse</span>
          </div>
          <button 
            onClick={() => alert("CSV Contacts Template downloaded: contacts_template.csv")}
            className="text-xs text-blue-500 hover:underline font-semibold"
          >
            Download CSV Format Template
          </button>
        </div>
      )}

      {/* MODAL: ADD CUSTOMER */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-5 text-slate-900 dark:text-slate-100 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700 mb-3">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Add New Customer</span>
              <button onClick={() => setShowAddCustomer(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddCustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Company / Customer Name</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                  placeholder="e.g. Computer Source BD"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Phone Number</label>
                <input
                  type="text"
                  required
                  value={custPhone}
                  onChange={e => setCustPhone(e.target.value)}
                  placeholder="+880 1711-000000"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Customer Group</label>
                <select
                  value={custType}
                  onChange={e => setCustType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option>Wholesale</option>
                  <option>Corporate</option>
                  <option>Retail</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Delivery Address</label>
                <input
                  type="text"
                  value={custAddress}
                  onChange={e => setCustAddress(e.target.value)}
                  placeholder="e.g. Shop 21, Multiplan Center, Dhaka"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow"
              >
                Save Customer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SUPPLIER */}
      {showAddSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-5 text-slate-900 dark:text-slate-100 shadow-2xl">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700 mb-3">
              <span className="font-bold text-sm text-slate-900 dark:text-white">Add New Hardware Supplier</span>
              <button onClick={() => setShowAddSupplier(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSupSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Supplier Company Name</label>
                <input
                  type="text"
                  required
                  value={supName}
                  onChange={e => setSupName(e.target.value)}
                  placeholder="e.g. Sapphire Technology HK"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Contact Person</label>
                  <input
                    type="text"
                    value={supContact}
                    onChange={e => setSupContact(e.target.value)}
                    placeholder="e.g. David Liu"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Phone</label>
                  <input
                    type="text"
                    value={supPhone}
                    onChange={e => setSupPhone(e.target.value)}
                    placeholder="+880 1819-000000"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Product Category</label>
                <input
                  type="text"
                  value={supCategory}
                  onChange={e => setSupCategory(e.target.value)}
                  placeholder="e.g. Graphics Cards & Motherboards"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Address / Hub</label>
                <input
                  type="text"
                  value={supAddress}
                  onChange={e => setSupAddress(e.target.value)}
                  placeholder="e.g. Kowloon, Hong Kong"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow"
              >
                Save Supplier
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
