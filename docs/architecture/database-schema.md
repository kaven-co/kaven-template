# KAVEN FRAMEWORK - DATABASE SCHEMA

**Date:** 2026-04-11
**Version:** v1.0.0-rc1 LIVE
**Analyst:** Data Engineer - PostgreSQL + Prisma Specialist

---

## 📊 SCHEMA OVERVIEW

### Statistics

- **Total Models:** 261
- **Total Enums:** 183
- **Migrations:** 37+ applied em produção (Neon)
- **Cascade Deletes:** 43+ occurrences
- **Unique Constraints:** 44+ fields
- **Tenant References:** 55+ in schema
- **Soft Delete Fields:** 6+ (deletedAt)

### Modular Structure

O schema usa estratégia modular inovadora:

```
packages/database/prisma/
├── schema.base.prisma          # Core imutável (Tenant, User, Auth, Billing)
├── schema.extended.prisma      # Source real com todas as features (261 models)
└── schema.prisma               # Gerado automaticamente (merged base + extended)
```

> **Nota:** `schema.extended.prisma` é o source canônico — `schema.prisma` é gerado a partir do merge. Edite sempre em `schema.extended.prisma`.

---

## 🏗️ MODELS POR CATEGORIA

### CORE (Segurança & Tenancy)

| Model | Fields | Purpose |
|-------|--------|---------|
| Tenant | id, name, slug, domain, status, deletedAt | Root multi-tenancy |
| User | id, email, password, tenantId, role, status, deletedAt | Usuários com soft delete |
| RefreshToken | id, token, userId, expiresAt | JWT refresh tokens |
| VerificationToken | id, identifier, token, expires | Email verification |
| PasswordResetToken | id, identifier, token, expires | Password reset flow |
| TenantInvite | id, email, role, tenantId, token | Convites de tenant |

### SECURITY & AUTHORIZATION

| Model | Fields | Purpose |
|-------|--------|---------|
| Capability | id, code, name, description, category, sensitivity | Granular permissions |
| Grant | id, userId, capabilityId, spaceId, status, expiresAt | Permission assignments |
| GrantRequest | id, userId, capabilityId, requestedBy, status | Approval workflow |
| Policy | id, code, name, type, targetType, targetId, enforcement | Access restrictions |
| SecurityAuditLog | id, userId, action, details, ipAddress | Security events |
| ImpersonationSession | id, impersonatorId, targetUserId, status | Impersonation audit |
| SecurityRequest | id, userId, type, status | 2FA/MFA requests |

### MONETIZATION

| Model | Fields | Purpose |
|-------|--------|---------|
| Subscription | id, tenantId, planId, status, currentPeriodEnd, deletedAt | Active subscriptions |
| Plan | id, name, code, type, tenantId, amount, interval | Plan definitions |
| PlanFeature | id, planId, featureId, limit | Features per plan |
| Product | id, name, code, type, tenantId, amount | Add-on products |
| ProductEffect | id, productId, effectType, value | Product effects |
| Feature | id, code, name, type, category | Feature catalog |
| Price | id, planId/productId, currencyCode, amount | Multi-currency pricing |
| Invoice | id, tenantId, invoiceNumber, amount, status, dueDate, deletedAt | Generated invoices |
| Order | id, tenantId, orderNumber, totalAmount, status, deletedAt | Processed orders |
| Payment | id, invoiceId, orderId, amount, method, status | Payment history |
| Purchase | id, userId, productId, tenantId, amount, status | Product purchases |
| UsageRecord | id, userId, tenantId, featureCode, count | Usage tracking |
| License | id, purchaseId, key, status, expiresAt | License keys |

### EMAIL INFRASTRUCTURE

| Model | Fields | Purpose |
|-------|--------|---------|
| EmailTemplate | id, code, name, type, subject, body | Handlebars templates |
| EmailQueue | id, tenantId, to, subject, provider, status | Email queue (BullMQ) |
| EmailEvent | id, userId, tenantId, email, eventType, messageId | Bounce/complaint tracking |
| EmailIntegration | id, provider, apiKey, isActive | Provider configs |
| EmailMetrics | id, provider, totalSent, deliveryRate | Email analytics |

### COLLABORATION

| Model | Fields | Purpose |
|-------|--------|---------|
| Space | id, tenantId, name, slug, icon, color, config | Workspaces |
| UserSpace | id, userId, spaceId, customPermissions | Space membership |
| SpaceRole | id, name, description, isSystem | Custom roles per space |
| UserSpaceRole | id, userId, spaceId, roleId | Role assignments |
| RoleCapability | id, roleId, capabilityId | Role → Capability mapping |
| InviteSpace | id, inviteId, spaceId | Invite → Space mapping |
| SpaceOwner | id, userId, spaceId | Space ownership |

### WORKSPACE & PROJECT MANAGEMENT

| Model | Fields | Purpose |
|-------|--------|---------|
| Project | id, tenantId, name, status, createdBy | CRM/Project management |
| Task | id, tenantId, projectId, title, status, priority | Task management |

### MARKETING & CRM

Models para atribuição, analytics, campanhas e customer success (adicionados via sprints 3–7 + EPIC-2.5).

### OUTROS DOMÍNIOS (261 models total)

O schema v1.0.0-rc1 inclui modelos para: ads/attribution (Meta CAPI, GA4), compliance, content-ops, documents, finance/BI, governance, inventory, legal, people, property management, remote work, saas-ops, service tokens, team collaboration e outros 22 módulos expandidos além do core inicial.

### INFRASTRUCTURE

| Model | Fields | Purpose |
|-------|--------|---------|
| File | id, userId, tenantId, filename, mimeType, size, deletedAt | File uploads with quotas |
| AuditLog | id, userId, tenantId, action, entity, entityId | General audit trail |
| WebhookEvent | id, provider, eventType, payload, processedAt | Webhook integrations |
| DataExportLog | id, userId, entityType, format, status | Export audit |
| CapabilityAuditEvent | id, userId, capabilityId, action | Capability audit |
| GrantAuditEvent | id, userId, grantId, action | Grant audit |

### PLATFORM

| Model | Fields | Purpose |
|-------|--------|---------|
| PlatformConfig | id, logo, primaryColor, timezone, language | Platform settings |
| DesignSystemCustomization | id, userId, theme, primaryColor | User theme |
| Currency | code, name, symbol, iconType, decimals, isCrypto | Currency catalog |
| SecurityConfig | id, code, name, value, isActive | Security settings |
| InAppNotification | id, userId, title, message, isRead | In-app notifications |
| UserNotificationPreferences | id, userId, channel, category, enabled | Notification prefs |
| PolicyDeviceTracking | id, policyId, deviceFingerprint, blockedActions | Device tracking |

---

## 🔗 RELACIONAMENTOS PRINCIPAIS

### Multi-Tenancy Chain
```
Tenant (root)
  ├─→ User (tenantId)
  ├─→ Subscription (tenantId @unique)
  ├─→ Invoice (tenantId)
  ├─→ Order (tenantId)
  ├─→ Space (tenantId nullable)
  ├─→ Project (tenantId)
  ├─→ Task (tenantId)
  ├─→ File (tenantId nullable)
  └─→ AuditLog (tenantId nullable)
```

### Authentication Chain
```
User
  ├─→ RefreshToken (userId, onDelete: Cascade)
  ├─→ VerificationToken (userId, onDelete: Cascade)
  ├─→ PasswordResetToken (userId, onDelete: Cascade)
  └─→ Grant (userId, onDelete: Cascade)
```

### Billing Chain
```
Subscription
  ├─→ Invoice (subscriptionId, onDelete: SET NULL)
  └─→ Plan (planId, onDelete: Restrict)

Invoice
  ├─→ Payment (invoiceId, onDelete: Cascade)
  └─→ Tenant (tenantId)

Order
  └─→ Payment (orderId, onDelete: Cascade)
```

### Permissions Chain
```
User
  └─→ Grant
      ├─→ Capability (capabilityId, onDelete: Cascade)
      └─→ Space (spaceId nullable, onDelete: Cascade)

SpaceRole
  └─→ RoleCapability
      └─→ Capability
```

### N:N Relationships
```
User ←→ Space (via UserSpace)
TenantInvite ←→ Space (via InviteSpace)
SpaceRole ←→ Capability (via RoleCapability)
User ←→ SpaceRole (via UserSpaceRole)
```

---

## 📋 ENUMS (183 TOTAL)

### Status Enums
- TenantStatus: ACTIVE, INACTIVE, SUSPENDED
- UserStatus: ACTIVE, INACTIVE, LOCKED, PENDING_VERIFICATION
- SubscriptionStatus: ACTIVE, CANCELED, PAST_DUE, TRIALING, INCOMPLETE
- InvoiceStatus: DRAFT, OPEN, PAID, VOID, UNCOLLECTIBLE
- OrderStatus: PENDING, PROCESSING, COMPLETED, CANCELED, REFUNDED
- PaymentStatus: PENDING, COMPLETED, FAILED, REFUNDED
- EmailQueueStatus: PENDING, SENT, FAILED, RETRYING, CANCELED
- TemplateStatus: DRAFT, ACTIVE, ARCHIVED
- GrantStatus: ACTIVE, REVOKED, EXPIRED
- GrantRequestStatus: PENDING, APPROVED, DENIED, CANCELED
- ImpersonationStatus: ACTIVE, ENDED, REVOKED
- SecurityRequestStatus: PENDING, APPROVED, DENIED, EXPIRED
- PurchaseStatus: PENDING, COMPLETED, FAILED, REFUNDED, CANCELED
- LicenseStatus: ACTIVE, EXPIRED, REVOKED
- ProjectStatus: ACTIVE, ARCHIVED, DELETED
- TaskStatus: TODO, IN_PROGRESS, DONE, CANCELED

### Type Enums
- Role: SUPER_ADMIN, TENANT_ADMIN, USER
- PaymentMethod: CREDIT_CARD, PIX, CRYPTO, BANK_TRANSFER
- IconType: TEXT, SVG
- IconColorMode: SOLID, GRADIENT
- EmailProvider: POSTMARK, RESEND, AWS_SES, SMTP
- EmailType: TRANSACTIONAL, MARKETING
- EmailEventType: SENT, DELIVERED, OPENED, CLICKED, BOUNCED, COMPLAINED, UNSUBSCRIBED
- BounceType: HARD, SOFT, TRANSIENT
- CapabilitySensitivity: PUBLIC, INTERNAL, SENSITIVE, CRITICAL
- CapabilityScope: TENANT, SPACE, USER, RESOURCE, SYSTEM
- GrantType: PERMANENT, TEMPORARY
- AccessLevel: READ, WRITE
- GrantApprovalLevel: MANAGER, ADMIN, SUPER_ADMIN
- PolicyType: IP_WHITELIST, IP_BLACKLIST, GEO_RESTRICTION, TIME_RESTRICTION, MFA_REQUIRED, DEVICE_TRUST, SESSION_TIMEOUT, MAX_CONCURRENT_SESSIONS, ACTION_LIMIT
- PolicyTargetType: TENANT, USER, SPACE, CAPABILITY, RESOURCE
- PolicyEnforcement: DENY, ALLOW, WARN, LOG
- FeatureType: BOOLEAN, QUOTA, LIMIT
- PlanType: RECURRING, ONE_TIME
- BillingInterval: MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL, BIENNIAL, LIFETIME
- ProductType: ONE_TIME, SUBSCRIPTION, ADD_ON
- EffectType: ADD_QUOTA, UNLOCK_FEATURE, MULTIPLY_LIMIT, SET_VALUE
- TaskPriority: LOW, MEDIUM, HIGH, URGENT

---

## 🔐 ÍNDICES CATALOGADOS

### Indexes Presentes (Performance)

**User:**
- @@index([email])
- @@index([tenantId])
- @@index([role])
- @@index([status])
- @@index([emailBounced])
- @@index([emailOptOut])
- @@index([unsubscribeToken])

**Subscription:**
- @@index([tenantId])
- @@index([planId])
- @@index([status])
- @@index([stripeSubscriptionId])
- @@index([currentPeriodEnd])

**Invoice:**
- @@index([tenantId])
- @@index([status])
- @@index([invoiceNumber])
- @@index([dueDate])

**Order:**
- @@index([tenantId])
- @@index([status])
- @@index([orderNumber])

**Payment:**
- @@index([invoiceId])
- @@index([orderId])
- @@index([status])
- @@index([transactionId])

**File:**
- @@index([userId])
- @@index([tenantId])
- @@index([createdAt])

**AuditLog:**
- @@index([userId])
- @@index([tenantId])
- @@index([action])
- @@index([createdAt])

**EmailEvent:**
- @@index([userId])
- @@index([tenantId])
- @@index([email])
- @@index([messageId])
- @@index([eventType])
- @@index([createdAt])

**Capability:**
- @@index([code])
- @@index([category])
- @@index([sensitivity])
- @@index([isActive])

**Grant:**
- @@index([userId])
- @@index([spaceId])
- @@index([capabilityId])
- @@index([status])
- @@index([expiresAt])
- @@index([grantedBy])

### Índices Compostos (Otimização)

**UserSpace:**
- @@unique([userId, spaceId])

**InviteSpace:**
- @@unique([inviteId, spaceId])

**RoleCapability:**
- @@unique([roleId, capabilityId])

**UserSpaceRole:**
- @@unique([userId, spaceId, roleId])

**PlanFeature:**
- @@unique([planId, featureId])

---

## 💾 SOFT DELETE IMPLEMENTATION

**Models com deletedAt (6+ no core):**
1. Tenant
2. User
3. Subscription
4. Invoice
5. Order
6. File

**Comportamento:**
- Soft delete via `deletedAt DateTime?`
- Queries devem filtrar `WHERE deletedAt IS NULL`
- ⚠️ **Middleware NÃO filtra automaticamente** (manual filtering required)

---

## 🔄 CASCADE DELETE STRATEGY

**Total: 43 onDelete: Cascade**

**Safe Cascades:**
- User → RefreshToken (Cascade) ✓
- User → VerificationToken (Cascade) ✓
- Subscription → Invoice (SET NULL) ✓ - preserva invoices históricos
- Invoice → Payment (Cascade) ✓
- Grant → CapabilityAuditEvent (Cascade) ✓

**Potential Risks:**
- Tenant → User (Cascade) → pode deletar muitos users acidentalmente
- User → Grant (Cascade) → perde histórico de permissões

**Protections:**
- Subscription.plan → Plan (Restrict) ✓ - evita deletar plano em uso
- Product.purchases → Purchase (Restrict) ✓ - evita deletar produto em uso

---

## 📊 MIGRATIONS HISTORY

**Total:** 37+ migrations aplicadas em produção (Neon — verificado 2026-04-10)

O histórico completo de migrations está em `packages/database/prisma/migrations/`. As migrations iniciais (Jan 2026) cobrem o core; as subsequentes (Fev–Abr 2026) expandem o schema com os 22+ módulos dos Sprints 1–7 e EPIC-2.5.

---

**Schema Documentation Compiled:** 2026-04-11
**Status:** v1.0.0-rc1 LIVE — admin.kaven.site + tenant.kaven.site
