/**
 * Test Data Fixtures
 *
 * Helper functions for creating and cleaning up test data.
 * Used by GDPR compliance tests and multi-tenant isolation tests.
 *
 * @module test-data.fixtures
 */

import { prisma } from "../../src/lib/prisma";
import { generateAccessToken } from "../../src/lib/jwt";
import { hashPassword } from "../../src/lib/password";
import { Role, UserStatus, AccessLevel, CapabilityScope, PrismaClient } from "@prisma/client";

// Re-export PrismaClient for external use
export { PrismaClient };

export function getPrisma(): PrismaClient {
  return prisma as unknown as PrismaClient;
}

/**
 * Create a test tenant
 */
export async function createTestTenant(name: string) {
  const prisma = getPrisma();
  const slug = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return prisma.tenant.create({
    data: {
      name,
      slug: `${slug}-${Date.now()}`,
    },
  });
}

/**
 * Create a test user with optional parameters
 */
export async function createTestUser(data: {
  tenantId: string;
  email: string;
  name: string;
  role?: Role;
  status?: UserStatus;
}) {
  const prisma = getPrisma();
  const passwordHash = await hashPassword("test-password-123");

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: passwordHash,
      tenantId: data.tenantId,
      role: data.role || Role.USER,
      status: data.status || UserStatus.ACTIVE,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  const accessToken = await generateAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId || undefined,
  });

  return { ...user, accessToken };
}

/**
 * Create a test space within a tenant
 */
export async function createTestSpace(tenantId: string, name: string) {
  const prisma = getPrisma();
  const code = name.toUpperCase().replace(/\s+/g, "_").substring(0, 50);
  return prisma.space.create({
    data: {
      name,
      code,
      tenantId,
    },
  });
}

/**
 * Create a test capability
 */
export async function createTestCapability(
  tenantId: string,
  code: string,
  name: string,
) {
  const prisma = getPrisma();
  return prisma.capability.create({
    data: {
      code,
      description: `Test capability: ${name}`,
      tenantId,
      resource: "test",
      action: "read",
    },
  } as any);
}

/**
 * Create a test policy
 */
export async function createTestPolicy(
  tenantId: string,
  name: string,
  data: {
    capabilityId?: string;
    spaceId?: string;
  },
) {
  const prisma = getPrisma();
  return prisma.policy.create({
    data: {
      name,
      tenantId,
      type: "MFA_REQUIRED",
      targetType: "SPACE",
      conditions: {},
      ...data,
    },
  } as any);
}

/**
 * Create a test grant request
 */
export async function createTestGrantRequest(data: {
  requesterId: string;
  spaceId: string;
  capabilityId: string;
  tenantId: string;
  accessLevel?: AccessLevel;
  scope?: CapabilityScope;
  justification?: string;
  requestedDuration?: number;
}) {
  const prisma = getPrisma();
  return prisma.grantRequest.create({
    data: {
      requesterId: data.requesterId,
      spaceId: data.spaceId,
      capabilityId: data.capabilityId,
      tenantId: data.tenantId,
      accessLevel: data.accessLevel || AccessLevel.READ_ONLY,
      scope: data.scope || CapabilityScope.SPACE,
      justification: data.justification || "Test grant request justification",
      requestedDuration: data.requestedDuration || 7,
      status: "PENDING",
    },
  } as any);
}

/**
 * Create a test grant
 */
export async function createTestGrant(data: {
  userId: string;
  tenantId: string;
  spaceId?: string;
  capabilityId: string;
  grantedBy: string;
  accessLevel?: AccessLevel;
  scope?: CapabilityScope;
  expiresAt?: Date;
}) {
  const prisma = getPrisma();
  return prisma.grant.create({
    data: {
      userId: data.userId,
      tenantId: data.tenantId,
      spaceId: data.spaceId || null,
      capabilityId: data.capabilityId,
      grantedBy: data.grantedBy,
      accessLevel: data.accessLevel || AccessLevel.READ_ONLY,
      scope: data.scope || CapabilityScope.SPACE,
      type: "ADD",
      status: "ACTIVE",
      expiresAt:
        data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      justification: "Test grant",
    },
  } as any);
}

/**
 * Create test audit log entry
 */
export async function createTestAuditLog(data: {
  userId: string;
  tenantId: string;
  action: string;
  resource: string;
  details?: string;
}) {
  const prisma = getPrisma();
  return prisma.securityAuditLog.create({
    data: {
      userId: data.userId,
      tenantId: data.tenantId,
      action: data.action,
      resource: data.resource,
      details: data.details || "{}",
      ipAddress: "127.0.0.1",
      userAgent: "test-agent",
      success: true,
    },
  } as any);
}

// ============================================================================
// COMPREHENSIVE TEST DATA CLEANUP (ROBUST VERSION)
// ============================================================================

/**
 * COMPLETE Test Data Cleanup Function
 *
 * CRITICAL: This cleanup function handles ALL tables with foreign key dependencies
 * to Users, Tenants, and Spaces. Order matters due to foreign key constraints.
 *
 * This function is the RESULT OF EXHAUSTIVE ANALYSIS of schema.base.prisma
 * covering 50+ models with their relationships.
 *
 * Deletion Order (Child → Parent):
 * 1. User-dependent records (tokens, preferences, notifications, etc.)
 * 2. Tenant-dependent records (billing, subscriptions, etc.)
 * 3. Space-dependent records (roles, memberships, etc.)
 * 4. Parent entities (Users, Tenants, Spaces)
 * 5. Cleanup orphan records
 */
export async function cleanupTestData(prisma?: PrismaClient): Promise<void> {
  const client = prisma || getPrisma();
  await client.$transaction(async (tx) => {
    // ========================================
    // PHASE 1: DELETE ALL USER-RELATED RECORDS
    // ========================================

    // 1.1 Authentication & Tokens (Cascade on userId)
    await tx.refreshToken.deleteMany({});
    await tx.verificationToken.deleteMany({});
    await tx.passwordResetToken.deleteMany({});

    // 1.2 User Preferences & Customization (Cascade on userId)
    await tx.designSystemCustomization.deleteMany({});
    await tx.userNotificationPreferences.deleteMany({});

    // 1.3 User Notifications (Cascade on userId)
    await tx.inAppNotification.deleteMany({});

    // 1.4 User Files (Cascade on userId)
    await tx.file.deleteMany({});

    // 1.5 Security Audit Logs (nullable userId)
    await tx.securityAuditLog.deleteMany({});

    // 1.6 User's Purchases (SetNull on userId)
    await tx.purchase.updateMany({
      where: {},
      data: { userId: null as any },
    });

    // 1.7 User Capability Audit Events (Cascade on userId)
    await tx.capabilityAuditEvent.deleteMany({});

    // 1.8 User Data Export Logs (Cascade on userId)
    await tx.dataExportLog.deleteMany({});

    // 1.9 User Devices (Cascade on userId)
    await tx.policyDeviceTracking.deleteMany({});

    // 1.10 User Spaces (Cascade on userId)
    await tx.userSpace.deleteMany({});

    // 1.11 User Space Roles (Cascade on userId)
    await tx.userSpaceRole.deleteMany({});

    // 1.12 Space Ownerships (Cascade on userId)
    await tx.spaceOwner.deleteMany({});

    // 1.13 User Grants (Cascade on userId)
    await tx.grant.deleteMany({});

    // 1.14 User Grant Requests (Cascade on requesterId)
    await tx.grantRequest.deleteMany({});

    // 1.15 User Impersonation Sessions
    await tx.impersonationSession.deleteMany({});

    // 1.16 User Security Requests
    await tx.securityRequest.deleteMany({});

    // 1.17 User Email Events (SetNull on userId)
    await tx.emailEvent.deleteMany({});

    // 1.18 User Email Queue
    await tx.emailQueue.deleteMany({});

    // 1.19 Audit Logs (nullable userId)
    await tx.auditLog.deleteMany({});

    // 1.20 Tenant Invites (invitedById - Cascade)
    await tx.inviteSpace.deleteMany({});
    await tx.tenantInvite.deleteMany({});

    // ========================================
    // PHASE 2: DELETE ALL TENANT-RELATED RECORDS
    // ========================================

    // 2.1 Billing & Subscription
    await tx.subscription.deleteMany({});
    await tx.invoice.deleteMany({});
    await tx.payment.deleteMany({});
    await tx.order.deleteMany({});
    await tx.purchase.deleteMany({});

    // 2.2 Usage Records
    await tx.usageRecord.deleteMany({});

    // 2.3 Security
    await tx.securityAuditLog.deleteMany({});

    // 2.4 Grants & Requests
    await tx.grant.deleteMany({});
    await tx.grantRequest.deleteMany({});
    await tx.grantAuditEvent.deleteMany({});

    // 2.5 Policies
    await tx.policyIpWhitelist.deleteMany({});
    await tx.policy.deleteMany({});

    // 2.6 Impersonation
    await tx.impersonationSession.deleteMany({});

    // 2.7 Email Infrastructure
    await tx.emailEvent.deleteMany({});
    await tx.emailQueue.deleteMany({});
    await tx.emailMetrics.deleteMany({});

    // 2.8 Files
    await tx.file.deleteMany({});

    // 2.9 Audit Logs
    await tx.auditLog.deleteMany({});

    // 2.10 Plans & Products
    await tx.productEffect.deleteMany({});
    await tx.product.deleteMany({});
    await tx.price.deleteMany({});
    await tx.planFeature.deleteMany({});
    await tx.plan.deleteMany({});

    // ========================================
    // PHASE 3: DELETE ALL SPACE-RELATED RECORDS
    // ========================================

    // 3.1 Space Memberships
    await tx.userSpace.deleteMany({});
    await tx.userSpaceRole.deleteMany({});

    // 3.2 Invite Spaces
    await tx.inviteSpace.deleteMany({});

    // 3.3 Space Roles
    await tx.roleCapability.deleteMany({});
    await tx.spaceRole.deleteMany({});

    // 3.4 Space Grants
    await tx.grant.deleteMany({});

    // 3.5 Space Grant Requests
    await tx.grantRequest.deleteMany({});

    // 3.6 Space Capability Audits
    await tx.capabilityAuditEvent.deleteMany({});

    // 3.7 Project & Tasks (reference User via createdById without cascade)
    await tx.task.deleteMany({});
    await tx.project.deleteMany({});

    // ========================================
    // PHASE 4: DELETE PARENT ENTITIES
    // ========================================

    // 4.1 Delete Capabilities (reference Tenant via tenantId without cascade)
    await tx.capability.deleteMany({});

    // 4.2 Delete Users
    await tx.user.deleteMany({});

    // 4.2 Delete Tenants
    await tx.tenant.deleteMany({});

    // 4.3 Delete Spaces
    await tx.space.deleteMany({});

    // 4.4 Delete Capabilities
    await tx.capability.deleteMany({});

    // 4.5 Delete remaining related records
    await tx.grantAuditEvent.deleteMany({});
    await tx.securityRequest.deleteMany({});
    await tx.dataExportLog.deleteMany({});
  });
}

/**
 * Alternative: Delete by specific tenant ID
 * More targeted cleanup for specific test scenarios
 */
export async function cleanupTestDataByTenant(
  prisma: PrismaClient,
  tenantId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1. Subscription & Billing
    await tx.subscription.deleteMany({ where: { tenantId } } as any);
    await tx.invoice.deleteMany({ where: { tenantId } } as any);
    await tx.payment.deleteMany({});
    await tx.order.deleteMany({ where: { tenantId } } as any);
    await tx.purchase.deleteMany({ where: { tenantId } } as any);

    // 2. Usage Records
    await tx.usageRecord.deleteMany({ where: { tenantId } } as any);

    // 3. Security
    await tx.securityAuditLog.deleteMany({ where: { tenantId } } as any);

    // 4. Grants & Requests
    await tx.grant.deleteMany({ where: { tenantId } } as any);
    await tx.grantRequest.deleteMany({ where: { tenantId } } as any);

    // 5. Policies
    await tx.policyIpWhitelist.deleteMany({});
    await tx.policy.deleteMany({ where: { tenantId } } as any);

    // 6. Impersonation
    await tx.impersonationSession.deleteMany({ where: { tenantId } } as any);

    // 7. Email Infrastructure
    await tx.emailEvent.deleteMany({ where: { tenantId } } as any);
    await tx.emailQueue.deleteMany({ where: { tenantId } } as any);
    await tx.emailMetrics.deleteMany({ where: { tenantId } } as any);

    // 8. Files
    await tx.file.deleteMany({ where: { tenantId } } as any);

    // 9. Audit Logs
    await tx.auditLog.deleteMany({ where: { tenantId } } as any);

    // 10. Plans & Products
    await tx.productEffect.deleteMany({});
    await tx.product.deleteMany({ where: { tenantId } } as any);
    await tx.price.deleteMany({});
    await tx.planFeature.deleteMany({});
    await tx.plan.deleteMany({ where: { tenantId } } as any);

    // 11. Spaces
    await tx.inviteSpace.deleteMany({});
    await tx.userSpace.deleteMany({});
    await tx.userSpaceRole.deleteMany({});
    await tx.roleCapability.deleteMany({});
    await tx.spaceRole.deleteMany({});
    await tx.spaceOwner.deleteMany({});
    await tx.space.deleteMany({ where: { tenantId } } as any);

    // 12. Capabilities
    await tx.capability.deleteMany({ where: { tenantId } } as any);

    // 13. Users
    await tx.verificationToken.deleteMany({});
    await tx.passwordResetToken.deleteMany({});
    await tx.designSystemCustomization.deleteMany({});
    await tx.userNotificationPreferences.deleteMany({});
    await tx.inAppNotification.deleteMany({});
    await tx.refreshToken.deleteMany({});
    await tx.capabilityAuditEvent.deleteMany({});
    await tx.dataExportLog.deleteMany({});
    await tx.policyDeviceTracking.deleteMany({});
    await tx.user.deleteMany({ where: { tenantId } } as any);

    // 14. Finally delete the tenant
    await tx.tenant.delete({ where: { id: tenantId } });
  });
}

/**
 * Alternative: Delete by specific user ID
 */
export async function cleanupTestDataByUser(
  prisma: PrismaClient,
  userId: string,
): Promise<void> {
  const client = prisma instanceof PrismaClient ? prisma : prisma;

  await client.$transaction(async (tx) => {
    // 1. Authentication
    await tx.refreshToken.deleteMany({ where: { userId } });
    await tx.verificationToken.deleteMany({ where: { userId } });
    await tx.passwordResetToken.deleteMany({ where: { userId } });

    // 2. Preferences
    await tx.designSystemCustomization.deleteMany({ where: { userId } });
    await tx.userNotificationPreferences.deleteMany({ where: { userId } });

    // 3. Notifications
    await tx.inAppNotification.deleteMany({ where: { userId } });

    // 4. Files
    await tx.file.deleteMany({ where: { userId } });

    // 5. Security
    await tx.securityAuditLog.deleteMany({ where: { userId } });
    await tx.policyDeviceTracking.deleteMany({ where: { userId } });

    // 6. Grants
    await tx.grant.deleteMany({ where: { userId } });
    await tx.grant.updateMany({
      where: { grantedBy: userId },
      data: { grantedBy: null as unknown as string },
    });
    await tx.grant.updateMany({
      where: { revokedBy: userId },
      data: { revokedBy: null as unknown as string },
    });

    // 7. Grant Requests
    await tx.grantRequest.deleteMany({ where: { requesterId: userId } });
    await tx.grantRequest.updateMany({
      where: { approvedBy: userId },
      data: { approvedBy: null as unknown as string },
    });
    await tx.grantRequest.updateMany({
      where: { rejectedBy: userId },
      data: { rejectedBy: null as unknown as string },
    });

    // 8. Spaces
    await tx.userSpace.deleteMany({ where: { userId } });
    await tx.userSpaceRole.deleteMany({ where: { userId } });
    await tx.spaceOwner.deleteMany({ where: { userId } });

    // 9. Capability Audits
    await tx.capabilityAuditEvent.deleteMany({ where: { userId } });

    // 10. Impersonation
    await tx.impersonationSession.deleteMany({
      where: { impersonatedId: userId },
    });
    await tx.impersonationSession.updateMany({
      where: { impersonatorId: userId },
      data: { impersonatorId: null as unknown as string },
    });

    // 11. Data Exports
    await tx.dataExportLog.deleteMany({ where: { userId } });

    // 12. Security Requests
    await tx.securityRequest.deleteMany({ where: { requesterId: userId } });
    await tx.securityRequest.deleteMany({ where: { targetUserId: userId } });
    await tx.securityRequest.updateMany({
      where: { approvedBy: userId },
      data: { approvedBy: null as unknown as string },
    });
    await tx.securityRequest.updateMany({
      where: { executedBy: userId },
      data: { executedBy: null as unknown as string },
    });

    // 13. Email
    await tx.emailEvent.updateMany({
      where: { userId },
      data: { userId: null as unknown as string },
    });
    await tx.emailQueue.updateMany({
      where: { userId },
      data: { userId: null as unknown as string },
    });

    // 14. Audit Logs
    await tx.auditLog.deleteMany({ where: { userId } });

    // 15. Tenant Invites
    await tx.tenantInvite.deleteMany({ where: { invitedById: userId } });

    // 16. Purchases
    await tx.purchase.updateMany({
      where: { userId },
      data: { userId: null as unknown as string },
    });

    // 17. Finally delete the user
    await tx.user.delete({ where: { id: userId } });
  });
}

/**
 * Verify cleanup was successful
 * Returns true if no user/tenant/space records remain
 */
export async function verifyCleanupComplete(prisma: PrismaClient): Promise<{
  success: boolean;
  counts: {
    users: number;
    tenants: number;
    spaces: number;
    refreshTokens: number;
    grants: number;
    grantRequests: number;
  };
}> {
  const [users, tenants, spaces, refreshTokens, grants, grantRequests] =
    await Promise.all([
      prisma.user.count(),
      prisma.tenant.count(),
      prisma.space.count(),
      prisma.refreshToken.count(),
      prisma.grant.count(),
      prisma.grantRequest.count(),
    ]);

  return {
    success: users === 0 && tenants === 0 && spaces === 0,
    counts: {
      users,
      tenants,
      spaces,
      refreshTokens,
      grants,
      grantRequests,
    },
  };
}

/**
 * @deprecated Use cleanupTestData(prisma) instead
 * This old function only handles a subset of tables and may cause FK violations
 */
export async function cleanupTestDataLegacy() {
  const prisma = getPrisma();
  console.warn("⚠️  DEPRECATED: Use cleanupTestData(prisma) instead");

  try {
    // Delete in order of dependencies (child tables first)
    await prisma.grant.deleteMany({
      where: { justification: { contains: "Test" } },
    });

    await prisma.grantRequest.deleteMany({
      where: { justification: { contains: "Test" } },
    });

    await prisma.policy.deleteMany({
      where: { name: { contains: "Test" } },
    });

    await prisma.securityAuditLog.deleteMany({
      where: { userAgent: { contains: "test-agent" } },
    });

    // Delete projects and tasks before users (FK constraints)
    await prisma.task.deleteMany({
      where: { title: { contains: "Test" } },
    });

    await prisma.project.deleteMany({
      where: { name: { contains: "Test" } },
    });

    // Delete tenant invites before users (FK constraint)
    await prisma.tenantInvite.deleteMany({
      where: { email: { contains: "@test.com" } },
    });

    await prisma.user.deleteMany({
      where: { email: { contains: "@test.com" } },
    });

    await prisma.space.deleteMany({
      where: { name: { contains: "Test" } },
    });

    await prisma.capability.deleteMany({
      where: { code: { contains: "TEST_" } },
    });

    await prisma.tenant.deleteMany({
      where: { name: { contains: "Test" } },
    });

    console.log("✅ Legacy test data cleaned up");
  } catch (error) {
    console.error("❌ Error cleaning up test data:", error);
    throw error;
  }
}
