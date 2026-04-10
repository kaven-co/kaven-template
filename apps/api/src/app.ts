import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import fastifyHelmet from '@fastify/helmet';
import { healthRoutes } from './routes/health.routes';
import { tenantMiddleware } from './middleware/tenant.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import { AppError } from './utils/errors';

// [KAVEN_MODULE_IMPORTS]

const app = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// Security
app.register(fastifyHelmet);
app.register(cors, { origin: process.env.CORS_ORIGIN ?? '*' });
app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

// Middleware
app.addHook('preHandler', tenantMiddleware);
app.addHook('preHandler', authMiddleware);

// Core routes
app.register(healthRoutes, { prefix: '/api/health' });

// [KAVEN_MODULE_ROUTES]

// Global error handler
app.setErrorHandler((error, _request, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ error: error.message });
  }
  app.log.error(error);
  return reply.status(500).send({ error: 'Internal server error' });
});

export default app;
