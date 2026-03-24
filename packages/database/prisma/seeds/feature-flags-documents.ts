import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed feature flags for the Documents + Knowledge Base module.
 *
 * Features added:
 *   DOCUMENTS          (BOOLEAN) — Access to documents module
 *   KNOWLEDGE_BASE     (BOOLEAN) — Access to knowledge base
 *   DOCUMENT_TEMPLATES (BOOLEAN) — Access to document templates
 *   DOCUMENT_SHARING   (BOOLEAN) — Sharing capabilities
 *   MAX_DOCUMENTS      (QUOTA)   — Maximum documents per tenant
 *   MAX_STORAGE_GB     (QUOTA)   — Maximum storage in GB
 *   MAX_KB_ARTICLES    (QUOTA)   — Maximum KB articles
 *
 * Plan assignment (Free / Pro / Enterprise):
 *   DOCUMENTS:          true / true / true
 *   KNOWLEDGE_BASE:     false / true / true
 *   DOCUMENT_TEMPLATES: false / true / true
 *   DOCUMENT_SHARING:   true / true / true
 *   MAX_DOCUMENTS:      100 / -1 / -1
 *   MAX_STORAGE_GB:     1 / 10 / -1
 *   MAX_KB_ARTICLES:    0 / 500 / -1
 */
export async function seedDocumentFeatureFlags() {
  console.log('\n📋 Seeding Documents + KB Feature Flags...');

  // -------------------------------------------------------
  // 1. Create Features
  // -------------------------------------------------------

  const featureDefs = [
    {
      code: 'DOCUMENTS',
      name: 'Documents Module',
      description: 'Access to the Documents module for creating and managing documents',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'documents',
      sortOrder: 100,
    },
    {
      code: 'KNOWLEDGE_BASE',
      name: 'Knowledge Base',
      description: 'Access to the Knowledge Base for creating and managing KB articles',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'documents',
      sortOrder: 101,
    },
    {
      code: 'DOCUMENT_TEMPLATES',
      name: 'Document Templates',
      description: 'Access to document templates for quick document creation',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'documents',
      sortOrder: 102,
    },
    {
      code: 'DOCUMENT_SHARING',
      name: 'Document Sharing',
      description: 'Ability to share documents and folders with other users',
      type: 'BOOLEAN' as const,
      unit: null,
      category: 'documents',
      sortOrder: 103,
    },
    {
      code: 'MAX_DOCUMENTS',
      name: 'Maximum Documents',
      description: 'Maximum number of documents per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'documents',
      category: 'documents',
      sortOrder: 104,
    },
    {
      code: 'MAX_STORAGE_GB',
      name: 'Maximum Storage (GB)',
      description: 'Maximum file storage in gigabytes per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'GB',
      category: 'documents',
      sortOrder: 105,
    },
    {
      code: 'MAX_KB_ARTICLES',
      name: 'Maximum KB Articles',
      description: 'Maximum number of knowledge base articles per tenant (-1 = unlimited)',
      type: 'QUOTA' as const,
      unit: 'articles',
      category: 'documents',
      sortOrder: 106,
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
      { featureCode: 'DOCUMENTS', enabled: true, limitValue: null },
      { featureCode: 'KNOWLEDGE_BASE', enabled: false, limitValue: null },
      { featureCode: 'DOCUMENT_TEMPLATES', enabled: false, limitValue: null },
      { featureCode: 'DOCUMENT_SHARING', enabled: true, limitValue: null },
      { featureCode: 'MAX_DOCUMENTS', enabled: true, limitValue: 100 },
      { featureCode: 'MAX_STORAGE_GB', enabled: true, limitValue: 1 },
      { featureCode: 'MAX_KB_ARTICLES', enabled: true, limitValue: 0 },
    ],
    pro: [
      { featureCode: 'DOCUMENTS', enabled: true, limitValue: null },
      { featureCode: 'KNOWLEDGE_BASE', enabled: true, limitValue: null },
      { featureCode: 'DOCUMENT_TEMPLATES', enabled: true, limitValue: null },
      { featureCode: 'DOCUMENT_SHARING', enabled: true, limitValue: null },
      { featureCode: 'MAX_DOCUMENTS', enabled: true, limitValue: -1 },
      { featureCode: 'MAX_STORAGE_GB', enabled: true, limitValue: 10 },
      { featureCode: 'MAX_KB_ARTICLES', enabled: true, limitValue: 500 },
    ],
    enterprise: [
      { featureCode: 'DOCUMENTS', enabled: true, limitValue: null },
      { featureCode: 'KNOWLEDGE_BASE', enabled: true, limitValue: null },
      { featureCode: 'DOCUMENT_TEMPLATES', enabled: true, limitValue: null },
      { featureCode: 'DOCUMENT_SHARING', enabled: true, limitValue: null },
      { featureCode: 'MAX_DOCUMENTS', enabled: true, limitValue: -1 },
      { featureCode: 'MAX_STORAGE_GB', enabled: true, limitValue: -1 },
      { featureCode: 'MAX_KB_ARTICLES', enabled: true, limitValue: -1 },
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
    console.log(`  ✅ Plan "${planCode}": ${features.length} document features assigned`);
  }

  console.log('✅ Documents + KB Feature Flags seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  seedDocumentFeatureFlags()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding document feature flags:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
