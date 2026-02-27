import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TenantService } from './tenant.service';

// Mock Prisma
const prismaMock = vi.hoisted(() => ({
  tenant: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  space: {
    findMany: vi.fn(),
  },
  $transaction: vi.fn(),
}));

vi.mock('../../../lib/prisma', () => ({
  default: prismaMock,
}));

vi.mock('../../audit/services/audit.service', () => ({
  auditService: {
    log: vi.fn().mockResolvedValue(true),
  },
}));

describe('TenantService', () => {
  let tenantService: TenantService;

  beforeEach(() => {
    vi.clearAllMocks();
    tenantService = new TenantService();
  });

  // ─── createTenant ──────────────────────────────────────────────────────────

  describe('createTenant', () => {
    it('should create a new tenant successfully', async () => {
      const input = {
        name: 'My Tenant',
        slug: 'my-tenant',
        domain: 'tenant.com',
      };

      prismaMock.tenant.findFirst.mockResolvedValue(null);
      prismaMock.tenant.create.mockResolvedValue({
        id: 'tenant-123',
        ...input,
        status: 'ACTIVE',
      });

      const result = await tenantService.createTenant(input);

      expect(prismaMock.tenant.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { slug: input.slug },
            { domain: input.domain },
          ],
        },
      });
      expect(prismaMock.tenant.create).toHaveBeenCalled();
      expect(result.slug).toBe(input.slug);
    });

    it('should throw error if slug already exists', async () => {
      const input = {
        name: 'My Tenant',
        slug: 'existing-slug',
      };

      prismaMock.tenant.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(tenantService.createTenant(input)).rejects.toThrow('Slug ou domínio já está em uso');
    });

    it('should create tenant without domain', async () => {
      const input = {
        name: 'No Domain Tenant',
        slug: 'no-domain',
      };

      prismaMock.tenant.findFirst.mockResolvedValue(null);
      prismaMock.tenant.create.mockResolvedValue({
        id: 'tenant-456',
        ...input,
        domain: null,
        status: 'ACTIVE',
      });

      const result = await tenantService.createTenant(input);

      expect(result.id).toBe('tenant-456');
    });
  });

  // ─── getTenantById ─────────────────────────────────────────────────────────

  describe('getTenantById', () => {
    it('should find tenant by UUID', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      prismaMock.tenant.findUnique.mockResolvedValue({ id, slug: 'test', deletedAt: null });

      await tenantService.getTenantById(id);

      expect(prismaMock.tenant.findUnique).toHaveBeenCalledWith({
        where: { id },
        include: expect.anything(),
      });
    });

    it('should find tenant by slug', async () => {
      const slug = 'company-slug';
      prismaMock.tenant.findUnique.mockResolvedValue({ id: 'uuid', slug, deletedAt: null });

      await tenantService.getTenantById(slug);

      expect(prismaMock.tenant.findUnique).toHaveBeenCalledWith({
        where: { slug },
        include: expect.anything(),
      });
    });

    it('should throw if tenant not found', async () => {
      prismaMock.tenant.findUnique.mockResolvedValue(null);

      await expect(tenantService.getTenantById('nonexistent'))
        .rejects.toThrow('Tenant não encontrado');
    });

    it('should throw if tenant is soft deleted', async () => {
      prismaMock.tenant.findUnique.mockResolvedValue({
        id: 'tenant-1',
        slug: 'deleted',
        deletedAt: new Date(),
      });

      await expect(tenantService.getTenantById('tenant-1'))
        .rejects.toThrow('Tenant não encontrado');
    });
  });

  // ─── getStats ──────────────────────────────────────────────────────────────

  describe('getStats', () => {
    it('should return tenant statistics', async () => {
      prismaMock.tenant.count
        .mockResolvedValueOnce(10)  // total
        .mockResolvedValueOnce(8)   // active
        .mockResolvedValueOnce(2);  // suspended

      const stats = await tenantService.getStats();

      expect(stats.total).toBe(10);
      expect(stats.active).toBe(8);
      expect(stats.suspended).toBe(2);
      expect(stats.deleted).toBe(0);
    });

    it('should exclude soft deleted tenants from counts', async () => {
      prismaMock.tenant.count.mockResolvedValue(0);

      await tenantService.getStats();

      expect(prismaMock.tenant.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        }),
      );
    });
  });

  // ─── listTenants ───────────────────────────────────────────────────────────

  describe('listTenants', () => {
    it('should list tenants with pagination', async () => {
      const mockTenants = [
        { id: 't-1', name: 'Tenant 1', slug: 'tenant-1', _count: { users: 5 } },
        { id: 't-2', name: 'Tenant 2', slug: 'tenant-2', _count: { users: 3 } },
      ];
      prismaMock.tenant.findMany.mockResolvedValue(mockTenants);
      prismaMock.tenant.count.mockResolvedValue(2);

      const result = await tenantService.listTenants(1, 10);

      expect(result.tenants).toHaveLength(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(2);
    });

    it('should apply search filter', async () => {
      prismaMock.tenant.findMany.mockResolvedValue([]);
      prismaMock.tenant.count.mockResolvedValue(0);

      await tenantService.listTenants(1, 10, 'acme');

      expect(prismaMock.tenant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: { contains: 'acme', mode: 'insensitive' } }),
            ]),
          }),
        }),
      );
    });

    it('should filter by status', async () => {
      prismaMock.tenant.findMany.mockResolvedValue([]);
      prismaMock.tenant.count.mockResolvedValue(0);

      await tenantService.listTenants(1, 10, undefined, 'ACTIVE');

      expect(prismaMock.tenant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'ACTIVE' }),
        }),
      );
    });

    it('should not filter by status when ALL is passed', async () => {
      prismaMock.tenant.findMany.mockResolvedValue([]);
      prismaMock.tenant.count.mockResolvedValue(0);

      await tenantService.listTenants(1, 10, undefined, 'ALL');

      const callArg = prismaMock.tenant.findMany.mock.calls[0][0];
      expect(callArg.where.status).toBeUndefined();
    });

    it('should apply correct skip for pagination', async () => {
      prismaMock.tenant.findMany.mockResolvedValue([]);
      prismaMock.tenant.count.mockResolvedValue(50);

      const result = await tenantService.listTenants(3, 10);

      expect(prismaMock.tenant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
      expect(result.pagination.totalPages).toBe(5);
    });
  });

  // ─── updateTenant ──────────────────────────────────────────────────────────

  describe('updateTenant', () => {
    it('should update tenant successfully', async () => {
      prismaMock.tenant.findUnique.mockResolvedValue({
        id: 'tenant-1',
        slug: 'old-slug',
        domain: 'old.com',
        deletedAt: null,
      });
      prismaMock.tenant.update.mockResolvedValue({
        id: 'tenant-1',
        name: 'Updated Name',
        slug: 'old-slug',
      });

      const result = await tenantService.updateTenant('tenant-1', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
    });

    it('should throw if tenant not found for update', async () => {
      prismaMock.tenant.findUnique.mockResolvedValue(null);

      await expect(tenantService.updateTenant('nonexistent', { name: 'New' }))
        .rejects.toThrow('Tenant não encontrado');
    });

    it('should throw if tenant is soft deleted', async () => {
      prismaMock.tenant.findUnique.mockResolvedValue({
        id: 'tenant-1',
        deletedAt: new Date(),
      });

      await expect(tenantService.updateTenant('tenant-1', { name: 'New' }))
        .rejects.toThrow('Tenant não encontrado');
    });

    it('should throw if new slug is already in use', async () => {
      prismaMock.tenant.findUnique
        .mockResolvedValueOnce({
          id: 'tenant-1',
          slug: 'old-slug',
          domain: null,
          deletedAt: null,
        })
        .mockResolvedValueOnce({ id: 'tenant-other', slug: 'taken-slug' });

      await expect(tenantService.updateTenant('tenant-1', { name: undefined, slug: 'taken-slug' }))
        .rejects.toThrow('Slug já está em uso');
    });

    it('should throw if new domain is already in use', async () => {
      prismaMock.tenant.findUnique
        .mockResolvedValueOnce({
          id: 'tenant-1',
          slug: 'slug',
          domain: 'old.com',
          deletedAt: null,
        })
        .mockResolvedValueOnce({ id: 'tenant-other', domain: 'taken.com' }); // domain check

      await expect(tenantService.updateTenant('tenant-1', { name: undefined, domain: 'taken.com' }))
        .rejects.toThrow('Domínio já está em uso');
    });
  });

  // ─── deleteTenant ──────────────────────────────────────────────────────────

  describe('deleteTenant', () => {
    it('should soft delete tenant successfully', async () => {
      prismaMock.tenant.findUnique.mockResolvedValue({
        id: 'tenant-1',
        slug: 'to-delete',
        domain: 'delete.com',
        deletedAt: null,
      });
      prismaMock.tenant.update.mockResolvedValue({});

      const result = await tenantService.deleteTenant('tenant-1');

      expect(result.message).toBe('Tenant deletado com sucesso');
      expect(prismaMock.tenant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            deletedAt: expect.any(Date),
            status: 'DELETED',
          }),
        }),
      );
    });

    it('should throw if tenant not found for deletion', async () => {
      prismaMock.tenant.findUnique.mockResolvedValue(null);

      await expect(tenantService.deleteTenant('nonexistent'))
        .rejects.toThrow('Tenant não encontrado');
    });

    it('should throw if tenant is already soft deleted', async () => {
      prismaMock.tenant.findUnique.mockResolvedValue({
        id: 'tenant-1',
        deletedAt: new Date(),
      });

      await expect(tenantService.deleteTenant('tenant-1'))
        .rejects.toThrow('Tenant não encontrado');
    });

    it('should mangle slug and domain to avoid conflicts', async () => {
      prismaMock.tenant.findUnique.mockResolvedValue({
        id: 'tenant-1',
        slug: 'my-slug',
        domain: 'my.com',
        deletedAt: null,
      });
      prismaMock.tenant.update.mockResolvedValue({});

      await tenantService.deleteTenant('tenant-1');

      const updateCall = prismaMock.tenant.update.mock.calls[0][0];
      expect(updateCall.data.slug).toMatch(/^deleted_\d+_my-slug$/);
      expect(updateCall.data.domain).toMatch(/^deleted_\d+_my\.com$/);
    });
  });

  // ─── getTenantSpaces ───────────────────────────────────────────────────────

  describe('getTenantSpaces', () => {
    it('should return global and tenant-specific spaces', async () => {
      // Mock getTenantById
      prismaMock.tenant.findUnique.mockResolvedValue({
        id: 'tenant-1',
        slug: 'test',
        deletedAt: null,
      });
      prismaMock.space.findMany.mockResolvedValue([
        { id: 'space-global', name: 'Global', tenantId: null },
        { id: 'space-tenant', name: 'Custom', tenantId: 'tenant-1' },
      ]);

      const spaces = await tenantService.getTenantSpaces('tenant-1');

      expect(spaces).toHaveLength(2);
      expect(prismaMock.space.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { tenantId: null },
              { tenantId: 'tenant-1' },
            ],
            isActive: true,
          }),
        }),
      );
    });

    it('should throw if tenant not found when listing spaces', async () => {
      prismaMock.tenant.findUnique.mockResolvedValue(null);

      await expect(tenantService.getTenantSpaces('nonexistent'))
        .rejects.toThrow('Tenant não encontrado');
    });
  });
});
