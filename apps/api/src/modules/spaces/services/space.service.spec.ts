import { describe, it, expect, vi, beforeEach } from 'vitest';
import { spaceService } from './space.service';

const prismaMock = vi.hoisted(() => ({
  space: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: prismaMock,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeSpace(overrides: Record<string, any> = {}) {
  return {
    id: 'space-1',
    tenantId: 'tenant-a',
    code: 'FINANCE',
    name: 'Finance',
    description: 'Finance department space',
    icon: 'DollarSign',
    color: '#10B981',
    defaultPermissions: ['view:invoices', 'manage:refunds'],
    isActive: true,
    sortOrder: 0,
    config: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SpaceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // listSpaces
  // -------------------------------------------------------------------------
  describe('listSpaces', () => {
    it('should return active spaces for a given tenant including global spaces', async () => {
      const tenantSpace = makeSpace();
      const globalSpace = makeSpace({ id: 'space-global', tenantId: null, code: 'ADMIN', name: 'Admin' });
      prismaMock.space.findMany.mockResolvedValue([globalSpace, tenantSpace]);

      const result = await spaceService.listSpaces('tenant-a');

      expect(prismaMock.space.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            OR: [
              { tenantId: 'tenant-a' },
              { tenantId: null },
            ],
          }),
          orderBy: { sortOrder: 'asc' },
        })
      );
      expect(result).toHaveLength(2);
    });

    it('should return only global spaces when no tenantId is provided', async () => {
      const globalSpace = makeSpace({ id: 'space-global', tenantId: null, code: 'PLATFORM' });
      prismaMock.space.findMany.mockResolvedValue([globalSpace]);

      const result = await spaceService.listSpaces();

      expect(prismaMock.space.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            tenantId: null,
          }),
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].tenantId).toBeNull();
    });

    it('should return empty array when no spaces exist', async () => {
      prismaMock.space.findMany.mockResolvedValue([]);

      const result = await spaceService.listSpaces('tenant-empty');

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should order spaces by sortOrder ascending', async () => {
      const space1 = makeSpace({ id: 'space-1', sortOrder: 2 });
      const space2 = makeSpace({ id: 'space-2', sortOrder: 0 });
      const space3 = makeSpace({ id: 'space-3', sortOrder: 1 });
      prismaMock.space.findMany.mockResolvedValue([space2, space3, space1]);

      await spaceService.listSpaces('tenant-a');

      expect(prismaMock.space.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { sortOrder: 'asc' },
        })
      );
    });

    it('should only return active spaces (isActive filter)', async () => {
      prismaMock.space.findMany.mockResolvedValue([]);

      await spaceService.listSpaces('tenant-a');

      expect(prismaMock.space.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // getSpaceById
  // -------------------------------------------------------------------------
  describe('getSpaceById', () => {
    it('should return space when found by id', async () => {
      const space = makeSpace();
      prismaMock.space.findFirst.mockResolvedValue(space);

      const result = await spaceService.getSpaceById('space-1');

      expect(prismaMock.space.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'space-1' },
        })
      );
      expect(result.id).toBe('space-1');
      expect(result.code).toBe('FINANCE');
    });

    it('should apply tenant isolation via OR clause when tenantId is provided', async () => {
      const space = makeSpace();
      prismaMock.space.findFirst.mockResolvedValue(space);

      await spaceService.getSpaceById('space-1', 'tenant-a');

      expect(prismaMock.space.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'space-1',
            OR: [
              { tenantId: 'tenant-a' },
              { tenantId: null },
            ],
          }),
        })
      );
    });

    it('should allow access to global spaces (tenantId null) for any tenant', async () => {
      const globalSpace = makeSpace({ tenantId: null, code: 'GLOBAL' });
      prismaMock.space.findFirst.mockResolvedValue(globalSpace);

      const result = await spaceService.getSpaceById('space-1', 'tenant-b');

      expect(result.tenantId).toBeNull();
    });

    it('should throw when space is not found', async () => {
      prismaMock.space.findFirst.mockResolvedValue(null);

      await expect(spaceService.getSpaceById('nonexistent')).rejects.toThrow(
        'Space not found'
      );
    });

    it('should throw when space belongs to a different tenant', async () => {
      // Prisma returns null because the OR clause does not match
      prismaMock.space.findFirst.mockResolvedValue(null);

      await expect(
        spaceService.getSpaceById('space-1', 'tenant-other')
      ).rejects.toThrow('Space not found');
    });

    it('should not add OR clause when tenantId is not provided', async () => {
      const space = makeSpace({ tenantId: null });
      prismaMock.space.findFirst.mockResolvedValue(space);

      await spaceService.getSpaceById('space-1');

      const callArgs = prismaMock.space.findFirst.mock.calls[0][0];
      expect(callArgs.where).toEqual({ id: 'space-1' });
      expect(callArgs.where.OR).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // Tenant isolation
  // -------------------------------------------------------------------------
  describe('tenant isolation', () => {
    it('listSpaces should isolate tenant-a from tenant-b spaces', async () => {
      // When tenant-a calls listSpaces, it should NOT receive tenant-b spaces
      prismaMock.space.findMany.mockResolvedValue([
        makeSpace({ id: 'space-a', tenantId: 'tenant-a' }),
      ]);

      const result = await spaceService.listSpaces('tenant-a');

      // Verify the where clause ensures tenant isolation
      const callArgs = prismaMock.space.findMany.mock.calls[0][0];
      const orClause = callArgs.where.OR;
      expect(orClause).toEqual([
        { tenantId: 'tenant-a' },
        { tenantId: null },
      ]);
      // tenant-b should NOT be in the filter
      expect(orClause).not.toContainEqual({ tenantId: 'tenant-b' });
      expect(result).toHaveLength(1);
    });

    it('getSpaceById should prevent cross-tenant access', async () => {
      // Space belongs to tenant-a, but tenant-b tries to access it
      prismaMock.space.findFirst.mockResolvedValue(null);

      await expect(
        spaceService.getSpaceById('space-a', 'tenant-b')
      ).rejects.toThrow('Space not found');

      expect(prismaMock.space.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'space-a',
            OR: [
              { tenantId: 'tenant-b' },
              { tenantId: null },
            ],
          }),
        })
      );
    });

    it('global spaces (tenantId=null) should be visible to all tenants in listSpaces', async () => {
      const globalSpace = makeSpace({ id: 'global-1', tenantId: null, code: 'GLOBAL' });
      prismaMock.space.findMany.mockResolvedValue([globalSpace]);

      await spaceService.listSpaces('tenant-x');

      // The OR clause includes { tenantId: null } so global spaces are included
      const callArgs = prismaMock.space.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toContainEqual({ tenantId: null });
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------
  describe('edge cases', () => {
    it('should handle space with all optional fields as null', async () => {
      const minimalSpace = makeSpace({
        description: null,
        config: null,
        tenantId: null,
      });
      prismaMock.space.findFirst.mockResolvedValue(minimalSpace);

      const result = await spaceService.getSpaceById('space-1');

      expect(result.description).toBeNull();
      expect(result.config).toBeNull();
      expect(result.tenantId).toBeNull();
    });

    it('should handle empty defaultPermissions array', async () => {
      const space = makeSpace({ defaultPermissions: [] });
      prismaMock.space.findFirst.mockResolvedValue(space);

      const result = await spaceService.getSpaceById('space-1');

      expect(result.defaultPermissions).toEqual([]);
    });

    it('should handle space with JSON config', async () => {
      const configData = {
        navSections: [{ title: 'Dashboard', icon: 'Home' }],
        dashboardCards: ['revenue', 'expenses'],
      };
      const space = makeSpace({ config: configData });
      prismaMock.space.findFirst.mockResolvedValue(space);

      const result = await spaceService.getSpaceById('space-1');

      expect(result.config).toEqual(configData);
      expect((result.config as any).navSections).toHaveLength(1);
    });

    it('should handle multiple spaces with same code across tenants', async () => {
      const spaceTenantA = makeSpace({ id: 'space-a', tenantId: 'tenant-a', code: 'SALES' });
      const spaceTenantB = makeSpace({ id: 'space-b', tenantId: 'tenant-b', code: 'SALES' });

      // tenant-a should only see their own SALES space + global
      prismaMock.space.findMany.mockResolvedValue([spaceTenantA]);

      const result = await spaceService.listSpaces('tenant-a');

      expect(result).toHaveLength(1);
      expect(result[0].tenantId).toBe('tenant-a');
    });

    it('should handle large sortOrder values', async () => {
      const space = makeSpace({ sortOrder: 999999 });
      prismaMock.space.findFirst.mockResolvedValue(space);

      const result = await spaceService.getSpaceById('space-1');

      expect(result.sortOrder).toBe(999999);
    });
  });
});
