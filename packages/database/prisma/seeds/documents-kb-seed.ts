import { PrismaClient, TemplateCategory } from "@prisma/client";

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed data for Documents + Knowledge Base module.
 *
 * Creates:
 * - 4 system KBCategories (Getting Started, FAQ, How-To Guides, Best Practices)
 * - 7 system DocumentTemplates (one per TemplateCategory)
 */
export async function seedDocumentsKB(tenantId: string, ownerId?: string) {
  console.log("\n📄 Seeding Documents + Knowledge Base module...");

  // -------------------------------------------------------
  // 1. System KB Categories
  // -------------------------------------------------------

  const systemCategories = [
    {
      slug: "getting-started",
      name: "Getting Started",
      description: "Introductory guides and onboarding materials",
      icon: "Rocket",
      color: "#10B981",
      order: 1,
    },
    {
      slug: "faq",
      name: "FAQ",
      description: "Frequently asked questions",
      icon: "HelpCircle",
      color: "#3B82F6",
      order: 2,
    },
    {
      slug: "how-to-guides",
      name: "How-To Guides",
      description: "Step-by-step tutorials and walkthroughs",
      icon: "BookOpen",
      color: "#F59E0B",
      order: 3,
    },
    {
      slug: "best-practices",
      name: "Best Practices",
      description: "Recommended patterns and conventions",
      icon: "Award",
      color: "#8B5CF6",
      order: 4,
    },
  ];

  for (const cat of systemCategories) {
    await prisma.kBCategory.upsert({
      where: { tenantId_slug: { tenantId, slug: cat.slug } },
      update: {},
      create: {
        tenantId,
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        color: cat.color,
        order: cat.order,
        isSystem: true,
        systemSlug: cat.slug,
      },
    });
    console.log(`  ✅ KB Category: ${cat.name}`);
  }

  // -------------------------------------------------------
  // 2. System Root Folders
  // -------------------------------------------------------

  const systemFolders = [
    {
      systemSlug: "documents",
      name: "Documents",
      description: "Default root folder for all documents",
      icon: "FileText",
      color: "#3B82F6",
    },
    {
      systemSlug: "templates",
      name: "Templates",
      description: "Folder for document templates and reusable content",
      icon: "Layout",
      color: "#8B5CF6",
    },
    {
      systemSlug: "archive",
      name: "Archive",
      description: "Archived documents and files",
      icon: "Archive",
      color: "#6B7280",
    },
  ];

  for (const folder of systemFolders) {
    const existing = await prisma.folder.findFirst({
      where: {
        tenantId,
        systemSlug: folder.systemSlug,
        isSystem: true,
      },
    });

    if (!existing) {
      await prisma.folder.create({
        data: {
          tenantId,
          name: folder.name,
          description: folder.description,
          icon: folder.icon,
          color: folder.color,
          ownerId: ownerId || tenantId, // uses ownerId if provided, falls back to tenantId
          isSystem: true,
          systemSlug: folder.systemSlug,
          visibility: "TENANT",
        },
      });
      console.log(`  ✅ System Folder: ${folder.name}`);
    } else {
      console.log(`  ℹ️ System Folder exists: ${folder.name}`);
    }
  }

  // -------------------------------------------------------
  // 3. System Document Templates (one per TemplateCategory)
  // -------------------------------------------------------

  const systemTemplates: Array<{
    name: string;
    description: string;
    category: TemplateCategory;
    content: Record<string, unknown>;
    tags: string[];
  }> = [
    {
      name: "Legal Agreement",
      description: "Standard legal agreement template with placeholder sections",
      category: "LEGAL",
      content: {
        title: "Legal Agreement",
        sections: [
          { heading: "Parties", body: "This agreement is between [PARTY A] and [PARTY B]." },
          { heading: "Terms", body: "The terms and conditions are as follows..." },
          { heading: "Signatures", body: "Signed by the parties on [DATE]." },
        ],
      },
      tags: ["legal", "contract", "agreement"],
    },
    {
      name: "Employee Onboarding Checklist",
      description: "HR onboarding checklist for new team members",
      category: "HR",
      content: {
        title: "Employee Onboarding",
        checklist: [
          "Setup email and accounts",
          "Schedule introductions",
          "Review company policies",
          "Complete compliance training",
          "Assign mentor/buddy",
        ],
      },
      tags: ["hr", "onboarding", "checklist"],
    },
    {
      name: "Monthly Financial Report",
      description: "Template for monthly financial summary reports",
      category: "FINANCE",
      content: {
        title: "Monthly Financial Report — [MONTH/YEAR]",
        sections: [
          { heading: "Revenue Summary", body: "Total revenue: [AMOUNT]" },
          { heading: "Expenses", body: "Total expenses: [AMOUNT]" },
          { heading: "Net Profit", body: "Net profit: [AMOUNT]" },
        ],
      },
      tags: ["finance", "report", "monthly"],
    },
    {
      name: "Campaign Brief",
      description: "Marketing campaign planning brief",
      category: "MARKETING",
      content: {
        title: "Campaign Brief — [CAMPAIGN NAME]",
        sections: [
          { heading: "Objective", body: "The goal of this campaign is..." },
          { heading: "Target Audience", body: "Primary audience: [DESCRIPTION]" },
          { heading: "Channels", body: "Distribution channels: [LIST]" },
          { heading: "Budget", body: "Allocated budget: [AMOUNT]" },
        ],
      },
      tags: ["marketing", "campaign", "brief"],
    },
    {
      name: "Project Kickoff",
      description: "Project kickoff document template",
      category: "PROJECTS",
      content: {
        title: "Project Kickoff — [PROJECT NAME]",
        sections: [
          { heading: "Objective", body: "Project objective: [DESCRIPTION]" },
          { heading: "Scope", body: "In-scope: [LIST]. Out-of-scope: [LIST]." },
          { heading: "Timeline", body: "Start: [DATE]. Target completion: [DATE]." },
          { heading: "Team", body: "Project lead: [NAME]. Members: [LIST]." },
        ],
      },
      tags: ["project", "kickoff", "planning"],
    },
    {
      name: "Client Proposal",
      description: "Standard client proposal template",
      category: "CLIENTS",
      content: {
        title: "Proposal for [CLIENT NAME]",
        sections: [
          { heading: "Executive Summary", body: "We propose..." },
          { heading: "Scope of Work", body: "Deliverables include..." },
          { heading: "Pricing", body: "Investment: [AMOUNT]" },
          { heading: "Timeline", body: "Estimated delivery: [TIMEFRAME]" },
        ],
      },
      tags: ["client", "proposal", "sales"],
    },
    {
      name: "General Meeting Notes",
      description: "Template for meeting notes and action items",
      category: "GENERAL",
      content: {
        title: "Meeting Notes — [DATE]",
        sections: [
          { heading: "Attendees", body: "[LIST]" },
          { heading: "Agenda", body: "[TOPICS]" },
          { heading: "Discussion", body: "[NOTES]" },
          { heading: "Action Items", body: "[TASKS WITH OWNERS AND DEADLINES]" },
        ],
      },
      tags: ["meeting", "notes", "general"],
    },
  ];

  for (const tmpl of systemTemplates) {
    // System templates have tenantId = null (global)
    const existing = await prisma.documentTemplate.findFirst({
      where: {
        tenantId: null,
        name: tmpl.name,
        isSystem: true,
      },
    });

    if (!existing) {
      await prisma.documentTemplate.create({
        data: {
          tenantId: null,
          name: tmpl.name,
          description: tmpl.description,
          category: tmpl.category,
          content: tmpl.content,
          tags: tmpl.tags,
          isActive: true,
          isSystem: true,
        },
      });
      console.log(`  ✅ Template: ${tmpl.name} (${tmpl.category})`);
    } else {
      console.log(`  ℹ️ Template exists: ${tmpl.name}`);
    }
  }

  console.log("✅ Documents + Knowledge Base seed complete.");
}

// Allow standalone execution
if (require.main === module) {
  (async () => {
    const tenant = await prisma.tenant.findFirst({
      where: { status: "ACTIVE" },
    });

    if (!tenant) {
      console.error("❌ No active tenant found. Run main seed first.");
      process.exit(1);
    }

    // Find admin user for folder ownership
    const adminUser = await prisma.user.findFirst({
      where: { tenantId: tenant.id, role: "ADMIN" },
    });

    await seedDocumentsKB(tenant.id, adminUser?.id);
    await prisma.$disconnect();
  })().catch(async (e) => {
    console.error("❌ Error seeding documents-kb:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
}
