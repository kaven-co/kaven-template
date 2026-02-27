/**
 * Shadcn/UI Design System Adapter
 * Translates semantic tokens to Shadcn/UI design language
 *
 * Shadcn/UI aesthetic: minimal, clean whites, dark slates, subtle borders,
 * HSL-based CSS variables, Inter/system font stack, Tailwind spacing scale.
 */

import type {
  DesignSystemAdapter,
  SemanticDesignTokens,
  UserCustomization,
} from '@/lib/design-system/core/types';
import { DesignSystemType } from '@/lib/design-system/core/types';
import { defaultLightTokens, defaultDarkTokens } from '@/lib/design-system/core/tokens';

export class ShadcnAdapter implements DesignSystemAdapter {
  type: DesignSystemType = DesignSystemType.SHADCN;
  name = 'Shadcn/UI';

  getDefaultTokens(mode: 'light' | 'dark'): SemanticDesignTokens {
    const baseTokens = mode === 'light' ? defaultLightTokens : defaultDarkTokens;

    if (mode === 'light') {
      return {
        ...baseTokens,
        colors: {
          ...baseTokens.colors,
          brand: {
            // Primary — Shadcn dark slate (hsl 222.2 47.4% 11.2%)
            primary: '#18181b',
            primaryLight: '#3f3f46',
            primaryLighter: '#71717a',
            primaryDark: '#09090b',
            primaryDarker: '#030305',

            // Secondary — Shadcn muted slate (hsl 210 40% 96.1%)
            secondary: '#f1f5f9',
            secondaryLight: '#f8fafc',
            secondaryLighter: '#ffffff',
            secondaryDark: '#e2e8f0',
            secondaryDarker: '#cbd5e1',

            // Success — Tailwind emerald
            success: '#10b981',
            successLight: '#6ee7b7',
            successLighter: '#d1fae5',
            successDark: '#059669',
            successDarker: '#065f46',

            // Warning — Tailwind amber
            warning: '#f59e0b',
            warningLight: '#fcd34d',
            warningLighter: '#fef3c7',
            warningDark: '#d97706',
            warningDarker: '#92400e',

            // Error — Shadcn destructive (hsl 0 84.2% 60.2%)
            error: '#ef4444',
            errorLight: '#fca5a5',
            errorLighter: '#fee2e2',
            errorDark: '#dc2626',
            errorDarker: '#991b1b',

            // Info — Tailwind sky
            info: '#0ea5e9',
            infoLight: '#7dd3fc',
            infoLighter: '#e0f2fe',
            infoDark: '#0284c7',
            infoDarker: '#075985',
          },
          text: {
            primary: '#09090b', // Shadcn foreground
            secondary: '#71717a', // zinc-500
            disabled: '#a1a1aa', // zinc-400
            inverse: '#fafafa', // Shadcn dark foreground
          },
          background: {
            default: '#ffffff', // Shadcn background
            paper: '#ffffff',
            elevated: '#fafafa', // zinc-50
            overlay: 'rgba(0, 0, 0, 0.8)',
            neutral: '#f4f4f5', // zinc-100
          },
          border: {
            default: '#e4e4e7', // zinc-200 (Shadcn border)
            subtle: '#f4f4f5', // zinc-100
            strong: '#a1a1aa', // zinc-400
          },
          grey: {
            50: '#fafafa',
            100: '#f4f4f5',
            200: '#e4e4e7',
            300: '#d4d4d8',
            400: '#a1a1aa',
            500: '#71717a',
            600: '#52525b',
            700: '#3f3f46',
            800: '#27272a',
            900: '#18181b',
          },
        },
        typography: {
          ...baseTokens.typography,
          // Shadcn uses Inter / system font stack
          fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
          fontFamilyMono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
          fontFamilyHeadings:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
          // Shadcn uses tighter, smaller type scale
          fontSize: {
            h1: 'clamp(2rem, 4vw, 3rem)', // smaller than MUI
            h2: 'clamp(1.5rem, 3vw, 2.25rem)',
            h3: 'clamp(1.25rem, 2.5vw, 1.75rem)',
            h4: 'clamp(1.125rem, 2vw, 1.375rem)',
            h5: '1.125rem',
            h6: '1rem',
            xs: '0.75rem',
            sm: '0.875rem',
            base: '0.875rem', // Shadcn base is 14px
            lg: '1rem',
            xl: '1.125rem',
            '2xl': '1.25rem',
            '3xl': '1.5rem',
            '4xl': '2rem',
            '5xl': '2.5rem',
          },
          lineHeight: {
            tight: '1.25',
            normal: '1.5',
            relaxed: '1.75',
            h1: '1.2',
            h2: '1.25',
            h3: '1.33',
            h4: '1.4',
            h5: '1.5',
            h6: '1.5',
            body1: '1.5',
            body2: '1.43',
            button: '1.25',
          },
        },
        // Tailwind 4px base spacing scale
        spacing: {
          xs: '0.25rem', // 4px
          sm: '0.5rem', // 8px
          md: '1rem', // 16px
          lg: '1.5rem', // 24px
          xl: '2rem', // 32px
          '2xl': '2.5rem', // 40px
          '3xl': '3rem', // 48px
          '4xl': '4rem', // 64px
        },
        // Shadcn default radius is 0.5rem (8px), quite rounded
        radius: {
          none: '0',
          sm: '0.25rem', // calc(var(--radius) - 4px)
          md: '0.375rem', // calc(var(--radius) - 2px)
          lg: '0.5rem', // var(--radius) — Shadcn default
          xl: '0.75rem',
          '2xl': '1rem',
          full: '9999px',
        },
        shadows: {
          // Shadcn uses very subtle shadows — minimal aesthetic
          z0: 'none',
          z1: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          z4: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          z8: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          z12: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
          z16: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          z20: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
          z24: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
          customShadows: {
            primary: '0 4px 14px 0 rgb(24 24 27 / 0.2)',
            secondary: '0 4px 14px 0 rgb(241 245 249 / 0.2)',
            success: '0 4px 14px 0 rgb(16 185 129 / 0.2)',
            warning: '0 4px 14px 0 rgb(245 158 11 / 0.2)',
            error: '0 4px 14px 0 rgb(239 68 68 / 0.2)',
            info: '0 4px 14px 0 rgb(14 165 233 / 0.2)',
          },
        },
        transitions: {
          duration: {
            shortest: '100ms',
            shorter: '150ms',
            short: '200ms',
            standard: '200ms', // Shadcn uses snappier transitions
            complex: '300ms',
            enteringScreen: '200ms',
            leavingScreen: '150ms',
          },
          easing: {
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
          },
        },
      };
    }

    // Dark mode
    return {
      ...baseTokens,
      colors: {
        ...baseTokens.colors,
        brand: {
          // Primary — Shadcn dark primary (light foreground)
          primary: '#fafafa',
          primaryLight: '#e4e4e7',
          primaryLighter: '#d4d4d8',
          primaryDark: '#f4f4f5',
          primaryDarker: '#ffffff',

          // Secondary — Shadcn dark secondary
          secondary: '#27272a',
          secondaryLight: '#3f3f46',
          secondaryLighter: '#52525b',
          secondaryDark: '#18181b',
          secondaryDarker: '#09090b',

          // Success
          success: '#10b981',
          successLight: '#6ee7b7',
          successLighter: '#064e3b',
          successDark: '#34d399',
          successDarker: '#a7f3d0',

          // Warning
          warning: '#f59e0b',
          warningLight: '#fcd34d',
          warningLighter: '#451a03',
          warningDark: '#fbbf24',
          warningDarker: '#fde68a',

          // Error — Shadcn dark destructive
          error: '#ef4444',
          errorLight: '#fca5a5',
          errorLighter: '#450a0a',
          errorDark: '#f87171',
          errorDarker: '#fecaca',

          // Info
          info: '#0ea5e9',
          infoLight: '#7dd3fc',
          infoLighter: '#0c4a6e',
          infoDark: '#38bdf8',
          infoDarker: '#bae6fd',
        },
        text: {
          primary: '#fafafa', // Shadcn dark foreground
          secondary: '#a1a1aa', // zinc-400
          disabled: '#52525b', // zinc-600
          inverse: '#09090b',
        },
        background: {
          default: '#09090b', // Shadcn dark background
          paper: '#0a0a0a',
          elevated: '#18181b', // zinc-900
          overlay: 'rgba(0, 0, 0, 0.8)',
          neutral: '#18181b', // zinc-900
        },
        border: {
          default: '#27272a', // zinc-800 (Shadcn dark border)
          subtle: '#18181b', // zinc-900
          strong: '#3f3f46', // zinc-700
        },
        grey: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b',
        },
      },
      typography: {
        ...baseTokens.typography,
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
        fontFamilyMono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
        fontFamilyHeadings:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
        fontSize: {
          h1: 'clamp(2rem, 4vw, 3rem)',
          h2: 'clamp(1.5rem, 3vw, 2.25rem)',
          h3: 'clamp(1.25rem, 2.5vw, 1.75rem)',
          h4: 'clamp(1.125rem, 2vw, 1.375rem)',
          h5: '1.125rem',
          h6: '1rem',
          xs: '0.75rem',
          sm: '0.875rem',
          base: '0.875rem',
          lg: '1rem',
          xl: '1.125rem',
          '2xl': '1.25rem',
          '3xl': '1.5rem',
          '4xl': '2rem',
          '5xl': '2.5rem',
        },
        lineHeight: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75',
          h1: '1.2',
          h2: '1.25',
          h3: '1.33',
          h4: '1.4',
          h5: '1.5',
          h6: '1.5',
          body1: '1.5',
          body2: '1.43',
          button: '1.25',
        },
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '2.5rem',
        '3xl': '3rem',
        '4xl': '4rem',
      },
      radius: {
        none: '0',
        sm: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      shadows: {
        z0: 'none',
        z1: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        z4: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        z8: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        z12: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        z16: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        z20: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        z24: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        customShadows: {
          primary: '0 4px 14px 0 rgb(250 250 250 / 0.1)',
          secondary: '0 4px 14px 0 rgb(39 39 42 / 0.1)',
          success: '0 4px 14px 0 rgb(16 185 129 / 0.2)',
          warning: '0 4px 14px 0 rgb(245 158 11 / 0.2)',
          error: '0 4px 14px 0 rgb(239 68 68 / 0.2)',
          info: '0 4px 14px 0 rgb(14 165 233 / 0.2)',
        },
      },
      transitions: {
        duration: {
          shortest: '100ms',
          shorter: '150ms',
          short: '200ms',
          standard: '200ms',
          complex: '300ms',
          enteringScreen: '200ms',
          leavingScreen: '150ms',
        },
        easing: {
          easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
          easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
          easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
          sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
        },
      },
    };
  }

  toSemanticTokens(customization: UserCustomization): SemanticDesignTokens {
    const baseTokens = this.getDefaultTokens(customization.mode);

    // Apply user customizations
    const tokens: SemanticDesignTokens = {
      ...baseTokens,
      colors: {
        ...baseTokens.colors,
        brand: {
          ...baseTokens.colors.brand,
          ...(customization.colors?.primary && { primary: customization.colors.primary }),
          ...(customization.colors?.secondary && { secondary: customization.colors.secondary }),
          ...(customization.colors?.success && { success: customization.colors.success }),
          ...(customization.colors?.warning && { warning: customization.colors.warning }),
          ...(customization.colors?.error && { error: customization.colors.error }),
          ...(customization.colors?.info && { info: customization.colors.info }),
        },
      },
    };

    // Apply typography customization
    if (customization.typography?.fontFamily) {
      tokens.typography.fontFamily = `'${customization.typography.fontFamily}', ${baseTokens.typography.fontFamily}`;
    }

    if (customization.typography?.fontSize) {
      const scale = customization.typography.fontSize;
      Object.keys(tokens.typography.fontSize).forEach((key) => {
        const currentSize = parseFloat(
          tokens.typography.fontSize[key as keyof typeof tokens.typography.fontSize]
        );
        tokens.typography.fontSize[key as keyof typeof tokens.typography.fontSize] =
          `${currentSize * scale}rem`;
      });
    }

    // Apply spacing customization
    if (customization.spacing?.scale) {
      const scale = customization.spacing.scale;
      Object.keys(tokens.spacing).forEach((key) => {
        const currentSpacing = parseFloat(tokens.spacing[key as keyof typeof tokens.spacing]);
        tokens.spacing[key as keyof typeof tokens.spacing] = `${currentSpacing * scale}rem`;
      });
    }

    // Apply radius customization
    if (customization.radius?.scale) {
      const scale = customization.radius.scale;
      Object.keys(tokens.radius).forEach((key) => {
        if (key === 'none' || key === 'full') return;
        const currentRadius = parseFloat(tokens.radius[key as keyof typeof tokens.radius]);
        tokens.radius[key as keyof typeof tokens.radius] = `${currentRadius * scale}rem`;
      });
    }

    return tokens;
  }

  validateCustomization(customization: Partial<UserCustomization>): boolean {
    // Validate color format
    if (customization.colors) {
      const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      for (const color of Object.values(customization.colors)) {
        if (color && !colorRegex.test(color)) {
          return false;
        }
      }
    }

    // Validate scale values
    if (
      customization.typography?.fontSize &&
      (customization.typography.fontSize < 0.5 || customization.typography.fontSize > 2)
    ) {
      return false;
    }

    if (
      customization.spacing?.scale &&
      (customization.spacing.scale < 0.5 || customization.spacing.scale > 2)
    ) {
      return false;
    }

    if (
      customization.radius?.scale &&
      (customization.radius.scale < 0.5 || customization.radius.scale > 2)
    ) {
      return false;
    }

    return true;
  }
}

// Export singleton instance
export const shadcnAdapter = new ShadcnAdapter();
