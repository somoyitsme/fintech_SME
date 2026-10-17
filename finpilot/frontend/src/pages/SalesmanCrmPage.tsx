import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  MessageSquare, 
  Building2, 
  Lock, 
  Download, 
  Plus, 
  Calendar,
  Clock,
  ShieldAlert,
  UserPlus,
  CheckCircle,
  FileText
} from 'lucide-react';
import { useStore, Customer } from '../context/StoreContext';

export const SalesmanCrmPage: React.FC = () => {
  const { customers, addNewCustomer } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustType, setNewCustType] = useState<'Wholesale' | 'Retail' | 'Corporate'>('Wholesale');
  const [newCustBin, setNewCustBin] = useState('');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;

    addNewCustomer({
      name: newCustName.trim(),
      contactNumber: newCustPhone.trim(),
      deliveryAddress: newCustAddress.trim() || 'Dhaka, Bangladesh',
      customerType: newCustType,
      binNumber: newCustBin.trim() || undefined,
      totalPurchases: 0
    });

    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
    setNewCustBin('');
    setShowAddCustomerModal(false);
    showToast(`Customer account for "${newCustName.trim()}" created successfully!`);
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contactNumber.includes(searchQuery) ||
    c.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.binNumber && c.binNumber.includes(searchQuery))
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle className="w-4 h-4 shrink-0 text-white" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f6fc]">
              Customer Directory & Accounts
            </h1>
            <span className="text-[11px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-mono font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              {customers.length} Client Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8b949e] mt-0.5">
            Registered wholesale clients, corporate buyers, delivery addresses, and BIN records.
          </p>
        </div>

        {/* Action Button: Add New Customer */}
        <button
          onClick={() => setShowAddCustomerModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" /> Add New Customer
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by company or buyer name, phone number, or delivery zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#21262d] text-slate-500 dark:text-[#8b949e] text-xs">
          <Lock className="w-3.5 h-3.5 text-amber-500" />
          <span>Full database raw export locked (Admin privilege)</span>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((client) => (
          <div
            key={client.id}
            className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl p-5 shadow-sm transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#f0f6fc]">{client.name}</h3>
                  <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" /> {client.customerType} Account
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  client.customerType === 'Wholesale'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                    : client.customerType === 'Corporate'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                }`}>
                  {client.customerType}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{client.contactNumber}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-500 dark:text-[#8b949e] leading-tight">{client.deliveryAddress}</span>
                </div>
                {client.binNumber && (
                  <div className="flex items-center gap-2 pt-1">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[10.5px] text-slate-500">BIN: {client.binNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-slate-100 dark:border-[#30363d] flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                Lifetime: <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">৳{((client.totalPurchases || 0)).toLocaleString()}</span>
              </span>
              <button
                onClick={() => setSelectedCustomer(client)}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Account Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-3xl max-w-md w-full p-6 shadow-2xl text-slate-800 dark:text-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#30363d]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Register New Customer</h3>
                  <p className="text-[11px] text-slate-400">Create client profile for instant billing & delivery</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddCustomerModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                  Customer / Business Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nexus Tech Ltd. / Rafiq Ahmed"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                  Phone / Mobile Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +880 1712-345678"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">
                  Delivery / Billing Address <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Shop 204, Suvastu Arcade, Elephant Road, Dhaka"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">Customer Classification</label>
                  <select
                    value={newCustType}
                    onChange={(e) => setNewCustType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="Wholesale">Wholesale Client</option>
                    <option value="Retail">Retail Walk-in</option>
                    <option value="Corporate">Corporate Account</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-medium mb-1">VAT BIN # (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 004819201-0101"
                    value={newCustBin}
                    onChange={(e) => setNewCustBin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl text-slate-800 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition"
                >
                  Save & Register Customer
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#21262d] font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-800 dark:text-slate-100">
            <h3 className="text-base font-bold">{selectedCustomer.name}</h3>
            <p className="text-xs text-slate-500 dark:text-[#8b949e]">{selectedCustomer.customerType} Account</p>

            <div className="my-4 p-3.5 rounded-xl bg-slate-50 dark:bg-[#21262d] border border-slate-100 dark:border-[#30363d] text-xs space-y-2">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400">Contact Number</span>
                <div className="font-semibold">{selectedCustomer.contactNumber}</div>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400">Delivery Address</span>
                <div className="text-slate-700 dark:text-slate-300">{selectedCustomer.deliveryAddress}</div>
              </div>
              {selectedCustomer.binNumber && (
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400">VAT BIN</span>
                  <div className="font-mono">{selectedCustomer.binNumber}</div>
                </div>
              )}
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400">Lifetime Purchase Volume</span>
                <div className="font-mono font-bold text-emerald-600 text-sm">
                  ৳ {((selectedCustomer.totalPurchases || 0)).toLocaleString()}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
