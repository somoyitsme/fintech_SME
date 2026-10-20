import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { backendApi as api } from '../api';

interface CopilotChatProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'agent';
  content: string;
  specialist?: string;
  tool_calls?: any[];
  guardrail_flags?: string[];
  citations?: any[];
}

export const CopilotChat: React.FC<CopilotChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'agent',
      specialist: 'orchestrator',
      content: "Hello Shahed Rahman Somoy! I am your AI Financial Copilot for Now_or_Never Console. I monitor your live cash ledger, inventory valuations, accounts receivable, and operational runway across all database tables. How can I assist you today?",
      guardrail_flags: ['pii_sanitized', 'grounded_database_verified']
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "How does our cash runway look before our next GPU import?",
    "Which computer shop clients have overdue invoices?",
    "We need 500,000 BDT for CPU inventory. What financing options fit us?",
    "What are our deductible port customs duties and NBR VAT rules?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { sender: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await api.chatCopilot(text);
      const agentMsg: Message = {
        sender: 'agent',
        specialist: response.specialist,
        content: response.content,
        tool_calls: response.tool_calls,
        guardrail_flags: response.guardrail_flags,
        citations: response.citations
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          specialist: 'orchestrator',
          content: `⚠️ Error executing financial analysis: ${err.message || 'Please check backend connection.'}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 right-0 bottom-0 w-[480px] bg-[#161b22] border-l border-[#30363d] shadow-2xl z-30 flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-3.5 border-b border-[#30363d] flex items-center justify-between bg-[#161b22]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#58a6ff]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#f0f6fc] flex items-center gap-1.5">
              FinPilot Autonomous Copilot
              <span className="text-[9.5px] bg-[#238636]/15 text-[#3fb950] border border-[#238636]/30 px-1.5 py-0.2 rounded font-mono font-medium">
                Active
              </span>
            </div>
            <div className="text-[10.5px] text-[#8b949e]">Grounded in Now_or_Never Console Ledger</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#0d1117]">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {m.sender === 'agent' && m.specialist && (
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[9.5px] uppercase tracking-wider font-semibold text-[#58a6ff] bg-[#388bfd]/10 px-2 py-0.5 rounded border border-[#388bfd]/25">
                  {m.specialist} Specialist
                </span>
              </div>
            )}

            <div
              className={`max-w-[92%] rounded-xl p-3.5 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#1f6feb] text-white rounded-tr-none'
                  : 'bg-[#161b22] text-[#e6edf3] border border-[#30363d] rounded-tl-none shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.content}</div>

              {/* Tool Execution Transparency Pill */}
              {m.tool_calls && m.tool_calls.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#30363d]/60">
                  <div className="text-[10px] font-semibold text-[#8b949e] uppercase tracking-wide flex items-center gap-1 mb-1.5">
                    <Database className="w-3 h-3 text-[#58a6ff]" /> Ledger Execution Evidence ({m.tool_calls.length} Tools):
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {m.tool_calls.map((tc, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[9.5px] bg-[#0d1117] text-[#58a6ff] px-2 py-0.5 rounded border border-[#30363d] font-mono flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-[#3fb950]" />
                        {tc.tool}()
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start">
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl rounded-tl-none p-3 text-xs text-[#8b949e] flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 text-[#58a6ff] animate-spin" />
              <span>Analyzing hardware ledger & querying financial tools...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestion Chips */}
      <div className="p-2.5 bg-[#161b22] border-t border-[#30363d]">
        <div className="text-[10px] text-[#8b949e] mb-1.5 font-medium px-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#e3b341]" /> Suggested Sales & Liquidity Queries:
        </div>
        <div className="space-y-1">
          {quickQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="w-full text-left text-[11px] bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-[#f0f6fc] px-2.5 py-1.5 rounded-lg border border-[#30363d] transition flex items-center justify-between group"
            >
              <span className="truncate">{q}</span>
              <ArrowRight className="w-3 h-3 text-[#8b949e] group-hover:text-[#58a6ff] transition ml-1 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <div className="p-3 bg-[#161b22] border-t border-[#30363d]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about GPU runway, overdue retail stores, trade loans..."
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-[#f0f6fc] placeholder-[#6e7681] focus:outline-none focus:border-[#58a6ff] transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-lg bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white flex items-center justify-center transition shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
