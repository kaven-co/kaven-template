import { PrismaClient, GrantApprovalLevel } from '@prisma/client';

import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed de SpaceRoles - Roles por Space
 * 
 * Organizado por Space:
 * - Support (3 roles)
 * - DevOps (4 roles)
 * - Finance (4 roles)
 * - Marketing (4 roles)
 * - Executive (5 roles)
 * 
 * Total: 20 roles
 */

export async function seedSpaceRoles() {
  console.log('👥 Seeding Space Roles...');

  // Buscar Spaces existentes
  const supportSpace = await prisma.space.findFirst({ where: { code: 'SUPPORT' } });
  const devopsSpace = await prisma.space.findFirst({ where: { code: 'DEVOPS' } });
  const financeSpace = await prisma.space.findFirst({ where: { code: 'FINANCE' } });
  const marketingSpace = await prisma.space.findFirst({ where: { code: 'MARKETING' } });
  const executiveSpace = await prisma.space.findFirst({ where: { code: 'EXECUTIVE' } });

  if (!supportSpace || !devopsSpace || !financeSpace || !marketingSpace || !executiveSpace) {
    console.log('⚠️  Spaces não encontrados. Execute o seed de Spaces primeiro.');
    return;
  }

  const roles = [
    // ===========================
    // SUPPORT ROLES (3)
    // ===========================
    {
      spaceId: supportSpace.id,
      code: 'SUPPORT_AGENT',
      name: 'Agente de Suporte',
      description: 'Agente de suporte com acesso a tickets e clientes',
      hierarchy: 1,
      canApproveGrants: false,
      capabilities: [
        'tickets.read',
        'tickets.create',
        'tickets.update',
        'tickets.assign',
        'tickets.close',
        'customers.read',
        'kb.read',
      ],
    },
    {
      spaceId: supportSpace.id,
      code: 'SUPPORT_LEAD',
      name: 'Líder de Suporte',
      description: 'Líder de equipe com permissões adicionais',
      hierarchy: 2,
      canApproveGrants: true,
      canApproveLevel: GrantApprovalLevel.NORMAL,
      capabilities: [
        'tickets.read',
        'tickets.create',
        'tickets.update',
        'tickets.delete',
        'tickets.assign',
        'tickets.close',
        'tickets.reopen',
        'tickets.export',
        'customers.read',
        'customers.update',
        'kb.read',
        'kb.manage',
      ],
    },
    {
      spaceId: supportSpace.id,
      code: 'SUPPORT_MANAGER',
      name: 'Gerente de Suporte',
      description: 'Gerente com acesso total ao suporte',
      hierarchy: 3,
      canApproveGrants: true,
      canApproveLevel: GrantApprovalLevel.SENSITIVE,
      capabilities: [
        'tickets.read',
        'tickets.create',
        'tickets.update',
        'tickets.delete',
        'tickets.assign',
        'tickets.close',
        'tickets.reopen',
        'tickets.export',
        'customers.read',
        'customers.update',
        'kb.read',
        'kb.manage',
        'users.export',
      ],
    },

    // ===========================
    // DEVOPS ROLES (4)
    // ===========================
    {
      spaceId: devopsSpace.id,
      code: 'DEVOPS_JUNIOR',
      name: 'DevOps Júnior',
      description: 'DevOps júnior com acesso limitado',
      hierarchy: 1,
      canApproveGrants: false,
      capabilities: [
        'servers.read',
        'deployments.read',
        'logs.read',
        'monitoring.read',
      ],
    },
    {
      spaceId: devopsSpace.id,
      code: 'DEVOPS_ENGINEER',
      name: 'Engenheiro DevOps',
      description: 'Engenheiro com permissões de deployment',
      hierarchy: 2,
      canApproveGrants: false,
      capabilities: [
        'servers.read',
        'deployments.read',
        'deployments.create',
        'logs.read',
        'monitoring.read',
        'monitoring.manage',
        'database.read',
        'incidents.manage',
      ],
    },
    {
      spaceId: devopsSpace.id,
      code: 'SRE',
      name: 'Site Reliability Engineer',
      description: 'SRE com acesso a infraestrutura crítica',
      hierarchy: 3,
      canApproveGrants: true,
      canApproveLevel: GrantApprovalLevel.SENSITIVE,
      capabilities: [
        'servers.read',
        'servers.manage',
        'deployments.read',
        'deployments.create',
        'deployments.rollback',
        'logs.read',
        'logs.export',
        'monitoring.read',
        'monitoring.manage',
        'database.read',
        'database.backup',
        'secrets.read',
        'incidents.manage',
      ],
    },
    {
      spaceId: devopsSpace.id,
      code: 'DEVOPS_LEAD',
      name: 'Líder DevOps',
      description: 'Líder com acesso total a infraestrutura',
      hierarchy: 4,
      canApproveGrants: true,
      canApproveLevel: GrantApprovalLevel.CRITICAL,
      capabilities: [
        'servers.read',
        'servers.manage',
        'deployments.read',
        'deployments.create',
        'deployments.rollback',
        'logs.read',
        'logs.export',
        'monitoring.read',
        'monitoring.manage',
        'database.read',
        'database.backup',
        'database.restore',
        'secrets.read',
        'secrets.manage',
        'incidents.manage',
      ],
    },

    // ===========================
    // FINANCE ROLES (4)
    // ===========================
    {
      spaceId: financeSpace.id,
      code: 'FINANCE_ANALYST',
      name: 'Analista Financeiro',
      description: 'Analista com acesso de leitura',
      hierarchy: 1,
      canApproveGrants: false,
      capabilities: [
        'invoices.read',
        'payments.read',
        'subscriptions.read',
        'analytics.revenue',
      ],
    },
    {
      spaceId: financeSpace.id,
      code: 'FINANCE_SPECIALIST',
      name: 'Especialista Financeiro',
      description: 'Especialista com permissões de gestão',
      hierarchy: 2,
      canApproveGrants: false,
      capabilities: [
        'invoices.read',
        'invoices.create',
        'invoices.update',
        'payments.read',
        'payments.process',
        'subscriptions.read',
        'subscriptions.manage',
        'analytics.revenue',
      ],
    },
    {
      spaceId: financeSpace.id,
      code: 'FINANCE_MANAGER',
      name: 'Gerente Financeiro',
      description: 'Gerente com acesso a reembolsos',
      hierarchy: 3,
      canApproveGrants: true,
      canApproveLevel: GrantApprovalLevel.SENSITIVE,
      capabilities: [
        'invoices.read',
        'invoices.create',
        'invoices.update',
        'invoices.delete',
        'payments.read',
        'payments.process',
        'refunds.create',
        'subscriptions.read',
        'subscriptions.manage',
        'reports.financial',
        'analytics.revenue',
      ],
    },
    {
      spaceId: financeSpace.id,
      code: 'FINANCE_DIRECTOR',
      name: 'Diretor Financeiro',
      description: 'Diretor com acesso total',
      hierarchy: 4,
      canApproveGrants: true,
      canApproveLevel: GrantApprovalLevel.CRITICAL,
      capabilities: [
        'invoices.read',
        'invoices.create',
        'invoices.update',
        'invoices.delete',
        'payments.read',
        'payments.process',
        'refunds.create',
        'refunds.approve',
        'subscriptions.read',
        'subscriptions.manage',
        'reports.financial',
        'analytics.revenue',
      ],
    },

    // ===========================
    // MARKETING ROLES (4)
    // ===========================
    {
      spaceId: marketingSpace.id,
      code: 'MARKETING_ASSISTANT',
      name: 'Assistente de Marketing',
      description: 'Assistente com acesso limitado',
      hierarchy: 1,
      canApproveGrants: false,
      capabilities: [
        'campaigns.read',
        'emails.templates',
        'analytics.marketing',
        'leads.read',
        'content.publish',
      ],
    },
    {
      spaceId: marketingSpace.id,
      code: 'MARKETING_SPECIALIST',
      name: 'Especialista de Marketing',
      description: 'Especialista com permissões de criação',
      hierarchy: 2,
      canApproveGrants: false,
      capabilities: [
        'campaigns.read',
        'campaigns.create',
        'campaigns.update',
        'emails.send',
        'emails.templates',
        'analytics.marketing',
        'leads.read',
        'leads.manage',
        'content.publish',
      ],
    },
    {
      spaceId: marketingSpace.id,
      code: 'MARKETING_MANAGER',
      name: 'Gerente de Marketing',
      description: 'Gerente com acesso total',
      hierarchy: 3,
      canApproveGrants: true,
      canApproveLevel: GrantApprovalLevel.NORMAL,
      capabilities: [
        'campaigns.read',
        'campaigns.create',
        'campaigns.update',
        'campaigns.delete',
        'emails.send',
        'emails.templates',
        'analytics.marketing',
        'leads.read',
        'leads.manage',
        'content.publish',
      ],
    },
    {
      spaceId: marketingSpace.id,
      code: 'MARKETING_DIRECTOR',
      name: 'Diretor de Marketing',
      description: 'Diretor com acesso estratégico',
      hierarchy: 4,
      canApproveGrants: true,
      canApproveLevel: GrantApprovalLevel.SENSITIVE,
      capabilities: [
        'campaigns.read',
        'campaigns.create',
        'campaigns.update',
        'campaigns.delete',
        'emails.send',
        'emails.templates',
        'analytics.marketing',
        'leads.read',
        'leads.manage',
        'content.publish',
      ],
    },

    // ===========================
    // EXECUTIVE ROLES (5)
    // ===========================
    {
      spaceId: executiveSpace.id,
      code: 'EXECUTIVE_VIEWER',
      name: 'Visualizador Executivo',
      description: 'Acesso de leitura a dashboards executivos',
      hierarchy: 1,
      canApproveGrants: false,
      capabilities: [
        'analytics.revenue',
        'analytics.marketing',
        'reports.financial',
        'audit.read',
      ],
    },
    {
      spaceId: executiveSpace.id,
      code: 'MANAGER',
      name: 'Gerente',
      description: 'Gerente com acesso a gestão de usuários',
      hierarchy: 2,
      canApproveGrants: true,
      canApproveLevel: GrantApprovalLevel.NORMAL,
      capabilities: [
        'users.read',
        'users.create',
        'users.update',
        'roles.read',
        'analytics.revenue',
        'analytics.marketing',
        'audit.read',
      ],
    },
    {
      spaceId: executiveSpace.id,
      code: 'DIRECTOR',
      name: 'Diretor',
      description: 'Diretor com acesso a configurações',
      hierarchy: 3,
      canApproveGrants: true,
      canApproveLevel: GrantApprovalLevel.SENSITIVE,
      capabilities: [
        'users.read',
        'users.create',
        'users.update',
        'users.delete',
        'roles.read',
        'roles.manage',
        'settings.read',
        'analytics.revenue',
        'analytics.marketing',
        'reports.financial',
        'audit.read',
        'audit.export',
        'users.export',
      ],
    },
    {
      spaceId: executiveSpace.id,
      code: 'VP',
      name: 'Vice-Presidente',
      description: 'VP com acesso a impersonation',
      hierarchy: 4,
      canApproveGrants: true,
      canApproveLevel: GrantApprovalLevel.CRITICAL,
      capabilities: [
        'users.read',
        'users.create',
        'users.update',
        'users.delete',
        'roles.read',
        'roles.manage',
        'settings.read',
        'settings.manage',
        'analytics.revenue',
        'analytics.marketing',
        'reports.financial',
        'audit.read',
        'audit.export',
        'users.export',
        'impersonate.user',
      ],
    },
    {
      spaceId: executiveSpace.id,
      code: 'CEO',
      name: 'CEO',
      description: 'CEO com acesso total',
      hierarchy: 5,
      canApproveGrants: true,
      canApproveLevel: GrantApprovalLevel.CRITICAL,
      capabilities: [
        'users.read',
        'users.create',
        'users.update',
        'users.delete',
        'roles.read',
        'roles.manage',
        'settings.read',
        'settings.manage',
        'analytics.revenue',
        'analytics.marketing',
        'reports.financial',
        'audit.read',
        'audit.export',
        'users.export',
        'impersonate.user',
      ],
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const roleData of roles) {
    const { capabilities: capabilityCodes, ...roleFields } = roleData;

    // Verificar se role já existe
    const existing = await prisma.spaceRole.findUnique({
      where: {
        spaceId_code: {
          spaceId: roleFields.spaceId,
          code: roleFields.code,
        },
      },
    });

    if (existing) {
      // Se já existe, atualizar as capabilities para garantir que novas permissões sejam aplicadas
      // Primeiro, remover associações antigas para este papel
      await prisma.roleCapability.deleteMany({
        where: { roleId: existing.id }
      });

      // Reassociar capabilities atualizadas
      for (const capabilityCode of capabilityCodes) {
        const capability = await prisma.capability.findUnique({
          where: { code: capabilityCode },
        });

        if (capability) {
          await prisma.roleCapability.create({
            data: {
              roleId: existing.id,
              capabilityId: capability.id,
            },
          });
        }
      }

      skipped++;
      continue;
    }

    // Criar role
    const role = await prisma.spaceRole.create({
      data: roleFields,
    });

    // Associar capabilities
    for (const capabilityCode of capabilityCodes) {
      const capability = await prisma.capability.findUnique({
        where: { code: capabilityCode },
      });

      if (capability) {
        await prisma.roleCapability.create({
          data: {
            roleId: role.id,
            capabilityId: capability.id,
          },
        });
      }
    }

    created++;
  }

  console.log(`✅ Space Roles: ${created} criadas, ${skipped} já existiam`);
  console.log(`📊 Total de roles: ${roles.length}`);
}
