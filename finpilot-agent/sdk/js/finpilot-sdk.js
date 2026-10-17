/**
 * FinPilot Universal Standalone AI Agent SDK
 * Embeddable on ANY SME management platform, ERP, POS, or billing website.
 * Usage:
 *   <script src="http://localhost:8100/sdk/finpilot-sdk.js" data-api-key="fpk_live_..."></script>
 */
(function() {
  'use strict';

  // Locate the script tag
  var currentScript = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  if (!currentScript) return;

  var apiKey = currentScript.getAttribute('data-api-key') || '';
  var hostUrl = currentScript.getAttribute('data-server') || (function() {
    var src = currentScript.src;
    var a = document.createElement('a');
    a.href = src;
    return a.protocol + '//' + a.host;
  })();
  var theme = currentScript.getAttribute('data-theme') || 'dark';
  var position = currentScript.getAttribute('data-position') || 'bottom-right';

  // Prevent multiple injections
  if (document.getElementById('finpilot-sdk-container')) return;

  // Create Container
  var container = document.createElement('div');
  container.id = 'finpilot-sdk-container';
  container.style.position = 'fixed';
  container.style.zIndex = '999999';
  container.style.bottom = '24px';
  if (position === 'bottom-left') {
    container.style.left = '24px';
  } else {
    container.style.right = '24px';
  }
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.alignItems = position === 'bottom-left' ? 'flex-start' : 'flex-end';
  container.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';

  // Create Floating Action Button (FAB)
  var btn = document.createElement('button');
  btn.id = 'finpilot-fab-btn';
  btn.title = 'Open FinPilot AI Financial Copilot';
  btn.style.width = '56px';
  btn.style.height = '56px';
  btn.style.borderRadius = '50%';
  btn.style.backgroundColor = '#059669';
  btn.style.color = '#ffffff';
  btn.style.border = 'none';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 10px 25px -5px rgba(5, 150, 105, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)';
  btn.style.display = 'flex';
  btn.style.alignItems = 'center';
  btn.style.justifyContent = 'center';
  btn.style.transition = 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
  btn.style.outline = 'none';

  btn.innerHTML = `
    <svg id="fp-icon-chat" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      <path d="M12 7v2"></path>
      <path d="M12 13h.01"></path>
    </svg>
    <svg id="fp-icon-close" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;

  // Create Iframe Widget
  var iframe = document.createElement('iframe');
  iframe.id = 'finpilot-chat-iframe';
  iframe.src = hostUrl + '/sdk/widget/widget.html?api_key=' + encodeURIComponent(apiKey) + '&server=' + encodeURIComponent(hostUrl);
  iframe.style.width = '420px';
  iframe.style.height = '620px';
  iframe.style.maxWidth = 'calc(100vw - 32px)';
  iframe.style.maxHeight = 'calc(100vh - 100px)';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '16px';
  iframe.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.6)';
  iframe.style.marginBottom = '16px';
  iframe.style.display = 'none';
  iframe.style.opacity = '0';
  iframe.style.transform = 'translateY(20px) scale(0.95)';
  iframe.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
  iframe.setAttribute('allow', 'clipboard-write');

  var isOpen = false;

  function toggleWidget() {
    isOpen = !isOpen;
    var iconChat = document.getElementById('fp-icon-chat');
    var iconClose = document.getElementById('fp-icon-close');

    if (isOpen) {
      iframe.style.display = 'block';
      setTimeout(function() {
        iframe.style.opacity = '1';
        iframe.style.transform = 'translateY(0) scale(1)';
      }, 10);
      btn.style.transform = 'rotate(90deg)';
      btn.style.backgroundColor = '#1e293b';
      if (iconChat) iconChat.style.display = 'none';
      if (iconClose) iconClose.style.display = 'block';
    } else {
      iframe.style.opacity = '0';
      iframe.style.transform = 'translateY(20px) scale(0.95)';
      btn.style.transform = 'rotate(0deg)';
      btn.style.backgroundColor = '#059669';
      if (iconChat) iconChat.style.display = 'block';
      if (iconClose) iconClose.style.display = 'none';
      setTimeout(function() {
        iframe.style.display = 'none';
      }, 250);
    }
  }

  btn.addEventListener('click', toggleWidget);

  // Listen for close events from inside the iframe
  window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'FINPILOT_CLOSE_WIDGET') {
      if (isOpen) toggleWidget();
    }
  });

  // Hover animations
  btn.addEventListener('mouseenter', function() {
    btn.style.transform = isOpen ? 'rotate(90deg) scale(1.08)' : 'scale(1.08)';
  });
  btn.addEventListener('mouseleave', function() {
    btn.style.transform = isOpen ? 'rotate(90deg) scale(1)' : 'scale(1)';
  });

  container.appendChild(iframe);
  container.appendChild(btn);

  if (document.body) {
    document.body.appendChild(container);
  } else {
    window.addEventListener('DOMContentLoaded', function() {
      document.body.appendChild(container);
    });
  }
})();
