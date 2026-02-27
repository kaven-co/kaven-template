import { prisma } from '../../lib/prisma';

export interface UsageResult {
  resource: string;
  used: number;
  limit: number;
  percentage: number;
}

// ---------------------------------------------------------------------------
// Simple in-memory cache (60s TTL)
// ---------------------------------------------------------------------------
interface CacheEntry {
  value: number;
  expiresAt: number;
}

const usageCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60_000;

function cacheKey(tenantId: string, featureId: string): string {
  return `${tenantId}:${featureId}`;
}

function getCached(key: string): number | null {
  const entry = usageCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    usageCache.delete(key);
    return null;
  }
  return entry.value;
}

function setCache(key: string, value: number): void {
  usageCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function invalidateCache(key: string): void {
  usageCache.delete(key);
}

// Exported for testing
export function clearUsageCache(): void {
  usageCache.clear();
}

// ---------------------------------------------------------------------------
// UsageService
// ---------------------------------------------------------------------------

export class UsageService {
  /**
   * Get the start of the current billing period (first day of month, midnight).
   */
  private getPeriodStart(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  }

  /**
   * Get the end of the current billing period (last day of month, 23:59:59).
   */
  private getPeriodEnd(date: Date = new Date()): Date {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  /**
   * Resolve a featureCode to a feature record. Throws if not found.
   */
  private async resolveFeature(featureCode: string) {
    const feature = await prisma.feature.findUnique({
      where: { code: featureCode },
    });
    if (!feature) {
      throw new Error(`Feature with code "${featureCode}" not found`);
    }
    return feature;
  }

  // -------------------------------------------------------------------------
  // incrementUsage
  // -------------------------------------------------------------------------
  async incrementUsage(
    tenantId: string,
    featureCode: string,
    amount: number = 1,
  ): Promise<UsageResult> {
    const feature = await this.resolveFeature(featureCode);
    const now = new Date();
    const periodStart = this.getPeriodStart(now);
    const periodEnd = this.getPeriodEnd(now);

    const record = await prisma.usageRecord.upsert({
      where: {
        tenantId_featureId_periodStart: {
          tenantId,
          featureId: feature.id,
          periodStart,
        },
      },
      update: {
        currentUsage: { increment: amount },
        updatedAt: now,
      },
      create: {
        tenantId,
        featureId: feature.id,
        currentUsage: amount,
        periodStart,
        periodEnd,
      },
    });

    const key = cacheKey(tenantId, feature.id);
    invalidateCache(key);

    const limit = await this.getFeatureLimit(tenantId, featureCode);
    return this.buildResult(featureCode, record.currentUsage, limit);
  }

  // -------------------------------------------------------------------------
  // decrementUsage
  // -------------------------------------------------------------------------
  async decrementUsage(
    tenantId: string,
    featureCode: string,
    amount: number = 1,
  ): Promise<UsageResult> {
    const feature = await this.resolveFeature(featureCode);
    const now = new Date();
    const periodStart = this.getPeriodStart(now);
    const periodEnd = this.getPeriodEnd(now);

    const record = await prisma.usageRecord.upsert({
      where: {
        tenantId_featureId_periodStart: {
          tenantId,
          featureId: feature.id,
          periodStart,
        },
      },
      update: {
        currentUsage: { decrement: amount },
        updatedAt: now,
      },
      create: {
        tenantId,
        featureId: feature.id,
        currentUsage: 0, // can't go negative on a fresh record
        periodStart,
        periodEnd,
      },
    });

    // Ensure we don't store negative values
    if (record.currentUsage < 0) {
      await prisma.usageRecord.update({
        where: {
          tenantId_featureId_periodStart: {
            tenantId,
            featureId: feature.id,
            periodStart,
          },
        },
        data: { currentUsage: 0 },
      });
      record.currentUsage = 0;
    }

    const key = cacheKey(tenantId, feature.id);
    invalidateCache(key);

    const limit = await this.getFeatureLimit(tenantId, featureCode);
    return this.buildResult(featureCode, record.currentUsage, limit);
  }

  // -------------------------------------------------------------------------
  // getCurrentUsage
  // -------------------------------------------------------------------------
  async getCurrentUsage(
    tenantId: string,
    featureCode: string,
  ): Promise<UsageResult> {
    const feature = await this.resolveFeature(featureCode);
    const periodStart = this.getPeriodStart();

    const key = cacheKey(tenantId, feature.id);
    let used = getCached(key);

    if (used === null) {
      const record = await prisma.usageRecord.findUnique({
        where: {
          tenantId_featureId_periodStart: {
            tenantId,
            featureId: feature.id,
            periodStart,
          },
        },
      });
      used = record?.currentUsage ?? 0;
      setCache(key, used);
    }

    const limit = await this.getFeatureLimit(tenantId, featureCode);
    return this.buildResult(featureCode, used, limit);
  }

  // -------------------------------------------------------------------------
  // getUsageSummary — all features with used/limit/percentage
  // -------------------------------------------------------------------------
  async getUsageSummary(tenantId: string): Promise<UsageResult[]> {
    // Get the tenant's active subscription with plan features
    const subscription = await prisma.subscription.findFirst({
      where: {
        tenantId,
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      include: {
        plan: {
          include: {
            features: {
              where: { enabled: true },
              include: { feature: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const plan = subscription?.plan ?? await prisma.plan.findFirst({
      where: { isDefault: true, isActive: true },
      include: {
        features: {
          where: { enabled: true },
          include: { feature: true },
        },
      },
    });

    if (!plan) {
      return [];
    }

    // Only quota features have meaningful usage tracking
    const quotaFeatures = plan.features.filter(
      (pf: any) => pf.limitValue !== null && pf.limitValue !== undefined,
    );

    const periodStart = this.getPeriodStart();

    // Batch-fetch all usage records for this tenant in the current period
    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        tenantId,
        periodStart,
      },
    });

    const usageByFeatureId = new Map<string, number>();
    for (const record of usageRecords) {
      usageByFeatureId.set(record.featureId, record.currentUsage);
    }

    return quotaFeatures.map((pf: any) => {
      const used = usageByFeatureId.get(pf.feature.id) ?? 0;
      const limit = pf.limitValue as number;
      return this.buildResult(pf.feature.code, used, limit);
    });
  }

  // -------------------------------------------------------------------------
  // resetPeriod — manual reset for a specific feature
  // -------------------------------------------------------------------------
  async resetPeriod(
    tenantId: string,
    featureCode: string,
  ): Promise<UsageResult> {
    const feature = await this.resolveFeature(featureCode);
    const periodStart = this.getPeriodStart();

    await prisma.usageRecord.updateMany({
      where: {
        tenantId,
        featureId: feature.id,
        periodStart,
      },
      data: {
        currentUsage: 0,
        lastReset: new Date(),
      },
    });

    const key = cacheKey(tenantId, feature.id);
    invalidateCache(key);

    const limit = await this.getFeatureLimit(tenantId, featureCode);
    return this.buildResult(featureCode, 0, limit);
  }

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  /**
   * Get the plan limit for a specific feature.
   * Returns -1 for unlimited (no subscription, or limitValue is null).
   */
  private async getFeatureLimit(
    tenantId: string,
    featureCode: string,
  ): Promise<number> {
    const subscription = await prisma.subscription.findFirst({
      where: {
        tenantId,
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      include: {
        plan: {
          include: {
            features: {
              where: {
                feature: { code: featureCode },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!subscription) return -1;

    const planFeature = subscription.plan?.features?.[0];
    return planFeature?.limitValue ?? -1;
  }

  /**
   * Build a standardised UsageResult.
   * limit = -1 means unlimited, percentage is 0 in that case.
   */
  private buildResult(
    resource: string,
    used: number,
    limit: number,
  ): UsageResult {
    const percentage =
      limit <= 0 ? 0 : Math.min(Math.round((used / limit) * 100), 100);

    return { resource, used, limit, percentage };
  }
}

export const usageService = new UsageService();
