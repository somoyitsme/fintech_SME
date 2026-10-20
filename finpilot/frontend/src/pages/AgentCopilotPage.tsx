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
  ChevronRight,
  Plus,
  MessageSquare,
  Trash2,
  PanelLeft
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useTanStackAIChat, Message, ChatSession } from '../hooks/useTanStackAIChat';

interface AgentCopilotPageProps {
  onNavigateTab?: (tab: string) => void;
}

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
      const match = line.trim().match(/^(\d+)\.\s(.*)/);
      const num = match ? match[1] : '1';
      const content = match ? match[2] : line.trim();
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
  // Session & TanStack AI Chat state
  const {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    deleteSession,
    clearCurrentSession,
    stopStreaming,
    messages,
    isStreaming,
    sendMessage
  } = useTanStackAIChat();

  const [showSidebar, setShowSidebar] = useState(true);
  const [inputQuery, setInputQuery] = useState('');
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

  // Submit Query
  const handleSendMessage = (queryText?: string) => {
    const query = (queryText || inputQuery).trim();
    if (!query || isStreaming) return;

    setInputQuery('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    sendMessage(query);
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
              <span>Live Agent Connected</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-ochre/30 bg-brand-ochre/10 text-xs font-semibold text-brand-ochreDeep dark:text-brand-ochre shadow-xs">
              <Cpu className="w-3.5 h-3.5" />
              <span>Claude Opus 4.8</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSidebar(prev => !prev)}
              leftIcon={<PanelLeft className="w-3.5 h-3.5" />}
            >
              {showSidebar ? 'Hide Sidebar' : 'Show Chat List'}
            </Button>

            <Button
              variant="brand"
              size="sm"
              onClick={() => createNewSession()}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              New Chat
            </Button>
          </div>
        }
      />

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-boundary-subtle bg-surface shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-content-muted uppercase tracking-wider">Cash on Hand</p>
            <p className="text-lg font-bold text-content-primary mt-0.5">৳ 3,055,400</p>
            <p className="text-[11px] text-content-muted mt-0.5">City Bank, bKash, Cash</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-ochre/15 text-brand-ochre flex items-center justify-center">
            <CircleDollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-boundary-subtle bg-surface shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-content-muted uppercase tracking-wider">Cash Runway</p>
            <p className="text-lg font-bold text-status-success mt-0.5">Net Positive (∞)</p>
            <p className="text-[11px] text-content-muted mt-0.5">Inflows exceed OPEX burn</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-status-successBg text-status-success flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-boundary-subtle bg-surface shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-content-muted uppercase tracking-wider">Inventory at Cost</p>
            <p className="text-lg font-bold text-content-primary mt-0.5">৳ 25.57M</p>
            <p className="text-[11px] text-content-muted mt-0.5">1,341 units across 27 items</p>
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

      {/* Main Chat Interface with Left Sidebar */}
      <Card className="flex flex-row min-h-[640px] h-[calc(100vh-270px)] border-boundary-subtle shadow-sm overflow-hidden p-0">
        {/* Left Sidebar: New Chat & Chat List */}
        {showSidebar && (
          <aside className="w-64 sm:w-72 border-r border-boundary-subtle bg-surface-secondary/40 flex flex-col shrink-0">
            {/* New Chat Button */}
            <div className="p-3 border-b border-boundary-subtle bg-surface/50">
              <button
                type="button"
                onClick={() => createNewSession()}
                className="w-full py-2.5 px-3 rounded-lg bg-brand-ochre text-stone-950 font-semibold text-xs flex items-center justify-center gap-2 shadow-xs hover:bg-brand-ochre/90 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Chat</span>
              </button>
            </div>

            {/* Chat List Header */}
            <div className="px-3.5 pt-3 pb-1.5 flex items-center justify-between text-[11px] font-semibold text-content-muted uppercase tracking-wider">
              <span>Conversations</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface border border-boundary-subtle font-mono text-content-primary">
                {sessions.length}
              </span>
            </div>

            {/* Scrollable Chat Sessions List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
              {sessions.map((s) => {
                const isActive = s.id === activeSessionId;
                return (
                  <div
                    key={s.id}
                    onClick={() => setActiveSessionId(s.id)}
                    className={`group relative flex items-center gap-2.5 p-2.5 rounded-lg text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-surface text-content-primary border border-boundary-strong font-medium shadow-2xs'
                        : 'text-content-secondary hover:bg-surface-hover hover:text-content-primary'
                    }`}
                  >
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-brand-ochre' : 'text-content-muted'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{s.title || 'Conversation'}</div>
                      <div className="text-[10px] text-content-muted flex items-center gap-1.5 mt-0.5">
                        <span>{s.createdAt}</span>
                        <span>·</span>
                        <span>{s.messages.length} msg{s.messages.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    {sessions.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(s.id);
                        }}
                        title="Delete chat"
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-surface-secondary text-content-muted hover:text-status-danger transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sidebar Footer */}
            <div className="p-2.5 border-t border-boundary-subtle bg-surface/50 flex items-center justify-between text-[11px] text-content-muted">
              <span className="flex items-center gap-1 text-[10.5px]">
                <Database className="w-3 h-3 text-status-success" /> SQLite Live
              </span>
              <button
                type="button"
                onClick={clearCurrentSession}
                title="Reset current chat"
                className="p-1 px-1.5 rounded hover:bg-surface text-content-muted hover:text-content-primary transition flex items-center gap-1 text-[10.5px] cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>
          </aside>
        )}

        {/* Right Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-canvas/30">
          {/* Active Session Top Bar */}
          <div className="px-4 py-2.5 border-b border-boundary-subtle bg-surface/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setShowSidebar(prev => !prev)}
                title={showSidebar ? 'Hide chat list' : 'Show chat list'}
                className="p-1.5 rounded-lg border border-boundary-subtle bg-surface hover:bg-surface-hover text-content-secondary hover:text-content-primary transition shrink-0"
              >
                <PanelLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-semibold text-xs text-content-primary truncate">
                {activeSession?.title || 'Financial Analysis Overview'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-secondary text-content-muted font-mono shrink-0">
                {messages.length} message{messages.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isStreaming && (
                <button
                  type="button"
                  onClick={stopStreaming}
                  className="text-[11px] px-2 py-0.5 rounded bg-status-dangerBg text-status-danger border border-status-dangerBorder font-medium hover:bg-status-danger/10 transition"
                >
                  Stop Generating
                </button>
              )}
            </div>
          </div>

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
        </div>
      </Card>
    </div>
  );
};

export default AgentCopilotPage;
