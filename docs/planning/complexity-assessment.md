# Complexity Assessment — Kaven Framework Pending Work Items

> **Assessed by:** @architect
> **Date:** 2026-02-15
> **Branch context:** `refactor/design-system`
> **Method:** Static analysis of codebase structure, dependencies, and implementation patterns

---

## Summary Matrix

| # | Work Item | Complexity | Effort (h) | Risk | Priority |
|---|-----------|:----------:|:----------:|:----:|:--------:|
| 1 | Test Coverage Expansion (6 modules) | 2/5 | 16-24 | Low | P1 |
| 2 | Missing UI Components for Docs (42 components) | 2/5 | 8-12 | Low | P2 |
| 3 | Usage Tracking System | 4/5 | 24-40 | High | P1 |
| 4 | Avatar File Upload | 3/5 | 12-20 | Medium | P2 |
| 5 | Bulk Delete Operations | 2/5 | 8-12 | Medium | P2 |
| 6 | Design System Adapters (Fluent/Shadcn) | 4/5 | 32-48 | High | P3 |
| 7 | CI/Infrastructure | 1/5 | 2-4 | Low | P1 |

**Total estimated range:** 102-160 hours

---

## 1. Test Coverage Expansion (6 Untested Modules)

**Complexity: 2/5 — Low-Medium**

### Current State

The 6 untested modules are:

| Module | Files | Service Layer | Complexity of Logic |
|--------|-------|:---:|:---:|
| `currencies` | routes only (inline handlers) | No | Simple CRUD |
| `dashboard` | routes + controller + service | Yes | Medium (aggregations, trends) |
| `export` | routes + controller | No (uses shared `exportService`) | Simple (CSV generation) |
| `policies` | routes + controller | Yes (external `PolicyService`) | High (policy evaluation engine) |
| `roles` | routes + controller + service | Yes | Medium (transactions, capabilities) |
| `spaces` | routes + controller + service | Yes | Simple (tenant-scoped queries) |

### Key Technical Risks
- **PolicyService** has the most complex logic (condition evaluation, enforcement rules) — this alone accounts for ~40% of test effort.
- **DashboardService** uses aggregate queries with date math and trend calculations — edge cases around zero-division and empty datasets need attention.
- `currencies` module has inline route handlers (no service layer), so tests must mock Prisma at the route level or test via supertest integration.

### Architectural Considerations
- Established pattern exists: `plan.service.spec.ts` uses `vi.hoisted()` + `vi.mock('../../../lib/prisma')` with inline mocks. The `createPrismaMock` helper at `apps/api/test/helpers/prisma-mock.ts` is available but the reference spec does not use it — team should standardize on one approach.
- `PolicyService` is imported from `../../../services/policy.service` (shared services directory), not from within the module. Tests need to mock at that path.
- `ExportController` depends on `exportService.generateCSV()` — test should mock the export service, not Prisma directly.

### Recommended Approach
1. Start with `spaces` (simplest — 2 methods, straightforward queries) as warm-up.
2. Then `currencies` (simple CRUD but different pattern — inline routes).
3. Then `roles` (medium — transactions, capability validation).
4. Then `dashboard` (medium — date math, aggregations).
5. Then `export` (simple but requires mocking external service).
6. Finish with `policies` (most complex — evaluation engine with multiple condition types).

**Estimate:** 16-24 hours (3-4h per module average, policies taking 6-8h).

---

## 2. Missing UI Components for Docs (42 Components)

**Complexity: 2/5 — Low-Medium**

### Current State

The `packages/ui/src/compat/` directory already contains **68 fully implemented components** (recently built in commit `c3094c1`). These are bridge components wrapping Radix/Shadcn primitives with the Minimals Design System styling (CVA variants, 5-tone color system, compound variants).

The 42 "missing" components are those referenced by MDX files in `apps/docs/` that are not yet exported or do not exist in the UI package.

### Key Technical Risks
- **Low risk.** The compat layer pattern is well-established — each component is a self-contained file wrapping Radix primitives with CVA styling.
- The atomic design layer (`atoms/`, `molecules/`, `organisms/`) has 23 components that may overlap with some of the 42 missing imports. Need to audit which MDX imports map to existing atoms/molecules vs. truly missing components.
- Some "missing" components may be re-export issues (component exists but is not in the barrel `index.ts`), not genuinely unimplemented.

### Architectural Considerations
- The compat layer follows a clear pattern: Radix primitive + CVA variants + forwardRef + displayName. Every new component follows this template.
- The `cn()` utility from `../patterns/utils` handles class merging consistently.
- Some complex organisms (data grids, rich text editors) would be significantly harder than simple atoms, but most missing docs components are likely display-level.

### Recommended Approach
1. Audit: run the docs build and capture all import errors to get the exact list of 42 missing components.
2. Categorize into: (a) already exists but not exported, (b) simple atom/molecule, (c) complex organism.
3. Batch-implement category (a) first (re-exports, likely 10-15 components).
4. Then implement category (b) following the established CVA + Radix pattern.
5. Defer category (c) if any require significant new dependencies.

**Estimate:** 8-12 hours (many will be re-exports or thin wrappers).

---

## 3. Usage Tracking System

**Complexity: 4/5 — High**

### Current State

- `apps/tenant/app/api/plan/usage/route.ts` returns `current: 0` for all features with a `// TODO` comment.
- The `UsageRecord` model exists in the Prisma schema (`packages/database/prisma/schema.base.prisma:1196`) with fields: `tenantId`, `featureId`, `currentUsage`, `periodStart`, `periodEnd`.
- The feature-flags system already has 40+ capabilities with `limitValue` on `PlanFeature`.
- No increment/decrement logic exists anywhere in the codebase.

### Key Technical Risks
- **Concurrency:** Multiple API requests can increment the same counter simultaneously. Requires atomic `UPDATE ... SET current_usage = current_usage + 1` or Redis-based counting.
- **Performance:** Every API call that triggers a countable feature must check/increment usage. Naive implementation adds a DB round-trip per request. This is a hot path.
- **Period management:** `periodStart`/`periodEnd` need automatic rotation (monthly billing cycles). What happens at period boundary? Stale records?
- **Feature mapping:** Each countable feature (API calls, users, storage, etc.) has different counting semantics. "Users" is a point-in-time count, "API calls" is cumulative, "Storage" is a gauge.
- **Enforcement:** When usage exceeds limit, what happens? 403? Graceful degradation? Needs product decision.

### Architectural Considerations
- The `requireFeature()` middleware exists but only checks boolean capabilities, not numeric limits against usage.
- The usage tracking must integrate at the middleware/service layer — likely a Fastify `onRequest` hook or decorator.
- Different feature types need different counting strategies:
  - **Cumulative counters** (API calls, exports): Increment on each action.
  - **Point-in-time gauges** (active users, storage): Recalculate periodically or on-demand.
  - **Rate limits** (API calls/minute): Requires Redis or in-memory window.
- Schema uses `@@unique([tenantId, featureCode])` in docs but `featureId` in actual Prisma schema — slight discrepancy to resolve.

### Recommended Approach
1. **Phase 1 (MVP):** Implement simple DB-based counters for 3-4 key features (users, API calls, storage). Use Prisma `$executeRaw` for atomic increments. No Redis yet.
2. **Phase 2:** Add period rotation via a scheduled job (cron or Prisma middleware).
3. **Phase 3:** Integrate with `requireFeature()` middleware to enforce limits.
4. **Phase 4:** Move hot counters to Redis with periodic DB sync for durability.

**Estimate:** 24-40 hours (MVP 24h, full implementation 40h).

---

## 4. Avatar File Upload

**Complexity: 3/5 — Medium**

### Current State

- **Backend exists:** `apps/api/src/modules/files/` has a complete `FileService` with `upload()`, `getById()`, `list()`, `delete()` methods. Routes are registered with auth middleware.
- **Storage is local-only:** Files write to `process.cwd()/uploads/` using `fs/promises`. No S3/R2/CDN integration.
- **Prisma `File` model exists** with `filename`, `originalName`, `mimeType`, `size`, `path`, `url`, `userId`, `tenantId`.
- **Frontend form exists** at `apps/tenant/sections/user/view/user-create-view.tsx` but has no upload integration.
- **`@fastify/multipart`** is already imported in the file service (indicating the plugin is configured).

### Key Technical Risks
- **Local storage is not production-viable.** The `uploads/` directory does not survive container restarts, horizontal scaling, or CDN needs. This must be flagged as tech debt.
- **No image processing:** No resizing, cropping, or thumbnail generation. Avatars need at least a resize to prevent 10MB avatar images.
- **CORS/proxy:** The tenant app (Next.js) needs to reach the Fastify API for multipart upload. Proxy or direct API call configuration needed.
- **User model linkage:** The `User` model needs an `avatarUrl` or `avatarFileId` field. Currently unclear if this exists.

### Architectural Considerations
- The file upload backend is already functional for local storage. The main work is:
  1. Wire the frontend form to call the upload API.
  2. Add image resize (sharp or similar).
  3. Store the returned `url` in the User record.
- For production: implement a storage adapter pattern (local/S3/R2) so the `FileService` is storage-agnostic.

### Recommended Approach
1. Add `avatarUrl` field to User model (if missing) via Prisma migration.
2. Wire frontend avatar upload component to `POST /api/files/upload`.
3. After upload success, update user profile with the returned file URL.
4. Add basic image validation (dimensions, file size) on frontend.
5. Defer S3/R2 integration and image processing to a follow-up story.

**Estimate:** 12-20 hours (12h for basic wiring, 20h with resize + storage abstraction).

---

## 5. Bulk Delete Operations

**Complexity: 2/5 — Low-Medium**

### Current State

- Both `apps/admin/sections/tenant/view/tenant-view.tsx:93-96` and `apps/tenant/sections/tenant/view/tenant-view.tsx` have `handleDeleteSelected()` functions with `// TODO: Implement bulk delete` comments.
- Multi-select UI already exists (`selected` state array, `handleSelectRow` handler).
- Single delete exists in `tenant-details-view.tsx` using `deleteTenant.mutate()` (via React Query).
- No batch delete API endpoint exists on the Fastify backend.

### Key Technical Risks
- **Soft delete consistency:** The codebase uses both `deletedAt` and `isActive` for soft delete (varies by model). Batch delete must use the correct mechanism per entity.
- **RLS enforcement:** The `prisma-rls.ts` middleware must still apply during batch operations — no bypass via bulk queries.
- **Cascade effects:** Deleting tenants cascades to users, subscriptions, etc. Batch operations amplify cascade scope.
- **UX confirmation:** Need a confirmation modal for destructive batch operations.

### Architectural Considerations
- The API should accept `POST /api/tenants/batch-delete` with `{ ids: string[] }` body (not DELETE with body, which is non-standard).
- Use `prisma.$transaction` for atomicity.
- The frontend already has selection state — just needs the API call and confirmation modal.

### Recommended Approach
1. Add `POST /api/tenants/batch-delete` endpoint with ids array validation.
2. Implement soft-delete in a transaction with RLS context.
3. Add confirmation modal (the `ConfirmationModal` compat component already exists in UI package).
4. Wire `handleDeleteSelected` to the new API endpoint via React Query mutation.
5. Add optimistic update (remove from table immediately, rollback on error).

**Estimate:** 8-12 hours.

---

## 6. Design System Adapters (Fluent/Shadcn)

**Complexity: 4/5 — High**

### Current State

- `apps/admin/lib/design-system/provider/index.tsx` has an adapter registry with 4 entries:
  - `MUI`: implemented (`muiAdapter`)
  - `HIG`: implemented (`higAdapter`)
  - `FLUENT`: **TODO stub** (falls back to `muiAdapter`)
  - `SHADCN`: **TODO stub** (falls back to `muiAdapter`)
- Only 2 adapter directories exist: `adapters/mui/` and `adapters/hig/`.
- The `DesignSystemAdapter` interface requires: `toSemanticTokens()`, `getDefaultTokens()`, `validateCustomization()`.
- The provider injects CSS variables via `injectCSSVariables()` using the semantic token system.

### Key Technical Risks
- **Design language translation is non-trivial.** Fluent UI (Microsoft) and Shadcn have fundamentally different design philosophies (Fluent: depth/motion system, Shadcn: utility-first minimalism). Mapping these to the shared `SemanticDesignTokens` type requires deep understanding of each system.
- **Token coverage gaps.** The semantic token system has brand colors (5-tone), typography, spacing, radius, shadows. Fluent has additional concepts (elevation, motion curves, acrylic materials) that don't map cleanly. Shadcn has CSS custom properties that partially overlap.
- **Component-level differences.** The adapters only handle tokens/CSS variables, not component behavior. But Fluent and Shadcn components behave differently (e.g., Fluent dialogs use the "light dismiss" pattern). Token-only adaptation may produce visually inconsistent results.
- **Testing surface.** Each adapter needs testing across all token categories with both light and dark modes. Visual regression testing is ideal but not set up.

### Architectural Considerations
- The adapter interface is clean and well-defined. Adding a new adapter is mechanically straightforward — the complexity is in the token mapping correctness.
- Consider whether Fluent/Shadcn adapters are truly needed for launch or are a post-launch nice-to-have. The MUI and HIG adapters already provide 2 distinct visual identities.
- If pursued, Shadcn is easier to implement first (its token system is closer to the existing CSS variable approach). Fluent requires more translation work.

### Recommended Approach
1. **Assess business need.** If theme switching is a demo/sales feature, 2 adapters (MUI + HIG) may suffice for launch.
2. If needed, implement Shadcn adapter first (closer to existing patterns, 12-16h).
3. Then Fluent adapter (requires Fluent UI token research, 20-32h).
4. Add visual snapshot tests for each adapter x mode combination.

**Estimate:** 32-48 hours for both adapters. 12-16 hours for Shadcn alone.

---

## 7. CI/Infrastructure

**Complexity: 1/5 — Trivial**

### Current State

- **Snyk token:** `.github/workflows/ci.yml:176` already uses `snyk/actions/node@master` with `continue-on-error: true`. The job exists but silently fails without `SNYK_TOKEN` secret configured. This is a GitHub repo settings change, not code.
- **Branch cleanup:** Standard GitHub settings (auto-delete head branches on merge). Or a scheduled GH Action to prune stale branches.
- **Build validation:** CI already has lint + typecheck stages. Unclear what additional validation is needed.

### Key Technical Risks
- None significant. These are configuration tasks.
- Snyk may flag vulnerabilities in dependencies that require resolution time (but that is separate from the configuration task itself).

### Architectural Considerations
- Snyk free tier has limitations on private repos. Verify plan compatibility.
- Branch cleanup should exclude `main`, `develop`, and any long-lived branches.

### Recommended Approach
1. Add `SNYK_TOKEN` to GitHub repository secrets.
2. Enable "Automatically delete head branches" in repo settings.
3. Optionally add a stale branch cleanup GH Action (5-minute task).

**Estimate:** 2-4 hours.

---

## Recommended Execution Order

Based on complexity, dependencies, and business value:

| Phase | Items | Rationale |
|-------|-------|-----------|
| **Phase 1** (immediate) | #7 CI/Infra, #1 Test Coverage | Low-risk, high-value quality improvements. CI fixes are 2h. Tests establish a safety net before feature work. |
| **Phase 2** (next sprint) | #5 Bulk Delete, #2 UI Components | Medium effort, unblocks docs and admin UX. Both have clear patterns to follow. |
| **Phase 3** (following sprint) | #4 Avatar Upload, #3 Usage Tracking | These require new infrastructure (storage, counting). Usage tracking is the most architecturally significant item. |
| **Phase 4** (post-launch) | #6 Design System Adapters | High effort, low launch urgency. 2 adapters (MUI + HIG) already exist for demos. |

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Usage tracking adds latency to every API call | High | Medium | Use async counting, Redis buffer, or batch writes |
| Local file storage fails in production | High | High | Implement storage adapter pattern early; default to S3 |
| Fluent adapter produces visual inconsistencies | Medium | High | Limit to token-level adaptation; document limitations |
| Bulk delete cascades cause data loss | High | Low | Transaction-based with confirmation UI; audit log entries |
| Test mocking diverges from real Prisma behavior | Medium | Medium | Add 2-3 integration tests per module against test DB |

---

*Assessment complete. Ready for sprint planning.*
