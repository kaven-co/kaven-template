# KAVEN FRAMEWORK — Sprint 5 & 6 Requirements Document

> **Author:** @pm (Product Manager)
> **Date:** 2026-02-15
> **Status:** APPROVED for Planning
> **Scope:** EPIC-005, EPIC-006, EPIC-007
> **Story range:** STORY-028 through STORY-049
> **Last story (prior):** STORY-027 (Sprint 4) | **Last epic (prior):** EPIC-004

---

## Executive Summary

This document captures all remaining pending work for the Kaven Framework, organized into three epics spanning Sprint 5 and Sprint 6. The work falls into three categories:

1. **Test Coverage & Quality** (EPIC-005) — 6 modules with zero tests, 42 missing UI components, and CI hardening
2. **Feature Completions & Integrations** (EPIC-006) — Avatar upload, bulk delete, design system adapters, usage tracking, AWS SES
3. **Infrastructure & Housekeeping** (EPIC-007) — Branch cleanup, Snyk configuration, technical debt finalization

**Total estimated effort:** ~156h across 19 stories (3 stories removed — already implemented in PR #10)
**Sprint 5:** 76h (10 stories) — Focus on test coverage and critical feature gaps
**Sprint 6:** 80h (9 stories) — Focus on polish, integrations, and infrastructure

> **NOTE (2026-02-15):** STORY-047 (Rate Limiting), STORY-048 (Error Standardization), and STORY-049 (Security Headers) were removed from this plan — they were already implemented in PR #10 (feat/final-completion). Verified: @fastify/rate-limit with 3-tier config, global setErrorHandler with Sentry integration, @fastify/helmet with full security headers.

---

## EPIC-005: Test Coverage & Component Library Completeness

**Goal:** Eliminate all test coverage gaps and resolve missing UI component imports so the docs site and CI builds are reliable.

**Business justification:** Zero-test modules are a liability for a framework sold to developers. Missing components in docs break the documentation site, which is a primary sales channel.

**Risk assessment:**
- **Probability of issues:** HIGH (8/10) — Untested modules will surface bugs in production
- **Impact:** HIGH — Broken docs site damages credibility; untested modules erode trust
- **Mitigation:** Prioritize modules used in demos (plans, roles, spaces) first

### Stories

| ID | Title | Priority | Est. Hours | Sprint | Dependencies |
|----|-------|----------|------------|--------|--------------|
| STORY-028 | Write test suite for `plans` module | P0 | 8h | 5 | — |
| STORY-029 | Write test suite for `roles` module | P0 | 8h | 5 | — |
| STORY-030 | Write test suite for `spaces` module | P0 | 8h | 5 | — |
| STORY-031 | Write test suites for `currencies`, `dashboard`, `export` modules | P1 | 12h | 5 | — |
| STORY-032 | Write test suites for `policies` module | P1 | 6h | 5 | — |
| STORY-033 | Add tests for 12 modules with single-test coverage | P1 | 16h | 6 | — |
| STORY-034 | Implement missing UI components for docs (Batch 1 — 21 components) | P0 | 16h | 5 | — |
| STORY-035 | Implement missing UI components for docs (Batch 2 — 21 components) | P0 | 16h | 5 | STORY-034 |
| STORY-036 | Export SpotlightCard from @kaven/ui barrel | P0 | 1h | 5 | — |
| STORY-037 | Fix CI build validation for Next.js apps | P1 | 6h | 6 | STORY-034, STORY-035 |

---

### STORY-028: Write test suite for `plans` module

**Priority:** P0
**Estimate:** 8h
**Sprint:** 5
**Dependencies:** None

**Description:**
The `plans` module handles subscription logic and feature limits — core to the SaaS pricing model. It currently has ZERO tests.

**Acceptance Criteria:**
- [ ] Unit tests for plan CRUD operations (create, read, update, delete)
- [ ] Tests for subscription lifecycle (subscribe, upgrade, downgrade, cancel)
- [ ] Tests for feature limit enforcement (`requireFeature()` middleware)
- [ ] Tests for plan-feature association (PlanFeature model)
- [ ] Tests for tenant-scoped plan queries (RLS isolation)
- [ ] Minimum 80% line coverage for the module
- [ ] All tests pass in CI

**Files likely affected:**
- `apps/api/src/modules/plans/*.spec.ts` (new)
- `apps/api/src/modules/plans/*.test.ts` (new)

---

### STORY-029: Write test suite for `roles` module

**Priority:** P0
**Estimate:** 8h
**Sprint:** 5
**Dependencies:** None

**Description:**
The `roles` module manages RBAC enforcement and permission checks. No tests exist. This is a security-critical module.

**Acceptance Criteria:**
- [ ] Unit tests for role CRUD with space context validation
- [ ] Tests for role-capability association (RoleCapability model)
- [ ] Tests for user-space-role assignment (UserSpaceRole model)
- [ ] Tests for permission checking logic
- [ ] Tests for tenant isolation (role from Tenant A not accessible by Tenant B)
- [ ] Edge case: role without space context (should fail validation)
- [ ] Minimum 80% line coverage
- [ ] All tests pass in CI

---

### STORY-030: Write test suite for `spaces` module

**Priority:** P0
**Estimate:** 8h
**Sprint:** 5
**Dependencies:** None

**Description:**
The `spaces` module provides organizational isolation within tenants. Zero tests currently exist. Spaces are fundamental to the multi-tenant architecture.

**Acceptance Criteria:**
- [ ] Unit tests for space CRUD operations
- [ ] Tests for space membership (SpaceUser model)
- [ ] Tests for tenant isolation (spaces scoped to tenant)
- [ ] Tests for space slug uniqueness within a tenant
- [ ] Tests for cascade behaviors (what happens when space is deleted)
- [ ] Minimum 80% line coverage
- [ ] All tests pass in CI

---

### STORY-031: Write test suites for `currencies`, `dashboard`, `export` modules

**Priority:** P1
**Estimate:** 12h (4h each)
**Sprint:** 5
**Dependencies:** None

**Description:**
Three modules with zero test coverage, grouped for efficiency. These are less security-critical but still important for framework quality.

**Acceptance Criteria:**
- [ ] `currencies`: Tests for currency CRUD, conversion logic, default currency handling
- [ ] `dashboard`: Tests for metrics aggregation, tenant-scoped KPIs, date range filtering
- [ ] `export`: Tests for data export generation, format handling (CSV/JSON), tenant data isolation
- [ ] Each module has minimum 70% line coverage
- [ ] All tests pass in CI

---

### STORY-032: Write test suite for `policies` module

**Priority:** P1
**Estimate:** 6h
**Sprint:** 5
**Dependencies:** None

**Description:**
The `policies` module manages access policies. Zero test coverage. Related to the grant/capability permission system.

**Acceptance Criteria:**
- [ ] Unit tests for policy CRUD operations
- [ ] Tests for policy evaluation logic
- [ ] Tests for tenant isolation
- [ ] Tests for policy-capability relationships
- [ ] Minimum 70% line coverage
- [ ] All tests pass in CI

---

### STORY-033: Add tests for 12 modules with single-test coverage

**Priority:** P1
**Estimate:** 16h
**Sprint:** 6
**Dependencies:** None

**Description:**
12 modules currently have only 1 test each. Expand coverage to meaningful levels. Identify the 12 modules by running the test suite with coverage reporting and targeting any module with <= 1 test file.

**Acceptance Criteria:**
- [ ] Audit all modules to identify the 12 with single-test coverage
- [ ] Add at least 3-5 additional test cases per module covering happy path, error cases, and edge cases
- [ ] Each module reaches minimum 60% line coverage
- [ ] All tests pass in CI

---

### STORY-034: Implement missing UI components for docs (Batch 1 — 21 components)

**Priority:** P0
**Estimate:** 16h
**Sprint:** 5
**Dependencies:** None

**Description:**
42 of 80 components imported in MDX docs files do not exist in `@kaven/ui`. This story implements the first half (21 components). Without these, the docs site build fails or shows broken pages.

**Acceptance Criteria:**
- [ ] Audit all MDX files to produce the definitive list of 42 missing components
- [ ] Prioritize by frequency of import (most-imported first)
- [ ] Implement 21 components following existing @kaven/ui patterns (bridge pattern, Radix UI base)
- [ ] Each component has TypeScript types exported
- [ ] Each component is exported from @kaven/ui barrel file
- [ ] Docs site builds without import errors for implemented components
- [ ] Storybook stories for each new component (if Storybook is configured)

---

### STORY-035: Implement missing UI components for docs (Batch 2 — 21 components)

**Priority:** P0
**Estimate:** 16h
**Sprint:** 5
**Dependencies:** STORY-034

**Description:**
Second batch of 21 missing UI components. Completes the full set needed for docs site.

**Acceptance Criteria:**
- [ ] Implement remaining 21 components from the audit list
- [ ] Each component has TypeScript types exported
- [ ] Each component is exported from @kaven/ui barrel file
- [ ] Full docs site builds with zero import errors
- [ ] Visual spot-check: docs pages render components correctly

---

### STORY-036: Export SpotlightCard from @kaven/ui barrel

**Priority:** P0
**Estimate:** 1h
**Sprint:** 5
**Dependencies:** None

**Description:**
SpotlightCard component exists in `@kaven/ui` but is not exported from the package barrel file (`index.ts`). Quick fix.

**Acceptance Criteria:**
- [ ] Add `export { SpotlightCard } from './spotlight-card'` (or equivalent) to barrel file
- [ ] Verify MDX docs importing SpotlightCard now resolve correctly
- [ ] Build passes

---

### STORY-037: Fix CI build validation for Next.js apps

**Priority:** P1
**Estimate:** 6h
**Sprint:** 6
**Dependencies:** STORY-034, STORY-035

**Description:**
`pnpm run build` runs in CI but Next.js builds may fail due to missing components or import issues. After the UI component work is done, validate and fix any remaining build issues.

**Acceptance Criteria:**
- [ ] `pnpm run build` completes successfully for `apps/admin`
- [ ] `pnpm run build` completes successfully for `apps/tenant`
- [ ] `pnpm run build` completes successfully for `apps/docs`
- [ ] CI pipeline runs build step without failures
- [ ] Document any build workarounds needed in `docs/infrastructure/`

---

## EPIC-006: Feature Completions & Integrations

**Goal:** Complete all stub/TODO features that impact demos, sales, and the developer experience.

**Business justification:** Avatar upload, bulk delete, usage tracking, and design system adapters are all features visible in demos. Incomplete features undermine the "production-ready" positioning.

**Risk assessment:**
- **Probability of delays:** MEDIUM (6/10) — AWS SES requires domain verification (24-48h lead time)
- **Impact:** HIGH — Usage tracking showing "0" is embarrassing in demos; missing file upload breaks user management
- **Mitigation:** Start AWS SES domain verification early; usage tracking can use database queries initially

### Stories

| ID | Title | Priority | Est. Hours | Sprint | Dependencies |
|----|-------|----------|------------|--------|--------------|
| STORY-038 | Implement usage tracking counters for plan limits | P0 | 12h | 5 | — |
| STORY-039 | Implement avatar file upload with storage backend | P1 | 10h | 6 | — |
| STORY-040 | Implement bulk delete operations for admin and tenant views | P1 | 8h | 6 | — |
| STORY-041 | Implement Fluent UI design system adapter | P2 | 8h | 6 | — |
| STORY-042 | Implement Shadcn design system adapter | P2 | 8h | 6 | — |
| STORY-043 | Complete AWS SES email provider integration | P1 | 12h | 6 | — |

---

### STORY-038: Implement usage tracking counters for plan limits

**Priority:** P0
**Estimate:** 12h
**Sprint:** 5
**Dependencies:** None

**Description:**
The feature limits UI currently shows `0` for all usage counters. The route at `apps/tenant/app/api/plan/usage/route.ts:74` has a stub that returns zero values. This needs real database queries counting tenant resources against plan limits.

**Acceptance Criteria:**
- [ ] Query actual counts from database for each tracked resource (projects, users, spaces, etc.)
- [ ] Return counts in the format `{ resource: string, used: number, limit: number, percentage: number }`
- [ ] Handle unlimited plans (limit = -1 or null)
- [ ] Cache counts with short TTL (60s) to avoid expensive queries on every page load
- [ ] API response matches the contract expected by the Feature Limits UI (STORY-027 from Sprint 4)
- [ ] Tests for usage counting logic
- [ ] Tests for plan limit comparison
- [ ] Tenant isolation: counts are scoped to the requesting tenant

**Files likely affected:**
- `apps/tenant/app/api/plan/usage/route.ts`
- `apps/api/src/modules/plans/plan.service.ts` (or new usage service)

---

### STORY-039: Implement avatar file upload with storage backend

**Priority:** P1
**Estimate:** 10h
**Sprint:** 6
**Dependencies:** None

**Description:**
The user creation/edit form includes an avatar field, but file upload is a TODO at `apps/tenant/sections/user/view/user-create-view.tsx:106`. Need to implement actual file storage.

**Acceptance Criteria:**
- [ ] Implement file upload handler (multipart/form-data)
- [ ] Support local filesystem storage (development) and S3-compatible storage (production)
- [ ] Storage backend configurable via environment variable (`STORAGE_PROVIDER=local|s3`)
- [ ] Image validation: max 2MB, formats JPG/PNG/WebP only
- [ ] Image resizing to standard avatar dimensions (128x128, 256x256)
- [ ] Return URL of uploaded file for database storage
- [ ] Update user model to store avatar URL
- [ ] Frontend integration: preview before upload, progress indicator
- [ ] Tests for upload validation (size, format, dimensions)
- [ ] Tests for storage abstraction

**Files likely affected:**
- `apps/tenant/sections/user/view/user-create-view.tsx`
- `apps/api/src/modules/users/user.controller.ts`
- `apps/api/src/lib/storage/` (new — storage abstraction)

---

### STORY-040: Implement bulk delete operations for admin and tenant views

**Priority:** P1
**Estimate:** 8h
**Sprint:** 6
**Dependencies:** None

**Description:**
TODO comments exist in both admin and tenant `tenant-view.tsx` for bulk delete functionality. Users need to select multiple records and delete them in a single operation.

**Acceptance Criteria:**
- [ ] Implement multi-select checkbox column in data tables
- [ ] "Delete Selected" button appears when >= 1 row is selected
- [ ] Confirmation dialog showing count of items to be deleted
- [ ] API endpoint for bulk soft-delete (PATCH with array of IDs)
- [ ] Tenant isolation: verify all IDs belong to requesting tenant before deletion
- [ ] Audit log entry for bulk delete operations (single entry with list of affected IDs)
- [ ] Optimistic UI update with rollback on error
- [ ] Tests for bulk delete API endpoint
- [ ] Tests for tenant isolation on bulk operations

**Files likely affected:**
- `apps/admin/sections/tenant/view/tenant-view.tsx`
- `apps/tenant/sections/*/view/*-view.tsx`
- `apps/api/src/modules/*/controller.ts` (relevant modules)

---

### STORY-041: Implement Fluent UI design system adapter

**Priority:** P2
**Estimate:** 8h
**Sprint:** 6
**Dependencies:** None

**Description:**
TODO exists in `apps/admin/providers/index.tsx` and `apps/tenant/providers/index.tsx` for Fluent UI adapter. The design system supports adapter pattern to allow customers to swap UI frameworks.

**Acceptance Criteria:**
- [ ] Create Fluent UI adapter in `packages/ui/src/adapters/fluent/`
- [ ] Map core @kaven/ui components to Fluent UI equivalents (Button, Input, Select, Dialog, Table, Card)
- [ ] Adapter is tree-shakeable (only imports used Fluent components)
- [ ] Provider wrapper component for Fluent theme integration
- [ ] Documentation page in docs site showing Fluent adapter usage
- [ ] At least 1 example page rendering with Fluent adapter active

---

### STORY-042: Implement Shadcn design system adapter

**Priority:** P2
**Estimate:** 8h
**Sprint:** 6
**Dependencies:** None

**Description:**
TODO exists in provider files for Shadcn/ui adapter. Similar to Fluent adapter but for Shadcn/ui — a popular choice in the Next.js ecosystem.

**Acceptance Criteria:**
- [ ] Create Shadcn adapter in `packages/ui/src/adapters/shadcn/`
- [ ] Map core @kaven/ui components to Shadcn equivalents
- [ ] Adapter is tree-shakeable
- [ ] Provider wrapper component for Shadcn theme integration
- [ ] Documentation page in docs site showing Shadcn adapter usage
- [ ] At least 1 example page rendering with Shadcn adapter active

---

### STORY-043: Complete AWS SES email provider integration

**Priority:** P1
**Estimate:** 12h
**Sprint:** 6
**Dependencies:** None

**Description:**
AWS SES SDK integration is a TODO at `apps/api/src/lib/email/provider-email-detector.ts:198`. The email system supports Postmark, Resend, and SMTP but SES is commented out.

**Acceptance Criteria:**
- [ ] Implement SES adapter using `@aws-sdk/client-ses` (v3)
- [ ] Auto-detection in `provider-email-detector.ts` when `AWS_SES_REGION` is set
- [ ] Support raw email sending and template-based sending
- [ ] Configurable: `EMAIL_PROVIDER=ses` with fallback to SMTP
- [ ] IAM permissions documented (minimum required: `ses:SendEmail`, `ses:SendRawEmail`)
- [ ] Bounce and complaint handling via SNS webhook endpoint
- [ ] Tests with mocked AWS SDK
- [ ] Integration test documentation (requires real AWS credentials)

**Files likely affected:**
- `apps/api/src/lib/email/provider-email-detector.ts`
- `apps/api/src/lib/email/providers/ses.ts` (new)
- `apps/api/src/lib/email/providers/ses.spec.ts` (new)

---

## EPIC-007: Infrastructure & Housekeeping

**Goal:** Clean up technical debt, configure security tooling, and finalize infrastructure for production readiness.

**Business justification:** Stale branches, missing security scanning, and draft documentation create operational risk and slow down development velocity.

**Risk assessment:**
- **Probability of issues:** LOW (3/10) — These are well-understood tasks
- **Impact:** MEDIUM — Stale branches cause confusion; missing Snyk means undetected vulnerabilities
- **Mitigation:** Batch quick tasks together; Snyk setup is well-documented

### Stories

| ID | Title | Priority | Est. Hours | Sprint | Dependencies |
|----|-------|----------|------------|--------|--------------|
| STORY-044 | Clean up stale branches (local + remote) | P1 | 2h | 5 | — |
| STORY-045 | Configure SNYK_TOKEN and enable dependency scanning in CI | P1 | 3h | 5 | — |
| STORY-046 | Finalize technical debt document from DRAFT to APPROVED | P2 | 4h | 6 | All EPIC-005 stories |
| STORY-047 | Implement rate limiting per route category | P1 | 4h | 5 | — |
| STORY-048 | Standardize API error response format | P1 | 4h | 5 | — |
| STORY-049 | Add security headers (CSP, X-Frame-Options, HSTS) | P1 | 4h | 5 | — |

---

### STORY-044: Clean up stale branches (local + remote)

**Priority:** P1
**Estimate:** 2h
**Sprint:** 5
**Dependencies:** None

**Description:**
7+ stale branches exist from previous sprints (local and remote). These clutter the repository and can cause confusion.

**Acceptance Criteria:**
- [ ] List all local and remote branches
- [ ] Identify branches already merged to main
- [ ] Delete merged branches (local + remote) after confirmation
- [ ] Keep only: `main`, current sprint branch, and any active WIP branches
- [ ] Document deleted branches in commit message for audit trail

---

### STORY-045: Configure SNYK_TOKEN and enable dependency scanning in CI

**Priority:** P1
**Estimate:** 3h
**Sprint:** 5
**Dependencies:** None

**Description:**
The CI pipeline references SNYK_TOKEN but the secret is not configured in GitHub repo settings. Dependency scanning is not running.

**Acceptance Criteria:**
- [ ] Create Snyk account/project for kaven-framework
- [ ] Add `SNYK_TOKEN` to GitHub repository secrets
- [ ] Verify CI workflow step for Snyk runs successfully
- [ ] Configure Snyk to block PRs on critical/high vulnerabilities
- [ ] Run initial scan and document any findings
- [ ] Fix or waive any critical vulnerabilities found

---

### STORY-046: Finalize technical debt document from DRAFT to APPROVED

**Priority:** P2
**Estimate:** 4h
**Sprint:** 6
**Dependencies:** All EPIC-005 stories (to update status of resolved items)

**Description:**
`docs/prd/technical-debt-DRAFT.md` is in DRAFT status. After Sprint 5-6 work resolves many items, update the document to reflect current state and promote to APPROVED.

**Acceptance Criteria:**
- [ ] Review all 42 items against current codebase state
- [ ] Mark resolved items as DONE with resolution date and PR reference
- [ ] Update effort estimates for remaining items
- [ ] Recalculate totals and risk assessment
- [ ] Remove DRAFT status, change to APPROVED
- [ ] Rename file to `technical-debt.md` (remove DRAFT suffix)

---

### STORY-047: Implement rate limiting per route category

**Priority:** P1
**Estimate:** 4h
**Sprint:** 5
**Dependencies:** None

**Description:**
No rate limiting is configured on the Fastify API. This is a security gap that allows brute-force attacks on auth endpoints and API abuse.

**Acceptance Criteria:**
- [ ] Install and configure `@fastify/rate-limit`
- [ ] Auth routes: 10 requests/minute per IP
- [ ] General API routes: 100 requests/minute per IP
- [ ] Webhook routes: 50 requests/minute per IP
- [ ] Return standard `429 Too Many Requests` with `Retry-After` header
- [ ] Tests for rate limit enforcement
- [ ] Configurable limits via environment variables

**Files likely affected:**
- `apps/api/src/app.ts` (or plugin registration file)
- `apps/api/src/plugins/rate-limit.ts` (new)

---

### STORY-048: Standardize API error response format

**Priority:** P1
**Estimate:** 4h
**Sprint:** 5
**Dependencies:** None

**Description:**
API error responses are inconsistent across endpoints. Some return `{ message }`, others `{ error }`, others `{ error, message, statusCode }`. Standardize to a single format.

**Acceptance Criteria:**
- [ ] Define standard error schema: `{ error: string, message: string, code: string, statusCode: number }`
- [ ] Create global error handler in Fastify (`setErrorHandler`)
- [ ] Map Prisma errors to standard format (P2002 -> UNIQUE_CONSTRAINT, etc.)
- [ ] Map validation errors (Zod/Ajv) to standard format
- [ ] Update all `reply.status().send()` calls that use non-standard format
- [ ] Tests for error handler with various error types
- [ ] Document error codes in API documentation

---

### STORY-049: Add security headers (CSP, X-Frame-Options, HSTS)

**Priority:** P1
**Estimate:** 4h
**Sprint:** 5
**Dependencies:** None

**Description:**
Security headers are missing from API and Next.js app responses. These are baseline requirements for production deployment.

**Acceptance Criteria:**
- [ ] Add `@fastify/helmet` to API for automatic security headers
- [ ] Configure Content-Security-Policy appropriate for the API
- [ ] Add security headers to Next.js apps via `next.config.ts` headers configuration
- [ ] Headers include: CSP, X-Frame-Options (DENY), X-Content-Type-Options (nosniff), HSTS, Referrer-Policy
- [ ] Verify headers present in responses (automated test or manual verification)
- [ ] Document CSP configuration for customization by framework consumers

---

## Sprint Allocation Summary

### Sprint 5 (Feb 24 — Mar 7, 2026) — 88h

**Theme:** Test coverage, missing UI components, usage tracking, and security hardening

| Story | Title | Priority | Hours |
|-------|-------|----------|-------|
| STORY-028 | Plans module tests | P0 | 8h |
| STORY-029 | Roles module tests | P0 | 8h |
| STORY-030 | Spaces module tests | P0 | 8h |
| STORY-031 | Currencies/Dashboard/Export tests | P1 | 12h |
| STORY-032 | Policies module tests | P1 | 6h |
| STORY-034 | Missing UI components Batch 1 | P0 | 16h |
| STORY-035 | Missing UI components Batch 2 | P0 | 16h |
| STORY-036 | Export SpotlightCard | P0 | 1h |
| STORY-038 | Usage tracking counters | P0 | 12h |
| STORY-044 | Branch cleanup | P1 | 2h |
| STORY-045 | Snyk configuration | P1 | 3h |
| ~~STORY-047~~ | ~~Rate limiting~~ | ~~P1~~ | ~~DONE (PR #10)~~ |
| ~~STORY-048~~ | ~~Standardize error responses~~ | ~~P1~~ | ~~DONE (PR #10)~~ |
| ~~STORY-049~~ | ~~Security headers~~ | ~~P1~~ | ~~DONE (PR #10)~~ |

**Sprint 5 breakdown by priority:**
- P0: 61h (5 stories)
- P1: 29h (5 stories)

### Sprint 6 (Mar 10 — Mar 21, 2026) — 80h

**Theme:** Feature completions, integrations, and polish

| Story | Title | Priority | Hours |
|-------|-------|----------|-------|
| STORY-033 | Expand single-test modules | P1 | 16h |
| STORY-037 | CI build validation | P1 | 6h |
| STORY-039 | Avatar file upload | P1 | 10h |
| STORY-040 | Bulk delete operations | P1 | 8h |
| STORY-041 | Fluent UI adapter | P2 | 8h |
| STORY-042 | Shadcn adapter | P2 | 8h |
| STORY-043 | AWS SES integration | P1 | 12h |
| STORY-046 | Finalize tech debt doc | P2 | 4h |

**Sprint 6 breakdown by priority:**
- P1: 52h (5 stories)
- P2: 20h (3 stories)

---

## Dependency Graph

```
STORY-036 (SpotlightCard export) ──── standalone, do first
STORY-044 (Branch cleanup) ────────── standalone, do first
STORY-045 (Snyk config) ──────────── standalone, do first

STORY-028..032 (Module tests) ─────── all independent, parallelizable

STORY-034 (UI Batch 1) ───► STORY-035 (UI Batch 2) ───► STORY-037 (CI build fix)

STORY-038 (Usage tracking) ────────── standalone

STORY-047 (Rate limiting) ─────────── standalone
STORY-048 (Error responses) ───────── standalone
STORY-049 (Security headers) ──────── standalone

STORY-039 (Avatar upload) ─────────── standalone
STORY-040 (Bulk delete) ───────────── standalone
STORY-041 (Fluent adapter) ────────── standalone
STORY-042 (Shadcn adapter) ────────── standalone
STORY-043 (AWS SES) ───────────────── standalone (start domain verification early)

STORY-033 (Expand tests) ─────────── after Sprint 5 test work establishes patterns

STORY-046 (Tech debt doc) ────────── depends on all EPIC-005 stories completing
```

---

## Cross-Epic Dependencies

| Upstream (must be done first) | Downstream (blocked by upstream) |
|-------------------------------|----------------------------------|
| STORY-034, STORY-035 (UI components) | STORY-037 (CI build validation) |
| STORY-034 (UI Batch 1) | STORY-035 (UI Batch 2) — sequential by design |
| All EPIC-005 stories | STORY-046 (tech debt finalization) |
| STORY-038 (usage tracking) | Feature Limits UI in Sprint 4 (STORY-027) becomes fully functional |

---

## Risk Register

### Risk 1: UI Component Volume (42 components)

**Probability:** MEDIUM (5/10)
**Impact:** HIGH — Docs site remains broken if not completed
**Mitigation:** Split into two batches. Prioritize by import frequency. Some components may be simple wrappers. Reuse existing Radix UI primitives where possible.

### Risk 2: AWS SES Domain Verification Delay

**Probability:** MEDIUM (5/10)
**Impact:** LOW — Other email providers (Postmark, Resend, SMTP) are functional
**Mitigation:** Start domain verification request at the beginning of Sprint 6. SES is not a launch blocker since alternative providers work.

### Risk 3: Test Suite Stability

**Probability:** LOW (3/10)
**Impact:** MEDIUM — Flaky tests erode CI confidence
**Mitigation:** Use proper test isolation (database transactions rolled back per test). Follow existing test patterns from the 11 modules with 100% coverage.

### Risk 4: Design System Adapter Scope Creep

**Probability:** MEDIUM (6/10)
**Impact:** LOW — Adapters are P2, can be descoped
**Mitigation:** Define minimum viable adapter (6 core components only). Full adapter coverage is a post-launch enhancement.

---

## Success Criteria

At the end of Sprint 6, the following must be true:

- [ ] All 6 zero-test modules have >= 70% coverage
- [ ] All 42 missing UI components exist and are exported from @kaven/ui
- [ ] Docs site builds with zero import errors
- [ ] Usage tracking API returns real database counts (not zeros)
- [ ] `pnpm run build` succeeds for all apps in CI
- [ ] Rate limiting is active on API routes
- [ ] API error responses follow a single standard format
- [ ] Security headers are present on all responses
- [ ] Snyk dependency scanning runs in CI
- [ ] Technical debt document is finalized (no longer DRAFT)
- [ ] Stale branches are cleaned up

---

## Appendix: Story ID Reference

| ID | Epic | Sprint |
|----|------|--------|
| STORY-028 | EPIC-005 | 5 |
| STORY-029 | EPIC-005 | 5 |
| STORY-030 | EPIC-005 | 5 |
| STORY-031 | EPIC-005 | 5 |
| STORY-032 | EPIC-005 | 5 |
| STORY-033 | EPIC-005 | 6 |
| STORY-034 | EPIC-005 | 5 |
| STORY-035 | EPIC-005 | 5 |
| STORY-036 | EPIC-005 | 5 |
| STORY-037 | EPIC-005 | 6 |
| STORY-038 | EPIC-006 | 5 |
| STORY-039 | EPIC-006 | 6 |
| STORY-040 | EPIC-006 | 6 |
| STORY-041 | EPIC-006 | 6 |
| STORY-042 | EPIC-006 | 6 |
| STORY-043 | EPIC-006 | 6 |
| STORY-044 | EPIC-007 | 5 |
| STORY-045 | EPIC-007 | 5 |
| STORY-046 | EPIC-007 | 6 |
| STORY-047 | EPIC-007 | 5 |
| STORY-048 | EPIC-007 | 5 |
| STORY-049 | EPIC-007 | 5 |

---

*Generated by @pm | 2026-02-15 | Kaven Framework Sprint 5-6 Planning*
