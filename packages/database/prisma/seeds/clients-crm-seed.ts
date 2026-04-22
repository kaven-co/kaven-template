import { PrismaClient } from "@prisma/client";

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed data for Clients + CRM module.
 *
 * Creates:
 * - 6 LifecycleTemplates (1 universal + 5 industry-specific)
 * - 6 default Tags (VIP, Partner, Referral, At Risk, Enterprise, SMB)
 */
export async function seedClientsCRM(tenantId: string) {
  console.log("\n👥 Seeding Clients + CRM module...");

  // -------------------------------------------------------
  // 1. Lifecycle Templates (global — tenantId = null)
  // -------------------------------------------------------

  const templates = [
    {
      industry: null,
      name: "Universal",
      isDefault: true,
      stages: [
        { slug: "lead", label: "Lead", order: 1, color: "#94A3B8", isCore: true },
        { slug: "mql", label: "MQL", order: 2, color: "#60A5FA", isCore: true },
        { slug: "sql", label: "SQL", order: 3, color: "#818CF8", isCore: true },
        { slug: "opportunity", label: "Opportunity", order: 4, color: "#F59E0B", isCore: true },
        { slug: "active_client", label: "Active Client", order: 5, color: "#10B981", isCore: true },
        { slug: "advocate", label: "Advocate", order: 6, color: "#8B5CF6", isCore: true },
      ],
    },
    {
      industry: "agency",
      name: "Agency",
      isDefault: false,
      stages: [
        { slug: "lead", label: "Lead", order: 1, color: "#94A3B8", isCore: true },
        { slug: "briefing_sent", label: "Briefing Sent", order: 2, color: "#60A5FA", isCore: false },
        { slug: "proposal_sent", label: "Proposal Sent", order: 3, color: "#818CF8", isCore: false },
        { slug: "negotiation", label: "Negotiation", order: 4, color: "#F59E0B", isCore: false },
        { slug: "active_client", label: "Active Client", order: 5, color: "#10B981", isCore: true },
        { slug: "retainer", label: "Retainer", order: 6, color: "#8B5CF6", isCore: false },
        { slug: "advocate", label: "Advocate", order: 7, color: "#EC4899", isCore: true },
      ],
    },
    {
      industry: "saas",
      name: "SaaS",
      isDefault: false,
      stages: [
        { slug: "lead", label: "Lead", order: 1, color: "#94A3B8", isCore: true },
        { slug: "trial", label: "Trial", order: 2, color: "#60A5FA", isCore: false },
        { slug: "pql", label: "PQL", order: 3, color: "#818CF8", isCore: false },
        { slug: "onboarding", label: "Onboarding", order: 4, color: "#F59E0B", isCore: false },
        { slug: "active_client", label: "Active Client", order: 5, color: "#10B981", isCore: true },
        { slug: "expansion", label: "Expansion", order: 6, color: "#8B5CF6", isCore: false },
        { slug: "advocate", label: "Advocate", order: 7, color: "#EC4899", isCore: true },
      ],
    },
    {
      industry: "real_estate",
      name: "Real Estate",
      isDefault: false,
      stages: [
        { slug: "lead", label: "Lead", order: 1, color: "#94A3B8", isCore: true },
        { slug: "visit_scheduled", label: "Visit Scheduled", order: 2, color: "#60A5FA", isCore: false },
        { slug: "proposal", label: "Proposal", order: 3, color: "#818CF8", isCore: false },
        { slug: "documentation", label: "Documentation", order: 4, color: "#F59E0B", isCore: false },
        { slug: "active_client", label: "Active Client", order: 5, color: "#10B981", isCore: true },
        { slug: "advocate", label: "Advocate", order: 6, color: "#8B5CF6", isCore: true },
      ],
    },
    {
      industry: "law_firm",
      name: "Law Firm",
      isDefault: false,
      stages: [
        { slug: "lead", label: "Lead", order: 1, color: "#94A3B8", isCore: true },
        { slug: "consultation", label: "Consultation", order: 2, color: "#60A5FA", isCore: false },
        { slug: "case_accepted", label: "Case Accepted", order: 3, color: "#818CF8", isCore: false },
        { slug: "in_progress", label: "In Progress", order: 4, color: "#F59E0B", isCore: false },
        { slug: "active_client", label: "Active Client", order: 5, color: "#10B981", isCore: true },
        { slug: "advocate", label: "Advocate", order: 6, color: "#8B5CF6", isCore: true },
      ],
    },
    {
      industry: "ecommerce",
      name: "E-commerce",
      isDefault: false,
      stages: [
        { slug: "lead", label: "Lead", order: 1, color: "#94A3B8", isCore: true },
        { slug: "first_purchase", label: "First Purchase", order: 2, color: "#60A5FA", isCore: false },
        { slug: "repeat_buyer", label: "Repeat Buyer", order: 3, color: "#818CF8", isCore: false },
        { slug: "active_client", label: "Active Client", order: 4, color: "#10B981", isCore: true },
        { slug: "vip", label: "VIP", order: 5, color: "#F59E0B", isCore: false },
        { slug: "advocate", label: "Advocate", order: 6, color: "#8B5CF6", isCore: true },
      ],
    },
  ];

  for (const template of templates) {
    const existing = await prisma.lifecycleTemplate.findFirst({
      where: {
        tenantId: null,
        industry: template.industry,
        name: template.name,
      },
    });

    if (!existing) {
      await prisma.lifecycleTemplate.create({
        data: {
          tenantId: null,
          industry: template.industry,
          name: template.name,
          stages: template.stages,
          isDefault: template.isDefault,
        },
      });
      console.log(`  ✅ LifecycleTemplate created: ${template.name}`);
    } else {
      console.log(`  ℹ️ LifecycleTemplate exists: ${template.name}`);
    }
  }

  // -------------------------------------------------------
  // 2. Default Tags (scoped to tenant, area = 'clients')
  // -------------------------------------------------------

  const defaultTags = [
    { name: "VIP", color: "#F59E0B" },
    { name: "Partner", color: "#8B5CF6" },
    { name: "Referral", color: "#10B981" },
    { name: "At Risk", color: "#EF4444" },
    { name: "Enterprise", color: "#3B82F6" },
    { name: "SMB", color: "#6B7280" },
  ];

  for (const tag of defaultTags) {
    await prisma.tag.upsert({
      where: {
        tenantId_name_areaSlug: {
          tenantId,
          name: tag.name,
          areaSlug: "clients",
        },
      },
      update: {},
      create: {
        tenantId,
        name: tag.name,
        color: tag.color,
        areaSlug: "clients",
      },
    });
  }
  console.log("  ✅ Default CRM tags ensured (6 tags).");

  console.log("✅ Clients + CRM module seed complete.");
}
