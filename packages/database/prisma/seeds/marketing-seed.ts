import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed sample data for the Marketing module.
 * Creates sample campaigns, email templates, forms and calendar entries.
 */
export async function seedMarketing(tenantId: string, userId: string) {
  console.log('\n📣 Seeding Marketing module data...');

  // -------------------------------------------------------
  // 1. Marketing Email Templates
  // -------------------------------------------------------

  const welcomeTemplate = await prisma.mktEmailTemplate.upsert({
    where: { tenantId_slug: { tenantId, slug: 'welcome-series' } },
    update: {},
    create: {
      tenantId,
      name: 'Welcome Series',
      slug: 'welcome-series',
      subject: 'Welcome to {{companyName}}!',
      htmlContent: '<h1>Welcome, {{firstName}}!</h1><p>We are excited to have you on board.</p>',
      textContent: 'Welcome, {{firstName}}! We are excited to have you on board.',
      variables: ['firstName', 'companyName'],
      category: 'onboarding',
      isSystem: true,
      createdById: userId,
    },
  });
  console.log(`  ✅ Email Template: ${welcomeTemplate.name}`);

  const newsletterTemplate = await prisma.mktEmailTemplate.upsert({
    where: { tenantId_slug: { tenantId, slug: 'monthly-newsletter' } },
    update: {},
    create: {
      tenantId,
      name: 'Monthly Newsletter',
      slug: 'monthly-newsletter',
      subject: '{{companyName}} Newsletter — {{month}}',
      htmlContent: '<h1>{{month}} Newsletter</h1><p>Here is what happened this month...</p>',
      textContent: '{{month}} Newsletter — Here is what happened this month...',
      variables: ['month', 'companyName'],
      category: 'newsletter',
      isSystem: true,
      createdById: userId,
    },
  });
  console.log(`  ✅ Email Template: ${newsletterTemplate.name}`);

  const promoTemplate = await prisma.mktEmailTemplate.upsert({
    where: { tenantId_slug: { tenantId, slug: 'product-launch' } },
    update: {},
    create: {
      tenantId,
      name: 'Product Launch',
      slug: 'product-launch',
      subject: 'Introducing {{productName}} — {{tagline}}',
      htmlContent: '<h1>{{productName}}</h1><p>{{tagline}}</p><a href="{{ctaUrl}}">Learn More</a>',
      textContent: '{{productName}} — {{tagline}}. Learn more: {{ctaUrl}}',
      variables: ['productName', 'tagline', 'ctaUrl'],
      category: 'promotional',
      isSystem: false,
      createdById: userId,
    },
  });
  console.log(`  ✅ Email Template: ${promoTemplate.name}`);

  // -------------------------------------------------------
  // 2. Sample Campaigns
  // -------------------------------------------------------

  const campaign1 = await prisma.campaign.upsert({
    where: { tenantId_slug: { tenantId, slug: 'q1-welcome-campaign' } },
    update: {},
    create: {
      tenantId,
      name: 'Q1 Welcome Campaign',
      slug: 'q1-welcome-campaign',
      description: 'Automated welcome email series for new leads',
      channel: 'EMAIL',
      status: 'DRAFT',
      subject: 'Welcome to our platform!',
      tags: ['welcome', 'onboarding', 'automated'],
      ownerId: userId,
    },
  });
  console.log(`  ✅ Campaign: ${campaign1.name}`);

  const campaign2 = await prisma.campaign.upsert({
    where: { tenantId_slug: { tenantId, slug: 'product-launch-2026' } },
    update: {},
    create: {
      tenantId,
      name: 'Product Launch 2026',
      slug: 'product-launch-2026',
      description: 'Major product launch announcement campaign',
      channel: 'EMAIL',
      status: 'SCHEDULED',
      subject: 'Something big is coming...',
      scheduledAt: new Date('2026-04-15T10:00:00Z'),
      budget: 5000,
      goalMetric: 'conversions',
      goalValue: 100,
      tags: ['launch', 'product', 'announcement'],
      ownerId: userId,
    },
  });
  console.log(`  ✅ Campaign: ${campaign2.name}`);

  // -------------------------------------------------------
  // 3. Sample Lead Capture Forms
  // -------------------------------------------------------

  const contactForm = await prisma.mktForm.upsert({
    where: { tenantId_slug: { tenantId, slug: 'contact-us' } },
    update: {},
    create: {
      tenantId,
      name: 'Contact Us',
      slug: 'contact-us',
      description: 'Main contact form for website visitors',
      fields: [
        { name: 'fullName', type: 'text', label: 'Full Name', required: true },
        { name: 'email', type: 'email', label: 'Email', required: true },
        { name: 'phone', type: 'tel', label: 'Phone', required: false },
        { name: 'message', type: 'textarea', label: 'Message', required: true },
      ],
      thankYouMessage: 'Thank you for contacting us! We will get back to you shortly.',
      isActive: true,
      createdById: userId,
    },
  });
  console.log(`  ✅ Form: ${contactForm.name}`);

  const demoForm = await prisma.mktForm.upsert({
    where: { tenantId_slug: { tenantId, slug: 'request-demo' } },
    update: {},
    create: {
      tenantId,
      name: 'Request a Demo',
      slug: 'request-demo',
      description: 'Demo request form for qualified leads',
      fields: [
        { name: 'fullName', type: 'text', label: 'Full Name', required: true },
        { name: 'email', type: 'email', label: 'Work Email', required: true },
        { name: 'company', type: 'text', label: 'Company', required: true },
        { name: 'role', type: 'select', label: 'Role', required: true, options: ['CEO/Founder', 'CTO', 'Developer', 'Product Manager', 'Other'] },
        { name: 'teamSize', type: 'select', label: 'Team Size', required: true, options: ['1-5', '6-20', '21-50', '51-200', '200+'] },
      ],
      thankYouMessage: 'Thank you! A team member will reach out within 24 hours to schedule your demo.',
      isActive: true,
      createdById: userId,
    },
  });
  console.log(`  ✅ Form: ${demoForm.name}`);

  // -------------------------------------------------------
  // 4. Marketing Calendar Entries
  // -------------------------------------------------------

  await prisma.marketingCalendar.upsert({
    where: { id: 'mktcal-seed-launch' },
    update: {},
    create: {
      id: 'mktcal-seed-launch',
      tenantId,
      title: 'Product Launch Campaign',
      description: 'Send product launch email to all segments',
      type: 'campaign',
      scheduledAt: new Date('2026-04-15T10:00:00Z'),
      endAt: new Date('2026-04-15T18:00:00Z'),
      status: 'scheduled',
      channel: 'EMAIL',
      campaignId: campaign2.id,
      color: '#f59e0b',
      createdById: userId,
    },
  });

  await prisma.marketingCalendar.upsert({
    where: { id: 'mktcal-seed-webinar' },
    update: {},
    create: {
      id: 'mktcal-seed-webinar',
      tenantId,
      title: 'Monthly Webinar — SaaS Growth Tactics',
      description: 'Live webinar on SaaS growth strategies',
      type: 'event',
      scheduledAt: new Date('2026-04-20T14:00:00Z'),
      endAt: new Date('2026-04-20T15:30:00Z'),
      status: 'scheduled',
      color: '#3b82f6',
      createdById: userId,
    },
  });

  console.log('  ✅ Marketing Calendar entries seeded');

  console.log('✅ Marketing module seed complete.');
}

// Allow standalone execution
if (require.main === module) {
  const tenantId = process.argv[2] || 'default-tenant-id';
  const userId = process.argv[3] || 'default-user-id';
  seedMarketing(tenantId, userId)
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
      console.error('❌ Error seeding marketing data:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
