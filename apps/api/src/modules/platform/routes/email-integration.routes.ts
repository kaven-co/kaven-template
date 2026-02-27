import { FastifyInstance } from 'fastify';
import { emailIntegrationController } from '../controllers/email-integration.controller';
import { emailHealthCheckConfigController } from '../controllers/email-health-check-config.controller';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requireSuperAdmin } from '../../../middleware/rbac.middleware';
import { emailMetricsPersistence } from '../../../lib/email/metrics-persistence.service';

export async function emailIntegrationRoutes(app: FastifyInstance) {
  // All routes are protected and for super admins only
  app.addHook('preHandler', authMiddleware);
  app.addHook('preHandler', requireSuperAdmin);

  // Email Integration CRUD
  app.get('/', emailIntegrationController.list);
  app.post('/', emailIntegrationController.create);
  app.put('/:id', emailIntegrationController.update);
  app.delete('/:id', emailIntegrationController.delete);
  app.get('/:id/health', emailIntegrationController.healthCheck);
  app.post('/test', emailIntegrationController.test);

  // Email Sending Statistics
  app.get('/stats', async (req, reply) => {
    try {
      const { days } = req.query as { days?: string };
      const daysNum = days ? parseInt(days, 10) : 30;
      const metrics = await emailMetricsPersistence.getAggregatedMetrics(daysNum);
      return reply.send(metrics);
    } catch (error: any) {
      req.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch email statistics' });
    }
  });

  // Health Check Configuration
  app.get('/health-check-config', emailHealthCheckConfigController.getConfig.bind(emailHealthCheckConfigController));
  app.put('/health-check-config', emailHealthCheckConfigController.updateConfig.bind(emailHealthCheckConfigController));
  app.post('/health-check-config/run-now', emailHealthCheckConfigController.runNow.bind(emailHealthCheckConfigController));
}
