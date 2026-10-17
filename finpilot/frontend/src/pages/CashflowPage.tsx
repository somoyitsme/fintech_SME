import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  Sliders, 
  Sparkles, 
  Building2,
  Cpu
} from 'lucide-react';
import { 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { api } from '../api';

interface CashflowPageProps {
  onAskCopilot: (query: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const CashflowPage: React.FC<CashflowPageProps> = ({ onAskCopilot, onNavigateTab }) => {
  const [forecast, setForecast] = useState<any>(null);
  const [horizon, setHorizon] = useState<number>(60);
  const [loading, setLoading] = useState(true);

  // Scenario Simulation Sliders
  const [collectionDelayDays, setCollectionDelayDays] = useState<number>(0);
  const [expenseMultiplier, setExpenseMultiplier] = useState<number>(1.0);

  useEffect(() => {
    async function loadForecast() {
      setLoading(true);
      try {
        const data = await api.getCashFlowForecast(horizon);
        setForecast(data);
      } catch (e) {
        console.error("Failed to load forecast", e);
      } finally {
        setLoading(false);
      }
    }
    loadForecast();
  }, [horizon]);

  if (loading || !forecast) {
    return (
      <div className="flex items-center justify-center h-96 text-[#8b949e]">
        <Sparkles className="w-5 h-5 text-[#58a6ff] animate-spin mr-2" />
        Running time-series liquidity forecast for hardware import schedule...
      </div>
    );
  }

  // Apply scenario simulation adjustments to projections
  const simulatedProjections = forecast.daily_projections.map((dp: any) => {
    const adjustedOut = dp.projected_cash_out * expenseMultiplier;
    const adjustedBalance = dp.projected_balance - (dp.day * (adjustedOut - dp.projected_cash_out)) - (collectionDelayDays * 6500);
    return {
      ...dp,
      simulated_balance: Math.max(0, adjustedBalance)
    };
  });

  return (
    <div className="space-y-5">
      {/* Title & Horizon Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Cash Flow & Hardware Import Runway</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Predictive cash forecasting modeled against PC parts retail collection cycles and port customs clearance duties.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#161b22] p-1 rounded-lg border border-slate-200 dark:border-[#30363d]">
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setHorizon(d)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                horizon === d ? 'bg-white dark:bg-[#21262d] text-slate-900 dark:text-[#f0f6fc] border border-slate-300 dark:border-[#30363d] shadow-sm' : 'text-slate-600 dark:text-[#8b949e] hover:text-slate-900 dark:hover:text-[#f0f6fc]'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Liquidity Dip Alert Banner */}
      {forecast.danger_detected && (
        <div className="bg-rose-50 dark:bg-[#f85149]/10 border border-rose-200 dark:border-[#f85149]/30 rounded-xl p-3.5 flex items-center justify-between text-xs text-rose-600 dark:text-[#ff7b72]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-100 dark:bg-[#f85149]/20 text-rose-600 dark:text-[#ff7b72]">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-xs text-slate-900 dark:text-[#f0f6fc] flex items-center gap-2">
                Projected Liquidity Breach around Day {forecast.liquidity_dip_day}
                <span className="text-[9.5px] bg-rose-100 dark:bg-[#f85149]/20 text-rose-700 dark:text-[#ff7b72] px-2 py-0.5 rounded font-mono font-bold">
                  Breaches ৳ 500,000 Safety Buffer
                </span>
              </div>
              <p className="text-slate-700 dark:text-[#c9d1d9] text-[11.5px] mt-0.5">
                Chittagong Port customs clearance duty for the incoming GPU/CPU container coincides with Elephant Road showroom rent and staff commissions.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('financing')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shrink-0 ml-3 transition flex items-center gap-1.5 shadow"
          >
            <Building2 className="w-3.5 h-3.5" />
            Bridge with WeBank Trade Credit
          </button>
        </div>
      )}

      {/* Main Forecast Chart with Confidence Band */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-[#f0f6fc] uppercase tracking-wider">Projected Cash Balance & 95% Confidence Band</h2>
            <div className="flex items-center gap-4 text-[11px] text-slate-600 dark:text-[#8b949e] mt-1">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-[#58a6ff]"></span> Base Forecast
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-[#d2a8ff]"></span> Simulated Stress Scenario
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-2 bg-[#388bfd]/20 rounded-sm"></span> 95% Confidence Band
              </span>
              <span className="flex items-center gap-1 text-rose-600 dark:text-[#ff7b72]">
                <span className="w-3 h-0.5 bg-rose-500"></span> ৳ 500k Safety Line
              </span>
            </div>
          </div>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={simulatedProjections} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#388bfd" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#388bfd" stopOpacity={0.03}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(v) => `৳${v/1000}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }}
                formatter={(val: any, name: any) => [`৳ ${Number(val).toLocaleString()}`, name]}
              />
              <ReferenceLine y={500000} stroke="#f85149" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="confidence_high" stroke="transparent" fill="url(#confidenceBand)" name="Upper Confidence" />
              <Area type="monotone" dataKey="confidence_low" stroke="transparent" fill="transparent" name="Lower Confidence" />
              <Line type="monotone" dataKey="projected_balance" stroke="#3b82f6" strokeWidth={2} dot={false} name="Expected Balance" />
              <Line type="monotone" dataKey="simulated_balance" stroke="#a855f7" strokeWidth={2} strokeDasharray="3 3" dot={false} name="Simulated Scenario" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scenario Stress-Testing Simulator */}
      <div className="bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Sliders className="w-4 h-4 text-blue-500" />
          <h2 className="text-xs font-bold text-slate-900 dark:text-[#f0f6fc] uppercase tracking-wider">Hardware Sales Stress Simulator</h2>
        </div>
        <div className="grid grid-cols-2 gap-8 text-xs">
          {/* Slider 1: Delay in Retailer Receivables */}
          <div className="space-y-2">
            <div className="flex justify-between text-slate-800 dark:text-[#c9d1d9]">
              <span className="font-medium">Retailer Credit Payment Delay:</span>
              <strong className="text-blue-600 dark:text-[#58a6ff] font-mono">{collectionDelayDays} Days Late</strong>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={collectionDelayDays}
              onChange={(e) => setCollectionDelayDays(Number(e.target.value))}
              className="w-full accent-blue-600 bg-slate-200 dark:bg-slate-700"
            />
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Simulates impact if key clients (StarTech, Ryans, Nexus IT) delay payments past Net-30/45 terms.
            </div>
          </div>

          {/* Slider 2: Operational Burn & Port Tariff Shift */}
          <div className="space-y-2">
            <div className="flex justify-between text-slate-800 dark:text-[#c9d1d9]">
              <span className="font-medium">Hardware Import Duty & Freight Shift:</span>
              <strong className="text-blue-600 dark:text-[#58a6ff] font-mono">{Math.round((expenseMultiplier - 1.0) * 100)}% Change</strong>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.5"
              step="0.05"
              value={expenseMultiplier}
              onChange={(e) => setExpenseMultiplier(Number(e.target.value))}
              className="w-full accent-blue-600 bg-slate-200 dark:bg-slate-700"
            />
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Simulates customs tariff changes, fuel surcharge on air freight, or showroom expansion costs.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
