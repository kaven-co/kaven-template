import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifyHelmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from './config/env';
import { initSentry, Sentry } from './lib/sentry';
import { healthRoutes } from './routes/health.routes';
import { metricsMiddleware } from './middleware/metrics.middleware';
import { tenantMiddleware } from './middleware/tenant.middleware';
import { rateLimitConfig, authRateLimitConfig, webhookRateLimitConfig } from './middleware/rate-limit.middleware';
import { csrfMiddleware } from './middleware/csrf.middleware';
import { authMiddleware } from './middleware/auth.middleware';
import { initializeFeatureGuard } from './middleware/feature-guard.middleware';
import { secureLog } from './utils/secure-logger';
import { AppError, httpStatusText } from './utils/errors';

// [KAVEN_MODULE_IMPORTS_START]
import { authRoutes } from './modules/auth/routes/auth.routes';
import { userRoutes } from './modules/users/routes/user.routes';
import { inviteRoutes } from './modules/users/routes/invite.routes';
import { tenantRoutes } from './modules/tenants/routes/tenant.routes';
import { fileRoutes } from './modules/files/routes/file.routes';
import { auditRoutes } from './modules/audit/routes/audit.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { planRoutes } from './modules/plans/routes/plan.routes';
import { featureRoutes } from './modules/plans/routes/feature.routes';
import { productRoutes } from './modules/products/routes/product.routes';
import { subscriptionRoutes } from './modules/subscriptions/routes/subscription.routes';
import { EntitlementService } from './modules/subscriptions/services/entitlement.service';
import { UsageTrackingService } from './modules/subscriptions/services/usage-tracking.service';
import { notificationRoutes } from './modules/notifications/routes/notification.routes';
import { invoiceRoutes } from './modules/invoices/routes/invoice.routes';
import { orderRoutes } from './modules/orders/routes/order.routes';
import { platformRoutes } from './modules/platform/routes/platform.routes';
import { emailIntegrationRoutes } from './modules/platform/routes/email-integration.routes';
import { observabilityRoutes } from './modules/observability/routes/observability.routes';
import { projectsRoutes } from './modules/app/projects/projects.routes';
import { tasksRoutes } from './modules/app/tasks/tasks.routes';
import { currenciesRoutes } from './modules/currencies/routes/currencies.routes';
import { emailWebhookRoutes } from './modules/webhooks/routes/email-webhook.routes';
import { unsubscribeRoutes } from './modules/webhooks/routes/unsubscribe.routes';
import { diagnosticsRoutes } from './modules/observability/routes/diagnostics.routes';
import { advancedMetricsMiddleware, onResponseMetricsHook } from './modules/observability/middleware/advanced-metrics.middleware';
import { themeRoutes } from './modules/theme/routes/theme.routes';
import { usageRoutes } from './modules/usage/usage.routes';
import { checkoutRoutes } from './modules/checkout/routes';
import { stripeWebhookRoutes } from './modules/webhooks/stripe';
// [KAVEN_MODULE_IMPORTS]
// [KAVEN_MODULE_IMPORTS_END]

import { roleRoutes } from './modules/roles/routes/role.routes';
import { grantRequestRoutes } from './modules/grants/routes/grant-request.routes';
import { policyRoutes } from './modules/policies/routes/policy.routes';
import { exportRoutes } from './modules/export/routes/export.routes';
import { securityRoutes } from './modules/security/routes/security.routes';

// Initialize Sentry for error tracking
initSentry();

const app = Fastify({
  logger: {
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

// Initialize feature guard services used by requireFeature middleware.
const usageTrackingService = new UsageTrackingService();
const entitlementService = new EntitlementService(usageTrackingService);
initializeFeatureGuard(entitlementService, usageTrackingService);

// Swagger Documentation
app.register(swagger, {
  openapi: {
    info: {
      title: 'Kaven API',
      description: 'Multi-tenant SaaS Boilerplate - Complete REST API',
      version: '0.6.0',
    },
    servers: [
      { url: `http://localhost:${env.PORT}`, description: 'Development' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token obtido via /api/auth/login',
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'Endpoints de autenticação e 2FA' },
      { name: 'Users', description: 'Gerenciamento de usuários' },
      { name: 'Tenants', description: 'Gerenciamento de tenants (multi-tenancy)' },
      { name: 'Payments', description: 'Sistema de pagamentos Stripe' },
      { name: 'Files', description: 'Upload e gerenciamento de arquivos' },
      { name: 'Health', description: 'Health checks e métricas' },
      { name: 'Plans', description: 'Gerenciamento de planos de assinatura' },
      { name: 'Products', description: 'Gerenciamento de produtos one-time' },
      { name: 'Features', description: 'Gerenciamento de features e quotas' },
      { name: 'Subscriptions', description: 'Gerenciamento de subscriptions e entitlement' },
    ],
  },
});

app.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
});

// Plugins
app.register(fastifyHelmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'validator.swagger.io'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Necessário para Swagger UI
      frameAncestors: ["'none'"],
    },
  },
  // X-Frame-Options: DENY (enabled by default in helmet)
  frameguard: { action: 'deny' },
  // X-Content-Type-Options: nosniff (enabled by default in helmet)
  noSniff: true,
  // Referrer-Policy
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  // Strict-Transport-Security
  hsts: {
    maxAge: 63072000, // 2 years
    includeSubDomains: true,
    preload: true,
  },
  // X-Permitted-Cross-Domain-Policies
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
  global: true,
});

// Permissions-Policy header (not covered by helmet)
app.addHook('onSend', async (_request, reply) => {
  reply.header(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );
});

app.register(cors, {
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'x-space-id'],
});

// Multipart (file upload)
app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

// Static files (uploads)
app.register(fastifyStatic, {
  root: path.join(process.cwd(), 'uploads'),
  prefix: '/uploads/',
  decorateReply: false, // Não decorar reply para evitar conflitos
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  },
});

// Rate Limiting (global) - SOLUÇÃO ROBUSTA COM REDIS
app.register(rateLimit, rateLimitConfig);

// Metrics middleware (aplicado globalmente)
app.addHook('onRequest', metricsMiddleware);

app.addHook('onRequest', advancedMetricsMiddleware);
app.addHook('onResponse', onResponseMetricsHook);
// [KAVEN_MODULE_HOOKS]
// [KAVEN_MODULE_HOOKS_END]

// Tenant detection middleware (Camaleão)
app.addHook('onRequest', tenantMiddleware);

// CSRF Protection (Global)
app.addHook('onRequest', csrfMiddleware);

// Health check
app.register(healthRoutes);

// Error handler placeholder — merged into the forensic audit handler below.

// Core and Module Registration
// [KAVEN_MODULE_REGISTRATION_START]

// Auth routes — stricter rate limit (10 req/min) scoped via encapsulated plugin
app.register(async function authScope(scoped) {
  scoped.register(rateLimit, authRateLimitConfig);
  scoped.register(authRoutes);
}, { prefix: '/api/auth' });
app.register(userRoutes, { prefix: '/api/users' });
app.register(inviteRoutes, { prefix: '/api/users' });
app.register(tenantRoutes, { prefix: '/api/tenants' });
app.register(fileRoutes, { prefix: '/api/files' });
app.register(auditRoutes, { prefix: '/api/audit-logs' });
app.register(dashboardRoutes, { prefix: '/api/dashboard' });

// Plans & Products System
app.register(planRoutes, { prefix: '/api' });
app.register(productRoutes, { prefix: '/api' });
app.register(featureRoutes, { prefix: '/api' });
app.register(subscriptionRoutes, { prefix: '/api' });
app.register(invoiceRoutes, { prefix: '/api/invoices' });
app.register(orderRoutes, { prefix: '/api/orders' });
app.register(notificationRoutes, { prefix: '/api/notifications' });
app.register(platformRoutes, { prefix: '/api/settings/platform' });
app.register(themeRoutes, { prefix: '/api/tenant/theme' });
app.register(emailIntegrationRoutes, { prefix: '/api/settings/email' });
app.register(observabilityRoutes, { prefix: '/api/observability' });
app.register(projectsRoutes, { prefix: '/api/app/projects' });
app.register(tasksRoutes, { prefix: '/api/app/tasks' });
app.register(roleRoutes, { prefix: '/api' });
app.register(grantRequestRoutes, { prefix: '/api' });
app.register(policyRoutes, { prefix: '/api' });
app.register(currenciesRoutes, { prefix: '/api/currencies' });
app.register(exportRoutes, { prefix: '/api/export' });
app.register(securityRoutes, { prefix: '/api/security' });

// Checkout routes — authenticated, rate-limited
app.register(checkoutRoutes, { prefix: '/api/checkout' });

// Webhooks — moderate rate limit (50 req/min) scoped via encapsulated plugin
app.register(async function webhookScope(scoped) {
  scoped.register(rateLimit, webhookRateLimitConfig);
  scoped.register(emailWebhookRoutes, { prefix: '/email' });
  scoped.register(unsubscribeRoutes, { prefix: '/email/unsubscribe' });
  // Stripe webhook — raw body parser registered inside stripeWebhookRoutes
  scoped.register(stripeWebhookRoutes, { prefix: '/stripe' });
}, { prefix: '/api/webhooks' });

import { spaceRoutes } from './modules/spaces/routes/space.routes';

app.register(diagnosticsRoutes, { prefix: '/api/diagnostics' });
app.register(spaceRoutes, { prefix: '/api/spaces' });
app.register(usageRoutes, { prefix: '/api' });
// [KAVEN_MODULE_REGISTRATION]
// [KAVEN_MODULE_REGISTRATION_END]

// 🕵️ FORENSIC AUDIT: Global Request Tracer
app.addHook('onRequest', async (request, reply) => {
  const reqId = (request.headers['x-request-id'] as string) || randomUUID();
  request.id = reqId; // Override Fastify's default ID with our UUID
  request.headers['x-request-id'] = reqId;
  
  secureLog.info('[REQ_START]', {
    reqId,
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers['user-agent']
  });
});

// Global Error Handler (Sentry + Forensic Audit + Standardized Response)
app.setErrorHandler((error: Error & { statusCode?: number; code?: string; validation?: any; details?: unknown }, request, reply) => {
  const reqId = request.id;
  const isAppError = error instanceof AppError;
  const statusCode = (error as any).statusCode || 500;

  // Capture to Sentry (skip 4xx client errors in production to reduce noise)
  if (statusCode >= 500 || env.NODE_ENV !== 'production') {
    Sentry.captureException(error, {
      contexts: {
        request: {
          method: request.method,
          url: request.url,
          headers: request.headers,
        },
      },
      user: {
        id: (request as any).user?.id,
        email: (request as any).user?.email,
      },
      tags: {
        tenant: (request as any).tenantId,
        reqId,
      },
    });
  }

  // Forensic audit log
  secureLog.error('[FATAL_ERROR]', {
    reqId,
    error: error.message,
    code: isAppError ? (error as AppError).code : undefined,
    statusCode,
    validation: (error as any).validation,
    stack: env.NODE_ENV !== 'production' ? error.stack : undefined,
    input: request.body,
  });

  // Build standardized error response:
  // { error: string, message: string, code: string, statusCode: number }
  if (isAppError) {
    return reply.status(statusCode).send((error as AppError).toJSON());
  }

  // Fastify validation errors (schema validation)
  if ((error as any).validation) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details: (error as any).validation,
    });
  }

  // Generic / unknown errors — hide details in production
  const message = env.NODE_ENV === 'production' && statusCode >= 500
    ? 'Internal server error'
    : error.message;

  reply.status(statusCode).send({
    error: httpStatusText(statusCode),
    message,
    code: (error as any).code || 'INTERNAL_ERROR',
    statusCode,
  });
});

export { app };
