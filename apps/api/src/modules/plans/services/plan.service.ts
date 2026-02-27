import { prisma } from '../../../lib/prisma';
import type { CreatePlanInput, UpdatePlanInput, ListPlansInput } from '../../../lib/validation-plans';

export interface PlanRequesterContext {
  role: string;
  tenantId: string | null;
}

export class PlanService {
  /**
   * Lista planos com filtros opcionais
   */
  async listPlans(filters: ListPlansInput = {}) {
    const where: any = {};

    if (filters.tenantId !== undefined) {
      where.tenantId = filters.tenantId;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    const plans = await prisma.plan.findMany({
      where,
      include: {
        prices: {
          where: { isActive: true },
          orderBy: { amount: 'asc' },
        },
        features: {
          include: {
            feature: true,
          },
          orderBy: {
            feature: {
              sortOrder: 'asc',
            },
          },
        },
        products: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return plans.map(plan => this.formatPlanResponse(plan));
  }

  /**
   * Busca plano por ID
   */
  async getPlanById(id: string, tenantId?: string) {
    const where: any = { id };
    
    if (tenantId) {
      where.OR = [
        { tenantId },
        { tenantId: null },
        { isPublic: true }
      ];
    } else {
       where.isPublic = true;
    }

    const plan = await prisma.plan.findFirst({
      where,
      include: {
        prices: {
          where: { isActive: true },
          orderBy: { amount: 'asc' },
        },
        features: {
          include: {
            feature: true,
          },
          orderBy: {
            feature: {
              sortOrder: 'asc',
            },
          },
        },
        products: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    return this.formatPlanResponse(plan);
  }

  /**
   * Busca plano por código
   */
  async getPlanByCode(code: string, tenantId?: string | null) {
    const plan = await prisma.plan.findFirst({
      where: {
        code,
        tenantId: tenantId ?? null,
      },
      include: {
        prices: {
          where: { isActive: true },
        },
        features: {
          include: {
            feature: true,
          },
        },
        products: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    return this.formatPlanResponse(plan);
  }

  /**
   * Validates multi-tenant scoping rules for plan creation/update.
   *
   * Business rules:
   * - Global plans (tenantId=null) can only be created by SUPER_ADMIN
   * - Tenant plans must have a valid tenantId matching the requester's tenant
   * - TENANT_ADMIN can only create plans for their own tenant
   */
  validatePlanTenantScope(data: { tenantId?: string | null }, requester?: PlanRequesterContext): void {
    if (!requester) return; // Skip validation if no requester context (e.g., seed scripts)

    const planTenantId = data.tenantId ?? null;

    // Rule 1: Global plans (tenantId=null) can only be created by SUPER_ADMIN
    if (planTenantId === null && requester.role !== 'SUPER_ADMIN') {
      throw new Error('Only SUPER_ADMIN can create global plans (tenantId=null)');
    }

    // Rule 2: Tenant-specific plans must match the requester's tenant (unless SUPER_ADMIN)
    if (planTenantId !== null && requester.role !== 'SUPER_ADMIN') {
      if (!requester.tenantId) {
        throw new Error('Requester must belong to a tenant to create tenant-specific plans');
      }
      if (planTenantId !== requester.tenantId) {
        throw new Error('Cannot create plans for a different tenant');
      }
    }
  }

  /**
   * Cria novo plano
   */
  async createPlan(data: CreatePlanInput, requester?: PlanRequesterContext) {
    // Validate multi-tenant scoping rules
    this.validatePlanTenantScope(data, requester);

    // Verificar se código já existe para este tenant
    const existing = await prisma.plan.findFirst({
      where: {
        code: data.code,
        tenantId: data.tenantId ?? null,
      },
    });

    if (existing) {
      throw new Error('Já existe um plano com este código');
    }

    // Se isDefault = true, remover default de outros planos
    if (data.isDefault) {
      await prisma.plan.updateMany({
        where: {
          tenantId: data.tenantId ?? null,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Extrair prices e features do input
    const { prices, features, ...planData } = data;

    // Criar plano com prices
    const plan = await prisma.plan.create({
      data: {
        ...planData,
        prices: {
          create: prices.map(price => ({
            interval: price.interval,
            intervalCount: price.intervalCount,
            amount: price.amount,
            currency: price.currency,
            originalAmount: price.originalAmount,
            stripePriceId: price.stripePriceId,
            pagueBitPriceId: price.pagueBitPriceId,
          })),
        },
      },
      include: {
        prices: true,
      },
    });

    // Adicionar features se fornecidas
    if (features && features.length > 0) {
      await this.addFeaturesToPlan(plan.id, features);
    }

    // Retornar plano completo
    return this.getPlanById(plan.id);
  }

  /**
   * Atualiza plano existente
   */
  async updatePlan(id: string, data: UpdatePlanInput) {
    // Verificar se plano existe
    const existing = await prisma.plan.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Plano não encontrado');
    }

    // Se isDefault = true, remover default de outros planos
    if (data.isDefault) {
      await prisma.plan.updateMany({
        where: {
          tenantId: existing.tenantId,
          isDefault: true,
          id: { not: id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Atualizar plano
    const plan = await prisma.plan.update({
      where: { id },
      data: data as any, // Metadata type compatibility
    });

    return this.getPlanById(plan.id);
  }

  /**
   * Desativa plano (soft delete)
   */
  async deletePlan(id: string) {
    // Verificar se plano existe
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        subscriptions: {
          where: {
            status: { in: ['ACTIVE', 'TRIALING'] },
          },
        },
      },
    });

    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    // Não permitir deletar plano com subscriptions ativas
    if (plan.subscriptions.length > 0) {
      throw new Error('Não é possível deletar plano com assinaturas ativas');
    }

    // Soft delete (desativar)
    await prisma.plan.update({
      where: { id },
      data: {
        isActive: false,
        isPublic: false,
      },
    });

    return { message: 'Plano desativado com sucesso' };
  }

  /**
   * Adiciona features a um plano
   */
  async addFeaturesToPlan(
    planId: string,
    features: Array<{
      featureCode: string;
      enabled?: boolean;
      limitValue?: number;
      customValue?: string;
      displayOverride?: string;
    }>
  ) {
    // Buscar features por código
    const featureCodes = features.map(f => f.featureCode);
    const dbFeatures = await prisma.feature.findMany({
      where: {
        code: { in: featureCodes },
        isActive: true,
      },
    });

    if (dbFeatures.length !== featureCodes.length) {
      const foundCodes = dbFeatures.map(f => f.code);
      const missing = featureCodes.filter(c => !foundCodes.includes(c));
      throw new Error(`Features não encontradas: ${missing.join(', ')}`);
    }

    // Criar PlanFeatures
    const planFeatures = features.map(f => {
      const feature = dbFeatures.find(dbF => dbF.code === f.featureCode)!;
      return {
        planId,
        featureId: feature.id,
        enabled: f.enabled ?? true,
        limitValue: f.limitValue,
        customValue: f.customValue,
        displayOverride: f.displayOverride,
      };
    });

    await prisma.planFeature.createMany({
      data: planFeatures,
      skipDuplicates: true,
    });
  }

  /**
   * Atualiza feature de um plano
   */
  async updatePlanFeature(
    planId: string,
    featureCode: string,
    data: {
      enabled?: boolean;
      limitValue?: number;
      customValue?: string;
      displayOverride?: string;
    }
  ) {
    // Buscar feature
    const feature = await prisma.feature.findUnique({
      where: { code: featureCode },
    });

    if (!feature) {
      throw new Error('Feature não encontrada');
    }

    // Atualizar ou criar PlanFeature
    await prisma.planFeature.upsert({
      where: {
        planId_featureId: {
          planId,
          featureId: feature.id,
        },
      },
      update: data,
      create: {
        planId,
        featureId: feature.id,
        ...data,
      },
    });

    return this.getPlanById(planId);
  }

  /**
   * Remove feature de um plano
   */
  async removePlanFeature(planId: string, featureCode: string) {
    const feature = await prisma.feature.findUnique({
      where: { code: featureCode },
    });

    if (!feature) {
      throw new Error('Feature não encontrada');
    }

    await prisma.planFeature.delete({
      where: {
        planId_featureId: {
          planId,
          featureId: feature.id,
        },
      },
    });

    return { message: 'Feature removida do plano' };
  }

  /**
   * Formata resposta do plano para API
   */
  private formatPlanResponse(plan: any) {
    return {
      id: plan.id,
      code: plan.code,
      name: plan.name,
      description: plan.description,
      type: plan.type,
      trialDays: plan.trialDays,
      isDefault: plan.isDefault,
      isPublic: plan.isPublic,
      isActive: plan.isActive,
      sortOrder: plan.sortOrder,
      badge: plan.badge,
      stripeProductId: plan.stripeProductId,
      tenantId: plan.tenantId,
      metadata: plan.metadata,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
      prices: plan.prices?.map((price: any) => ({
        id: price.id,
        interval: price.interval,
        intervalCount: price.intervalCount,
        amount: Number(price.amount),
        currency: price.currency,
        originalAmount: price.originalAmount ? Number(price.originalAmount) : null,
        stripePriceId: price.stripePriceId,
        pagueBitPriceId: price.pagueBitPriceId,
      })) || [],
      products: plan.products?.map((product: any) => ({
        id: product.id,
        code: product.code,
        name: product.name,
        description: product.description,
        type: product.type,
        price: Number(product.price),
        currency: product.currency,
      })) || [],
      features: plan.features?.map((pf: any) => ({
        code: pf.feature.code,
        name: pf.feature.name,
        description: pf.feature.description,
        type: pf.feature.type,
        unit: pf.feature.unit,
        category: pf.feature.category,
        enabled: pf.enabled,
        limitValue: pf.limitValue,
        customValue: pf.customValue,
        displayOverride: pf.displayOverride,
      })) || [],
    };
  }
}

export const planService = new PlanService();
