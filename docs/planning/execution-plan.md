# Execution Plan — Sprints 5-6

> **Created by:** @architect (Aria)
> **Date:** 2026-02-15
> **Stories:** 19 (STORY-028 to STORY-046, excluding 047/048/049)
> **Total estimated effort:** ~156h
> **QA critique applied:** Yes (7 issues fixed)

---

## Wave Analysis

Stories are grouped into execution waves based on dependencies and parallelization opportunities.
Within each wave, independent stories can be developed concurrently.

```
WAVE 1 (Sprint 5 — immediate, no deps)
├── [Backend]  STORY-036  Export SpotlightCard          1h   ←── trivial, do first
├── [DevOps]   STORY-044  Branch cleanup                2h
├── [DevOps]   STORY-045  Snyk configuration            3h
├── [Backend]  STORY-030  Spaces tests                  8h   ←── warm-up
├── [Backend]  STORY-028  Plans tests                   8h
├── [Backend]  STORY-029  Roles tests                   8h
├── [Backend]  STORY-032  Policies tests                6h
├── [Backend]  STORY-031  Currencies/Dashboard/Export   12h
└── [Frontend] STORY-034  UI components batch 1         16h  ←── includes audit step
                                                        ────
                                                        64h (parallelizable to ~24h with 3 devs)

WAVE 2 (Sprint 5 — depends on Wave 1)
├── [Frontend] STORY-035  UI components batch 2         16h  ←── depends on STORY-034
└── [Backend]  STORY-038  Usage tracking counters       12h  ←── no hard dep, but benefits from test infra
                                                        ────
                                                        28h (parallelizable to ~16h with 2 devs)

WAVE 3 (Sprint 6 — depends on Wave 1-2)
├── [Backend]  STORY-033  Expand test coverage          16h  ←── depends on 028-032
├── [Frontend] STORY-037  CI build validation            6h  ←── depends on 034/035
├── [Frontend] STORY-042  Shadcn adapter                 8h  ←── implement BEFORE Fluent
├── [Backend]  STORY-043  AWS SES email integration     12h
└── [FullStack] STORY-040 Bulk delete operations         8h
                                                        ────
                                                        50h (parallelizable to ~16h with 3 devs)

WAVE 4 (Sprint 6 — final wave)
├── [FullStack] STORY-039 Avatar file upload            10h
├── [Frontend]  STORY-041 Fluent UI adapter              8h  ←── after STORY-042
└── [TechLead]  STORY-046 Finalize tech debt doc         4h  ←── depends on all EPIC-005
                                                        ────
                                                        22h (parallelizable to ~10h with 2 devs)
```

---

## Dependency Graph

```
STORY-036 ──────────────────────────────────────────────── (standalone)
STORY-044 ──────────────────────────────────────────────── (standalone)
STORY-045 ──────────────────────────────────────────────── (standalone)

STORY-028 ─┐
STORY-029 ─┤
STORY-030 ─┼──► STORY-033 (expand test coverage)
STORY-031 ─┤         │
STORY-032 ─┘         └──► STORY-046 (finalize tech debt)

STORY-034 ──► STORY-035 ──► STORY-037 (CI build validation)
                                │
                                └──► STORY-046 (finalize tech debt)

STORY-038 ──────────────────────────────────────────────── (standalone)
STORY-039 ──────────────────────────────────────────────── (standalone)
STORY-040 ──────────────────────────────────────────────── (standalone)
STORY-042 ──► STORY-041 (Fluent after Shadcn)
STORY-043 ──────────────────────────────────────────────── (standalone)
```

---

## Critical Path

The longest dependency chain determines minimum calendar time:

```
STORY-034 (16h) → STORY-035 (16h) → STORY-037 (6h) → STORY-046 (4h) = 42h
```

With a single developer on this path: ~5-6 working days.
With parallelization (Wave 1 backend + frontend concurrent): ~3-4 working days for Sprint 5.

---

## Recommended Dev Assignment

### Solo Developer (1 person)

**Sprint 5 order:**
1. STORY-036 (1h) — quick win, unblocks docs
2. STORY-044 + STORY-045 (5h) — DevOps housekeeping
3. STORY-030 (8h) — warm-up tests (simplest)
4. STORY-029 (8h) — roles tests
5. STORY-028 (8h) — plans tests
6. STORY-032 (6h) — policies tests
7. STORY-031 (12h) — 3-module grouped tests
8. STORY-034 (16h) — UI audit + batch 1
9. STORY-035 (16h) — UI batch 2
10. STORY-038 (12h) — usage tracking

**Sprint 6 order:**
11. STORY-037 (6h) — CI build validation
12. STORY-033 (16h) — expand test coverage
13. STORY-042 (8h) — Shadcn adapter
14. STORY-043 (12h) — SES email
15. STORY-040 (8h) — bulk delete
16. STORY-039 (10h) — avatar upload
17. STORY-041 (8h) — Fluent adapter
18. STORY-046 (4h) — tech debt finalization

### Two Developers (backend + frontend)

**Dev A (Backend):** 028→029→030→031→032→038→033→043→040→039
**Dev B (Frontend):** 036→034→035→037→042→041→046
**Shared:** 044, 045 (either dev, day 1)

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| UI component count unknown until STORY-034 audit | STORY-034 produces audit artifact before implementation. STORY-035 effort adjustable. |
| Usage tracking concurrency issues | MVP uses DB-only counters with atomic SQL. Redis deferred to post-launch. |
| Fluent adapter visual inconsistencies | Token-only adaptation, component behavior differences documented as known limitations. |
| Bulk delete cascade scope | Scoped to SUPER_ADMIN only. Transaction-based with audit log. |
| SES domain verification lead time | Start verification in Wave 1 (24-48h lead time), implement in Wave 3. |

---

## Sprint 5 Definition of Done

- [ ] 6 previously-untested modules have test suites (STORY-028-032)
- [ ] SpotlightCard exported (STORY-036)
- [ ] UI component gap audited and first batch implemented (STORY-034)
- [ ] Second batch of UI components implemented (STORY-035)
- [ ] Usage tracking returns real counts (STORY-038)
- [ ] Stale branches cleaned (STORY-044)
- [ ] Snyk scanning active in CI (STORY-045)
- [ ] All tests pass, typecheck clean

## Sprint 6 Definition of Done

- [ ] Test coverage expanded across all modules (STORY-033)
- [ ] All 3 apps build in CI (STORY-037)
- [ ] Avatar upload works end-to-end (STORY-039)
- [ ] Bulk delete works for admin (STORY-040)
- [ ] Shadcn and Fluent adapters functional (STORY-041, 042)
- [ ] SES email provider operational (STORY-043)
- [ ] Technical debt document finalized (STORY-046)
- [ ] All tests pass, typecheck clean

---

## Pipeline Status

| Phase | Agent | Status |
|-------|-------|--------|
| 1. Gather Requirements | @pm | DONE |
| 2. Assess Complexity | @architect | DONE |
| 3. Research Dependencies | @analyst | DONE |
| 4. Write Specs | @pm | DONE (19 stories) |
| 5. Critique Specs | @qa | DONE (7 issues fixed) |
| 6. Create Plan | @architect | DONE |
| **Ready for @dev** | | **YES** |

---

*— Aria, arquitetando o futuro*
