# @kaven/ui

**Kaven Design System — Frost Theme**

React + Tailwind component library. Amber accent, Geist fonts, dark-first.

## Install

```bash
npm install @kaven/ui
# or
pnpm add @kaven/ui
```

## Quick Start

```tsx
// 1. Import tokens (CSS custom properties — light + dark mode)
import '@kaven/ui/tokens.css';

// 2. Import components
import { Button, Input, Badge, Card } from '@kaven/ui';

// 3. (Optional) Use the Tailwind preset in tailwind.config.ts
import kavenPreset from '@kaven/ui/tailwind-preset';
export default {
  presets: [kavenPreset],
  content: ['./src/**/*.{ts,tsx}'],
};
```

## Entrypoints

| Import | Contents | Bundle |
|--------|----------|--------|
| `@kaven/ui` | Full library — atoms + molecules + organisms + templates + 70 compat | ~242 KB |
| `@kaven/ui/lite` | Minimal — atoms + molecules + tokens only | ~35 KB |
| `@kaven/ui/tailwind-preset` | Tailwind v3 preset with Frost colors/fonts/radius | ~3 KB |
| `@kaven/ui/tokens.css` | CSS custom properties (light + dark mode) | ~2 KB |

## Lite Usage (for landing pages, simple apps)

```tsx
import '@kaven/ui/tokens.css';
import { Button, Input, Badge, Typography } from '@kaven/ui/lite';

export function Hero() {
  return (
    <section>
      <Typography variant="display-xl">Build faster.</Typography>
      <Button variant="contained" color="primary">Get started</Button>
    </section>
  );
}
```

## Dark Mode

```css
/* Enable dark mode globally */
html.dark { ... }

/* Or per-element */
<div data-theme="dark">...</div>
```

```tsx
// Toggle via class
document.documentElement.classList.toggle('dark');
```

## Glassmorphism Theme (legacy)

The glassmorphism theme is preserved as an optional module:

```tsx
import '@kaven/ui/themes/glassmorphism/glass-tokens.css';
import '@kaven/ui/themes/glassmorphism/glass-panel.css';

// Enable via data attribute:
// <html data-theme="glass">
```

The `SpotlightCard` component is available directly from the themes path:
```
packages/ui/src/themes/glassmorphism/components/spotlight-card.tsx
```

## Architecture

```
@kaven/ui
  ├── atoms/         10 components (Button, Input, Badge, Card, Avatar, Label, Icon, Spinner, Typography, FeatureLimitCard)
  ├── molecules/     7 components  (SearchInput, FormField, IconButtonWithTooltip, PaginationControl, ...)
  ├── organisms/     6 components  (AppHeader, SidebarNav, DataTable, SettingsPanel, PricingGrid, MobileDrawer)
  ├── templates/     4 layouts     (DashboardTemplate, AuthTemplate, SettingsTemplate, MarketingTemplate)
  └── compat/        70 components (Material/Fluent-inspired API — migration bridge)
```

**Bridge Pattern**: atoms re-export from compat for migration safety. Molecules compose atoms. Compat layer will be deprecated once full migration is complete.

## Brand — Frost Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#F59E0B` (amber-500) | Buttons, links, active states |
| Secondary | `#3B82F6` (blue-500) | Secondary actions, info |
| Surface Base | `#0F172A` (slate-900) | Dark mode background |
| Surface Elevated | `#1E293B` (slate-800) | Cards, panels |
| Font Display | Geist Sans | Headings |
| Font Body | DM Sans | Body text |
| Font Mono | Geist Mono | Code |
| Border Radius | 4–10px | Components (no sharp, no pill) |

---

*Design Council decision — Brad Frost (Feb 17, 2026)*
*Standalone packaging — Steave/Kaven Squad (Feb 2026)*
