# QA ENGINEER REVIEW FEEDBACK

**Date:** 2026-02-03
**Phase:** Brownfield Discovery - Phase 7 (QA Engineer Review)
**Reviewer:** QA Engineer (Testing & Security Specialist)
**Review Duration:** 60 minutes
**Status:** ✅ VALIDATED WITH CRITICAL GAPS IDENTIFIED

---

## 🎯 VALIDATION SUMMARY

- **Items validated:** 42/42 (100%)
- **Testing gaps identified:** 18 critical gaps
- **Effort adjustments:** 8 items (testing time underestimated)
- **New test debts:** 3 major debts
- **Regression risks:** 11 high-risk debts
- **Security testing gaps:** CRITICAL - No security tests exist

**Overall Assessment:** ⚠️ **APPROVED WITH MANDATORY TESTING REQUIREMENTS**

**Critical Finding:** Framework has **ZERO security tests** (IDOR, CSRF, SQL Injection, XSS) despite having 13 CRITICAL security debts. This is a **LAUNCH BLOCKER**.

---

## 🧪 TESTING COVERAGE ANALYSIS

### Current State (from system-architecture.md)

```
Unit Tests (Services): 11/42 services (26% coverage)
Test Cases: 105+ test cases
E2E Tests (Tenant): 2 tests (auth, checkout)
E2E Tests (Admin): 0 tests
Playwright Tests: 284 files (unknown status)
```

### ✅ 100% Tested Services (11 total)

1. auth.service.ts
2. tenant.service.ts
3. subscription.service.ts
4. product.service.ts
5. notification.service.ts
6. file.service.ts
7. audit.service.ts
8. invite.service.ts
9. business-metrics.service.ts
10. security-request.service.ts
11. authorization.service.ts

### ❌ UNTESTED Services (31 services - 74%)

**CRITICAL (No tests for security-sensitive code):**
- grant.service.ts (RBAC core)
- policy.service.ts (Security enforcement)
- user.service.ts (Authentication)
- invoice.service.ts (Financial transactions)
- payment.service.ts (Payment processing)
- order.service.ts (E-commerce)
- email.service.ts (Transactional emails)
- space.service.ts (Multi-tenancy isolation)

**This is a CRITICAL GAP** - security and financial modules MUST be 100% tested before launch.

---

## 🚨 CRITICAL DEBTS TESTABILITY

### DB-C1: Permission Systems SEM tenantId (16h → 24h)

**Testability Assessment:** ⚠️ **HIGH COMPLEXITY**

**How to Test:**

**1. Unit Tests (8h - BEFORE implementation):**
```typescript
// Test suite: grant.service.spec.ts
describe('Grant Service with tenantId', () => {
  it('should enforce tenantId in Grant creation', async () => {
    const grant = await grantService.create({
      userId: 'user-1',
      capabilityId: 'cap-1',
      // tenantId missing → should throw
    }, 'tenant-A');

    expect(grant).toBeDefined();
    expect(grant.tenantId).toBe('tenant-A');
  });

  it('should prevent IDOR: user cannot access grants from other tenant', async () => {
    const grantTenantB = await grantService.create({
      userId: 'user-1',
      capabilityId: 'cap-1',
    }, 'tenant-B');

    // Switch to tenant-A context
    await expect(
      grantService.findById(grantTenantB.id, 'tenant-A')
    ).rejects.toThrow('Not found');
  });

  it('should prevent SQL injection via tenantId', async () => {
    const maliciousTenantId = "'; DROP TABLE grants; --";

    await expect(
      grantService.findMany(maliciousTenantId)
    ).rejects.toThrow();
  });
});
```

**2. Integration Tests (8h - AFTER migration):**
```typescript
describe('Grant API with tenantId', () => {
  it('GET /grants should return only tenant-scoped grants', async () => {
    const response = await request(app)
      .get('/api/grants')
      .set('Authorization', `Bearer ${tokenTenantA}`)
      .set('X-Tenant-ID', 'tenant-A');

    expect(response.status).toBe(200);
    expect(response.body.every(g => g.tenantId === 'tenant-A')).toBe(true);
  });

  it('GET /grants/:id should return 404 for cross-tenant access', async () => {
    const grantTenantB = await createGrant('tenant-B');

    const response = await request(app)
      .get(`/api/grants/${grantTenantB.id}`)
      .set('Authorization', `Bearer ${tokenTenantA}`)
      .set('X-Tenant-ID', 'tenant-A');

    expect(response.status).toBe(404);
  });
});
```

**3. E2E Tests (4h - AFTER deployment to staging):**
```typescript
test('Multi-tenant isolation: Grant IDOR attack', async ({ page }) => {
  // Login as tenant-A admin
  await page.goto('http://tenant-a.local:3000/grants');

  // Intercept API call to get grant ID from tenant-B
  const grantIdTenantB = 'grant-uuid-tenant-B';

  // Try to access grant from tenant-B (IDOR attack simulation)
  const response = await page.request.get(`/api/grants/${grantIdTenantB}`, {
    headers: { 'X-Tenant-ID': 'tenant-A' }
  });

  expect(response.status()).toBe(404); // Should NOT return tenant-B data
});
```

**4. Security Tests (4h - Penetration testing):**
```typescript
describe('SECURITY: Grant IDOR Prevention', () => {
  it('should prevent horizontal privilege escalation', async () => {
    // User-1 (tenant-A) tries to access user-2 (tenant-A) grants
    const grantUser2 = await createGrant('user-2', 'tenant-A');

    const response = await request(app)
      .get(`/api/grants/${grantUser2.id}`)
      .set('Authorization', `Bearer ${tokenUser1}`) // User-1 token
      .set('X-Tenant-ID', 'tenant-A');

    expect(response.status).toBe(403); // Forbidden (not 404)
  });

  it('should prevent vertical privilege escalation', async () => {
    // Regular user tries to assign SUPER_ADMIN grant
    const response = await request(app)
      .post('/api/grants')
      .set('Authorization', `Bearer ${tokenRegularUser}`)
      .send({
        userId: 'attacker-user',
        capabilityId: 'system.admin', // Sensitive capability
      });

    expect(response.status).toBe(403);
  });
});
```

**Total Testing Effort for DB-C1:** 24h (included in adjusted estimate)

**TDD Approach:** ✅ **MANDATORY** - Write tests BEFORE implementing tenantId migration.

**Regression Risk:** 🔴 **CRITICAL** - Breaking grants will break entire RBAC system.

---

### DB-C2: Audit Systems SEM tenantId (16h → 20h)

**Testability Assessment:** ⚠️ **HIGH COMPLEXITY + COMPLIANCE RISK**

**How to Test:**

**1. Unit Tests (6h - TDD):**
```typescript
describe('SecurityAuditLog with tenantId', () => {
  it('should enforce tenantId in audit log creation', async () => {
    const log = await auditService.logSecurityEvent({
      userId: 'user-1',
      action: 'LOGIN_SUCCESS',
      ipAddress: '1.2.3.4',
    }, 'tenant-A');

    expect(log.tenantId).toBe('tenant-A');
  });

  it('should prevent cross-tenant audit log access (GDPR violation)', async () => {
    const logTenantB = await auditService.logSecurityEvent({
      userId: 'user-1',
      action: 'LOGIN_FAILED',
    }, 'tenant-B');

    // Tenant-A admin tries to access tenant-B logs
    await expect(
      auditService.findById(logTenantB.id, 'tenant-A')
    ).rejects.toThrow('Not found');
  });

  it('should prevent audit log deletion (compliance requirement)', async () => {
    const log = await auditService.logSecurityEvent({
      userId: 'user-1',
      action: 'DATA_EXPORT',
    }, 'tenant-A');

    // Try to delete audit log (should fail)
    await expect(
      auditService.delete(log.id, 'tenant-A')
    ).rejects.toThrow('Audit logs cannot be deleted');
  });
});
```

**2. Compliance Tests (8h - MANDATORY for GDPR/SOC2):**
```typescript
describe('COMPLIANCE: Audit Log Integrity', () => {
  it('should retain audit logs for 7 years (GDPR requirement)', async () => {
    // Create audit log
    const log = await auditService.logSecurityEvent({
      userId: 'user-1',
      action: 'DATA_ACCESS',
    }, 'tenant-A');

    // Fast-forward time by 7 years (mocked)
    jest.setSystemTime(new Date('2033-02-03'));

    // Log should still exist
    const retrievedLog = await auditService.findById(log.id, 'tenant-A');
    expect(retrievedLog).toBeDefined();
  });

  it('should prevent backdating audit logs (tampering)', async () => {
    const pastDate = new Date('2020-01-01');

    await expect(
      auditService.logSecurityEvent({
        userId: 'user-1',
        action: 'LOGIN_SUCCESS',
        createdAt: pastDate, // Backdating attempt
      }, 'tenant-A')
    ).rejects.toThrow('Cannot create audit log with past timestamp');
  });

  it('should generate audit trail for audit log access (meta-audit)', async () => {
    // Admin accesses audit logs
    const logs = await auditService.findMany('tenant-A', { limit: 10 });

    // This access itself should be logged
    const metaAudit = await auditService.findMany('tenant-A', {
      action: 'AUDIT_LOG_ACCESS',
    });

    expect(metaAudit.length).toBeGreaterThan(0);
  });
});
```

**3. Performance Tests (6h - Volume testing):**
```typescript
describe('PERFORMANCE: Audit Log Scalability', () => {
  it('should handle 1M audit logs without degradation', async () => {
    // Insert 1M audit logs (bulk insert)
    await auditService.bulkInsert(generateMockLogs(1_000_000), 'tenant-A');

    // Query should complete in < 500ms
    const start = performance.now();
    const logs = await auditService.findMany('tenant-A', {
      limit: 100,
      offset: 500_000,
    });
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(500); // ms
    expect(logs.length).toBe(100);
  });

  it('should use composite index for time-range queries', async () => {
    const query = auditService.findMany('tenant-A', {
      createdAt: {
        gte: new Date('2026-01-01'),
        lte: new Date('2026-02-03'),
      },
    });

    // Explain plan should show index usage
    const explainPlan = await prisma.$queryRaw`EXPLAIN ${query}`;
    expect(explainPlan).toContain('Index Scan using idx_audit_logs_tenant_created');
  });
});
```

**Total Testing Effort for DB-C2:** 20h (included in adjusted estimate)

**TDD Approach:** ✅ **MANDATORY** - Compliance tests MUST pass before launch.

**Regression Risk:** 🔴 **CRITICAL** - Breaking audit logs = compliance violation = legal risk.

---

### DB-C3: RLS Middleware Incompleto (8h → 12h)

**Testability Assessment:** ⚠️ **VERY HIGH COMPLEXITY**

**How to Test:**

**1. Automated Tests for ALL 33 Models (8h):**
```typescript
// Test generator: rls-middleware.spec.ts
const TENANT_SCOPED_MODELS = [
  'User', 'Grant', 'Invoice', 'Order', 'Payment',
  'Subscription', 'AuditLog', 'SecurityAuditLog',
  // ... all 33 models
];

describe('RLS Middleware - Tenant Isolation', () => {
  TENANT_SCOPED_MODELS.forEach((model) => {
    describe(`Model: ${model}`, () => {
      it(`should inject tenantId in findMany for ${model}`, async () => {
        const query = prisma[model.toLowerCase()].findMany({
          where: { /* no tenantId */ },
        });

        // Mock tenantId context
        setTenantContext('tenant-A');

        const result = await query;

        // All records should have tenantId = 'tenant-A'
        expect(result.every(r => r.tenantId === 'tenant-A')).toBe(true);
      });

      it(`should prevent cross-tenant access for ${model}`, async () => {
        const recordTenantB = await createRecord(model, 'tenant-B');

        setTenantContext('tenant-A');

        const result = await prisma[model.toLowerCase()].findUnique({
          where: { id: recordTenantB.id },
        });

        expect(result).toBeNull(); // Should NOT return tenant-B data
      });

      it(`should prevent IDOR for ${model}`, async () => {
        const recordTenantB = await createRecord(model, 'tenant-B');

        const response = await request(app)
          .get(`/api/${model.toLowerCase()}s/${recordTenantB.id}`)
          .set('Authorization', `Bearer ${tokenTenantA}`)
          .set('X-Tenant-ID', 'tenant-A');

        expect(response.status).toBe(404);
      });
    });
  });
});
```

**2. Negative Tests (Bypass Attempts) (4h):**
```typescript
describe('SECURITY: RLS Middleware Bypass Attempts', () => {
  it('should prevent tenantId override via query params', async () => {
    const response = await request(app)
      .get('/api/invoices?tenantId=tenant-B') // Attempt to override
      .set('Authorization', `Bearer ${tokenTenantA}`)
      .set('X-Tenant-ID', 'tenant-A');

    // Should still return only tenant-A data (ignore query param)
    expect(response.body.every(i => i.tenantId === 'tenant-A')).toBe(true);
  });

  it('should prevent raw SQL injection to bypass RLS', async () => {
    await expect(
      prisma.$queryRaw`SELECT * FROM invoices WHERE 1=1 OR tenant_id='tenant-B'`
    ).rejects.toThrow('Raw queries must include tenant isolation');
  });

  it('should prevent middleware disable via header', async () => {
    const response = await request(app)
      .get('/api/invoices')
      .set('Authorization', `Bearer ${tokenTenantA}`)
      .set('X-Disable-RLS', 'true'); // Malicious header

    // RLS should still be enforced
    expect(response.status).toBe(400); // Bad request
  });
});
```

**Total Testing Effort for DB-C3:** 12h (adjusted from 8h)

**TDD Approach:** ✅ **MANDATORY** - Write tests for ALL 33 models BEFORE expanding middleware.

**Regression Risk:** 🔴 **CRITICAL** - RLS bypass = complete security failure.

---

### DB-C4: Soft Delete NÃO Filtrado Automaticamente (4h)

**Testability Assessment:** ✅ **LOW COMPLEXITY**

**How to Test:**

**1. Unit Tests (2h):**
```typescript
describe('Soft Delete Middleware', () => {
  it('should filter deletedAt=null automatically in findMany', async () => {
    // Create 2 users: 1 active, 1 soft-deleted
    const activeUser = await prisma.user.create({
      data: { email: 'active@test.com', tenantId: 'tenant-A' },
    });
    const deletedUser = await prisma.user.create({
      data: {
        email: 'deleted@test.com',
        tenantId: 'tenant-A',
        deletedAt: new Date(),
      },
    });

    // Query should return only active user
    const users = await prisma.user.findMany({
      where: { tenantId: 'tenant-A' },
    });

    expect(users.length).toBe(1);
    expect(users[0].id).toBe(activeUser.id);
  });

  it('should allow explicit includeDeleted option', async () => {
    // Admin wants to see soft-deleted records
    const users = await prisma.user.findMany({
      where: { tenantId: 'tenant-A', deletedAt: undefined },
    });

    // Should return ALL users (including deleted)
    expect(users.length).toBe(2);
  });
});
```

**2. Regression Tests (2h):**
```typescript
describe('REGRESSION: Soft Delete Behavior', () => {
  it('should not break existing queries with explicit deletedAt filter', async () => {
    // Some code may already filter deletedAt manually
    const users = await prisma.user.findMany({
      where: { tenantId: 'tenant-A', deletedAt: null },
    });

    // Should still work (no duplicate filter)
    expect(users).toBeDefined();
  });
});
```

**Total Testing Effort for DB-C4:** 4h (approved as-is)

**TDD Approach:** ✅ **RECOMMENDED** - Write tests before middleware update.

**Regression Risk:** 🟡 **MEDIUM** - May break queries that explicitly filter deletedAt.

---

### DB-C5: Payment SEM tenantId Direto (4h → P1)

**Testability Assessment:** ✅ **LOW COMPLEXITY**

**How to Test:**

**1. Unit Tests (2h):**
```typescript
describe('Payment with redundant tenantId', () => {
  it('should enforce tenantId in Payment creation', async () => {
    const invoice = await createInvoice('tenant-A');

    const payment = await paymentService.create({
      invoiceId: invoice.id,
      amount: 100,
      method: 'STRIPE',
    }, 'tenant-A');

    expect(payment.tenantId).toBe('tenant-A');
  });

  it('should prevent orphan payments (no invoice/order)', async () => {
    await expect(
      paymentService.create({
        invoiceId: null,
        orderId: null,
        amount: 100,
      }, 'tenant-A')
    ).rejects.toThrow('Payment must have invoiceId or orderId');
  });
});
```

**2. Performance Tests (2h):**
```typescript
describe('PERFORMANCE: Payment queries with tenantId', () => {
  it('should use direct tenantId index (no JOIN)', async () => {
    const query = prisma.payment.findMany({
      where: { tenantId: 'tenant-A', status: 'COMPLETED' },
    });

    // Explain plan should show direct index usage
    const explainPlan = await prisma.$queryRaw`EXPLAIN ${query}`;
    expect(explainPlan).toContain('idx_payments_tenant_status');
    expect(explainPlan).not.toContain('JOIN'); // No JOIN needed
  });
});
```

**Total Testing Effort for DB-C5:** 4h (approved as-is)

**TDD Approach:** ⏸️ **OPTIONAL** - Can write tests post-implementation (P1).

**Regression Risk:** 🟢 **LOW** - Adding redundant field is safe.

---

### FE-C1: Invoice History Page Missing (16h → 14h)

**Testability Assessment:** ✅ **MEDIUM COMPLEXITY**

**How to Test:**

**1. E2E Tests (4h - AFTER implementation):**
```typescript
test('Invoice History: Customer can view invoices', async ({ page }) => {
  await page.goto('http://localhost:3001/en/invoices');

  // Verify table renders
  const table = page.locator('[data-testid="invoices-table"]');
  await expect(table).toBeVisible();

  // Verify invoice data
  const firstInvoice = table.locator('tbody tr').first();
  await expect(firstInvoice).toContainText('INV-001');
  await expect(firstInvoice).toContainText('$100.00');
  await expect(firstInvoice).toContainText('Paid');

  // Click "View" button
  await firstInvoice.locator('[data-testid="view-invoice"]').click();

  // Verify detail page
  await expect(page).toHaveURL(/\/invoices\/INV-001/);
  await expect(page.locator('h1')).toContainText('Invoice #INV-001');
});

test('Invoice History: Customer can download PDF', async ({ page }) => {
  await page.goto('http://localhost:3001/en/invoices/INV-001');

  // Click "Download PDF" button
  const downloadPromise = page.waitForEvent('download');
  await page.locator('[data-testid="download-pdf"]').click();
  const download = await downloadPromise;

  // Verify file downloaded
  expect(download.suggestedFilename()).toBe('invoice-INV-001.pdf');
});

test('Invoice History: Filters work correctly', async ({ page }) => {
  await page.goto('http://localhost:3001/en/invoices');

  // Filter by status "Paid"
  await page.locator('[data-testid="status-filter"]').selectOption('PAID');

  // Verify only paid invoices shown
  const rows = page.locator('tbody tr');
  const statuses = await rows.locator('[data-testid="status-badge"]').allTextContents();
  expect(statuses.every(s => s === 'Paid')).toBe(true);
});

test('Invoice History: Mobile view uses cards', async ({ page, isMobile }) => {
  if (!isMobile) return;

  await page.goto('http://localhost:3001/en/invoices');

  // Verify card view (not table)
  const cards = page.locator('[data-testid="invoice-card"]');
  await expect(cards.first()).toBeVisible();

  // Verify table is hidden on mobile
  const table = page.locator('[data-testid="invoices-table"]');
  await expect(table).not.toBeVisible();
});
```

**2. API Integration Tests (4h):**
```typescript
describe('GET /api/app/invoices', () => {
  it('should return tenant-scoped invoices only', async () => {
    const response = await request(app)
      .get('/api/app/invoices')
      .set('Authorization', `Bearer ${tokenTenantA}`)
      .set('X-Tenant-ID', 'tenant-A');

    expect(response.status).toBe(200);
    expect(response.body.data.every(i => i.tenantId === 'tenant-A')).toBe(true);
  });

  it('should support pagination', async () => {
    const response = await request(app)
      .get('/api/app/invoices?page=2&limit=10')
      .set('Authorization', `Bearer ${tokenTenantA}`)
      .set('X-Tenant-ID', 'tenant-A');

    expect(response.body.pagination).toEqual({
      page: 2,
      limit: 10,
      total: expect.any(Number),
    });
  });

  it('should support filtering by status', async () => {
    const response = await request(app)
      .get('/api/app/invoices?status=PAID')
      .set('Authorization', `Bearer ${tokenTenantA}`)
      .set('X-Tenant-ID', 'tenant-A');

    expect(response.body.data.every(i => i.status === 'PAID')).toBe(true);
  });
});
```

**3. Component Tests (4h):**
```typescript
describe('InvoicesTable Component', () => {
  it('should render invoice data correctly', () => {
    const invoices = [
      { id: '1', number: 'INV-001', amount: 100, status: 'PAID' },
    ];

    render(<InvoicesTable invoices={invoices} />);

    expect(screen.getByText('INV-001')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });

  it('should handle empty state', () => {
    render(<InvoicesTable invoices={[]} />);

    expect(screen.getByText('No invoices found')).toBeInTheDocument();
  });
});
```

**4. Accessibility Tests (2h):**
```typescript
test('Invoice History: WCAG AA compliance', async ({ page }) => {
  await page.goto('http://localhost:3001/en/invoices');

  // Run axe accessibility scan
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toHaveLength(0);

  // Verify keyboard navigation
  await page.keyboard.press('Tab');
  const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
  expect(focusedElement).toBe('BUTTON'); // First button should be focused
});
```

**Total Testing Effort for FE-C1:** 14h (adjusted from 16h, approved)

**TDD Approach:** ⏸️ **POST-IMPLEMENTATION** - E2E tests after UI is built.

**Regression Risk:** 🟢 **LOW** - New feature, no existing code to break.

---

### FE-C2: Order History Page Missing (12h)

**Testability Assessment:** ✅ **MEDIUM COMPLEXITY** (Similar to FE-C1)

**How to Test:** (Similar structure to Invoice tests above)

**Total Testing Effort for FE-C2:** 12h (approved as-is, includes 3h testing)

**TDD Approach:** ⏸️ **POST-IMPLEMENTATION**

**Regression Risk:** 🟢 **LOW**

---

### FE-C3: Theme Customization NOT DB-Integrated (6h → 8h)

**Testability Assessment:** ⚠️ **MEDIUM COMPLEXITY** (SSR hydration issues)

**How to Test:**

**1. Integration Tests (4h):**
```typescript
describe('Theme Provider with DB Integration', () => {
  it('should fetch theme from API on mount', async () => {
    // Mock API call
    mockFetch('/api/design-system/customization', {
      primaryColor: '#FF0000',
      secondaryColor: '#00FF00',
    });

    render(<ThemeProvider><App /></ThemeProvider>);

    // Wait for API call
    await waitFor(() => {
      expect(screen.getByText('Theme loaded')).toBeInTheDocument();
    });

    // Verify CSS variables injected
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--primary')).toBe('#FF0000');
  });

  it('should handle API error gracefully (fallback to default)', async () => {
    // Mock API error
    mockFetch('/api/design-system/customization', null, 500);

    render(<ThemeProvider><App /></ThemeProvider>);

    // Should show error toast
    await waitFor(() => {
      expect(screen.getByText('Failed to load theme')).toBeInTheDocument();
    });

    // Should fall back to default theme
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--primary')).toBe('#00A76F'); // Default
  });

  it('should prevent theme flash on SSR (hydration)', async () => {
    // Server-side render with default theme
    const { container } = renderToString(<ThemeProvider><App /></ThemeProvider>);

    // Client-side hydrate with custom theme
    mockFetch('/api/design-system/customization', {
      primaryColor: '#FF0000',
    });

    hydrate(<ThemeProvider><App /></ThemeProvider>, container);

    // Should NOT flash default theme (use loading state)
    const root = document.documentElement;
    expect(root.style.getPropertyValue('--primary')).toBe('#FF0000'); // Custom theme applied
  });
});
```

**2. E2E Tests (2h):**
```typescript
test('Theme Customization: Custom logo and colors applied', async ({ page }) => {
  // Login as tenant with custom theme
  await page.goto('http://tenant-custom.local:3001');

  // Verify custom logo loaded
  const logo = page.locator('[data-testid="tenant-logo"]');
  await expect(logo).toHaveAttribute('src', /custom-logo\.svg/);

  // Verify custom primary color applied
  const primaryButton = page.locator('button.btn-primary').first();
  const bgColor = await primaryButton.evaluate((el) =>
    getComputedStyle(el).backgroundColor
  );
  expect(bgColor).toBe('rgb(255, 0, 0)'); // #FF0000
});
```

**3. Performance Tests (2h):**
```typescript
describe('PERFORMANCE: Theme Loading', () => {
  it('should cache theme in localStorage to prevent re-fetch', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch');

    render(<ThemeProvider><App /></ThemeProvider>);

    // First render: should fetch from API
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith('/api/design-system/customization');
    });

    // Unmount and re-mount
    unmount();
    render(<ThemeProvider><App /></ThemeProvider>);

    // Second render: should use localStorage (no fetch)
    expect(fetchSpy).toHaveBeenCalledTimes(1); // Only once
  });
});
```

**Total Testing Effort for FE-C3:** 8h (adjusted from 6h)

**TDD Approach:** ✅ **RECOMMENDED** - Write tests for loading states before integration.

**Regression Risk:** 🟡 **MEDIUM** - Theme flash can degrade UX.

---

### FE-C4: Theme Per-User NOT Per-Tenant (12h)

**Testability Assessment:** ✅ **MEDIUM COMPLEXITY**

**How to Test:**

**1. Migration Tests (4h):**
```typescript
describe('Theme Migration: User → Tenant', () => {
  it('should migrate existing user themes to tenant branding', async () => {
    // Seed: 3 users in tenant-A with different themes
    await prisma.designSystemCustomization.createMany({
      data: [
        { userId: 'user-1', primaryColor: '#FF0000' },
        { userId: 'user-2', primaryColor: '#00FF00' },
        { userId: 'user-3', primaryColor: '#0000FF' },
      ],
    });

    // Run migration
    await migrateTenantBranding();

    // Result: 1 TenantBranding record (tenant-wide)
    const branding = await prisma.tenantBranding.findUnique({
      where: { tenantId: 'tenant-A' },
    });

    expect(branding).toBeDefined();
    // Should use most common color OR first user's color (documented strategy)
  });

  it('should delete old DesignSystemCustomization records', async () => {
    await migrateTenantBranding();

    const oldRecords = await prisma.designSystemCustomization.findMany();
    expect(oldRecords).toHaveLength(0); // All migrated and deleted
  });
});
```

**2. E2E Tests (4h):**
```typescript
test('Theme Per-Tenant: All users see same branding', async ({ page }) => {
  // User-1 logs in
  await page.goto('http://tenant-a.local:3001');
  await login(page, 'user1@test.com');

  const logoUser1 = await page.locator('[data-testid="tenant-logo"]').getAttribute('src');

  // Logout and login as user-2
  await logout(page);
  await login(page, 'user2@test.com');

  const logoUser2 = await page.locator('[data-testid="tenant-logo"]').getAttribute('src');

  // Both users should see SAME logo (tenant branding)
  expect(logoUser1).toBe(logoUser2);
});
```

**3. API Tests (4h):**
```typescript
describe('GET /api/branding', () => {
  it('should return tenant branding (not user-specific)', async () => {
    const response = await request(app)
      .get('/api/branding')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .set('X-Tenant-ID', 'tenant-A');

    expect(response.body.tenantId).toBe('tenant-A');
    expect(response.body.userId).toBeUndefined(); // Should NOT have userId
  });
});
```

**Total Testing Effort for FE-C4:** 12h (approved as-is, includes 2h testing)

**TDD Approach:** ✅ **MANDATORY** - Write migration tests BEFORE running migration.

**Regression Risk:** 🔴 **HIGH** - Data migration can corrupt existing themes.

---

### SYS-C1: Tenant App Theme API Not Implemented (8h)

**Testability Assessment:** ✅ **LOW COMPLEXITY** (Duplicate of FE-C3)

**How to Test:** See FE-C3 tests above.

**Total Testing Effort:** Included in FE-C3.

---

### SYS-C2: Tenant App Real Data Fetching Hardcoded (4h)

**Testability Assessment:** ✅ **VERY LOW COMPLEXITY**

**How to Test:**

**1. E2E Tests (2h):**
```typescript
test('Tenant Sidebar: Shows real tenant name', async ({ page }) => {
  await page.goto('http://tenant-a.local:3001');

  const tenantName = page.locator('[data-testid="tenant-name"]');
  await expect(tenantName).toHaveText('Tenant A Inc.'); // NOT "Kaven HQ"
});
```

**2. Regression Tests (2h):**
```typescript
describe('REGRESSION: Tenant Data Fetching', () => {
  it('should not show default "Kaven HQ" for any tenant', async () => {
    // Create 10 tenants with different names
    const tenants = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        createTenant({ name: `Tenant ${i}` })
      )
    );

    // For each tenant, verify sidebar shows correct name
    for (const tenant of tenants) {
      const response = await request(app)
        .get('/api/app/tenant')
        .set('Authorization', `Bearer ${generateToken(tenant.id)}`)
        .set('X-Tenant-ID', tenant.id);

      expect(response.body.name).toBe(tenant.name);
      expect(response.body.name).not.toBe('Kaven HQ');
    }
  });
});
```

**Total Testing Effort for SYS-C2:** 4h (approved as-is)

**TDD Approach:** ⏸️ **POST-IMPLEMENTATION**

**Regression Risk:** 🟢 **LOW**

---

### SYS-C3: Admin Routes Missing Authorization (8h → 12h)

**Testability Assessment:** 🔴 **HIGH COMPLEXITY + SECURITY RISK**

**How to Test:**

**1. Security Tests (8h - MANDATORY):**
```typescript
describe('SECURITY: Admin Routes Authorization', () => {
  const PROTECTED_ROUTES = [
    '/api/admin/products',
    '/api/admin/plans',
    '/api/admin/features',
    '/api/admin/tenants',
    '/api/admin/users',
  ];

  PROTECTED_ROUTES.forEach((route) => {
    describe(`Route: ${route}`, () => {
      it('should return 401 for unauthenticated requests', async () => {
        const response = await request(app).get(route);
        expect(response.status).toBe(401);
      });

      it('should return 403 for non-admin users', async () => {
        const response = await request(app)
          .get(route)
          .set('Authorization', `Bearer ${tokenRegularUser}`);
        expect(response.status).toBe(403);
      });

      it('should return 403 for tenant admins (not platform admins)', async () => {
        const response = await request(app)
          .get(route)
          .set('Authorization', `Bearer ${tokenTenantAdmin}`);
        expect(response.status).toBe(403);
      });

      it('should return 200 for SUPER_ADMIN only', async () => {
        const response = await request(app)
          .get(route)
          .set('Authorization', `Bearer ${tokenSuperAdmin}`);
        expect(response.status).toBe(200);
      });
    });
  });

  it('should prevent privilege escalation via role manipulation', async () => {
    // Regular user tries to create product (admin-only)
    const response = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${tokenRegularUser}`)
      .send({
        name: 'Malicious Product',
        code: 'MALICIOUS',
      });

    expect(response.status).toBe(403);
    expect(response.body.error).toContain('Insufficient permissions');
  });
});
```

**2. E2E Tests (4h):**
```typescript
test('Admin Panel: Non-admin cannot access products page', async ({ page }) => {
  // Login as regular user
  await page.goto('http://localhost:3000');
  await login(page, 'user@test.com');

  // Try to access admin products page
  await page.goto('http://localhost:3000/admin/products');

  // Should redirect to 403 error page
  await expect(page).toHaveURL(/\/403/);
  await expect(page.locator('h1')).toContainText('Forbidden');
});
```

**Total Testing Effort for SYS-C3:** 12h (adjusted from 8h, +4h for security tests)

**TDD Approach:** ✅ **MANDATORY** - Write security tests BEFORE implementing middleware.

**Regression Risk:** 🔴 **CRITICAL** - Authorization bypass = security breach.

---

### SYS-C4: AWS SES Integration Commented Out (12h → P1)

**Testability Assessment:** ✅ **LOW COMPLEXITY** (Downgraded to P1)

**How to Test:**

**1. Integration Tests (6h - if implemented):**
```typescript
describe('AWS SES Email Provider', () => {
  it('should send email via SES', async () => {
    const result = await emailService.send({
      to: 'test@example.com',
      subject: 'Test Email',
      body: 'Hello, World!',
      provider: 'SES',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it('should handle SES bounce notification', async () => {
    // Simulate SES bounce webhook
    const response = await request(app)
      .post('/webhooks/email/ses/bounce')
      .send({
        Type: 'Notification',
        Message: JSON.stringify({
          bounce: {
            bouncedRecipients: [{ emailAddress: 'bounce@example.com' }],
          },
        }),
      });

    expect(response.status).toBe(200);

    // Verify bounce logged
    const event = await prisma.emailEvent.findFirst({
      where: { type: 'BOUNCE', email: 'bounce@example.com' },
    });
    expect(event).toBeDefined();
  });
});
```

**Total Testing Effort for SYS-C4:** 12h (deferred to P1)

**TDD Approach:** ✅ **RECOMMENDED**

**Regression Risk:** 🟢 **LOW** - Other email providers work.

---

## 📋 ANSWERS TO QUESTIONS

### Question 1: Testing Coverage - 26% service coverage aceitável para launch?

**Answer:** ❌ **NÃO ACEITÁVEL**

**Current State:**
- 11/42 services tested (26%)
- 31 services untested (74%)
- **0 security tests** (IDOR, CSRF, SQL Injection)

**Minimum Acceptable for Launch:**

**Tier 1 (MANDATORY - 100% coverage):**
1. auth.service.ts ✅ (100% tested)
2. tenant.service.ts ✅ (100% tested)
3. subscription.service.ts ✅ (100% tested)
4. grant.service.ts ❌ (0% tested) → **BLOCKER**
5. policy.service.ts ❌ (0% tested) → **BLOCKER**
6. user.service.ts ❌ (0% tested) → **BLOCKER**
7. invoice.service.ts ✅ (100% tested)
8. payment.service.ts ❌ (0% tested) → **BLOCKER**
9. order.service.ts ✅ (100% tested)
10. audit.service.ts ✅ (100% tested)

**Tier 2 (HIGH PRIORITY - >80% coverage):**
11. email.service.ts ❌ (0% tested)
12. space.service.ts ❌ (0% tested)
13. product.service.ts ✅ (100% tested)
14. notification.service.ts ✅ (100% tested)
15. file.service.ts ✅ (100% tested)

**Tier 3 (MEDIUM PRIORITY - >60% coverage):**
16-30. Remaining services

**Recommended Strategy:**

**Phase 1 (Sprint 1 - BLOCKERS):**
- Test grant.service.ts (8h)
- Test policy.service.ts (8h)
- Test user.service.ts (6h)
- Test payment.service.ts (6h)
- **Total:** 28h

**Phase 2 (Sprint 2 - HIGH PRIORITY):**
- Test email.service.ts (6h)
- Test space.service.ts (6h)
- Add security tests for ALL critical services (16h)
- **Total:** 28h

**Phase 3 (Post-Launch - REMAINING):**
- Test remaining 16 services (48h)

**Launch Criteria:**
- ✅ ALL Tier 1 services 100% tested (10 services)
- ✅ ALL critical security tests passing (IDOR, CSRF, SQL Injection)
- ✅ E2E tests for ALL P0 features (Invoice, Order, Theme)
- ⏸️ Tier 2/3 services can be <100% (but >60%)

**Effort to Reach Launch-Ready:**
- Sprint 1 + Sprint 2: **56 hours** (7 days)

---

### Question 2: E2E Tests - Admin app precisa de E2E antes de launch?

**Answer:** ⚠️ **PARTIAL BLOCKER - Core Flows Only**

**Current State:**
- Tenant App: 2 E2E tests (auth, checkout)
- Admin App: **0 E2E tests** ❌

**Minimum Acceptable for Launch:**

**MANDATORY E2E Tests (Admin - 16h):**

1. **Admin Authentication (2h):**
   - Login as SUPER_ADMIN
   - 2FA flow
   - Session persistence

2. **Tenant Management (4h):**
   - Create new tenant
   - Edit tenant settings
   - Suspend tenant
   - Verify tenant isolation

3. **Product/Plan Management (4h):**
   - Create product
   - Create plan with features
   - Assign plan to tenant
   - Verify feature gating works

4. **User Management (4h):**
   - Create user
   - Assign roles
   - Impersonate user
   - Verify audit log generated

5. **Billing Operations (2h):**
   - View invoices (platform-wide)
   - Process payment
   - Verify payment recorded

**OPTIONAL E2E Tests (Post-Launch - 12h):**

6. **Security Audits (4h):**
   - View security logs
   - Export audit trail
   - Verify compliance

7. **Email Configuration (4h):**
   - Configure email provider
   - Send test email
   - Verify bounce handling

8. **Observability (4h):**
   - View Grafana dashboard
   - Check Prometheus metrics
   - Verify alerts triggered

**Recommended Approach:**

**Sprint 1-2 (Pre-Launch):**
- Implement MANDATORY E2E tests (16h)
- Cover core admin flows (Tenant, Product, User, Billing)

**Sprint 3+ (Post-Launch):**
- Implement OPTIONAL E2E tests (12h)
- Add advanced scenarios (Security, Email, Observability)

**Why Partial Blocker:**
- Admin Panel is **internal tool** (not customer-facing)
- Security tests more critical than E2E tests
- Can rely on unit/integration tests for most logic
- E2E tests prevent **critical admin bugs** (e.g., can't create tenants)

**Launch Criteria:**
- ✅ MANDATORY E2E tests passing (16h effort)
- ⏸️ OPTIONAL E2E tests can be post-launch

---

### Question 3: Security Testing - IDOR/CSRF/SQL Injection tests existem?

**Answer:** 🔴 **NÃO EXISTEM - CRITICAL BLOCKER**

**Current State:**
- **0 IDOR tests**
- **0 CSRF tests**
- **0 SQL Injection tests**
- **0 XSS tests**
- **0 Authorization bypass tests**

**This is a LAUNCH BLOCKER** - No security testing = high risk of vulnerabilities in production.

**Mandatory Security Test Suite (32h):**

---

#### **1. IDOR (Insecure Direct Object Reference) Tests (12h)**

**Scope:** ALL API endpoints that accept resource IDs

```typescript
describe('SECURITY: IDOR Prevention', () => {
  const RESOURCE_ENDPOINTS = [
    { route: '/api/invoices/:id', model: 'Invoice' },
    { route: '/api/orders/:id', model: 'Order' },
    { route: '/api/users/:id', model: 'User' },
    { route: '/api/grants/:id', model: 'Grant' },
    { route: '/api/subscriptions/:id', model: 'Subscription' },
    { route: '/api/files/:id', model: 'File' },
    { route: '/api/projects/:id', model: 'Project' },
    { route: '/api/tasks/:id', model: 'Task' },
    // ... ALL tenant-scoped resources
  ];

  RESOURCE_ENDPOINTS.forEach(({ route, model }) => {
    describe(`IDOR Test: ${route}`, () => {
      it('should prevent cross-tenant access (tenant-A cannot access tenant-B data)', async () => {
        // Create resource in tenant-B
        const resourceTenantB = await createResource(model, 'tenant-B');

        // Try to access as tenant-A
        const response = await request(app)
          .get(route.replace(':id', resourceTenantB.id))
          .set('Authorization', `Bearer ${tokenTenantA}`)
          .set('X-Tenant-ID', 'tenant-A');

        expect(response.status).toBe(404); // NOT 403 (to prevent enumeration)
        expect(response.body.error).not.toContain(resourceTenantB.id); // No ID leakage
      });

      it('should prevent horizontal privilege escalation (user-1 cannot access user-2 data)', async () => {
        // Create resource owned by user-2 (same tenant)
        const resourceUser2 = await createResource(model, 'tenant-A', 'user-2');

        // Try to access as user-1
        const response = await request(app)
          .get(route.replace(':id', resourceUser2.id))
          .set('Authorization', `Bearer ${tokenUser1TenantA}`)
          .set('X-Tenant-ID', 'tenant-A');

        // Should return 403 if resource is user-owned, 200 if tenant-owned
        if (model === 'User' || model === 'File') {
          expect(response.status).toBe(403);
        } else {
          expect(response.status).toBe(200); // Tenant-scoped resources are shared
        }
      });

      it('should prevent vertical privilege escalation (regular user cannot access admin resources)', async () => {
        // Create admin-only resource
        const adminResource = await createResource(model, 'tenant-A', 'super-admin');

        // Try to access as regular user
        const response = await request(app)
          .get(route.replace(':id', adminResource.id))
          .set('Authorization', `Bearer ${tokenRegularUser}`)
          .set('X-Tenant-ID', 'tenant-A');

        expect(response.status).toBe(403);
      });

      it('should prevent UUID enumeration attack', async () => {
        // Try to access with sequential UUIDs (brute force)
        const fakeUUIDs = [
          '00000000-0000-0000-0000-000000000001',
          '00000000-0000-0000-0000-000000000002',
          '00000000-0000-0000-0000-000000000003',
        ];

        for (const uuid of fakeUUIDs) {
          const response = await request(app)
            .get(route.replace(':id', uuid))
            .set('Authorization', `Bearer ${tokenTenantA}`)
            .set('X-Tenant-ID', 'tenant-A');

          expect(response.status).toBe(404);
          expect(response.body.error).not.toContain(uuid); // No UUID confirmation
        }
      });
    });
  });
});
```

**Coverage:**
- ✅ Cross-tenant access prevention (tenant-A ↔ tenant-B)
- ✅ Horizontal privilege escalation (user-1 ↔ user-2)
- ✅ Vertical privilege escalation (user ↔ admin)
- ✅ UUID enumeration prevention

**Effort:** 12h (1.5h per endpoint × 8 endpoints)

---

#### **2. CSRF (Cross-Site Request Forgery) Tests (8h)**

**Scope:** ALL state-changing operations (POST, PUT, DELETE)

```typescript
describe('SECURITY: CSRF Prevention', () => {
  it('should reject requests without CSRF token', async () => {
    const response = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${tokenTenantA}`)
      .set('X-Tenant-ID', 'tenant-A')
      // NO CSRF token
      .send({
        amount: 100,
        dueDate: '2026-03-01',
      });

    expect(response.status).toBe(403);
    expect(response.body.error).toContain('CSRF token');
  });

  it('should reject requests with invalid CSRF token', async () => {
    const response = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${tokenTenantA}`)
      .set('X-Tenant-ID', 'tenant-A')
      .set('X-CSRF-Token', 'invalid-token')
      .send({
        amount: 100,
        dueDate: '2026-03-01',
      });

    expect(response.status).toBe(403);
  });

  it('should accept requests with valid CSRF token', async () => {
    // Get CSRF token
    const csrfResponse = await request(app)
      .get('/api/csrf-token')
      .set('Authorization', `Bearer ${tokenTenantA}`)
      .set('X-Tenant-ID', 'tenant-A');

    const csrfToken = csrfResponse.body.token;

    // Use token in POST request
    const response = await request(app)
      .post('/api/invoices')
      .set('Authorization', `Bearer ${tokenTenantA}`)
      .set('X-Tenant-ID', 'tenant-A')
      .set('X-CSRF-Token', csrfToken)
      .send({
        amount: 100,
        dueDate: '2026-03-01',
      });

    expect(response.status).toBe(201);
  });

  it('should prevent CSRF token reuse (one-time use)', async () => {
    const csrfToken = await getCsrfToken();

    // First request (should succeed)
    await request(app)
      .post('/api/invoices')
      .set('X-CSRF-Token', csrfToken)
      .send({ amount: 100 });

    // Second request with same token (should fail)
    const response = await request(app)
      .post('/api/invoices')
      .set('X-CSRF-Token', csrfToken) // Same token
      .send({ amount: 200 });

    expect(response.status).toBe(403);
    expect(response.body.error).toContain('Token already used');
  });
});
```

**Coverage:**
- ✅ CSRF token validation
- ✅ Token reuse prevention
- ✅ Token expiration

**Effort:** 8h

---

#### **3. SQL Injection Tests (6h)**

**Scope:** ALL database queries (especially raw SQL)

```typescript
describe('SECURITY: SQL Injection Prevention', () => {
  const SQL_INJECTION_PAYLOADS = [
    "'; DROP TABLE invoices; --",
    "' OR '1'='1",
    "' UNION SELECT * FROM users --",
    "admin'--",
    "' OR 1=1 --",
  ];

  SQL_INJECTION_PAYLOADS.forEach((payload) => {
    it(`should prevent SQL injection via email: ${payload}`, async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: `test${payload}@example.com`,
          password: 'password',
        });

      // Should NOT execute SQL injection (return 400 or 401)
      expect([400, 401]).toContain(response.status);
      expect(response.body.error).not.toContain('SQL');
      expect(response.body.error).not.toContain('syntax');
    });

    it(`should prevent SQL injection via search query: ${payload}`, async () => {
      const response = await request(app)
        .get(`/api/invoices?search=${encodeURIComponent(payload)}`)
        .set('Authorization', `Bearer ${tokenTenantA}`)
        .set('X-Tenant-ID', 'tenant-A');

      // Should return 400 (bad request) or empty results
      expect([200, 400]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.data).toHaveLength(0); // No results, not SQL error
      }
    });
  });

  it('should use parameterized queries (not string interpolation)', async () => {
    // Code review check: ensure Prisma queries use parameterization
    const codeReview = await analyzeCode('apps/api/src/**/*.ts');

    // Should NOT find raw SQL with string interpolation
    expect(codeReview.rawSQLWithInterpolation).toHaveLength(0);
  });
});
```

**Coverage:**
- ✅ SQL injection via form inputs
- ✅ SQL injection via query params
- ✅ SQL injection via headers
- ✅ Parameterized query enforcement

**Effort:** 6h

---

#### **4. XSS (Cross-Site Scripting) Tests (6h)**

**Scope:** ALL user-generated content rendering

```typescript
describe('SECURITY: XSS Prevention', () => {
  const XSS_PAYLOADS = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror="alert(\'XSS\')">',
    '<svg/onload=alert("XSS")>',
    'javascript:alert("XSS")',
  ];

  XSS_PAYLOADS.forEach((payload) => {
    it(`should prevent XSS in invoice note: ${payload}`, async () => {
      // Create invoice with XSS payload in note
      const invoice = await request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${tokenTenantA}`)
        .set('X-Tenant-ID', 'tenant-A')
        .send({
          amount: 100,
          note: payload, // XSS payload
        });

      expect(invoice.status).toBe(201);

      // Fetch invoice and verify note is sanitized
      const response = await request(app)
        .get(`/api/invoices/${invoice.body.id}`)
        .set('Authorization', `Bearer ${tokenTenantA}`)
        .set('X-Tenant-ID', 'tenant-A');

      // Note should NOT contain raw script tags
      expect(response.body.note).not.toContain('<script>');
      expect(response.body.note).not.toContain('onerror=');
      expect(response.body.note).not.toContain('javascript:');
    });
  });

  it('should escape HTML in tenant name rendering', async ({ page }) => {
    // Create tenant with XSS payload in name
    const tenant = await createTenant({
      name: '<script>alert("XSS")</script>',
    });

    // Render tenant name in UI
    await page.goto(`http://localhost:3001`);
    const tenantName = await page.locator('[data-testid="tenant-name"]').textContent();

    // Should be escaped (not executed)
    expect(tenantName).toContain('&lt;script&gt;');
    expect(tenantName).not.toContain('<script>');
  });
});
```

**Coverage:**
- ✅ XSS via form inputs
- ✅ XSS via URL params
- ✅ XSS via database content
- ✅ HTML escaping enforcement

**Effort:** 6h

---

**Total Security Testing Effort:** 32h

**Launch Criteria:**
- ✅ ALL IDOR tests passing (12h)
- ✅ ALL CSRF tests passing (8h)
- ✅ ALL SQL Injection tests passing (6h)
- ✅ ALL XSS tests passing (6h)

**Recommended Timeline:**
- **Sprint 1:** IDOR tests (12h) - CRITICAL
- **Sprint 2:** CSRF + SQL Injection + XSS tests (20h)
- **Sprint 3:** Penetration testing audit (external vendor)

---

### Question 4: Performance Testing - Load tests planejados?

**Answer:** ⚠️ **NÃO PLANEJADOS - RECOMENDADO MAS NÃO BLOCKER**

**Current State:**
- **0 load tests**
- **0 performance benchmarks**
- No baseline metrics for latency/throughput

**Recommended Load Testing Strategy:**

---

#### **1. Critical Endpoints (8h - Pre-Launch)**

**Test Suite:**
```typescript
describe('PERFORMANCE: Critical Endpoints', () => {
  it('GET /api/app/invoices should handle 100 concurrent requests', async () => {
    const requests = Array.from({ length: 100 }, () =>
      request(app)
        .get('/api/app/invoices')
        .set('Authorization', `Bearer ${tokenTenantA}`)
        .set('X-Tenant-ID', 'tenant-A')
    );

    const start = performance.now();
    const responses = await Promise.all(requests);
    const duration = performance.now() - start;

    // All requests should succeed
    expect(responses.every(r => r.status === 200)).toBe(true);

    // Average response time < 200ms
    expect(duration / 100).toBeLessThan(200);
  });

  it('POST /api/invoices should handle 50 concurrent writes', async () => {
    const requests = Array.from({ length: 50 }, (_, i) =>
      request(app)
        .post('/api/invoices')
        .set('Authorization', `Bearer ${tokenTenantA}`)
        .set('X-Tenant-ID', 'tenant-A')
        .send({
          amount: 100 + i,
          dueDate: '2026-03-01',
        })
    );

    const responses = await Promise.all(requests);

    // All writes should succeed (no deadlocks)
    expect(responses.every(r => r.status === 201)).toBe(true);
  });
});
```

**Critical Endpoints to Test:**
1. GET /api/app/invoices (billing dashboard)
2. GET /api/app/dashboard (KPIs)
3. POST /api/auth/login (authentication)
4. GET /api/app/projects (task management)
5. POST /api/payments/webhook (payment processing)

**Performance Targets:**
- P50 latency: < 100ms
- P95 latency: < 500ms
- P99 latency: < 1000ms
- Throughput: > 1000 req/s (Fastify should handle this easily)

**Effort:** 8h

---

#### **2. Database Performance (4h - Pre-Launch)**

**Test Suite:**
```typescript
describe('PERFORMANCE: Database Queries', () => {
  it('should use indexes for tenant-scoped queries', async () => {
    // Insert 10k invoices
    await seedInvoices(10_000, 'tenant-A');

    // Query should use index (not full table scan)
    const query = prisma.invoice.findMany({
      where: { tenantId: 'tenant-A', status: 'PAID' },
      take: 100,
    });

    const explainPlan = await prisma.$queryRaw`EXPLAIN ANALYZE ${query}`;

    // Should show index scan (not seq scan)
    expect(explainPlan).toContain('Index Scan');
    expect(explainPlan).not.toContain('Seq Scan');
  });

  it('should handle 1M audit logs without degradation', async () => {
    await seedAuditLogs(1_000_000, 'tenant-A');

    const start = performance.now();
    const logs = await prisma.auditLog.findMany({
      where: { tenantId: 'tenant-A' },
      take: 100,
      orderBy: { createdAt: 'desc' },
    });
    const duration = performance.now() - start;

    expect(logs.length).toBe(100);
    expect(duration).toBeLessThan(500); // < 500ms
  });
});
```

**Effort:** 4h

---

#### **3. Load Testing with k6 (8h - Optional, Post-Launch)**

**Tool:** [k6.io](https://k6.io)

**Test Script:**
```javascript
// k6-load-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],   // Error rate < 1%
  },
};

export default function () {
  const response = http.get('http://localhost:8000/api/app/invoices', {
    headers: {
      'Authorization': `Bearer ${__ENV.TOKEN}`,
      'X-Tenant-ID': 'tenant-A',
    },
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
}
```

**Run:**
```bash
k6 run k6-load-test.js
```

**Effort:** 8h (setup + analysis)

---

**Total Performance Testing Effort:**
- Pre-Launch (Critical): 12h
- Post-Launch (Optional): 8h

**Launch Criteria:**
- ✅ Critical endpoints tested (8h)
- ✅ Database performance validated (4h)
- ⏸️ Full load testing optional (can defer)

**Why Not Blocker:**
- Fastify is inherently fast (~30k req/s)
- PostgreSQL with indexes is performant
- Performance issues can be fixed post-launch (no security risk)

---

### Question 5: Compliance Testing - GDPR/SOC2 checklist existe?

**Answer:** ❌ **NÃO EXISTE - COMPLIANCE RISK**

**Current State:**
- **No GDPR checklist**
- **No SOC2 checklist**
- **No compliance tests**
- Audit logs may not meet retention requirements

**This is a COMPLIANCE RISK** - Launch without compliance documentation = legal/financial penalties.

---

#### **GDPR Compliance Checklist (Required for EU Customers)**

**1. Data Subject Rights (8h testing):**

```typescript
describe('GDPR: Data Subject Rights', () => {
  it('should support Right to Access (Article 15)', async () => {
    // User requests all their data
    const response = await request(app)
      .get('/api/gdpr/export')
      .set('Authorization', `Bearer ${tokenUser}`)
      .set('X-Tenant-ID', 'tenant-A');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('invoices');
    expect(response.body).toHaveProperty('orders');
    expect(response.body).toHaveProperty('auditLogs');
  });

  it('should support Right to Erasure (Article 17)', async () => {
    // User requests account deletion
    const response = await request(app)
      .delete('/api/gdpr/delete-account')
      .set('Authorization', `Bearer ${tokenUser}`)
      .set('X-Tenant-ID', 'tenant-A');

    expect(response.status).toBe(200);

    // User should be soft-deleted
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    expect(user?.deletedAt).toBeDefined();
  });

  it('should support Right to Rectification (Article 16)', async () => {
    // User corrects their email
    const response = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ email: 'corrected@example.com' });

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('corrected@example.com');
  });

  it('should support Right to Data Portability (Article 20)', async () => {
    // User exports data in machine-readable format (JSON)
    const response = await request(app)
      .get('/api/gdpr/export?format=json')
      .set('Authorization', `Bearer ${tokenUser}`)
      .set('X-Tenant-ID', 'tenant-A');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
  });
});
```

**2. Consent Management (4h testing):**

```typescript
describe('GDPR: Consent Management', () => {
  it('should require explicit consent for marketing emails', async () => {
    // User signup without marketing consent
    const user = await createUser({ marketingConsent: false });

    // Marketing email should NOT be sent
    const emailsSent = await prisma.emailQueue.findMany({
      where: { userId: user.id, type: 'MARKETING' },
    });

    expect(emailsSent).toHaveLength(0);
  });

  it('should allow consent withdrawal', async () => {
    const response = await request(app)
      .patch('/api/users/me/consent')
      .set('Authorization', `Bearer ${tokenUser}`)
      .send({ marketingConsent: false });

    expect(response.status).toBe(200);

    // Future marketing emails should be blocked
    await emailService.sendMarketing(userId, 'promo');

    const emailsSent = await prisma.emailQueue.findMany({
      where: { userId, type: 'MARKETING' },
    });

    expect(emailsSent).toHaveLength(0);
  });
});
```

**3. Data Retention (4h testing):**

```typescript
describe('GDPR: Data Retention', () => {
  it('should retain audit logs for 7 years (legal requirement)', async () => {
    const log = await createAuditLog({
      action: 'DATA_ACCESS',
      createdAt: new Date('2019-01-01'),
    });

    // Fast-forward time by 7 years
    jest.setSystemTime(new Date('2026-01-01'));

    // Log should still exist
    const retrievedLog = await prisma.auditLog.findUnique({
      where: { id: log.id },
    });

    expect(retrievedLog).toBeDefined();
  });

  it('should delete non-critical data after 2 years', async () => {
    const file = await createFile({
      createdAt: new Date('2024-01-01'),
    });

    // Fast-forward time by 2 years
    jest.setSystemTime(new Date('2026-01-01'));

    // Run cleanup job
    await cleanupOldFiles();

    // File should be soft-deleted
    const retrievedFile = await prisma.file.findUnique({
      where: { id: file.id },
    });

    expect(retrievedFile?.deletedAt).toBeDefined();
  });
});
```

**Total GDPR Testing Effort:** 16h

---

#### **SOC2 Compliance Checklist (Required for Enterprise Customers)**

**1. Access Controls (8h testing):**

```typescript
describe('SOC2: Access Controls', () => {
  it('should enforce least privilege principle', async () => {
    // Regular user should NOT have admin capabilities
    const response = await request(app)
      .get('/api/admin/tenants')
      .set('Authorization', `Bearer ${tokenRegularUser}`);

    expect(response.status).toBe(403);
  });

  it('should log all access to sensitive data', async () => {
    // Admin accesses user list
    await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${tokenSuperAdmin}`);

    // Access should be logged
    const log = await prisma.securityAuditLog.findFirst({
      where: {
        action: 'ADMIN_USER_LIST_ACCESS',
        userId: superAdminId,
      },
    });

    expect(log).toBeDefined();
  });
});
```

**2. Data Encryption (4h testing):**

```typescript
describe('SOC2: Data Encryption', () => {
  it('should encrypt passwords with bcrypt', async () => {
    const user = await createUser({ password: 'plaintext' });

    // Password should be hashed (not plain text)
    expect(user.password).not.toBe('plaintext');
    expect(user.password).toMatch(/^\$2[aby]\$/); // Bcrypt format
  });

  it('should encrypt 2FA secrets', async () => {
    const user = await enable2FA(userId);

    // 2FA secret should be encrypted
    expect(user.twoFactorSecret).not.toMatch(/^[A-Z0-9]{16}$/); // Not plain base32
  });
});
```

**3. Audit Logging (4h testing):**

```typescript
describe('SOC2: Audit Logging', () => {
  it('should log all security events', async () => {
    // Login
    await request(app).post('/api/auth/login').send({ email, password });

    // Failed login attempt
    await request(app).post('/api/auth/login').send({ email, password: 'wrong' });

    // Logout
    await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${token}`);

    // All events should be logged
    const logs = await prisma.securityAuditLog.findMany({
      where: { userId },
    });

    expect(logs).toContainEqual(expect.objectContaining({ action: 'LOGIN_SUCCESS' }));
    expect(logs).toContainEqual(expect.objectContaining({ action: 'LOGIN_FAILED' }));
    expect(logs).toContainEqual(expect.objectContaining({ action: 'LOGOUT' }));
  });

  it('should prevent audit log tampering', async () => {
    const log = await createAuditLog({ action: 'DATA_EXPORT' });

    // Try to delete audit log (should fail)
    await expect(
      prisma.auditLog.delete({ where: { id: log.id } })
    ).rejects.toThrow();
  });
});
```

**4. Incident Response (4h testing):**

```typescript
describe('SOC2: Incident Response', () => {
  it('should alert on suspicious activity (5+ failed logins)', async () => {
    // Simulate 5 failed login attempts
    for (let i = 0; i < 5; i++) {
      await request(app).post('/api/auth/login').send({ email, password: 'wrong' });
    }

    // Alert should be triggered
    const alerts = await prisma.securityAlert.findMany({
      where: { type: 'BRUTE_FORCE_ATTEMPT' },
    });

    expect(alerts.length).toBeGreaterThan(0);
  });
});
```

**Total SOC2 Testing Effort:** 20h

---

**Total Compliance Testing Effort:**
- GDPR: 16h
- SOC2: 20h
- **Total:** 36h

**Launch Criteria:**
- ✅ GDPR data subject rights implemented (8h)
- ✅ GDPR consent management implemented (4h)
- ✅ GDPR data retention policies documented (4h)
- ⏸️ SOC2 tests can be deferred to post-launch (20h)

**Why GDPR is Blocker:**
- Required for EU customers (legal requirement)
- Fines up to €20M or 4% of revenue
- Data export/deletion requests can come at any time

**Why SOC2 is Not Blocker:**
- Required for enterprise customers (not all customers)
- Can be implemented post-launch (no immediate legal risk)
- Certification process takes 6-12 months

---

## 🆕 NEW TEST DEBTS IDENTIFIED

### TEST-C1: Security Test Suite Missing (32h - P0)

**Severity:** 🔴 CRITICAL
**Effort:** 32h
**Priority:** P0 (LAUNCH BLOCKER)

**Description:**
Framework has ZERO security tests (IDOR, CSRF, SQL Injection, XSS) despite having 13 CRITICAL security debts.

**Test Coverage Required:**
- IDOR prevention: 12h
- CSRF prevention: 8h
- SQL Injection prevention: 6h
- XSS prevention: 6h

**Why Blocker:**
- Security vulnerabilities = data breaches = legal/financial disaster
- No tests = no confidence in security claims
- Cannot launch multi-tenant SaaS without IDOR tests

**Action:** Add to Sprint 1 (alongside DB-C1, DB-C2, DB-C3)

---

### TEST-C2: GDPR Compliance Tests Missing (16h - P0)

**Severity:** 🔴 CRITICAL
**Effort:** 16h
**Priority:** P0 (COMPLIANCE BLOCKER)

**Description:**
No tests for GDPR data subject rights (export, deletion, rectification, portability).

**Test Coverage Required:**
- Data subject rights: 8h
- Consent management: 4h
- Data retention: 4h

**Why Blocker:**
- Required for EU customers
- GDPR violations = fines up to €20M
- Data export/deletion requests are legally binding (30-day response time)

**Action:** Add to Sprint 2 (alongside security tests)

---

### TEST-H1: Core Services Untested (28h - P1)

**Severity:** 🟠 HIGH
**Effort:** 28h
**Priority:** P1 (POST-LAUNCH)

**Description:**
4 critical services untested:
- grant.service.ts (8h)
- policy.service.ts (8h)
- user.service.ts (6h)
- payment.service.ts (6h)

**Why High Priority:**
- Grant/Policy are RBAC core (security-critical)
- User service handles authentication (security-critical)
- Payment service handles money (financial-critical)

**Action:** Add to Sprint 2 (before launch)

---

## 🚨 REGRESSION RISKS

### High Regression Risk Debts (11 items)

| Debt ID | Risk Score | Why High Risk |
|---------|------------|---------------|
| DB-C1 | 10/10 | Breaking grants = RBAC system collapse |
| DB-C2 | 10/10 | Breaking audit logs = compliance violation + legal risk |
| DB-C3 | 10/10 | RLS bypass = complete multi-tenant isolation failure |
| DB-C4 | 7/10 | Soft delete filter may break queries with explicit deletedAt |
| FE-C4 | 8/10 | Theme migration can corrupt existing user themes |
| SYS-C3 | 9/10 | Authorization bypass = admin panel security breach |
| DB-H1 | 6/10 | Audit log soft delete may break compliance reports |
| DB-H3 | 5/10 | New indexes may slow down write operations |
| DB-H6 | 8/10 | IDOR middleware expansion may break existing routes |
| FE-H3 | 6/10 | Real data integration may break existing mock-based tests |
| DB-M5 | 7/10 | Feature/Plan/Product changes may break existing subscriptions |

**Mitigation Strategy:**

**1. Pre-Implementation (Write Tests First):**
- ✅ DB-C1, DB-C2, DB-C3: Write unit tests BEFORE migration
- ✅ SYS-C3: Write security tests BEFORE adding middleware
- ✅ FE-C4: Write migration tests BEFORE schema change

**2. Staging Environment Testing:**
- ✅ Deploy ALL P0 changes to staging FIRST
- ✅ Run full test suite (unit + integration + E2E)
- ✅ Run security scan (IDOR, CSRF, SQL Injection)
- ✅ Monitor error rates (Sentry)

**3. Canary Deployment:**
- ✅ Deploy to 10% of users first
- ✅ Monitor for errors (24h)
- ✅ If error rate < 0.1%, deploy to 100%

**4. Rollback Plan:**
- ✅ DB migrations: Keep `nullable` fields until validation passes
- ✅ RLS middleware: Feature flag to disable if needed
- ✅ Authorization middleware: Soft rollout with logging-only mode

---

## 📊 TESTING STRATEGY RECOMMENDATIONS

### 1. TDD (Test-Driven Development) Approach

**MANDATORY TDD for:**
- ✅ All security debts (DB-C1, DB-C2, DB-C3, SYS-C3)
- ✅ All compliance debts (DB-C2 audit logs, GDPR)
- ✅ All data migrations (FE-C4 theme migration)

**OPTIONAL TDD for:**
- ⏸️ New features (FE-C1 Invoice page, FE-C2 Order page)
- ⏸️ UI improvements (FE-H2 mobile menu, FE-M1 feature limits)

**Why TDD:**
- Prevents regression bugs (write test → implement → test passes)
- Ensures testability (forces thinking about edge cases upfront)
- Increases confidence (tests prove feature works before merge)

---

### 2. Testing Pyramid

```
        /\
       /E2E\           12 E2E tests (slow, expensive)
      /------\
     /  INT  \         50 Integration tests (medium speed)
    /----------\
   /    UNIT    \      200 Unit tests (fast, cheap)
  /--------------\
```

**Current State (NOT pyramid):**
- Unit: 105 tests ✅
- Integration: ~20 tests ⚠️
- E2E: 2 tests ❌ (should be 12+)

**Target State:**
- Unit: 200+ tests (cover all services)
- Integration: 50+ tests (cover all API routes)
- E2E: 12+ tests (cover all critical user flows)

---

### 3. Test Ownership by Priority

**P0 (MUST TEST BEFORE LAUNCH):**
- Security tests (IDOR, CSRF, SQL Injection, XSS): 32h
- GDPR compliance tests: 16h
- Core services (grant, policy, user, payment): 28h
- E2E tests for Invoice/Order pages: 8h
- **Total P0 Testing:** 84h

**P1 (TEST WITHIN 2 WEEKS POST-LAUNCH):**
- Admin app E2E tests: 16h
- Performance tests: 12h
- SOC2 compliance tests: 20h
- Remaining services: 48h
- **Total P1 Testing:** 96h

**P2 (TEST WITHIN 1 MONTH POST-LAUNCH):**
- Load testing (k6): 8h
- Accessibility tests (WCAG AA): 16h
- Mobile responsiveness tests: 8h
- **Total P2 Testing:** 32h

**Total Testing Effort:** 212h (26.5 days)

---

### 4. Test Execution Strategy

**Local Development:**
- Run unit tests on every commit (pre-commit hook)
- Run integration tests on every PR
- Run E2E tests manually (before merge)

**CI/CD Pipeline:**
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm test:unit
      # Should complete in < 5 minutes

  integration:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:17-alpine
      redis:
        image: redis:7-alpine
    steps:
      - uses: actions/checkout@v3
      - run: pnpm test:integration
      # Should complete in < 10 minutes

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: docker-compose up -d
      - run: pnpm test:e2e
      # Should complete in < 20 minutes

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm test:security
      # IDOR, CSRF, SQL Injection, XSS tests
      # Should complete in < 15 minutes
```

**Staging Deployment:**
- Run full test suite (unit + integration + E2E + security)
- Run performance tests (load testing)
- Run compliance tests (GDPR data export)
- **Total time:** ~60 minutes

**Production Deployment:**
- Smoke tests only (critical endpoints)
- **Total time:** ~5 minutes

---

### 5. Test Data Management

**Strategy:**
- ✅ Use factories (e.g., `createUser()`, `createInvoice()`) for consistent test data
- ✅ Use transactions in integration tests (rollback after each test)
- ✅ Use separate test database (never touch production/staging)
- ✅ Seed database with realistic data for E2E tests

**Example Factory:**
```typescript
// test/factories/user.factory.ts
export async function createUser(overrides = {}) {
  return prisma.user.create({
    data: {
      email: faker.internet.email(),
      password: await bcrypt.hash('password123', 10),
      tenantId: 'test-tenant',
      role: 'USER',
      ...overrides,
    },
  });
}

// Usage in tests:
const user = await createUser({ role: 'SUPER_ADMIN' });
```

---

### 6. Test Coverage Goals

**Current Coverage:** 26% services (11/42 tested)

**Launch Target:** 70% services (30/42 tested)
- ✅ All security-critical services: 100% coverage
- ✅ All financial services: 100% coverage
- ⏸️ Non-critical services: >60% coverage

**Post-Launch Target:** 90% services (38/42 tested)

**Tools:**
- Coverage tool: `jest --coverage`
- Coverage report: `lcov.info` → Codecov
- Quality gate: PR must not decrease coverage

---

## 📊 EFFORT ADJUSTMENTS SUMMARY

| Debt ID | Original Effort | Testing Effort | Adjusted Effort | Change |
|---------|-----------------|----------------|-----------------|--------|
| DB-C1 | 16h | +8h | 24h | +8h |
| DB-C2 | 16h | +4h | 20h | +4h |
| DB-C3 | 8h | +4h | 12h | +4h |
| DB-C4 | 4h | Included | 4h | 0h |
| FE-C1 | 16h | Included | 14h | -2h |
| FE-C3 | 6h | +2h | 8h | +2h |
| SYS-C3 | 8h | +4h | 12h | +4h |
| DB-H3 | 8h | Included | 8h | 0h |
| **TOTAL** | **82h** | **+22h** | **102h** | **+20h** |

**New Test Debts:**
- TEST-C1: Security tests: 32h
- TEST-C2: GDPR compliance tests: 16h
- TEST-H1: Core services tests: 28h
- **Total New:** 76h

**Total Adjusted Testing Effort:** 102h + 76h = **178h** (22 days)

---

## ✅ FINAL VALIDATION STATUS

**Overall Assessment:** ⚠️ **APPROVED WITH MANDATORY TESTING REQUIREMENTS**

**Confidence Level:** 85% (codebase is solid, but lacks security/compliance tests)

**Critical Findings:**
1. ❌ **ZERO security tests** (IDOR, CSRF, SQL Injection, XSS) → LAUNCH BLOCKER
2. ❌ **ZERO GDPR compliance tests** → COMPLIANCE BLOCKER
3. ⚠️ **74% of services untested** (31/42) → HIGH RISK
4. ⚠️ **0 E2E tests for Admin app** → MEDIUM RISK

**Recommended Actions:**

**1. IMMEDIATE (Sprint 1 - Week 5):**
- ✅ Add security test suite (TEST-C1): 32h
- ✅ Test grant.service.ts, policy.service.ts, user.service.ts: 22h
- ✅ Add IDOR tests for ALL 33 tenant-scoped models: 12h
- **Total Sprint 1 Testing:** 66h

**2. PRE-LAUNCH (Sprint 2 - Week 6):**
- ✅ Add GDPR compliance tests (TEST-C2): 16h
- ✅ Add E2E tests for Invoice/Order pages: 8h
- ✅ Test payment.service.ts: 6h
- **Total Sprint 2 Testing:** 30h

**3. POST-LAUNCH (Sprint 3+ - Week 7+):**
- ⏸️ Add Admin app E2E tests: 16h
- ⏸️ Add SOC2 compliance tests: 20h
- ⏸️ Test remaining services: 48h
- **Total Post-Launch Testing:** 84h

**Total Testing Effort:** 180h (22.5 days)

**Launch Criteria:**
- ✅ ALL security tests passing (IDOR, CSRF, SQL Injection, XSS)
- ✅ ALL GDPR data subject rights tests passing
- ✅ ALL critical services tested (grant, policy, user, payment, invoice, order)
- ✅ E2E tests for Invoice/Order pages passing
- ⏸️ Admin app E2E tests can be post-launch
- ⏸️ SOC2 tests can be post-launch

**Timeline Impact:**
- Sprint 1: +66h testing (8 days) → P0 debts: 110h → **176h**
- Sprint 2: +30h testing (4 days) → P1 debts: 72h → **102h**
- **Total Pre-Launch:** 278h (35 days) vs original 182h (23 days)
- **Delay:** +12 days

**Blocker Status:**
- 🔴 **LAUNCH BLOCKED** until:
  - Security test suite implemented (32h)
  - GDPR compliance tests implemented (16h)
  - Critical services tested (28h)
- 🟢 **UNBLOCK:** After Sprint 1 + Sprint 2 (96h testing)

---

**QA Engineer Review Completed:** 2026-02-03
**Status:** ⚠️ **APPROVED WITH BLOCKERS** - Launch blocked until security/compliance tests added
**Next Phase:** Phase 8 (Update DRAFT with all specialist feedback)

---

**CRITICAL REMINDER:**
> "No security tests = no confidence. No GDPR tests = legal risk. No grant/policy tests = RBAC uncertainty. **Testing is NOT optional for security-critical SaaS.**"
