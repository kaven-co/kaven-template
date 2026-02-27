import { FastifyInstance } from 'fastify';
import { productController } from '../controllers/product.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requireTenantAdmin } from '../../../middleware/rbac.middleware';

export async function productRoutes(fastify: FastifyInstance) {
  // Public routes
  // Public routes (but using authMiddleware to identify tenant if logged in)
  fastify.get('/products', { preHandler: [authMiddleware] }, productController.list.bind(productController));
  fastify.get('/products/:id', { preHandler: [authMiddleware] }, productController.getById.bind(productController));
  fastify.get('/products/code/:code', { preHandler: [authMiddleware] }, productController.getByCode.bind(productController));

  // Admin routes
  fastify.post('/products', { preHandler: [authMiddleware, requireTenantAdmin] }, productController.create.bind(productController));
  fastify.put('/products/:id', { preHandler: [authMiddleware, requireTenantAdmin] }, productController.update.bind(productController));
  fastify.delete('/products/:id', { preHandler: [authMiddleware, requireTenantAdmin] }, productController.delete.bind(productController));

  // Effect management (Admin only)
  fastify.post('/products/:id/effects', productController.addEffect.bind(productController));
  fastify.put('/products/:id/effects/:featureCode', productController.updateEffect.bind(productController));
  fastify.delete('/products/:id/effects/:featureCode', productController.removeEffect.bind(productController));
}
