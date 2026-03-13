# QA Spec Critique — Sprint 5-6 Stories (19 Stories)

> **Reviewed by:** @qa (Quinn)
> **Date:** 2026-02-15
> **Scope:** STORY-028 through STORY-046 (excluding STORY-047/048/049 — already implemented)
> **Verdict:** PASS WITH CONCERNS — 7 issues to address before dev handoff

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Stories reviewed | 19 |
| PASS (no issues) | 10 |
| PASS WITH CONCERNS | 7 |
| NEEDS REWORK | 2 |
| Blocking issues | 0 |

Overall quality is **good**. The stories follow a consistent format, have actionable acceptance criteria, and reference real codebase paths. The main gaps are: missing dependency declarations, inconsistent coverage targets, and a few stories with vague scope.

---

## Issue Register

### CRITICAL (Must fix before dev)

**None.**

### HIGH (Should fix before dev)

#### H1 — STORY-034/035: Scope is undefined until STORY-034 audit completes

- **Problem:** STORY-034 and STORY-035 each estimate 16h (32h total) to implement "missing UI components" — but the analyst found only **1 confirmed missing export** (SpotlightCard). The 42-component gap from the requirements doc is unverified. If the actual gap is 5 components, 32h is wildly overestimated. If it's 40, it may be underestimated.
- **Risk:** Dev starts STORY-035 with no clear scope (depends on STORY-034 audit output).
- **Fix:** Add to STORY-034 acceptance criteria: `- [ ] Produce numbered list of missing components with categorization (re-export vs new implementation) as deliverable artifact at docs/planning/ui-component-gap-audit.md`. Make STORY-035 effort_hours contingent on audit results (add note: "effort may be adjusted after STORY-034 audit").

#### H2 — STORY-038: Missing dependency on Product-Plan migration

- **Problem:** The UsageService needs to query `PlanFeature` associations via the tenant's subscription. The `products_plan_id_fkey` migration was just created (see `20260215000001_add_product_plan_relation/migration.sql`). STORY-038 doesn't declare this migration as a dependency.
- **Risk:** If the migration isn't applied before dev starts, queries will fail.
- **Fix:** Add to technical_notes: "Requires `20260215000001_add_product_plan_relation` migration to be applied. Run `npx prisma migrate deploy` before starting."

#### H3 — STORY-038: `files_to_create` lists route.ts but it should be `files_to_update`

- **Problem:** `apps/tenant/app/api/plan/usage/route.ts` already exists (it's the stub returning `current: 0`). Listing it under `files_to_create` implies creating a new file, which would overwrite the existing one.
- **Fix:** Move to `files_to_update` section (like STORY-043 does correctly).

#### H4 — STORY-040: Bulk delete for "tenants" but description says tenant-view.tsx

- **Problem:** The endpoint is `POST /api/tenants/batch-delete` but in a multi-tenant SaaS, tenants deleting other tenants is a **super-admin operation only**. The description mentions both `apps/admin/` and `apps/tenant/` views, but tenant users should NOT be able to delete tenants. The acceptance criteria says "Verify all IDs belong to requesting tenant" which is contradictory — tenants don't "own" other tenants.
- **Risk:** Authorization confusion. Bulk delete of tenants should be admin-only. Bulk delete within a tenant (e.g., users, products) is a different operation.
- **Fix:** Clarify scope: Is this bulk delete of **tenants** (admin-only) or bulk delete of **entities within a tenant** (e.g., users, products)? If tenants, remove the `apps/tenant/` view from scope. Add explicit authorization requirement: `- [ ] Require SUPER_ADMIN role for tenant bulk delete`.

### MEDIUM (Recommended improvements)

#### M1 — Inconsistent coverage targets across test stories

- **Problem:** STORY-028/029/030 require 80% coverage. STORY-031/032 require 70%. STORY-033 requires 60%. No rationale given for the difference.
- **Fix:** Add brief rationale in technical_notes (e.g., "70% target for dashboard due to complex aggregate query mocking that provides diminishing returns above 70%"). This prevents dev from wasting time chasing arbitrary numbers.

#### M2 — STORY-041/042: Dependency order is backwards

- **Problem:** The complexity assessment recommends implementing Shadcn BEFORE Fluent (it's closer to existing patterns). But STORY-041 (Fluent) has no dependency on STORY-042 (Shadcn), and both are in Sprint 6 without ordering guidance.
- **Fix:** Add to STORY-041 technical_notes: "Recommend implementing STORY-042 (Shadcn) first — its CSS variable approach is closer to existing token system. Fluent adapter should follow."

#### M3 — STORY-039: `files_to_create` lists existing files

- **Problem:** `user-create-view.tsx` and `file.service.ts` already exist. These should be under `files_to_update`.
- **Fix:** Move existing files to `files_to_update` section. Only truly new files stay in `files_to_create`.

---

## Per-Story Verdict

| Story | Verdict | Issues |
|-------|---------|--------|
| STORY-028 | PASS | Clean, well-scoped |
| STORY-029 | PASS | Good edge case coverage |
| STORY-030 | PASS | Good warm-up story |
| STORY-031 | PASS | Appropriate grouping of 3 small modules |
| STORY-032 | PASS | Correctly identifies shared path complexity |
| STORY-033 | PASS | Appropriate as Sprint 6 follow-up |
| STORY-034 | CONCERNS | H1: Undefined scope until audit |
| STORY-035 | CONCERNS | H1: Depends on STORY-034 audit output |
| STORY-036 | PASS | Trivial 1-line fix, well-defined |
| STORY-037 | PASS | Good validation gate after UI work |
| STORY-038 | CONCERNS | H2: Missing migration dep, H3: files_to_create vs update |
| STORY-039 | CONCERNS | M3: files_to_create lists existing files |
| STORY-040 | CONCERNS | H4: Authorization scope ambiguity |
| STORY-041 | CONCERNS | M2: Should follow STORY-042 |
| STORY-042 | PASS | Well-scoped, correct pattern reference |
| STORY-043 | PASS | Good use of files_to_update section |
| STORY-044 | PASS | Simple DevOps task |
| STORY-045 | PASS | Simple config task |
| STORY-046 | PASS | Good dependency chain |

---

## Positive Observations

1. **Consistent format** — All 19 stories follow the same YAML structure with id, epic_id, title, description, acceptance_criteria, technical_notes, files_to_create, definition_of_done.
2. **Real paths** — Stories reference actual file paths in the codebase (e.g., `apps/api/src/modules/plans/`), not generic placeholders.
3. **Test pattern documented** — Every test story references `vi.hoisted()` + `vi.mock()` + `createPrismaMock` helper, ensuring dev follows established patterns.
4. **Dependencies declared** — Sprint 6 stories correctly depend on Sprint 5 prerequisites (STORY-033 depends on 028-032, STORY-037 depends on 034/035).
5. **STORY-043 best practice** — Only story that correctly uses `files_to_update` section for existing files. Other stories should follow this pattern.

---

## Recommended Actions

| # | Action | Stories Affected | Effort |
|---|--------|-----------------|--------|
| 1 | Add audit artifact deliverable to STORY-034 AC | 034, 035 | 2 min |
| 2 | Add migration dependency note to STORY-038 | 038 | 1 min |
| 3 | Fix files_to_create → files_to_update in STORY-038, 039 | 038, 039 | 2 min |
| 4 | Clarify bulk delete authorization scope in STORY-040 | 040 | 5 min |
| 5 | Add Shadcn-first recommendation to STORY-041 | 041 | 1 min |
| 6 | Add coverage target rationale to STORY-031, 032, 033 | 031, 032, 033 | 3 min |

**Total fix effort: ~15 minutes.**

---

*— Quinn, guardiao da qualidade*
