import { useState, useEffect, useRef, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  status?: string;
  toolsUsed?: string[];
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

const STORAGE_KEY = 'finpilot_agent_sessions_v3';
const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
const isCustomDomain = typeof window !== 'undefined' && window.location.hostname && !window.location.hostname.match(/^\d+\.\d+\.\d+\.\d+$/) && window.location.hostname !== 'localhost';
const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
const AGENT_API_BASE = import.meta.env.VITE_AGENT_URL || (isHttps || isCustomDomain ? '' : `http://${host}:8100`);
const AGENT_API_KEY = 'fp_live_f407b24b5fcf1fc17c717429793a9ca4';
const TENANT_ID = '28434594-e04c-4aae-aa17-d4612114e348';

const createDefaultSession = (): ChatSession => ({
  id: `session-${Date.now()}`,
  title: 'Financial Analysis Overview',
  createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  updatedAt: new Date().toISOString(),
  messages: [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `### Welcome to FinPilot Autonomous Financial Copilot 👋\n\nI am connected directly to **Now_or_Never Console**'s live SQLite database (payment accounts, sales orders, expenses, inventory, suppliers, and staff).\n\n**What I can do for you:**\n- **Live Cash Runway & Burn**: Deterministic calculation using exact account balances and OPEX trends.\n- **Inventory Valuation**: Real-time stock valuation at cost, retail projection, and reorder warnings.\n- **Accounts Receivable Aging**: Track overdue invoices and customer credit risk.\n- **Financial Stress Testing**: Simulate revenue shocks and supply chain price surges.\n- **Database Inquiries**: Safely answer questions on orders, top customers, inventory, and staff.\n\nSelect a prompt below or ask any custom question:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toolsUsed: ['catalog_introspection']
    }
  ]
});

export function useTanStackAIChat() {
  // Load sessions from localStorage or initialize with default session
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved chat sessions:', e);
    }
    return [createDefaultSession()];
  });

  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    return sessions[0]?.id || '';
  });

  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync sessions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to persist chat sessions to localStorage:', e);
    }
  }, [sessions]);

  // Current active session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [];

  // Create a brand new session
  const createNewSession = useCallback((initialTitle = 'New Chat'): string => {
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: initialTitle,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: `### New Chat Session Started 💬\n\nAll 12 live SQLite database tables and deterministic CFO financial tools are connected. What would you like to analyze or query today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          toolsUsed: []
        }
      ]
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    return newSessionId;
  }, []);

  // Delete a session
  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const fresh = createDefaultSession();
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      return filtered;
    });

    if (activeSessionId === sessionId) {
      const remaining = sessions.filter((s) => s.id !== sessionId);
      if (remaining.length > 0) {
        setActiveSessionId(remaining[0].id);
      }
    }
  }, [activeSessionId, sessions]);

  // Clear messages in current session
  const clearCurrentSession = useCallback(() => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messages: [
                {
                  id: `welcome-${Date.now()}`,
                  role: 'assistant',
                  content: `### Session Reset 🔄\n\nChat session cleared. Ready for new financial calculations, stock inquiries, and stress tests.`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  toolsUsed: []
                }
              ]
            }
          : s
      )
    );
  }, [activeSessionId]);

  // Abort active streaming
  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  // Send message using streaming protocol with session tracking
  const sendMessage = useCallback(
    async (queryText: string) => {
      const query = queryText.trim();
      if (!query || isStreaming) return;

      const userMessageId = `user-${Date.now()}`;
      const assistantMessageId = `asst-${Date.now()}`;
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Determine new session title if current session is generic
      const shouldUpdateTitle =
        activeSession.title === 'New Chat' || activeSession.title === 'Financial Analysis Overview';
      const autoTitle =
        query.length > 32 ? `${query.slice(0, 30)}...` : query;

      const userMessage: Message = {
        id: userMessageId,
        role: 'user',
        content: query,
        timestamp: timeStr
      };

      const initialAssistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: timeStr,
        status: 'Analyzing database & financial intent...',
        toolsUsed: [],
        isStreaming: true
      };

      // Optimistically append messages to active session
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                title: shouldUpdateTitle ? autoTitle : s.title,
                updatedAt: new Date().toISOString(),
                messages: [...s.messages, userMessage, initialAssistantMessage]
              }
            : s
        )
      );

      setIsStreaming(true);
      abortControllerRef.current = new AbortController();

      // Prepare conversation history payload for multi-turn awareness
      const historyPayload = messages
        .filter((m) => m.content && !m.isStreaming)
        .slice(-10)
        .map((m) => ({
          role: m.role,
          content: m.content
        }));

      try {
        const response = await fetch(`${AGENT_API_BASE}/chat/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': AGENT_API_KEY
          },
          body: JSON.stringify({
            message: query,
            tenant_id: TENANT_ID,
            session_id: activeSessionId,
            history: historyPayload
          }),
          signal: abortControllerRef.current.signal
        });

        if (!response.ok) {
          throw new Error(`Agent API returned HTTP ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('Readable stream not supported in this browser');

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
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === activeSessionId
                      ? {
                          ...s,
                          messages: s.messages.map((msg) =>
                            msg.id === assistantMessageId
                              ? { ...msg, status: event.message }
                              : msg
                          )
                        }
                      : s
                  )
                );
              } else if (event.type === 'tool_start') {
                toolsUsedSet.add(event.name);
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === activeSessionId
                      ? {
                          ...s,
                          messages: s.messages.map((msg) =>
                            msg.id === assistantMessageId
                              ? {
                                  ...msg,
                                  status: `Executing tool ${event.name}...`,
                                  toolsUsed: Array.from(toolsUsedSet)
                                }
                              : msg
                          )
                        }
                      : s
                  )
                );
              } else if (event.type === 'text_delta') {
                accumulatedText += event.text;
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === activeSessionId
                      ? {
                          ...s,
                          messages: s.messages.map((msg) =>
                            msg.id === assistantMessageId
                              ? { ...msg, content: accumulatedText, status: undefined }
                              : msg
                          )
                        }
                      : s
                  )
                );
              } else if (event.type === 'complete') {
                const finalText = event.response || accumulatedText;
                const finalTools = event.tools_used || Array.from(toolsUsedSet);
                setSessions((prev) =>
                  prev.map((s) =>
                    s.id === activeSessionId
                      ? {
                          ...s,
                          messages: s.messages.map((msg) =>
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
                        }
                      : s
                  )
                );
              }
            } catch (jsonErr) {
              // Ignore partial JSON chunks
            }
          }
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.log('Stream generation aborted by user.');
          return;
        }

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
              tenant_id: TENANT_ID,
              session_id: activeSessionId,
              history: historyPayload
            })
          });

          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            setSessions((prev) =>
              prev.map((s) =>
                s.id === activeSessionId
                  ? {
                      ...s,
                      messages: s.messages.map((msg) =>
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
                    }
                  : s
              )
            );
          } else {
            throw new Error(`Fallback HTTP ${fallbackRes.status}`);
          }
        } catch (fallbackErr: any) {
          setSessions((prev) =>
            prev.map((s) =>
              s.id === activeSessionId
                ? {
                    ...s,
                    messages: s.messages.map((msg) =>
                      msg.id === assistantMessageId
                        ? {
                            ...msg,
                            content: `⚠️ **Unable to complete request.**\n\nCould not reach FinPilot Agent backend on port 8100. Error: ${fallbackErr.message || err.message}`,
                            status: undefined,
                            isStreaming: false
                          }
                        : msg
                    )
                  }
                : s
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSessionId
              ? {
                  ...s,
                  messages: s.messages.map((msg) =>
                    msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
                  )
                }
              : s
          )
        );
      }
    },
    [activeSession, activeSessionId, isStreaming, messages]
  );

  return {
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
  };
}
