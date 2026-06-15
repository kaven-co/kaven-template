// Kaven Analytics Module — Analytics Service
// Dual-write: PostHog (se configurado) + DB (sempre, como fallback principal).
// userId é hasheado SHA-256 antes de persistir (LGPD compliance).

import { createHash } from 'crypto'
import prisma from '../../../lib/prisma'
import { getPostHogClient } from './posthog.client'

interface TrackEventOptions {
  tenantId: string
  eventName: string
  properties?: Record<string, unknown>
  userId?: string // PII — será hasheado antes de salvar
}

export const analyticsService = {
  async trackEvent({ tenantId, eventName, properties = {}, userId }: TrackEventOptions) {
    // Hash userId para privacidade (LGPD compliance)
    const hashedUserId = userId
      ? createHash('sha256').update(userId + (process.env.ANALYTICS_SALT ?? '')).digest('hex')
      : undefined

    // 1. Salvar no DB (sempre — fallback principal)
    await prisma.analyticsEvent.create({
      data: {
        tenantId,
        eventName,
        properties,
        userId: hashedUserId,
      },
    })

    // 2. Enviar para PostHog (fire-and-forget, não bloqueia a resposta)
    const posthog = getPostHogClient()
    if (posthog) {
      posthog.capture({
        distinctId: hashedUserId ?? tenantId,
        event: eventName,
        properties: { ...properties, tenantId },
      })
    }
  },

  async getDashboardMetrics(tenantId: string) {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [totalEvents, recentEvents, topEvents] = await Promise.all([
      prisma.analyticsEvent.count({ where: { tenantId } }),
      prisma.analyticsEvent.count({
        where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
      }),
      prisma.analyticsEvent.groupBy({
        by: ['eventName'],
        where: { tenantId, createdAt: { gte: thirtyDaysAgo } },
        _count: { eventName: true },
        orderBy: { _count: { eventName: 'desc' } },
        take: 5,
      }),
    ])

    return {
      totalEvents,
      recentEvents,
      topEvents: topEvents.map(e => ({ event: e.eventName, count: e._count.eventName })),
    }
  },
}
