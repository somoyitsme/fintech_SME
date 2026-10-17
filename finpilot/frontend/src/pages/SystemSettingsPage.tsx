import React, { useState } from 'react';
import { 
  Settings, 
  CreditCard, 
  Percent, 
  Globe, 
  Key, 
  Mail, 
  Save, 
  Check, 
  Bot, 
  ShieldCheck,
  Server
} from 'lucide-react';

export const SystemSettingsPage: React.FC = () => {
  const [savedMessage, setSavedMessage] = useState(false);

  const [settings, setSettings] = useState({
    // Payment Gateways
    bkashMerchantShortcode: '01711002233',
    bkashAppKey: 'bkash_app_live_8917238912',
    nagadMerchantId: 'NGD_DHAKA_SILICON_77',
    bankPaymentGateway: 'BRAC Bank Merchant POS Line 402',
    
    // Tax Rates
    nbrVatRatePercent: 5.0,
    aitTaxPercent: 3.0,
    binNumber: '003491823-0101 (Banani Circle)',

    // Domain & Platform
    domainName: 'erp.dhakasilicon.com',
    supportEmail: 'support@dhakasilicon.com',
    accountingEmail: 'accounts@dhakasilicon.com',

    // AI Agent Integration SDK
    agentServiceEndpoint: 'http://localhost:8100',
    agentApiKey: 'fpk_live_dhaka_silicon',
    agentModel: 'gemini-1.5-pro-sme'
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#f0f6fc]">
              System & Integration Settings
            </h1>
            <span className="text-[11px] bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-mono font-semibold px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8b949e] mt-0.5">
            Configure payment gateway credentials, National Board of Revenue VAT percentages, domain parameters, and AI Agent API hooks.
          </p>
        </div>

        {savedMessage && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 px-3 py-1.5 rounded-xl font-semibold">
            <Check className="w-4 h-4" /> Settings Updated Successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Payment Gateways Section */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-[#30363d]">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Payment Gateway Credentials
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                bKash Merchant Wallet Shortcode
              </label>
              <input
                type="text"
                value={settings.bkashMerchantShortcode}
                onChange={(e) => setSettings({ ...settings, bkashMerchantShortcode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                bKash Secret App Key (Encrypted)
              </label>
              <input
                type="password"
                value={settings.bkashAppKey}
                onChange={(e) => setSettings({ ...settings, bkashAppKey: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Nagad Merchant Terminal ID
              </label>
              <input
                type="text"
                value={settings.nagadMerchantId}
                onChange={(e) => setSettings({ ...settings, nagadMerchantId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Bank POS / Online Gateway Line
              </label>
              <input
                type="text"
                value={settings.bankPaymentGateway}
                onChange={(e) => setSettings({ ...settings, bankPaymentGateway: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Tax Rates (NBR) Section */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-[#30363d]">
            <Percent className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              National Board of Revenue (NBR) Tax Rates
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Standard Computer Parts VAT (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.nbrVatRatePercent}
                onChange={(e) => setSettings({ ...settings, nbrVatRatePercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                AIT Advance Income Tax (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.aitTaxPercent}
                onChange={(e) => setSettings({ ...settings, aitTaxPercent: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Registered BIN Number
              </label>
              <input
                type="text"
                value={settings.binNumber}
                onChange={(e) => setSettings({ ...settings, binNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* AI Agent Platform SDK Integration */}
        <div className="bg-white dark:bg-[#161b22] border border-slate-200 dark:border-[#30363d] rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-[#30363d]">
            <Bot className="w-5 h-5 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Autonomous AI Finance Agent Configuration
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Agent Hub Service Endpoint
              </label>
              <input
                type="text"
                value={settings.agentServiceEndpoint}
                onChange={(e) => setSettings({ ...settings, agentServiceEndpoint: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl font-mono text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Tenant API Key (AES-256 Partition Key)
              </label>
              <input
                type="text"
                value={settings.agentApiKey}
                onChange={(e) => setSettings({ ...settings, agentApiKey: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-[#21262d] border border-slate-200 dark:border-[#30363d] rounded-xl font-mono text-blue-600 dark:text-blue-400 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg transition"
          >
            <Save className="w-4 h-4" /> Save Global System Settings
          </button>
        </div>
      </form>
    </div>
  );
};
