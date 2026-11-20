/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/renderer/**/*.{js,ts,jsx,tsx,html}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
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
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"Fira Code"', '"JetBrains Mono"', 'Cascadia Code', 'Consolas', 'monospace']
      }
    }
  },
  plugins: []
};
