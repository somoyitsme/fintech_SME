import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  TrendingDown, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2
} from 'lucide-react';
import { api } from '../api';

export const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [pnl, setPnl] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [cat, setCat] = useState('Import Customs & Port Clearance Duty');
  const [amt, setAmt] = useState('125000');
  const [vendor, setVendor] = useState('Chittagong Port Customs Authority');
  const [desc, setDesc] = useState('Customs assessment & port duty on graphics card shipment');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [expList, expSum, pnlData] = await Promise.all([
        api.getExpenses(),
        api.getExpensesSummary(),
        api.getPnlReport()
      ]);
      setExpenses(expList);
      setSummary(expSum);
      setPnl(pnlData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createExpense({
        category: cat,
        amount: parseFloat(amt),
        vendor: vendor,
        description: desc,
        tax_deductible: true
      });
      setShowAddModal(false);
      loadData();
    } catch (err: any) {
      alert(`Error creating expense: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] tracking-tight">Showroom Expenses & Hardware P&L</h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Operational expenditures, port import duties, showroom rent, and sales commissions.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg text-xs font-semibold shadow transition"
        >
          <Plus className="w-3.5 h-3.5" /> Log Hardware Expense
        </button>
      </div>

      {/* P&L Executive Card */}
      {pnl && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider">Computer Hardware Trading P&L (YTD)</h2>
            <span className="text-xs text-[#3fb950] font-semibold bg-[#238636]/15 border border-[#238636]/30 px-2.5 py-0.5 rounded-full">
              Gross Trade Margin: {pnl.gross_margin_percentage}%
            </span>
          </div>
          <div className="grid grid-cols-5 gap-3.5 text-xs">
            <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
              <span className="text-[#8b949e] text-[10.5px]">Hardware Revenue</span>
              <div className="text-sm font-bold text-[#f0f6fc] mt-1 font-mono">৳ {pnl.revenue?.toLocaleString()}</div>
            </div>
            <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
              <span className="text-[#8b949e] text-[10.5px]">Cost of Inventory (COGS)</span>
              <div className="text-sm font-bold text-[#8b949e] mt-1 font-mono">৳ {pnl.estimated_cogs?.toLocaleString()}</div>
            </div>
            <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
              <span className="text-[#8b949e] text-[10.5px]">Gross Trade Profit</span>
              <div className="text-sm font-bold text-[#58a6ff] mt-1 font-mono">৳ {pnl.gross_profit?.toLocaleString()}</div>
            </div>
            <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
              <span className="text-[#8b949e] text-[10.5px]">Operating Expenses</span>
              <div className="text-sm font-bold text-[#ff7b72] mt-1 font-mono">৳ {pnl.operating_expenses?.total?.toLocaleString()}</div>
            </div>
            <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
              <span className="text-[#8b949e] text-[10.5px]">Net Operating Income</span>
              <div className="text-sm font-bold text-[#3fb950] mt-1 font-mono">৳ {pnl.net_income?.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown Chips */}
      {summary && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
          <h2 className="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider mb-2.5">Expenses by Hardware Category</h2>
          <div className="grid grid-cols-4 gap-2.5">
            {summary.category_breakdown?.map((catItem: any) => (
              <div key={catItem.category} className="bg-[#0d1117] border border-[#30363d] p-3 rounded-lg text-xs">
                <div className="text-[#8b949e] text-[10.5px] truncate">{catItem.category}</div>
                <div className="text-sm font-bold text-[#f0f6fc] mt-1 font-mono">৳ {catItem.amount.toLocaleString()}</div>
                <div className="text-[10px] text-[#58a6ff] mt-0.5">{catItem.percentage}% of total</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-[#c9d1d9]">
          <thead className="bg-[#1c2128] text-[#8b949e] uppercase tracking-wider text-[10px] border-b border-[#30363d]">
            <tr>
              <th className="py-2.5 px-4">Date</th>
              <th className="py-2.5 px-4">Expense Category</th>
              <th className="py-2.5 px-4">Vendor / Authority</th>
              <th className="py-2.5 px-4">Description</th>
              <th className="py-2.5 px-4">Tax Deductible</th>
              <th className="py-2.5 px-4 text-right">Amount (BDT)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#30363d]">
            {expenses.map((e) => (
              <tr key={e.id} className="hover:bg-[#1c2128]/50 transition">
                <td className="py-3 px-4 text-[#8b949e]">{e.date.slice(0, 10)}</td>
                <td className="py-3 px-4 font-semibold text-[#f0f6fc]">{e.category}</td>
                <td className="py-3 px-4 text-[#c9d1d9]">{e.vendor}</td>
                <td className="py-3 px-4 text-[#8b949e] max-w-xs truncate">{e.description}</td>
                <td className="py-3 px-4">
                  {e.tax_deductible ? (
                    <span className="text-[#3fb950] bg-[#238636]/15 border border-[#238636]/30 px-2 py-0.2 rounded text-[10px] font-semibold">
                      ✓ Deductible
                    </span>
                  ) : (
                    <span className="text-[#8b949e] text-[10px]">Standard</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-[#ff7b72]">
                  -৳ {e.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-md p-5 space-y-3.5 text-xs shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#f0f6fc] text-sm">Log Hardware Trade Expense</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-[#8b949e] hover:text-[#f0f6fc] text-base">
                &times;
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[#c9d1d9] font-medium">Category</label>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-[#f0f6fc]"
              >
                {[
                  'Import Customs & Port Clearance Duty',
                  'Sales Team Commission & Salaries',
                  'Elephant Road Multiplan Showroom Lease',
                  'Air Freight & Logistics Express',
                  'Digital Marketing & Facebook Ads',
                  'Showroom Utilities & High-Speed Fiber',
                  'Packaging & Anti-Static Bubble Film'
                ].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[#c9d1d9] font-medium">Vendor / Authority</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-[#f0f6fc]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#c9d1d9] font-medium">Description</label>
              <input
                type="text"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-[#f0f6fc]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[#c9d1d9] font-medium">Amount (BDT)</label>
              <input
                type="number"
                value={amt}
                onChange={(e) => setAmt(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-[#f0f6fc] font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 rounded-lg bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white font-semibold shadow"
              >
                Save Expense Entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
