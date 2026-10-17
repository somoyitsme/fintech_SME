import React from 'react';
import { ShieldAlert, ArrowRight, ArrowLeft, Lock, UserCheck, KeyRound } from 'lucide-react';

interface RestrictedAccessPageProps {
  moduleTitle: string;
  userRole: string;
  userName: string;
  onSwitchToOwner: () => void;
  onBackToDashboard: () => void;
}

export const RestrictedAccessPage: React.FC<RestrictedAccessPageProps> = ({
  moduleTitle,
  userRole,
  userName,
  onSwitchToOwner,
  onBackToDashboard
}) => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#d29922]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#388bfd]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#d29922]/15 border border-[#d29922]/30 text-[#e3b341] flex items-center justify-center mx-auto mb-5 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Access Restriction Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#21262d] border border-[#30363d] text-[11px] font-mono text-[#8b949e] mb-3">
          <Lock className="w-3.5 h-3.5 text-[#e3b341]" />
          <span>Role-Based Access Control (RBAC) • Confidentiality Protocol</span>
        </div>

        <h2 className="text-2xl font-bold text-[#f0f6fc] tracking-tight mb-2">
          {moduleTitle} is Restricted
        </h2>
        
        <p className="text-sm text-[#8b949e] max-w-xl mx-auto leading-relaxed mb-6">
          You are currently logged in as <span className="text-[#f0f6fc] font-semibold">{userName}</span> (<span className="text-[#58a6ff] font-mono text-xs">{userRole}</span>). 
          Company bank account balances, monthly cash burn, net profit margins, bank credit facilities, and NBR tax records are classified as executive financial data and hidden from operational staff.
        </p>

        {/* Role Comparison Card */}
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-8 text-left">
          <div className="p-3.5 rounded-xl bg-[#0d1117] border border-[#30363d]/80">
            <div className="text-[11px] font-mono uppercase text-[#8b949e] flex items-center gap-1.5 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#58a6ff]"></span> Current: Salesman Role
            </div>
            <ul className="text-xs text-[#c9d1d9] space-y-1">
              <li className="flex items-center gap-1.5 text-emerald-400">✓ Parts Inventory & Stocks</li>
              <li className="flex items-center gap-1.5 text-emerald-400">✓ Sales Invoicing & Billing</li>
              <li className="flex items-center gap-1.5 text-emerald-400">✓ Customer AR Balances</li>
              <li className="flex items-center gap-1.5 text-rose-400/80">✗ Bank Runway & Liquidity</li>
              <li className="flex items-center gap-1.5 text-rose-400/80">✗ Confidential P&L Margins</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-[#1c2128] border border-[#388bfd]/30">
            <div className="text-[11px] font-mono uppercase text-[#58a6ff] flex items-center gap-1.5 mb-1.5 font-semibold">
              <KeyRound className="w-3.5 h-3.5 text-[#58a6ff]" /> Owner / MD Role
            </div>
            <ul className="text-xs text-[#c9d1d9] space-y-1">
              <li className="flex items-center gap-1.5 text-emerald-400">✓ Full Executive Access</li>
              <li className="flex items-center gap-1.5 text-emerald-400">✓ Bank Accounts & Runway</li>
              <li className="flex items-center gap-1.5 text-emerald-400">✓ Monthly Hardware P&L</li>
              <li className="flex items-center gap-1.5 text-emerald-400">✓ Trade Financing Lines</li>
              <li className="flex items-center gap-1.5 text-emerald-400">✓ NBR Tax Compliance</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-[#f0f6fc] border border-[#30363d] text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Sales Cockpit
          </button>
          <button
            onClick={onSwitchToOwner}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition"
          >
            <UserCheck className="w-4 h-4" /> Switch to Farhan Chowdhury (Owner / MD) <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
