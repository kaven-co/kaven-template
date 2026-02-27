/**
 * @kaven/ui-base Tailwind Preset — Frost Design System
 *
 * Compatible with Tailwind CSS v3 and v4.
 *
 * Usage (Tailwind v3 tailwind.config.ts):
 *   import kavenPreset from '@kaven/ui-base/tailwind-preset';
 *   export default { presets: [kavenPreset], content: [...] };
 *
 * Usage (Tailwind v4 CSS-first):
 *   Use tokens.css directly — @import '@kaven/ui-base/tokens.css';
 *   The CSS custom properties are the v4-compatible path.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const kavenPreset: Record<string, any> = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Primary brand — Amber
        primary: {
          DEFAULT:    '#F59E0B',
          hover:      '#D97706',
          dark:       '#FBBF24',
          subtle:     '#FEF3C7',
          foreground: '#FFFFFF',
        },
        // Secondary — Blue
        secondary: {
          DEFAULT:    '#3B82F6',
          hover:      '#2563EB',
          dark:       '#60A5FA',
          foreground: '#FFFFFF',
        },
        // Surfaces (Slate — dark-first)
        surface: {
          base:     '#0F172A',
          elevated: '#1E293B',
          border:   '#334155',
        },
        // Feedback
        success: '#10B981',
        warning: '#F59E0B',
        error:   '#EF4444',
        info:    '#3B82F6',
        // CSS var aliases — automatically follow light/dark mode
        background:  'var(--background)',
        foreground:  'var(--foreground)',
        card: {
          DEFAULT:    'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        border:  'var(--border)',
        input:   'var(--input)',
        ring:    'var(--ring)',
        muted: {
          DEFAULT:    'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT:    'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT:    'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        sidebar: {
          DEFAULT:    'var(--sidebar)',
          border:     'var(--sidebar-border)',
          foreground: 'var(--sidebar-foreground)',
          primary:    'var(--sidebar-primary)',
          accent:     'var(--sidebar-accent)',
        },
      },
      fontFamily: {
        display: ['"Geist Sans"', '"Geist"', 'system-ui', 'sans-serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"Geist Mono"', '"Fira Code"', 'monospace'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xs:   '2px',
        sm:   '4px',
        md:   '6px',
        lg:   '8px',
        xl:   '10px',
        full: '9999px',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in':  'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
      },
    },
  },
};

export default kavenPreset;
