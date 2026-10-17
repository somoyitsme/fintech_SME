import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Sparkles, 
  FileCheck2,
  Cpu
} from 'lucide-react';
import { api } from '../api';

export const FinancingPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [amountNeeded, setAmountNeeded] = useState<string>('500000');
  const [purpose, setPurpose] = useState<string>('inventory');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [prequalData, setPrequalData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await api.getFinancingProducts();
      setProducts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.matchFinancing(parseFloat(amountNeeded), purpose);
      if (res && res.recommended_products) {
        setProducts(res.recommended_products);
      }
    } catch (e) {
      alert("Error matching trade financing options");
    }
  };

  const handleCheckPrequal = async (product: any) => {
    setSelectedProduct(product);
    setPrequalData(null);
    try {
      const res = await api.preQualifyCheck(product.id);
      setPrequalData(res);
    } catch (e) {
      alert("Error checking credit pre-qualification");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] tracking-tight">Trade Financing & Hardware Credit</h1>
          <p className="text-xs text-[#8b949e] mt-0.5">
            Non-dilutive working capital and invoice factoring pre-qualified from verified computer parts sales.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#238636]/10 border border-[#238636]/30 px-3 py-1 rounded-lg text-xs font-semibold text-[#3fb950]">
          <ShieldCheck className="w-3.5 h-3.5" />
          Pre-Qualification Active (Score: 84.0)
        </div>
      </div>

      {/* Capital Matching Calculator */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
        <h2 className="text-xs font-bold text-[#f0f6fc] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#58a6ff]" /> AI Working Capital Matcher
        </h2>
        <form onSubmit={handleMatch} className="grid grid-cols-4 gap-3 items-end text-xs">
          <div className="space-y-1">
            <label className="text-[#c9d1d9] font-medium">Financing Needed (BDT)</label>
            <input
              type="number"
              value={amountNeeded}
              onChange={(e) => setAmountNeeded(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-[#f0f6fc] font-mono font-semibold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[#c9d1d9] font-medium">Financing Purpose</label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-[#f0f6fc]"
            >
              <option value="inventory">GPU & CPU Container Inventory</option>
              <option value="working_capital">Working Capital & Payroll</option>
              <option value="bridging">Invoice Liquidity Bridging</option>
              <option value="expansion">Showroom & Warehouse Expansion</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[#c9d1d9] font-medium">Credit Backing</label>
            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-2 text-[#8b949e] font-mono text-[11px]">
              Computer Parts Sales & Invoices
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white font-semibold transition shadow"
          >
            Match Optimal Products
          </button>
        </form>
      </div>

      {/* Featured Highlight: WeBank Weiyedai Global SME Credit */}
      <div className="bg-[#161b22] border-2 border-[#388bfd]/40 rounded-xl p-5 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 bg-[#21262d] border-b border-l border-[#388bfd]/40 text-[#58a6ff] text-[10.5px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 font-mono">
          <Zap className="w-3 h-3 text-[#e3b341]" /> #1 Recommended for Hardware Trading
        </div>

        <div className="flex items-start justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#58a6ff]">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#f0f6fc]">WeBank Weiyedai Global SME Credit (微业贷)</h3>
                <div className="text-[11px] text-[#8b949e]">Provider: WeBank (微众银行) FinTech Partner · Unsecured Revolving Credit</div>
              </div>
            </div>

            <p className="text-xs text-[#c9d1d9] mt-2.5 leading-relaxed">
              China & Global FinTech pioneer 100% digital unsecured revolving line. Appraised automatically through your verified computer hardware sales receipts, Mushak VAT filings, and bank ledger cash flows. Zero physical collateral required.
            </p>

            <div className="grid grid-cols-4 gap-3 mt-4 text-xs">
              <div className="bg-[#0d1117] p-2.5 rounded-lg border border-[#30363d]">
                <span className="text-[#8b949e] text-[10px] uppercase font-semibold">Credit Limit</span>
                <div className="text-sm font-bold text-[#f0f6fc] mt-0.5 font-mono">Up to ৳ 5,000,000</div>
              </div>
              <div className="bg-[#0d1117] p-2.5 rounded-lg border border-[#30363d]">
                <span className="text-[#8b949e] text-[10px] uppercase font-semibold">Interest Rate</span>
                <div className="text-sm font-bold text-[#3fb950] mt-0.5">4.2% – 9.8% APR</div>
              </div>
              <div className="bg-[#0d1117] p-2.5 rounded-lg border border-[#30363d]">
                <span className="text-[#8b949e] text-[10px] uppercase font-semibold">Approval Speed</span>
                <div className="text-sm font-bold text-[#58a6ff] mt-0.5">&lt; 5 Minutes</div>
              </div>
              <div className="bg-[#0d1117] p-2.5 rounded-lg border border-[#30363d]">
                <span className="text-[#8b949e] text-[10px] uppercase font-semibold">Pre-Approval Odds</span>
                <div className="text-sm font-bold text-[#3fb950] mt-0.5">High (92%)</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2.5 mt-8">
            <button
              onClick={() => handleCheckPrequal(products.find(p => p.id === 'webank-weiyedai') || products[0])}
              className="px-4 py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-xs shadow transition flex items-center gap-1.5"
            >
              <FileCheck2 className="w-3.5 h-3.5" /> Check Pre-Qualification
            </button>
            <span className="text-[10.5px] text-[#8b949e] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#3fb950]" /> Hardware turnover verified
            </span>
          </div>
        </div>
      </div>

      {/* Other Financing Products Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {products.filter(p => p.id !== 'webank-weiyedai').map((prod) => (
          <div key={prod.id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 flex flex-col justify-between hover:border-[#484f58] transition">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono text-[#58a6ff] uppercase">{prod.type}</span>
                <span className="text-xs font-semibold text-[#3fb950]">{prod.interest_rate_range}</span>
              </div>
              <h3 className="font-bold text-[#f0f6fc] text-xs">{prod.name}</h3>
              <div className="text-[#8b949e] text-[11px] mt-0.5">By {prod.provider}</div>
              <p className="text-[#c9d1d9] text-[11px] mt-2 leading-relaxed line-clamp-2">
                {prod.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#30363d] mt-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-[#8b949e] text-[10.5px]">Limit:</span>
                <strong className="text-[#f0f6fc] ml-1 font-mono">৳ {prod.max_amount?.toLocaleString()}</strong>
              </div>
              <button
                onClick={() => handleCheckPrequal(prod)}
                className="px-3 py-1 rounded-md bg-[#21262d] hover:bg-[#30363d] text-[#f0f6fc] text-xs font-medium border border-[#30363d] transition"
              >
                Pre-Qualify
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pre-Qualification Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-lg p-5 space-y-3.5 text-xs shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#f0f6fc] text-sm">{selectedProduct.name}</h3>
                <div className="text-[#8b949e] text-[11px]">{selectedProduct.provider}</div>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="text-[#8b949e] hover:text-[#f0f6fc] text-base">
                &times;
              </button>
            </div>

            {prequalData ? (
              <div className="space-y-3.5">
                <div className="bg-[#238636]/10 border border-[#238636]/30 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-[#3fb950] font-medium">Status</div>
                    <div className="text-sm font-bold text-[#3fb950]">{prequalData.pre_qualification_status}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[#3fb950] font-medium">Approval Likelihood</div>
                    <div className="text-sm font-bold text-[#f0f6fc]">{prequalData.approval_likelihood}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[#c9d1d9] font-medium">Recommended Pre-Approved Credit Limit:</span>
                  <div className="text-xl font-bold text-[#f0f6fc] font-mono">
                    ৳ {prequalData.recommended_credit_limit?.toLocaleString()} BDT
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[#c9d1d9] font-medium">Required Digital Documents:</span>
                  <ul className="space-y-1 text-[#c9d1d9]">
                    {prequalData.required_documents?.map((doc: string, idx: number) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3fb950] shrink-0" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    alert("Digital Verification Packet compiled for WeBank/Lender review and recorded in FinPilot audit log.");
                    setSelectedProduct(null);
                  }}
                  className="w-full py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white font-semibold text-xs shadow transition flex items-center justify-center gap-1.5"
                >
                  <FileCheck2 className="w-3.5 h-3.5" /> Export Pre-Approved Verification Packet
                </button>
              </div>
            ) : (
              <div className="py-6 text-center text-[#8b949e] flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-[#58a6ff] animate-spin" /> Evaluating hardware sales volume & credit odds...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
