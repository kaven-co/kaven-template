## # Row-Level Security (RLS) Middleware

> **Status:** ✅ Implemented
> **Version:** 1.0.0
> **Story:** STORY-005

---

## Overview

The RLS middleware automatically enforces multi-tenant isolation at the ORM level by injecting `tenantId` WHERE clauses into all Prisma queries.

### Benefits

- ✅ **Automatic Protection** - No need to remember `WHERE tenantId` in every query
- ✅ **Security by Default** - Impossible to forget tenant isolation
- ✅ **Centralized Logic** - Single place to manage RLS rules
- ✅ **Performance** - Uses database indexes efficiently

---

## How It Works

```typescript
// WITHOUT RLS (DANGEROUS)
const grants = await prisma.grant.findMany({
  where: { userId: 'user_123' }
  // ❌ Missing tenantId - can access other tenants!
});

// WITH RLS (SAFE)
await withTenantContext('tenant_A', async () => {
  const grants = await prisma.grant.findMany({
    where: { userId: 'user_123' }
    // ✅ Automatically adds: tenantId: 'tenant_A'
  });
});
```

---

## Implementation

### Setup in App Initialization

```typescript
// apps/api/src/app.ts

import { setupPrismaRLS } from './middleware/prisma-rls';
import { prisma } from './lib/prisma';

// Setup RLS middleware
setupPrismaRLS(prisma);
```

### Usage in Request Handlers

```typescript
// apps/api/src/routes/grants.routes.ts

import { withTenantContext } from '../middleware/prisma-rls';

router.get('/grants', async (req, res) => {
  const tenantId = req.user.tenantId;

  await withTenantContext(tenantId, async () => {
    // All queries inside this context automatically filter by tenantId
    const grants = await prisma.grant.findMany();
    res.json(grants);
  });
});
```

---

## Whitelisted Models

Some models don't have `tenantId` or it's nullable:

- `Tenant` - The tenant model itself
- `User` - Can belong to multiple tenants
- `Capability` - Can be global (no tenantId)

These models bypass RLS filtering.

---

## Testing

```typescript
describe('RLS Middleware', () => {
  it('should add tenantId to queries automatically', async () => {
    await withTenantContext('tenant_A', async () => {
      const grants = await prisma.grant.findMany();
      // All results have tenantId === 'tenant_A'
    });
  });

  it('should throw error if tenantId missing', async () => {
    await expect(
      prisma.grant.findMany()
    ).rejects.toThrow('RLS Violation: tenantId missing');
  });
});
```

---

## Security Considerations

- **Always use `withTenantContext`** - Never query without context
- **Validate tenantId** - Ensure `req.user.tenantId` is set before queries
- **Audit logs** - RLS violations are logged automatically

---

**Built with 🔒 by Kaven Framework**
