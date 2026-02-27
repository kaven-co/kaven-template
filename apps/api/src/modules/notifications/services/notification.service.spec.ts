import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationService } from './notification.service';

const prismaMock = vi.hoisted(() => ({
  inAppNotification: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    updateMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  userNotificationPreferences: {
    findUnique: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: prismaMock,
}));

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    service = new NotificationService();
  });

  // ─── createNotification ───────────────────────────────────────────────────

  describe('createNotification', () => {
    it('should create notification with correct data', async () => {
      const mockNotification = {
        id: 'notif-1',
        userId: 'user-1',
        type: 'system',
        priority: 'high',
        title: 'Test Notification',
        message: 'Test message',
        read: false,
      };
      prismaMock.inAppNotification.create.mockResolvedValue(mockNotification);

      const result = await service.createNotification({
        userId: 'user-1',
        type: 'system',
        priority: 'high',
        title: 'Test Notification',
        message: 'Test message',
      });

      expect(result.id).toBe('notif-1');
      expect(result.read).toBe(false);
      expect(prismaMock.inAppNotification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            type: 'system',
            priority: 'high',
            title: 'Test Notification',
            read: false,
          }),
        }),
      );
    });

    it('should default metadata to empty object when not provided', async () => {
      prismaMock.inAppNotification.create.mockResolvedValue({ id: 'notif-1' });

      await service.createNotification({
        userId: 'user-1',
        type: 'user',
        priority: 'low',
        title: 'No Metadata',
        message: 'msg',
      });

      expect(prismaMock.inAppNotification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ metadata: {} }),
        }),
      );
    });

    it('should pass actionUrl and actionText', async () => {
      prismaMock.inAppNotification.create.mockResolvedValue({ id: 'notif-1' });

      await service.createNotification({
        userId: 'user-1',
        type: 'security',
        priority: 'critical',
        title: 'Alert',
        message: 'msg',
        actionUrl: '/dashboard',
        actionText: 'View',
      });

      expect(prismaMock.inAppNotification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            actionUrl: '/dashboard',
            actionText: 'View',
          }),
        }),
      );
    });

    it('should propagate database errors', async () => {
      prismaMock.inAppNotification.create.mockRejectedValue(new Error('DB Error'));

      await expect(
        service.createNotification({
          userId: 'user-1',
          type: 'system',
          priority: 'low',
          title: 'Fail',
          message: 'msg',
        }),
      ).rejects.toThrow('DB Error');
    });
  });

  // ─── getNotifications ─────────────────────────────────────────────────────

  describe('getNotifications', () => {
    it('should return notifications for user', async () => {
      const mockNotifs = [{ id: 'n-1' }, { id: 'n-2' }];
      prismaMock.inAppNotification.findMany.mockResolvedValue(mockNotifs);

      const result = await service.getNotifications('user-1');

      expect(result).toHaveLength(2);
      expect(prismaMock.inAppNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
      );
    });

    it('should filter by type', async () => {
      prismaMock.inAppNotification.findMany.mockResolvedValue([]);

      await service.getNotifications('user-1', { type: 'security' });

      expect(prismaMock.inAppNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'security' }),
        }),
      );
    });

    it('should filter by priority', async () => {
      prismaMock.inAppNotification.findMany.mockResolvedValue([]);

      await service.getNotifications('user-1', { priority: 'critical' });

      expect(prismaMock.inAppNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ priority: 'critical' }),
        }),
      );
    });

    it('should filter by read status', async () => {
      prismaMock.inAppNotification.findMany.mockResolvedValue([]);

      await service.getNotifications('user-1', { read: false });

      expect(prismaMock.inAppNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ read: false }),
        }),
      );
    });

    it('should apply custom limit', async () => {
      prismaMock.inAppNotification.findMany.mockResolvedValue([]);

      await service.getNotifications('user-1', { limit: 10 });

      expect(prismaMock.inAppNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });

    it('should propagate database errors', async () => {
      prismaMock.inAppNotification.findMany.mockRejectedValue(new Error('DB Error'));

      await expect(
        service.getNotifications('user-1'),
      ).rejects.toThrow('DB Error');
    });
  });

  // ─── getUnreadCount ───────────────────────────────────────────────────────

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      prismaMock.inAppNotification.count.mockResolvedValue(5);

      const count = await service.getUnreadCount('user-1');

      expect(count).toBe(5);
      expect(prismaMock.inAppNotification.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', read: false },
      });
    });

    it('should return 0 on error', async () => {
      prismaMock.inAppNotification.count.mockRejectedValue(new Error('DB Error'));

      const count = await service.getUnreadCount('user-1');

      expect(count).toBe(0);
    });
  });

  // ─── markAsRead ───────────────────────────────────────────────────────────

  describe('markAsRead', () => {
    it('should mark notification as read for specific user', async () => {
      prismaMock.inAppNotification.updateMany.mockResolvedValue({ count: 1 });

      await service.markAsRead('notif-1', 'user-1');

      expect(prismaMock.inAppNotification.updateMany).toHaveBeenCalledWith({
        where: { id: 'notif-1', userId: 'user-1' },
        data: { read: true },
      });
    });

    it('should enforce user ownership when marking as read', async () => {
      prismaMock.inAppNotification.updateMany.mockResolvedValue({ count: 0 });

      await service.markAsRead('notif-1', 'user-other');

      expect(prismaMock.inAppNotification.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-other' }),
        }),
      );
    });
  });

  // ─── markAllAsRead ────────────────────────────────────────────────────────

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      prismaMock.inAppNotification.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead('user-1');

      expect(result.count).toBe(3);
      expect(prismaMock.inAppNotification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', read: false },
        data: { read: true },
      });
    });
  });

  // ─── deleteNotification ───────────────────────────────────────────────────

  describe('deleteNotification', () => {
    it('should delete notification for user', async () => {
      prismaMock.inAppNotification.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.deleteNotification('notif-1', 'user-1');

      expect(result.count).toBe(1);
      expect(prismaMock.inAppNotification.deleteMany).toHaveBeenCalledWith({
        where: { id: 'notif-1', userId: 'user-1' },
      });
    });

    it('should throw when notification not found or access denied', async () => {
      prismaMock.inAppNotification.deleteMany.mockResolvedValue({ count: 0 });

      await expect(
        service.deleteNotification('notif-nonexistent', 'user-1'),
      ).rejects.toThrow('Notification not found or access denied');
    });

    it('should enforce user ownership on delete', async () => {
      prismaMock.inAppNotification.deleteMany.mockResolvedValue({ count: 0 });

      await expect(
        service.deleteNotification('notif-1', 'user-other'),
      ).rejects.toThrow('Notification not found or access denied');
    });
  });

  // ─── getUserPreferences ───────────────────────────────────────────────────

  describe('getUserPreferences', () => {
    it('should return existing preferences', async () => {
      const mockPrefs = { userId: 'user-1', inAppEnabled: true, emailEnabled: true };
      prismaMock.userNotificationPreferences.findUnique.mockResolvedValue(mockPrefs);

      const result = await service.getUserPreferences('user-1');

      expect(result).toEqual(mockPrefs);
      expect(prismaMock.userNotificationPreferences.create).not.toHaveBeenCalled();
    });

    it('should create default preferences when not found', async () => {
      prismaMock.userNotificationPreferences.findUnique.mockResolvedValue(null);
      prismaMock.userNotificationPreferences.create.mockResolvedValue({
        userId: 'user-1',
        inAppEnabled: true,
        emailEnabled: false,
        pushEnabled: false,
      });

      const result = await service.getUserPreferences('user-1');

      expect(result.inAppEnabled).toBe(true);
      expect(result.emailEnabled).toBe(false);
      expect(prismaMock.userNotificationPreferences.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          inAppEnabled: true,
          emailEnabled: false,
          pushEnabled: false,
        },
      });
    });
  });

  // ─── updateUserPreferences ────────────────────────────────────────────────

  describe('updateUserPreferences', () => {
    it('should upsert preferences', async () => {
      prismaMock.userNotificationPreferences.upsert.mockResolvedValue({
        userId: 'user-1',
        inAppEnabled: true,
        emailEnabled: true,
        pushEnabled: false,
      });

      const result = await service.updateUserPreferences('user-1', {
        emailEnabled: true,
      });

      expect(result.emailEnabled).toBe(true);
      expect(prismaMock.userNotificationPreferences.upsert).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        update: { emailEnabled: true },
        create: expect.objectContaining({
          userId: 'user-1',
          emailEnabled: true,
        }),
      });
    });

    it('should use defaults for unspecified fields on create path', async () => {
      prismaMock.userNotificationPreferences.upsert.mockResolvedValue({
        userId: 'user-1',
        inAppEnabled: true,
        emailEnabled: false,
        pushEnabled: true,
      });

      await service.updateUserPreferences('user-1', { pushEnabled: true });

      expect(prismaMock.userNotificationPreferences.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            inAppEnabled: true,
            emailEnabled: false,
            pushEnabled: true,
          }),
        }),
      );
    });
  });
});
