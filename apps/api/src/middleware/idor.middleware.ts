import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';
import { secureLog } from '../utils/secure-logger';

/**
 * All Prisma model names that have a tenantId field and require IDOR protection.
 *
 * This union type is the single source of truth for which models are protected.
 * When adding a new model with tenantId to the schema, add it here too.
 *
 * Total: 33 models (24 with tenantId + 9 with userId-based ownership)
 */
export type IdorProtectedModel =
  // Core models with tenantId
  | 'user'
  | 'tenant'
  | 'invoice'
  | 'order'
  | 'subscription'
  | 'file'
  // Audit & Security
  | 'auditLog'
  | 'securityAuditLog'
  | 'impersonationSession'
  // Plans & Products (Billing)
  | 'plan'
  | 'product'
  | 'purchase'
  | 'usageRecord'
  // Email Infrastructure
  | 'emailEvent'
  | 'emailMetrics'
  | 'emailQueue'
  // Tenant Management
  | 'tenantInvite'
  | 'platformConfig'
  // Spaces & Permissions
  | 'space'
  | 'capability'
  | 'grant'
  | 'grantRequest'
  | 'policy'
  // Demo Features
  | 'project'
  | 'task'
  // User-owned models (no tenantId, but need userId-based IDOR)
  | 'inAppNotification'
  | 'userNotificationPreferences'
  | 'designSystemCustomization'
  | 'refreshToken'
  | 'verificationToken'
  | 'passwordResetToken'
  | 'dataExportLog'
  | 'securityRequest'
  | 'userSpace';

/**
 * Models that use userId as the primary ownership field instead of (or in addition to) tenantId.
 * For these models, the middleware checks userId match OR tenantId match.
 */
const USER_OWNED_MODELS: IdorProtectedModel[] = [
  'inAppNotification',
  'userNotificationPreferences',
  'designSystemCustomization',
  'refreshToken',
  'verificationToken',
  'passwordResetToken',
  'dataExportLog',
  'securityRequest',
  'userSpace',
  'file',
  'auditLog',
  'emailEvent',
];

/**
 * IDOR Middleware (Insecure Direct Object Reference)
 * Verifica se o usuário tem permissão para acessar o recurso solicitado pelo ID.
 *
 * Supports all 33 models with tenantId or userId ownership fields.
 * Any model with a tenantId field needs IDOR protection to prevent cross-tenant access.
 */
export const preventIdor = (
  modelName: IdorProtectedModel,
  paramName: string = 'id',
  ownerField: string = 'userId'
) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.user) {
        return reply.status(401).send({ error: 'Não autenticado' });
      }

      const resourceId = (request.params as any)[paramName];
      secureLog.debug('[MW_ENTER: IDOR]', { 
          reqId: request.id, 
          resource: modelName, 
          resourceId 
      });

      if (!resourceId) {
        // Se não tem ID na rota, talvez seja criação ou listagem, ignora
        return;
      }

      // Admin e Super Admin podem acessar tudo (dependendo da regra de negócio)
      // Ajuste conforme necessidade:
      if (request.user.role === 'SUPER_ADMIN') {
        return;
      }

      // Build select clause dynamically based on ownerField
      // Always try to select tenantId for tenant isolation check
      const selectFields: Record<string, boolean> = { tenantId: true };
      if (ownerField !== 'tenantId') {
        selectFields[ownerField] = true;
      }

      // @ts-ignore - Prisma dynamic access
      const resource = await prisma[modelName].findUnique({
        where: { id: resourceId },
        select: selectFields,
      });

      if (!resource) {
        return reply.status(404).send({ error: 'Recurso não encontrado' });
      }

      // Verificação de propriedade (userId or custom owner field)
      const isOwner = ownerField !== 'tenantId' && resource[ownerField] === request.user.id;

      // Verificação de Tenant (se o recurso pertencer ao mesmo tenant do usuário)
      const isSameTenant = resource.tenantId && resource.tenantId === request.user.tenantId;

      if (!isOwner && !isSameTenant) {
        secureLog.warn('[MW_BLOCK: IDOR]', { 
            reqId: request.id,
            userId: request.user.id, 
            resource: modelName, 
            resourceId, 
            reason: 'Unauthorized Access' 
        });
        
        return reply.status(403).send({ error: 'Acesso negado' });
      }

    } catch (error) {
      secureLog.error('[MW_ERROR: IDOR]', { reqId: request.id, error });
      return reply.status(500).send({ error: 'Erro interno na verificação de permissão' });
    }
  };
};

/**
 * Default owner field mapping for each protected model.
 * Used for convenience when registering IDOR middleware on routes.
 *
 * Models with tenantId as primary isolation use 'tenantId'.
 * Models with userId ownership use 'userId' or a specific field name.
 */
export const IDOR_OWNER_FIELD_MAP: Record<IdorProtectedModel, string> = {
  // Core models
  user: 'tenantId',
  tenant: 'tenantId',
  invoice: 'tenantId',
  order: 'tenantId',
  subscription: 'tenantId',
  file: 'userId',

  // Audit & Security
  auditLog: 'tenantId',
  securityAuditLog: 'tenantId',
  impersonationSession: 'tenantId',

  // Plans & Products (Billing)
  plan: 'tenantId',
  product: 'tenantId',
  purchase: 'tenantId',
  usageRecord: 'tenantId',

  // Email Infrastructure
  emailEvent: 'tenantId',
  emailMetrics: 'tenantId',
  emailQueue: 'tenantId',

  // Tenant Management
  tenantInvite: 'tenantId',
  platformConfig: 'tenantId',

  // Spaces & Permissions
  space: 'tenantId',
  capability: 'tenantId',
  grant: 'tenantId',
  grantRequest: 'tenantId',
  policy: 'tenantId',

  // Demo Features
  project: 'tenantId',
  task: 'tenantId',

  // User-owned models
  inAppNotification: 'userId',
  userNotificationPreferences: 'userId',
  designSystemCustomization: 'userId',
  refreshToken: 'userId',
  verificationToken: 'userId',
  passwordResetToken: 'userId',
  dataExportLog: 'userId',
  securityRequest: 'requesterId',
  userSpace: 'userId',
};

/**
 * Complete list of all IDOR-protected model names.
 * Useful for iteration, validation, and test coverage checks.
 */
export const ALL_IDOR_PROTECTED_MODELS: IdorProtectedModel[] = Object.keys(
  IDOR_OWNER_FIELD_MAP
) as IdorProtectedModel[];

/**
 * Convenience factory: creates an IDOR middleware using the default owner field for the model.
 *
 * @example
 * // Instead of: preventIdor('invoice', 'id', 'tenantId')
 * // Use:        preventIdorForModel('invoice')
 */
export const preventIdorForModel = (
  modelName: IdorProtectedModel,
  paramName: string = 'id'
) => {
  return preventIdor(modelName, paramName, IDOR_OWNER_FIELD_MAP[modelName]);
};
