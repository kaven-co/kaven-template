import { describe, it, expect, vi, beforeEach } from 'vitest';
import { roleService } from './role.service';

// ---------------------------------------------------------------------------
// Prisma mock (vi.hoisted pattern)
// ---------------------------------------------------------------------------

const prismaMock = vi.hoisted(() => {
  const mockObj: any = {
    spaceRole: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    roleCapability: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    capability: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    space: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn((callback: any) => callback(mockObj)),
  };
  return mockObj;
});

vi.mock('../../../lib/prisma', () => ({
  prisma: prismaMock,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SPACE_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const ROLE_UUID = 'r1b2c3d4-e5f6-7890-abcd-ef1234567890';
const CAP_ID_1 = 'cap-001';
const CAP_ID_2 = 'cap-002';

function makeRole(overrides: Record<string, any> = {}) {
  return {
    id: ROLE_UUID,
    name: 'Editor',
    description: 'Can edit content',
    code: 'EDITOR',
    spaceId: SPACE_UUID,
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    capabilities: [],
    _count: { userAssignments: 0 },
    ...overrides,
  };
}

function makeCapability(overrides: Record<string, any> = {}) {
  return {
    id: CAP_ID_1,
    code: 'content.edit',
    name: 'Edit Content',
    category: 'content',
    isActive: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RoleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // listRoles
  // -------------------------------------------------------------------------
  describe('listRoles', () => {
    it('should list roles by space UUID', async () => {
      const role = makeRole();
      prismaMock.spaceRole.findMany.mockResolvedValue([role]);

      const result = await roleService.listRoles(SPACE_UUID);

      expect(prismaMock.spaceRole.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { spaceId: SPACE_UUID, isActive: true },
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Editor');
    });

    it('should resolve space code to UUID before querying', async () => {
      prismaMock.space.findFirst.mockResolvedValue({ id: SPACE_UUID });
      prismaMock.spaceRole.findMany.mockResolvedValue([]);

      await roleService.listRoles('ADMIN');

      expect(prismaMock.space.findFirst).toHaveBeenCalledWith({
        where: { code: 'ADMIN' },
        select: { id: true },
      });
      expect(prismaMock.spaceRole.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { spaceId: SPACE_UUID, isActive: true },
        })
      );
    });

    it('should throw when space code not found', async () => {
      prismaMock.space.findFirst.mockResolvedValue(null);

      await expect(roleService.listRoles('NONEXISTENT')).rejects.toThrow(
        "Space with code 'NONEXISTENT' not found"
      );
    });

    it('should include capabilities and user assignment count', async () => {
      prismaMock.spaceRole.findMany.mockResolvedValue([makeRole()]);

      await roleService.listRoles(SPACE_UUID);

      expect(prismaMock.spaceRole.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            _count: { select: { userAssignments: true } },
            capabilities: { include: { capability: true } },
          }),
        })
      );
    });

    it('should order results by createdAt ascending', async () => {
      prismaMock.spaceRole.findMany.mockResolvedValue([]);

      await roleService.listRoles(SPACE_UUID);

      expect(prismaMock.spaceRole.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'asc' },
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // getRoleById
  // -------------------------------------------------------------------------
  describe('getRoleById', () => {
    it('should return role with capabilities when found', async () => {
      const role = makeRole({
        capabilities: [{ capability: makeCapability() }],
      });
      prismaMock.spaceRole.findUnique.mockResolvedValue(role);

      const result = await roleService.getRoleById(ROLE_UUID);

      expect(prismaMock.spaceRole.findUnique).toHaveBeenCalledWith({
        where: { id: ROLE_UUID },
        include: {
          capabilities: { include: { capability: true } },
        },
      });
      expect(result.id).toBe(ROLE_UUID);
      expect(result.capabilities).toHaveLength(1);
    });

    it('should throw when role not found', async () => {
      prismaMock.spaceRole.findUnique.mockResolvedValue(null);

      await expect(roleService.getRoleById('nonexistent')).rejects.toThrow(
        'Role not found'
      );
    });

    it('should throw when role is inactive (soft deleted)', async () => {
      prismaMock.spaceRole.findUnique.mockResolvedValue(
        makeRole({ isActive: false })
      );

      await expect(roleService.getRoleById(ROLE_UUID)).rejects.toThrow(
        'Role not found'
      );
    });
  });

  // -------------------------------------------------------------------------
  // createRole
  // -------------------------------------------------------------------------
  describe('createRole', () => {
    it('should create role with capabilities inside a transaction', async () => {
      const createdRole = makeRole({ id: 'new-role-id' });
      prismaMock.capability.count.mockResolvedValue(2);
      prismaMock.spaceRole.create.mockResolvedValue(createdRole);
      prismaMock.roleCapability.createMany.mockResolvedValue({ count: 2 });

      const result = await roleService.createRole({
        name: 'Editor',
        description: 'Can edit content',
        spaceId: SPACE_UUID,
        capabilities: [CAP_ID_1, CAP_ID_2],
      });

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(prismaMock.spaceRole.create).toHaveBeenCalledWith({
        data: {
          name: 'Editor',
          description: 'Can edit content',
          spaceId: SPACE_UUID,
          code: 'EDITOR',
        },
      });
      expect(prismaMock.roleCapability.createMany).toHaveBeenCalledWith({
        data: [
          { roleId: 'new-role-id', capabilityId: CAP_ID_1 },
          { roleId: 'new-role-id', capabilityId: CAP_ID_2 },
        ],
      });
      expect(result.id).toBe('new-role-id');
    });

    it('should create role without capabilities when list is empty', async () => {
      const createdRole = makeRole({ id: 'new-role-id' });
      prismaMock.spaceRole.create.mockResolvedValue(createdRole);

      await roleService.createRole({
        name: 'Viewer',
        spaceId: SPACE_UUID,
        capabilities: [],
      });

      expect(prismaMock.roleCapability.createMany).not.toHaveBeenCalled();
    });

    it('should throw when one or more capabilities are invalid', async () => {
      prismaMock.capability.count.mockResolvedValue(1); // only 1 valid out of 2

      await expect(
        roleService.createRole({
          name: 'Bad Role',
          spaceId: SPACE_UUID,
          capabilities: [CAP_ID_1, 'invalid-cap'],
        })
      ).rejects.toThrow('One or more capabilities are invalid');
    });

    it('should resolve space code to UUID', async () => {
      prismaMock.space.findFirst.mockResolvedValue({ id: SPACE_UUID });
      prismaMock.spaceRole.create.mockResolvedValue(makeRole());

      await roleService.createRole({
        name: 'Admin',
        spaceId: 'ADMIN',
        capabilities: [],
      });

      expect(prismaMock.space.findFirst).toHaveBeenCalledWith({
        where: { code: 'ADMIN' },
        select: { id: true },
      });
      expect(prismaMock.spaceRole.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ spaceId: SPACE_UUID }),
        })
      );
    });

    it('should throw when space code not found during create', async () => {
      prismaMock.space.findFirst.mockResolvedValue(null);

      await expect(
        roleService.createRole({
          name: 'Ghost Role',
          spaceId: 'NONEXISTENT',
          capabilities: [],
        })
      ).rejects.toThrow("Space with code 'NONEXISTENT' not found");
    });

    it('should generate role code from name (uppercase with underscores)', async () => {
      prismaMock.spaceRole.create.mockResolvedValue(makeRole());

      await roleService.createRole({
        name: 'content manager',
        spaceId: SPACE_UUID,
        capabilities: [],
      });

      expect(prismaMock.spaceRole.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ code: 'CONTENT_MANAGER' }),
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // updateRole
  // -------------------------------------------------------------------------
  describe('updateRole', () => {
    it('should throw when role not found', async () => {
      prismaMock.spaceRole.findUnique.mockResolvedValue(null);

      await expect(
        roleService.updateRole('nonexistent', { name: 'Updated' })
      ).rejects.toThrow('Role not found');
    });

    it('should throw when role is inactive', async () => {
      prismaMock.spaceRole.findUnique.mockResolvedValue(
        makeRole({ isActive: false })
      );

      await expect(
        roleService.updateRole(ROLE_UUID, { name: 'Updated' })
      ).rejects.toThrow('Role not found');
    });

    it('should update role name and description inside transaction', async () => {
      const existing = makeRole();
      const updated = makeRole({ name: 'Updated Editor' });
      prismaMock.spaceRole.findUnique
        .mockResolvedValueOnce(existing) // existence check
        .mockResolvedValueOnce(updated); // returned from tx

      prismaMock.spaceRole.update.mockResolvedValue(updated);

      const result = await roleService.updateRole(ROLE_UUID, {
        name: 'Updated Editor',
        description: 'Updated description',
      });

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(prismaMock.spaceRole.update).toHaveBeenCalledWith({
        where: { id: ROLE_UUID },
        data: { name: 'Updated Editor', description: 'Updated description' },
      });
    });

    it('should replace capabilities when capabilities array is provided', async () => {
      const existing = makeRole();
      const updated = makeRole({
        capabilities: [{ capability: makeCapability() }],
      });
      prismaMock.spaceRole.findUnique
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(updated);
      prismaMock.spaceRole.update.mockResolvedValue(updated);
      prismaMock.roleCapability.deleteMany.mockResolvedValue({ count: 1 });
      prismaMock.roleCapability.createMany.mockResolvedValue({ count: 1 });

      await roleService.updateRole(ROLE_UUID, {
        capabilities: [CAP_ID_1],
      });

      // Should delete existing capabilities first
      expect(prismaMock.roleCapability.deleteMany).toHaveBeenCalledWith({
        where: { roleId: ROLE_UUID },
      });
      // Then create new ones
      expect(prismaMock.roleCapability.createMany).toHaveBeenCalledWith({
        data: [{ roleId: ROLE_UUID, capabilityId: CAP_ID_1 }],
      });
    });

    it('should not touch capabilities when capabilities is undefined', async () => {
      const existing = makeRole();
      prismaMock.spaceRole.findUnique
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(existing);
      prismaMock.spaceRole.update.mockResolvedValue(existing);

      await roleService.updateRole(ROLE_UUID, { name: 'Just a rename' });

      expect(prismaMock.roleCapability.deleteMany).not.toHaveBeenCalled();
      expect(prismaMock.roleCapability.createMany).not.toHaveBeenCalled();
    });

    it('should clear all capabilities when empty array is provided', async () => {
      const existing = makeRole();
      prismaMock.spaceRole.findUnique
        .mockResolvedValueOnce(existing)
        .mockResolvedValueOnce(existing);
      prismaMock.spaceRole.update.mockResolvedValue(existing);
      prismaMock.roleCapability.deleteMany.mockResolvedValue({ count: 2 });

      await roleService.updateRole(ROLE_UUID, { capabilities: [] });

      expect(prismaMock.roleCapability.deleteMany).toHaveBeenCalledWith({
        where: { roleId: ROLE_UUID },
      });
      // createMany should NOT be called when capabilities is empty
      expect(prismaMock.roleCapability.createMany).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // deleteRole
  // -------------------------------------------------------------------------
  describe('deleteRole', () => {
    it('should throw when role not found', async () => {
      prismaMock.spaceRole.findUnique.mockResolvedValue(null);

      await expect(roleService.deleteRole('nonexistent')).rejects.toThrow(
        'Role not found'
      );
    });

    it('should throw when role is already inactive', async () => {
      prismaMock.spaceRole.findUnique.mockResolvedValue(
        makeRole({ isActive: false })
      );

      await expect(roleService.deleteRole(ROLE_UUID)).rejects.toThrow(
        'Role not found'
      );
    });

    it('should throw when role has assigned users', async () => {
      prismaMock.spaceRole.findUnique.mockResolvedValue(
        makeRole({ _count: { userAssignments: 3 } })
      );

      await expect(roleService.deleteRole(ROLE_UUID)).rejects.toThrow(
        'Cannot delete role assigned to users'
      );
    });

    it('should soft delete (deactivate) role with no user assignments', async () => {
      prismaMock.spaceRole.findUnique.mockResolvedValue(
        makeRole({ _count: { userAssignments: 0 } })
      );
      prismaMock.spaceRole.update.mockResolvedValue(
        makeRole({ isActive: false })
      );

      const result = await roleService.deleteRole(ROLE_UUID);

      expect(prismaMock.spaceRole.update).toHaveBeenCalledWith({
        where: { id: ROLE_UUID },
        data: { isActive: false },
      });
      expect(result.isActive).toBe(false);
    });

    it('should include userAssignments count in the existence query', async () => {
      prismaMock.spaceRole.findUnique.mockResolvedValue(
        makeRole({ _count: { userAssignments: 0 } })
      );
      prismaMock.spaceRole.update.mockResolvedValue(makeRole());

      await roleService.deleteRole(ROLE_UUID);

      expect(prismaMock.spaceRole.findUnique).toHaveBeenCalledWith({
        where: { id: ROLE_UUID },
        include: { _count: { select: { userAssignments: true } } },
      });
    });
  });

  // -------------------------------------------------------------------------
  // listCapabilities
  // -------------------------------------------------------------------------
  describe('listCapabilities', () => {
    it('should return active capabilities ordered by category and code', async () => {
      const caps = [
        makeCapability({ id: 'c1', code: 'content.edit', category: 'content' }),
        makeCapability({ id: 'c2', code: 'users.manage', category: 'users' }),
      ];
      prismaMock.capability.findMany.mockResolvedValue(caps);

      const result = await roleService.listCapabilities();

      expect(prismaMock.capability.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: [{ category: 'asc' }, { code: 'asc' }],
      });
      expect(result).toHaveLength(2);
    });
  });

  // -------------------------------------------------------------------------
  // Tenant isolation tests
  // -------------------------------------------------------------------------
  describe('tenant isolation', () => {
    it('should scope listRoles to specific space (tenant boundary)', async () => {
      const spaceA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
      const spaceB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

      prismaMock.spaceRole.findMany.mockResolvedValue([]);

      await roleService.listRoles(spaceA);

      expect(prismaMock.spaceRole.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ spaceId: spaceA }),
        })
      );

      // Ensure querying spaceB does NOT leak spaceA data
      await roleService.listRoles(spaceB);

      const secondCall = prismaMock.spaceRole.findMany.mock.calls[1][0];
      expect(secondCall.where.spaceId).toBe(spaceB);
    });

    it('should create role scoped to specific space', async () => {
      const tenantSpace = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
      prismaMock.spaceRole.create.mockResolvedValue(
        makeRole({ spaceId: tenantSpace })
      );

      await roleService.createRole({
        name: 'Tenant Admin',
        spaceId: tenantSpace,
        capabilities: [],
      });

      expect(prismaMock.spaceRole.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ spaceId: tenantSpace }),
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // $transaction mocking
  // -------------------------------------------------------------------------
  describe('$transaction behavior', () => {
    it('should execute createRole within a transaction callback', async () => {
      prismaMock.spaceRole.create.mockResolvedValue(makeRole());
      prismaMock.capability.count.mockResolvedValue(1);
      prismaMock.roleCapability.createMany.mockResolvedValue({ count: 1 });

      await roleService.createRole({
        name: 'Transactional Role',
        spaceId: SPACE_UUID,
        capabilities: [CAP_ID_1],
      });

      // $transaction receives a callback function
      expect(prismaMock.$transaction).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it('should execute updateRole within a transaction callback', async () => {
      prismaMock.spaceRole.findUnique
        .mockResolvedValueOnce(makeRole())
        .mockResolvedValueOnce(makeRole());
      prismaMock.spaceRole.update.mockResolvedValue(makeRole());

      await roleService.updateRole(ROLE_UUID, { name: 'Updated' });

      expect(prismaMock.$transaction).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------
  describe('edge cases', () => {
    it('should handle role name with special characters for code generation', async () => {
      prismaMock.spaceRole.create.mockResolvedValue(makeRole());

      await roleService.createRole({
        name: 'super  admin   user',
        spaceId: SPACE_UUID,
        capabilities: [],
      });

      expect(prismaMock.spaceRole.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ code: 'SUPER_ADMIN_USER' }),
        })
      );
    });

    it('should handle UUID-like space code correctly (exact UUID regex)', async () => {
      // A string that looks like a UUID but is not (wrong length)
      const notUuid = 'not-a-uuid-at-all';
      prismaMock.space.findFirst.mockResolvedValue({ id: SPACE_UUID });
      prismaMock.spaceRole.findMany.mockResolvedValue([]);

      await roleService.listRoles(notUuid);

      // Should treat as code and look up via space.findFirst
      expect(prismaMock.space.findFirst).toHaveBeenCalledWith({
        where: { code: notUuid },
        select: { id: true },
      });
    });

    it('should use UUID directly without space lookup', async () => {
      prismaMock.spaceRole.findMany.mockResolvedValue([]);

      await roleService.listRoles(SPACE_UUID);

      // space.findFirst should NOT be called for a valid UUID
      expect(prismaMock.space.findFirst).not.toHaveBeenCalled();
    });
  });
});
