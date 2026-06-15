// Kaven Analytics Module — Test Suite
// Cobre: trackEvent sem/com PostHog, hash de userId, getDashboardMetrics.
// Run with: pnpm test (from kaven-framework root)

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createHash } from 'crypto'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockCreate = vi.fn().mockResolvedValue({ id: 'evt-1' })
const mockCount = vi.fn().mockResolvedValue(0)
const mockGroupBy = vi.fn().mockResolvedValue([])

vi.mock('../../../lib/prisma', () => ({
  default: {
    analyticsEvent: {
      create: (...args: any[]) => mockCreate(...args),
      count: (...args: any[]) => mockCount(...args),
      groupBy: (...args: any[]) => mockGroupBy(...args),
    },
  },
}))

// Mock do posthog.client — começa desligado (sem POSTHOG_API_KEY)
vi.mock('../backend/services/posthog.client', () => ({
  getPostHogClient: vi.fn().mockReturnValue(null),
}))

import { analyticsService } from '../backend/services/analytics.service'
import { getPostHogClient } from '../backend/services/posthog.client'

// ─── trackEvent ───────────────────────────────────────────────────────────────

describe('analyticsService.trackEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('salva no DB mesmo sem POSTHOG_API_KEY', async () => {
    vi.mocked(getPostHogClient).mockReturnValue(null)

    await analyticsService.trackEvent({
      tenantId: 'tenant-1',
      eventName: 'page_view',
      properties: { path: '/dashboard' },
    })

    expect(mockCreate).toHaveBeenCalledOnce()
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          eventName: 'page_view',
        }),
      })
    )
  })

  it('faz dual-write quando PostHog está configurado', async () => {
    const mockCapture = vi.fn()
    vi.mocked(getPostHogClient).mockReturnValue({ capture: mockCapture, shutdown: vi.fn() })

    await analyticsService.trackEvent({
      tenantId: 'tenant-1',
      eventName: 'feature_used',
      properties: { feature: 'billing' },
    })

    // DB deve receber o evento
    expect(mockCreate).toHaveBeenCalledOnce()

    // PostHog também deve receber (fire-and-forget)
    expect(mockCapture).toHaveBeenCalledOnce()
    expect(mockCapture).toHaveBeenCalledWith(
      expect.objectContaining({
        event: 'feature_used',
        properties: expect.objectContaining({ tenantId: 'tenant-1' }),
      })
    )
  })

  it('nunca persiste o userId original — sempre SHA-256', async () => {
    vi.mocked(getPostHogClient).mockReturnValue(null)

    const rawUserId = 'user@example.com'
    await analyticsService.trackEvent({
      tenantId: 'tenant-1',
      eventName: 'signup',
      userId: rawUserId,
    })

    const expectedHash = createHash('sha256')
      .update(rawUserId + (process.env.ANALYTICS_SALT ?? ''))
      .digest('hex')

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: expectedHash,
        }),
      })
    )

    // Garantir que o email raw nunca aparece nos dados salvos
    const savedData = mockCreate.mock.calls[0][0].data
    expect(savedData.userId).not.toBe(rawUserId)
  })

  it('userId undefined → salva null (sem hash)', async () => {
    vi.mocked(getPostHogClient).mockReturnValue(null)

    await analyticsService.trackEvent({
      tenantId: 'tenant-1',
      eventName: 'anonymous_visit',
    })

    const savedData = mockCreate.mock.calls[0][0].data
    expect(savedData.userId).toBeUndefined()
  })
})

// ─── getDashboardMetrics ──────────────────────────────────────────────────────

describe('analyticsService.getDashboardMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna estrutura correta com dados do prisma', async () => {
    mockCount
      .mockResolvedValueOnce(150) // totalEvents
      .mockResolvedValueOnce(42) // recentEvents

    mockGroupBy.mockResolvedValue([
      { eventName: 'page_view', _count: { eventName: 120 } },
      { eventName: 'feature_used', _count: { eventName: 30 } },
    ])

    const result = await analyticsService.getDashboardMetrics('tenant-1')

    expect(result).toEqual({
      totalEvents: 150,
      recentEvents: 42,
      topEvents: [
        { event: 'page_view', count: 120 },
        { event: 'feature_used', count: 30 },
      ],
    })
  })

  it('retorna topEvents vazio quando não há dados', async () => {
    mockCount.mockResolvedValue(0)
    mockGroupBy.mockResolvedValue([])

    const result = await analyticsService.getDashboardMetrics('tenant-novo')

    expect(result.totalEvents).toBe(0)
    expect(result.recentEvents).toBe(0)
    expect(result.topEvents).toEqual([])
  })

  it('filtra por tenantId corretamente', async () => {
    mockCount.mockResolvedValue(0)
    mockGroupBy.mockResolvedValue([])

    await analyticsService.getDashboardMetrics('tenant-xyz')

    // Ambas as queries de count devem usar tenantId
    expect(mockCount).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tenantId: 'tenant-xyz' }) })
    )
  })
})
