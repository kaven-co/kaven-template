import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requireFeature } from '../../../middleware/feature-guard.middleware';
import { requireTenantAccess } from '../../../middleware/rbac.middleware';
import { themeController } from '../controllers/theme.controller';

export async function themeRoutes(fastify: FastifyInstance) {
  fastify.get('/', {
    preHandler: [authMiddleware, requireTenantAccess],
    handler: themeController.getTheme.bind(themeController),
  });

  fastify.put('/', {
    preHandler: [
      authMiddleware,
      requireTenantAccess,
      requireFeature('THEME_CUSTOMIZATION'),
    ],
    handler: themeController.upsertTheme.bind(themeController),
  });
}
