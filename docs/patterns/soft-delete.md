# Soft Delete Pattern

> **Status:** ✅ Implemented
> **Version:** 1.0.0
> **Story:** STORY-006

---

## Overview

Soft delete allows marking records as deleted without physically removing them from the database. This enables:
- **Data Recovery** - Restore accidentally deleted records
- **Audit Trail** - Keep history of deletions
- **Compliance** - Legal requirements for data retention

---

## How It Works

Instead of `DELETE FROM users WHERE id = 'user_123'`, we:

```sql
UPDATE users SET deleted_at = NOW() WHERE id = 'user_123';
```

The soft delete middleware automatically filters out deleted records:

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

## Usage

### Soft Delete a Record

```typescript
import { softDelete } from '../middleware/prisma-soft-delete';

await softDelete(prisma.user, 'user_123');
```

### Restore a Record

```typescript
import { restore } from '../middleware/prisma-soft-delete';

await restore(prisma.user, 'user_123');
```

### Hard Delete (Permanent)

```typescript
import { hardDelete } from '../middleware/prisma-soft-delete';

await hardDelete(prisma.user, 'user_123');
// ⚠️ PERMANENT - Cannot be restored
```

---

## API Examples

```typescript
// DELETE /api/users/:id (soft delete)
router.delete('/users/:id', async (req, res) => {
  await softDelete(prisma.user, req.params.id);
  res.status(204).send();
});

// POST /api/users/:id/restore (restore)
router.post('/users/:id/restore', async (req, res) => {
  const user = await restore(prisma.user, req.params.id);
  res.json(user);
});

// GET /api/users?includeDeleted=true (admin only)
router.get('/users', requireAdmin, async (req, res) => {
  const users = await prisma.user.findMany({
    includeDeleted: req.query.includeDeleted === 'true'
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
