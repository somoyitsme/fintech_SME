/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
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
