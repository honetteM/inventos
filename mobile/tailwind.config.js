/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0a7ea4',
          50: '#eefbff',
          100: '#d9f3ff',
          200: '#bbebff',
          300: '#8ee0ff',
          400: '#59ccf7',
          500: '#33b5e8',
          600: '#1d9ccd',
          700: '#0a7ea4',
          800: '#0f6587',
          900: '#135470',
          950: '#0c374b',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#151718',
          50: '#f8fafc',
          100: '#f1f5f9',
          150: '#eef2f6',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        rounded: ['ui-rounded', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
