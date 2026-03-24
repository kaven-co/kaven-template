import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed feature flags for the Remote / Hybrid Work module.
 *
 * Features added:
 *   REMOTE_WORK           (BOOLEAN) — Access to remote work module
 *   TIME_TRACKING_REMOTE  (BOOLEAN) — Access to time tracking for remote workers
 *   MAX_STANDUPS          (QUOTA)   — Maximum async standups per tenant
 *
 * Plan assignment (Free / Pro / Enterprise):
 *   REMOTE_WORK:          false / true / true
 *   TIME_TRACKING_REMOTE: false / true / true
 *   MAX_STANDUPS:         0 / 5 / -1
 */
export async function seedRemoteWorkFeatureFlags() {
  console.log('\n🏠 Seeding Remote Work Feature Flags...');

  const featureDefs = [
    {
      code: 'REMOTE_WORK',
      name: 'Remote Work Module',
      description: 'Access to remote/hybrid work management including timesheets and schedules',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'remote_work',
      sortOrder: 220,
    },
    {
      code: 'TIME_TRACKING_REMOTE',
      name: 'Remote Time Tracking',
      description: 'Time tracking with timer, manual entries and timesheet approval',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'remote_work',
      sortOrder: 221,
    },
    {
      code: 'MAX_STANDUPS',
      name: 'Maximum Async Standups',
      description: 'Maximum number of async standups per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'standups',
      category: 'remote_work',
      sortOrder: 222,
    },
  ];

  const featureMap: Record<string, string> = {};

  for (const def of featureDefs) {
    const feature = await prisma.feature.upsert({
      where: { code: def.code },
      update: {},
      create: {
        code: def.code,
        name: def.name,
        description: def.description,
        type: def.type,
        unit: def.unit,
        category: def.category,
        sortOrder: def.sortOrder,
      },
    });
    featureMap[def.code] = feature.id;
    console.log(`  ✅ Feature: ${def.code} (${def.type})`);
  }

  const planAssignments: Record<string, Array<{
    featureCode: string; enabled: boolean; limitValue: number | null;
  }>> = {
    free: [
      { featureCode: 'REMOTE_WORK', enabled: false, limitValue: null },
      { featureCode: 'TIME_TRACKING_REMOTE', enabled: false, limitValue: null },
      { featureCode: 'MAX_STANDUPS', enabled: true, limitValue: 0 },
    ],
    pro: [
      { featureCode: 'REMOTE_WORK', enabled: true, limitValue: null },
      { featureCode: 'TIME_TRACKING_REMOTE', enabled: true, limitValue: null },
      { featureCode: 'MAX_STANDUPS', enabled: true, limitValue: 5 },
    ],
    enterprise: [
      { featureCode: 'REMOTE_WORK', enabled: true, limitValue: null },
      { featureCode: 'TIME_TRACKING_REMOTE', enabled: true, limitValue: null },
      { featureCode: 'MAX_STANDUPS', enabled: true, limitValue: -1 },
    ],
  };

  for (const [planCode, features] of Object.entries(planAssignments)) {
    const plan = await prisma.plan.findFirst({ where: { code: planCode, tenantId: null } });
    if (!plan) { console.log(`  ⚠️ Plan "${planCode}" not found — skipping`); continue; }

    for (const feat of features) {
      const featureId = featureMap[feat.featureCode];
      if (!featureId) continue;
      const existing = await prisma.planFeature.findUnique({
        where: { planId_featureId: { planId: plan.id, featureId } },
      });
      if (!existing) {
        await prisma.planFeature.create({
          data: { planId: plan.id, featureId, enabled: feat.enabled, limitValue: feat.limitValue },
        });
      }
    }
    console.log(`  ✅ Plan "${planCode}": ${features.length} remote work features assigned`);
  }

  console.log('✅ Remote Work Feature Flags seed complete.');
}

if (require.main === module) {
  seedRemoteWorkFeatureFlags()
    .then(() => prisma.$disconnect())
    .catch(async (e) => { console.error('❌ Error:', e); await prisma.$disconnect(); process.exit(1); });
}
