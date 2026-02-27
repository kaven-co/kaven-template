/**
 * Middleware: Require Tenant ID
 *
 * Enforces multi-tenant isolation by ensuring all requests
 * have a valid tenantId from authenticated user.
 *
 * Usage:
 * ```typescript
 * fastify.get('/grants', { onRequest: [requireTenantId] }, async (req, res) => {
 *   // req.user.tenantId is guaranteed to exist
 * });
 * ```
 *
 * @module require-tenant-id
 */

import type { FastifyRequest, FastifyReply } from 'fastify';

/**
 * Middleware to require tenantId in authenticated requests
 */
export async function requireTenantId(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Check if user is authenticated
  if (!req.user) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  // Check if user has tenantId
  if (!req.user.tenantId) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'User missing tenantId - data integrity issue. Please contact support.'
    });
  }

  // tenantId exists, proceed
}

/**
 * Middleware to auto-inject tenantId into request body for CREATE operations
 *
 * Usage:
 * ```typescript
 * fastify.post('/grants', { onRequest: [requireTenantId, injectTenantId] }, async (req, res) => {
 *   // req.body.tenantId is automatically set from req.user.tenantId
 * });
 * ```
 */
export async function injectTenantId(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!req.user?.tenantId) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Cannot inject tenantId - user not authenticated or missing tenantId'
    });
  }

  // Auto-inject tenantId into request body
  const body = (req.body as any) || {};
  body.tenantId = req.user.tenantId;
  (req as any).body = body;
}

/**
 * Middleware to validate tenantId in query params matches user's tenantId
 *
 * Usage:
 * ```typescript
 * fastify.get('/grants', { onRequest: [requireTenantId, validateTenantIdParam] }, async (req, res) => {
 *   // req.query.tenantId === req.user.tenantId is guaranteed
 * });
 * ```
 */
export async function validateTenantIdParam(
  req: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const queryTenantId = (req.query as any)?.tenantId as string | undefined;
  const userTenantId = req.user?.tenantId;

  if (!userTenantId) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'User missing tenantId'
    });
  }

  if (queryTenantId && queryTenantId !== userTenantId) {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'Cannot access resources from other tenants'
    });
  }
}
