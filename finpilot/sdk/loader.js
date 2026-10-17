/**
 * FinPilot Embeddable Copilot SDK Loader
 * Usage:
 * <script src="http://localhost:8000/sdk/loader.js" data-api-key="fp_live_testdemo123456789abcdef"></script>
 */
(function () {
  'use strict';

  if (window.FinPilot) return;

  const currentScript = document.currentScript || document.querySelector('script[data-api-key]');
  const apiKey = currentScript ? currentScript.getAttribute('data-api-key') : null;
  const baseUrl = currentScript && currentScript.src ? new URL(currentScript.src).origin : 'http://localhost:8000';

  let isOpen = false;
  let iframe = null;
  let bubbleButton = null;

  function init() {
    // 1. Create floating launcher bubble button
    bubbleButton = document.createElement('div');
    bubbleButton.id = 'finpilot-launcher-bubble';
    bubbleButton.innerHTML = `
      <div style="
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 60px;
        height: 60px;
        border-radius: 30px;
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4), 0 8px 10px -6px rgba(37, 99, 235, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 999999;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a8 8 0 0 0-8 8c0 3.3 2 6.2 5 7.4V20a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2.6c3-1.2 5-4.1 5-7.4a8 8 0 0 0-8-8z"/>
          <line x1="9.5" y1="9" x2="9.51" y2="9"/>
          <line x1="14.5" y1="9" x2="14.51" y2="9"/>
        </svg>
      </div>
    `;
    document.body.appendChild(bubbleButton);

    // 2. Create isolated IFrame container
    iframe = document.createElement('iframe');
    iframe.id = 'finpilot-copilot-iframe';
    iframe.src = `${baseUrl}/sdk/widget.html?apiKey=${encodeURIComponent(apiKey || '')}&origin=${encodeURIComponent(window.location.origin)}`;
    iframe.style.cssText = `
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 420px;
      height: 640px;
      max-height: calc(100vh - 120px);
      max-width: calc(100vw - 48px);
      border: none;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      z-index: 999998;
      display: none;
      transition: opacity 0.2s ease, transform 0.2s ease;
      opacity: 0;
      transform: translateY(15px);
    `;
    document.body.appendChild(iframe);

    // 3. Event listeners
    bubbleButton.addEventListener('click', toggleWidget);

    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'FINPILOT_CLOSE_WIDGET') {
        closeWidget();
      }
    });
  }

  function toggleWidget() {
    if (isOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  }

  function openWidget() {
    iframe.style.display = 'block';
    setTimeout(() => {
      iframe.style.opacity = '1';
      iframe.style.transform = 'translateY(0)';
    }, 10);
    isOpen = true;
  }

  function closeWidget() {
    iframe.style.opacity = '0';
    iframe.style.transform = 'translateY(15px)';
    setTimeout(() => {
      iframe.style.display = 'none';
    }, 200);
    isOpen = false;
  }

  window.FinPilot = {
    open: openWidget,
    close: closeWidget,
    toggle: toggleWidget,
    version: '1.0.0'
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
