import { prisma } from '../../../lib/prisma';

const AUDIT_RETENTION_DAYS = parseInt(
  process.env.AUDIT_RETENTION_DAYS || '90',
  10,
);

export interface AuditLogData {
  action: string;
  entity: string;
  entityId: string;
  actorId?: string; // ID do usuário que realizou a ação
  tenantId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Registra uma ação no log de auditoria.
   * Calcula retentionUntil = now() + AUDIT_RETENTION_DAYS
   */
  async log(data: AuditLogData) {
    try {
      const retentionUntil = new Date();
      retentionUntil.setDate(retentionUntil.getDate() + AUDIT_RETENTION_DAYS);

      await prisma.auditLog.create({
        data: {
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          userId: data.actorId, // Mapeando actorId para userId no schema
          tenantId: data.tenantId,
          metadata: data.metadata || {},
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          retentionUntil,
        },
      });
    } catch (error) {
      // Falha silenciosa para não quebrar o fluxo principal
      console.error('⚠️ Failed to create audit log:', error);
    }
  }

  /**
   * Lista audit logs com filtros e suporte a includeDeleted (admin).
   */
  async listLogs(filters: {
    tenantId?: string;
    action?: string;
    entity?: string;
    entityId?: string;
    includeDeleted?: boolean;
    page?: number;
    limit?: number;
  }) {
    const {
      tenantId,
      action,
      entity,
      entityId,
      includeDeleted = false,
      page = 1,
      limit = 20,
    } = filters;

    const where: Record<string, unknown> = {};
    if (tenantId) where.tenantId = tenantId;
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (entityId) where.entityId = entityId;

    // Por padrão, não retorna logs deletados (soft delete manual)
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  /**
   * Soft-deleta um audit log — verifica retentionUntil antes de permitir.
   * LGPD Art. 16: retenção mínima durante período de legítimo interesse.
   */
  async softDeleteLog(id: string) {
    const log = await prisma.auditLog.findUnique({ where: { id } });

    if (!log) throw new Error('Audit log não encontrado');
    if (log.deletedAt) return log; // Já deletado — idempotente

    const now = new Date();
    if (log.retentionUntil > now) {
      const retentionDate = log.retentionUntil.toISOString().split('T')[0];
      throw new Error(
        `Log retido por compliance até ${retentionDate}`,
      );
    }

    return prisma.auditLog.update({
      where: { id },
      data: { deletedAt: now },
    });
  }

  /**
   * Purga permanentemente logs cujo retentionUntil expirou E estão deletados.
   * Destinado a ser executado por job agendado (cron).
   */
  async purgeExpiredLogs(): Promise<{ purged: number }> {
    const now = new Date();

    const result = await prisma.auditLog.deleteMany({
      where: {
        deletedAt: { not: null },
        retentionUntil: { lt: now },
      },
    });

    console.log(`🗑️  [AuditService] Purged ${result.count} expired audit logs`);
    return { purged: result.count };
  }
}

export const auditService = new AuditService();
