import { describe, it, expect, vi, beforeEach } from 'vitest';
import { securityRequestService } from './security-request.service';
import { SecurityRequestStatus, Role } from '@prisma/client';

const prismaMock = vi.hoisted(() => ({
  securityRequest: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  user: {
    findMany: vi.fn(),
  }
}));

const notificationMock = vi.hoisted(() => ({
  createNotification: vi.fn(),
}));

const userMock = vi.hoisted(() => ({
  resetTwoFactor: vi.fn(),
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: prismaMock,
}));

vi.mock('../../notifications/services/notification.service', () => ({
  notificationService: notificationMock,
}));

vi.mock('../../users/services/user.service', () => ({
  userService: userMock,
}));

describe('SecurityRequestService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createRequest', () => {
    it('should create request and notify super admins', async () => {
      prismaMock.securityRequest.create.mockResolvedValue({ id: '1', targetUser: { name: 'Target' } });
      prismaMock.user.findMany.mockResolvedValue([{ id: 'admin1' }]);

      await securityRequestService.createRequest('u1', {
        type: '2FA_RESET',
        targetUserId: 'u2',
        justification: 'Lost phone'
      });

      expect(prismaMock.securityRequest.create).toHaveBeenCalled();
      expect(notificationMock.createNotification).toHaveBeenCalled();
    });
  });

  describe('reviewRequest', () => {
    it('should approve request', async () => {
      prismaMock.securityRequest.findUnique.mockResolvedValue({ id: '1', status: 'PENDING' });
      prismaMock.securityRequest.update.mockResolvedValue({ id: '1', status: 'APPROVED' });

      const result = await securityRequestService.reviewRequest('admin1', '1', { action: 'APPROVE' });
      expect(result.status).toBe('APPROVED');
    });

    it('should reject request', async () => {
        prismaMock.securityRequest.findUnique.mockResolvedValue({ id: '1', status: 'PENDING' });
        prismaMock.securityRequest.update.mockResolvedValue({ id: '1', status: 'REJECTED' });
  
        const result = await securityRequestService.reviewRequest('admin1', '1', { action: 'REJECT' });
        expect(result.status).toBe('REJECTED');
    });

    it('should throw if not pending', async () => {
        prismaMock.securityRequest.findUnique.mockResolvedValue({ id: '1', status: 'APPROVED' });
        await expect(securityRequestService.reviewRequest('admin1', '1', { action: 'APPROVE' }))
            .rejects.toThrow('já processada');
    });
  });

  describe('reviewRequest — error paths', () => {
    it('should throw when request not found', async () => {
      prismaMock.securityRequest.findUnique.mockResolvedValue(null);

      await expect(
        securityRequestService.reviewRequest('admin1', 'nonexistent', { action: 'APPROVE' })
      ).rejects.toThrow('não encontrada');
    });
  });

  describe('executeRequest', () => {
    it('should execute 2FA reset', async () => {
      prismaMock.securityRequest.findUnique.mockResolvedValue({
          id: '1',
          status: 'APPROVED',
          type: '2FA_RESET',
          targetUserId: 'u2'
      });

      await securityRequestService.executeRequest('admin1', '1');
      expect(userMock.resetTwoFactor).toHaveBeenCalledWith('u2', 'admin1');
      expect(prismaMock.securityRequest.update).toHaveBeenCalledWith(expect.objectContaining({
          data: expect.objectContaining({ status: 'EXECUTED' })
      }));
    });

    it('should throw when request not found for execution', async () => {
      prismaMock.securityRequest.findUnique.mockResolvedValue(null);

      await expect(
        securityRequestService.executeRequest('admin1', 'nonexistent')
      ).rejects.toThrow('não encontrada');
    });

    it('should throw when request is not approved for execution', async () => {
      prismaMock.securityRequest.findUnique.mockResolvedValue({
        id: '1',
        status: 'PENDING',
        type: '2FA_RESET',
        targetUserId: 'u2',
      });

      await expect(
        securityRequestService.executeRequest('admin1', '1')
      ).rejects.toThrow('aprovadas');
    });
  });
});
