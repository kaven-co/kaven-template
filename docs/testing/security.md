# Security Testing Guide

This guide outlines the security testing strategy for the Kaven Framework. We use automated tests to prevent critical vulnerabilities like IDOR, CSRF, SQL Injection, and XSS.

## Overview

Security tests are located in `apps/api/test/security/`.
They run as part of the CI pipeline and can be executed locally via:

```bash
pnpm test:security
```

## Categories Covered

### 1. IDOR (Insecure Direct Object Reference)

**Goal:** Ensure users from Tenant A cannot access resources from Tenant B.

**Critical Models Tested:**

- User
- Invoice
- Order
- File
- AuditLog
- (Expandable to all 33 tenant-scoped models)

**Pattern:**

1. Setup isolated tenants (A and B).
2. Create resource in Tenant B.
3. Attempt to access resource using Tenant A credentials.
4. Expect `null` return or `403 Forbidden` error.

**Example:**

```typescript
it("IDOR: User cannot access other tenant invoice", async () => {
  const invoiceB = await createInvoiceForTenantB();
  const result = await prisma.invoice.findFirst({
    where: {
      id: invoiceB.id,
      tenantId: tenantA.id, // Malicious check
    },
  });
  expect(result).toBeNull();
});
```

### 2. CSRF (Cross-Site Request Forgery)

**Goal:** Prevent unauthorized state changes via forged requests.

**Protection Mechanism:**

- Middleware verifies `Origin` and `Referer` headers.
- Blocks cross-origin POST/PUT/DELETE unless explicitly allowed.
- Allows GET/HEAD (safe methods).

**Test Strategy:**

- Verify allowed origins pass.
- Verify disallowed origins (e.g., `evil.com`) fail with 403.
- Verify missing headers (non-browser clients) are allowed.

### 3. SQL Injection

**Goal:** Prevent malicious SQL execution via input fields.

**Protection Mechanism:**

- Use **Prisma ORM** (parameterized queries).
- **Zod Validation** restricts input types and formats.

**Test Strategy:**

- Inject SQL payloads in query parameters (`search`, `sort`, `filter`).
- Example Payloads: `' OR '1'='1`, `; DROP TABLE users`.
- Expect `200 OK` (empty result) or `400 Bad Request`. Never `500` or leaked data.

### 4. XSS (Cross-Site Scripting)

**Goal:** Prevent injection of malicious scripts (Stored & Reflected).

**Protection Mechanism:**

- **Input Sanitization:** `isomorphic-dompurify` applied in Zod schemas (`validation.ts`).
- **Output Encoding:** React (Frontend) escapes output by default.

**Test Strategy:**

- Submit malicous scripts in text fields (`name`, `description`).
- Verify stored data does not contain executable tags (`<script>`).
- Verify reflected data (search results) is safe.

## Implementation Details

### Fixtures (`security.fixtures.ts`)

We use a shared fixture to create isolated test environments.
**Important:** Always provide a `suffix` when creating fixtures to allow parallel test execution.

```typescript
const { tenantA, tenantB } = await createTenantIsolationTestData(
  prisma,
  "my-test-suffix",
);
```

This creates `test-tenant-a-my-test-suffix-[timestamp]` to guarantee isolation.

### Authentication (`auth-helper`)

Tests perform real JWT generation using `generateAccessToken` from `lib/jwt`. This tests the full authorization chain.

## Adding New Security Tests

1. Create a new spec file in `apps/api/test/security/`.
2. Use `createTenantIsolationTestData` with a unique suffix.
3. Use `app.inject()` for API tests or `prisma` client for data layer tests (IDOR).
4. Run validation: `pnpm test:security`.
