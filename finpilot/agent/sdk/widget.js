/**
 * FinPilot Widget - Auto-themed chat UI with streaming
 */
(function () {
  'use strict';

  let config = null;
  let isStreaming = false;

  // ── Apply host-matched theme ──
  function applyTheme(theme) {
    const root = document.documentElement;
    root.style.setProperty('--fp-bg', theme.dark ? '#0f172a' : '#ffffff');
    root.style.setProperty('--fp-surface', theme.dark ? '#1e293b' : '#f8fafc');
    root.style.setProperty('--fp-text', theme.dark ? '#e2e8f0' : '#1a1a1a');
    root.style.setProperty('--fp-text-muted', theme.dark ? '#94a3b8' : '#64748b');
    root.style.setProperty('--fp-primary', theme.primary || '#2563eb');
    root.style.setProperty('--fp-border', theme.dark ? '#334155' : '#e2e8f0');
    root.style.setProperty('--fp-radius', theme.radius || '8px');
    document.body.style.fontFamily = theme.font || 'inherit';

    // Apply dark class if needed
    if (theme.dark) document.body.classList.add('fp-dark');
  }

  // ── Markdown to HTML ──
  function mdToHtml(md) {
    let html = md;

    // Tables
    html = html.replace(/\|([^\n]+)\|(\n\|[\s:|-]+\|)+\n((\|[^\n]+\|\n?)+)/g, (match, header, _sep, body) => {
      const headers = header.split('|').map(h => h.trim()).filter(h => h);
      const rows = body.trim().split('\n').map(r => r.split('|').map(c => c.trim()).filter(c => c));

      let t = '<table><thead><tr>';
      headers.forEach(h => t += `<th>${h}</th>`);
      t += '</tr></thead><tbody>';
      rows.forEach(row => {
        t += '<tr>';
        row.forEach(cell => t += `<td>${cell}</td>`);
        t += '</tr>';
      });
      return t + '</tbody></table>';
    });

    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Lists
    html = html.replace(/^[•\-*]\s+(.+)$/gm, '<div style="margin:4px 0">• $1</div>');
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<div style="margin:4px 0">$1</div>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  // ── Message handling ──
  function addMessage(role, content) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.innerHTML = role === 'assistant' ? mdToHtml(content) : content;
    div.dataset.raw = content;
    return div;
  }

  function scrollToBottom() {
    const messages = document.getElementById('messages');
    messages.scrollTop = messages.scrollHeight;
  }

  // ── Streaming chat ──
  async function sendMessage() {
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const message = input.value.trim();

    if (!message || isStreaming) return;

    isStreaming = true;
    sendBtn.disabled = true;
    input.value = '';

    // Add user message
    const messages = document.getElementById('messages');
    messages.appendChild(addMessage('user', message));
    scrollToBottom();

    // Add assistant placeholder
    const assistantMsg = addMessage('assistant', '');
    assistantMsg.innerHTML = '<div class="status-row" style="color:var(--fp-text-muted);font-size:13px;display:flex;align-items:center;gap:8px;">⏳ Analyzing intent...</div>';
    messages.appendChild(assistantMsg);
    scrollToBottom();

    try {
      const response = await fetch(`${config.apiBase}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': config.apiKey,
        },
        body: JSON.stringify({
          message: message,
          tenant_id: config.tenantId || 'default',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === 'status') {
              assistantMsg.innerHTML = `<div style="color:var(--fp-text-muted);font-size:13px;display:flex;align-items:center;gap:8px;">⏳ ${event.message}</div>`;
            }
            else if (event.type === 'tool_start') {
              assistantMsg.innerHTML = `<div style="color:var(--fp-text-muted);font-size:13px;display:flex;align-items:center;gap:8px;">🔍 Executing ${event.name}...</div>`;
            }
            else if (event.type === 'text_delta') {
              fullText += event.text;
              assistantMsg.innerHTML = mdToHtml(fullText) + '<span class="cursor"></span>';
              scrollToBottom();
            }
            else if (event.type === 'complete') {
              fullText = event.response || fullText;
              assistantMsg.innerHTML = mdToHtml(fullText);
              assistantMsg.dataset.raw = fullText;
            }
          } catch (e) {
            // Skip malformed events
          }
        }
      }

    } catch (err) {
      assistantMsg.innerHTML = `<div style="color:#dc2626;font-size:13px;">⚠ ${err.message}</div>`;
    } finally {
      isStreaming = false;
      sendBtn.disabled = false;
      scrollToBottom();
    }
  }

  // ── Init on message from loader ──
  window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'finpilot:init') {
      config = e.data.config;
      applyTheme(config.theme);

      // Add welcome
      const messages = document.getElementById('messages');
      messages.appendChild(addMessage('assistant',
        '**Financial Analyst Ready**\n\n' +
        '• Cash flow & runway\n' +
        '• Revenue, margins, P&L\n' +
        '• AR aging & collections\n' +
        '• Tax liability estimates\n' +
        '• Loan readiness assessment\n' +
        '• Expense breakdown by vendor\n\n' +
        'All answers computed from **live database queries**.'
      ));
    }
  });

  // ── UI bindings ──
  document.getElementById('send-btn').addEventListener('click', sendMessage);
  document.getElementById('user-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  document.getElementById('clear-btn').addEventListener('click', () => {
    document.getElementById('messages').innerHTML = '';
  });

  document.getElementById('close-btn').addEventListener('click', () => {
    window.parent.postMessage({ type: 'finpilot:close' }, '*');
  });
})();