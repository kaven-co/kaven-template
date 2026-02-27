export const brandTokens = {
  color: {
    brand: {
      primary: '#F59E0B', // amber-500
      primaryHover: '#D97706', // amber-600
      primaryDark: '#FBBF24', // amber-400 (dark mode hover)
      primarySubtle: '#FEF3C7', // amber-50
      secondary: '#3B82F6', // blue-500
      secondaryHover: '#2563EB', // blue-600
    },
    surface: {
      base: '#0F172A',
      elevated: '#1E293B',
      border: '#334155',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
      muted: '#475569',
    },
    code: {
      green: '#10B981',
      text: '#E2E8F0',
      bg: '#0F172A',
    },
    feedback: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    },
  },
  typography: {
    fontDisplay: '"Geist Sans", "Geist", sans-serif',
    fontBody: '"DM Sans", sans-serif',
    fontMono: '"Geist Mono", monospace',
  },
  radius: {
    xs: '2px',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '10px',
    full: '9999px',
  },
} as const;

export type BrandTone = 'default' | 'brand' | 'success' | 'warning' | 'error' | 'info';
