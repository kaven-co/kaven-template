/**
 * Prisma Soft Delete Middleware
 *
 * Automatically filters out soft-deleted records (deletedAt != null)
 * from all queries unless explicitly requested.
 *
 * @module prisma-soft-delete
 */

import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Models exempt from the automatic soft-delete filter.
 * Reasons:
 * - Tenant: no deletedAt field
 * - SecurityAuditLog: no deletedAt field
 * - ImpersonationSession: no deletedAt field
 * - AuditLog: has deletedAt + retentionUntil — handled manually in AuditService
 *   (deletion requires checking retentionUntil for LGPD/GDPR compliance)
 */
const SOFT_DELETE_WHITELIST = [
  'Tenant',
  'SecurityAuditLog',
  'ImpersonationSession',
  'AuditLog',
];

/**
 * Setup Prisma Soft Delete middleware
 *
 * @param prisma - PrismaClient instance
 */
export function setupPrismaSoftDelete(prisma: PrismaClient): void {
  prisma.$use(async (params, next) => {
    // Skip if model is whitelisted (doesn't have deletedAt)
    if (params.model && SOFT_DELETE_WHITELIST.includes(params.model)) {
      return next(params);
    }

    // Apply soft delete filter to read operations
    if (
      params.action === 'findMany' ||
      params.action === 'findFirst' ||
      params.action === 'findUnique' ||
      params.action === 'count' ||
      params.action === 'aggregate'
    ) {
      // Allow explicit inclusion of deleted records
      const includeDeleted = params.args.includeDeleted;
      delete params.args.includeDeleted;

      if (!includeDeleted) {
        params.args.where = {
          ...params.args.where,
          deletedAt: null,
        };
      }
    }

    // For update/delete operations, also filter by deletedAt
    if (
      params.action === 'update' ||
      params.action === 'updateMany' ||
      params.action === 'delete' ||
      params.action === 'deleteMany'
    ) {
      params.args.where = {
        ...params.args.where,
        deletedAt: null,
      };
    }

    return next(params);
  });
}

/**
 * Soft delete a record (set deletedAt to current timestamp)
 *
 * Usage:
 * ```typescript
 * await softDelete(prisma.user, 'user_123');
 * ```
 */
export async function softDelete<T>(
  model: any,
  id: string
): Promise<T> {
  return model.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

/**
 * Restore a soft-deleted record
 *
 * Usage:
 * ```typescript
 * await restore(prisma.user, 'user_123');
 * ```
 */
export async function restore<T>(
  model: any,
  id: string
): Promise<T> {
  return model.update({
    where: { id },
    data: { deletedAt: null },
  });
}

/**
 * Permanently delete a record (bypass soft delete)
 *
 * Usage:
 * ```typescript
 * await hardDelete(prisma.user, 'user_123');
 * ```
 */
export async function hardDelete(
  model: any,
  id: string
): Promise<void> {
  await model.delete({
    where: { id },
  });
}
