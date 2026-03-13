# Kaven Framework — Tech Stack

> Referência canônica da stack tecnológica. Atualizado em: 2026-03-11.
> Carregado automaticamente pelo AIOX via `devLoadAlwaysFiles`.

---

## Backend — Fastify API (`apps/api/`)

| Componente | Versão | Propósito |
|---|---|---|
| **Node.js** | 20 LTS | Runtime |
| **TypeScript** | ^5.3.3 | Linguagem (strict mode obrigatório) |
| **Fastify** | ^5.6.2 | Framework HTTP (~30k req/s) |
| **Prisma ORM** | ^5.22.0 | ORM + migrations (schema split) |
| **PostgreSQL** | 17-Alpine | Banco de dados principal (JSONB support) |
| **Redis** | 7-Alpine | Cache + Job Queue (BullMQ) |
| **Zod** | ^4.2.1 | Validação de schemas TypeScript-first |
| **jose** | ^6.1.3 | JWT stateless (autenticação) |
| **Winston** | ^3.19.0 | Logging estruturado |
| **Sentry** | ^10.32.1 | Error tracking em produção |
| **Vitest** | ^4.0.16 | Testes unitários (985 passando) |
| **Bcrypt** | ^6.0.0 | Hashing seguro de senhas |
| **BullMQ** | via Redis | Filas de jobs (email, webhooks) |
| **prom-client** | — | Métricas Prometheus |

### Plugins Fastify Ativos

| Plugin | Versão | Propósito |
|---|---|---|
| `@fastify/cors` | ^11.2.0 | CORS configurável |
| `@fastify/helmet` | — | Headers de segurança HTTP |
| `@fastify/rate-limit` | ^10.3.0 | Rate limiting por IP/tenant |
| `@fastify/multipart` | — | Upload de arquivos |
| `@fastify/static` | — | Servir assets estáticos |
| `@fastify/swagger` | — | Documentação OpenAPI automática |
| `@fastify/swagger-ui` | — | UI para Swagger |

---

## Frontend — Next.js Apps (`apps/admin/`, `apps/tenant/`)

| Componente | Versão | Propósito |
|---|---|---|
| **Next.js** | 16.1.5 | Framework React (App Router, RSC) |
| **React** | 19.2.3 | UI library |
| **TypeScript** | — | Linguagem (strict mode) |
| **Tailwind CSS** | ^4 | Estilização utility-first |
| **@kaven/ui-base** | workspace | Design System (97 components, Frost theme) |
| **@tanstack/react-query** | ^5.62.8 | Data fetching + cache |
| **@tanstack/react-table** | — | Tabelas avançadas |
| **zustand** | ^5.0.2 | State management leve |
| **next-auth** | ^4.24.13 | Autenticação via sessão |
| **next-intl** | — | Internacionalização (i18n) |
| **react-hook-form** | — | Gerenciamento de formulários |
| **@hookform/resolvers** | — | Validação de formulários (Zod) |
| **axios** | ^1.13.2 | HTTP client |
| **Zod** | ^4.2.1 | Validação compartilhada com backend |
| **Recharts** | — | Gráficos e dashboards |
| **Radix UI** | — | Primitivos de acessibilidade |

### Docs App (`apps/docs/`)

| Componente | Propósito |
|---|---|
| **Nextra** | Framework de documentação MDX |
| **Pagefind** | Search estático |
| **MDX** | Markdown + componentes React |

---

## Design System — `@kaven/ui-base`

| Item | Detalhe |
|---|---|
| **Monorepo source** | `packages/ui/` |
| **npm package** | `kaven-ui-base@0.1.0-alpha.1` |
| **Tema** | Frost (Amber/Geist/dark-first, sem glass) |
| **Componentes** | 97 React + Tailwind |
| **Subpaths** | `/lite`, `/tailwind-preset`, `/tokens.css` |
| **Formato** | ESM (.mjs) no monorepo, ESM+CJS no standalone |

---

## Packages Compartilhados (`packages/`)

| Package | Nome npm | Propósito |
|---|---|---|
| `packages/database/` | `@kaven/database` | Prisma client + migrations + seed |
| `packages/ui/` | `@kaven/ui-base` | Design System |
| `packages/shared/` | `@kaven/shared` | Zod schemas, DTOs, constants compartilhados |

---

## Monorepo & Tooling

| Ferramenta | Versão | Propósito |
|---|---|---|
| **pnpm** | — | Package manager (obrigatório — nunca npm/yarn) |
| **Turborepo** | — | Build system + cache (sempre usar `turbo run`) |
| **ESLint** | — | Linting |
| **Prettier** | — | Formatação |
| **tsup** | — | Build de packages (`packages/ui/`) |
| **GitHub Actions** | — | CI/CD |
| **Pre-commit hooks** | — | GPG + ESLint + secrets scan |
| **Pre-push hooks** | — | lint + typecheck + DS policies |

---

## Pagamentos

| Provedor | Uso |
|---|---|
| **Stripe** | Internacional (principal) |
| **Paddle** | Marketplace de módulos (MoR) |
| **PagueBit** | PIX/crypto (Brasil) |

---

## Observabilidade (PLG Stack)

| Componente | Porta | Propósito |
|---|---|---|
| **Prometheus** | :9090 | Métricas de aplicação |
| **Loki** | :3100 | Centralização de logs |
| **Grafana** | :3004 | Dashboards (4+ dashboards) |
| **Promtail** | — | Coleta de logs → Loki |
| **node-exporter** | — | Métricas do host |
| **Sentry** | cloud | Error tracking + tracing |

---

## Email

| Provedor | Status | Uso |
|---|---|---|
| **AWS SES** | Bloqueado (Trust & Safety) | Principal |
| **Resend.com** | Ativo (100/dia free) | Fallback atual |
| **Postmark** | Suportado | Alternativa |
| **SMTP** | Suportado | Fallback genérico |

---

## Deploy

| Serviço | Uso |
|---|---|
| **Google Cloud Run** | Marketplace API (kaven-marketplace) |
| **Vercel** | Admin + Tenant + Docs (Next.js) |
| **Neon PostgreSQL** | Banco de dados em produção (serverless) |
| **Upstash Redis** | Redis em produção (serverless, TLS) |
| **AWS S3** | Módulos do marketplace (artefatos) |
| **Cloudflare** | DNS + SSL (`marketplace.kaven.site`) |

---

## AIOX

| Item | Valor |
|---|---|
| **Versão** | v5.0.3 |
| **Squad principal** | kaven-squad (10 agents) |
| **Squad adicional** | mmos-squad (48 minds) |
| **Councils** | 5 (Design, Architecture, Product, Growth, Quality) |
| **Config** | `.aiox-core/core-config.yaml` |
