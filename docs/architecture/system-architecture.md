# KAVEN FRAMEWORK - SYSTEM ARCHITECTURE

**Date:** 2026-04-21
**Version:** v1.1.0-alpha (Prisma 7 Consolidation)
**Analyst:** Specialized Architect Agent (Chronicle Sync)

---

## 📋 EXECUTIVE SUMMARY

O **Kaven Framework** é uma plataforma SaaS **enterprise-grade, multi-tenant** construída em Fastify (API) + Next.js 16 App Router (Admin e Tenant Apps). A arquitetura implementa padrões modernos de engenharia com foco em:

1. **Multi-tenancy nativo** - Isolamento de dados via tenantId com middleware de detecção automática e suporte a Billing Accounts (F2.4)
2. **Segurança em camadas** - JWT + Refresh Tokens, RBAC, Capabilities, Policies, 2FA/MFA
3. **Observabilidade enterprise** - Stack PLG (Prometheus/Loki/Grafana) com métricas de negócio
4. **Monetização completa** - Planos, produtos, subscriptions, pagamentos (Stripe/PIX)
5. **Qualidade garantida** - ~2100+ testes, 136 test files, quality gates stritos

**Status Atual:** v1.1.0-alpha LIVE — Consolidação do Prisma 7 e Billing Accounts (Epic F2.4).

---

## 🏗️ STACK TÉCNICO COMPLETO

### Backend - Fastify API

| Componente | Versão | Propósito |
|-----------|--------|----------|
| **Fastify** | 5.8.5 | Framework HTTP performance (30k req/s) |
| **Prisma** | 7.0.0 | ORM multi-tenant com adapters Neon/Serverless |
| **PostgreSQL** | 17-Alpine | Database principal com JSONB |
| **Redis** | 7-Alpine | Cache + Job Queue (BullMQ) |
| **JWT (jose)** | 6.2.2 | Autenticação stateless |
| **Bcrypt** | 6.0.0 | Hashing seguro de senhas |
| **Zod** | 4.2.1 | Validação schema TypeScript-first |
| **Winston** | 3.19.0 | Logging estruturado |
| **Sentry** | 10.48.0 | Error tracking em produção |

**Plugins Fastify Ativados:**
- `@fastify/cors` - CORS configurável
- `@fastify/helmet` - Headers de segurança
- `@fastify/rate-limit` - Rate limiting por IP
- `@fastify/multipart` - Upload de arquivos
- `@fastify/static` - Servir assets estáticos
- `@fastify/swagger` + `@fastify/swagger-ui` - Documentação OpenAPI automática

### Frontend - Next.js 16 App Router

| App | Propósito | Tecnologias |
|-----|-----------|-------------|
| **Admin** (porta 3000) | Painel administrativo da plataforma | Next.js 16, React 19, Radix UI, TailwindCSS 4 |
| **Tenant** (porta 3001) | Aplicação multi-tenant dos clientes | Next.js 16, React 19, Radix UI, TailwindCSS 4 |
| **Docs** (porta 3002) | Documentação do framework | Nextra, MDX, Pagefind search |

**Bibliotecas Compartilhadas (ambos Admin/Tenant):**
- `@tanstack/react-query` - Data fetching + cache
- `@tanstack/react-table` - Tabelas avançadas
- `@hookform/resolvers` - Validação de formulários
- `react-hook-form` - Gerenciamento de estado de forms
- `next-auth` - Autenticação via sessão
- `next-intl` - Internacionalização (i18n)
- `zustand` - State management leve
- `axios` - HTTP client

### Monorepo - Turborepo + pnpm

```
kaven-framework/
├── apps/
│   ├── api/                    # Fastify backend (porta 8000)
│   ├── admin/                  # Next.js Admin Panel (porta 3000)
│   ├── tenant/                 # Next.js Tenant App (porta 3001)
│   └── docs/                   # Nextra Docs (porta 3002)
├── packages/
│   ├── database/               # Prisma ORM + Migrations (Prisma 7)
│   └── shared/                 # Zod schemas, DTOs, constants
├── infra/
│   └── monitoring/             # Prometheus, Grafana, Loki configs
├── scripts/                    # Automação (.agent/)
└── docker-compose.yml          # 13 containers (DB, Redis, Monitoring, etc)
```

---

## 📊 ESTRUTURA DO BANCO DE DADOS (PRISMA)

### Schema Overview

- **Total de Models:** 262 modelos Prisma
- **Total de Enums:** 184 tipos enumerados
- **Arquivo Principal:** `schema.extended.prisma` (source) → `schema.prisma` (gerado)
- **Estrutura:** `schema.base.prisma` (core imutável) + `schema.extended.prisma` (source completo) → `schema.prisma` (gerado automaticamente via merge)

### Modelos Críticos (Multi-tenancy)

```
CORE (Segurança & Tenancy):
├── Tenant              # ID + slug + domain (detecção automática)
├── BillingAccount      # Multi-workspace ownership (F2.4)
├── User                # Email único + tenantId (soft delete)
├── RefreshToken        # JWT refresh + expiração
├── TenantInvite        # Convites de tenant com roles

SEGURANÇA & AUTORIZAÇÃO:
├── Capability          # Granular permissions (ex: invoices.create)
├── Grant               # Mapping user -> capabilities
├── GrantRequest        # Workflow de aprovação de permissions
├── Policy              # Restrições (MFA, IP, tempo, geo)
├── SecurityAuditLog    # Logs de eventos sensíveis
├── ImpersonationSession # Auditoria de impersonação

MONETIZAÇÃO:
├── Subscription        # Planos ativos + status
├── Plan                # Definição de planos (Starter, Complete, Pro)
├── PlanFeature         # Features por plano
├── Product             # Add-ons (one-time purchases)
├── Price               # Preços em múltiplas moedas
├── Invoice             # Faturas geradas
├── Order               # Pedidos processados
├── Payment             # Histórico de pagamentos
├── UsageRecord         # Tracking de uso (gating)

INFRAESTRUTURA:
├── EmailEvent          # Bounce, complaint, open, click tracking
├── EmailTemplate       # Templates Handlebars
├── EmailQueue          # Fila de emails transacionais
├── AuditLog            # Logs gerais de ações
├── File                # Upload de arquivos com quotas
├── WebhookEvent        # Events para webhooks

COLABORAÇÃO:
├── Space               # Espaços de trabalho isolados
├── UserSpace           # Membership em spaces
├── SpaceRole           # Roles customizados por space
├── Project             # Demo feature (CRM/kanban)
├── Task                # Demo feature (Tasks)
```

### Multi-Tenancy Implementation

**Todas as tabelas de negócio incluem `tenantId`:**
```prisma
model Invoice {
  id        String   @id @default(uuid())
  tenantId  String   // OBRIGATÓRIO: isolamento de dados
  tenant    Tenant   @relation(fields: [tenantId], references: [id])

  @@index([tenantId])  // Performance de queries
}
```

**Isolamento garantido via:**
1. Middleware `tenantMiddleware` detecta tenantId (subdomain/header/path)
2. Injectado em `request.tenantContext`
3. Todos os services filtram por `tenantId` na WHERE clause
4. Row-level security via Prisma (sem RLS nativo do DB)

---

## 🏛️ API STRUCTURE (apps/api/)

### Modules (50 total)

```
apps/api/src/modules/
├── admin/                  # Admin panel routes
├── ads/                    # Ads attribution (Meta CAPI, GA4)
├── ai/                     # AI features
├── app/                    # App-level (projects, tasks)
├── audit/                  # Audit logging
├── auth/                   # JWT + 2FA + Password Reset
├── billing/                # Billing core
├── billing-accounts/       # Multi-workspace ownership (F2.4)
├── case-matter/            # Case & matter management
├── checkout/               # Checkout flow
├── clients/                # Client management
├── compliance/             # Compliance & regulatory
├── content-ops/            # Content operations
├── currencies/             # Multi-currency support
├── dashboard/              # Dashboard analytics
├── documents/              # Document management
├── export/                 # Data export
├── files/                  # File upload with quotas
├── finance/                # Finance module
├── finances-bi/            # Finance BI analytics
├── governance/             # Governance & policies
├── grants/                 # Capability grants
├── inventory/              # Inventory management
├── invoices/               # Invoice generation
├── legal/                  # Legal module
├── marketing/              # Marketing & CRM
├── notifications/          # In-app + Email
├── observability/          # Prometheus + Loki
├── operations/             # Operations management
├── orders/                 # Order processing
├── people/                 # People & HR
├── plans/                  # Plans CRUD
├── platform/               # Email integration + Config
├── policies/               # Access restrictions
├── products/               # Products CRUD
├── projects/               # Project management
├── property-management/    # Property management
├── remote-work/            # Remote work features
├── roles/                  # RBAC
├── saas-ops/               # SaaS operations
├── security/               # 2FA + Policies
├── service-tokens/         # Service tokens (D2.1)
├── spaces/                 # Workspace isolation
├── subscriptions/          # Gating logic
├── team-collaboration/     # Team collaboration
├── tenants/                # Multi-tenancy
├── theme/                  # Theme customization
├── usage/                  # Usage tracking
├── users/                  # CRUD + Invites
└── webhooks/               # Webhook integrations
```

### Middleware Chain

**Ordem de execução (Fastify preHandler hooks):**

```
1. tenantMiddleware       → extrai tenantId
2. authMiddleware         → valida JWT
3. rbac.middleware        → valida role
4. requireCapability      → valida capabilities
5. featureGuard           → valida feature flags
6. idorMiddleware         → previne IDOR
7. [ROUTE HANDLER]
8. [RESPONSE]
9. metricsMiddleware      → registra latency
```

---

## 📋 FEATURES IMPLEMENTADAS (28 TOTAL)

### 1. AUTHENTICATION & SECURITY ✅

- JWT + Refresh Tokens (100% tested)
- Password Reset Flow
- Email Verification
- 2FA (TOTP)
- Backup Codes
- Security Requests (100% tested)
- Account Lockout
- Session Tracking
- Impersonation Audit (100% tested)

### 2. MULTI-TENANCY & SPACES ✅

- Tenant CRUD (100% tested)
- Subdomain Detection
- Tenant Slugs
- Spaces (Workspaces)
- Space Membership
- Space Roles
- Soft Delete Tenants

### 3. AUTHORIZATION & PERMISSIONS ✅

- RBAC (Roles: SUPER_ADMIN, TENANT_ADMIN, USER)
- Capabilities (Granular permissions)
- Grants (Assign Capabilities)
- Grant Approval Workflow
- Policies (10+ types)
- Policy Enforcement (DENY/ALLOW/WARN)
- User Masking

### 4. MONETIZATION & BILLING ✅

- Plans (Starter/Complete/Pro)
- Plan Features
- Products (Add-ons) (100% tested)
- Product Effects
- Feature Gating (100% tested)
- Usage Tracking
- Subscriptions
- Invoices (100% tested)
- Orders (100% tested)
- Payments
- Multi-currency (30+ currencies)

### 5. PAYMENTS INTEGRATION ✅

- Stripe Integration
- Paddle Integration
- PagueBit/PIX (Brazil)
- Webhook Handling (HMAC validation)

### 6. EMAIL INFRASTRUCTURE ✅

- Email Providers (Postmark, Resend, AWS SES, SMTP)
- Email Templates (Handlebars)
- Email Queue (BullMQ)
- Bounce Tracking
- Complaint Tracking
- Unsubscribe Tracking
- Transactional vs Marketing
- Email Metrics (100% tested)

### 7. NOTIFICATIONS ✅

- In-App Notifications (100% tested)
- Notification Preferences
- Notification Events

### 8. FILE MANAGEMENT ✅

- File Upload (100% tested)
- File Quotas
- MIME Type Validation
- Soft Delete Files

### 9. AUDIT & LOGGING ✅

- Audit Logs (100% tested)
- Security Audit Logs
- Capability Audits
- Grant Audits
- Impersonation Logs

### 10. OBSERVABILITY ✅

- Prometheus Metrics
- Loki Logging
- Grafana Dashboards (4+)
- Request Metrics
- Business Metrics (100% tested)
- Health Checks
- Distributed Tracing (Sentry)

---

## 🔐 MULTI-TENANCY ARCHITECTURE

### Tenant Detection

```typescript
// 3 métodos de detecção automática:
1. Subdomain: empresa1.app.com -> domain = "empresa1.app.com"
2. Header: X-Tenant-ID: uuid -> tenantId direto
3. Path: /tenants/empresa1/api/... -> slug "empresa1"

// Resultado em request.tenantContext:
{
  tenantId: string | null;
  tenantSlug: string | null;
  isSingleTenant: boolean;
}
```

### Isolation Layers

```
Layer 1 - Tenant Detection → tenantMiddleware
Layer 2 - JWT Validation → authMiddleware
Layer 3 - Role Check → rbac.middleware
Layer 4 - Capability Check → requireCapability
Layer 5 - Policy Enforcement → policyService
Layer 6 - Service Filtering → WHERE { tenantId }
Layer 7 - Audit Trail → auditService
```

---

## 🧪 TEST COVERAGE

| Categoria | Quantidade | Status |
|-----------|------------|--------|
| Total testes passando | ~2100+ | All passing |
| Spec Files (test files) | 136 | .spec.ts |
| Tech Debt resolvido | 42/42 | 100% ✅ |
| Sprints completos | 7/7 — 46/46 stories | ✅ |
| IDOR models protegidos | 33 | ✅ |
| Composite indexes | 42+ | ✅ |

### Serviços com cobertura extensiva (exemplos)

✅ auth.service.ts
✅ tenant.service.ts
✅ subscription.service.ts
✅ product.service.ts
✅ notification.service.ts
✅ file.service.ts
✅ audit.service.ts
✅ invite.service.ts
✅ business-metrics.service.ts
✅ security-request.service.ts
✅ authorization.service.ts
✅ + demais serviços dos 50 módulos

---

## ✅ TECHNICAL DEBT STATUS

**Tech Debt:** 42/42 itens resolvidos (100%) — verificado ao fim do Sprint 7.

Para histórico detalhado: `docs/prd/technical-debt.md`.

---

## 🎯 ARCHITECTURAL PATTERNS

### 1. Service Layer Pattern
```typescript
export class InvoiceService {
  static async create(data, tenantId) {
    // 1. Validation (Zod)
    // 2. Business logic
    // 3. Database write (tenantId always included)
    // 4. Audit log
    // 5. Return response
  }
}
```

### 2. Middleware Chain
```typescript
app.get('/api/invoices', {
  preHandler: [
    authMiddleware,
    tenantMiddleware,
    requireCapability('invoices.read'),
  ],
  handler: invoiceController.list
});
```

### 3. Feature Gating
```typescript
const canUse = await subscriptionService.canUseFeature(
  userId,
  'advanced_reports',
  tenantId
);

if (!canUse) {
  return reply.status(403).send({ error: 'Feature not available' });
}
```

---

## 📈 OBSERVABILITY - PLG STACK

### Prometheus (`:9090`)
- fastify_requests_total
- fastify_request_duration_ms
- subscription_active_count
- invoice_total_amount
- email_sent_count

### Loki (`:3100`)
- API access logs
- Application errors
- Database queries
- Email delivery events

### Grafana (`:3004`)
- System Overview Dashboard
- API Performance Dashboard
- Business Metrics Dashboard
- Email Metrics Dashboard
- Error Tracking Dashboard

---

## 🚀 DEPLOYMENT

### Docker Compose (13 containers)
- postgres:17-alpine
- redis:7-alpine
- pgadmin4
- prometheus
- alertmanager
- loki
- promtail
- grafana
- node-exporter
- kaven-api (manual)
- kaven-admin (manual)
- kaven-tenant (manual)
- kaven-docs (manual)

### Local URLs
- API: `http://localhost:8000`
- Admin: `http://localhost:3000`
- Tenant: `http://localhost:3001`
- Docs: `http://localhost:3002`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3004`

---

## ✅ CONCLUSIONS

### Strengths
✅ Solid architecture with clear separation of concerns
✅ Native multi-tenancy with automatic detection
✅ 7-layer security with audit trail
✅ ~2100+ tests passing, 42/42 tech debt items resolved
✅ Complete observability (PLG stack)
✅ Excellent DX (Turborepo, Docker, automation)
✅ LIVE em produção — admin.kaven.site + tenant.kaven.site

### Status Atual (2026-04-11)
- Framework v1.0.0-rc1 LIVE
- 50 API modules, 261 schema models, 183 enums
- Marketplace LIVE (marketplace.kaven.site, Cloud Run GCP kaven-prod)
- AIOX Integration completa (GAPs 1–8 resolvidos)
- Blocker principal: kaven-site Sprint S1 (landing page) pendente

---

**Report Compiled:** 2026-04-11
**Version:** v1.0.0-rc1 LIVE
**PRs mergeados:** #1–#93
