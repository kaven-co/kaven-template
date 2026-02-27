# KAVEN FRAMEWORK - FRONTEND SPECIFICATION

**Date:** 2026-02-03
**Phase:** Brownfield Discovery - Phase 3
**Analyst:** UX Design Expert - Next.js + React Specialist

---

## 📊 EXECUTIVE SUMMARY

O frontend do Kaven Framework é construído em **Next.js 14 App Router** com **React 19** e apresenta:
- ✅ **Design system maduro** com 76+ componentes base (Radix UI + shadcn/ui)
- ✅ **Glassmorphism moderno** com backdrop blur e gradientes adaptativos
- ✅ **Multi-language completo** (EN + PT-BR via next-intl)
- ✅ **Dark mode** com CSS variables e persistence
- ⚠️ **Tenant App funcional mas incompleto** (Invoice/Order pages faltando)
- ⚠️ **Theme customization parcial** (API existe mas não integrado ao DB)

**Classification:** 8.1/10 (Excellent structure with specific gaps)

---

## 🏗️ APPS OVERVIEW

### Admin Panel (apps/admin/)

**Statistics:**
- Total Files: 280 TSX files
- Total Pages: 56
- Total Components: 148
- Stack: Next.js 16.1.5, React 19.2.3, TailwindCSS 4, Radix UI

**Page Categories:**
- Authentication: 9 pages (login, signup, 2FA, password reset, etc)
- Dashboard & Core: 5 pages (dashboard, analytics, banking demo, booking demo)
- User Management: 7 pages (list, create, edit, cards view)
- Tenant Management: 4 pages
- Products: 3 pages (CRUD)
- Plans: 3 pages (CRUD)
- Settings: 8 pages (profile, notifications, security, SaaS config)
- Operational: 9 pages (access requests, approvals, audit logs, invites, roles, currencies)
- Informational: 4 pages (docs, FAQ, help, contact)
- Others: 5 pages (features, pricing, policies, observability)

**Component Structure:**
- `components/ui/`: 76 base components
- `components/layout/`: 7 layout components
- `components/auth/`: 3 authentication components
- `components/users/`: 8 user-specific components
- `components/products/`, `components/plans/`: Product/plan management
- `components/settings/`: 10 settings components

---

### Tenant App (apps/tenant/)

**Statistics:**
- Total Files: 208 TSX files
- Total Pages: 36
- Total Components: 131
- Stack: Identical to Admin

**Page Categories:**
- Authentication: 8 pages
- Dashboard & Core: 4 pages (dashboard with REAL data hooks)
- Projects & Tasks: 2 pages (full CRUD implementation)
- Products & Plans: 6 pages (browse/buy pattern)
- Team Management: 1 page (TeamMembersTable)
- Settings: 3 pages (profile, notifications)
- Informational: 4 pages
- Features Demo: 2 pages (CRM-like feature management)
- Others: 2 pages (coming-soon, setup)

**Key Differences from Admin:**
- ❌ No User/Tenant management (admin-only)
- ❌ No Audit Logs, Access Control (admin-only)
- ✅ Has Projects/Tasks full CRUD (tenant-exclusive)
- ✅ Has Team management (tenant-exclusive)
- ✅ Has Features CRM demo (tenant-exclusive)
- ✅ Dashboard uses REAL data (hooks: useUsers, useDashboardSummary, useDashboardCharts)

**Component Structure:**
- `components/ui/`: 76 base (identical to Admin)
- `components/layout/`: 5 tenant-specific (SpaceSelector, TenantHeader, TenantSidebar)
- `components/team/`: Team management
- `components/demo/tasks/`: TasksTable
- `components/providers/`: TenantContextProvider

---

### Docs App (apps/docs/)

**Statistics:**
- Framework: Nextra (Next.js + MDX)
- Total MDX/MD files: 178
- Output: Static site (`/out/`)

**Content Structure:**
- `/content/platform/` - Main technical documentation
- `/content/platform/architecture/` - ADRs, architecture docs
- `/content/platform/implementation-logs/` - Implementation logs
- Topics: Database schema, Spaces/Permissions, CLI, Email, CRUD patterns, Timezone, Plans & Products, Signup flow, Tenant App features, I18N

**Features:**
- Static generation (next export)
- Search support (Pagefind ready)
- TypeScript, MDX with React components

---

## 🎨 DESIGN SYSTEM

### UI Library & Components (76 total)

**Foundation: shadcn/ui + Radix UI**

**Categories:**
1. **Inputs & Forms (16):** Input, Textarea, TextField, Form, Label, Checkbox, Radio, RadioGroup, Select, RadixSelect, Autocomplete, DatePicker, TimePicker, Slider
2. **Buttons & Interactions (6):** Button, IconButton, FAB, ButtonGroup, ToggleButton, SpeedDial
3. **Containers & Layout (12):** Card, Paper, Dialog, Drawer, Modal, ConfirmationModal, Sheet, Backdrop, AppBar, BottomNavigation, NavigationBar
4. **Data Display (15):** Table, DataTable, Badge, Avatar, Chip, List, ImageList, Timeline, TransferList, TreeView, Masonry, Pagination
5. **Feedback & Status (8):** Alert, Snackbar, Toast (Sonner), Progress, Skeleton, LoadingSpinner
6. **Navigation (7):** Breadcrumbs, Menu, Dropdown, DropdownMenu, MegaMenu, Tabs, NavigationBar
7. **Indicators (4):** Tooltip, InfoTooltip, Rating, CurrencyIcon
8. **Advanced (8):** StatCard, SpotlightCard, Transitions, ClickAwayListener, Portal, CSSBaseline

**Implementation:**
- CVA (Class Variance Authority) for component variants
- `cn()` utility for class merging (tailwind-merge)
- Prop-based composition pattern
- Full TypeScript support

---

### Color Palette

**Light Mode:**
- Background: `oklch(1 0 0)` (white)
- Foreground: `oklch(0.145 0 0)` (near black)
- Primary: `oklch(0.205 0 0)` (dark gray - customizable)
- Secondary: `oklch(0.97 0 0)` (light gray)
- Destructive: `oklch(0.577 0.245 27.325)` (red)
- Border: `oklch(0.922 0 0)` (very light gray)

**Dark Mode (Minimals Theme):**
- Background: `#161c24` (deep blue-dark)
- Foreground: `#ffffff`
- Primary: `#00a76f` (Minimals green)
- Secondary: `#8e33ff` (purple)
- Success: `#22c55e`
- Warning: `#ffab00`
- Error: `#ff5630`
- Info: `#00b8d9`

---

### Glassmorphism (v2 Implementation)

**`.glass-panel` utility:**
```css
backdrop-blur-2xl
+ gradient (white transparent light / gray transparent dark)
+ border: 1px solid rgba(255,255,255,0.5/0.08)
+ inset highlight for depth
+ shadow: soft (light) / prominent (dark)
+ noise texture SVG overlay
```

**Usage:** Cards, modals, dashboard panels

---

### Typography

**Fonts:**
- **Display:** Plus Jakarta Sans (headings)
- **Body:** Inter (main text)
- **Mono:** Source Code Pro / Fira Code (code blocks)

**Scales:** h1-h6, subtitle1-2, body1-2, caption, overline, button

**Weights:** 400 (regular), 600 (semibold), 700 (bold)

**Line Heights:** 1.2-1.5

**Letter Spacing:** Variable (0.02em buttons, -0.02em h1)

---

### Spacing System

**Base:** 4px increments
**Scale:** 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96

---

### Border Radius

- xs: 4px
- sm: 8px
- md: 12px (default)
- lg: 16px
- xl: 20px
- 2xl: 24px
- full: 9999px

---

### Shadows (Z-depth System)

- xs: `0 1px 2px 0 rgba(0,0,0,0.05)`
- sm: `0 1px 3px 0 rgba(0,0,0,0.1)`
- md: `0 4px 6px -1px rgba(0,0,0,0.1)`
- lg: `0 10px 15px -3px rgba(0,0,0,0.1)`
- xl: `0 20px 25px -5px rgba(0,0,0,0.1)`
- 2xl: `0 25px 50px -12px rgba(0,0,0,0.25)`

---

## 🌓 DARK MODE

**Implementation:**
- Provider: Custom `ThemeProvider`
- Persistence: `localStorage` (`kaven-theme-mode`)
- System preference: `prefers-color-scheme: dark`
- CSS: `.dark` class on `<html>`
- Variables: `--background`, `--foreground`, etc (56+ CSS variables)

**Transitions:**
- `@apply transition-all`
- Duration: `duration-300`
- Easing: `ease-in-out`

---

## 🌍 I18N (INTERNACIONALIZAÇÃO)

**Implementation:**
- Library: `next-intl` (v4.6.1)
- Locales: EN (English), PT (Português Brasileiro)
- Files:
  - `/admin/messages/en.json`
  - `/admin/messages/pt.json`
  - `/tenant/messages/en.json`
  - `/tenant/messages/pt.json`

**Hooks:**
- `useTranslations()` (client components)
- `getTranslations()` (server components)

**Routing:** `[locale]` dynamic segment

**Formatting:**
- Dates: `date-fns` with locale support
- Numbers: `toLocaleString('pt-BR')`

**Status:** ✅ Complete translations for both locales

---

## 📱 RESPONSIVENESS

**Approach:** Mobile-first

**Breakpoints:**
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

**Patterns:**
- `hidden lg:flex` - Sidebar collapse on mobile
- `md:grid-cols-2 lg:grid-cols-3` - Responsive grids
- `text-sm md:text-base` - Typography scaling
- `px-4 md:px-6 lg:px-8` - Responsive padding
- Hamburger menu for mobile navigation
- Drawer for mobile sidebar
- Tables scroll horizontally on mobile
- Modals full-screen on mobile (`max-h-[90vh]`)
- Touch targets: 40px minimum (`h-10 w-10`)

---

## ♿ ACCESSIBILITY (a11y)

**Implemented:**
✅ Semantic HTML (`<nav>`, `<main>`, `<table>`)
✅ ARIA labels (`aria-label`, `aria-describedby`)
✅ ARIA roles (`role="progressbar"`, `role="dialog"`)
✅ Keyboard navigation (Radix UI native support)
✅ Focus management in Modals (trap focus)
✅ Screen reader support (semantic + ARIA)
✅ Focus states (`:focus-visible` with ring)

**Potential Issues:**
⚠️ Not all buttons have `aria-label` (rely on text content)
⚠️ Color contrast in glassmorphism backgrounds may be low
⚠️ Some custom components may miss complete ARIA

**Recommendation:** Full WCAG AA audit needed

---

## ⚡ PERFORMANCE

**Optimizations:**
✅ Server Components (default in App Router)
✅ 57 components with `'use client'` directive (optimized)
✅ `next/image` with lazy loading
✅ `next/font` optimization (Inter, Plus Jakarta Sans)
✅ Remote image patterns configured (flagcdn.com, dicebear.com)

**Missing:**
❌ No `dynamic()` imports for code splitting
❌ No Web Vitals instrumentation
❌ No error telemetry (Sentry not visible)

**Bundle Size:**
- Dependencies: 57
- Heavy libs: `recharts` (3.6.0) - consider alternatives
- Estimated bundle: >500KB (needs optimization)

---

## 🎛️ STATE MANAGEMENT & DATA FETCHING

### State Management

**Zustand (v5.0.2):**
- Lightweight, no boilerplate
- Example: `settings.store` for theme layout
- Persists in localStorage

**Context API:**
- `ThemeProvider`
- `TenantContextProvider`
- NextAuth context

### Data Fetching

**@tanstack/react-query (v5.62.8):**
- Primary data fetching solution
- Hooks: `useQuery`, `useMutation`, `useQueryClient`
- Cache management
- Stale-while-revalidate
- Examples: `useUsers()`, `useDashboardSummary()`, `useDashboardCharts()`

**Axios (v1.13.2):**
- HTTP client with interceptors
- API wrapper util

### Forms

**react-hook-form (v7.69.0):**
- Field registration
- Async validation
- Error handling

**Zod (v4.2.1):**
- Schema validation
- Type-safe
- Integrated with react-hook-form via `@hookform/resolvers`

---

## 🎨 THEME CUSTOMIZATION

**Status:** Partially Implemented

**✅ API Layer EXISTS:**
- `GET /api/design-system/customization`
- `POST /api/design-system/customization`
- `DELETE /api/design-system/customization`
- Protected by NextAuth
- Database model: `DesignSystemCustomization`

**✅ Frontend Provider:**
- `ThemeProvider` with context
- `useTheme()` hook
- Dark/light toggle
- CSS variable injection (56+ variables)

**❌ Database Integration - TODO:**
```typescript
// Line 61-65 in theme-provider.tsx:
// TODO: Implement API call to fetch user's custom theme
```

**❌ Per-Tenant Branding - NOT IMPLEMENTED:**
- Current: Per-user customization
- Expected: Tenant-wide branding
- Blocker: API is user-scoped, not tenant-scoped

---

## 📊 COMPONENT INVENTORY

### Shared (Both Admin/Tenant)
- Layout: Header, Sidebar, Footer, Auth Layout, Dashboard Layout
- Navigation: Breadcrumbs, NavBar, BottomNav
- Forms: 16 form components
- Data Display: 15 components (Table, Card, Badge, etc)
- Feedback: 8 components (Alert, Toast, Modal, etc)
- Buttons: 6 variants

### Admin-Only
- UserManagement: 8 components
- TenantManagement: 6 components
- Finance: 5 components (InvoiceTable, OrderTable, etc)
- Roles & Access: 4 components
- Admin sections: Audit Logs, Features, Currencies, Policies

### Tenant-Only
- Projects & Tasks: 8 components
- Team: 3 components (TeamMembersTable, etc)
- Features CRM: 5 components
- Tenant Specific: 4 components (SpaceSelector, TenantHeader, etc)

---

## 🎯 STRENGTHS

1. ✅ Mature design system (76+ base components)
2. ✅ Modern glassmorphism implementation
3. ✅ Complete multi-language support (EN + PT-BR)
4. ✅ Dark mode with persistence
5. ✅ Responsive mobile-first approach
6. ✅ Accessibility baseline (Radix UI + ARIA)
7. ✅ Performance: next/image, next/font optimized
8. ✅ Tenant App with Projects/Tasks real CRUD
9. ✅ Admin Panel with 56 functional pages
10. ✅ Theme customization API structure (partial)

---

## ⚠️ WEAKNESSES

1. ❌ Tenant App: Invoice/Order history pages missing
2. ❌ Theme API not integrated with database
3. ❌ Theme customization is per-user, not per-tenant
4. ❌ Admin dashboard with mock data (not real)
5. ⚠️ Mobile menu toggle not implemented (TODO)
6. ⚠️ Bundle size may exceed 500KB
7. ⚠️ Accessibility: Incomplete ARIA labels
8. ⚠️ Code duplication between admin/tenant components

---

**Frontend Specification Compiled:** 2026-02-03
**Next:** Tenant App Gap Analysis (detailed)
