import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed feature flags for the AI Automation module.
 *
 * Features added:
 *   AI_AUTOMATION       (BOOLEAN) — Access to AI automation module
 *   AI_TELEMETRY        (BOOLEAN) — AI usage telemetry and analytics
 *   AI_BUDGETS          (BOOLEAN) — Cost budget management
 *   AI_DOMAIN_EVENTS    (BOOLEAN) — Domain event bus access
 *   MAX_AI_RULES        (QUOTA)   — Maximum automation rules per tenant
 *   MAX_AI_MONTHLY_USD  (QUOTA)   — Maximum monthly AI spend in USD
 *
 * Plan assignment (Free / Pro / Enterprise):
 *   AI_AUTOMATION:      false / true / true
 *   AI_TELEMETRY:       false / true / true
 *   AI_BUDGETS:         false / false / true
 *   AI_DOMAIN_EVENTS:   false / true / true
 *   MAX_AI_RULES:       0 / 10 / -1
 *   MAX_AI_MONTHLY_USD: 0 / 50 / -1
 */
export async function seedAiFeatureFlags() {
  console.log('\n🤖 Seeding AI Automation Feature Flags...');

  // -------------------------------------------------------
  // 1. Create Features
  // -------------------------------------------------------

  const featureDefs = [
    {
      code: 'AI_AUTOMATION',
      name: 'AI Automation',
      description: 'Access to the AI Automation module for event-driven workflows',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'ai',
      sortOrder: 210,
    },
    {
      code: 'AI_TELEMETRY',
      name: 'AI Telemetry',
      description: 'AI usage telemetry, cost tracking, and performance analytics',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'ai',
      sortOrder: 211,
    },
    {
      code: 'AI_BUDGETS',
      name: 'AI Cost Budgets',
      description: 'Set and enforce cost budgets for AI usage per module',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'ai',
      sortOrder: 212,
    },
    {
      code: 'AI_DOMAIN_EVENTS',
      name: 'Domain Events',
      description: 'Access to the domain event bus for publishing and consuming events',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'ai',
      sortOrder: 213,
    },
    {
      code: 'MAX_AI_RULES',
      name: 'Maximum AI Rules',
      description: 'Maximum number of automation rules per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'rules',
      category: 'ai',
      sortOrder: 214,
    },
    {
      code: 'MAX_AI_MONTHLY_USD',
      name: 'Maximum Monthly AI Spend',
      description: 'Maximum monthly AI spend in USD per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'USD',
      category: 'ai',
      sortOrder: 215,
    },
    {
      code: 'MAX_AGENT_API_CALLS_HOUR',
      name: 'Agent API Calls per Hour',
      description: 'Maximum number of API calls an agent can make per hour (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'calls',
      category: 'ai',
      sortOrder: 216,
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

  // -------------------------------------------------------
  // 2. Assign features to plans (free / pro / enterprise)
  // -------------------------------------------------------

  const planAssignments: Record<string, Array<{
    featureCode: string;
    enabled: boolean;
    limitValue: number | null;
  }>> = {
    free: [
      { featureCode: 'AI_AUTOMATION', enabled: false, limitValue: null },
      { featureCode: 'AI_TELEMETRY', enabled: false, limitValue: null },
      { featureCode: 'AI_BUDGETS', enabled: false, limitValue: null },
      { featureCode: 'AI_DOMAIN_EVENTS', enabled: false, limitValue: null },
      { featureCode: 'MAX_AI_RULES', enabled: true, limitValue: 0 },
      { featureCode: 'MAX_AI_MONTHLY_USD', enabled: true, limitValue: 0 },
      { featureCode: 'MAX_AGENT_API_CALLS_HOUR', enabled: true, limitValue: 100 },
    ],
    pro: [
      { featureCode: 'AI_AUTOMATION', enabled: true, limitValue: null },
      { featureCode: 'AI_TELEMETRY', enabled: true, limitValue: null },
      { featureCode: 'AI_BUDGETS', enabled: false, limitValue: null },
      { featureCode: 'AI_DOMAIN_EVENTS', enabled: true, limitValue: null },
      { featureCode: 'MAX_AI_RULES', enabled: true, limitValue: 10 },
      { featureCode: 'MAX_AI_MONTHLY_USD', enabled: true, limitValue: 50 },
      { featureCode: 'MAX_AGENT_API_CALLS_HOUR', enabled: true, limitValue: 1000 },
    ],
    enterprise: [
      { featureCode: 'AI_AUTOMATION', enabled: true, limitValue: null },
      { featureCode: 'AI_TELEMETRY', enabled: true, limitValue: null },
      { featureCode: 'AI_BUDGETS', enabled: true, limitValue: null },
      { featureCode: 'AI_DOMAIN_EVENTS', enabled: true, limitValue: null },
      { featureCode: 'MAX_AI_RULES', enabled: true, limitValue: -1 },
      { featureCode: 'MAX_AI_MONTHLY_USD', enabled: true, limitValue: -1 },
      { featureCode: 'MAX_AGENT_API_CALLS_HOUR', enabled: true, limitValue: -1 },
    ],
  };

  for (const [planCode, features] of Object.entries(planAssignments)) {
    const plan = await prisma.plan.findFirst({
      where: { code: planCode, tenantId: null },
    });

    if (!plan) {
      console.log(`  ⚠️ Plan "${planCode}" not found — skipping feature assignment`);
      continue;
    }

    for (const feat of features) {
      const featureId = featureMap[feat.featureCode];
      if (!featureId) continue;

      const existing = await prisma.planFeature.findUnique({
        where: { planId_featureId: { planId: plan.id, featureId } },
      });

      if (!existing) {
        await prisma.planFeature.create({
          data: {
            planId: plan.id,
            featureId,
            enabled: feat.enabled,
            limitValue: feat.limitValue,
          },
        });
      }
    }
    console.log(`  ✅ Plan "${planCode}": ${features.length} AI features assigned`);
  }

  console.log('✅ AI Automation Feature Flags seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  seedAiFeatureFlags()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding AI feature flags:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
