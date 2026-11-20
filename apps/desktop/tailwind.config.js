/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/renderer/**/*.{js,ts,jsx,tsx,html}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nova: {
          'bg-dark': '#080a10',
          'panel-dark': '#0d111b',
          'card-dark': '#131826',
          'border-dark': '#1c2438',
          'border-glow': '#2e3a59',
          'bg-light': '#f8fafc',
          'panel-light': '#ffffff',
          'card-light': '#f1f5f9',
          'border-light': '#e2e8f0',
          purple: '#a855f7',
          'purple-glow': '#c084fc',
          cyan: '#06b6d4',
          'cyan-glow': '#22d3ee',
          blue: '#3b82f6',
          pink: '#ec4899',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e'
        },
        nexcode: {
          950: '#07090e',
          900: '#0c1017',
          850: '#111622',
          800: '#161d2e',
          750: '#1d263b',
          700: '#26314c',
          600: '#38466b',
          500: '#6366f1',
          400: '#818cf8',
          accent: '#6366f1',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e'
        }
      },
      boxShadow: {
        'nova-purple': '0 0 20px -5px rgba(168, 85, 247, 0.35)',
        'nova-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.35)',
        'nova-glow': '0 0 15px rgba(192, 132, 252, 0.25)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"Fira Code"', '"JetBrains Mono"', 'Cascadia Code', 'Consolas', 'monospace']
      }
    }
  },
  plugins: []
};
