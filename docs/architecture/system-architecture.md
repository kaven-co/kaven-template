# KAVEN FRAMEWORK - SYSTEM ARCHITECTURE

**Date:** 2026-02-03
**Phase:** Brownfield Discovery - Phase 1
**Analyst:** Specialized Architect Agent

---

## 📋 EXECUTIVE SUMMARY

O **Kaven Framework** é uma plataforma SaaS **enterprise-grade, multi-tenant** construída em Fastify (API) + Next.js 14 App Router (Admin e Tenant Apps). A arquitetura implementa padrões modernos de engenharia com foco em:

1. **Multi-tenancy nativo** - Isolamento de dados via tenantId com middleware de detecção automática
2. **Segurança em camadas** - JWT + Refresh Tokens, RBAC, Capabilities, Policies, 2FA/MFA
3. **Observabilidade enterprise** - Stack PLG (Prometheus/Loki/Grafana) com métricas de negócio
4. **Monetização completa** - Planos, produtos, subscriptions, pagamentos (Stripe/Paddle/PIX)
5. **Qualidade garantida** - 32 testes unitários, 105+ casos de teste, quality gates stritos

**Status Atual:** Week 4 completa (28 features validadas), Week 5 em andamento (Marketplace + Landing)

---

## 🏗️ STACK TÉCNICO COMPLETO

### Backend - Fastify API

| Componente | Versão | Propósito |
|-----------|--------|----------|
| **Fastify** | 5.6.2 | Framework HTTP performance (30k req/s) |
| **Prisma** | 5.22.0 | ORM multi-tenant com migrations |
| **PostgreSQL** | 17-Alpine | Database principal com JSONB |
| **Redis** | 7-Alpine | Cache + Job Queue (BullMQ) |
| **JWT (jose)** | 6.1.3 | Autenticação stateless |
| **Bcrypt** | 6.0.0 | Hashing seguro de senhas |
| **Zod** | 4.2.1 | Validação schema TypeScript-first |
| **Winston** | 3.19.0 | Logging estruturado |
| **Sentry** | 10.32.1 | Error tracking em produção |
| **Prometheus** | via prom-client | Métricas de aplicação |

**Plugins Fastify Ativados:**
- `@fastify/cors` - CORS configurável
- `@fastify/helmet` - Headers de segurança
- `@fastify/rate-limit` - Rate limiting por IP
- `@fastify/multipart` - Upload de arquivos
- `@fastify/static` - Servir assets estáticos
- `@fastify/swagger` + `@fastify/swagger-ui` - Documentação OpenAPI automática

### Frontend - Next.js 14 App Router

| App | Propósito | Tecnologias |
|-----|-----------|-------------|
| **Admin** (porta 3000) | Painel administrativo da plataforma | Next.js 14, React 19, Radix UI, TailwindCSS 4 |
| **Tenant** (porta 3001) | Aplicação multi-tenant dos clientes | Next.js 14, React 19, Radix UI, TailwindCSS 4 |
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
│   ├── @kaven/database/        # Prisma ORM + Migrations
│   └── @kaven/shared/          # Zod schemas, DTOs, constants
├── infra/
│   └── monitoring/             # Prometheus, Grafana, Loki configs
├── scripts/                    # Automação (.agent/)
└── docker-compose.yml          # 13 containers (DB, Redis, Monitoring, etc)
```

---

## 📊 ESTRUTURA DO BANCO DE DADOS (PRISMA)

### Schema Overview

- **Total de Models:** 54 modelos Prisma
- **Total de Enums:** 28 tipos enumerados
- **Arquivo Principal:** `schema.prisma` (2.271 linhas)
- **Estrutura:** `schema.base.prisma` (core imutável) + `schema.extended.prisma` (features customizáveis)

### Modelos Críticos (Multi-tenancy)

```
CORE (Segurança & Tenancy):
├── Tenant              # ID + slug + domain (detecção automática)
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

### Modules (21 total)

```
apps/api/src/modules/
├── auth/                   # JWT + 2FA + Password Reset (100% tested)
├── users/                  # CRUD + Invites (100% tested)
├── tenants/                # Multi-tenancy (100% tested)
├── subscriptions/          # Gating logic (100% tested)
├── payments/               # Stripe + Paddle + PagueBit
├── invoices/               # Invoice generation (100% tested)
├── orders/                 # Order processing (100% tested)
├── products/               # Products CRUD (100% tested)
├── plans/                  # Plans CRUD
├── files/                  # File upload with quotas (100% tested)
├── audit/                  # Audit logging (100% tested)
├── notifications/          # In-app + Email (100% tested)
├── security/               # 2FA + Policies (100% tested)
├── spaces/                 # Workspace isolation
├── roles/                  # RBAC
├── grants/                 # Capability grants
├── policies/               # Access restrictions
├── observability/          # Prometheus + Loki (100% tested)
├── platform/               # Email integration + Config
├── currencies/             # Multi-currency support
├── app/projects/           # Demo CRM feature
├── app/tasks/              # Demo Task feature
├── export/                 # Data export
├── webhooks/               # Webhook integrations
└── licensing/              # License generation
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
| Unit Tests (Services) | 11/42 | 26% coverage |
| Test Cases | 105+ | All passing |
| E2E Tests (Tenant) | 2 | auth, checkout |
| Playwright Tests | 284 files | Mixed |
| Spec Files | 32 | .spec.ts |

### 100% Tested Services

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

---

## 🚨 TECHNICAL DEBT IDENTIFIED

### CRITICAL (Launch Blockers)

| ID | Debt | Impact | Effort |
|----|------|--------|--------|
| TD-001 | Tenant App: Theme API not implemented | Clients can't customize design | 8h |
| TD-002 | Tenant App: Real data fetching hardcoded | Sidebar shows "Kaven HQ" instead of real tenant | 4h |
| TD-003 | Admin routes: Missing authorization | Products/Plans/Features routes unprotected | 8h |
| TD-004 | AWS SES: Integration commented out | Email provider incomplete | 12h |

### HIGH (User Experience)

| ID | Debt | Location | Effort |
|----|------|----------|--------|
| TD-005 | Actor ID undefined in audit logs | users.service.ts | 2h |
| TD-006 | Theme provider needs API calls | tenant theme-provider | 6h |
| TD-007 | Grant approval missing middleware | grant-request.routes.ts | 4h |
| TD-008 | Role CRUD missing space validation | role.controller.ts | 4h |

### MEDIUM (Code Smells)

| ID | Debt | Count | Type |
|----|------|-------|------|
| TD-009 | Generic TODOs | 20+ | Incomplete comments |
| TD-010 | Test coverage gaps | 31 services | Only 11 tested |
| TD-011 | No E2E tests (Admin) | 0 | Only tenant app |
| TD-012 | Hardcoded strings | 5+ | Email templates |

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
✅ Robust testing (11 services 100% covered)
✅ Complete observability (PLG stack)
✅ Excellent DX (Turborepo, Docker, automation)

### Weaknesses
⚠️ Tenant App incomplete (theme + data fetching)
⚠️ Authorization gaps in admin routes
⚠️ Partial test coverage (26% services)
⚠️ AWS SES not implemented
⚠️ No E2E tests for Admin app

### Recommendations

**P0 (Before Launch):**
1. Implement authorization middleware in admin routes
2. Complete Tenant App theme customization API
3. Implement real tenant data fetching
4. Add E2E tests for admin app

**P1 (Post-Launch):**
5. Test remaining 31 services
6. Implement AWS SES integration
7. Add PostgreSQL RLS
8. Sync documentation with code

**P2 (Q2 2026):**
9. Finalize Marketplace API
10. Complete Landing page
11. Investigate AIOS AI Layer

---

**Report Compiled:** 2026-02-03
**Analyst:** Specialized Architect Agent (agentId: ac4ab50)
**Next Phase:** Database Audit (Phase 2)
