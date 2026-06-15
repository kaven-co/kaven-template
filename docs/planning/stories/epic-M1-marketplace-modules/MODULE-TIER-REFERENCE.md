# Module Tier Reference — Kaven Marketplace

> Decisão aprovada: 2026-06-14 | Pricing: Starter $49 / Builder $99 / Pro $199
> Fonte: `pricing-council-complete.md` (vault) + decisão do fundador

## Enum de Tiers (campo `tier` no module.json)

```
starter < builder < pro < enterprise
```

## Core do Framework (incluso em todos os planos — NÃO são módulos do marketplace)

| Módulo interno | Localização |
|----------------|-------------|
| multi-tenancy | `apps/api/src/modules/tenants/` |
| auth + OAuth | `apps/api/src/modules/auth/` |
| users | `apps/api/src/modules/users/` |
| rbac + grants | `apps/api/src/modules/roles/`, `grants/` |
| spaces | `apps/api/src/modules/spaces/` |
| audit-log | `apps/api/src/modules/audit/` |
| email-infra | `apps/api/src/modules/notifications/` |
| subscriptions | `apps/api/src/modules/subscriptions/` |
| billing-stripe | `apps/api/src/modules/billing/` |
| design-system | `packages/ui/` |
| files | `apps/api/src/modules/files/` |
| notifications | `apps/api/src/modules/notifications/` |
| security | `apps/api/src/modules/security/` |
| observability | `apps/api/src/modules/observability/` |
| webhooks | `apps/api/src/modules/webhooks/` |

## Módulos do Marketplace

### tier: "builder" — Builder $99+ e Pro $199+

| Slug | Nome | Status |
|------|------|--------|
| `payments` | Stripe Payments | ✅ v1.0.2 — S3, Ed25519, release criado |
| `auth-social` | Social Auth (Google + GitHub OAuth) | 🔴 shell → M1.2 |
| `storage` | S3/R2 Cloud Storage (presigned URLs) | 🔴 shell → M1.3 |
| `analytics` | Analytics Dashboard (PostHog dual-write) | 🔴 shell → M1.4 |
| `email-templates` | React Email Templates (6 transacionais) | 🔴 shell → M1.5 |

### tier: "pro" — Pro $199+ apenas

| Slug | Nome | Status |
|------|------|--------|
| `advanced-rbac` | Advanced RBAC + SCIM | 📋 Planned (Q2) |
| `i18n` | Internationalization | 📋 Planned (Q2) |
| `blog` | Blog Engine (MDX) | 📋 Planned (Q2) |
| `ai-studio` | AI Studio (AIOS integration) | 📋 Planned (Q3) |
| `email-marketing` | Email Marketing | 📋 Planned (Q3) |
| `pagubit-pix` | PIX Payments (BR) | 📋 Planned (Q2) |
| `export` | Data Export (CSV/PDF/JSON) | ⚠️ Partial |
| `theme-builder` | Per-tenant Theme Builder | ⚠️ Partial |
| `marketplace-sdk` | Custom Marketplace SDK | 📋 Planned (Q4) |

### tier: "enterprise" — Enterprise only

| Slug | Nome | Status |
|------|------|--------|
| `white-label` | White Label (remove Kaven branding) | 📋 Planned (Q4) |
| `sso-saml` | SSO/SAML 2.0 + OIDC | 📋 Planned (Q3) |
| `soc2-toolkit` | SOC2 Toolkit | 📋 Planned (Q4) |

## Regras de Enforcement

- CLI verifica `module.tier` vs `auth.tier` ANTES de download (M1.6)
- Hierarquia: `starter(0) < builder(1) < pro(2) < enterprise(3)`
- Usuário Builder pode instalar qualquer módulo com tier `starter` ou `builder`
- `@kaven/runtime` SDK (enforcement em runtime) — planejado para v1.1 / EPIC-M2
