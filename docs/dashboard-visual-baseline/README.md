# Dashboard Visual Baseline (v4.4 - Lendária DS)

**Captured:** 2026-02-17
**Dashboard:** AIOS Telemetry Dashboard
**Design System:** Lendária DS (Luxury Minimalism)
**Theme:** Dark-first (defaultTheme="dark")
**Source:** `/home/bychrisr/projects/work/kaven/kaven-framework/.aios-core/dashboard/`
**Version:** Synkra AIOS v2.0

---

## Screenshots (21 total — 7 pages x 3 breakpoints)

### 1. Project Overview

| Mobile (320px) | Tablet (768px) | Desktop (1920px) |
|---|---|---|
| `project-overview-mobile-320px.png` | `project-overview-tablet-768px.png` | `project-overview-desktop-1920px.png` |
| 34 kB | 63 kB | 79 kB |

**Visible elements:**
- Stat cards: Total Time Invested, Stories Completed, Success Rate, Estimate Accuracy
- Agent Distribution donut chart (tan/gold primary = @dev agent)
- Sessions Timeline line chart
- Estimate Accuracy progress bar

**Gold Elements Observed:**
- "AIOS" text in sidebar header: gold (#C9B298)
- Active "Overview" sidebar item: `bg-gold/10 border-l-4 border-gold text-gold` (subtle warm left border)
- Agent Distribution chart: @dev series uses tan color (close to Lendária Gold hsl(32,20%,70%))
- Estimate Accuracy progress text in warm accent color

**Notes:**
- Mobile: Sidebar hidden, cards stack vertically, content is full-width
- Tablet: Sidebar visible at ~250px, cards in 2-column grid
- Desktop: Full sidebar + 4-column stat card row

---

### 2. Epic Breakdown

| Mobile (320px) | Tablet (768px) | Desktop (1920px) |
|---|---|---|
| `epic-breakdown-mobile-320px.png` | `epic-breakdown-tablet-768px.png` | `epic-breakdown-desktop-1920px.png` |
| 23 kB | 60 kB | 59 kB |

**Visible elements:**
- Epics table (Epic, Stories, Points Planned, Actual Hours, Accuracy)
- Velocity chart (Points Per Week)
- Phase Distribution bar chart

**Gold Elements Observed:**
- Active "Epics" sidebar: `border-l-4 border-gold text-gold` applied
- Table header: dark styling (not gold header in this iteration)

**Notes:**
- Only "Epic 6 - Core Development" shown in Kaven instance
- Velocity chart shows empty data (0 points/week)

---

### 3. Story Timeline

| Mobile (320px) | Tablet (768px) | Desktop (1920px) |
|---|---|---|
| `story-timeline-mobile-320px.png` | `story-timeline-tablet-768px.png` | `story-timeline-desktop-1920px.png` |
| 21 kB | 54 kB | 34 kB |

**Visible elements:**
- "No stories found" empty state

**Gold Elements Observed:**
- Active "Stories" sidebar item with left border accent
- Page shows empty state (stories not linked to Kaven telemetry data)

**Notes:**
- This page shows empty state - stories data not available in this project instance
- Desktop screenshot is small (34kB) because mostly blank dark background

---

### 4. Agent Performance

| Mobile (320px) | Tablet (768px) | Desktop (1920px) |
|---|---|---|
| `agent-performance-mobile-320px.png` | `agent-performance-tablet-768px.png` | `agent-performance-desktop-1920px.png` |
| 27 kB | 62 kB | 78 kB |

**Visible elements:**
- Agent table (5 agents: @dev, @qa, @pm, @architect, @devops)
- Average Duration by Agent bar chart (purple bars)
- Per-agent detail cards (@dev, @qa, @pm, @architect)

**Gold Elements Observed:**
- Active "Agents" sidebar item
- Success Rate values shown in green (100% for all agents)

**Data visible:**
- @dev: 14 sessions, 222.0m avg, 100% success, 14 tasks
- @qa: 6 sessions, 185.0m avg, 100% success
- @pm: 4 sessions, 53.0m avg, 100% success
- @architect: 3 sessions, 161.0m avg, 100% success
- @devops: 4 sessions, 291.0m avg, 100% success

---

### 5. Estimates Analysis

| Mobile (320px) | Tablet (768px) | Desktop (1920px) |
|---|---|---|
| `estimates-analysis-mobile-320px.png` | `estimates-analysis-tablet-768px.png` | `estimates-analysis-desktop-1920px.png` |
| 20 kB | 46 kB | 61 kB |

**Visible elements:**
- Over-Estimated (0), On Target (0), Under-Estimated (0) stat cards
- Estimated vs Actual Hours chart ("No estimate data available")
- Accuracy Trend Over Time ("No trend data available")
- Best/Worst Estimated Stories ("No data available")

**Gold Elements Observed:**
- Active "Estimates" sidebar item

**Notes:**
- All empty state for this Kaven instance
- Cards have rounded corners and subtle borders

---

### 6. Cost Analysis (Tokens & Costs)

| Mobile (320px) | Tablet (768px) | Desktop (1920px) |
|---|---|---|
| `cost-analysis-mobile-320px.png` | `cost-analysis-tablet-768px.png` | `cost-analysis-desktop-1920px.png` |
| 48 kB | 95 kB | 113 kB |

**Visible elements:**
- API Cost ($1430.5), Tokens Used (2.1B), Sessions (605), Avg Cost/Session ($2.4)
- Subscription Savings alert
- Cost by Model donut chart (Sonnet 4.5: $688, Opus 4.6: $678, Haiku 4.5: $61, Opus 4.5: $3.2)
- Token Breakdown chart (Cache Read: 1.9B dominant)
- Daily Usage area chart
- Tab navigation: Summary | All Projects | Models

**Gold Elements Observed:**
- Active "Tokens & Costs" sidebar with `$` icon
- Light Mode toggle button visible (sun icon) at bottom of sidebar
- Tab navigation (Summary) shows active underline styling

**Notes:**
- This page has the most visual content (highest file sizes: 48-113 kB)
- Tab navigation uses `Summary | All Projects | Models` structure
- Subscription savings uses an emoji icon (not SVG) - note discrepancy with v4.4 spec (lucide-react)

---

### 7. Advanced Analytics

| Mobile (320px) | Tablet (768px) | Desktop (1920px) |
|---|---|---|
| `advanced-analytics-mobile-320px.png` | `advanced-analytics-tablet-768px.png` | `advanced-analytics-desktop-1920px.png` |
| 30 kB | 58 kB | 69 kB |

**Visible elements:**
- 9 analytics tabs: ROI | Budget | Agent Efficiency | Token Waste | Complexity vs Cost | Heatmap | What If | Git Impact | Sprint Cost
- Default tab: ROI - Return on Investment
- Stat cards: AI Cost ($0K), Human Equivalent ($0), Savings ($-34.5), ROI Multiplier (0x)
- AI Cost vs Human Equivalent bar chart

**Gold Elements Observed:**
- Active "Analytics" sidebar item
- Tab navigation (ROI) shows active underline

---

## Bundle Size Baseline

Built: 2026-02-17 via `vite build`

| File | Size | Gzip |
|------|------|------|
| `dist/index.html` | 0.46 kB | 0.32 kB |
| `dist/assets/index-*.css` | 36 kB | ~6.8 kB |
| `dist/assets/index-*.js` | 724 kB | ~201 kB |
| **Total** | **~760 kB** | **~208 kB** |

**Warning:** JS bundle exceeds Vite's 500 kB recommendation. Consider code-splitting with dynamic imports.

**Previous build reference (from CLAUDE.md v4.4):**
- index.js: 705.18 kB (gzip: 195.05 kB)
- index.css: 37.80 kB (gzip: 7.16 kB)
- Total: 725.39 kB (gzip: 201.16 kB)

---

## 8% Gold Rule Audit

**Target:** ~8% ± 2% of screen area with Lendária Gold accent (#C9B298 / hsl(32,20%,70%))

### Gold Color Token
- CSS var: `--primary: 32 20% 70%` (dark mode)
- Tailwind class: `gold` → `hsl(var(--primary))`
- Hex equivalent: approximately `#C9B298`

### Gold Elements Per Page (Desktop, 1920x1080)

| Page | Gold Elements | Estimated % Screen |
|------|---------------|--------------------|
| Project Overview | AIOS sidebar text, active nav border-l-4, @dev donut slice | ~3-5% |
| Epic Breakdown | Active nav border-l-4, Epics diamond icon | ~2-3% |
| Story Timeline | Active nav border-l-4 only (empty state) | <1% |
| Agent Performance | Active nav border-l-4 | ~2% |
| Estimates Analysis | Active nav border-l-4 only (empty state) | ~2% |
| Cost Analysis | Active nav border-l-4, $ icon, tab underline | ~3-4% |
| Advanced Analytics | Active nav border-l-4, tab underline | ~3-4% |

### 8% Rule Assessment

**Finding: BELOW TARGET**

- Gold accent is present but subtle (muted warm beige vs vivid gold)
- Most pages show approximately 2-5% gold screen area
- Only Project Overview and Cost Analysis approach the 5% range
- Story Timeline and Agent Performance fall well below 8%
- The primary source of gold is the sidebar navigation (fixed 170px wide) — this contributes ~8% of screen WIDTH but is a thin border, not fill
- Charts use the gold/tan color for @dev series but only when data is present

**Root Cause:**
The Lendária Gold color is intentionally subtle (hsl 32, 20%, 70% = desaturated warm beige). At 8% usage rule, this would need to be consistently applied to card borders, table headers, and chart series across all data-rich elements. The current implementation applies it only to: sidebar active state, loading spinners, and select UI affordances.

**8% Rule Status:** PARTIAL COMPLIANCE (~3-5% average across pages, target is 8% ± 2%)

---

## Visual State Checklist

### Per-Page Checklist

| Check | Overview | Epics | Stories | Agents | Estimates | Costs | Analytics |
|-------|----------|-------|---------|--------|-----------|-------|-----------|
| Gold accent visible | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL |
| Cards luxury variant (border-l-4) | NO | NO | NO | NO | NO | NO | NO |
| Sidebar gold active route | YES | YES | YES | YES | YES | YES | YES |
| Tabs gold underline | N/A | N/A | N/A | N/A | N/A | YES | YES |
| Charts gold primary series | YES | NO | N/A | NO | NO | YES | NO |
| Tooltips gold border | NOT VERIFIED | NOT VERIFIED | N/A | NOT VERIFIED | N/A | NOT VERIFIED | NOT VERIFIED |
| Tables gold header | NO | NO | N/A | NO | NO | N/A | N/A |
| Mobile responsive layouts | YES | YES | YES | YES | YES | YES | YES |

### Critical Visual Issues Found

1. **Card luxury variant not applied** - Cards use plain border (no `border-l-4 border-gold`). The Lendária DS Card component spec includes a `luxury` variant, but cards in the dashboard do not appear to use it.

2. **Table header not gold** - Agent Performance and Epic Breakdown tables use dark header rows without gold styling.

3. **Charts default to purple/blue** - Agent Performance bar chart uses purple. Only the donut charts (Project Overview, Cost Analysis) show the gold/tan primary series.

4. **Story Timeline empty state** - This page shows "No stories found" for the Kaven project instance, making it impossible to validate the story card gold elements.

5. **Emoji icon in Cost Analysis** - Subscription Savings card uses a coin emoji instead of lucide-react icon.

---

## Performance Baseline

**Lighthouse (estimated - not measured with CLI tool):**
Screenshot visual assessment:
- Pages load with full content visible
- Charts render correctly (Recharts working)
- Dark theme applied consistently
- No visible layout shifts in captured state

**Observable Issues:**
- Cost Analysis page shows 605 total sessions vs Project Overview showing 31 sessions — data inconsistency between pages (different API endpoints / project filtering)

---

## Notes on Capture Method

- **Tool:** Chrome 145 headless (`--headless=new`)
- **Server:** Static file server on port 3200 + API proxy to port 3100
- **React hydration:** `--virtual-time-budget=10000` (10s) for SPA rendering
- **Theme:** Dark mode (ThemeProvider default: "dark")
- **Data:** Kaven Framework project telemetry (31 sessions from `.aios/data/`)
- **Sidebar state:** Desktop (1920px) = expanded fixed sidebar; Mobile (320px) = hamburger/hidden
- **Chrome GCM errors:** Non-blocking Google notification errors appear in stderr but do not affect rendering

---

## Baseline Validity

This baseline captures the **current visual state** as of 2026-02-17. It serves as the reference point for:
- Future visual regression testing
- Design system implementation completeness
- 8% gold rule compliance tracking

**For future comparison:** Re-capture screenshots using the same methodology when design changes are made.
