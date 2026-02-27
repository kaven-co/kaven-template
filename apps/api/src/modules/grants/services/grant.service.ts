import {
  GrantStatus,
  GrantType,
  AccessLevel,
  CapabilityScope,
} from "@prisma/client";
import { prisma } from "../../../lib/prisma";

export interface CreateGrantInput {
  userId: string;
  tenantId: string;
  spaceId?: string;
  capabilityId?: string;
  type?: GrantType;
  accessLevel?: AccessLevel;
  scope?: CapabilityScope;
  justification: string;
  grantedBy: string;
  expiresAt?: Date;
  grantRequestId?: string;
}

export class GrantService {
  /**
   * Cria um grant diretamente (sem fluxo de solicitação)
   */
  async createGrant(data: CreateGrantInput) {
    if (!data.userId) throw new Error("userId é obrigatório");
    if (!data.tenantId) throw new Error("tenantId é obrigatório");
    if (!data.justification || data.justification.trim().length < 5) {
      throw new Error("Justificativa muito curta. Mínimo de 5 caracteres.");
    }

    // Verificar que usuário pertence ao tenant
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true, tenantId: true },
    });

    if (!user) throw new Error("Usuário não encontrado");
    if (user.tenantId !== data.tenantId) {
      throw new Error("Usuário não pertence ao tenant informado");
    }

    // Validate spaceId/capabilityId business rules:
    // A grant must target at least a space OR a capability (or both).
    // - If scope is SPACE, spaceId is required
    // - If capabilityId is provided, it must exist
    // - If spaceId is provided, it must exist within the tenant
    const effectiveScope = data.scope ?? CapabilityScope.SPACE;

    if (!data.spaceId && !data.capabilityId) {
      throw new Error(
        "Grant deve ter pelo menos spaceId ou capabilityId. Um grant sem escopo definido não é permitido."
      );
    }

    if (effectiveScope === CapabilityScope.SPACE && !data.spaceId) {
      throw new Error(
        "spaceId é obrigatório quando o escopo do grant é SPACE."
      );
    }

    // Verificar se capability existe (se fornecida)
    if (data.capabilityId) {
      const capability = await prisma.capability.findUnique({
        where: { id: data.capabilityId },
      });
      if (!capability) throw new Error("Capability não encontrada");
    }

    // Verificar se space existe e pertence ao tenant (se fornecido)
    if (data.spaceId) {
      const space = await prisma.space.findUnique({
        where: { id: data.spaceId },
        select: { id: true, tenantId: true },
      });
      if (!space) throw new Error("Space não encontrado");
      if (space.tenantId && space.tenantId !== data.tenantId) {
        throw new Error("Space não pertence ao tenant informado");
      }
    }

    return prisma.grant.create({
      data: {
        userId: data.userId,
        tenantId: data.tenantId,
        spaceId: data.spaceId,
        capabilityId: data.capabilityId,
        type: data.type ?? GrantType.ADD,
        accessLevel: data.accessLevel ?? AccessLevel.READ_ONLY,
        scope: data.scope ?? CapabilityScope.SPACE,
        justification: data.justification,
        grantedBy: data.grantedBy,
        expiresAt: data.expiresAt,
        status: GrantStatus.ACTIVE,
        grantRequestId: data.grantRequestId,
      },
    });
  }

  /**
   * Revoga um grant ativo
   */
  async revokeGrant(
    grantId: string,
    revokedBy: string,
    reason: string,
    tenantId: string,
  ) {
    const grant = await prisma.grant.findUnique({ where: { id: grantId } });

    if (!grant) throw new Error("Grant não encontrado");
    if (grant.tenantId !== tenantId) {
      throw new Error("Grant não pertence ao tenant informado");
    }
    if (grant.status === GrantStatus.REVOKED) {
      // Idempotente: já revogado, retorna sem erro
      return grant;
    }
    if (grant.status === GrantStatus.EXPIRED) {
      throw new Error("Grant já expirado não pode ser revogado");
    }

    return prisma.grant.update({
      where: { id: grantId },
      data: {
        status: GrantStatus.REVOKED,
        revokedAt: new Date(),
        revokedBy,
        revokeReason: reason,
      },
    });
  }

  /**
   * Lista grants filtrados por tenantId (com paginação opcional)
   */
  async listGrants(filters: {
    tenantId: string;
    userId?: string;
    status?: GrantStatus;
    capabilityId?: string;
    page?: number;
    limit?: number;
  }) {
    const { tenantId, userId, status, capabilityId, page = 1, limit = 20 } =
      filters;

    const where: Record<string, unknown> = { tenantId };
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (capabilityId) where.capabilityId = capabilityId;

    const skip = (page - 1) * limit;

    const [grants, total] = await Promise.all([
      prisma.grant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { grantedAt: "desc" },
      }),
      prisma.grant.count({ where }),
    ]);

    return {
      grants,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Valida se um grant está ativo e não expirado
   */
  async validateGrant(grantId: string, tenantId: string) {
    const grant = await prisma.grant.findUnique({ where: { id: grantId } });

    if (!grant) throw new Error("Grant não encontrado");
    if (grant.tenantId !== tenantId) {
      throw new Error("Grant não pertence ao tenant informado");
    }
    if (grant.status === GrantStatus.REVOKED) {
      throw new Error("Grant foi revogado");
    }
    if (grant.status === GrantStatus.EXPIRED) {
      throw new Error("Grant expirado");
    }
    if (grant.expiresAt && grant.expiresAt < new Date()) {
      throw new Error("Grant expirado");
    }

    return { valid: true, grant };
  }
}

export const grantService = new GrantService();
