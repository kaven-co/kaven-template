import { PrismaClient, Role, TenantStatus, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SeedConfig } from '../types/seed-config';
import { UserMetadata, INTERNAL_ROLE_PERMISSIONS } from '../types/user-metadata';

const prisma = new PrismaClient();

/**
 * Setup Service
 * Serviço reutilizável para configuração inicial do sistema
 * Pode ser usado tanto via CLI (seed.ts) quanto via API (/api/setup/init)
 */
export class SetupService {
  /**
   * Executa o seed completo do banco de dados
   * @param config Configuração do setup
   * @returns Tenant e usuários criados
   */
  static async seedDatabase(config: SeedConfig) {
    console.log('🌱 Starting seed with config:', config.companyName);
    console.log('📋 Mode:', config.mode);
    console.log('👥 Modules:', config.modules);
    
    try {
      // 1. Criar Admin Tenant
      console.log('\n📦 Creating Admin Tenant...');
      const adminTenant = await this.createAdminTenant(config);
      console.log('✅ Admin Tenant created:', adminTenant.name);
      
      // 2. Criar SUPER_ADMIN (obrigatório)
      console.log('\n👑 Creating ARCHITECT (Super Admin)...');
      const architect = await this.createArchitect(adminTenant.id, config);
      console.log('✅ ARCHITECT created:', architect.email);
      
      const users = [architect];
      
      // 3. Criar personas condicionais
      if (config.modules.createFinance) {
        console.log('\n💰 Creating FINANCE user...');
        const finance = await this.createFinanceUser(adminTenant.id);
        console.log('✅ FINANCE created:', finance.email);
        users.push(finance);
      }
      
      if (config.modules.createSupport) {
        console.log('\n🛡️ Creating SUPPORT user...');
        const support = await this.createSupportUser(adminTenant.id);
        console.log('✅ SUPPORT created:', support.email);
        users.push(support);
      }
      
      if (config.modules.createMarketing) {
        console.log('\n📈 Creating MARKETING user...');
        const marketing = await this.createMarketingUser(adminTenant.id);
        console.log('✅ MARKETING created:', marketing.email);
        users.push(marketing);
      }
      
      if (config.modules.createDevOps) {
        console.log('\n👨‍💻 Creating DEVOPS user...');
        const devops = await this.createDevOpsUser(adminTenant.id);
        console.log('✅ DEVOPS created:', devops.email);
        users.push(devops);
      }
      
      console.log('\n✅ Seed completed successfully!');
      console.log('📊 Summary:');
      console.log(`   - Admin Tenant: ${adminTenant.name}`);
      console.log(`   - Users created: ${users.length}`);
      users.forEach(user => console.log(`     - ${user.email} (${user.role})`));
      
      return {
        tenant: adminTenant,
        users
      };
      
    } catch (error) {
      console.error('❌ Seed failed:', error);
      throw error;
    }
  }
  
  /**
   * Cria o Admin Tenant (Kaven HQ)
   */
  private static async createAdminTenant(config: SeedConfig) {
    return await prisma.tenant.upsert({
      where: { slug: 'admin' },
      update: {
        name: config.companyName,
        status: TenantStatus.ACTIVE
      },
      create: {
        name: config.companyName,
        slug: 'admin',
        domain: 'admin.kaven.dev',
        status: TenantStatus.ACTIVE
      }
    });
  }
  
  /**
   * Cria o ARCHITECT (SUPER_ADMIN) - Obrigatório
   */
  private static async createArchitect(tenantId: string, config: SeedConfig) {
    const hashedPassword = await bcrypt.hash(config.adminPassword, 12);
    
    const metadata: UserMetadata = {
      internalRole: 'ARCHITECT',
      permissions: INTERNAL_ROLE_PERMISSIONS.ARCHITECT,
      preferences: {
        theme: 'dark',
        language: 'pt-BR'
      }
    };
    
    return await prisma.user.upsert({
      where: { email: config.adminEmail },
      update: {
        password: hashedPassword,
        metadata: metadata as Prisma.InputJsonValue,
      },
      create: {
        email: config.adminEmail,
        name: 'The Architect',
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
        tenantId: tenantId,
        metadata: metadata as Prisma.InputJsonValue,
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    });
  }
  
  /**
   * Cria o usuário FINANCE (CFO) - Condicional
   */
  private static async createFinanceUser(tenantId: string) {
    const password = process.env.FINANCE_INIT_PASSWORD;
    if (!password) throw new Error('FINANCE_INIT_PASSWORD is required');
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const metadata: UserMetadata = {
      internalRole: 'FINANCE',
      permissions: INTERNAL_ROLE_PERMISSIONS.FINANCE,
      preferences: {
        theme: 'dark',
        language: 'pt-BR'
      }
    };
    
    return await prisma.user.upsert({
      where: { email: 'finance@admin.com' },
      update: {
        metadata: metadata as Prisma.InputJsonValue,
      },
      create: {
        email: 'finance@admin.com',
        name: 'CFO - Finance Team',
        password: hashedPassword,
        role: Role.TENANT_ADMIN,
        tenantId: tenantId,
        metadata: metadata as Prisma.InputJsonValue,
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    });
  }
  
  /**
   * Cria o usuário SUPPORT (Customer Success) - Condicional
   */
  private static async createSupportUser(tenantId: string) {
    const password = process.env.SUPPORT_INIT_PASSWORD;
    if (!password) throw new Error('SUPPORT_INIT_PASSWORD is required');
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const metadata: UserMetadata = {
      internalRole: 'SUPPORT',
      permissions: INTERNAL_ROLE_PERMISSIONS.SUPPORT,
      preferences: {
        theme: 'dark',
        language: 'pt-BR'
      }
    };
    
    return await prisma.user.upsert({
      where: { email: 'support@admin.com' },
      update: {
        metadata: metadata as Prisma.InputJsonValue,
      },
      create: {
        email: 'support@admin.com',
        name: 'Customer Success Team',
        password: hashedPassword,
        role: Role.TENANT_ADMIN,
        tenantId: tenantId,
        metadata: metadata as Prisma.InputJsonValue,
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    });
  }
  
  /**
   * Cria o usuário MARKETING (Growth) - Condicional
   */
  private static async createMarketingUser(tenantId: string) {
    const password = process.env.MARKETING_INIT_PASSWORD;
    if (!password) throw new Error('MARKETING_INIT_PASSWORD is required');
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const metadata: UserMetadata = {
      internalRole: 'MARKETING',
      permissions: INTERNAL_ROLE_PERMISSIONS.MARKETING,
      preferences: {
        theme: 'dark',
        language: 'pt-BR'
      }
    };
    
    return await prisma.user.upsert({
      where: { email: 'marketing@admin.com' },
      update: {
        metadata: metadata as Prisma.InputJsonValue,
      },
      create: {
        email: 'marketing@admin.com',
        name: 'Growth - Marketing Team',
        password: hashedPassword,
        role: Role.TENANT_ADMIN,
        tenantId: tenantId,
        metadata: metadata as Prisma.InputJsonValue,
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    });
  }
  
  /**
   * Cria o usuário DEVOPS (System Health) - Condicional
   */
  private static async createDevOpsUser(tenantId: string) {
    const password = process.env.DEVOPS_INIT_PASSWORD;
    if (!password) throw new Error('DEVOPS_INIT_PASSWORD is required');
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const metadata: UserMetadata = {
      internalRole: 'DEVOPS',
      permissions: INTERNAL_ROLE_PERMISSIONS.DEVOPS,
      preferences: {
        theme: 'dark',
        language: 'pt-BR'
      }
    };
    
    return await prisma.user.upsert({
      where: { email: 'devops@admin.com' },
      update: {
        metadata: metadata as Prisma.InputJsonValue,
      },
      create: {
        email: 'devops@admin.com',
        name: 'DevOps - System Health',
        password: hashedPassword,
        role: Role.TENANT_ADMIN,
        tenantId: tenantId,
        metadata: metadata as Prisma.InputJsonValue,
        emailVerified: true,
        emailVerifiedAt: new Date()
      }
    });
  }
  
  /**
   * Desconecta o Prisma Client
   */
  static async disconnect() {
    await prisma.$disconnect();
  }
}
