/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      // Mapujemy tokeny CSS na klasy Tailwind
      colors: {
        porcelana:    'var(--porcelana)',
        biel:         'var(--biel)',
        kreska:       'var(--kreska)',
        ink:          'var(--ink)',
        'ink-2':      'var(--ink-2)',
        'ink-3':      'var(--ink-3)',
        'emalia-900': 'var(--emalia-900)',
        'emalia-800': 'var(--emalia-800)',
        'emalia-500': 'var(--emalia-500)',
        'na-emalii':  'var(--na-emalii)',
        'na-emalii-2':'var(--na-emalii-2)',
        kurkuma:      'var(--kurkuma)',
        'kurkuma-tekst':  'var(--kurkuma-tekst)',
        'kurkuma-tint':   'var(--kurkuma-tint)',
        tak:          'var(--tak)',
        'tak-tint':   'var(--tak-tint)',
        nie:          'var(--nie)',
        'nie-tint':   'var(--nie-tint)',
      },
      fontFamily: {
        ui:    ['Archivo', 'Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
        prose: ['Source Serif 4', 'Georgia', 'serif'],
      },
      borderRadius: {
        s:     '6px',
        m:     '12px',
        l:     '22px',
        karta: '26px',
      },
      minHeight: {
        touch: '48px',   // cel dotykowy minimum
      },
      minWidth: {
        touch: '48px',   // cel dotykowy minimum (szerokość)
      },
    },
  },
  plugins: [],
};
