import { FastifyPluginOptions } from 'fastify';
import { env } from '../config/env';

/**
 * Creates a Redis client for distributed rate limiting.
 * Returns undefined if REDIS_URL is not configured (falls back to in-memory).
 */
function createRedisClient() {
  // In test environment, use in-memory store to avoid Redis connection issues
  if (env.NODE_ENV === 'test') return undefined;
  if (!env.REDIS_URL) return undefined;

  const Redis = require('ioredis');
  const client = new Redis(env.REDIS_URL, {
    family: 4, // Force IPv4 (avoid IPv6 attempts)
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
  });

  client.on('error', (err: Error) => {
    console.warn('[RateLimit] Redis error:', err.message);
  });

  return client;
}

/**
 * Shared error response builder for all rate limit tiers.
 * Returns a standardized error format consistent with AppError responses.
 */
function buildRateLimitErrorResponse(req: any, context: any) {
  const secureLog = require('../utils/secure-logger').secureLog;
  secureLog.warn('[MW_BLOCK: RateLimit]', {
    reqId: req.id,
    ip: req.ip,
    userId: req.user?.id,
    reason: 'Rate Limit Exceeded',
    url: req.url,
    after: context.after,
  });

  return {
    error: 'Too Many Requests',
    message: `Rate limit exceeded. Try again in ${Math.ceil(Number(context.after) / 1000)} seconds.`,
    code: 'RATE_LIMIT_EXCEEDED',
    statusCode: 429,
  };
}

/**
 * Shared key generator for rate limiting.
 * Uses authenticated user ID when available, falls back to IP address.
 */
function keyGenerator(req: any): string {
  return req.user?.id || req.ip || 'anonymous';
}

// Single Redis client shared across all rate limit configs
const redisClient = createRedisClient();

// ---------------------------------------------------------------------------
// Rate limit configurations per route tier
// ---------------------------------------------------------------------------

/**
 * Global rate limit configuration — 100 requests/minute.
 * Applied as the default for all API routes.
 */
export const rateLimitConfig: FastifyPluginOptions = {
  max: 100,
  timeWindow: 60_000, // 1 minute
  cache: 10_000,
  allowList: ['127.0.0.1'],
  redis: redisClient,
  keyGenerator,
  errorResponseBuilder: buildRateLimitErrorResponse,
};

/**
 * Auth route rate limit — 10 requests/minute.
 * Stricter limit for authentication endpoints to mitigate brute-force attacks.
 * Applied to /api/auth/* routes.
 */
export const authRateLimitConfig: FastifyPluginOptions = {
  max: 10,
  timeWindow: 60_000,
  cache: 10_000,
  allowList: ['127.0.0.1'],
  redis: redisClient,
  keyGenerator,
  errorResponseBuilder: buildRateLimitErrorResponse,
};

/**
 * Webhook route rate limit — 50 requests/minute.
 * Moderate limit for webhook ingestion endpoints.
 * Applied to /api/webhooks/* routes.
 */
export const webhookRateLimitConfig: FastifyPluginOptions = {
  max: 50,
  timeWindow: 60_000,
  cache: 10_000,
  allowList: ['127.0.0.1'],
  redis: redisClient,
  keyGenerator: (req: any) => req.ip || 'anonymous', // Webhooks are not authenticated
  errorResponseBuilder: buildRateLimitErrorResponse,
};
