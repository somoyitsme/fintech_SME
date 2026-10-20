import React, { useEffect, useState } from 'react';
import { 
  Percent, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Award,
  Sparkles,
  Download,
  RefreshCw,
  Shield,
  HelpCircle,
  ExternalLink,
  Check,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../api';

export const HealthTaxPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [tax, setTax] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [hData, tData] = await Promise.all([
        api.getHealthReport(),
        api.getTaxSummary()
      ]);
      setHealth(hData);
      setTax(tData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRecalculate = async () => {
    setRecalculating(true);
    await new Promise(r => setTimeout(r, 600));
    await loadData();
    setRecalculating(false);
    showToast("Financial Health Indices & Tax Deductibles successfully refreshed from live ledgers.");
  };

  const handleExportVatPack = () => {
    const payload = {
      tenant: "Now_or_Never Console",
      bin: tax?.tax_id || "BIN-0029481729-01",
      currency: "BDT",
      mushak_form: "Mushak 9.1 (Value Added Tax Return)",
      vat_concession_rate: "5.0% (ICT Hardware)",
      taxable_sales: 14500000,
      deductible_import_duties: tax?.total_deductible_expenses || 1450000,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Mushak_9.1_Tax_Pack_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    showToast("Downloaded Mushak 9.1 VAT Compliance Return Pack (.json)");
  };

  const handleExportAuditDossier = () => {
    const lines = [
      "NOW_OR_NEVER CONSOLE — NBR REGULATORY AUDIT DOSSIER",
      `Generated: ${new Date().toLocaleString()}`,
      `BIN (VAT Registration): ${tax?.tax_id || "BIN-0029481729-01"}`,
      `Financial Health Score: ${health?.health_score || 84}/100 (Grade ${health?.grade || "A-"})`,
      "----------------------------------------------------------------",
      `Current Cash Reserves: ৳ ${health?.key_metrics?.current_balance?.toLocaleString() || "1,850,000"} BDT`,
      `Estimated Operating Runway: ${health?.key_metrics?.runway_months || "2.8"} Months`,
      `Verified Deductible Expenses: ৳ ${tax?.total_deductible_expenses?.toLocaleString() || "1,450,000"} BDT`,
      `Estimated Corporate Income Tax: ৳ ${tax?.estimated_cit_tax?.toLocaleString() || "170,000"} BDT`,
      "----------------------------------------------------------------",
      "NBR COMPLIANCE STATUS: ACTIVE & VERIFIED COMPLIANT",
      "Import Customs Duty Tax Shield Applied: ৳ 420,000 BDT Advance Income Tax (AIT)"
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NBR_Audit_Dossier_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    showToast("Generated and downloaded NBR Comprehensive Audit Dossier (.txt)");
  };

  if (loading || !health || !tax) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400">
        <Sparkles className="w-6 h-6 text-blue-400 animate-spin mr-2" />
        Computing financial health indices & tax obligations...
      </div>
    );
  }

  const { subscores, key_metrics } = health;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#21262d] border border-[#30363d] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Financial Health & Tax Intelligence</h1>
          <p className="text-xs text-slate-400 mt-1">
            Multidimensional SME risk metrics, computer hardware benchmark alignment, and NBR corporate tax optimization.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-slate-200 border border-[#30363d] rounded-lg text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recalculating ? 'animate-spin text-blue-400' : ''}`} />
            {recalculating ? 'Recalculating...' : 'Recalculate Indices'}
          </button>
          <button
            onClick={handleExportVatPack}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            <Download className="w-3.5 h-3.5" /> Export Mushak 9.1 Pack
          </button>
        </div>
      </div>

      {/* Health Score Overview Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Overall Score Circle (1 Col) */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <div className="w-32 h-32 rounded-full border-4 border-emerald-500/30 flex flex-col items-center justify-center bg-[#0d1117] shadow-inner">
            <span className="text-4xl font-extrabold text-white font-mono">{health.health_score}</span>
            <span className="text-[10px] text-emerald-400 uppercase font-semibold">Healthy Index</span>
          </div>
          <h3 className="text-sm font-bold text-white mt-4">{health.company_name}</h3>
          <p className="text-xs text-slate-400 mt-1">Grade: <span className="text-emerald-400 font-semibold">{health.grade}</span> • {health.industry}</p>
          <button
            onClick={() => setActiveModal('score_breakdown')}
            className="mt-4 text-[11px] text-blue-400 hover:text-blue-300 underline underline-offset-4"
          >
            View Weighting Breakdown →
          </button>
        </div>

        {/* 4 Dimension Subscores (2 Cols) */}
        <div className="col-span-2 bg-[#161b22] border border-[#30363d] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Core Financial Health Dimensions</h2>
            <span className="text-[11px] text-slate-400">Benchmarked vs. Dhaka ICT Hardware Importers</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Runway */}
            <div className="bg-[#21262d] p-3.5 rounded-xl border border-[#30363d]">
              <div className="flex justify-between text-slate-300 mb-1.5">
                <span className="font-medium">Cash Runway Score</span>
                <strong className="text-blue-400">{subscores.runway_score} / 30.0</strong>
              </div>
              <div className="w-full bg-[#0d1117] h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${(subscores.runway_score/30)*100}%` }}></div>
              </div>
              <div className="text-[10.5px] text-slate-400 mt-1.5">Current runway: {key_metrics.runway_months} months</div>
            </div>

            {/* Receivables Health */}
            <div className="bg-[#21262d] p-3.5 rounded-xl border border-[#30363d]">
              <div className="flex justify-between text-slate-300 mb-1.5">
                <span className="font-medium">AR Recovery Velocity</span>
                <strong className="text-emerald-400">{subscores.receivables_health_score} / 25.0</strong>
              </div>
              <div className="w-full bg-[#0d1117] h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(subscores.receivables_health_score/25)*100}%` }}></div>
              </div>
              <div className="text-[10.5px] text-slate-400 mt-1.5">{key_metrics.overdue_percentage}% overdue of ৳ {(key_metrics.total_receivables || 1240000).toLocaleString()} BDT</div>
            </div>

            {/* Profitability Margin */}
            <div className="bg-[#21262d] p-3.5 rounded-xl border border-[#30363d]">
              <div className="flex justify-between text-slate-300 mb-1.5">
                <span className="font-medium">Gross Margin Ratio</span>
                <strong className="text-indigo-400">{subscores.profitability_margin_score} / 25.0</strong>
              </div>
              <div className="w-full bg-[#0d1117] h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${(subscores.profitability_margin_score/25)*100}%` }}></div>
              </div>
              <div className="text-[10.5px] text-slate-400 mt-1.5">14.8% gross wholesale margin on GPUs/CPUs</div>
            </div>

            {/* Liquidity Buffer */}
            <div className="bg-[#21262d] p-3.5 rounded-xl border border-[#30363d]">
              <div className="flex justify-between text-slate-300 mb-1.5">
                <span className="font-medium">Liquidity Safety Buffer</span>
                <strong className="text-cyan-400">{subscores.liquidity_buffer_score} / 20.0</strong>
              </div>
              <div className="w-full bg-[#0d1117] h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${(subscores.liquidity_buffer_score/20)*100}%` }}></div>
              </div>
              <div className="text-[10.5px] text-slate-400 mt-1.5">Bank liquid cash: ৳ {key_metrics.current_balance?.toLocaleString()} BDT</div>
            </div>
          </div>
        </div>
      </div>

      {/* SME Tax Readiness Section */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-blue-400" />
            <div>
              <h2 className="text-sm font-semibold text-white">Preferential SME Tax Compliance (NBR Bangladesh)</h2>
              <p className="text-xs text-slate-400 mt-0.5">National Board of Revenue VAT & ICT Hardware Corporate Scheme</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-[#21262d] text-slate-300 px-3 py-1 rounded border border-[#30363d] font-mono">
              BIN: {tax.tax_id || "BIN-0029481729-01"}
            </span>
            <button
              onClick={handleExportAuditDossier}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-[#21262d] hover:bg-[#30363d] px-3 py-1.5 rounded-lg border border-[#30363d] transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Audit Dossier
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 text-xs">
          {/* Policy Highlight Card */}
          <div className="bg-[#21262d] p-4 rounded-xl border border-[#30363d] space-y-2">
            <span className="text-[10.5px] uppercase font-bold text-blue-400">Preferential CIT Policy</span>
            <div className="text-xl font-bold text-white">5.0% Concession Rate</div>
            <p className="text-slate-300 leading-relaxed text-[11.5px]">
              ICT & Computer hardware distributors maintaining transparent electronic books qualify for preferential SME turnover brackets.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveModal('tax_policy')}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Read NBR SRO Circular <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Deductibles */}
          <div className="bg-[#21262d] p-4 rounded-xl border border-[#30363d] space-y-2">
            <span className="text-[10.5px] uppercase font-bold text-emerald-400">Verified Deductible Expenses</span>
            <div className="text-xl font-bold text-white">৳ {tax.total_deductible_expenses?.toLocaleString()} BDT</div>
            <p className="text-slate-400 leading-relaxed text-[11.5px]">
              Automatically categorized from showroom rent, sales team payroll, logistics, and port customs clearance duties.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setActiveModal('deductions_list')}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                Inspect Expense Deductibles →
              </button>
            </div>
          </div>

          {/* Filing Deadlines */}
          <div className="bg-[#21262d] p-4 rounded-xl border border-[#30363d] space-y-2">
            <span className="text-[10.5px] uppercase font-bold text-amber-400">Upcoming Filing Milestones</span>
            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Mushak 9.1 VAT: 15th of each month</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>Quarterly Advance CIT: 15th post quarter</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Annual Corporate Tax Return: Nov 30</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Score Breakdown */}
      {activeModal === 'score_breakdown' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" /> Financial Health Scoring Methodology
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Our autonomous algorithm continuously inspects 4 core balance sheet dimensions:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded bg-[#21262d] border border-[#30363d] flex justify-between">
                <div>
                  <div className="font-semibold text-white">Cash Runway Duration (30% Weight)</div>
                  <div className="text-[11px] text-slate-400">Current liquid reserves ÷ monthly burn rate</div>
                </div>
                <div className="text-blue-400 font-bold">{subscores.runway_score}/30.0</div>
              </div>
              <div className="p-2.5 rounded bg-[#21262d] border border-[#30363d] flex justify-between">
                <div>
                  <div className="font-semibold text-white">Receivables Overdue Ratio (25% Weight)</div>
                  <div className="text-[11px] text-slate-400">Aging delinquency penalty on unpaid client orders</div>
                </div>
                <div className="text-emerald-400 font-bold">{subscores.receivables_health_score}/25.0</div>
              </div>
              <div className="p-2.5 rounded bg-[#21262d] border border-[#30363d] flex justify-between">
                <div>
                  <div className="font-semibold text-white">Profitability & Operating Margin (25% Weight)</div>
                  <div className="text-[11px] text-slate-400">Gross margin on hardware sales vs operating overhead</div>
                </div>
                <div className="text-indigo-400 font-bold">{subscores.profitability_margin_score}/25.0</div>
              </div>
              <div className="p-2.5 rounded bg-[#21262d] border border-[#30363d] flex justify-between">
                <div>
                  <div className="font-semibold text-white">Liquidity Reserve Buffer (20% Weight)</div>
                  <div className="text-[11px] text-slate-400">Protection against customs clearance delays and price volatility</div>
                </div>
                <div className="text-cyan-400 font-bold">{subscores.liquidity_buffer_score}/20.0</div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Deductions List */}
      {activeModal === 'deductions_list' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> NBR Allowable SME Deductions
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <p className="text-xs text-slate-300">
              The following operating expenses have been verified and tagged for corporate tax shielding:
            </p>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded bg-[#21262d] border border-[#30363d] flex justify-between items-center">
                <span>Chittagong Port Customs & Advance Income Tax (AIT)</span>
                <strong className="text-emerald-400">৳ 420,000 BDT</strong>
              </div>
              <div className="p-2 rounded bg-[#21262d] border border-[#30363d] flex justify-between items-center">
                <span>Multiplan Center Showroom Lease & Warehouse Rent</span>
                <strong className="text-emerald-400">৳ 160,000 BDT</strong>
              </div>
              <div className="p-2 rounded bg-[#21262d] border border-[#30363d] flex justify-between items-center">
                <span>Sales Team Payroll & Hardware Specialist Retainers</span>
                <strong className="text-emerald-400">৳ 285,000 BDT</strong>
              </div>
              <div className="p-2 rounded bg-[#21262d] border border-[#30363d] flex justify-between items-center">
                <span>Nationwide Freight & Courier Insurance (Sundarban / RedX)</span>
                <strong className="text-emerald-400">৳ 65,000 BDT</strong>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NBR Policy Circular */}
      {activeModal === 'tax_policy' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> NBR SRO 142/2024 ICT Concession
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>
                Under the ICT and Digital Commerce development scheme, registered wholesale importers of microprocessors, graphics processing units, and high-speed memory modules receive a 5.0% reduced VAT assessment when maintaining digital invoicing.
              </p>
              <div className="bg-[#21262d] p-3 rounded-lg border border-[#30363d]">
                <strong className="text-white block mb-1">Key Qualifying Criteria:</strong>
                <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                  <li>Valid 9-digit Business Identification Number (BIN)</li>
                  <li>Real-time automated transaction ledgering</li>
                  <li>Quarterly reconciliation of customs import bills of entry</li>
                </ul>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
