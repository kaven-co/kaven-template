/**
 * Microsoft Fluent UI 2 Design System Adapter
 * Translates semantic tokens to Fluent UI 2 design language
 *
 * Fluent UI 2 aesthetic: clean, professional, Microsoft design language,
 * Segoe UI Variable font stack, grey10-grey190 neutral ramp,
 * brand blue (#0f6cbd), 4px grid spacing, subtle rounded corners.
 *
 * Reference: https://fluent2.microsoft.design/
 */

import type {
  DesignSystemAdapter,
  SemanticDesignTokens,
  UserCustomization,
} from '@/lib/design-system/core/types';
import { DesignSystemType } from '@/lib/design-system/core/types';
import { defaultLightTokens, defaultDarkTokens } from '@/lib/design-system/core/tokens';

export class FluentAdapter implements DesignSystemAdapter {
  type: DesignSystemType = DesignSystemType.FLUENT;
  name = 'Microsoft Fluent UI 2';

  getDefaultTokens(mode: 'light' | 'dark'): SemanticDesignTokens {
    const baseTokens = mode === 'light' ? defaultLightTokens : defaultDarkTokens;

    if (mode === 'light') {
      return {
        ...baseTokens,
        colors: {
          ...baseTokens.colors,
          brand: {
            // Primary — Fluent Brand Blue (colorBrandBackground)
            primary: '#0f6cbd',
            primaryLight: '#2886de',
            primaryLighter: '#b4d6fa',
            primaryDark: '#0e4775',
            primaryDarker: '#092c47',

            // Secondary — Fluent Neutral (grey tints)
            secondary: '#f0f0f0',
            secondaryLight: '#f5f5f5',
            secondaryLighter: '#fafafa',
            secondaryDark: '#e0e0e0',
            secondaryDarker: '#d1d1d1',

            // Success — Fluent colorStatusSuccessForeground1
            success: '#0e7a0d',
            successLight: '#54b054',
            successLighter: '#d1f7d1',
            successDark: '#0b5e0b',
            successDarker: '#063b06',

            // Warning — Fluent colorStatusWarningForeground1
            warning: '#bc4b09',
            warningLight: '#d67e3c',
            warningLighter: '#fce5d0',
            warningDark: '#8a3707',
            warningDarker: '#5c2405',

            // Error — Fluent colorStatusDangerForeground1
            error: '#b10e1c',
            errorLight: '#dc626d',
            errorLighter: '#fdd3d7',
            errorDark: '#8b0a14',
            errorDarker: '#5c060d',

            // Info — Fluent colorBrandForeground1
            info: '#0f6cbd',
            infoLight: '#5caee5',
            infoLighter: '#cfe4fa',
            infoDark: '#0e4775',
            infoDarker: '#092c47',
          },
          text: {
            primary: '#242424', // colorNeutralForeground1 (grey14)
            secondary: '#616161', // colorNeutralForeground2 (grey38)
            disabled: '#bdbdbd', // colorNeutralForegroundDisabled (grey74)
            inverse: '#ffffff', // colorNeutralForegroundOnBrand
          },
          background: {
            default: '#ffffff', // colorNeutralBackground1
            paper: '#ffffff', // colorNeutralBackground1
            elevated: '#fafafa', // colorNeutralBackground2 (grey98)
            overlay: 'rgba(0, 0, 0, 0.4)', // colorBackgroundOverlay
            neutral: '#f5f5f5', // colorNeutralBackground3 (grey96)
          },
          border: {
            default: '#e0e0e0', // colorNeutralStroke1 (grey88)
            subtle: '#f0f0f0', // colorNeutralStroke2 (grey94)
            strong: '#616161', // colorNeutralStrokeAccessible (grey38)
          },
          // Fluent grey ramp (grey10-grey190 mapped to 50-900)
          grey: {
            50: '#fafafa', // grey98
            100: '#f5f5f5', // grey96
            200: '#e0e0e0', // grey88
            300: '#d1d1d1', // grey82
            400: '#bdbdbd', // grey74
            500: '#8a8a8a', // grey54
            600: '#616161', // grey38
            700: '#424242', // grey26
            800: '#303030', // grey19
            900: '#242424', // grey14
          },
        },
        typography: {
          ...baseTokens.typography,
          // Fluent uses Segoe UI Variable
          fontFamily:
            "'Segoe UI Variable', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
          fontFamilyMono: "'Cascadia Code', 'Cascadia Mono', 'Consolas', monospace",
          fontFamilyHeadings:
            "'Segoe UI Variable', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
          // Fluent type ramp
          fontSize: {
            h1: 'clamp(2rem, 4vw, 2.5rem)', // fontSizeHero800 (40px)
            h2: 'clamp(1.5rem, 3vw, 1.75rem)', // fontSizeHero700 (28px)
            h3: 'clamp(1.25rem, 2.5vw, 1.5rem)', // fontSizeBase600 (24px)
            h4: '1.25rem', // fontSizeBase500 (20px)
            h5: '1rem', // fontSizeBase400 (16px)
            h6: '0.875rem', // fontSizeBase300 (14px)
            xs: '0.625rem', // fontSizeBase100 (10px)
            sm: '0.75rem', // fontSizeBase200 (12px)
            base: '0.875rem', // fontSizeBase300 (14px) — Fluent default body
            lg: '1rem', // fontSizeBase400 (16px)
            xl: '1.25rem', // fontSizeBase500 (20px)
            '2xl': '1.5rem', // fontSizeBase600 (24px)
            '3xl': '1.75rem', // fontSizeHero700 (28px)
            '4xl': '2.5rem', // fontSizeHero800 (40px)
            '5xl': '4rem', // fontSizeHero1000 (68px)
          },
          lineHeight: {
            tight: '1.2',
            normal: '1.43', // Fluent default line height for body
            relaxed: '1.6',
            h1: '1.2', // lineHeightHero800
            h2: '1.25', // lineHeightHero700
            h3: '1.33', // lineHeightBase600
            h4: '1.4', // lineHeightBase500
            h5: '1.43', // lineHeightBase400
            h6: '1.43', // lineHeightBase300
            body1: '1.43', // lineHeightBase300
            body2: '1.33', // lineHeightBase200
            button: '1.43',
          },
        },
        // Fluent spacing scale: 2, 4, 6, 8, 12, 16, 20, 24, 32, 48
        spacing: {
          xs: '0.125rem', // 2px — spacingHorizontalXXS
          sm: '0.5rem', // 8px — spacingHorizontalS
          md: '1rem', // 16px — spacingHorizontalM
          lg: '1.5rem', // 24px — spacingHorizontalL
          xl: '2rem', // 32px — spacingHorizontalXL
          '2xl': '2.5rem', // 40px — spacingHorizontalXXL
          '3xl': '3rem', // 48px — spacingHorizontalXXXL
          '4xl': '4rem', // 64px
        },
        // Fluent corner radius: 0, 2, 4, 6, 8, circular
        radius: {
          none: '0', // borderRadiusNone
          sm: '0.125rem', // 2px — borderRadiusSmall
          md: '0.25rem', // 4px — borderRadiusMedium
          lg: '0.375rem', // 6px — borderRadiusLarge
          xl: '0.5rem', // 8px — borderRadiusXLarge
          '2xl': '0.75rem', // 12px — borderRadiusCircular (for cards)
          full: '9999px', // borderRadiusCircular
        },
        // Fluent shadow system: shadow2, shadow4, shadow8, shadow16, shadow28, shadow64
        shadows: {
          z0: 'none',
          z1: '0px 1px 2px rgba(0, 0, 0, 0.14), 0px 0px 2px rgba(0, 0, 0, 0.12)', // shadow2
          z4: '0px 2px 4px rgba(0, 0, 0, 0.14), 0px 0px 2px rgba(0, 0, 0, 0.12)', // shadow4
          z8: '0px 4px 8px rgba(0, 0, 0, 0.14), 0px 0px 2px rgba(0, 0, 0, 0.12)', // shadow8
          z12: '0px 8px 16px rgba(0, 0, 0, 0.14), 0px 0px 2px rgba(0, 0, 0, 0.12)', // shadow16
          z16: '0px 14px 28px rgba(0, 0, 0, 0.24), 0px 0px 8px rgba(0, 0, 0, 0.12)', // shadow28
          z20: '0px 32px 64px rgba(0, 0, 0, 0.24), 0px 0px 8px rgba(0, 0, 0, 0.12)', // shadow64
          z24: '0px 32px 64px rgba(0, 0, 0, 0.24), 0px 0px 8px rgba(0, 0, 0, 0.12)', // shadow64
          customShadows: {
            primary: '0px 4px 8px rgba(15, 108, 189, 0.24), 0px 0px 2px rgba(15, 108, 189, 0.12)',
            secondary: '0px 4px 8px rgba(240, 240, 240, 0.24), 0px 0px 2px rgba(0, 0, 0, 0.12)',
            success: '0px 4px 8px rgba(14, 122, 13, 0.24), 0px 0px 2px rgba(14, 122, 13, 0.12)',
            warning: '0px 4px 8px rgba(188, 75, 9, 0.24), 0px 0px 2px rgba(188, 75, 9, 0.12)',
            error: '0px 4px 8px rgba(177, 14, 28, 0.24), 0px 0px 2px rgba(177, 14, 28, 0.12)',
            info: '0px 4px 8px rgba(15, 108, 189, 0.24), 0px 0px 2px rgba(15, 108, 189, 0.12)',
          },
        },
        transitions: {
          duration: {
            shortest: '50ms', // durationUltraFast
            shorter: '100ms', // durationFaster
            short: '150ms', // durationFast
            standard: '200ms', // durationNormal
            complex: '300ms', // durationGentle
            enteringScreen: '250ms', // durationSlow
            leavingScreen: '200ms', // durationNormal
          },
          easing: {
            easeInOut: 'cubic-bezier(0.33, 0, 0.67, 1)', // curveEasyEase
            easeOut: 'cubic-bezier(0, 0, 0, 1)', // curveDecelerateMax
            easeIn: 'cubic-bezier(1, 0, 1, 1)', // curveAccelerateMax
            sharp: 'cubic-bezier(0.8, 0, 0.2, 1)', // curveEasyEaseMax
          },
        },
      };
    }

    // Dark mode — Fluent dark theme
    return {
      ...baseTokens,
      colors: {
        ...baseTokens.colors,
        brand: {
          // Primary — Fluent Brand Blue (dark mode)
          primary: '#479ef5',
          primaryLight: '#77b7f7',
          primaryLighter: '#0e4775',
          primaryDark: '#2886de',
          primaryDarker: '#0f6cbd',

          // Secondary — Fluent dark neutral
          secondary: '#383838',
          secondaryLight: '#424242',
          secondaryLighter: '#525252',
          secondaryDark: '#303030',
          secondaryDarker: '#292929',

          // Success
          success: '#54b054',
          successLight: '#9fd89f',
          successLighter: '#094509',
          successDark: '#0e7a0d',
          successDarker: '#107c10',

          // Warning
          warning: '#d67e3c',
          warningLight: '#e9a870',
          warningLighter: '#5c2405',
          warningDark: '#bc4b09',
          warningDarker: '#c25517',

          // Error
          error: '#dc626d',
          errorLight: '#eeacb2',
          errorLighter: '#5c060d',
          errorDark: '#b10e1c',
          errorDarker: '#c50f1f',

          // Info
          info: '#479ef5',
          infoLight: '#77b7f7',
          infoLighter: '#092c47',
          infoDark: '#2886de',
          infoDarker: '#0f6cbd',
        },
        text: {
          primary: '#ffffff', // colorNeutralForeground1 (dark)
          secondary: '#d6d6d6', // colorNeutralForeground2 (dark)
          disabled: '#5c5c5c', // colorNeutralForegroundDisabled (dark)
          inverse: '#242424', // colorNeutralForegroundInvertedLink
        },
        background: {
          default: '#292929', // colorNeutralBackground1 (dark)
          paper: '#292929',
          elevated: '#333333', // colorNeutralBackground2 (dark)
          overlay: 'rgba(0, 0, 0, 0.5)',
          neutral: '#383838', // colorNeutralBackground3 (dark)
        },
        border: {
          default: '#525252', // colorNeutralStroke1 (dark)
          subtle: '#383838', // colorNeutralStroke2 (dark)
          strong: '#8a8a8a', // colorNeutralStrokeAccessible (dark)
        },
        grey: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e0e0e0',
          300: '#d1d1d1',
          400: '#bdbdbd',
          500: '#8a8a8a',
          600: '#616161',
          700: '#424242',
          800: '#303030',
          900: '#242424',
        },
      },
      typography: {
        ...baseTokens.typography,
        fontFamily:
          "'Segoe UI Variable', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
        fontFamilyMono: "'Cascadia Code', 'Cascadia Mono', 'Consolas', monospace",
        fontFamilyHeadings:
          "'Segoe UI Variable', 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif",
        fontSize: {
          h1: 'clamp(2rem, 4vw, 2.5rem)',
          h2: 'clamp(1.5rem, 3vw, 1.75rem)',
          h3: 'clamp(1.25rem, 2.5vw, 1.5rem)',
          h4: '1.25rem',
          h5: '1rem',
          h6: '0.875rem',
          xs: '0.625rem',
          sm: '0.75rem',
          base: '0.875rem',
          lg: '1rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.75rem',
          '4xl': '2.5rem',
          '5xl': '4rem',
        },
        lineHeight: {
          tight: '1.2',
          normal: '1.43',
          relaxed: '1.6',
          h1: '1.2',
          h2: '1.25',
          h3: '1.33',
          h4: '1.4',
          h5: '1.43',
          h6: '1.43',
          body1: '1.43',
          body2: '1.33',
          button: '1.43',
        },
      },
      spacing: {
        xs: '0.125rem',
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
        sm: '0.125rem',
        md: '0.25rem',
        lg: '0.375rem',
        xl: '0.5rem',
        '2xl': '0.75rem',
        full: '9999px',
      },
      // Fluent dark shadows use brand shadow tokens
      shadows: {
        z0: 'none',
        z1: '0px 1px 2px rgba(0, 0, 0, 0.28), 0px 0px 2px rgba(0, 0, 0, 0.24)', // shadow2 dark
        z4: '0px 2px 4px rgba(0, 0, 0, 0.28), 0px 0px 2px rgba(0, 0, 0, 0.24)', // shadow4 dark
        z8: '0px 4px 8px rgba(0, 0, 0, 0.28), 0px 0px 2px rgba(0, 0, 0, 0.24)', // shadow8 dark
        z12: '0px 8px 16px rgba(0, 0, 0, 0.28), 0px 0px 2px rgba(0, 0, 0, 0.24)', // shadow16 dark
        z16: '0px 14px 28px rgba(0, 0, 0, 0.48), 0px 0px 8px rgba(0, 0, 0, 0.24)', // shadow28 dark
        z20: '0px 32px 64px rgba(0, 0, 0, 0.48), 0px 0px 8px rgba(0, 0, 0, 0.24)', // shadow64 dark
        z24: '0px 32px 64px rgba(0, 0, 0, 0.48), 0px 0px 8px rgba(0, 0, 0, 0.24)', // shadow64 dark
        customShadows: {
          primary: '0px 4px 8px rgba(71, 158, 245, 0.24), 0px 0px 2px rgba(71, 158, 245, 0.12)',
          secondary: '0px 4px 8px rgba(56, 56, 56, 0.24), 0px 0px 2px rgba(0, 0, 0, 0.24)',
          success: '0px 4px 8px rgba(84, 176, 84, 0.24), 0px 0px 2px rgba(84, 176, 84, 0.12)',
          warning: '0px 4px 8px rgba(214, 126, 60, 0.24), 0px 0px 2px rgba(214, 126, 60, 0.12)',
          error: '0px 4px 8px rgba(220, 98, 109, 0.24), 0px 0px 2px rgba(220, 98, 109, 0.12)',
          info: '0px 4px 8px rgba(71, 158, 245, 0.24), 0px 0px 2px rgba(71, 158, 245, 0.12)',
        },
      },
      transitions: {
        duration: {
          shortest: '50ms',
          shorter: '100ms',
          short: '150ms',
          standard: '200ms',
          complex: '300ms',
          enteringScreen: '250ms',
          leavingScreen: '200ms',
        },
        easing: {
          easeInOut: 'cubic-bezier(0.33, 0, 0.67, 1)',
          easeOut: 'cubic-bezier(0, 0, 0, 1)',
          easeIn: 'cubic-bezier(1, 0, 1, 1)',
          sharp: 'cubic-bezier(0.8, 0, 0.2, 1)',
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
export const fluentAdapter = new FluentAdapter();

// Export Fluent component adapters (6 core components)
export {
  FluentButton,
  FluentInput,
  FluentSelect,
  FluentDialog,
  FluentTable,
  FluentTableHeader,
  FluentTableBody,
  FluentTableRow,
  FluentTableHead,
  FluentTableCell,
  FluentCard,
  FluentCardHeader,
  FluentCardBody,
  FluentCardFooter,
} from './components';

export type {
  FluentButtonProps,
  FluentInputProps,
  FluentSelectProps,
  FluentSelectOption,
  FluentDialogProps,
  FluentCardProps,
} from './components';
