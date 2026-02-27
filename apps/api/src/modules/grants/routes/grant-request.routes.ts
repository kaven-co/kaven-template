import { FastifyInstance } from 'fastify';
import { grantRequestController } from '../controllers/grant-request.controller';
import { authMiddleware } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/rbac.middleware';

export async function grantRequestRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);

  // User routes
  app.post('/requests', grantRequestController.create);
  app.get('/requests/my', grantRequestController.listMyRequests);

  // Approver routes — requires TENANT_ADMIN or SUPER_ADMIN role
  // Controller-level validation additionally checks Space ownership for regular users
  app.get('/requests/pending', {
    preHandler: [requireRole(['TENANT_ADMIN', 'SUPER_ADMIN'])],
  }, grantRequestController.listPending);

  app.put('/requests/:id/review', {
    preHandler: [requireRole(['TENANT_ADMIN', 'SUPER_ADMIN'])],
  }, grantRequestController.review);
}
