export const sizeScale = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
export type ComponentSize = (typeof sizeScale)[number];

export const densityScale = ['compact', 'comfortable', 'spacious'] as const;
export type Density = (typeof densityScale)[number];

export const sizingTokens = {
  controlHeight: {
    '2xs': 24,
    xs: 28,
    sm: 32,
    md: 36,
    lg: 40,
    xl: 48,
    '2xl': 56,
  },
  icon: {
    '2xs': 12,
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 24,
    '2xl': 32,
  },
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '20px',
    full: '9999px',
  },
  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
  },
} as const;
