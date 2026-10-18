/**
 * FinPilot Agent SDK Loader
 *
 * Embeds FinPilot widget into any SME website with a single <script> tag.
 *
 * Usage:
 * <script src="http://localhost:8100/sdk/loader.js" data-api-key="fp_live_xxx"></script>
 *
 * Features:
 * - Sandboxed iframe widget
 * - Cross-origin message passing with validation
 * - CSS/DOM isolation
 * - Responsive positioning
 */

(function() {
  'use strict';

  const HOST = 'http://localhost:8100';
  const WIDGET_URL = `${HOST}/sdk/widget.html`;

  // Extract API key from script tag
  const scriptTag = document.currentScript;
  if (!scriptTag) {
    console.error('[FinPilot] Cannot find script tag');
    return;
  }

  const apiKey = scriptTag.dataset.apiKey;
  if (!apiKey) {
    console.error('[FinPilot] Missing data-api-key attribute');
    return;
  }

  // Create iframe container
  const container = document.createElement('div');
  container.id = 'finpilot-container';
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    width: 400px;
    max-width: calc(100vw - 40px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    border-radius: 16px;
    overflow: hidden;
    transition: all 0.3s ease;
  `;

  const iframe = document.createElement('iframe');
  iframe.id = 'finpilot-iframe';
  iframe.src = `${WIDGET_URL}?apiKey=${encodeURIComponent(apiKey)}`;
  iframe.style.cssText = `
    width: 100%;
    height: 600px;
    border: none;
    display: block;
    border-radius: 16px;
  `;
  iframe.allow = 'clipboard-write';
  iframe.sandbox = 'allow-scripts allow-same-origin allow-forms';

  container.appendChild(iframe);

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => document.body.appendChild(container));
  } else {
    document.body.appendChild(container);
  }

  // Cross-origin message handler
  window.addEventListener('message', (event) => {
    if (event.origin !== HOST) return;

    const { type, height, visible } = event.data;

    if (type === 'resize' && typeof height === 'number') {
      iframe.style.height = `${height}px`;
    }

    if (type === 'toggle' && typeof visible === 'boolean') {
      container.style.display = visible ? 'block' : 'none';
    }
  });

  console.log('[FinPilot] Widget loaded');
})();
