# Kaven Design System Refactor — Frost Brief

> **Status:** ⏳ PENDING IMPLEMENTATION
> **Decisão:** Design Council (Brad Frost) · 2026-02-17
> **Executor:** Pixel (kaven-frontend-dev) — próxima sessão
> **Modelo recomendado:** Haiku (implementação direta, spec completa aqui)
> **Scope:** Full `@kaven/ui` — admin panel + tenant app + LP (kaven-site)
> **Motivo:** Alinhamento com identidade visual da marca (LP e produto sem quebra visual)

---

## Diagnóstico — Estado Atual vs Target

| Aspecto | Atual | Target (Frost) |
|---|---|---|
| Cor primária | Emerald #10B981 | **Amber #F59E0B** |
| Cor secundária | Orange #F97316 + Cyan #00D9FF | **Blue #3B82F6** |
| Display font | Space Grotesk | **Geist Sans** |
| Body font | Inter | **DM Sans** |
| Mono font | Source Code Pro | **Geist Mono** |
| Border radius | 10px base (6-26px) | **4-6px max** |
| Glassmorphism | 70%+ cobertura — `backdrop-blur-2xl`, `.glass-panel` | **Removido → backup marketplace** |
| Dark bg | #161c24 / #212b36 | **#0F172A / #1E293B** |
| Token system | ✅ CSS custom properties 3 camadas | **Mantido — só valores mudam** |
| Dark mode | ✅ `.dark` + `[data-theme='dark']` | **Mantido** |

---

## Glassmorphism — Estratégia de Backup

**Não deletar.** Mover para `/themes/glassmorphism/` como marketplace theme futuro.

```
packages/ui/src/themes/
  glassmorphism/
    README.md              ← "Kaven Glass — Marketplace Theme"
    glass-tokens.css       ← todas as CSS vars glass atuais
    glass-panel.css        ← utilitário .glass-panel
    spotlight-card.tsx     ← componente preservado intacto
    components/
      sidebar-glass.tsx
      header-glass.tsx
      modal-glass.tsx
```

**`glass-tokens.css`:**
```css
/* Aplicar via: data-theme="glass" */
[data-theme='glass'] {
  --glass-gradient-start:  rgba(30, 41, 59, 0.7);
  --glass-gradient-end:    rgba(30, 41, 59, 0.4);
  --color-glass-border:    rgba(255, 255, 255, 0.08);
  --color-glass-highlight: rgba(255, 255, 255, 0.15);
  --glass-shadow:          0 4px 24px -1px rgba(0, 0, 0, 0.3);
  --spotlight-color:       rgba(255, 255, 255, 0.08);
}

[data-theme='glass'] .glass-panel {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  background: linear-gradient(
    180deg,
    var(--glass-gradient-start) 0%,
    var(--glass-gradient-end) 100%
  );
  border: 1px solid var(--color-glass-border);
  box-shadow:
    var(--glass-shadow),
    inset 0 1px 0 0 var(--color-glass-highlight);
}
```

---

## STEP 1 — Token Layer

**Arquivo:** `apps/admin/styles/theme.css`

Substituir `:root` e `.dark` / `[data-theme='dark']` completamente:

```css
:root {
  /* === SURFACE TOKENS === */
  --surface-base:      #F8FAFC;
  --surface-elevated:  #FFFFFF;
  --surface-border:    #E2E8F0;

  /* === TEXT TOKENS === */
  --text-primary:      #0F172A;
  --text-secondary:    #475569;
  --text-muted:        #94A3B8;

  /* === ACCENT TOKENS === */
  --accent-primary:         #F59E0B;
  --accent-primary-hover:   #D97706;
  --accent-primary-subtle:  #FEF3C7;
  --accent-secondary:       #3B82F6;
  --accent-secondary-hover: #2563EB;

  /* === FEEDBACK === */
  --success: #10B981;
  --warning: #F59E0B;
  --error:   #EF4444;
  --info:    #3B82F6;

  /* === CODE/TERMINAL === */
  --code-green: #10B981;
  --code-text:  #334155;
  --code-bg:    #F1F5F9;

  /* === SEMANTIC ALIASES (backward compat) === */
  --background:         var(--surface-base);
  --foreground:         var(--text-primary);
  --card:               var(--surface-elevated);
  --card-foreground:    var(--text-primary);
  --border:             var(--surface-border);
  --input:              var(--surface-border);
  --ring:               var(--accent-primary);
  --muted:              var(--surface-border);
  --muted-foreground:   var(--text-secondary);
  --accent:             var(--accent-primary-subtle);
  --accent-foreground:  var(--text-primary);
  --primary:            var(--accent-primary);
  --primary-foreground: #FFFFFF;
  --secondary:          var(--surface-elevated);
  --secondary-foreground: var(--text-primary);
  --destructive:        var(--error);

  /* === RADIUS === */
  --radius:     0.375rem;  /* 6px base */
  --radius-xs:  2px;
  --radius-sm:  4px;
  --radius-md:  6px;
  --radius-lg:  8px;
  --radius-xl:  10px;
  --radius-full: 9999px;

  /* === SIDEBAR === */
  --sidebar:            var(--surface-elevated);
  --sidebar-border:     var(--surface-border);
  --sidebar-foreground: var(--text-primary);
  --sidebar-primary:    var(--accent-primary);
  --sidebar-accent:     var(--accent-primary-subtle);
}

.dark,
[data-theme='dark'] {
  /* === SURFACE TOKENS === */
  --surface-base:     #0F172A;
  --surface-elevated: #1E293B;
  --surface-border:   #334155;

  /* === TEXT TOKENS === */
  --text-primary:   #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted:     #475569;

  /* === ACCENT (mesmo amber — brand consistente) === */
  --accent-primary:        #F59E0B;
  --accent-primary-hover:  #FBBF24;
  --accent-primary-subtle: rgba(245, 158, 11, 0.12);
  --accent-secondary:      #60A5FA;

  /* === CODE/TERMINAL === */
  --code-green: #10B981;
  --code-text:  #E2E8F0;
  --code-bg:    #0F172A;

  /* === SEMANTIC ALIASES === */
  --background:         var(--surface-base);
  --foreground:         var(--text-primary);
  --card:               var(--surface-elevated);
  --card-foreground:    var(--text-primary);
  --border:             var(--surface-border);
  --input:              var(--surface-border);
  --ring:               var(--accent-primary);
  --muted:              var(--surface-elevated);
  --muted-foreground:   var(--text-secondary);
  --primary:            var(--accent-primary);
  --primary-foreground: #0F172A;
  --sidebar:            var(--surface-base);
  --sidebar-border:     var(--surface-border);
}
```

**Arquivo:** `packages/ui/src/tokens/brand-tokens.ts`

```typescript
export const brandTokens = {
  color: {
    brand: {
      primary:        '#F59E0B',   // amber-500
      primaryHover:   '#D97706',   // amber-600
      primaryDark:    '#FBBF24',   // amber-400 (dark mode hover)
      primarySubtle:  '#FEF3C7',   // amber-50
      secondary:      '#3B82F6',   // blue-500
      secondaryHover: '#2563EB',   // blue-600
    },
    surface: {
      base:     '#0F172A',
      elevated: '#1E293B',
      border:   '#334155',
    },
    text: {
      primary:   '#F8FAFC',
      secondary: '#94A3B8',
      muted:     '#475569',
    },
    code: {
      green: '#10B981',
      text:  '#E2E8F0',
      bg:    '#0F172A',
    },
    feedback: {
      success: '#10B981',
      warning: '#F59E0B',
      error:   '#EF4444',
      info:    '#3B82F6',
    },
  },
  typography: {
    fontDisplay: '"Geist Sans", "Geist", sans-serif',
    fontBody:    '"DM Sans", sans-serif',
    fontMono:    '"Geist Mono", monospace',
  },
  radius: {
    xs:   '2px',
    sm:   '4px',
    md:   '6px',
    lg:   '8px',
    xl:   '10px',
    full: '9999px',
  },
} as const;
```

---

## STEP 2 — Font Layer

**Arquivo:** `apps/admin/app/[locale]/layout.tsx` (repetir em `apps/tenant/`)

```typescript
// REMOVER:
// import { Space_Grotesk, Inter, Source_Code_Pro } from 'next/font/google';

// ADICIONAR:
import { Geist, Geist_Mono, DM_Sans } from 'next/font/google';

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// No <body> className:
// `${geist.variable} ${geistMono.variable} ${dmSans.variable}`
```

**Arquivo:** `apps/admin/styles/theme.css` — atualizar font-family:

```css
body {
  font-family: var(--font-dm-sans), 'DM Sans', -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-geist), 'Geist', sans-serif;
  letter-spacing: -0.02em;
}

code, pre, kbd, samp {
  font-family: var(--font-geist-mono), 'Geist Mono', monospace;
}
```

---

## STEP 3 — Glassmorphism Backup

Antes de qualquer remoção, mover para `/themes/glassmorphism/`:

1. Copiar `apps/admin/app/globals.css` vars glass para `glass-tokens.css`
2. Copiar `.glass-panel` utility para `glass-panel.css`
3. Mover `packages/ui/src/compat/spotlight-card.tsx` para `themes/glassmorphism/components/`
4. Criar versões glass dos componentes afetados antes de patchar os originais

---

## STEP 4 — Glassmorphism Removal (componentes afetados)

| Componente | Localização | Mudança |
|---|---|---|
| Sidebar | `apps/admin` + `apps/tenant` | `backdrop-blur-2xl` → remover |
| Header/AppBar | layout.tsx | `backdrop-blur-xl bg-background/80` → `bg-[var(--surface-base)]` |
| Modal overlays | `packages/ui/src/compat/dialog.tsx` | `bg-black/20 backdrop-blur-sm` → `bg-black/60` |
| User menu popover | componente de user | `backdrop-blur-xl` → remover |
| Impersonation banner | admin layout | `backdrop-blur-md` → remover |
| SpotlightCard | `packages/ui/src/compat/` | mover para `/themes/glassmorphism/` |

**Padrão de substituição:**

```typescript
// Header/AppBar — ANTES:
className="backdrop-blur-xl bg-background/80 border-b border-border"
// DEPOIS:
className="bg-[var(--surface-base)] border-b border-[var(--surface-border)]"

// Modal overlay — ANTES:
className="fixed inset-0 bg-black/20 backdrop-blur-sm"
// DEPOIS:
className="fixed inset-0 bg-black/60"

// Sidebar — ANTES:
className="fixed top-0 left-0 backdrop-blur-2xl border-r border-sidebar-border"
// DEPOIS:
className="fixed top-0 left-0 bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]"
```

---

## STEP 5 — Border Radius Fix

**`packages/ui/src/compat/button.tsx`:**
```typescript
// ANTES: "... rounded-[8px] ..."
// DEPOIS: "... rounded-[6px] ..."
```

**`apps/admin/styles/theme.css` — override Tailwind:**
```css
.rounded-xl  { border-radius: var(--radius-lg) !important; }   /* 8px */
.rounded-2xl { border-radius: var(--radius-xl) !important; }   /* 10px */
[data-radix-popper-content-wrapper] > * {
  border-radius: var(--radius-lg) !important;
}
```

---

## STEP 6 — Sidebar Amber Active State

```typescript
// Sidebar nav item:
className={cn(
  "flex items-center gap-2 px-3 py-2 rounded-[6px] text-sm transition-colors",
  isActive
    ? "bg-[var(--accent-primary-subtle)] text-[var(--accent-primary)] font-semibold border-l-2 border-[var(--accent-primary)]"
    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-border)]"
)}
```

---

## Sequência de Implementação (ordem obrigatória)

```
1. [ ] Criar /themes/glassmorphism/ e mover todos os arquivos glass
2. [ ] Substituir brand-tokens.ts
3. [ ] Substituir theme.css :root e .dark (admin)
4. [ ] Copiar mudanças para apps/tenant/styles/theme.css
5. [ ] Substituir fontes em apps/admin/app/[locale]/layout.tsx
6. [ ] Substituir fontes em apps/tenant/app/[locale]/layout.tsx
7. [ ] Atualizar font-family CSS em theme.css (admin + tenant)
8. [ ] Remover backdrop-blur dos 6 componentes (lista acima)
9. [ ] Corrigir border-radius via CSS override
10. [ ] Ajustar sidebar active state para amber
11. [ ] Visual QA: admin dark + admin light + tenant dark + tenant light
12. [ ] Commit: "refactor(ui): apply Frost design system — amber/Geist/no-glass"
```

---

## O que NÃO muda

- Estrutura CVA dos componentes (variantes, sizes)
- TanStack Query / Zustand / next-intl
- Radix UI primitives (acessibilidade preservada)
- Atomic hierarchy (atoms/molecules/organisms/templates)
- Token architecture em 3 camadas — só os **valores** mudam
- Componentes que não usam glassmorphism ou as cores antigas

---

*Brief gerado por Brad Frost (Design Council) · mediado por Pixel + Steave · 2026-02-17*
*Implementar na próxima sessão com modelo Haiku*
