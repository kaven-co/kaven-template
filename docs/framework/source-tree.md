# Kaven Framework — Source Tree

> Referência canônica da estrutura de diretórios. Atualizado em: 2026-03-11.
> Carregado automaticamente pelo AIOX via `devLoadAlwaysFiles`.

---

## Estrutura Completa

```
kaven-framework/
├── apps/
│   ├── api/                          # Fastify Backend (porta 8000)
│   │   └── src/
│   │       ├── modules/              # 27 módulos de negócio
│   │       │   ├── app/              # Demo features (projects, tasks)
│   │       │   ├── audit/            # Audit logging
│   │       │   ├── auth/             # JWT + 2FA + password reset
│   │       │   ├── billing/          # Billing integrations
│   │       │   ├── checkout/         # Checkout flow
│   │       │   ├── currencies/       # Multi-currency support
│   │       │   ├── dashboard/        # Dashboard metrics
│   │       │   ├── export/           # Data export
│   │       │   ├── files/            # File upload + quotas
│   │       │   ├── grants/           # Capability grants
│   │       │   ├── invoices/         # Invoice generation
│   │       │   ├── notifications/    # In-app + email
│   │       │   ├── observability/    # Prometheus + Loki
│   │       │   ├── orders/           # Order processing
│   │       │   ├── plans/            # Plan definitions
│   │       │   ├── platform/         # Email config + integrations
│   │       │   ├── policies/         # Access restrictions
│   │       │   ├── products/         # Add-on products
│   │       │   ├── roles/            # RBAC
│   │       │   ├── security/         # 2FA + policies
│   │       │   ├── spaces/           # Workspace isolation
│   │       │   ├── subscriptions/    # Plan gating
│   │       │   ├── tenants/          # Multi-tenancy
│   │       │   ├── theme/            # Tenant theme customization
│   │       │   ├── usage/            # Usage tracking
│   │       │   ├── users/            # User CRUD + invites
│   │       │   └── webhooks/         # Webhook integrations
│   │       ├── shared/               # Utilitários internos da API
│   │       │   ├── middleware/       # auth, tenant, rbac, idor, feature-guard
│   │       │   ├── plugins/          # Fastify plugins registrados
│   │       │   ├── logger.ts         # Winston logger configurado
│   │       │   └── prisma.ts         # Singleton do Prisma client
│   │       └── main.ts               # Entry point da API
│   │
│   ├── admin/                        # Next.js Admin Panel (porta 3000)
│   │   └── src/
│   │       ├── app/                  # App Router (RSC por padrão)
│   │       │   ├── (auth)/           # Rotas de autenticação
│   │       │   ├── (dashboard)/      # Rotas protegidas do admin
│   │       │   └── layout.tsx        # Root layout
│   │       ├── components/           # Componentes do admin
│   │       ├── hooks/                # Custom hooks
│   │       ├── lib/                  # Utilitários (api client, auth helpers)
│   │       └── store/                # Zustand stores
│   │
│   ├── tenant/                       # Next.js Tenant App (porta 3001)
│   │   └── src/
│   │       ├── app/                  # App Router (RSC por padrão)
│   │       ├── components/           # Componentes do tenant
│   │       ├── hooks/                # Custom hooks
│   │       └── lib/                  # Utilitários
│   │
│   └── docs/                         # Nextra Docs (porta 3002)
│       └── pages/                    # MDX documentation pages
│
├── packages/
│   ├── database/                     # @kaven/database
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Schema principal (261 models, 183 enums)
│   │   │   ├── schema.base.prisma    # Core imutável
│   │   │   ├── schema.extended.prisma # Features customizáveis
│   │   │   ├── migrations/           # Histórico de migrations
│   │   │   └── seed.ts               # Seed de dados iniciais
│   │   └── package.json
│   │
│   ├── ui/                           # @kaven/ui-base (Design System)
│   │   ├── src/
│   │   │   ├── components/           # 97 componentes React + Tailwind
│   │   │   │   ├── atoms/            # Button, Input, Badge, etc.
│   │   │   │   ├── molecules/        # Card, Table, Form, etc.
│   │   │   │   └── organisms/        # Layout, Sidebar, DataTable, etc.
│   │   │   ├── tokens/               # CSS custom properties (Frost theme)
│   │   │   └── index.ts              # Entry point principal
│   │   ├── dist/                     # Build output (tsup)
│   │   └── package.json              # ESM exports: /, /lite, /tailwind-preset, /tokens.css
│   │
│   └── shared/                       # @kaven/shared
│       ├── src/
│       │   ├── schemas/              # Zod schemas compartilhados
│       │   ├── dtos/                 # Data Transfer Objects
│       │   └── constants/            # Constantes globais
│       └── package.json
│
├── docs/                             # Documentação do projeto
│   ├── framework/                    # Docs carregados pelo AIOX (devLoadAlwaysFiles)
│   │   ├── coding-standards.md       # Este arquivo + padrões de código
│   │   ├── tech-stack.md             # Stack tecnológica
│   │   └── source-tree.md            # Este arquivo
│   ├── architecture/                 # Arquitetura técnica
│   │   ├── system-architecture.md    # Visão geral do sistema
│   │   ├── database-schema.md        # Schema do banco de dados
│   │   ├── rls-middleware.md         # Row-level security
│   │   └── admin-authorization.md    # Autorização no admin
│   ├── planning/                     # Planejamento e roadmap
│   │   ├── PRODUCTION-DEPLOY-PLAN.md # Plano de deploy (6 fases)
│   │   ├── MASTER-COMPLETION-PLAN.md # Histórico de sprints
│   │   └── stories/                  # Sprint stories
│   ├── stories/                      # Story-driven dev (AIOX)
│   └── prd/                          # Product Requirements Documents
│
├── infra/
│   └── monitoring/                   # PLG Stack config
│       ├── prometheus/               # prometheus.yml + alerting rules
│       ├── loki/                     # loki-config.yaml
│       ├── grafana/                  # Dashboards JSON (4+)
│       └── promtail/                 # promtail.yaml
│
├── scripts/                          # Scripts de automação
│   └── cleanup-dev.sh                # Limpeza de ambiente dev
│
├── squads/                           # AIOX Squads instalados
│   ├── kaven-squad/                  # 10 agents + 26 tasks + 9 workflows
│   │   ├── agents/                   # Definições dos agents
│   │   ├── config/                   # coding-standards, tech-stack, source-tree
│   │   ├── tasks/                    # Task definitions (TASK-FORMAT-V1)
│   │   └── workflows/                # Workflow definitions
│   └── mmos-squad/                   # 48 minds + sistema de debate
│       ├── minds/                    # Mind clones
│       └── lib/                      # Python utilities
│
├── .aiox-core/                       # AIOX v5.0.3 core
│   ├── core-config.yaml              # Configuração principal do AIOX
│   ├── apps/
│   │   ├── dashboard-realtime/       # Next.js 16, porta 3000 (observabilidade)
│   │   └── monitor-server/           # Bun+SQLite+WebSocket, porta 4001
│   └── data/                         # Dados do AIOX (entity-registry, etc.)
│
├── .claude/                          # Claude Code config
│   ├── CLAUDE.md                     # Contexto do projeto
│   ├── rules/                        # Regras de operação
│   └── skills/                       # Skills disponíveis
│
├── .aiox/                            # Estado do AIOX no projeto
│   └── project-status.yaml           # Status atual do projeto
│
├── .ai/                              # Decision logs (AIOX IDS)
│   ├── decision-logs-index.md        # Índice de ADRs
│   └── debug-log.md                  # Debug log do AIOX
│
├── docker-compose.yml                # 13 containers (dev local)
├── turbo.json                        # Turborepo config
├── package.json                      # Root workspace (pnpm)
├── pnpm-workspace.yaml               # Workspace definition
└── .env.example                      # Variáveis de ambiente necessárias
```

---

## Módulos da API — Estrutura Interna

Cada módulo segue o padrão:

```
modules/{nome}/
├── {nome}.routes.ts        # Registra rotas + preHandlers
├── {nome}.controller.ts    # Request/Response handling
├── {nome}.service.ts       # Lógica de negócio (tenantId sempre presente)
├── {nome}.schema.ts        # Zod schemas de validação
├── {nome}.types.ts         # Tipos TypeScript do módulo
└── __tests__/
    └── {nome}.service.spec.ts
```

---

## Portas de Desenvolvimento

| Serviço | Porta |
|---|---|
| API (Fastify) | 8000 |
| Admin (Next.js) | 3000 |
| Tenant (Next.js) | 3001 |
| Docs (Nextra) | 3002 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Prometheus | 9090 |
| Grafana | 3004 |
| Loki | 3100 |
| pgAdmin | 5050 |
| AIOX Dashboard | 3000 (container separado) |
| AIOX Monitor | 4001 |

---

## Imports — Convenções

```typescript
// Correto — import absoluto via tsconfig paths
import { InvoiceService } from '@/modules/invoices/invoice.service'
import { authMiddleware } from '@/shared/middleware/auth.middleware'
import type { CreateInvoiceDto } from '@/modules/invoices/invoice.types'

// Proibido — import relativo com ..
import { InvoiceService } from '../../../modules/invoices/invoice.service'
```

---

## Variáveis de Ambiente Críticas

```bash
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# Auth
JWT_SECRET=...
JWT_REFRESH_SECRET=...

# Email
EMAIL_PROVIDER=resend  # resend | ses | postmark | smtp
RESEND_API_KEY=...

# Pagamentos
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Observabilidade
LOG_LEVEL=debug  # debug | info | warn | error | silent
SENTRY_DSN=...

# Telemetria AIOX
KAVEN_TELEMETRY=1  # 0 para opt-out
```

Ver `.env.example` para lista completa.
