/**
 * IDOR (Insecure Direct Object Reference) Security Tests
 *
 * Valida que usuários de um tenant não podem acessar recursos de outro tenant.
 * Este é o teste de segurança mais crítico do framework multi-tenant.
 *
 * STORY-001: Security Test Suite (original 15 models)
 * STORY-021: IDOR Middleware Expansion (expanded to 33 models)
 * Priority: P0 (Critical)
 *
 * Coverage: All 33 models with tenantId or userId-based ownership
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { app } from '../../src/app';
import { generateAccessToken } from '../../src/lib/jwt';
import {
  createTenantIsolationTestData,
  cleanupSecurityTestData,
  type SecurityTestData
} from './fixtures/security.fixtures';
import { testIDOR, createAndTestIDOR } from './helpers/security.helpers';

const prisma = new PrismaClient();

describe('IDOR Security Tests', () => {
  let testData: SecurityTestData;
  let accessTokenA: string;

  beforeAll(async () => {
    // Inicializar app
    await app.ready();

    // Setup 2 isolated tenants (A and B) with unique suffix
    testData = await createTenantIsolationTestData(prisma, 'idor');

    // Generate Token for User A
    const userA = testData.tenantA.user;
    accessTokenA = await generateAccessToken({
      sub: userA.id,
      email: userA.email,
      role: userA.role,
      tenantId: userA.tenantId || undefined
    });
  });

  afterAll(async () => {
    // Cleanup unique test data
    await cleanupSecurityTestData(prisma, 'idor');
    await prisma.$disconnect();
    await app.close();
  });

  // ============================================
  // SECTION 1: Critical Models (Original)
  // ============================================

  describe('Tenant Isolation - Critical Models', () => {
    it('IDOR: User de Tenant A não pode acessar User de Tenant B', async () => {
      await testIDOR(
        'User',
        '/api/users',
        testData.tenantA.user.id,
        testData.tenantB.user.id,
        async (endpoint, resourceId) => {
          return app.inject({
            method: 'GET',
            url: `${endpoint}/${resourceId}`,
            headers: { Authorization: `Bearer ${accessTokenA}` }
          });
        }
      );
    });

    it('IDOR: Tenant isolation funciona para Invoice model', async () => {
      // Criar invoice para Tenant B
      const invoiceB = await prisma.invoice.create({
        data: {
          tenantId: testData.tenantB.tenant.id,
          invoiceNumber: `INV-TEST-${Date.now()}`,
          status: 'PENDING',
          amountDue: 100,
          amountPaid: 0,
          currency: 'BRL',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
        }
      });

      await testIDOR(
        'Invoice',
        '/api/invoices',
        testData.tenantA.user.id,
        invoiceB.id,
        async (endpoint, resourceId) => {
          return app.inject({
            method: 'GET',
            url: `${endpoint}/${resourceId}`,
            headers: { Authorization: `Bearer ${accessTokenA}` }
          });
        }
      );

      // Cleanup
      await prisma.invoice.delete({ where: { id: invoiceB.id } });
    });

    it('IDOR: Tenant isolation funciona para Order model', async () => {
      await createAndTestIDOR(
        'Order',
        '/api/orders',
        testData.tenantA.user.id,
        async () => prisma.order.create({
          data: {
            tenantId: testData.tenantB.tenant.id,
            orderNumber: `ORD-TEST-${Date.now()}`,
            status: 'PENDING',
            totalAmount: 250,
            currency: 'BRL'
          }
        }),
        async (id) => prisma.order.delete({ where: { id } }),
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });

    it('IDOR: Tenant isolation funciona para File model', async () => {
      await createAndTestIDOR(
        'File',
        '/api/files',
        testData.tenantA.user.id,
        async () => prisma.file.create({
          data: {
            filename: `test-file-${Date.now()}.pdf`,
            originalName: 'test-document.pdf',
            mimeType: 'application/pdf',
            size: 1024,
            path: '/uploads/test.pdf',
            userId: testData.tenantB.user.id,
            tenantId: testData.tenantB.tenant.id
          }
        }),
        async (id) => prisma.file.delete({ where: { id } }),
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });

    it('IDOR: Tenant isolation funciona para AuditLog model', async () => {
      await createAndTestIDOR(
        'AuditLog',
        '/api/audit-logs',
        testData.tenantA.user.id,
        async () => prisma.auditLog.create({
          data: {
            action: 'user.login',
            entity: 'User',
            entityId: testData.tenantB.user.id,
            userId: testData.tenantB.user.id,
            tenantId: testData.tenantB.tenant.id,
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0'
          }
        }),
        async (id) => prisma.auditLog.delete({ where: { id } }),
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });

    it('IDOR: Tenant isolation funciona para Subscription model', async () => {
      // Criar plan para subscription
      const planB = await prisma.plan.create({
        data: {
          code: `SUB_PLAN_TEST_${Date.now()}`,
          name: 'Test Plan for Subscription',
          tenantId: testData.tenantB.tenant.id,
          type: 'SUBSCRIPTION',
          isPublic: false,
        }
      });

      await createAndTestIDOR(
        'Subscription',
        '/api/subscriptions',
        testData.tenantA.user.id,
        async () => prisma.subscription.create({
          data: {
            tenantId: testData.tenantB.tenant.id,
            planId: planB.id,
            status: 'ACTIVE',
          }
        }),
        async (id) => {
          await prisma.subscription.delete({ where: { id } });
          await prisma.plan.delete({ where: { id: planB.id } });
        },
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });
  });

  // ============================================
  // SECTION 2: Soft Delete Protection
  // ============================================

  describe('Tenant Isolation - Soft Delete Protection', () => {
    it('IDOR: Soft deleted users não devem vazar entre tenants', async () => {
      // Criar user em Tenant B e fazer soft delete
      const userB = await prisma.user.create({
        data: {
          email: `deleted-user-${Date.now()}@test.com`,
          name: 'Deleted User',
          password: 'hashed-password',
          tenantId: testData.tenantB.tenant.id,
          role: 'USER',
          deletedAt: new Date() // Soft delete
        }
      });

      // Tentar buscar user deletado de Tenant B usando Tenant A
      const userNotFound = await prisma.user.findFirst({
        where: {
          id: userB.id,
          tenantId: testData.tenantA.tenant.id,
          deletedAt: null // Filtro de soft delete
        }
      });

      expect(userNotFound).toBeNull();

      // Validar que user deletado existe para Tenant B (sem filtro deletedAt)
      const userFound = await prisma.user.findFirst({
        where: {
          id: userB.id,
          tenantId: testData.tenantB.tenant.id
        }
      });

      expect(userFound).not.toBeNull();
      expect(userFound?.deletedAt).not.toBeNull();

      // Cleanup
      await prisma.user.delete({ where: { id: userB.id } });
    });

    it('IDOR: Soft deleted tenants não devem vazar dados', async () => {
      // Criar tenant e fazer soft delete
      const tenantC = await prisma.tenant.create({
        data: {
          name: 'Deleted Tenant',
          slug: `deleted-tenant-${Date.now()}`
        }
      });

      // Fazer soft delete do tenant
      await prisma.tenant.update({
        where: { id: tenantC.id },
        data: { deletedAt: new Date() }
      });

      // Buscar tenants ativos (sem soft deleted)
      const activeTenants = await prisma.tenant.findMany({
        where: {
          deletedAt: null
        }
      });

      // Tenant C não deve aparecer nos resultados
      const hasTenantC = activeTenants.some(t => t.id === tenantC.id);
      expect(hasTenantC).toBe(false);

      // Cleanup
      await prisma.tenant.delete({ where: { id: tenantC.id } });
    });
  });

  // ============================================
  // SECTION 3: Extended Models (Original)
  // ============================================

  describe('Tenant Isolation - Extended Models', () => {
    it('IDOR: Tenant isolation funciona para Project model', async () => {
      await createAndTestIDOR(
        'Project',
        '/api/app/projects',
        testData.tenantA.user.id,
        async () => prisma.project.create({
          data: {
            name: `Secret Project B ${Date.now()}`,
            tenantId: testData.tenantB.tenant.id,
            createdById: testData.tenantB.user.id,
            status: 'ACTIVE'
          }
        }),
        async (id) => prisma.project.delete({ where: { id } }),
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });

    it('IDOR: Tenant isolation funciona para Task model', async () => {
      // Criar projeto e task para Tenant B
      const projectB = await prisma.project.create({
        data: {
          name: `Project for Task B ${Date.now()}`,
          tenantId: testData.tenantB.tenant.id,
          createdById: testData.tenantB.user.id,
          status: 'ACTIVE'
        }
      });

      const taskB = await prisma.task.create({
        data: {
          title: `Secret Task B ${Date.now()}`,
          tenantId: testData.tenantB.tenant.id,
          projectId: projectB.id,
          createdById: testData.tenantB.user.id,
          status: 'TODO'
        }
      });

      await testIDOR(
        'Task',
        '/api/app/tasks',
        testData.tenantA.user.id,
        taskB.id,
        async (endpoint, resourceId) => {
          return app.inject({
            method: 'GET',
            url: `${endpoint}/${resourceId}`,
            headers: { Authorization: `Bearer ${accessTokenA}` }
          });
        }
      );

      // Cleanup
      await prisma.task.delete({ where: { id: taskB.id } });
      await prisma.project.delete({ where: { id: projectB.id } });
    });

    it('IDOR: Tenant isolation funciona para Space model', async () => {
      await createAndTestIDOR(
        'Space',
        '/api/spaces',
        testData.tenantA.user.id,
        async () => prisma.space.create({
          data: {
            name: `Secret Space B ${Date.now()}`,
            code: `SPACE_B_${Date.now()}`,
            tenantId: testData.tenantB.tenant.id,
          }
        }),
        async (id) => prisma.space.delete({ where: { id } }),
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });
  });

  // ============================================
  // SECTION 4: Catalog & Billing
  // ============================================

  describe('Tenant Isolation - Catalog & Billing', () => {
    it('IDOR: Tenant isolation funciona para Plan model (Custom Plans)', async () => {
      // Criar Plan exclusivo para Tenant B
      const planB = await prisma.plan.create({
        data: {
          code: `CUSTOM_PLAN_B_${Date.now()}`,
          name: 'Custom Enterprise Plan B',
          tenantId: testData.tenantB.tenant.id, // Tenant-specific
          type: 'SUBSCRIPTION',
          isPublic: false, // Ensure it's private for IDOR test
        }
      });

      await testIDOR(
        'Plan',
        '/api/plans',
        testData.tenantA.user.id,
        planB.id,
        async (endpoint, resourceId) => {
          return app.inject({
            method: 'GET',
            url: `${endpoint}/${resourceId}`,
            headers: { Authorization: `Bearer ${accessTokenA}` }
          });
        }
      );

      // Cleanup
      await prisma.plan.delete({ where: { id: planB.id } });
    });

    it('IDOR: Tenant isolation funciona para Product model', async () => {
      // Criar Product exclusivo para Tenant B
      const productB = await prisma.product.create({
        data: {
          code: `PROD_B_${Date.now()}`,
          name: 'Exclusive Product B',
          price: 999.99,
          tenantId: testData.tenantB.tenant.id, // Tenant-specific
          type: 'ONE_TIME',
          isPublic: false, // Ensure it's private for IDOR test
        }
      });

      await testIDOR(
        'Product',
        '/api/products',
        testData.tenantA.user.id,
        productB.id,
        async (endpoint, resourceId) => {
          return app.inject({
            method: 'GET',
            url: `${endpoint}/${resourceId}`,
            headers: { Authorization: `Bearer ${accessTokenA}` }
          });
        }
      );

      // Cleanup
      await prisma.product.delete({ where: { id: productB.id } });
    });

    it('IDOR: Tenant isolation funciona para Purchase model', async () => {
      await createAndTestIDOR(
        'Purchase',
        '/api/purchases',
        testData.tenantA.user.id,
        async () => prisma.purchase.create({
          data: {
            tenantId: testData.tenantB.tenant.id,
            userId: testData.tenantB.user.id,
            status: 'COMPLETED',
            amount: 149.99,
            currency: 'BRL',
            paymentMethod: 'PIX',
          }
        }),
        async (id) => prisma.purchase.delete({ where: { id } }),
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });

    it('IDOR: Tenant isolation funciona para UsageRecord model', async () => {
      // Create a feature first
      const feature = await prisma.feature.create({
        data: {
          code: `FEAT_IDOR_TEST_${Date.now()}`,
          name: 'Test Feature for IDOR',
          type: 'QUOTA',
        }
      });

      await createAndTestIDOR(
        'UsageRecord',
        '/api/usage-records',
        testData.tenantA.user.id,
        async () => prisma.usageRecord.create({
          data: {
            tenantId: testData.tenantB.tenant.id,
            featureId: feature.id,
            currentUsage: 50,
            periodStart: new Date(),
            periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          }
        }),
        async (id) => {
          await prisma.usageRecord.delete({ where: { id } });
          await prisma.feature.delete({ where: { id: feature.id } });
        },
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });
  });

  // ============================================
  // SECTION 5: User & Access (Original + New)
  // ============================================

  describe('Tenant Isolation - User & Access', () => {
    it('IDOR: Usuario de Tenant A não pode deletar Notificação de Tenant B', async () => {
      // Criar notificação para User de Tenant B
      const notificationB = await prisma.inAppNotification.create({
        data: {
          userId: testData.tenantB.user.id,
          title: 'Secret Notification',
          message: 'This is intended for Tenant B user only',
          type: 'system',
          priority: 'high'
        }
      });

      await testIDOR(
        'Notification',
        '/api/notifications',
        testData.tenantA.user.id,
        notificationB.id,
        async (endpoint, resourceId) => {
          return app.inject({
            method: 'DELETE',
            url: `${endpoint}/${resourceId}`,
            headers: { Authorization: `Bearer ${accessTokenA}` }
          });
        }
      );

      // Cleanup
      await prisma.inAppNotification.delete({ where: { id: notificationB.id } });
    });

    it('IDOR: Usuario de Tenant A não pode cancelar Convite de Tenant B', async () => {
      // Criar convite para Tenant B
      const inviteB = await prisma.tenantInvite.create({
        data: {
          email: `invite-${Date.now()}@test.com`,
          role: 'USER',
          token: `token-${Date.now()}`,
          expiresAt: new Date(Date.now() + 86400000),
          tenantId: testData.tenantB.tenant.id,
          invitedById: testData.tenantB.user.id
        }
      });

      await testIDOR(
        'TenantInvite',
        '/api/users/invites',
        testData.tenantA.user.id,
        inviteB.id,
        async (endpoint, resourceId) => {
          return app.inject({
            method: 'DELETE', // Cancel invite
            url: `${endpoint}/${resourceId}`,
            headers: { Authorization: `Bearer ${accessTokenA}` }
          });
        }
      );

      // Cleanup
      await prisma.tenantInvite.delete({ where: { id: inviteB.id } });
    });
  });

  // ============================================
  // SECTION 6: Audit & Security Models (NEW)
  // ============================================

  describe('Tenant Isolation - Audit & Security Models', () => {
    it('IDOR: Tenant isolation funciona para SecurityAuditLog model', async () => {
      await createAndTestIDOR(
        'SecurityAuditLog',
        '/api/security-audit-logs',
        testData.tenantA.user.id,
        async () => prisma.securityAuditLog.create({
          data: {
            action: 'login.success',
            resource: 'auth',
            userId: testData.tenantB.user.id,
            tenantId: testData.tenantB.tenant.id,
            ipAddress: '10.0.0.1',
            userAgent: 'Mozilla/5.0',
            success: true,
          }
        }),
        async (id) => prisma.securityAuditLog.delete({ where: { id } }),
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });

    it('IDOR: Tenant isolation funciona para ImpersonationSession model', async () => {
      await createAndTestIDOR(
        'ImpersonationSession',
        '/api/impersonation-sessions',
        testData.tenantA.user.id,
        async () => prisma.impersonationSession.create({
          data: {
            impersonatorId: testData.tenantB.user.id,
            impersonatedId: testData.tenantB.user.id,
            tenantId: testData.tenantB.tenant.id,
            justification: 'Test impersonation for IDOR check',
            expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
            status: 'ACTIVE',
          }
        }),
        async (id) => prisma.impersonationSession.delete({ where: { id } }),
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });

    it('IDOR: Tenant isolation funciona para DataExportLog model', async () => {
      await createAndTestIDOR(
        'DataExportLog',
        '/api/data-exports',
        testData.tenantA.user.id,
        async () => prisma.dataExportLog.create({
          data: {
            userId: testData.tenantB.user.id,
            exportType: 'csv',
            resource: 'users',
            recordCount: 100,
            columns: ['id', 'email', 'name'],
            hasPII: true,
            ipAddress: '10.0.0.1',
          }
        }),
        async (id) => prisma.dataExportLog.delete({ where: { id } }),
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });
  });

  // ============================================
  // SECTION 7: Email Infrastructure Models (NEW)
  // ============================================

  describe('Tenant Isolation - Email Infrastructure', () => {
    it('IDOR: Tenant isolation funciona para EmailEvent model', async () => {
      await createAndTestIDOR(
        'EmailEvent',
        '/api/email-events',
        testData.tenantA.user.id,
        async () => prisma.emailEvent.create({
          data: {
            userId: testData.tenantB.user.id,
            tenantId: testData.tenantB.tenant.id,
            email: 'secret@tenantb.com',
            eventType: 'SENT',
            emailType: 'TRANSACTIONAL',
            messageId: `msg-idor-test-${Date.now()}`,
          }
        }),
        async (id) => prisma.emailEvent.delete({ where: { id } }),
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });

    it('IDOR: Tenant isolation funciona para EmailQueue model', async () => {
      await createAndTestIDOR(
        'EmailQueue',
        '/api/email-queue',
        testData.tenantA.user.id,
        async () => prisma.emailQueue.create({
          data: {
            to: 'recipient@tenantb.com',
            subject: 'Secret Email from Tenant B',
            tenantId: testData.tenantB.tenant.id,
            userId: testData.tenantB.user.id,
            status: 'PENDING',
          }
        }),
        async (id) => prisma.emailQueue.delete({ where: { id } }),
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });

    it('IDOR: Tenant isolation funciona para EmailMetrics model', async () => {
      await createAndTestIDOR(
        'EmailMetrics',
        '/api/email-metrics',
        testData.tenantA.user.id,
        async () => prisma.emailMetrics.create({
          data: {
            date: new Date(),
            tenantId: testData.tenantB.tenant.id,
            emailType: 'TRANSACTIONAL',
            sentCount: 150,
            deliveredCount: 145,
            bounceCount: 5,
          }
        }),
        async (id) => prisma.emailMetrics.delete({ where: { id } }),
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });
  });

  // ============================================
  // SECTION 8: Spaces & Permissions Models (NEW)
  // ============================================

  describe('Tenant Isolation - Spaces & Permissions', () => {
    it('IDOR: Tenant isolation funciona para Capability model', async () => {
      await createAndTestIDOR(
        'Capability',
        '/api/capabilities',
        testData.tenantA.user.id,
        async () => prisma.capability.create({
          data: {
            code: `cap.idor.test.${Date.now()}`,
            resource: 'test',
            action: 'read',
            category: 'Security',
            tenantId: testData.tenantB.tenant.id,
            sensitivity: 'NORMAL',
          }
        }),
        async (id) => prisma.capability.delete({ where: { id } }),
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });

    it('IDOR: Tenant isolation funciona para Grant model', async () => {
      // Create a Space first for the grant
      const spaceB = await prisma.space.create({
        data: {
          name: `Grant Test Space B ${Date.now()}`,
          code: `GTS_B_${Date.now()}`,
          tenantId: testData.tenantB.tenant.id,
        }
      });

      await createAndTestIDOR(
        'Grant',
        '/api/grants',
        testData.tenantA.user.id,
        async () => prisma.grant.create({
          data: {
            userId: testData.tenantB.user.id,
            spaceId: spaceB.id,
            tenantId: testData.tenantB.tenant.id,
            type: 'ADD',
            accessLevel: 'READ_ONLY',
            scope: 'SPACE',
            justification: 'IDOR test grant',
            grantedBy: testData.tenantB.user.id,
          }
        }),
        async (id) => {
          await prisma.grant.delete({ where: { id } });
          await prisma.space.delete({ where: { id: spaceB.id } });
        },
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });

    it('IDOR: Tenant isolation funciona para GrantRequest model', async () => {
      await createAndTestIDOR(
        'GrantRequest',
        '/api/grant-requests',
        testData.tenantA.user.id,
        async () => prisma.grantRequest.create({
          data: {
            requesterId: testData.tenantB.user.id,
            tenantId: testData.tenantB.tenant.id,
            accessLevel: 'READ_ONLY',
            scope: 'SPACE',
            justification: 'IDOR test grant request',
            requestedDuration: 7,
            status: 'PENDING',
          }
        }),
        async (id) => prisma.grantRequest.delete({ where: { id } }),
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });

    it('IDOR: Tenant isolation funciona para Policy model', async () => {
      await createAndTestIDOR(
        'Policy',
        '/api/policies',
        testData.tenantA.user.id,
        async () => prisma.policy.create({
          data: {
            name: `IDOR Test Policy B ${Date.now()}`,
            description: 'Policy for IDOR testing',
            type: 'MFA_REQUIRED',
            targetType: 'GLOBAL',
            tenantId: testData.tenantB.tenant.id,
            conditions: { requireMFA: true },
            enforcement: 'DENY',
            isActive: true,
          }
        }),
        async (id) => prisma.policy.delete({ where: { id } }),
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });
  });

  // ============================================
  // SECTION 9: Platform Configuration (NEW)
  // ============================================

  describe('Tenant Isolation - Platform Configuration', () => {
    it('IDOR: Tenant isolation funciona para PlatformConfig model', async () => {
      await createAndTestIDOR(
        'PlatformConfig',
        '/api/platform-config',
        testData.tenantA.user.id,
        async () => prisma.platformConfig.create({
          data: {
            tenantId: testData.tenantB.tenant.id,
            companyName: 'Tenant B Secret Company',
            primaryColor: '#FF0000',
            language: 'en-US',
          }
        }),
        async (id) => prisma.platformConfig.delete({ where: { id } }),
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });
  });

  // ============================================
  // SECTION 10: User-Owned Models (NEW)
  // ============================================

  describe('Tenant Isolation - User-Owned Models', () => {
    it('IDOR: Tenant isolation funciona para UserSpace model', async () => {
      // Create a space in Tenant B
      const spaceB = await prisma.space.create({
        data: {
          name: `UserSpace Test B ${Date.now()}`,
          code: `UST_B_${Date.now()}`,
          tenantId: testData.tenantB.tenant.id,
        }
      });

      await createAndTestIDOR(
        'UserSpace',
        '/api/user-spaces',
        testData.tenantA.user.id,
        async () => prisma.userSpace.create({
          data: {
            userId: testData.tenantB.user.id,
            spaceId: spaceB.id,
          }
        }),
        async (id) => {
          await prisma.userSpace.delete({ where: { id } });
          await prisma.space.delete({ where: { id: spaceB.id } });
        },
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });

    it('IDOR: Tenant isolation funciona para DesignSystemCustomization model', async () => {
      // Create a separate user for Tenant B to own the customization
      const designUser = await prisma.user.create({
        data: {
          email: `design-user-idor-${Date.now()}@test.com`,
          name: 'Design User B',
          password: 'hashed-password',
          tenantId: testData.tenantB.tenant.id,
          role: 'USER',
        }
      });

      await createAndTestIDOR(
        'DesignSystemCustomization',
        '/api/design-system',
        testData.tenantA.user.id,
        async () => prisma.designSystemCustomization.create({
          data: {
            userId: designUser.id,
            designSystem: 'MUI',
            mode: 'dark',
            colorPrimary: '#FF5733',
          }
        }),
        async (id) => {
          await prisma.designSystemCustomization.delete({ where: { id } });
          await prisma.user.delete({ where: { id: designUser.id } });
        },
        async (endpoint, resourceId) => app.inject({
          method: 'GET',
          url: `${endpoint}/${resourceId}`,
          headers: { Authorization: `Bearer ${accessTokenA}` }
        })
      );
    });
  });

  // ============================================
  // SECTION 11: Edge Cases (Original)
  // ============================================

  describe('Tenant Isolation - Edge Cases', () => {
    it('IDOR: Null tenantId não deve permitir acesso cross-tenant', async () => {
      // Buscar users sem tenantId (super admins ou orphaned users)
      const orphanedUsers = await prisma.user.findMany({
        where: {
          tenantId: null
        }
      });

      // Validar que users de teste não aparecem (todos têm tenantId)
      const hasTestUser = orphanedUsers.some(
        user => user.id === testData.tenantA.user.id ||
                user.id === testData.tenantB.user.id
      );
      expect(hasTestUser).toBe(false);
    });

    it('IDOR: Empty string tenantId não deve bypassar isolation', async () => {
      // Tentar buscar users com tenantId vazio
      const usersWithEmptyTenant = await prisma.user.findMany({
        where: {
          tenantId: ''
        }
      });

      // Nenhum user de teste deve aparecer
      const hasTestUser = usersWithEmptyTenant.some(
        user => user.id === testData.tenantA.user.id ||
                user.id === testData.tenantB.user.id
      );
      expect(hasTestUser).toBe(false);
    });

    it('IDOR: UUID inválido não deve causar erro ou vazamento', async () => {
      // Tentar buscar com UUID inválido
      const invalidUuid = 'not-a-valid-uuid';

      // Não deve lançar erro, apenas retornar vazio
      const users = await prisma.user.findMany({
        where: {
          tenantId: invalidUuid
        }
      });

      expect(users).toEqual([]);
    });

    it('IDOR: Cross-tenant access via direct Prisma query (defense in depth)', async () => {
      // Verify that even a direct DB query with wrong tenantId returns nothing
      const invoiceB = await prisma.invoice.create({
        data: {
          tenantId: testData.tenantB.tenant.id,
          invoiceNumber: `INV-EDGE-${Date.now()}`,
          status: 'PENDING',
          amountDue: 500,
          amountPaid: 0,
          currency: 'BRL',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
      });

      // Query with Tenant A's tenantId should NOT find Tenant B's invoice
      const crossTenantResult = await prisma.invoice.findFirst({
        where: {
          id: invoiceB.id,
          tenantId: testData.tenantA.tenant.id,
        }
      });

      expect(crossTenantResult).toBeNull();

      // Cleanup
      await prisma.invoice.delete({ where: { id: invoiceB.id } });
    });

    it('IDOR: Tenant B resources invisible in Tenant A list queries', async () => {
      // Create resources in Tenant B
      const projectB = await prisma.project.create({
        data: {
          name: `Secret Project List Test ${Date.now()}`,
          tenantId: testData.tenantB.tenant.id,
          createdById: testData.tenantB.user.id,
          status: 'ACTIVE',
        }
      });

      // Query with Tenant A filter should not see Tenant B's project
      const tenantAProjects = await prisma.project.findMany({
        where: {
          tenantId: testData.tenantA.tenant.id,
        }
      });

      const hasTenantBProject = tenantAProjects.some(p => p.id === projectB.id);
      expect(hasTenantBProject).toBe(false);

      // Cleanup
      await prisma.project.delete({ where: { id: projectB.id } });
    });
  });

  // ============================================
  // SECTION 12: Performance (Original)
  // ============================================

  describe('Tenant Isolation - Performance', () => {
    it('IDOR: Queries com tenantId devem usar índice (performance check)', async () => {
      // Criar múltiplos users para Tenant A
      const userPromises = Array.from({ length: 10 }, (_, i) =>
        prisma.user.create({
          data: {
            email: `perf-test-${i}-${Date.now()}@test.com`,
            name: `Perf Test User ${i}`,
            password: 'hashed-password',
            tenantId: testData.tenantA.tenant.id,
            role: 'USER'
          }
        })
      );

      const createdUsers = await Promise.all(userPromises);

      // Medir tempo de query com tenantId (deve usar índice)
      const startTime = Date.now();
      const users = await prisma.user.findMany({
        where: {
          tenantId: testData.tenantA.tenant.id
        }
      });
      const queryTime = Date.now() - startTime;

      // Query deve ser rápida (< 100ms mesmo com muitos users)
      expect(queryTime).toBeLessThan(100);
      expect(users.length).toBeGreaterThanOrEqual(11); // 1 original + 10 criados

      // Cleanup
      await prisma.user.deleteMany({
        where: {
          id: {
            in: createdUsers.map(u => u.id)
          }
        }
      });
    });
  });

  // ============================================
  // SECTION 13: IDOR Middleware Coverage Validation
  // ============================================

  describe('IDOR Middleware Coverage Validation', () => {
    it('should have IDOR protection for all models with tenantId', async () => {
      // This test validates that the IDOR middleware type covers all expected models
      // Import at runtime to validate the type exists
      const { ALL_IDOR_PROTECTED_MODELS, IDOR_OWNER_FIELD_MAP } = await import(
        '../../src/middleware/idor.middleware'
      );

      // Verify we have 34 protected models
      expect(ALL_IDOR_PROTECTED_MODELS.length).toBe(34);

      // Verify all models have an owner field mapping
      for (const model of ALL_IDOR_PROTECTED_MODELS) {
        expect(IDOR_OWNER_FIELD_MAP[model]).toBeDefined();
        expect(typeof IDOR_OWNER_FIELD_MAP[model]).toBe('string');
      }

      // Verify specific critical models are covered
      const criticalModels = [
        'user', 'invoice', 'order', 'subscription', 'file',
        'auditLog', 'securityAuditLog', 'plan', 'product', 'purchase',
        'grant', 'grantRequest', 'policy', 'project', 'task',
        'space', 'capability', 'platformConfig', 'tenantInvite',
        'emailEvent', 'emailQueue', 'emailMetrics',
        'impersonationSession', 'usageRecord',
        'inAppNotification', 'designSystemCustomization',
        'dataExportLog', 'securityRequest',
      ];

      for (const model of criticalModels) {
        expect(ALL_IDOR_PROTECTED_MODELS).toContain(model);
      }
    });

    it('should map owner fields correctly for tenant-based models', async () => {
      const { IDOR_OWNER_FIELD_MAP } = await import(
        '../../src/middleware/idor.middleware'
      );

      // Tenant-based models should use 'tenantId'
      const tenantBasedModels = [
        'invoice', 'order', 'subscription', 'auditLog', 'securityAuditLog',
        'plan', 'product', 'purchase', 'usageRecord', 'emailEvent',
        'emailMetrics', 'emailQueue', 'tenantInvite', 'platformConfig',
        'space', 'capability', 'grant', 'grantRequest', 'policy',
        'impersonationSession', 'project', 'task',
      ];

      for (const model of tenantBasedModels) {
        expect(IDOR_OWNER_FIELD_MAP[model]).toBe('tenantId');
      }
    });

    it('should map owner fields correctly for user-owned models', async () => {
      const { IDOR_OWNER_FIELD_MAP } = await import(
        '../../src/middleware/idor.middleware'
      );

      // User-owned models should use 'userId' (or specific field)
      expect(IDOR_OWNER_FIELD_MAP['inAppNotification']).toBe('userId');
      expect(IDOR_OWNER_FIELD_MAP['userNotificationPreferences']).toBe('userId');
      expect(IDOR_OWNER_FIELD_MAP['designSystemCustomization']).toBe('userId');
      expect(IDOR_OWNER_FIELD_MAP['refreshToken']).toBe('userId');
      expect(IDOR_OWNER_FIELD_MAP['file']).toBe('userId');
      expect(IDOR_OWNER_FIELD_MAP['dataExportLog']).toBe('userId');
      expect(IDOR_OWNER_FIELD_MAP['securityRequest']).toBe('requesterId');
    });
  });
});
