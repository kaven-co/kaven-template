# Soft Delete Pattern

> **Status:** Planned, not active globally
> **Version:** 1.1.0
> **Story:** STORY-006, F3.2

---

## Overview

Soft delete allows marking records as deleted without physically removing them from the database. This enables:
- **Data Recovery** - Restore accidentally deleted records
- **Audit Trail** - Keep history of deletions
- **Compliance** - Legal requirements for data retention

---

## Current State

There is no active global soft-delete implementation in `apps/api` today.

The previous file `apps/api/src/middleware/prisma-soft-delete.ts` was removed in story `F3.2` because it was dead code and was never wired into the Fastify request pipeline.

If global soft delete is needed in the future, the correct implementation point is Prisma itself, registered in `apps/api/src/lib/prisma.ts` via Prisma middleware or Prisma extension. It should not be implemented as a Fastify middleware file.

## Intended Behavior

Instead of `DELETE FROM users WHERE id = 'user_123'`, we:

```sql
UPDATE users SET deleted_at = NOW() WHERE id = 'user_123';
```

A future Prisma-level implementation would automatically filter out deleted records:

```typescript
// Queries automatically exclude deletedAt != null
const users = await prisma.user.findMany();
// SELECT * FROM users WHERE deleted_at IS NULL

// Explicitly include deleted records
const allUsers = await prisma.user.findMany({
  includeDeleted: true
});
// SELECT * FROM users
```

---

## Example API

### Soft Delete a Record

```typescript
await prisma.user.update({
  where: { id: 'user_123' },
  data: { deletedAt: new Date() },
});
```

### Restore a Record

```typescript
await prisma.user.update({
  where: { id: 'user_123' },
  data: { deletedAt: null },
});
```

### Hard Delete (Permanent)

```typescript
await prisma.user.delete({
  where: { id: 'user_123' },
});
```

---

## API Examples

```typescript
// DELETE /api/users/:id (soft delete)
router.delete('/users/:id', async (req, res) => {
  await prisma.user.update({
    where: { id: req.params.id },
    data: { deletedAt: new Date() },
  });
  res.status(204).send();
});

// POST /api/users/:id/restore (restore)
router.post('/users/:id/restore', async (req, res) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { deletedAt: null },
  });
  res.json(user);
});

// GET /api/users?includeDeleted=true (admin only)
router.get('/users', requireAdmin, async (req, res) => {
  const includeDeleted = req.query.includeDeleted === 'true';
  const users = await prisma.user.findMany({
    where: includeDeleted ? {} : { deletedAt: null },
  });
  res.json(users);
});
```

---

## Schema Requirements

All models using soft delete must have:

```prisma
model User {
  id        String    @id @default(uuid())
  email     String
  deletedAt DateTime? @map("deleted_at")  // Nullable timestamp

  @@index([deletedAt])  // Performance index
}
```

---

**Built with 🗑️ by Kaven Framework**
