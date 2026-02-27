import { FastifyInstance } from 'fastify';
import { planController } from '../controllers/plan.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requireTenantAdmin } from '../../../middleware/rbac.middleware';

export async function planRoutes(fastify: FastifyInstance) {
  // Public routes
  // Public routes (but using authMiddleware to identify tenant if logged in)
  fastify.get('/plans', { preHandler: [authMiddleware] }, planController.list.bind(planController));
  fastify.get('/plans/:id', { preHandler: [authMiddleware] }, planController.getById.bind(planController));
  fastify.get('/plans/code/:code', { preHandler: [authMiddleware] }, planController.getByCode.bind(planController));

  // Admin routes
  fastify.post('/plans', { preHandler: [authMiddleware, requireTenantAdmin] }, planController.create.bind(planController));
  fastify.put('/plans/:id', { preHandler: [authMiddleware, requireTenantAdmin] }, planController.update.bind(planController));
  fastify.delete('/plans/:id', { preHandler: [authMiddleware, requireTenantAdmin] }, planController.delete.bind(planController));

  // Feature management (Admin only)
  fastify.post('/plans/:id/features', planController.addFeature.bind(planController));
  fastify.put('/plans/:id/features/:featureCode', planController.updateFeature.bind(planController));
  fastify.delete('/plans/:id/features/:featureCode', planController.removeFeature.bind(planController));
}
