# Admin Authorization Architecture

**Last updated:** 2026-02-11
**Story:** STORY-014

## Summary

This document records the authorization audit findings for Admin Panel API routes and the protection strategy applied.

---

## Authentication Strategy

The Admin Panel uses **NextAuth** (`next-auth`) for session management. API routes that require authentication call:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const session = await getServerSession(authOptions);
if (!session?.user?.id) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

Client-side route protection is handled by `AuthGuard` component in `apps/admin/components/auth/auth-guard.tsx`.

---

## Audit Results (2026-02-11)

### ✅ Fastify API (`apps/api`)

All Fastify routes go through `authMiddleware` (138 usages verified). Protected at the middleware level.

### ✅ Admin Next.js Pages (`apps/admin/app/[locale]/(dashboard)`)

Protected by `AuthGuard` component in `layout-client.tsx`.

### API Routes (`apps/admin/app/api/`)

| Route | Method | Auth Before | Auth After |
|-------|--------|-------------|------------|
| `/api/setup/init` | POST | ❌ None | ✅ Blocks re-init if tenants exist |
| `/api/currencies` | GET | ✅ Public (read-only, acceptable) | ✅ Public |
| `/api/currencies` | POST | ❌ None | ✅ `getServerSession` |
| `/api/currencies/[code]` | GET | ✅ Public (read-only, acceptable) | ✅ Public |
| `/api/currencies/[code]` | PUT | ❌ None | ✅ `getServerSession` |
| `/api/currencies/[code]` | DELETE | ❌ None | ✅ `getServerSession` |
| `/api/currencies/convert` | GET | ✅ Public (stateless conversion) | ✅ Public |
| `/api/design-system/customization` | GET/POST/DELETE | ✅ `getServerSession` | ✅ No change |
| `/api/tenant` | GET | ❌ None | ✅ `getServerSession` |
| `/api/settings/platform` | GET | ✅ Public (read-only, acceptable) | ✅ Public |
| `/api/settings/platform` | PUT | ❌ None | ✅ `getServerSession` |

---

## Protection Details

### `POST /api/setup/init`

**Threat:** An attacker could call this endpoint after setup to re-seed the database with their own data, overwriting all tenants and users.

**Fix:** Check for existing tenants before proceeding. If any tenant exists, return `403 Forbidden`. This is idempotent and does not require a user session (no user exists during initial setup).

```typescript
const tenantCount = await prisma.tenant.count();
if (tenantCount > 0) {
  return NextResponse.json(
    { success: false, error: 'System already initialized' },
    { status: 403 }
  );
}
```

### Write Mutations (POST, PUT, DELETE)

All write mutations in `/api/currencies`, `/api/tenant`, and `/api/settings/platform` now require an active NextAuth session. Unauthenticated requests receive `401 Unauthorized`.

### Read Endpoints Left Public

The following read-only GET endpoints are intentionally left public:
- `GET /api/currencies` — currency list is non-sensitive, used by setup wizard before auth
- `GET /api/currencies/[code]` — same rationale
- `GET /api/currencies/convert` — stateless utility
- `GET /api/settings/platform` — needed to load branding before login screen renders

---

## Known Limitations

1. **NextAuth not fully configured**: `authOptions.providers` is empty (`apps/admin/lib/auth.ts`). In production, providers must be configured for `getServerSession()` to return a valid session. The auth checks are in place but will always return 401 until NextAuth is connected to the actual auth backend.

2. **Role enforcement not yet granular**: The current checks verify only that a session exists, not that the user has a `SUPER_ADMIN` role. Full RBAC enforcement is planned for a future story.

3. **Auth storage via localStorage**: The Zustand auth store uses localStorage for JWT tokens. This is XSS-susceptible. Migrating to httpOnly cookies is a future security improvement.

---

## Future Work

- Implement full RBAC: enforce `SUPER_ADMIN` role for currency and settings mutations
- Configure NextAuth providers in `apps/admin/lib/auth.ts`
- Migrate auth storage from localStorage to httpOnly cookies
- Add authorization tests (currently no automated tests for auth)
