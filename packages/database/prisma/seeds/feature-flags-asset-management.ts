import { PrismaClient } from '@prisma/client';

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed feature flags for the Asset Management module (Admin Extensions).
 *
 * Features added:
 *   ASSET_MANAGEMENT  (BOOLEAN) — Access to equipment and asset tracking
 */
export async function seedAssetManagementFeatureFlags() {
  console.log('\n🖥️ Seeding Asset Management Feature Flags...');

  const featureDefs = [
    {
      code: 'ASSET_MANAGEMENT',
      name: 'Asset Management',
      description: 'Access to equipment tracking, asset registry and assignment management',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'admin',
      sortOrder: 250,
    },
  ];

  const featureMap: Record<string, string> = {};

  for (const def of featureDefs) {
    const feature = await prisma.feature.upsert({
      where: { code: def.code },
      update: {},
      create: {
        code: def.code, name: def.name, description: def.description,
        type: def.type, unit: def.unit, category: def.category, sortOrder: def.sortOrder,
      },
    });
    featureMap[def.code] = feature.id;
    console.log(`  ✅ Feature: ${def.code} (${def.type})`);
  }

  const planAssignments: Record<string, Array<{
    featureCode: string; enabled: boolean; limitValue: number | null;
  }>> = {
    free: [{ featureCode: 'ASSET_MANAGEMENT', enabled: false, limitValue: null }],
    pro: [{ featureCode: 'ASSET_MANAGEMENT', enabled: true, limitValue: null }],
    enterprise: [{ featureCode: 'ASSET_MANAGEMENT', enabled: true, limitValue: null }],
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
    console.log(`  ✅ Plan "${planCode}": asset management features assigned`);
  }

  console.log('✅ Asset Management Feature Flags seed complete.');
}

if (require.main === module) {
  seedAssetManagementFeatureFlags()
    .then(() => prisma.$disconnect())
    .catch(async (e) => { console.error('❌ Error:', e); await prisma.$disconnect(); process.exit(1); });
}
