---
project: kaven-template
phase: baseline-stabilization
updated: 2026-04-15T19:45:00Z
---

# Kaven Template — Current Status

> **Nota (2026-04-15):** este arquivo estava incorretamente espelhando conteúdo do `kaven-framework`. O conteúdo antigo foi **preservado** abaixo em “Archive (stale)”, e o status real do template está no topo.

## Estado geral

| Item | Status | Detalhes |
|------|--------|----------|
| CI | ✅ Baseline restaurada | PRs **#42** e **#43** (mergeados) |
| Objetivo | 🟡 Template “installable” | `pnpm i` + `pnpm run lint/typecheck/build` sem hacks |
| Qualidade | 🟡 Parcial | CI foi reduzida para baseline; majors ainda pendentes |

## PRs recentes (mergeados)

- **#42** fix(template): restore baseline CI typecheck
- **#43** chore(deps): bump axios + GitHub Actions (checkout/setup-node v6)

## Débitos remanescentes (majors)

> Estes upgrades precisam PRs humanos dedicados (um por major), com migração + CI verde.

- **Stripe 20 → 22**
- **TypeScript 5.9 → 6.0**
- **@fastify/multipart 9 → 10**
- **lucide-react 0.x → 1.x**
- **rimraf 5 → 6**

---

## Archive (stale) — conteúdo antigo preservado

> Abaixo está o conteúdo anterior (não confiável) que foi encontrado neste arquivo antes da correção em 2026-04-15.

## 🌐 Ecosystem Reality Check (Marketplace + CLI)

| Item | Status | Detalhes |
|------|--------|----------|
| **Kaven Marketplace** | 🟡 UPDATED | Prisma 7 + singleton no repo marketplace; deploy Cloud Run. |
| **Download / artefatos** | 🛑 P0 dados | Runtime usa S3 + `artifactUrl` no DB. Seeds antigos ainda citam `registry.kaven.dev` — alinhar DB + bucket (F1.4). |
| **CLI `marketplace browse`** | ✅ FIX 2026-04-14 | `getCategories()` agora chama **`GET /categories`** (JSON array). Antes: `/modules/categories` (404). Versão **kaven-cli ≥ 0.4.2-alpha.0**. |
| **CI/CD** | ✅ OK | Últimos merges marketplace/framework conforme GitHub. |
| **Docs** | ✅ SYNCED | `CLAUDE.md` (dir pai), `ECOSYSTEM_STATUS.md`, `MARKETPLACE-STATUS.md` reconciliados 2026-04-14. |

---

## 📍 Brownfield Discovery

- **Status:** ✅ COMPLETE
- **Date Completed:** 2026-02-03
- **Total Debts:** 47 items (358h total)
- **P0 Work:** 176h (16 items) - LAUNCH BLOCKERS
- **Classification:** 6.8/10 (good foundation with addressable critical gaps)
- **Document:** [BROWNFIELD_DISCOVERY_COMPLETE.md](docs/BROWNFIELD_DISCOVERY_COMPLETE.md)

---

## ✅ Sprint 1 — COMPLETO

- **Sprint:** 1
- **Dates:** 2026-02-03 to 2026-02-09
- **Effort:** 104h (7 stories)
- **Goal:** Resolver blockers críticos de segurança e isolamento multi-tenant
- **Status:** ✅ **7/7 STORIES COMPLETO**

### Stories Completadas

| ID | Título | Esforço | PR | Status |
|----|--------|---------|-----|--------|
| STORY-001 | Security Test Suite (IDOR, CSRF, SQLi, XSS) | 32h | — | ✅ |
| STORY-002 | GDPR Compliance Tests | 16h | PR#2 | ✅ |
| STORY-003 | Permissions tenantId Fix | 24h | PR#2 | ✅ |
| STORY-004 | Audit Systems tenantId Fix | 20h | PR#2 | ✅ |
| STORY-005 | RLS Middleware Complete | 8h | PR#2 | ✅ |
| STORY-006 | Soft Delete Filter Global | 4h | PR#2 | ✅ |
| STORY-007 | Space tenantId NOT NULL | 8h | PR#2 | ✅ |

### PRs Mergeados (Sprint 1)

| PR | Título | Merged | Branch |
|----|--------|--------|--------|
| PR#1 | fix: remove .agent for using AIOS | 2026-02-06 | fix |
| PR#2 | feat(migrations): Sprint 1 Database Migrations | 2026-02-08 | feat/sprint-1-migrations |
| PR#4 | fix(env): environment and seed configuration fixes | 2026-02-09 | environment-seeds-dev-fix |

---

## 🎯 Current Sprint — Sprint 2

- **Sprint:** 2
- **Dates:** 2026-02-11 to 2026-02-21
- **Duration:** 11 dias
- **Effort:** 72h
- **Goal:** Completar Tenant App com funcionalidades demonstrativas reais
- **Epic:** [EPIC-002-sprint-2-frontend-quick-wins.yaml](docs/planning/epics/EPIC-002-sprint-2-frontend-quick-wins.yaml)
- **Status:** 🔄 NOT STARTED

### Stories Sprint 2

| ID | Título | Esforço | Prioridade | Status |
|----|--------|---------|------------|--------|
| STORY-008 | Invoice History Page | 8h | P0 | NOT_STARTED |
| STORY-009 | Order History Page | 8h | P0 | NOT_STARTED |
| STORY-010 | Theme Customization DB Integration | 12h | P0 | NOT_STARTED |
| STORY-011 | Theme Per-Tenant Architecture Fix | 8h | P0 | NOT_STARTED |
| STORY-012 | Tenant App Theme API Implementation | 8h | P1 | NOT_STARTED |
| STORY-013 | Real Data Fetching Fix | 12h | P1 | NOT_STARTED |
| STORY-014 | Admin Routes Authorization | 8h | P1 | NOT_STARTED |

> **SALES BLOCKER:** Time de vendas não consegue demonstrar billing journey completo.
> Estimativa: -47% conversão com demo incompleto.

---

## 🚀 Launch Target

- **Date:** 2026-05-02
- **Reason:** 176h P0 work required (security + multi-tenant isolation)
- **Launch Readiness:** Sprint 1-2 complete = LAUNCH-READY (Week 8)

---

## 📊 Progress Tracking

### Sprint 2 Progress

- **Completed:** 0/7 stories (0%)
- **In Progress:** 0/7 stories
- **Not Started:** 7/7 stories
- **Hours Completed:** 0h / 72h (0%)

### Overall P0 Progress

- **Sprint 1:** ✅ 7/7 COMPLETE (104h)
- **Sprint 2:** 🔄 0/7 (72h remaining)
- **Target:** Sprint 2 completion (May 2)

---

## 📚 Quick Links

### Documentation
- [Brownfield Discovery Complete](docs/BROWNFIELD_DISCOVERY_COMPLETE.md)
- [Sprint 1 Summary](docs/planning/sprint-1-summary.md)
- [Sprint 1 Retrospective](docs/planning/sprint-1-retrospective.md)
- [System Architecture](docs/architecture/system-architecture.md)

### Planning
- [Sprint 2 Epic](docs/planning/epics/EPIC-002-sprint-2-frontend-quick-wins.yaml)
- [All Epics](docs/planning/epics/)
- [All Stories](docs/planning/stories/)

### Development Commands

```bash
# Quality gates
pnpm run quality

# Development
pnpm dev

# Tests
pnpm test
```

---

**Last Updated:** 2026-02-11 01:31:00 UTC
**Next Review:** Sprint 2 start
**Owner:** Tech Lead
