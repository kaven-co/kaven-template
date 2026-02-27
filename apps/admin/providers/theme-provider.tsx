'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ThemeConfig } from '@/lib/theme/theme-config';
import { createTheme, mergeTheme } from '@/lib/theme/theme-config';

// ============================================
// THEME CONTEXT
// ============================================

interface ThemeContextValue {
  theme: ThemeConfig;
  mode: 'light' | 'dark';
  toggleMode: () => void;
  setMode: (mode: 'light' | 'dark') => void;
  updateTheme: (customTheme: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================
// THEME PROVIDER
// ============================================

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: 'light' | 'dark';
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultMode = 'dark',
  storageKey = 'kaven-theme-mode',
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<'light' | 'dark'>(defaultMode);
  const [theme, setTheme] = useState<ThemeConfig>(() => createTheme(defaultMode));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme from localStorage and system preference
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        // Check localStorage first
        const storedMode = localStorage.getItem(storageKey) as 'light' | 'dark' | null;

        const resolvedMode = storedMode ?? defaultMode;
        setModeState(resolvedMode);
        setTheme(createTheme(resolvedMode));

        // Load custom theme from database (falls back to localStorage)
        const customTheme = await loadThemeFromDatabase();
        if (customTheme) {
          setTheme(mergeTheme(createTheme(resolvedMode), customTheme));
        }
      } catch (error) {
        console.error('Error initializing theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, [storageKey, defaultMode]);

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      const hasManualPreference = localStorage.getItem(storageKey);
      if (!hasManualPreference) {
        const newMode = e.matches ? 'dark' : 'light';
        setModeState(newMode);
        setTheme(createTheme(newMode));
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [storageKey]);

  // Apply theme to document
  useEffect(() => {
    if (isLoading) return;

    // Set data-theme attribute for CSS
    document.documentElement.setAttribute('data-theme', mode);

    // Set class for Tailwind dark mode
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Inject CSS variables
    injectCSSVariables(theme);
  }, [theme, mode, isLoading]);

  // Toggle between light and dark mode
  const toggleMode = useCallback(() => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setModeState(newMode);
    setTheme(createTheme(newMode));
    localStorage.setItem(storageKey, newMode);
  }, [mode, storageKey]);

  // Set specific mode
  const setMode = useCallback(
    (newMode: 'light' | 'dark') => {
      setModeState(newMode);
      setTheme(createTheme(newMode));
      localStorage.setItem(storageKey, newMode);
    },
    [storageKey]
  );

  // Update theme with custom values and persist to database
  const updateTheme = useCallback((customTheme: Partial<ThemeConfig>) => {
    setTheme((prevTheme) => mergeTheme(prevTheme, customTheme));

    // Persist to database (fire-and-forget with error handling inside)
    saveThemeToDatabase(customTheme);
  }, []);

  // Reset theme to defaults and clear from database
  const resetTheme = useCallback(() => {
    setTheme(createTheme(mode));

    // Clear persisted custom theme (fire-and-forget with error handling inside)
    clearThemeFromDatabase();
  }, [mode]);

  const value: ThemeContextValue = {
    theme,
    mode,
    toggleMode,
    setMode,
    updateTheme,
    resetTheme,
    isLoading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ============================================
// THEME HOOK
// ============================================

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

// ============================================
// CSS VARIABLE INJECTION
// ============================================

function injectCSSVariables(theme: ThemeConfig): void {
  const root = document.documentElement;

  // Inject color palette
  Object.entries(theme.palette.primary).forEach(([key, value]) => {
    root.style.setProperty(`--primary-${key}`, value);
  });

  Object.entries(theme.palette.secondary).forEach(([key, value]) => {
    root.style.setProperty(`--secondary-${key}`, value);
  });

  Object.entries(theme.palette.success).forEach(([key, value]) => {
    root.style.setProperty(`--success-${key}`, value);
  });

  Object.entries(theme.palette.warning).forEach(([key, value]) => {
    root.style.setProperty(`--warning-${key}`, value);
  });

  Object.entries(theme.palette.error).forEach(([key, value]) => {
    root.style.setProperty(`--error-${key}`, value);
  });

  Object.entries(theme.palette.info).forEach(([key, value]) => {
    root.style.setProperty(`--info-${key}`, value);
  });

  Object.entries(theme.palette.gray).forEach(([key, value]) => {
    root.style.setProperty(`--gray-${key}`, value);
  });

  Object.entries(theme.palette.text).forEach(([key, value]) => {
    root.style.setProperty(`--text-${key}`, value);
  });

  Object.entries(theme.palette.background).forEach(([key, value]) => {
    root.style.setProperty(`--background-${key}`, value);
  });

  Object.entries(theme.palette.action).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--action-${cssKey}`, value);
  });

  root.style.setProperty('--divider', theme.palette.divider);

  // Inject spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--spacing-${key}`, value);
  });

  // Inject border radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--radius-${key}`, value);
  });

  // Inject shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--shadow-${key}`, value);
  });

  // Inject z-index
  Object.entries(theme.zIndex).forEach(([key, value]) => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    root.style.setProperty(`--z-${cssKey}`, String(value));
  });

  // Inject typography
  root.style.setProperty('--font-family', theme.typography.fontFamily);
  root.style.setProperty('--font-family-monospace', theme.typography.fontFamilyMonospace);
}

// ============================================
// THEME PERSISTENCE HELPERS
// ============================================

export async function saveThemeToDatabase(theme: Partial<ThemeConfig>): Promise<void> {
  try {
    const response = await fetch('/api/settings/theme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(theme),
    });

    if (!response.ok) {
      throw new Error('Failed to save theme');
    }
  } catch (error) {
    console.error('Error saving theme to database:', error);
    // Fallback to localStorage
    localStorage.setItem('kaven-custom-theme', JSON.stringify(theme));
  }
}

export async function loadThemeFromDatabase(): Promise<Partial<ThemeConfig> | null> {
  try {
    const response = await fetch('/api/settings/theme');

    if (!response.ok) {
      throw new Error('Failed to load theme');
    }

    return await response.json();
  } catch (error) {
    console.error('Error loading theme from database:', error);
    // Fallback to localStorage
    const stored = localStorage.getItem('kaven-custom-theme');
    return stored ? JSON.parse(stored) : null;
  }
}

export async function clearThemeFromDatabase(): Promise<void> {
  try {
    const response = await fetch('/api/settings/theme', {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to clear theme');
    }
  } catch (error) {
    console.error('Error clearing theme from database:', error);
  } finally {
    // Also clear from localStorage
    localStorage.removeItem('kaven-custom-theme');
  }
}
