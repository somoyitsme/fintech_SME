/**
 * FinPilot Widget Client
 *
 * Handles chat UI, SSE streaming, and markdown rendering.
 */

(function() {
  'use strict';

  const HOST = 'http://localhost:8100';

  // Extract API key from URL
  const params = new URLSearchParams(window.location.search);
  const apiKey = params.get('apiKey');

  if (!apiKey) {
    console.error('[FinPilot Widget] Missing apiKey');
    return;
  }

  let conversationId = null;
  let isProcessing = false;

  // DOM elements
  const messagesEl = document.getElementById('messages');
  const statusBar = document.getElementById('status-bar');
  const statusText = document.getElementById('status-text');
  const inputEl = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const minimizeBtn = document.getElementById('minimize-btn');

  // Simple markdown to HTML converter
  function renderMarkdown(text) {
    let html = text;

    // Tables
    html = html.replace(/\|([^\n]+)\|\n\|([\s\|:-]+)\|\n((?:\|[^\n]+\|\n?)+)/g, (match, header, sep, body) => {
      const headers = header.split('|').map(h => h.trim()).filter(h => h);
      const rows = body.trim().split('\n').map(row =>
        row.split('|').map(c => c.trim()).filter(c => c)
      );

      let table = '<table><thead><tr>';
      headers.forEach(h => table += `<th>${h}</th>`);
      table += '</tr></thead><tbody>';
      rows.forEach(row => {
        table += '<tr>';
        row.forEach(cell => table += `<td>${cell}</td>`);
        table += '</tr>';
      });
      table += '</tbody></table>';
      return table;
    });

    // Blockquotes (metric pills)
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headings (process ### before ##, correct capture groups)
    html = html.replace(/^### (.+)$/gm, '<h4 style="margin:12px 0 6px;font-size:14px">$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3 style="margin:16px 0 8px;font-size:16px">$1</h3>');

    // Lists
    html = html.replace(/^\d+\. (.+)$/gm, '<div style="margin:4px 0">• $1</div>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  function addMessage(role, content) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.innerHTML = role === 'assistant' ? renderMarkdown(content) : content;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showStatus(message) {
    statusText.textContent = message;
    statusBar.style.display = 'flex';
  }

  function hideStatus() {
    statusBar.style.display = 'none';
  }

  async function sendMessage() {
    const message = inputEl.value.trim();
    if (!message || isProcessing) return;

    isProcessing = true;
    sendBtn.disabled = true;
    inputEl.value = '';

    addMessage('user', message);

    try {
      const response = await fetch(`${HOST}/api/v1/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          message,
          conversation_id: conversationId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        addMessage('assistant', `**Error:** ${error.detail || 'Request failed'}`);
        hideStatus();
        return;
      }

      // Read SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          const data = JSON.parse(line.slice(6));

          if (data.type === 'status') {
            showStatus(data.message);
          } else if (data.type === 'complete') {
            addMessage('assistant', data.content);
            hideStatus();
          } else if (data.type === 'error') {
            addMessage('assistant', `**Error:** ${data.error}`);
            hideStatus();
          }
        }
      }
    } catch (err) {
      addMessage('assistant', `**Connection Error:** ${err.message}`);
      hideStatus();
    } finally {
      isProcessing = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  // Event listeners
  sendBtn.addEventListener('click', sendMessage);

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  minimizeBtn.addEventListener('click', () => {
    window.parent.postMessage({ type: 'toggle', visible: false }, '*');
  });

  // Auto-resize iframe height
  function notifyResize() {
    const height = Math.min(document.body.scrollHeight + 40, window.innerHeight);
    window.parent.postMessage({ type: 'resize', height }, '*');
  }

  // Welcome message
  addMessage('assistant',
    '## FinPilot AI Financial Copilot\n\n' +
    'Ask me about:\n' +
    '• Cash flow and runway projections\n' +
    '• Financing options (WeBank Weiyedai)\n' +
    '• Financial health benchmarking\n' +
    '• Overdue invoice collection\n' +
    '• Tax estimates and compliance\n' +
    '• Expense optimization'
  );

  inputEl.focus();
})();