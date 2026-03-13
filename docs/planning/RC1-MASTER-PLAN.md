# 🚀 KAVEN RC1 MASTER PLAN — Ecossistema Completo

> **Gerado:** 2026-02-16 | **Target:** v1.0.0-rc1 | **Launch:** March 31, 2026
> **Autor:** Orion (AIOS Master Orchestrator)

---

## 📐 Visão Geral da Arquitetura de Execução

```
                    ┌─────────────────────┐
                    │   EPIC 1: MARKETPLACE│ ← PRIORIDADE MÁXIMA
                    │   (kaven-marketplace)│
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                 ▼
    ┌─────────────┐  ┌──────────────┐  ┌──────────────┐
    │ EPIC 2: CLI │  │ EPIC 3: SITE │  │EPIC 4: UPGRADE│
    │(kaven-cli)  │  │(kaven-site)  │  │(framework)    │
    └─────────────┘  └──────────────┘  └───────────────┘
```

**Dependências críticas:**
- Epic 2 (CLI) depende de Epic 1 (Marketplace API) para auth real e download
  - C1 (Auth) depende de M1 completo
  - C2 (Init) depende de C1 + M2.2 (download tokens)
- Epic 4 (Upgrade Flow) depende de Epic 1 (Paddle webhooks → licenças)
  - F1 depende de M2.5 (Paddle checkout)
- Epic 3 (Site) depende de Epic 2 (CLI) para dogfooding
  - S1 (Landing Page) pode rodar em paralelo
  - S2 (Customer Portal) depende de M2 (Paddle) + C2 (CLI para instruções)

**CRITICAL PATH para Launch:**
```
M1 (Auth) → M2 (Licensing) → M3 (Analytics)
            ↓
         C1 (CLI Auth) → C2 (kaven init)
                         ↓
                    S1 (Landing) → S2 (Portal) → LAUNCH
```

**DOGFOODING REQUIREMENT:**
kaven-site será construído USANDO `kaven init` + `kaven marketplace install`.
Isso prova que CLI funciona antes de vender para customers.

---

## 🎯 EPIC 1: MARKETPLACE API — O Hub Central

**Repo:** `kaven-marketplace` (`/home/bychrisr/projects/work/kaven/kaven-marketplace`)
**Estado atual:** Foundation (Fastify + Prisma + Docker), device code parcial, 0 endpoints de módulos
**Objetivo:** API completa para registro, licenciamento e distribuição de módulos

### Sprint M1 — Auth & Core API (Fundação)

> **Agents paralelos:** @dev (API), @data-engineer (DB), @qa (testes)
> **Foco:** Completar auth device code + CRUD de módulos

| # | Story | Descrição | Agent | Deps |
|---|-------|-----------|-------|------|
| M1.1 | **Device Code Approval Endpoint** | Implementar `GET /auth/device/:userCode` e `POST /auth/device/:userCode/approve`. Hoje nada marca device code como APPROVED — fluxo CLI está quebrado. | @dev | — |
| M1.2 | **GitHub OAuth Provider** | Integrar GitHub OAuth para autenticação web. Schema já tem `githubId` no User. Usar `@fastify/oauth2`. | @dev | — |
| M1.3 | **JWT Refresh Token Flow** | Implementar refresh token rotation, token expiry, e middleware `authenticate` completo com role-based access. | @dev | M1.1 |
| M1.4 | **Error Handling RFC 6749** | Padronizar todas as respostas de erro seguindo RFC 6749 (`error`, `error_description`, `error_uri`). Criar error factory. | @dev | — |
| M1.5 | **Database Migrations** | Gerar migrations Prisma para production (sair de `db push`). Adicionar indexes de performance. | @data-engineer | — |
| M1.6 | **Module CRUD Endpoints** | `GET /modules` (list + pagination + filter), `GET /modules/:slug` (detail), `POST /modules` (admin create), `PUT /modules/:slug` (update). | @dev | M1.5 |
| M1.7 | **Release Management** | `POST /modules/:id/releases` (upload new version), `GET /modules/:slug/versions` (list). Incluir validação semver. | @dev | M1.6 |
| M1.8 | **Input Validation Layer** | Zod schemas em todas as rotas. Request/response validation. Sanitização de inputs. | @dev | M1.6 |
| M1.9 | **Sprint M1 Test Suite** | Testes unitários para AuthService, ModuleService. Integration tests para todas as rotas. Minimum 80% coverage. | @qa | M1.1-M1.8 |

---

### Sprint M2 — Licensing, Downloads & Payments

> **Agents paralelos:** @dev (API), @architect (Paddle), @qa (testes), @devops (storage)
> **Foco:** Sistema de licenças, download seguro, integração Paddle

| # | Story | Descrição | Agent | Deps |
|---|-------|-----------|-------|------|
| M2.1 | **License CRUD & Validation** | `GET /licenses` (user), `POST /licenses/validate` (check), `POST /licenses/:id/revoke` (admin). Enforcement de tier (STARTER/COMPLETE/PRO). | @dev | M1.3 |
| M2.2 | **Download Token System** | Tokens temporários (15min TTL) para download seguro. `POST /download-tokens` → `GET /artifacts/:token`. Modelo DownloadToken no Prisma. | @dev | M2.1 |
| M2.3 | **Artifact Storage (S3/MinIO)** | Integrar upload de módulos para S3 (ou MinIO local em dev). Assinatura Ed25519 de artefatos. Configurar presigned URLs. | @devops | — |
| M2.4 | **Paddle Webhook Handler** | `POST /webhooks/paddle` — verificar assinatura, processar eventos (subscription_created, payment_succeeded, subscription_cancelled). Auto-criar licenças. | @architect | M2.1 |
| M2.5 | **Paddle Checkout Integration** | Gerar checkout links para cada tier. Mapear Paddle product IDs para Plans do framework. Redirect flow após pagamento. | @architect | M2.4 |
| M2.6 | **License Key Generation** | Algoritmo de geração de chaves (format: `KAVEN-{TIER}-{RANDOM}-{CHECK}`). Validação de checksum. Lookup por key. | @dev | M2.1 |
| M2.7 | **Rate Limiting & Throttling** | Rate limit por IP (auth endpoints: 10/min), por user (download: 50/h), por token (polling: 1/5s). Usar Redis. | @dev | — |
| M2.8 | **Redis Caching Layer** | Cache para módulos populares, licenças validadas, sessions. TTL strategy. Redis já está no docker-compose. | @dev | M2.1 |
| M2.9 | **Sprint M2 Test Suite** | Testes de licenças, downloads, Paddle webhooks mock, rate limiting. Integration tests E2E com Docker. | @qa | M2.1-M2.8 |

---

### Sprint M3 — Search, Analytics & Hardening

> **Agents paralelos:** @dev (search/analytics), @qa (security), @devops (observability)
> **Foco:** Busca de módulos, métricas, segurança

| # | Story | Descrição | Agent | Deps |
|---|-------|-----------|-------|------|
| M3.1 | **Module Search & Discovery** | `GET /search?q=payments` full-text search via PostgreSQL `tsvector`. Filtros por categoria, tier, popularidade. | @dev | M1.6 |
| M3.2 | **Installation Tracking** | `POST /installations` — registrar cada instalação. Dashboard analytics: installs/day, módulos populares, churn. | @dev | M2.2 |
| M3.3 | **Audit Logging** | Log structured de todas as operações sensíveis (license create/revoke, module publish, download). Compliance-ready. | @dev | — |
| M3.4 | **OpenAPI Documentation** | Gerar docs automaticamente via Fastify + Zod. Swagger UI em `/docs`. Export OpenAPI spec. | @dev | M1.6 |
| M3.5 | **Security Hardening** | CORS config, Helmet, CSP headers, input sanitization audit, SQL injection prevention, dependency audit. | @qa | — |
| M3.6 | **Structured Logging** | Pino logger com correlation IDs, request tracing, error stack formatting. Log level por ambiente. | @devops | — |
| M3.7 | **Health & Readiness Probes** | `GET /health` (liveness), `GET /ready` (readiness — checks DB, Redis, S3). Para Kubernetes/Docker. | @devops | — |
| M3.8 | **Sprint M3 Test Suite** | Security tests (OWASP top 10), search accuracy tests, load tests básicos. | @qa | M3.1-M3.7 |

---

## 🎯 EPIC 2: CLI — Integração Real com Marketplace

**Repo:** `kaven-cli` (`/home/bychrisr/projects/work/kaven/kaven-cli`)
**Estado atual:** Module add/remove funcional localmente, auth e marketplace 100% MOCK
**Objetivo:** Substituir todos os mocks por integração real

### Sprint C1 — Auth Real & Marketplace Client

> **Agents paralelos:** @dev (CLI), @qa (testes)
> **Depende de:** Sprint M1 completo (auth endpoints existem)

| # | Story | Descrição | Agent | Deps |
|---|-------|-----------|-------|------|
| C1.1 | **Real Device Code Flow** | Substituir mock em `login.ts`. Chamar `POST /auth/device-code` real, abrir browser para activation, poll com backoff. | @dev | M1.1 |
| C1.2 | **Real MarketplaceClient** | Substituir mock em `MarketplaceClient.ts`. HTTP client (got/undici) com retry, timeout, error handling. Configurável via `~/.kaven/config.json`. | @dev | M1.6 |
| C1.3 | **Token Management** | JWT decode real, refresh automático, token expiry handling. Secure storage com keytar (ou fallback filesystem). | @dev | M1.3 |
| C1.4 | **Marketplace List Real** | `kaven marketplace list` busca módulos reais da API. Pagination, filtros, output formatado em tabela. | @dev | C1.2 |
| C1.5 | **Marketplace Install Real** | `kaven marketplace install <slug>` — verifica licença, gera download token, baixa artefato, extrai, delega para moduleAdd. | @dev | C1.2, M2.2 |
| C1.6 | **License Verification** | Antes de instalar, verificar se user tem licença válida para o módulo. Mensagem clara se tier insuficiente. | @dev | C1.5, M2.1 |
| C1.7 | **PostInstall/PreRemove Scripts** | Executar scripts definidos no manifest (`pnpm db:migrate`, etc). Sandbox com timeout. Capture output. | @dev | — |
| C1.8 | **Environment Variables Injection** | Prompt interativo para vars de `.env` requeridas pelo módulo. Template injection no `.env` do projeto. | @dev | — |
| C1.9 | **Sprint C1 Test Suite** | Mock do marketplace API (MSW/nock), test auth flow, test install E2E com projeto fixture. | @qa | C1.1-C1.8 |

---

### Sprint C2 — UX, Init & Publishing

> **Agents paralelos:** @dev (CLI), @qa (testes), @ux-design-expert (UX)
> **Foco:** Experiência do developer, `kaven init`, publicação de módulos

| # | Story | Descrição | Agent | Deps |
|---|-------|-----------|-------|------|
| C2.1 | **`kaven init` Command** | Bootstrapa novo projeto Kaven a partir do framework. Clone seletivo, configuração interativa (nome, DB, tier), setup automatizado. | @dev | — |
| C2.2 | **`kaven module publish`** | Publica módulo para o marketplace. Valida manifest, gera assinatura, upload para S3 via marketplace API. | @dev | M2.3 |
| C2.3 | **`kaven upgrade`** | Upgrade de tier (Starter→Complete→Pro). Redirect para Paddle checkout. Poll status até confirmação. | @dev | M2.5 |
| C2.4 | **`kaven doctor` Enhanced** | Verificação completa: anchors, markers, dependencies, schema merge, env vars, licença ativa. `--fix` funcional. | @dev | C1.6 |
| C2.5 | **Interactive Module Browser** | `kaven marketplace browse` — interface TUI com lista navegável, detalhes, install direto. Usar `ink` ou `prompts`. | @dev | C1.4 |
| C2.6 | **Offline Mode** | Cache local de manifests. Detectar quando offline, usar cache. Sync quando reconectar. | @dev | C1.2 |
| C2.7 | **CLI Documentation** | Help text completo em todos os comandos. `kaven --help` detalhado. Man pages. | @dev | C2.1-C2.6 |
| C2.8 | **Sprint C2 Test Suite** | Test init flow com temp directories, test publish flow com mock S3, test upgrade flow. | @qa | C2.1-C2.7 |

---

## 🎯 EPIC 3: KAVEN SITE — Marketing & Customer Portal

**Repo:** `kaven-site` (`/home/bychrisr/projects/work/kaven/kaven-site`)
**Estado atual:** Scaffold (2 commits)
**Objetivo:** Landing page + portal do cliente + docs gateadas

### Sprint S1 — Landing Page MVP

> **Agents paralelos:** @dev (frontend), @ux-design-expert (design)
> **DEPENDE DE:** C2.1 (`kaven init`) — kaven-site será construído VIA CLI (dogfooding)
> **BLOQUEADOR:** Não pode iniciar até CLI C2 completo

| # | Story | Descrição | Agent | Deps |
|---|-------|-----------|-------|------|
| S1.1 | **Landing Page Hero** | Hero section com value prop, CTA "Get Started", pricing preview. Next.js App Router + Tailwind. | @dev | — |
| S1.2 | **Pricing Page** | 3 tiers (Starter/Complete/Pro) com feature comparison matrix. CTAs linkam para Paddle checkout. | @dev | — |
| S1.3 | **Features Showcase** | Página de features com screenshots/demos. 22+ features organizadas por categoria. | @dev | — |
| S1.4 | **Documentation Hub** | Docs públicas (getting started, architecture). Docs gateadas (API reference, advanced). Usando Nextra ou MDX. | @dev | — |
| S1.5 | **SEO & Performance** | Meta tags, Open Graph, sitemap, robots.txt. Core Web Vitals otimizados. | @dev | S1.1-S1.4 |
| S1.6 | **Deploy Pipeline** | Vercel ou Cloudflare Pages. Environments (preview, production). Custom domain. | @devops | S1.1 |

### Sprint S2 — Customer Portal

> **Depende de:** Sprint M2 (Paddle + licenças) + C2 (CLI para instruções de instalação)

| # | Story | Descrição | Agent | Deps |
|---|-------|-----------|-------|------|
| S2.1 | **Auth Portal** | Login com GitHub OAuth. Session management. | @dev | M1.2 |
| S2.2 | **License Dashboard** | Visualizar licenças ativas, tier, expiração. Download links. | @dev | M2.1 |
| S2.3 | **Billing Management** | Visualizar faturas, upgrade/downgrade tier. Integração Paddle portal. | @dev | M2.5, C2.3 |
| S2.4 | **Module Discovery** | Browse de módulos disponíveis pelo site. Detalhes, install instructions via CLI. | @dev | M1.6, C2.1 |

---

## 🎯 EPIC 4: FRAMEWORK — Upgrade Flow & Polish Final

**Repo:** `kaven-framework`
**Objetivo:** Integrar último tech debt item + preparar para RC1

### Sprint F1 — Upgrade Flow & RC1 Tag

> **Depende de:** Sprint M2 (Paddle checkout links)

| # | Story | Descrição | Agent | Deps |
|---|-------|-----------|-------|------|
| F1.1 | **Upgrade Button Integration** | Botão "Upgrade" na página de planos dispara Paddle checkout modal. Recebe callback de sucesso. | @dev | M2.5 |
| F1.2 | **Plan Change Webhook Handler** | Receber webhook Paddle no framework quando tenant faz upgrade. Atualizar subscription + feature limits. | @dev | M2.4 |
| F1.3 | **Usage Limit Enforcement** | Quando tenant atinge limite, mostrar upgrade prompt com comparação de planos. Soft block (warning → hard block). | @dev | F1.1 |
| F1.4 | **Payments Module Package** | Extrair código de pagamentos como módulo instalável. Criar `module.json` com manifest completo para marketplace. | @dev | M1.7 |
| F1.5 | **Framework v1.0.0-rc1 Tag** | Validar todos os testes (959+), rodar full CI, tag release, generate changelog. | @devops | F1.1-F1.4 |

---

## 📅 Cronograma de Sprints & Paralelização

```
Week 1:  Sprint M1 (Marketplace Auth & Core)
         ├── @dev-1: M1.1 + M1.2 + M1.3 (auth endpoints)
         ├── @dev-2: M1.4 + M1.6 + M1.7 (error handling + module CRUD)
         ├── @data-engineer: M1.5 (migrations)
         └── @qa: M1.8 + M1.9 (validation + tests) — final da semana

Week 2:  Sprint M2 (Licensing & Payments) ║ Sprint C1 (CLI Auth Real)
         ├── @dev-1: M2.1 + M2.2 + M2.6 (licenses + downloads)
         ├── @dev-2: M2.4 + M2.5 (Paddle integration)
         ├── @dev-3: C1.1 + C1.2 + C1.3 (CLI auth real)
         ├── @devops: M2.3 (S3 storage)
         └── @qa: M2.9 + C1.9 (tests)

Week 3:  Sprint M3 (Hardening) ║ Sprint C2 (CLI UX) ║ Sprint S1 (Site)
         ├── @dev-1: M3.1 + M3.2 (search + analytics)
         ├── @dev-2: C2.1 + C2.2 + C2.3 (kaven init + publish + upgrade)
         ├── @dev-3: S1.1 + S1.2 + S1.3 (landing page)
         ├── @qa: M3.5 + M3.8 (security + tests)
         └── @devops: M3.6 + M3.7 + S1.6 (logging + deploy)

Week 4:  Sprint F1 (Framework Upgrade) ║ Sprint S2 (Portal) ║ Polish
         ├── @dev-1: F1.1 + F1.2 + F1.3 (upgrade flow)
         ├── @dev-2: F1.4 (payments module package)
         ├── @dev-3: S2.1 + S2.2 + S2.3 (customer portal)
         ├── @qa: Full regression + security audit
         └── @devops: F1.5 (RC1 tag + release)
```

---

## 📊 Métricas de Sucesso RC1

| Critério | Target |
|----------|--------|
| **Marketplace testes** | 80%+ coverage, 0 failures |
| **CLI testes** | 70%+ coverage, E2E passing |
| **Framework testes** | 959+ (manter 0 failures) |
| **Marketplace endpoints** | 15+ rotas funcionais |
| **CLI commands** | 10+ comandos reais (não mock) |
| **Site pages** | Landing + Pricing + Docs + Portal |
| **Security** | OWASP top 10 mitigated |
| **Documentation** | OpenAPI spec + CLI help + Getting Started |

---

## 🔑 Decisões Tomadas (2026-02-16)

| # | Decisão | Resolução |
|---|---------|-----------|
| D1 | **Payment Gateway** | **Paddle principal** para kaven-site e marketplace. **Stripe ready** como opção para clientes que já possuem keys. Keys já disponíveis para ambos. |
| D2 | **Artifact Storage** | **AWS S3** — já usam AWS (SES configurado). Presigned URLs + CloudFront CDN. MinIO para dev local. |
| D3 | **Site Framework** | Next.js (dogfooding do próprio Kaven framework) |
| D4 | **`kaven init` Source** | **Clone framework completo com demos**. Demos permanecem para o dev entender o fluxo end-to-end. Instruções de remoção documentadas, não automáticas. |
| D5 | **Module Pricing** | **Híbrido** — Módulos oficiais Kaven por tier (Starter=core, Complete=todos, Pro=todos+publish). Módulos community com preço livre e revenue share. |

---

## 📁 Estrutura de Stories

Cada story será criada em:
```
docs/planning/stories/
├── epic-1-marketplace/
│   ├── sprint-m1/
│   │   ├── M1.1-device-code-approval.md
│   │   ├── M1.2-github-oauth.md
│   │   └── ...
│   ├── sprint-m2/
│   └── sprint-m3/
├── epic-2-cli/
│   ├── sprint-c1/
│   └── sprint-c2/
├── epic-3-site/
│   ├── sprint-s1/
│   └── sprint-s2/
└── epic-4-framework/
    └── sprint-f1/
```

---

*Plano gerado por Orion (AIOS Master Orchestrator) — 2026-02-16*
*Baseado em análise completa dos codebases: kaven-marketplace, kaven-cli, kaven-framework*
