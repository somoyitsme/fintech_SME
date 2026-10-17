import React, { useEffect, useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  ExternalLink, 
  Key, 
  Layers,
  Sparkles,
  Bot,
  Send,
  Building2,
  Server,
  Network,
  CheckCircle2,
  Zap,
  Globe2,
  Cpu
} from 'lucide-react';
import { api, BACKEND_URL } from '../api';

interface SimulatedSME {
  id: string;
  name: string;
  industry: string;
  currency: string;
  balance: number;
  monthly_burn: number;
  open_receivables: number;
  overdue_receivables: number;
  health_score: number;
  description: string;
  samplePrompt: string;
}

const PRESET_SMES: SimulatedSME[] = [
  {
    id: 'hardware',
    name: 'Dhaka Silicon & Hardware Ltd.',
    industry: 'Computer Parts & PC Components Wholesale',
    currency: 'BDT',
    balance: 1850000,
    monthly_burn: 657000,
    open_receivables: 1240000,
    overdue_receivables: 475000,
    health_score: 84,
    description: 'Direct live database of GPUs, CPUs, motherboards, and nationwide retail accounts.',
    samplePrompt: 'Can we afford to order 40 units of RTX 4070 Super GPUs, or should we draw WeBank credit?'
  },
  {
    id: 'pharma',
    name: 'MediCare Pharma Ltd.',
    industry: 'Pharmaceutical Wholesale & Diagnostic Labs',
    currency: 'BDT',
    balance: 2400000,
    monthly_burn: 820000,
    open_receivables: 1890000,
    overdue_receivables: 610000,
    health_score: 88,
    description: 'Hospital medicine supplier with high prescription turnover and 45-day credit terms.',
    samplePrompt: 'How will 60-day delayed hospital receivables impact our antibiotic inventory restocking?'
  },
  {
    id: 'restaurant',
    name: 'Bengal Cloud Kitchens Ltd.',
    industry: 'Food & Beverage / Restaurant Chain',
    currency: 'BDT',
    balance: 920000,
    monthly_burn: 540000,
    open_receivables: 310000,
    overdue_receivables: 85000,
    health_score: 79,
    description: 'Multi-outlet cloud kitchens with daily raw material inventory and perishable food spoilage.',
    samplePrompt: 'Our food delivery platform payouts are delayed by 14 days. What is our deficit risk?'
  },
  {
    id: 'logistics',
    name: 'Apex FastLogistics SME',
    industry: 'E-commerce Delivery & Fleet Logistics',
    currency: 'BDT',
    balance: 1450000,
    monthly_burn: 710000,
    open_receivables: 950000,
    overdue_receivables: 320000,
    health_score: 82,
    description: 'Nationwide last-mile parcel carrier managing commercial van leases and fuel expenses.',
    samplePrompt: 'We need ৳ 25 Lakh to acquire 5 electric delivery vans. Which digital loan qualifies?'
  }
];

export const IntegrationPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('Production ERP Widget');
  const [createdRawKey, setCreatedRawKey] = useState<string | null>(null);

  // Multi-SME Interactive Playground state
  const [selectedSme, setSelectedSme] = useState<SimulatedSME>(PRESET_SMES[0]);
  const [playgroundPrompt, setPlaygroundPrompt] = useState(PRESET_SMES[0].samplePrompt);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundResponse, setPlaygroundResponse] = useState<string | null>(null);
  const [playgroundSpecialist, setPlaygroundSpecialist] = useState<string | null>(null);

  const embedCodeSnippet = `<!-- 1-Line Universal FinPilot Standalone Agent Script -->
<script 
  src="http://localhost:8100/sdk/finpilot-sdk.js" 
  data-api-key="fpk_live_dhaka_silicon">
</script>`;

  const curlSnippet = `curl -X POST "http://localhost:8100/api/v1/chat" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: fpk_live_dhaka_silicon" \\
  -d '{
    "message": "Analyze cash runway, overdue receivables, and WeBank credit prequalification"
  }'`;

  useEffect(() => {
    loadKeys();
  }, []);

  async function loadKeys() {
    try {
      const keys = await api.getApiKeys();
      setApiKeys(keys);
    } catch (e) {
      console.error(e);
    }
  }

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createApiKey(newKeyName);
      setCreatedRawKey(res.raw_key);
      loadKeys();
    } catch (e) {
      alert("Error generating API key");
    }
  };

  const copyToClipboard = (text: string, type: 'code' | 'curl' | string) => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else if (type === 'curl') {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } else {
      setCopiedKey(type);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  const handleSmeSelect = (sme: SimulatedSME) => {
    setSelectedSme(sme);
    setPlaygroundPrompt(sme.samplePrompt);
    setPlaygroundResponse(null);
  };

  const handlePlaygroundSend = async () => {
    if (!playgroundPrompt.trim() || playgroundLoading) return;
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);

    try {
      const apiKey = selectedSme.id === 'pharma' ? 'fpk_live_medcare_pharma' : 'fpk_live_dhaka_silicon';
      
      const res = await fetch("http://localhost:8100/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey
        },
        body: JSON.stringify({ message: playgroundPrompt })
      });

      if (res.ok) {
        const data = await res.json();
        setPlaygroundResponse(data.content);
        setPlaygroundSpecialist(data.specialist);
      } else {
        // Fallback to internal copilot if port 8100 is unavailable
        const contextData = {
          sme: {
            company_name: selectedSme.name,
            industry: selectedSme.industry,
            currency: selectedSme.currency,
            current_balance: selectedSme.balance,
            monthly_burn_rate: selectedSme.monthly_burn,
            open_receivables: selectedSme.open_receivables,
            overdue_receivables: selectedSme.overdue_receivables,
            health_score: selectedSme.health_score
          }
        };
        const fallbackRes = await api.chatCopilotWithContext(playgroundPrompt, contextData);
        setPlaygroundResponse(fallbackRes.content);
        setPlaygroundSpecialist(fallbackRes.specialist);
      }
    } catch (e: any) {
      setPlaygroundResponse(`Error querying agent: ${e.message || "Failed to connect to agent service"}`);
    } finally {
      setPlaygroundLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Standalone AI Agent Engine & Integration Hub</h1>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold uppercase">
              Decoupled Microservice
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            FinPilot is built as an independent, universal AI Virtual CFO platform. Connect it to <strong>ANY SME</strong> (computer parts, pharma, restaurants, logistics) via 1 line of JS or REST API.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="http://localhost:8100/sdk/demo/demo-host.html"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-slate-200 border border-[#30363d] rounded-lg text-xs font-semibold shadow transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" /> Hardware SME Demo
          </a>
          <a
            href="http://localhost:8100/sdk/demo/demo-pharmacy.html"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold shadow transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400" /> Pharmacy SME Demo
          </a>
          <a
            href="http://localhost:8100/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-semibold shadow transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" /> Agent Swagger API
          </a>
        </div>
      </div>

      {/* Architecture Visual Explainer Card */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
          <Network className="w-4 h-4 text-blue-400" /> Decoupled Multi-SME Platform Architecture
        </h2>
        <div className="grid grid-cols-4 gap-3 text-xs">
          <div className="bg-[#21262d] p-3 rounded-lg border border-[#30363d]">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1">
              <Building2 className="w-3.5 h-3.5" /> 1. Any SME Management Site
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Wholesale computer parts (Dhaka Silicon), Pharmacy, Retail or Restaurant ERPs run independently.
            </p>
          </div>
          <div className="bg-[#21262d] p-3 rounded-lg border border-[#30363d]">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
              <Zap className="w-3.5 h-3.5" /> 2. 1-Line Embed SDK
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Inject <code className="text-blue-300 font-mono text-[10px]">loader.js</code> with tenant API key. Renders an isolated iframe widget on any site in 60 seconds.
            </p>
          </div>
          <div className="bg-[#21262d] p-3 rounded-lg border border-[#30363d]">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
              <Server className="w-3.5 h-3.5" /> 3. Standalone Agent Core
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Autonomous multi-agent orchestration, intent classifier, guardrail sanitizers, and database adapters.
            </p>
          </div>
          <div className="bg-[#21262d] p-3 rounded-lg border border-[#30363d]">
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-1">
              <Bot className="w-3.5 h-3.5" /> 4. Virtual CFO Reasoning
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Adaptive situational math, dynamic answers, BDT cash runway forecasts, and WeBank Weiyedai digital credit matching.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: Interactive Multi-SME Playground */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-semibold text-white">Live Multi-SME Agent Reasoning Sandbox</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch between different businesses to verify that the AI Agent is completely universal, adaptive, and never outputs fixed answers.
              </p>
            </div>
          </div>
          <span className="text-[11px] bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded border border-blue-500/20 font-mono">
            Active: {selectedSme.name}
          </span>
        </div>

        {/* SME Switcher Pills */}
        <div className="grid grid-cols-4 gap-2">
          {PRESET_SMES.map(sme => (
            <button
              key={sme.id}
              onClick={() => handleSmeSelect(sme)}
              className={`p-3 rounded-lg text-left border transition ${
                selectedSme.id === sme.id 
                  ? 'bg-[#21262d] border-blue-500/50 shadow-sm' 
                  : 'bg-[#0d1117] border-[#30363d] hover:bg-[#21262d]/50'
              }`}
            >
              <div className="text-xs font-semibold text-white truncate">{sme.name}</div>
              <div className="text-[10.5px] text-slate-400 mt-0.5 truncate">{sme.industry}</div>
              <div className="text-[10px] text-emerald-400 mt-1 font-mono">
                ৳ {(sme.balance / 100000).toFixed(1)}L Cash • Health: {sme.health_score}/100
              </div>
            </button>
          ))}
        </div>

        {/* Playground Input & Test Area */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={playgroundPrompt}
              onChange={(e) => setPlaygroundPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePlaygroundSend()}
              placeholder="Ask any question for this simulated SME..."
              className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handlePlaygroundSend}
              disabled={playgroundLoading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {playgroundLoading ? <Sparkles className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {playgroundLoading ? 'Reasoning...' : 'Ask Agent'}
            </button>
          </div>

          {/* Playground Response Box */}
          {playgroundResponse && (
            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 text-xs text-slate-200 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[#21262d] pb-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <Check className="w-3.5 h-3.5" /> Grounded Dynamic Agent Response
                </span>
                <span className="font-mono text-[10px] bg-[#21262d] px-2 py-0.5 rounded text-blue-300">
                  Specialist: {playgroundSpecialist?.toUpperCase() || 'CFO ORCHESTRATOR'}
                </span>
              </div>
              <div className="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap">
                {playgroundResponse}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: Integration Code & Live Sandbox */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left: 1-Line Embed Code & API Keys */}
        <div className="space-y-6">
          {/* Embed Script Card */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">1-Line Embed Script Tag</h3>
              </div>
              <button
                onClick={() => copyToClipboard(embedCodeSnippet, 'code')}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-[#21262d] hover:bg-[#30363d] px-2.5 py-1.5 rounded-lg border border-[#30363d] transition"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCode ? 'Copied Snippet!' : 'Copy Tag'}
              </button>
            </div>
            <p className="text-[11.5px] text-slate-400">
              Paste this before the closing <code className="text-blue-300 font-mono">&lt;/body&gt;</code> tag on any SME site. It embeds the floating launcher and sandboxed Copilot.
            </p>
            <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d] text-xs font-mono text-cyan-300 overflow-x-auto">
              {embedCodeSnippet}
            </div>
          </div>

          {/* REST API & Curl Snippet */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">REST API Agent Endpoint</h3>
              </div>
              <button
                onClick={() => copyToClipboard(curlSnippet, 'curl')}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-[#21262d] hover:bg-[#30363d] px-2.5 py-1.5 rounded-lg border border-[#30363d] transition"
              >
                {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCurl ? 'Copied Curl!' : 'Copy cURL'}
              </button>
            </div>
            <p className="text-[11.5px] text-slate-400">
              For native backend integrations (Python, Node.js, Go), post directly to the standalone agent endpoint.
            </p>
            <div className="bg-[#0d1117] p-3 rounded-lg border border-[#30363d] text-[11px] font-mono text-emerald-300 overflow-x-auto">
              {curlSnippet}
            </div>
          </div>

          {/* API Keys Management */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Tenant Scoped API Keys</h3>
            </div>
            <p className="text-[11.5px] text-slate-400">
              Generate isolated API keys for third-party ERPs and external SME management systems.
            </p>

            {createdRawKey && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-xs space-y-1.5">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> New Key Generated:
                </div>
                <div className="font-mono text-white text-[11px] bg-[#0d1117] p-2 rounded select-all break-all border border-emerald-500/20">
                  {createdRawKey}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {apiKeys.map((k) => (
                <div key={k.id} className="bg-[#21262d] p-2.5 rounded-lg border border-[#30363d] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{k.name}</div>
                    <div className="font-mono text-slate-400 text-[11px]">{k.key_prefix}...</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(k.key_prefix, k.id)}
                    className="p-1.5 rounded bg-[#0d1117] hover:bg-[#30363d] text-slate-300 transition"
                    title="Copy prefix"
                  >
                    {copiedKey === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleCreateKey} className="pt-2 flex gap-2">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key label (e.g. Pharmacy ERP)"
                className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow transition"
              >
                Generate Key
              </button>
            </form>
          </div>
        </div>

        {/* Right: Live Interactive Widget Sandbox */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Embed Sandbox Preview</h3>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                Port 8090 Sandbox
              </span>
            </div>
            <p className="text-[11.5px] text-slate-400 mb-3">
              Below is the actual isolated <code className="text-blue-300 font-mono">widget.html</code> iframe rendered exactly as it appears when embedded on any third-party SME host website:
            </p>
          </div>

          <div className="w-full h-[620px] rounded-xl overflow-hidden border border-[#30363d] bg-[#0d1117] shadow-inner">
            <iframe
              src={`${BACKEND_URL}/sdk/widget.html?apiKey=fp_live_testdemo123456789abcdef`}
              className="w-full h-full border-none"
              title="Widget Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
