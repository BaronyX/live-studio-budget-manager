import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx,html}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        sf: 'var(--sf)',
        tx: 'var(--tx)',
        mu: 'var(--mu)',
        bd: 'var(--bd)',
        ac: 'var(--ac)',
        ok: 'var(--ok)',
        wa: 'var(--wa)'
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.1)'
      }
    },
  },
  plugins: [],
} satisfies Config;