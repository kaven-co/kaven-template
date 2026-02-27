/**
 * Prisma Row-Level Security (RLS) Middleware
 *
 * Automatically adds tenantId WHERE clause to all Prisma queries,
 * ensuring multi-tenant isolation at ORM level.
 *
 * @module prisma-rls
 */

import { AsyncLocalStorage } from 'async_hooks';
import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Async local storage for tenant context
 */
export const tenantContext = new AsyncLocalStorage<{ tenantId: string }>();

/**
 * Models that should NOT have tenantId filtering applied
 * (either they don't have tenantId or it's nullable for global scope)
 */
const RLS_WHITELIST = [
  'Tenant',        // Tenant model itself
  'User',          // Users can have multiple tenant associations
  'Capability',    // Can be global (tenantId nullable)
];

/**
 * Setup Prisma RLS middleware
 *
 * @param prisma - PrismaClient instance
 */
export function setupPrismaRLS(prisma: PrismaClient): void {
  prisma.$use(async (params, next) => {
    // Skip if model is whitelisted
    if (params.model && RLS_WHITELIST.includes(params.model)) {
      return next(params);
    }

    // Get tenant context
    const context = tenantContext.getStore();

    // For read operations, require tenantId
    if (
      params.action === 'findMany' ||
      params.action === 'findFirst' ||
      params.action === 'findUnique' ||
      params.action === 'count' ||
      params.action === 'aggregate'
    ) {
      if (!context?.tenantId) {
        throw new Error(
          `RLS Violation: tenantId missing in context for ${params.model}.${params.action}`
        );
      }

      // Add tenantId to WHERE clause
      params.args.where = {
        ...params.args.where,
        tenantId: context.tenantId,
      };
    }

    // For write operations, validate tenantId
    if (
      params.action === 'create' ||
      params.action === 'update' ||
      params.action === 'updateMany' ||
      params.action === 'delete' ||
      params.action === 'deleteMany'
    ) {
      if (!context?.tenantId) {
        throw new Error(
          `RLS Violation: tenantId missing in context for ${params.model}.${params.action}`
        );
      }

      // For create, auto-inject tenantId if not present
      if (params.action === 'create') {
        params.args.data = {
          ...params.args.data,
          tenantId: params.args.data.tenantId || context.tenantId,
        };
      }

      // For update/delete, ensure WHERE includes tenantId
      if (params.action === 'update' || params.action === 'delete') {
        params.args.where = {
          ...params.args.where,
          tenantId: context.tenantId,
        };
      }

      if (params.action === 'updateMany' || params.action === 'deleteMany') {
        params.args.where = {
          ...params.args.where,
          tenantId: context.tenantId,
        };
      }
    }

    return next(params);
  });
}

/**
 * Execute function within tenant context
 *
 * Usage:
 * ```typescript
 * await withTenantContext('tenant_123', async () => {
 *   const users = await prisma.user.findMany(); // Automatically filtered by tenantId
 * });
 * ```
 */
export async function withTenantContext<T>(
  tenantId: string,
  fn: () => Promise<T>
): Promise<T> {
  return tenantContext.run({ tenantId }, fn);
}
