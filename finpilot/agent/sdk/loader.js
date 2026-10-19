/**
 * FinPilot Embeddable SDK Loader
 *
 * Auto-theming widget that adapts to ANY host website.
 *
 * Usage:
 *   <script src="/sdk/loader.js" data-api-key="YOUR_KEY" data-theme="auto"></script>
 */
(function () {
  'use strict';

  const script = document.currentScript;
  if (!script) {
    console.error('[FinPilot] Cannot detect script tag');
    return;
  }

  const API_KEY = script.dataset.apiKey;
  const TENANT_ID = script.dataset.tenantId || '28434594-e04c-4aae-aa17-d4612114e348';
  const THEME_MODE = script.dataset.theme || 'auto'; // auto | light | dark
  const API_BASE = script.src.replace(/\/sdk\/loader\.js.*$/, '');
  const POSITION = script.dataset.position || 'bottom-right';

  if (!API_KEY) {
    console.error('[FinPilot] data-api-key attribute is required');
    return;
  }

  // ── Auto-detect host theme ──
  function detectHostTheme() {
    const root = document.documentElement;
    const body = document.body;
    const cs = getComputedStyle(body);

    // Detect background color
    const bgColor = cs.backgroundColor || getComputedStyle(root).backgroundColor || '#ffffff';
    const textColor = cs.color || '#1a1a1a';

    // Detect primary/brand color (look for common CSS variables first)
    let primaryColor = null;
    const brandVars = [
      '--primary-color', '--brand-color', '--accent-color',
      '--color-primary', '--theme-primary', '--main-color'
    ];
    for (const v of brandVars) {
      const val = getComputedStyle(root).getPropertyValue(v).trim();
      if (val) { primaryColor = val; break; }
    }

    // Fallback: check for buttons/links with distinct color
    if (!primaryColor) {
      const btn = document.querySelector('button, .btn, a[href]');
      if (btn) {
        const btnColor = getComputedStyle(btn).backgroundColor;
        if (btnColor && btnColor !== 'rgba(0, 0, 0, 0)' && btnColor !== 'transparent') {
          primaryColor = btnColor;
        }
      }
    }
    if (!primaryColor) primaryColor = '#2563eb'; // sensible default

    // Detect font family
    const fontFamily = cs.fontFamily || 'system-ui, -apple-system, sans-serif';

    // Detect dark mode
    let isDark;
    if (THEME_MODE === 'dark') isDark = true;
    else if (THEME_MODE === 'light') isDark = false;
    else {
      // Check prefers-color-scheme
      isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      // Also check computed bg luminance
      const rgb = parseRgb(bgColor);
      if (rgb) {
        const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
        if (luminance < 0.5) isDark = true;
      }
    }

    // Detect border radius for native feel
    const borderRad = cs.borderRadius || '8px';

    return {
      bg: bgColor,
      text: textColor,
      primary: primaryColor,
      font: fontFamily,
      dark: isDark,
      radius: borderRad,
    };
  }

  function parseRgb(color) {
    const m = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    return m ? [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])] : null;
  }

  // ── Build widget iframe ──
  function createWidget() {
    const theme = detectHostTheme();

    const container = document.createElement('div');
    container.id = 'finpilot-agent-root';
    container.style.cssText = `
      position: fixed;
      ${POSITION.includes('bottom') ? 'bottom: 24px;' : 'top: 24px;'}
      ${POSITION.includes('right') ? 'right: 24px;' : 'left: 24px;'}
      z-index: 2147483647;
      width: 420px;
      max-width: calc(100vw - 48px);
      height: 620px;
      max-height: calc(100vh - 48px);
      border-radius: ${theme.radius};
      box-shadow: 0 12px 48px rgba(0,0,0,${theme.dark ? '0.5' : '0.18'});
      overflow: hidden;
      transition: transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.25s;
      transform: translateY(20px);
      opacity: 0;
      font-family: ${theme.font};
    `;

    const iframe = document.createElement('iframe');
    iframe.src = `${API_BASE}/sdk/widget.html`;
    iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
    iframe.allow = 'clipboard-write';
    iframe.sandbox = 'allow-scripts allow-same-origin allow-forms allow-popups';

    // Wait for iframe to signal ready, then pass theme + config
    iframe.addEventListener('load', () => {
      iframe.contentWindow.postMessage({
        type: 'finpilot:init',
        config: {
          apiKey: API_KEY,
          apiBase: API_BASE,
          tenantId: TENANT_ID,
          theme: theme,
        },
      }, '*');
    });

    container.appendChild(iframe);

    // Launcher button
    const launcher = document.createElement('button');
    launcher.id = 'finpilot-launcher';
    launcher.setAttribute('aria-label', 'Open FinPilot');
    launcher.style.cssText = `
      position: fixed;
      ${POSITION.includes('bottom') ? 'bottom: 24px;' : 'top: 24px;'}
      ${POSITION.includes('right') ? 'right: 24px;' : 'left: 24px;'}
      z-index: 2147483646;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      background: ${theme.primary};
      color: white;
      cursor: pointer;
      box-shadow: 0 6px 24px rgba(0,0,0,${theme.dark ? '0.5' : '0.25'});
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
      font-family: ${theme.font};
    `;
    launcher.innerHTML = `
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        <circle cx="9" cy="10" r="1" fill="currentColor"></circle>
        <circle cx="12" cy="10" r="1" fill="currentColor"></circle>
        <circle cx="15" cy="10" r="1" fill="currentColor"></circle>
      </svg>
    `;
    launcher.addEventListener('mouseenter', () => {
      launcher.style.transform = 'scale(1.08)';
      launcher.style.boxShadow = `0 8px 32px rgba(0,0,0,${theme.dark ? '0.6' : '0.35'})`;
    });
    launcher.addEventListener('mouseleave', () => {
      launcher.style.transform = 'scale(1)';
      launcher.style.boxShadow = `0 6px 24px rgba(0,0,0,${theme.dark ? '0.5' : '0.25'})`;
    });

    let open = false;

    function setOpen(state) {
      open = state;
      container.style.transform = open ? 'translateY(0)' : 'translateY(20px)';
      container.style.opacity = open ? '1' : '0';
      container.style.pointerEvents = open ? 'auto' : 'none';
      launcher.style.opacity = open ? '0' : '1';
      launcher.style.pointerEvents = open ? 'none' : 'auto';
    }

    launcher.addEventListener('click', () => setOpen(true));

    // Listen for widget close/toggle messages
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'finpilot:close') setOpen(false);
      if (e.data && e.data.type === 'finpilot:resize') {
        container.style.height = `${Math.min(e.data.height, window.innerHeight - 48)}px`;
      }
    });

    document.body.appendChild(container);
    document.body.appendChild(launcher);

    // Animate in
    requestAnimationFrame(() => {
      launcher.style.opacity = '1';
    });
    setOpen(false);
  }

  // ── Initialize ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget);
  } else {
    createWidget();
  }
})();
