import { describe, it, expect, vi, beforeEach } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  project: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: class {
    project = prismaMock.project;
  },
}));

import { ProjectsService } from './projects.service';

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ProjectsService();
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated projects for a tenant', async () => {
      const mockProjects = [
        { id: 'proj-1', name: 'Project Alpha', tenantId: 'tenant-1' },
        { id: 'proj-2', name: 'Project Beta', tenantId: 'tenant-1' },
      ];
      prismaMock.project.findMany.mockResolvedValue(mockProjects);
      prismaMock.project.count.mockResolvedValue(2);

      const result = await service.findAll('tenant-1');

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(1);
      expect(prismaMock.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 'tenant-1' }),
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should filter by spaceId when provided', async () => {
      prismaMock.project.findMany.mockResolvedValue([]);
      prismaMock.project.count.mockResolvedValue(0);

      await service.findAll('tenant-1', 'space-1');

      expect(prismaMock.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-1',
            spaceId: 'space-1',
          }),
        }),
      );
    });

    it('should apply pagination correctly', async () => {
      prismaMock.project.findMany.mockResolvedValue([]);
      prismaMock.project.count.mockResolvedValue(50);

      const result = await service.findAll('tenant-1', undefined, 3, 10);

      expect(result.meta.page).toBe(3);
      expect(result.meta.totalPages).toBe(5);
      expect(prismaMock.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });

    it('should not include spaceId in where when spaceId is undefined', async () => {
      prismaMock.project.findMany.mockResolvedValue([]);
      prismaMock.project.count.mockResolvedValue(0);

      await service.findAll('tenant-1', undefined);

      const callArgs = prismaMock.project.findMany.mock.calls[0][0];
      expect(callArgs.where).not.toHaveProperty('spaceId');
    });

    it('should use default page=1 and limit=10 when not specified', async () => {
      prismaMock.project.findMany.mockResolvedValue([]);
      prismaMock.project.count.mockResolvedValue(0);

      await service.findAll('tenant-1');

      expect(prismaMock.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });

    it('should order by updatedAt descending', async () => {
      prismaMock.project.findMany.mockResolvedValue([]);
      prismaMock.project.count.mockResolvedValue(0);

      await service.findAll('tenant-1');

      expect(prismaMock.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { updatedAt: 'desc' } }),
      );
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return project by id and tenantId', async () => {
      const mockProject = {
        id: 'proj-1',
        name: 'Project Alpha',
        tenantId: 'tenant-1',
        tasks: [],
      };
      prismaMock.project.findFirst.mockResolvedValue(mockProject);

      const result = await service.findOne('proj-1', 'tenant-1');

      expect(result).toEqual(mockProject);
      expect(prismaMock.project.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'proj-1', tenantId: 'tenant-1' },
        }),
      );
    });

    it('should return null if project not found', async () => {
      prismaMock.project.findFirst.mockResolvedValue(null);

      const result = await service.findOne('proj-nonexistent', 'tenant-1');

      expect(result).toBeNull();
    });

    it('should enforce tenantId in query for multi-tenant isolation', async () => {
      prismaMock.project.findFirst.mockResolvedValue(null);

      await service.findOne('proj-1', 'tenant-A');

      expect(prismaMock.project.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 'tenant-A' }),
        }),
      );
    });
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a project with tenantId and userId', async () => {
      const mockCreated = {
        id: 'proj-new',
        name: 'New Project',
        tenantId: 'tenant-1',
        createdById: 'user-1',
      };
      prismaMock.project.create.mockResolvedValue(mockCreated);

      const result = await service.create(
        { name: 'New Project', description: 'Desc' },
        'tenant-1',
        'user-1',
      );

      expect(result).toEqual(mockCreated);
      expect(prismaMock.project.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-1',
            createdById: 'user-1',
            name: 'New Project',
          }),
        }),
      );
    });

    it('should set spaceId to null when not provided', async () => {
      prismaMock.project.create.mockResolvedValue({ id: 'proj-1' });

      await service.create({ name: 'No Space' }, 'tenant-1', 'user-1');

      expect(prismaMock.project.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ spaceId: null }),
        }),
      );
    });

    it('should pass spaceId when provided in data', async () => {
      prismaMock.project.create.mockResolvedValue({ id: 'proj-1' });

      await service.create(
        { name: 'With Space', spaceId: 'space-1' },
        'tenant-1',
        'user-1',
      );

      expect(prismaMock.project.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ spaceId: 'space-1' }),
        }),
      );
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update project when it exists', async () => {
      prismaMock.project.findFirst.mockResolvedValue({ id: 'proj-1', tenantId: 'tenant-1' });
      prismaMock.project.update.mockResolvedValue({
        id: 'proj-1',
        name: 'Updated',
      });

      const result = await service.update('proj-1', { name: 'Updated' }, 'tenant-1');

      expect(result.name).toBe('Updated');
      expect(prismaMock.project.update).toHaveBeenCalledWith({
        where: { id: 'proj-1' },
        data: { name: 'Updated' },
      });
    });

    it('should throw error when project not found', async () => {
      prismaMock.project.findFirst.mockResolvedValue(null);

      await expect(
        service.update('proj-xxx', { name: 'Test' }, 'tenant-1'),
      ).rejects.toThrow('Project not found');
    });

    it('should enforce tenant isolation on update', async () => {
      prismaMock.project.findFirst.mockResolvedValue(null);

      await expect(
        service.update('proj-1', { name: 'Hack' }, 'tenant-other'),
      ).rejects.toThrow('Project not found');

      expect(prismaMock.project.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 'tenant-other' }),
        }),
      );
    });
  });

  // ─── delete ─────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('should delete project when it exists', async () => {
      prismaMock.project.findFirst.mockResolvedValue({ id: 'proj-1', tenantId: 'tenant-1' });
      prismaMock.project.delete.mockResolvedValue({ id: 'proj-1' });

      const result = await service.delete('proj-1', 'tenant-1');

      expect(result).toEqual({ id: 'proj-1' });
      expect(prismaMock.project.delete).toHaveBeenCalledWith({
        where: { id: 'proj-1' },
      });
    });

    it('should throw error when project not found', async () => {
      prismaMock.project.findFirst.mockResolvedValue(null);

      await expect(
        service.delete('proj-xxx', 'tenant-1'),
      ).rejects.toThrow('Project not found');
    });

    it('should enforce tenant isolation on delete', async () => {
      prismaMock.project.findFirst.mockResolvedValue(null);

      await expect(
        service.delete('proj-1', 'tenant-other'),
      ).rejects.toThrow('Project not found');
    });
  });
});
