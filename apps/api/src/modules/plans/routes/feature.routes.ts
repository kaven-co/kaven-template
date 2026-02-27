import { FastifyInstance } from 'fastify';
import { featureController } from '../controllers/feature.controller';
import { requireAuth } from '../../../middleware/auth.middleware';
import { requireRole } from '../../../middleware/rbac.middleware';

export async function featureRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.get('/features', featureController.list.bind(featureController));
  fastify.get('/features/categories', featureController.listCategories.bind(featureController));
  fastify.get('/features/:id', featureController.getById.bind(featureController));
  fastify.get('/features/code/:code', featureController.getByCode.bind(featureController));

  // Admin routes — requires SUPER_ADMIN or TENANT_ADMIN
  fastify.post('/features', {
    preHandler: [requireAuth, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN'])],
  }, featureController.create.bind(featureController));

  fastify.put('/features/:id', {
    preHandler: [requireAuth, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN'])],
  }, featureController.update.bind(featureController));

  fastify.delete('/features/:id', {
    preHandler: [requireAuth, requireRole(['SUPER_ADMIN', 'TENANT_ADMIN'])],
  }, featureController.delete.bind(featureController));
}
