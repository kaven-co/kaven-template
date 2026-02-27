# Kaven Glass — Glassmorphism Legacy Theme

> **Status**: Archived · Moved from main design system (Feb 17, 2026)
> **Purpose**: Future marketplace theme
> **Original**: 70%+ coverage in v0.x design system

## Overview

This directory contains the legacy glassmorphism theme components and utilities. Glassmorphism (backdrop-blur, glass-panel styling) has been removed from the main Kaven design system in favor of a cleaner, modern aesthetic (see `docs/design-system-refactor.md`).

However, these components are preserved as a **future marketplace theme** that customers can install and apply via module system.

## Contents

- **glass-tokens.css** — CSS custom properties for glass effect (blur, gradients, borders, shadows)
- **glass-panel.css** — `.glass-panel` utility class with full glassmorphism styling
- **components/spotlight-card.tsx** — Interactive spotlight card component (glass aesthetic)

## How to Use

### Option 1: Enable globally (data attribute)

```html
<html data-theme="glass">
  <!-- All .glass-panel elements activate glassmorphism -->
</html>
```

### Option 2: Import and apply selectively

```tsx
// In a marketplace module
import '@kaven/ui/themes/glassmorphism/glass-tokens.css';
import '@kaven/ui/themes/glassmorphism/glass-panel.css';

export function MyGlassComponent() {
  return <div className="glass-panel">Glassmorphism enabled</div>;
}
```

### Option 3: Use SpotlightCard directly

```tsx
import { SpotlightCard } from '@kaven/ui/themes/glassmorphism/components/spotlight-card';

export function FeaturedSection() {
  return (
    <SpotlightCard spotlightColor="rgba(255, 255, 255, 0.1)">
      <h2>Interactive Glass Card</h2>
      <p>Hover to see the spotlight effect</p>
    </SpotlightCard>
  );
}
```

## Migration Path

If upgrading from Kaven v0.x with glassmorphism:

1. Install the glassmorphism marketplace module (future)
2. Apply `data-theme="glass"` to root element
3. No component code changes needed — `.glass-panel` continues to work

## Technical Notes

- **CSS Variables**: All glass styling uses custom properties scoped to `[data-theme='glass']`
- **Backdrop Filter**: Uses `-webkit-backdrop-filter` for Safari compatibility
- **Performance**: Glassmorphism has higher GPU usage than flat design (consider device battery on mobile)
- **Accessibility**: Ensure text contrast remains sufficient (WCAG AA minimum)

## Future

This theme will be packaged as a module in the Kaven marketplace:
- Module: `@kaven-themes/glass`
- Tier: Pro (premium design system)
- Size: ~8KB (minified)

---

*Archived Feb 17, 2026 during design system refactor. Main theme now uses amber accent (#F59E0B), Geist fonts, and modern flat design.*
