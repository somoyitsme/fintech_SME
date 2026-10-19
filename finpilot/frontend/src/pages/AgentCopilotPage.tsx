import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  RotateCcw,
  Copy,
  Check,
  TrendingUp,
  AlertCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  CircleDollarSign,
  Package,
  Clock,
  ChevronRight
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status?: string;
  toolsUsed?: string[];
  isStreaming?: boolean;
}

interface AgentCopilotPageProps {
  onNavigateTab?: (tab: string) => void;
}

const AGENT_API_BASE = 'http://localhost:8100';
const AGENT_API_KEY = 'fp_live_f407b24b5fcf1fc17c717429793a9ca4';
const TENANT_ID = '28434594-e04c-4aae-aa17-d4612114e348';

const QUICK_PROMPTS = [
  {
    title: 'Cash Runway & Burn',
    desc: 'Compute runway in months and burn rate from real bank accounts',
    prompt: 'Calculate our current cash runway, monthly burn rate, and total cash on hand from all payment accounts.'
  },
  {
    title: 'Inventory Valuation',
    desc: 'Audit stock counts, cost/retail valuations, and reorder alerts',
    prompt: 'Provide a complete inventory valuation report: stock units, total cost valuation, retail value, and any products needing reorder.'
  },
  {
    title: 'Accounts Receivable Aging',
    desc: 'Analyze pending receivables, aging buckets, and credit risk',
    prompt: 'Analyze accounts receivable aging across 0-30, 31-60, 61-90, and 90+ day buckets. What is our default risk?'
  },
  {
    title: 'Stress Test: Revenue Drop',
    desc: 'Simulate a 25% revenue decline and 15% cost surge',
    prompt: 'Run a financial stress test simulating a 25% drop in monthly revenue and a 15% increase in supplier costs. What happens to our runway?'
  },
  {
    title: 'Financial Health & Margins',
    desc: 'Gross margin, net margin, working capital, and OPEX ratio',
    prompt: 'Evaluate overall financial health: calculate gross profit margin, operating expense ratio, net margin, and working capital.'
  }
];

// Helper to render Markdown tables, bold text, bullets, and alerts
function renderMarkdownContent(text: string) {
  if (!text) return null;

  // Split content into blocks (tables, code, lists, paragraphs)
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let tableRows: string[] = [];
  let inTable = false;
  let keyIndex = 0;

  const flushTable = () => {
    if (tableRows.length > 0) {
      // Parse table
      const headerLine = tableRows[0];
      const dataRows = tableRows.slice(2); // Skip separator row

      const headers = headerLine
        .split('|')
        .map((h) => h.trim())
        .filter((h) => h.length > 0);

      const parsedRows = dataRows.map((r) =>
        r
          .split('|')
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      );

      elements.push(
        <div key={`table-${keyIndex++}`} className="overflow-x-auto my-3 rounded-xl border border-boundary-subtle bg-surface shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-secondary/70 border-b border-boundary-subtle">
                {headers.map((h, i) => (
                  <th key={i} className="py-2.5 px-3.5 font-semibold text-content-primary">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-boundary-subtle">
              {parsedRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-surface-secondary/40 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="py-2 px-3.5 text-content-primary font-mono sm:font-sans">
                      {formatInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is part of a markdown table
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      tableRows.push(line.trim());
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={`h3-${keyIndex++}`} className="text-sm font-bold text-content-primary mt-4 mb-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-ochre"></span>
          {formatInlineMarkdown(line.slice(4))}
        </h4>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h3 key={`h2-${keyIndex++}`} className="text-base font-bold text-content-primary mt-5 mb-2.5 border-b border-boundary-subtle pb-1">
          {formatInlineMarkdown(line.slice(3))}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h2 key={`h1-${keyIndex++}`} className="text-lg font-bold text-content-primary mt-6 mb-3">
          {formatInlineMarkdown(line.slice(2))}
        </h2>
      );
    }
    // Blockquotes / Actionable alerts
    else if (line.startsWith('> ')) {
      elements.push(
        <div key={`quote-${keyIndex++}`} className="my-2.5 p-3 rounded-r-xl border-l-4 border-brand-ochre bg-brand-cream/50 dark:bg-brand-olive/10 text-xs text-content-primary font-medium">
          {formatInlineMarkdown(line.slice(2))}
        </div>
      );
    }
    // Bullet lists
    else if (line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim().startsWith('• ')) {
      const content = line.trim().replace(/^[-*•]\s+/, '');
      elements.push(
        <div key={`li-${keyIndex++}`} className="flex items-start gap-2 text-xs text-content-primary my-1 pl-1">
          <span className="text-brand-ochre font-bold mt-0.5">•</span>
          <span className="flex-1">{formatInlineMarkdown(content)}</span>
        </div>
      );
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(line.trim())) {
      const num = line.trim().match(/^(\d+)\.\s/)?.[1];
      const content = line.trim().replace(/^\d+\.\s+/, '');
      elements.push(
        <div key={`num-${keyIndex++}`} className="flex items-start gap-2 text-xs text-content-primary my-1 pl-1">
          <span className="font-semibold text-brand-ochre text-[11px] min-w-[14px]">{num}.</span>
          <span className="flex-1">{formatInlineMarkdown(content)}</span>
        </div>
      );
    }
    // Regular paragraphs / Empty lines
    else if (line.trim().length > 0) {
      elements.push(
        <p key={`p-${keyIndex++}`} className="text-xs text-content-primary my-1.5 leading-relaxed">
          {formatInlineMarkdown(line)}
        </p>
      );
    }
  }

  if (inTable) {
    flushTable();
  }

  return <div className="space-y-0.5">{elements}</div>;
}

// Inline Markdown parser (bold, inline code, currency)
function formatInlineMarkdown(text: string): React.ReactNode {
  if (!text) return '';

  // Process bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-content-primary">
          {part.slice(2, -2)}
        </strong>
      );
    } else if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-surface-secondary text-brand-ochreDeep dark:text-brand-ochre text-[11px] font-mono border border-boundary-subtle">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export const AgentCopilotPage: React.FC<AgentCopilotPageProps> = ({ onNavigateTab }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `### Welcome to FinPilot Autonomous Financial Copilot 👋\n\nI am connected directly to **Dhaka Silicon & Hardware Ltd.**'s live SQLite database across **12 tables** (payment accounts, sales orders, expenses, inventory, suppliers, and staff).\n\n**What I can do for you:**\n- **Live Cash Runway & Burn**: Deterministic calculation using exact account balances and OPEX trends.\n- **Inventory Valuation**: Real-time stock valuation at cost, retail projection, and reorder warnings.\n- **Accounts Receivable Aging**: Track overdue invoices and customer credit risk.\n- **Financial Stress Testing**: Simulate revenue shocks and supply chain price surges.\n\nSelect a prompt below or ask any custom question:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toolsUsed: ['catalog_introspection']
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Copy Message
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clear chat history
  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-msg-reset',
        role: 'assistant',
        content: `### Session Reset 🔄\n\nReady for new queries. All 12 tables and deterministic math tools are online. Ask anything regarding cash runway, inventory valuation, or stress tests.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolsUsed: []
      }
    ]);
  };

  // Submit Query
  const handleSendMessage = async (queryText?: string) => {
    const query = (queryText || inputQuery).trim();
    if (!query || isStreaming) return;

    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `asst-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    const newMessages: Message[] = [
      ...messages,
      {
        id: userMessageId,
        role: 'user',
        content: query,
        timestamp: timeStr
      },
      {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: timeStr,
        status: 'Analyzing financial intent...',
        toolsUsed: [],
        isStreaming: true
      }
    ];

    setMessages(newMessages);
    setIsStreaming(true);

    try {
      // Connect to SSE streaming endpoint
      const response = await fetch(`${AGENT_API_BASE}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': AGENT_API_KEY
        },
        body: JSON.stringify({
          message: query,
          tenant_id: TENANT_ID
        })
      });

      if (!response.ok) {
        throw new Error(`Agent API returned HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Readable stream not supported');

      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';
      const toolsUsedSet = new Set<string>();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const dataStr = line.slice(6).trim();
          if (!dataStr) continue;

          try {
            const event = JSON.parse(dataStr);

            if (event.type === 'status') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, status: event.message }
                    : msg
                )
              );
            } else if (event.type === 'tool_start') {
              toolsUsedSet.add(event.name);
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? {
                        ...msg,
                        status: `Executing ${event.name}...`,
                        toolsUsed: Array.from(toolsUsedSet)
                      }
                    : msg
                )
              );
            } else if (event.type === 'text_delta') {
              accumulatedText += event.text;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: accumulatedText, status: undefined }
                    : msg
                )
              );
            } else if (event.type === 'complete') {
              const finalText = event.response || accumulatedText;
              const finalTools = event.tools_used || Array.from(toolsUsedSet);
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? {
                        ...msg,
                        content: finalText,
                        status: undefined,
                        toolsUsed: finalTools,
                        isStreaming: false
                      }
                    : msg
                )
              );
            }
          } catch (e) {
            // Ignore partial SSE JSON chunks
          }
        }
      }
    } catch (err: any) {
      console.warn('Streaming error, attempting synchronous fallback:', err);
      // Fallback to synchronous /chat endpoint
      try {
        const fallbackRes = await fetch(`${AGENT_API_BASE}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': AGENT_API_KEY
          },
          body: JSON.stringify({
            message: query,
            tenant_id: TENANT_ID
          })
        });

        if (fallbackRes.ok) {
          const data = await fallbackRes.json();
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    content: data.response,
                    status: undefined,
                    toolsUsed: data.tools_used || [],
                    isStreaming: false
                  }
                : msg
            )
          );
        } else {
          throw new Error(`Fallback HTTP ${fallbackRes.status}`);
        }
      } catch (fallbackErr: any) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: `⚠️ **Unable to complete request.**\n\nCould not reach FinPilot Agent backend on port 8100. Error: ${fallbackErr.message || err.message}`,
                  status: undefined,
                  isStreaming: false
                }
              : msg
          )
        );
      }
    } finally {
      setIsStreaming(false);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
        )
      );
    }
  };

  // Textarea keydown: Enter to submit, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        eyebrow="Autonomous Financial Intelligence"
        title="FinPilot AI Financial Copilot"
        description="Deterministic CFO-grade reasoning powered by Claude Opus 4.8 connected directly to live SQLite database tables."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-boundary-subtle bg-surface text-xs font-medium text-content-primary shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success"></span>
              </span>
              <span>12 Tables Connected</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-ochre/30 bg-brand-ochre/10 text-xs font-semibold text-brand-ochreDeep dark:text-brand-ochre shadow-xs">
              <Cpu className="w-3.5 h-3.5" />
              <span>Claude Opus 4.8</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Chat
            </Button>
          </div>
        }
      />

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-boundary-subtle bg-surface shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-content-muted uppercase tracking-wider">Cash on Hand</p>
            <p className="text-lg font-bold text-content-primary mt-0.5">৳ 2,275,400</p>
            <p className="text-[11px] text-content-muted mt-0.5">City Bank, bKash, Cash</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-ochre/15 text-brand-ochre flex items-center justify-center">
            <CircleDollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-boundary-subtle bg-surface shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-content-muted uppercase tracking-wider">Cash Runway</p>
            <p className="text-lg font-bold text-status-success mt-0.5">10.8 Months</p>
            <p className="text-[11px] text-content-muted mt-0.5">At ৳ 211k / mo OPEX burn</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-status-successBg text-status-success flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-boundary-subtle bg-surface shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-content-muted uppercase tracking-wider">Inventory at Cost</p>
            <p className="text-lg font-bold text-content-primary mt-0.5">৳ 14.06M</p>
            <p className="text-[11px] text-content-muted mt-0.5">1,840 units across 10 items</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-sage/25 text-stone-900 dark:text-brand-sage flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-boundary-subtle bg-surface shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-content-muted uppercase tracking-wider">Receivables (AR)</p>
            <p className="text-lg font-bold text-content-primary mt-0.5">৳ 415,000</p>
            <p className="text-[11px] text-content-muted mt-0.5">Credit 30D &amp; COD pending</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-sand/40 text-brand-ochre flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <Card className="flex flex-col min-h-[580px] h-[calc(100vh-320px)] border-boundary-subtle shadow-sm overflow-hidden">
        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-canvas/40">
          {messages.map((message) => {
            const isUser = message.role === 'user';

            return (
              <div
                key={message.id}
                className={`flex gap-3 max-w-[90%] sm:max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-semibold shadow-xs ${
                    isUser
                      ? 'bg-brand-ochre text-stone-950 font-bold'
                      : 'bg-surface border border-boundary-subtle text-brand-ochre'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble Card */}
                <div
                  className={`rounded-2xl p-4 sm:p-5 text-xs shadow-xs transition-all ${
                    isUser
                      ? 'bg-brand-ochre text-stone-950 font-medium'
                      : 'bg-surface border border-boundary-subtle text-content-primary'
                  }`}
                >
                  {/* Assistant Header & Status */}
                  {!isUser && (
                    <div className="flex items-center justify-between gap-3 mb-2 pb-2 border-b border-boundary-subtle">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-content-primary">FinPilot Copilot</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-secondary text-content-muted font-mono">
                          Claude Opus 4.8
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-content-muted">{message.timestamp}</span>
                        <button
                          onClick={() => handleCopy(message.id, message.content)}
                          title="Copy response"
                          className="p-1 rounded hover:bg-surface-secondary text-content-muted hover:text-content-primary transition"
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3.5 h-3.5 text-status-success" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Active Tool / Status Banner */}
                  {!isUser && message.status && (
                    <div className="mb-3 flex items-center gap-2 py-1.5 px-3 rounded-lg bg-surface-secondary text-xs text-brand-ochre font-medium border border-boundary-subtle animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>{message.status}</span>
                    </div>
                  )}

                  {/* Render Message Body */}
                  <div className="prose-xs">
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed text-xs">{message.content}</p>
                    ) : (
                      renderMarkdownContent(message.content)
                    )}
                  </div>

                  {/* Tool Badges */}
                  {!isUser && message.toolsUsed && message.toolsUsed.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-boundary-subtle flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-medium text-content-muted flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-status-success" /> Verified Math:
                      </span>
                      {message.toolsUsed.map((tool, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-surface-secondary text-content-secondary font-mono border border-boundary-subtle"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Prompt Chips Bar */}
        <div className="px-4 py-2 border-t border-boundary-subtle bg-surface-secondary/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-content-muted uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-ochre" /> Quick:
          </span>
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qp.prompt)}
              disabled={isStreaming}
              className="shrink-0 text-[11px] px-2.5 py-1 rounded-lg bg-surface border border-boundary-subtle hover:border-brand-ochre hover:text-brand-ochre text-content-secondary transition-all shadow-2xs disabled:opacity-50"
            >
              {qp.title}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-boundary-subtle bg-surface">
          <div className="flex items-end gap-2.5 max-w-full">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
              placeholder="Ask about cash runway, inventory valuation, receivables aging, or run a stress test..."
              className="flex-1 max-h-32 min-h-[42px] py-2.5 px-3.5 text-xs rounded-xl border border-boundary-subtle bg-surface text-content-primary placeholder:text-content-muted focus:outline-none focus:border-brand-ochre resize-none transition"
            />

            <Button
              variant="primary"
              size="md"
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || isStreaming}
              leftIcon={isStreaming ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            >
              {isStreaming ? 'Thinking...' : 'Send'}
            </Button>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-content-muted px-1">
            <span>Press <strong>Enter</strong> to send, <strong>Shift + Enter</strong> for newline</span>
            <span className="flex items-center gap-1">
              <Database className="w-2.5 h-2.5 text-status-success" /> Direct SQLite Query Mode Active
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AgentCopilotPage;
