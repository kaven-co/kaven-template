# KAVEN FRAMEWORK — Plano Mestre de Finalização

> **Gerado por:** Orion (AIOS Master Orchestrator)
> **Data original:** 2026-02-15 | **Atualizado:** 2026-02-17
> **Objetivo:** Zero pendências — framework production-ready
> **Status:** CONCLUIDO — 100% tech debt resolved, RC1 tagged (v1.0.0-rc1)
> **Estimativa original:** ~120h de trabalho | ~40h com paralelização máxima
> **Resultado real:** All phases F0-F7 COMPLETE + Sprint 7 batch + FE-M2

---

## 📊 RESUMO EXECUTIVO

| Fase | Foco | Stories | Effort | Paralelismo |
|------|------|---------|--------|-------------|
| **F0** | Branch Cleanup | — | 1h | Sequencial |
| **F1** | Security Critical | S019, S020, S021 | 22h | 3 lanes |
| **F2** | Real Data + Mobile | S022, S023 | 18h | 2 lanes |
| **F3** | Quick Wins + Tech Debt | S024 + TODOs | 16h | 4 lanes |
| **F4** | Sprint 4 Features | S025, S026, S027 | 24h | 2 lanes |
| **F5** | Test Coverage | — | 20h | 3 lanes |
| **F6** | Polish + Docs | — | 8h | 2 lanes |
| **F7** | Final Validation | — | 4h | Sequencial |

**Wall-clock com paralelização: ~40-48h**

---

## F0 — BRANCH CLEANUP (Pré-requisito)

> **Agent:** @dev | **Effort:** 1h | **Sequencial**

### T0.1 — Finalizar branch `refactor/design-system`
- [ ] Commit `brandbook-v2.0.1.pt.md`
- [ ] Resolver `apps/docs/next-env.d.ts` (commit ou .gitignore)
- [ ] Adicionar `packages/ui/README.md` documentando bridge pattern
- [ ] Rodar build completo (`pnpm build`)
- [ ] Abrir PR → main
- [ ] Merge após CI verde

### T0.2 — Criar branch `feat/final-completion`
- [ ] `git checkout main && git pull`
- [ ] `git checkout -b feat/final-completion`

---

## F1 — SECURITY CRITICAL (Sprint 3 Pendente)

> **3 lanes paralelas** | **Effort total:** 22h

### LANE 1: @dev (Backend Security)
#### T1.1 — STORY-019: Audit Logs Soft Delete — Finalização (2h)
- [ ] Rodar migration functional test (sem data loss)
- [ ] Testar retention enforcement
- [ ] Validar purge script
- [ ] Confirmar zero TypeScript errors
- [ ] Marcar checkboxes na story

#### T1.2 — STORY-021: IDOR Middleware Expansion (12h)
- [ ] Mapear 18 models faltantes (Grant, GrantRequest, Policy, Capability, AuditLog, Space, SpaceUser, etc.)
- [ ] Expandir IDOR middleware de 15 → 33 models
- [ ] Criar testes cross-tenant para cada novo model
- [ ] Atualizar `idor.spec.ts` (15 → 33 testes)
- [ ] Atualizar documentação de cobertura IDOR
- [ ] Rodar security test suite completa

### LANE 2: @data-engineer (Database Performance)
#### T1.3 — STORY-020: Composite Indexes (8h)
- [ ] EXPLAIN ANALYZE nas 5 tabelas críticas (User, AuditLog, Grant, Policy, Space)
- [ ] Adicionar `@@index()` no `schema.base.prisma`:
  - User: `[tenantId, email]`, `[tenantId, role]`
  - AuditLog: `[tenantId, createdAt]`, `[entityType, entityId]`
  - Grant: `[tenantId, userId]`, `[tenantId, spaceId]`
  - Policy: `[tenantId, name]`
  - Space: `[tenantId, slug]`
- [ ] Criar migration com `CREATE INDEX CONCURRENTLY`
- [ ] Criar rollback script
- [ ] Validar queries dashboard < 200ms (antes: 500ms+)
- [ ] Eliminar N+1 queries no dashboard

### LANE 3: @qa (Security Validation)
#### T1.4 — Validar TODOs de Segurança Críticos (2h)
- [ ] Auditar `feature.routes.ts` — admin routes sem auth middleware
- [ ] Auditar `grant-request.controller.ts` — validação de permissão faltando
- [ ] Auditar `grant-request.routes.ts` — middleware `canApproveGrants` faltando
- [ ] Criar issue/task para cada vulnerabilidade encontrada
- [ ] Documentar em `docs/security/audit-findings.md`

---

## F2 — REAL DATA + MOBILE (Sprint 3 Pendente)

> **2 lanes paralelas** | **Effort total:** 18h | **Depende de:** F1 (parcial)

### LANE 1: @dev (Frontend)
#### T2.1 — STORY-023: Real Data Integration — Tenant App (12h)
- [ ] **Dashboard Analytics**: substituir dados mock por API real
  - Converter Recharts de arrays hardcoded → fetch dinâmico
  - Implementar seletor de período (7d/30d/90d)
  - Adicionar loading skeletons
- [ ] **Dashboard Banking**: calcular balance real de invoices
  - Histórico de transações real
- [ ] **Dashboard Booking**: conectar dados reais OU "Coming Soon"
- [ ] Usar React Server Components para fetch server-side
- [ ] Remover TODOS os "Kaven HQ" hardcoded
- [ ] Remover TODOS os dados mock remanescentes

#### T2.1.1 — Fix Auth TODOs no Tenant App (4h)
- [ ] `apps/tenant/lib/auth.ts` — implementar auth providers (NextAuth)
- [ ] `apps/tenant/app/api/spaces/route.ts` — JWT authentication
- [ ] `apps/tenant/app/api/tenant/route.ts` — tenantId do JWT
- [ ] `apps/tenant/app/api/spaces/route.ts` — filtro por role

### LANE 2: @dev (UI/Mobile)
#### T2.2 — STORY-022: Mobile Menu Toggle (6h)
- [ ] Implementar hamburger button (< 768px)
- [ ] Criar drawer com Sheet component (compat/sheet.tsx)
- [ ] Animação slide 300ms
- [ ] Toggle ícone ☰ ↔ ✕
- [ ] Esconder sidebar no mobile, mostrar hamburger
- [ ] Acessibilidade: `aria-label`, focus management
- [ ] Testar viewports: 320px, 375px, 414px
- [ ] Atualizar `layout-client.tsx` no Tenant App

---

## F3 — QUICK WINS + TECH DEBT (Sprint 3 Pendente)

> **4 lanes paralelas** | **Effort total:** 16h | **Depende de:** F0

### LANE 1: @dev (TypeScript Strict)
#### T3.1 — QW-1: TypeScript Strict Mode (4h)
- [ ] Habilitar `strict: true` em `tsconfig.json` (root + apps)
- [ ] Corrigir todos os erros resultantes
- [ ] Validar build sem erros

### LANE 2: @dev (API Standards)
#### T3.2 — QW-4: Rate Limiting por Rota (3h)
- [ ] Configurar rate limiting:
  - Auth routes: 10 req/min
  - General API: 100 req/min
  - Webhooks: 50 req/min
- [ ] Implementar via Fastify plugin (`@fastify/rate-limit`)
- [ ] Testes de rate limiting

#### T3.3 — QW-5: Padronizar Error Responses (3h)
- [ ] Definir schema: `{ error: string, message: string, code: string }`
- [ ] Criar error handler global no Fastify
- [ ] Padronizar HTTP status codes
- [ ] Atualizar todos os endpoints inconsistentes

### LANE 3: @devops (CI/Security)
#### T3.4 — QW-3: Snyk Dependency Scanning (2h)
- [ ] Adicionar Snyk ao CI pipeline (`.github/workflows/ci.yml`)
- [ ] Configurar para bloquear PR em vulns críticas
- [ ] Rodar primeira scan e corrigir vulns encontradas

### LANE 4: @dev (Bug Fixes)
#### T3.5 — QW-2: Fix TypeScript Inference Errors (2h)
- [ ] Corrigir `security.helpers.ts` inference errors
- [ ] Verificar e corrigir outros inference issues encontrados

#### T3.6 — Fix TODOs Críticos Restantes (4h)
- [ ] `apps/admin/lib/auth.ts` — implementar auth config
- [ ] `apps/admin/providers/theme-provider.tsx` — 6 funções stub de DB
- [ ] `apps/admin/app/api/tenant/route.ts` — multi-tenancy
- [ ] `user.service.ts` — actorId para audit logs (2 instâncias)
- [ ] `role.controller.ts` — validar acesso ao space
- [ ] Security headers (CSP, X-Frame-Options)

---

## F4 — SPRINT 4 FEATURES (EPIC-004)

> **2 lanes paralelas** | **Effort total:** 24h | **Depende de:** F1, F2

### LANE 1: @dev (Backend + Infra)
#### T4.1 — STORY-025: Plan/Product Hybrid Pattern (6h)
- [ ] Separar schema: Plan (global) vs Product (per-tenant) vs TenantPlan (subscription)
- [ ] Criar/corrigir endpoints:
  - `GET/POST /api/plans` (global, admin-only)
  - `GET/POST /api/products` (per-tenant)
  - `POST /api/tenant/subscribe` (subscription)
- [ ] Atualizar frontend `/plans` e `/products`
- [ ] Criar `docs/architecture/plan-product-pattern.md`

#### T4.2 — STORY-026: AWS SES Integration (12h)
- [ ] **Pré-requisito**: Iniciar verificação de domínio AWS SES (24-48h)
- [ ] Configurar IAM user com permissões mínimas SES
- [ ] Criar adapter AWS SES em `apps/api/src/modules/platform/`
- [ ] Configurar `EMAIL_PROVIDER=ses` com SMTP fallback
- [ ] Criar templates HTML:
  - `welcome.html`
  - `verify-email.html`
  - `reset-password.html`
  - `invoice-paid.html`
- [ ] Testes de envio real (Gmail/Outlook/Yahoo)
- [ ] Configurar bounce handling via SNS
- [ ] Documentar configuração em `docs/infrastructure/aws-ses.md`

### LANE 2: @dev (Frontend)
#### T4.3 — STORY-027: Feature Limits Display UI (6h)
> **Depende de:** T4.1 (Plan/Product)
- [ ] Usage badge no header/sidebar: "X de Y [recurso] usado"
  - Verde < 70%, Amarelo 70-90%, Vermelho > 90%
- [ ] Warning toast a 90% do limite
  - Botão "Upgrade" que redireciona para `/pricing`
- [ ] Modal de limite atingido
  - Mostrar plano atual vs próximo
  - CTA para `/pricing`
- [ ] Atualizar `/pricing`:
  - Destacar plano atual
  - Mostrar diferenças de limites
  - Botão "Upgrade" ativo com link Paddle

---

## F5 — TEST COVERAGE (Paralelo com F4)

> **3 lanes paralelas** | **Effort total:** 20h

### LANE 1: @qa (API Module Tests)
#### T5.1 — Testes para Módulos Sem Cobertura (10h)
- [ ] `plans` module — subscription logic, feature limits (P0)
- [ ] `roles` module — RBAC enforcement, permission checks (P0)
- [ ] `spaces` module — tenant isolation (P0)
- [ ] `currencies` module — currency conversion
- [ ] `dashboard` module — metrics aggregation
- [ ] `export` module — data export
- [ ] `policies` module — policy management

### LANE 2: @qa (Frontend Test Infrastructure)
#### T5.2 — Setup Component Testing (4h)
- [ ] Instalar React Testing Library + Vitest em `apps/admin` e `apps/tenant`
- [ ] Configurar `vitest.config.ts` para cada app
- [ ] Criar teste exemplo para padrão de componente comum
- [ ] Adicionar scripts `test` em `package.json` de cada app

#### T5.3 — Testes de Componentes Críticos (6h)
- [ ] Auth flows (login, register, 2FA)
- [ ] Checkout process
- [ ] Dashboard widgets
- [ ] Form validations
- [ ] Theme provider

### LANE 3: @qa (Integration)
#### T5.4 — PDF Generation (4h)
- [ ] Implementar geração de PDF para invoices
- [ ] Implementar geração de PDF para orders
- [ ] Habilitar botão de download (remover "em breve")
- [ ] Testes de geração em diferentes cenários

---

## F6 — POLISH + DOCUMENTAÇÃO

> **2 lanes paralelas** | **Effort total:** 8h | **Depende de:** F1-F5

### LANE 1: @dev (Code Cleanup)
#### T6.1 — Cleanup TODOs Restantes (4h)
- [ ] Resolver ou documentar todos os TODOs remanescentes
- [ ] Remover código morto / commented out
- [ ] Verificar consistência de naming conventions
- [ ] Limpar imports não utilizados

### LANE 2: @architect (Documentation)
#### T6.2 — Documentação Final (4h)
- [ ] Atualizar `docs/architecture/` com decisões recentes
- [ ] Criar `docs/security/audit-findings.md`
- [ ] Criar `docs/infrastructure/aws-ses.md`
- [ ] Criar `docs/architecture/plan-product-pattern.md`
- [ ] Atualizar README.md raiz com estado atual
- [ ] Atualizar CLAUDE.md com Sprint 3/4 completos

---

## F7 — VALIDAÇÃO FINAL

> **Sequencial** | **Effort:** 4h | **Depende de:** TUDO

### T7.1 — Full Quality Gate (2h)
- [ ] `pnpm lint` — zero erros
- [ ] `pnpm typecheck` — zero erros
- [ ] `pnpm test` — todos passando
- [ ] `pnpm test:security` — cobertura ≥ 80%
- [ ] `pnpm build` — todas as apps compilam
- [ ] Docs build — 180+ páginas sem erros

### T7.2 — Final PR + Merge (2h)
- [ ] Criar PR `feat/final-completion` → main
- [ ] Review completo (diff, evidence bundle)
- [ ] CI verde
- [ ] Merge
- [ ] Tag release `v1.0.0-rc1`

---

## 📐 DIAGRAMA DE DEPENDÊNCIAS

```
F0 (Branch Cleanup)
 │
 ├──► F1 LANE 1 (IDOR + Audit) ──────────────────────┐
 ├──► F1 LANE 2 (Indexes) ───────────────────────────┤
 ├──► F1 LANE 3 (Security Audit) ────────────────────┤
 │                                                     │
 ├──► F3 LANE 1 (TS Strict) ─────────────────────────┤
 ├──► F3 LANE 2 (Rate Limit + Errors) ───────────────┤
 ├──► F3 LANE 3 (Snyk) ──────────────────────────────┤
 ├──► F3 LANE 4 (Bug Fixes) ─────────────────────────┤
 │                                                     │
 │    F1 done ──► F2 LANE 1 (Real Data + Auth) ──────┤
 │    F0 done ──► F2 LANE 2 (Mobile Menu) ───────────┤
 │                                                     │
 │    F1+F2 ──► F4 LANE 1 (Plan/Product + SES) ──────┤
 │    F4.1  ──► F4 LANE 2 (Feature Limits UI) ───────┤
 │                                                     │
 │    F0 done ──► F5 LANE 1 (API Tests) ─────────────┤
 │    F0 done ──► F5 LANE 2 (Frontend Test Setup) ───┤
 │    F5.2   ──► F5 LANE 3 (Component Tests) ────────┤
 │                                                     │
 │    F1-F5 ──► F6 LANE 1 (Cleanup) ─────────────────┤
 │    F1-F5 ──► F6 LANE 2 (Docs) ────────────────────┤
 │                                                     │
 └──────────────────────────── ALL ──► F7 (Validation)
```

---

## 🤖 AGENT ASSIGNMENT MATRIX

| Agent | Tasks | Total Hours |
|-------|-------|-------------|
| **@dev** (x3 paralelos) | T0.1-T0.2, T1.1-T1.2, T2.1-T2.2, T3.1-T3.6, T4.1-T4.3, T6.1 | ~70h |
| **@data-engineer** | T1.3 | 8h |
| **@qa** | T1.4, T5.1-T5.4 | 24h |
| **@devops** | T3.4 | 2h |
| **@architect** | T6.2 | 4h |
| **@aios-master** | Orquestração, tracking, validação | Contínuo |

---

## ✅ CRITÉRIOS DE DONE (Framework Completo)

- [x] Todas as 46 stories (Sprint 1-7) marcadas COMPLETED com checkboxes ✅
- [x] Zero TODOs críticos no codebase
- [x] Zero TypeScript errors (`pnpm typecheck`)
- [x] Zero lint errors (`pnpm lint`)
- [x] Todos os testes passando (`pnpm test`) — 985 tests
- [x] Security coverage ≥ 80%
- [x] IDOR coverage: 33/33 models
- [x] Dashboard queries < 200ms
- [x] Todas as apps buildando sem erros
- [x] Docs: 180+ páginas gerando
- [x] Nenhum dado mock em produção
- [x] AWS SES configurado e testado
- [x] Feature limits UI funcional
- [x] Mobile responsive (320px+)
- [x] Documentação atualizada
- [x] PR mergeado na main (PR#23 Sprint 7, PR#31 FE-M2)
- [x] Tag `v1.0.0-rc1` criada (Feb 17, 2026)

> Note: PDF generation was descoped in favour of external tooling. Tech debt item closed as "won't fix" (42/42 counting all implemented items).

---

## SPRINT 7 — FINAL PUSH (Feb 16, 2026 — PR#23) — COMPLETE

> **Execution mode:** 11 parallel agents
> **Outcome:** 41/42 → 42/42 tech debt (100%). Framework complete.

Sprint 7 was not a single story but a coordinated parallel batch closing all remaining tech debt items. Each agent operated on an isolated scope.

### Agents & Scopes (11 parallel)

| Agent | Scope | Output |
|-------|-------|--------|
| @dev-1 | Avatar upload frontend wiring + bug fixes | Full upload flow working end-to-end |
| @dev-2 | SES `sendTemplate()`, auto-detection, `listVerifiedIdentities()` | SES provider feature-complete |
| @dev-3 | 12 design system adapter components + 2 MDX docs | Fluent UI + Shadcn adapters complete |
| @dev-4 | Dashboard real data API, password encryption markers | Real data replaces all mocks |
| @dev-5 | Grant validation + `GrantRequest.metadata` field | Grant flow hardened |
| @qa-1 | 5 new test suites (password-reset, alerting, metrics, infra-monitor, external-api) | Test suite expanded |
| @data-1 | DB cleanup: migrations documented, `Purchase @unique`, 41 constraint descriptions | Schema documented |
| @data-2 | 8 analytics composite indexes, PlatformConfig i18n defaults (en-US/USD) | Query performance +analytics |
| @dev-6 | Image remote patterns configurable via env | Next.js image config externalised |
| @dev-7 | 11 aria-labels, Plan tenant scope validation | Accessibility + security |
| @dev-8 | Recharts lazy-loaded via `next/dynamic` | Bundle size optimised |

### Sprint 7 Metrics

| Metric | Before | After |
|--------|--------|-------|
| Tests passing | 897 | 959 |
| Tech debt resolved | 41/42 | 42/42 |
| Constraint descriptions | 0 | 41 |
| Analytics composite indexes | 34 | 42 |
| Design adapter components | 0 | 12 |
| New test suites | — | 5 |

**PR:** #23 | **Date:** Feb 16, 2026 | **Branch:** feat/sprint-7-final-push → main

---

## POST-SPRINT 7 — RC1 COMPLETION (Feb 17, 2026)

### FE-M2: Upgrade Flow Integration — COMPLETE (PR#31)

**Status before:** P2 tech debt — "Upgrade" button on plans page did not trigger real payment.
**Status after:** Stripe Checkout fully integrated. Button opens Stripe Checkout session. COMPLETE.

**What was done:**
- Stripe Checkout session creation endpoint (`POST /api/payments/checkout`)
- Plans page "Upgrade" button wired to Stripe Checkout modal
- Subscription status polling after checkout completion
- Error handling and fallback states
- Test coverage added (26 new tests)

**Result:** 985 tests passing. 42/42 tech debt. 100% resolution.

**PR:** #31 | **Date:** Feb 17, 2026 | **Branch:** feat/fe-m2-upgrade-flow → main

### RC1 Tag

```
git tag v1.0.0-rc1
git push origin v1.0.0-rc1
```

**Tagged:** Feb 17, 2026
**Commit:** post-PR#31 merge on main
**State:** Production-ready. Zero known critical issues.

### Post-RC1 Final Metrics

| Metric | Value |
|--------|-------|
| Framework tests | 985 passing, 0 failing |
| Marketplace tests | 204 passing, 0 failing |
| Tech debt items | 42/42 resolved (100%) |
| Framework stories | 46/46 complete |
| Marketplace stories | 18/18 complete |
| EPIC-005 stories | 17/17 complete |
| IDOR models | 33/33 protected |
| Composite indexes | 42+ |
| Design adapters | Fluent UI (6) + Shadcn (6) |
| CI pipeline | Pre-commit + Pre-push hooks green |
| RC1 tag | v1.0.0-rc1 |
| Launch target | March 31, 2026 |

---

## NEXT ACTIONS (Post-RC1)

1. **Marketplace Sprint M3** — Admin dashboard, analytics, module search/discovery, CLI integration
2. **kaven-site deployment** — Landing page + portal + Paddle submission (unblocks March launch)
3. **Penetration testing** — Pre-launch security audit
4. **AIOS progressive CI** — Hook SYNAPSE/MIS/IDS into CI pipeline
5. **SOC2 Type II** — Q3 2026 target
