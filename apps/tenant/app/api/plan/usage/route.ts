import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/plan/usage
 * Returns the tenant's current plan name and feature limits with usage data.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Find the tenant's active subscription and associated plan
    const subscription = await prisma.subscription.findFirst({
      where: {
        tenantId,
        status: { in: ['ACTIVE', 'TRIALING'] },
      },
      include: {
        plan: {
          include: {
            features: {
              include: {
                feature: true,
              },
              orderBy: {
                feature: { sortOrder: 'asc' },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If no active subscription, try to find the default plan
    const plan = subscription?.plan ?? await prisma.plan.findFirst({
      where: { isDefault: true, isActive: true },
      include: {
        features: {
          include: {
            feature: true,
          },
          orderBy: {
            feature: { sortOrder: 'asc' },
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({
        planName: 'Free',
        features: [],
      });
    }

    // Build feature list — only features that have numeric limits
    const quotaFeatures = plan.features.filter(
      (pf) => pf.enabled && pf.limitValue !== null && pf.limitValue !== undefined,
    );

    // Fetch actual usage records for the current billing period
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const featureIds = quotaFeatures.map((pf) => pf.feature.id);

    const usageRecords = featureIds.length > 0
      ? await prisma.usageRecord.findMany({
          where: {
            tenantId,
            featureId: { in: featureIds },
            periodStart,
          },
        })
      : [];

    const usageByFeatureId = new Map<string, number>();
    for (const record of usageRecords) {
      usageByFeatureId.set(record.featureId, record.currentUsage);
    }

    const features = quotaFeatures.map((pf) => ({
      name: pf.feature.name,
      current: usageByFeatureId.get(pf.feature.id) ?? 0,
      limit: pf.limitValue as number,
      unit: pf.feature.unit ?? undefined,
    }));

    return NextResponse.json({
      planName: plan.name,
      features,
    });
  } catch (error) {
    console.error('Error fetching plan usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan usage' },
      { status: 500 },
    );
  }
}
