import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireTenantAdmin } from '../../middleware/rbac.middleware';
import { usageService } from './usage.service';

export async function usageRoutes(fastify: FastifyInstance) {
  // GET /usage — get all usage for current tenant
  fastify.get(
    '/usage',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const tenantId = request.user?.tenantId;
      if (!tenantId) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Tenant ID is required',
          statusCode: 400,
        });
      }

      const summary = await usageService.getUsageSummary(tenantId);
      return reply.send({ data: summary });
    },
  );

  // GET /usage/:featureCode — get specific feature usage
  fastify.get(
    '/usage/:featureCode',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const tenantId = request.user?.tenantId;
      if (!tenantId) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Tenant ID is required',
          statusCode: 400,
        });
      }

      const { featureCode } = request.params as { featureCode: string };

      try {
        const usage = await usageService.getCurrentUsage(tenantId, featureCode);
        return reply.send({ data: usage });
      } catch (error: any) {
        if (error.message?.includes('not found')) {
          return reply.status(404).send({
            error: 'Not Found',
            message: error.message,
            statusCode: 404,
          });
        }
        throw error;
      }
    },
  );

  // POST /usage/:featureCode/increment — increment (admin/internal only)
  fastify.post(
    '/usage/:featureCode/increment',
    { preHandler: [authMiddleware, requireTenantAdmin] },
    async (request, reply) => {
      const tenantId = request.user?.tenantId;
      if (!tenantId) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Tenant ID is required',
          statusCode: 400,
        });
      }

      const { featureCode } = request.params as { featureCode: string };
      const { amount } = (request.body as { amount?: number }) || {};

      try {
        const result = await usageService.incrementUsage(
          tenantId,
          featureCode,
          amount,
        );
        return reply.send({ data: result });
      } catch (error: any) {
        if (error.message?.includes('not found')) {
          return reply.status(404).send({
            error: 'Not Found',
            message: error.message,
            statusCode: 404,
          });
        }
        throw error;
      }
    },
  );
}
