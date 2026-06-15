// Kaven Analytics Module — Routes
// POST /api/analytics/events  — track event (chamado por outros módulos ou frontend)
// GET  /api/analytics/dashboard — métricas do tenant (admin only)

import type { FastifyInstance } from 'fastify'
import { analyticsService } from '../services/analytics.service'

export async function analyticsRoutes(app: FastifyInstance) {
  // POST /analytics/events — registra um evento de produto
  app.post('/analytics/events', async (request, reply) => {
    const { tenantId, userId } = (request as any).user
    const { eventName, properties } = request.body as {
      eventName: string
      properties?: Record<string, unknown>
    }

    if (!eventName) {
      return reply.status(400).send({ error: 'eventName is required' })
    }

    await analyticsService.trackEvent({ tenantId, eventName, properties, userId })
    return reply.status(201).send({ ok: true })
  })

  // GET /analytics/dashboard — métricas dos últimos 30 dias do tenant
  app.get('/analytics/dashboard', async (request, reply) => {
    const { tenantId } = (request as any).user
    const metrics = await analyticsService.getDashboardMetrics(tenantId)
    return metrics
  })
}
