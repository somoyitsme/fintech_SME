/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Golden Summer Fields Brand Palette
        brand: {
          sage: '#CCD5AE',
          olive: '#E9EDC9',
          cream: '#FEFAE0',
          sand: '#FAEDCD',
          ochre: '#D4A373',
          ochreDark: '#B88352',
          ochreDeep: '#8C5824',
          ochreLight: '#E6C4A2',
          sageDark: '#A8B388',
          oliveDark: '#C9CEAA',
        },
        // Dynamic Theme Tokens backed by CSS Variables
        canvas: 'var(--bg-app)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          secondary: 'var(--bg-surface-secondary)',
          tertiary: 'var(--bg-surface-tertiary)',
          hover: 'var(--bg-surface-hover)',
        },
        boundary: {
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
          focus: 'var(--border-focus)',
        },
        content: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          inverse: 'var(--text-inverse)',
        },
        status: {
          success: 'var(--success)',
          successBg: 'var(--success-bg)',
          successBorder: 'var(--success-border)',
          warning: 'var(--warning)',
          warningBg: 'var(--warning-bg)',
          warningBorder: 'var(--warning-border)',
          danger: 'var(--danger)',
          dangerBg: 'var(--danger-bg)',
          dangerBorder: 'var(--danger-border)',
          info: 'var(--info)',
          infoBg: 'var(--info-bg)',
          infoBorder: 'var(--info-border)',
        },
        // Legacy theme tokens preserved for compatibility
        theme: {
          bg: '#0d1117',
          card: '#161b22',
          subcard: '#1c2128',
          border: '#30363d',
          hover: '#262c36',
          textMuted: '#8b949e',
          textDim: '#6e7681',
          textBright: '#f0f6fc',
          accent: '#388bfd',
          accentSoft: 'rgba(56, 139, 253, 0.12)',
          success: '#2ea043',
          successSoft: 'rgba(46, 160, 67, 0.12)',
          warning: '#d29922',
          warningSoft: 'rgba(210, 153, 34, 0.12)',
          danger: '#f85149',
          dangerSoft: 'rgba(248, 81, 73, 0.12)',
        }
      }
    },
  },
  plugins: [],
}

