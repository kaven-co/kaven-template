import { PrismaClient } from '@prisma/client';

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed feature flags for the Team Collaboration module.
 *
 * Features added:
 *   TEAM_COLLABORATION  (BOOLEAN) — Access to team collaboration module
 *   MAX_CHANNELS        (QUOTA)   — Maximum channels per tenant
 */
export async function seedTeamCollaborationFeatureFlags() {
  console.log('\n💬 Seeding Team Collaboration Feature Flags...');

  const featureDefs = [
    {
      code: 'TEAM_COLLABORATION',
      name: 'Team Collaboration Module',
      description: 'Access to team channels, updates, and meeting scheduling',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'team_collaboration',
      sortOrder: 230,
    },
    {
      code: 'MAX_CHANNELS',
      name: 'Maximum Channels',
      description: 'Maximum number of team channels per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'channels',
      category: 'team_collaboration',
      sortOrder: 231,
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
    free: [
      { featureCode: 'TEAM_COLLABORATION', enabled: false, limitValue: null },
      { featureCode: 'MAX_CHANNELS', enabled: true, limitValue: 0 },
    ],
    pro: [
      { featureCode: 'TEAM_COLLABORATION', enabled: true, limitValue: null },
      { featureCode: 'MAX_CHANNELS', enabled: true, limitValue: 10 },
    ],
    enterprise: [
      { featureCode: 'TEAM_COLLABORATION', enabled: true, limitValue: null },
      { featureCode: 'MAX_CHANNELS', enabled: true, limitValue: -1 },
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
    console.log(`  ✅ Plan "${planCode}": ${features.length} team collaboration features assigned`);
  }

  console.log('✅ Team Collaboration Feature Flags seed complete.');
}

if (require.main === module) {
  seedTeamCollaborationFeatureFlags()
    .then(() => prisma.$disconnect())
    .catch(async (e) => { console.error('❌ Error:', e); await prisma.$disconnect(); process.exit(1); });
}
