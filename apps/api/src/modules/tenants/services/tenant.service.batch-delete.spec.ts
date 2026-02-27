import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TenantService } from './tenant.service';

// Mock audit service
vi.mock('../../audit/services/audit.service', () => ({
  auditService: {
    log: vi.fn(),
  },
}));

// Mock Prisma
const prismaMock = vi.hoisted(() => {
  const mockObj: Record<string, any> = {
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
    $transaction: vi.fn((callback: any) => callback(mockObj)),
  };
  return mockObj;
});

vi.mock('../../../lib/prisma', () => ({
  default: prismaMock,
}));

import { auditService } from '../../audit/services/audit.service';

describe('TenantService - batchDeleteTenants', () => {
  let tenantService: TenantService;

  beforeEach(() => {
    vi.clearAllMocks();
    // Restore $transaction default behavior (callback passthrough)
    prismaMock.$transaction.mockImplementation((callback: any) => callback(prismaMock));
    tenantService = new TenantService();
  });

  it('should soft-delete multiple tenants and return deleted count', async () => {
    const ids = ['id-1', 'id-2', 'id-3'];
    const tenants = [
      { id: 'id-1', slug: 'tenant-1', domain: 'tenant1.com' },
      { id: 'id-2', slug: 'tenant-2', domain: null },
      { id: 'id-3', slug: 'tenant-3', domain: 'tenant3.com' },
    ];

    prismaMock.tenant.findMany.mockResolvedValue(tenants);
    prismaMock.tenant.update.mockResolvedValue({});

    const result = await tenantService.batchDeleteTenants(ids);

    expect(result.deleted).toBe(3);
    expect(result.ids).toEqual(['id-1', 'id-2', 'id-3']);
    expect(prismaMock.tenant.update).toHaveBeenCalledTimes(3);

    // Verify soft delete pattern (deletedAt set, slug prefixed, status DELETED)
    for (const call of prismaMock.tenant.update.mock.calls) {
      const data = call[0].data;
      expect(data.deletedAt).toBeInstanceOf(Date);
      expect(data.status).toBe('DELETED');
      expect(data.slug).toMatch(/^deleted_\d+_/);
    }
  });

  it('should throw error when ids array is empty', async () => {
    await expect(tenantService.batchDeleteTenants([])).rejects.toThrow(
      'É necessário informar ao menos um ID'
    );
  });

  it('should throw error when more than 50 ids are provided', async () => {
    const ids = Array.from({ length: 51 }, (_, i) => `id-${i}`);
    await expect(tenantService.batchDeleteTenants(ids)).rejects.toThrow(
      'Máximo de 50 tenants por operação'
    );
  });

  it('should throw error when an id is not a valid string', async () => {
    await expect(
      tenantService.batchDeleteTenants(['valid-id', '', 'another-id'])
    ).rejects.toThrow('Todos os IDs devem ser strings válidas');
  });

  it('should throw error when no valid tenants are found', async () => {
    prismaMock.tenant.findMany.mockResolvedValue([]);

    await expect(
      tenantService.batchDeleteTenants(['nonexistent-id'])
    ).rejects.toThrow('Nenhum tenant válido encontrado para exclusão');
  });

  it('should create audit log entry with all affected IDs', async () => {
    const ids = ['id-1', 'id-2'];
    prismaMock.tenant.findMany.mockResolvedValue([
      { id: 'id-1', slug: 'a', domain: null },
      { id: 'id-2', slug: 'b', domain: null },
    ]);
    prismaMock.tenant.update.mockResolvedValue({});

    await tenantService.batchDeleteTenants(ids);

    expect(auditService.log).toHaveBeenCalledWith({
      action: 'tenant.batch_deleted',
      entity: 'Tenant',
      entityId: 'id-1,id-2',
      metadata: { ids: ['id-1', 'id-2'], count: 2 },
    });
  });

  it('should use $transaction for atomicity', async () => {
    prismaMock.tenant.findMany.mockResolvedValue([
      { id: 'id-1', slug: 'a', domain: null },
    ]);
    prismaMock.tenant.update.mockResolvedValue({});

    await tenantService.batchDeleteTenants(['id-1']);

    expect(prismaMock.$transaction).toHaveBeenCalledWith(expect.any(Function));
  });

  it('should rollback all changes if any update fails (transaction)', async () => {
    const error = new Error('DB write failed');
    prismaMock.$transaction.mockRejectedValue(error);

    await expect(
      tenantService.batchDeleteTenants(['id-1', 'id-2'])
    ).rejects.toThrow('DB write failed');
  });

  it('should only delete tenants that are not already soft-deleted', async () => {
    // findMany with deletedAt: null filter ensures already-deleted tenants are excluded
    prismaMock.tenant.findMany.mockResolvedValue([
      { id: 'id-1', slug: 'active-tenant', domain: null },
    ]);
    prismaMock.tenant.update.mockResolvedValue({});

    const result = await tenantService.batchDeleteTenants(['id-1', 'id-already-deleted']);

    expect(prismaMock.tenant.findMany).toHaveBeenCalledWith({
      where: {
        id: { in: ['id-1', 'id-already-deleted'] },
        deletedAt: null,
      },
      select: { id: true, slug: true, domain: true },
    });
    expect(result.deleted).toBe(1);
    expect(result.ids).toEqual(['id-1']);
  });

  it('should handle domain prefix for tenants with domains', async () => {
    prismaMock.tenant.findMany.mockResolvedValue([
      { id: 'id-1', slug: 'tenant-1', domain: 'example.com' },
    ]);
    prismaMock.tenant.update.mockResolvedValue({});

    await tenantService.batchDeleteTenants(['id-1']);

    const updateCall = prismaMock.tenant.update.mock.calls[0][0];
    expect(updateCall.data.domain).toMatch(/^deleted_\d+_example\.com$/);
  });

  it('should not prefix domain when tenant has no domain', async () => {
    prismaMock.tenant.findMany.mockResolvedValue([
      { id: 'id-1', slug: 'tenant-1', domain: null },
    ]);
    prismaMock.tenant.update.mockResolvedValue({});

    await tenantService.batchDeleteTenants(['id-1']);

    const updateCall = prismaMock.tenant.update.mock.calls[0][0];
    expect(updateCall.data.domain).toBeUndefined();
  });
});
