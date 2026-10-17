import React, { useEffect, useState } from 'react';
import { 
  Download, 
  Send, 
  CheckCircle2, 
  Plus, 
  Search, 
  Sparkles,
  Mail,
  Cpu,
  Package
} from 'lucide-react';
import { api } from '../api';

export const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Reminder modal state
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [reminderTone, setReminderTone] = useState<string>('polite');
  const [reminderResult, setReminderResult] = useState<any | null>(null);
  const [sendingReminder, setSendingReminder] = useState(false);

  // New Invoice modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [newInvClient, setNewInvClient] = useState('');
  const [newInvNum, setNewInvNum] = useState(`INV-2026-${Math.floor(200 + Math.random() * 800)}`);
  const [newInvDue, setNewInvDue] = useState('2026-11-20');
  const [newInvPart, setNewInvPart] = useState('NVIDIA GeForce RTX 4070 Super 12GB OC Edition');
  const [newInvQty, setNewInvQty] = useState('2');
  const [newInvPrice, setNewInvPrice] = useState('78500');

  const popularParts = [
    { name: "NVIDIA GeForce RTX 4070 Super 12GB OC Edition", price: 78500 },
    { name: "Intel Core i7-14700K 20-Core LGA1700 Processor", price: 44200 },
    { name: "AMD Ryzen 7 7800X3D 8-Core Gaming CPU", price: 42500 },
    { name: "Corsair Vengeance 32GB (2x16GB) DDR5 6000MHz", price: 14800 },
    { name: "Samsung 990 Pro 2TB NVMe PCIe 4.0 SSD", price: 22500 },
    { name: "ASUS ROG Strix B760-F Gaming Motherboard", price: 26000 },
    { name: "Corsair RM850e 850W 80+ Gold Fully Modular PSU", price: 15200 },
    { name: "Lian Li O11 Dynamic EVO Mid-Tower Gaming Case", price: 18900 }
  ];

  useEffect(() => {
    loadInvoices();
  }, [statusFilter]);

  async function loadInvoices() {
    setLoading(true);
    try {
      const data = await api.getInvoices(statusFilter === 'all' ? undefined : statusFilter);
      setInvoices(data);
      const cl = await api.getClients();
      setClients(cl);
      if (cl.length > 0 && !newInvClient) setNewInvClient(cl[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleDownloadPdf = (invoiceId: string) => {
    window.open(`http://localhost:8090/api/v1/invoices/${invoiceId}/pdf`, '_blank');
  };

  const handleSendReminder = async () => {
    if (!selectedInvoice) return;
    setSendingReminder(true);
    try {
      const res = await api.sendInvoiceReminder(selectedInvoice.id, reminderTone);
      setReminderResult(res);
    } catch (e) {
      alert("Failed to send reminder");
    } finally {
      setSendingReminder(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await api.markInvoicePaid(id);
      loadInvoices();
    } catch (e) {
      alert("Failed to mark invoice as paid");
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const qty = parseFloat(newInvQty) || 1;
      const unitP = parseFloat(newInvPrice) || 50000;
      await api.createInvoice({
        client_id: newInvClient,
        invoice_number: newInvNum,
        due_date: newInvDue,
        items: [{
          description: newInvPart,
          quantity: qty,
          unit_price: unitP,
          tax_rate: 0.05
        }],
        tax_rate: 0.05
      });
      setShowCreateModal(false);
      setNewInvNum(`INV-2026-${Math.floor(200 + Math.random() * 800)}`);
      loadInvoices();
    } catch (err: any) {
      alert(`Error creating invoice: ${err.message}`);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    inv.client_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] tracking-tight">Hardware Invoices & Receivables (AR)</h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Manage wholesale computer component orders, monitor client payment aging, and dispatch AI recovery notices.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg text-xs font-semibold shadow transition"
        >
          <Plus className="w-3.5 h-3.5" /> Create Parts Invoice
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-[#161b22] border border-[#30363d] p-3 rounded-xl text-xs">
        <div className="flex items-center gap-1.5">
          {['all', 'sent', 'overdue', 'paid', 'draft'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 rounded-md capitalize font-semibold transition ${
                statusFilter === status
                  ? 'bg-[#21262d] text-[#f0f6fc] border border-[#30363d] shadow-sm'
                  : 'text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search invoice or computer shop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#f0f6fc] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff]"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-[#c9d1d9]">
          <thead className="bg-[#1c2128] text-[#8b949e] uppercase tracking-wider text-[10px] border-b border-[#30363d]">
            <tr>
              <th className="py-2.5 px-4">Invoice #</th>
              <th className="py-2.5 px-4">Retail Client / Buyer</th>
              <th className="py-2.5 px-4">Issue Date</th>
              <th className="py-2.5 px-4">Due Date</th>
              <th className="py-2.5 px-4 text-right">Amount (BDT)</th>
              <th className="py-2.5 px-4 text-center">Status</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363d]">
            {filteredInvoices.map((inv) => {
              const isOverdue = inv.status === 'overdue';
              return (
                <tr key={inv.id} className="hover:bg-[#1c2128]/50 transition">
                  <td className="py-3 px-4 font-mono font-semibold text-[#f0f6fc]">
                    {inv.invoice_number}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#f0f6fc]">
                    {inv.client_name}
                  </td>
                  <td className="py-3 px-4 text-[#8b949e]">
                    {inv.issue_date.slice(0, 10)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={isOverdue ? 'text-[#ff7b72] font-semibold' : 'text-[#c9d1d9]'}>
                      {inv.due_date.slice(0, 10)}
                    </span>
                    {isOverdue && (
                      <span className="block text-[10px] text-[#ff7b72] font-mono">
                        {inv.days_overdue} days past due
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-[#f0f6fc]">
                    ৳ {inv.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] capitalize font-semibold ${
                      inv.status === 'paid' ? 'bg-[#238636]/15 text-[#3fb950] border border-[#238636]/30' :
                      inv.status === 'overdue' ? 'bg-[#f85149]/15 text-[#ff7b72] border border-[#f85149]/30' :
                      'bg-[#388bfd]/15 text-[#58a6ff] border border-[#388bfd]/30'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleDownloadPdf(inv.id)}
                      title="Download PDF"
                      className="p-1.5 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-[#f0f6fc] transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {inv.status !== 'paid' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setReminderResult(null);
                          }}
                          title="AI Payment Reminder"
                          className="p-1.5 rounded-md bg-[#388bfd]/15 hover:bg-[#388bfd]/30 text-[#58a6ff] transition"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMarkPaid(inv.id)}
                          title="Mark Paid"
                          className="p-1.5 rounded-md bg-[#238636]/15 hover:bg-[#238636]/30 text-[#3fb950] transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* AI Payment Reminder Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-lg p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#58a6ff]" />
                <h3 className="font-bold text-[#f0f6fc] text-sm">Copilot Payment Chasing Draft</h3>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-[#8b949e] hover:text-[#f0f6fc] text-base">
                &times;
              </button>
            </div>

            <p className="text-xs text-[#8b949e]">
              Target: <strong className="text-[#f0f6fc]">{selectedInvoice.invoice_number}</strong> ({selectedInvoice.client_name}) · Amount: <strong className="text-[#3fb950] font-mono">৳ {selectedInvoice.total.toLocaleString()} BDT</strong>
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#c9d1d9]">Select Communication Tone:</label>
              <div className="grid grid-cols-3 gap-2">
                {['polite', 'professional', 'firm'].map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setReminderTone(tone)}
                    className={`py-1.5 px-3 rounded-lg text-xs capitalize font-semibold border transition ${
                      reminderTone === tone
                        ? 'bg-[#1f6feb] border-[#388bfd] text-white'
                        : 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-[#f0f6fc]'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {reminderResult ? (
              <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3.5 space-y-2 text-xs">
                <div className="text-[#3fb950] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Reminder Dispatched via BEFTN/Email Notice
                </div>
                <div className="text-[#f0f6fc] font-medium">Subject: {reminderResult.draft?.subject}</div>
                <div className="text-[#8b949e] whitespace-pre-wrap text-[11px] bg-[#161b22] p-2.5 rounded border border-[#30363d]">
                  {reminderResult.draft?.body}
                </div>
              </div>
            ) : (
              <button
                onClick={handleSendReminder}
                disabled={sendingReminder}
                className="w-full py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-xs transition flex items-center justify-center gap-2"
              >
                {sendingReminder ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Generate & Dispatch AI Reminder Notice
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create New Hardware Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateInvoice} className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-lg p-5 space-y-3.5 text-xs shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#58a6ff]" />
                <h3 className="font-bold text-[#f0f6fc] text-sm">Create Hardware Sales Invoice</h3>
              </div>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-[#8b949e] hover:text-[#f0f6fc] text-base">
                &times;
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[#c9d1d9] font-medium">Retail Client</label>
              <select
                value={newInvClient}
                onChange={(e) => setNewInvClient(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-[#f0f6fc]"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.company || 'Direct'})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[#c9d1d9] font-medium">Invoice Number</label>
                <input
                  type="text"
                  value={newInvNum}
                  onChange={(e) => setNewInvNum(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-[#f0f6fc] font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[#c9d1d9] font-medium">Due Date</label>
                <input
                  type="date"
                  value={newInvDue}
                  onChange={(e) => setNewInvDue(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-[#f0f6fc]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[#c9d1d9] font-medium">Quick Select Computer Part</label>
              <select
                onChange={(e) => {
                  const part = popularParts.find(p => p.name === e.target.value);
                  if (part) {
                    setNewInvPart(part.name);
                    setNewInvPrice(part.price.toString());
                  }
                }}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-[#58a6ff]"
              >
                {popularParts.map((p, idx) => (
                  <option key={idx} value={p.name}>{p.name} (৳ {p.price.toLocaleString()})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[#c9d1d9] font-medium">Hardware Component Description</label>
              <input
                type="text"
                value={newInvPart}
                onChange={(e) => setNewInvPart(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-[#f0f6fc]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[#c9d1d9] font-medium">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={newInvQty}
                  onChange={(e) => setNewInvQty(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-[#f0f6fc]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[#c9d1d9] font-medium">Unit Price (BDT)</label>
                <input
                  type="number"
                  value={newInvPrice}
                  onChange={(e) => setNewInvPrice(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-[#f0f6fc] font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white font-semibold shadow"
              >
                Issue Invoice (5% VAT)
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
