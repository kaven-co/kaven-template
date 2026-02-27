import { describe, it, expect, vi, beforeEach } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  task: {
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
    task = prismaMock.task;
  },
}));

import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TasksService();
  });

  // ─── findAll ────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated tasks for a tenant', async () => {
      const mockTasks = [
        { id: 'task-1', title: 'Task One', tenantId: 'tenant-1' },
      ];
      prismaMock.task.findMany.mockResolvedValue(mockTasks);
      prismaMock.task.count.mockResolvedValue(1);

      const result = await service.findAll('tenant-1');

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
    });

    it('should filter by projectId when provided', async () => {
      prismaMock.task.findMany.mockResolvedValue([]);
      prismaMock.task.count.mockResolvedValue(0);

      await service.findAll('tenant-1', 'proj-1');

      expect(prismaMock.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-1',
            projectId: 'proj-1',
          }),
        }),
      );
    });

    it('should filter by spaceId when provided', async () => {
      prismaMock.task.findMany.mockResolvedValue([]);
      prismaMock.task.count.mockResolvedValue(0);

      await service.findAll('tenant-1', undefined, 'space-1');

      expect(prismaMock.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            project: { spaceId: 'space-1' },
          }),
        }),
      );
    });

    it('should apply pagination correctly', async () => {
      prismaMock.task.findMany.mockResolvedValue([]);
      prismaMock.task.count.mockResolvedValue(100);

      const result = await service.findAll('tenant-1', undefined, undefined, 3, 20);

      expect(result.meta.page).toBe(3);
      expect(result.meta.totalPages).toBe(5);
      expect(prismaMock.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 40, take: 20 }),
      );
    });

    it('should use default page=1 and limit=20', async () => {
      prismaMock.task.findMany.mockResolvedValue([]);
      prismaMock.task.count.mockResolvedValue(0);

      await service.findAll('tenant-1');

      expect(prismaMock.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('should order by createdAt descending', async () => {
      prismaMock.task.findMany.mockResolvedValue([]);
      prismaMock.task.count.mockResolvedValue(0);

      await service.findAll('tenant-1');

      expect(prismaMock.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });
  });

  // ─── findOne ────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return task by id and tenantId', async () => {
      const mockTask = { id: 'task-1', title: 'Task', tenantId: 'tenant-1' };
      prismaMock.task.findFirst.mockResolvedValue(mockTask);

      const result = await service.findOne('task-1', 'tenant-1');

      expect(result).toEqual(mockTask);
      expect(prismaMock.task.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task-1', tenantId: 'tenant-1' },
        }),
      );
    });

    it('should return null if task not found', async () => {
      prismaMock.task.findFirst.mockResolvedValue(null);

      const result = await service.findOne('task-nonexistent', 'tenant-1');
      expect(result).toBeNull();
    });

    it('should enforce tenant isolation', async () => {
      prismaMock.task.findFirst.mockResolvedValue(null);

      await service.findOne('task-1', 'tenant-B');

      expect(prismaMock.task.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 'tenant-B' }),
        }),
      );
    });
  });

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create a task with tenantId and userId', async () => {
      const mockCreated = { id: 'task-new', title: 'New Task', tenantId: 'tenant-1' };
      prismaMock.task.create.mockResolvedValue(mockCreated);

      const result = await service.create(
        { title: 'New Task', projectId: 'proj-1' },
        'tenant-1',
        'user-1',
      );

      expect(result).toEqual(mockCreated);
      expect(prismaMock.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 'tenant-1',
            createdById: 'user-1',
            title: 'New Task',
            projectId: 'proj-1',
          }),
        }),
      );
    });

    it('should pass additional fields like status and priority', async () => {
      prismaMock.task.create.mockResolvedValue({ id: 'task-1' });

      await service.create(
        { title: 'Task', projectId: 'proj-1', status: 'TODO', priority: 'HIGH' },
        'tenant-1',
        'user-1',
      );

      expect(prismaMock.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'TODO',
            priority: 'HIGH',
          }),
        }),
      );
    });
  });

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update task when it exists', async () => {
      prismaMock.task.findFirst.mockResolvedValue({ id: 'task-1', tenantId: 'tenant-1' });
      prismaMock.task.update.mockResolvedValue({ id: 'task-1', title: 'Updated' });

      const result = await service.update('task-1', { title: 'Updated' }, 'tenant-1');

      expect(result.title).toBe('Updated');
    });

    it('should throw error when task not found', async () => {
      prismaMock.task.findFirst.mockResolvedValue(null);

      await expect(
        service.update('task-xxx', { title: 'Hack' }, 'tenant-1'),
      ).rejects.toThrow('Task not found');
    });

    it('should enforce tenant isolation on update', async () => {
      prismaMock.task.findFirst.mockResolvedValue(null);

      await expect(
        service.update('task-1', { title: 'Hack' }, 'tenant-other'),
      ).rejects.toThrow('Task not found');
    });
  });

  // ─── delete ─────────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('should delete task when it exists', async () => {
      prismaMock.task.findFirst.mockResolvedValue({ id: 'task-1', tenantId: 'tenant-1' });
      prismaMock.task.delete.mockResolvedValue({ id: 'task-1' });

      const result = await service.delete('task-1', 'tenant-1');

      expect(result).toEqual({ id: 'task-1' });
      expect(prismaMock.task.delete).toHaveBeenCalledWith({
        where: { id: 'task-1' },
      });
    });

    it('should throw error when task not found', async () => {
      prismaMock.task.findFirst.mockResolvedValue(null);

      await expect(
        service.delete('task-xxx', 'tenant-1'),
      ).rejects.toThrow('Task not found');
    });

    it('should enforce tenant isolation on delete', async () => {
      prismaMock.task.findFirst.mockResolvedValue(null);

      await expect(
        service.delete('task-1', 'tenant-other'),
      ).rejects.toThrow('Task not found');
    });
  });
});
