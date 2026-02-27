import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InviteService } from './invite.service';

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  tenantInvite: {
    findFirst: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
}));

const emailMock = vi.hoisted(() => ({
  send: vi.fn(),
}));

vi.mock('../../../lib/prisma', () => ({
  default: prismaMock,
}));

vi.mock('../../../lib/email', () => ({
  emailServiceV2: emailMock,
}));

vi.mock('../../../lib/email/types', () => ({
  EmailType: { TRANSACTIONAL: 'TRANSACTIONAL' },
}));

vi.mock('../../../lib/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed-password'),
}));

describe('InviteService', () => {
  let service: InviteService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    service = new InviteService(prismaMock as any);
  });

  // ─── createInvite ─────────────────────────────────────────────────────────

  describe('createInvite', () => {
    it('should create invite and send email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.tenantInvite.findFirst.mockResolvedValue(null);
      prismaMock.tenantInvite.create.mockResolvedValue({
        id: 'invite-1',
        token: 'abc123',
        email: 'newuser@test.com',
        tenantId: 'tenant-1',
        invitedBy: { name: 'Admin User' },
        invitedById: 'admin-1',
        tenant: { name: 'Test Corp' },
      } as any);

      const result = await service.createInvite({
        email: 'newuser@test.com',
        role: 'MEMBER' as any,
        tenantId: 'tenant-1',
        invitedById: 'admin-1',
      });

      expect(prismaMock.tenantInvite.create).toHaveBeenCalled();
      expect(emailMock.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'newuser@test.com',
          template: 'invite',
        }),
      );
      expect(result.id).toBe('invite-1');
    });

    it('should prevent SUPER_ADMIN invite with tenantId', async () => {
      await expect(
        service.createInvite({
          email: 'superadmin@sys.com',
          role: 'SUPER_ADMIN' as any,
          tenantId: 'tenant-1',
          invitedById: 'admin-1',
        }),
      ).rejects.toThrow('SUPER_ADMIN invites cannot be associated with a tenant');
    });

    it('should require tenantId for ADMIN role', async () => {
      await expect(
        service.createInvite({
          email: 'admin@test.com',
          role: 'ADMIN' as any,
          invitedById: 'admin-1',
        }),
      ).rejects.toThrow('ADMIN and MEMBER invites require a tenantId');
    });

    it('should require tenantId for MEMBER role', async () => {
      await expect(
        service.createInvite({
          email: 'member@test.com',
          role: 'MEMBER' as any,
          invitedById: 'admin-1',
        }),
      ).rejects.toThrow('ADMIN and MEMBER invites require a tenantId');
    });

    it('should throw if user already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.createInvite({
          email: 'existing@test.com',
          role: 'MEMBER' as any,
          tenantId: 'tenant-1',
          invitedById: 'admin-1',
        }),
      ).rejects.toThrow('Usuário já existe');
    });

    it('should throw if pending invite already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.tenantInvite.findFirst.mockResolvedValue({
        id: 'existing-invite',
        email: 'newuser@test.com',
      });

      await expect(
        service.createInvite({
          email: 'newuser@test.com',
          role: 'MEMBER' as any,
          tenantId: 'tenant-1',
          invitedById: 'admin-1',
        }),
      ).rejects.toThrow('Já existe um convite ativo');
    });

    it('should allow SUPER_ADMIN invite without tenantId', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.tenantInvite.findFirst.mockResolvedValue(null);
      prismaMock.tenantInvite.create.mockResolvedValue({
        id: 'invite-1',
        token: 'token123',
        email: 'super@test.com',
        tenantId: null,
        invitedBy: { name: 'Root' },
        invitedById: 'root-1',
        tenant: null,
      } as any);

      const result = await service.createInvite({
        email: 'super@test.com',
        role: 'SUPER_ADMIN' as any,
        invitedById: 'root-1',
      });

      expect(result.id).toBe('invite-1');
    });
  });

  // ─── listPendingInvites ───────────────────────────────────────────────────

  describe('listPendingInvites', () => {
    it('should return pending invites', async () => {
      prismaMock.tenantInvite.findMany.mockResolvedValue([
        { id: 'invite-1', email: 'user1@test.com' },
        { id: 'invite-2', email: 'user2@test.com' },
      ]);

      const result = await service.listPendingInvites({ tenantId: 'tenant-1' });

      expect(result).toHaveLength(2);
      expect(prismaMock.tenantInvite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            usedAt: null,
            tenantId: 'tenant-1',
            expiresAt: expect.any(Object),
          }),
        }),
      );
    });

    it('should filter by role', async () => {
      prismaMock.tenantInvite.findMany.mockResolvedValue([]);

      await service.listPendingInvites({ role: 'ADMIN' as any });

      expect(prismaMock.tenantInvite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ role: 'ADMIN' }),
        }),
      );
    });

    it('should filter by email (case insensitive)', async () => {
      prismaMock.tenantInvite.findMany.mockResolvedValue([]);

      await service.listPendingInvites({ email: 'test@' });

      expect(prismaMock.tenantInvite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            email: { contains: 'test@', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should order by createdAt descending', async () => {
      prismaMock.tenantInvite.findMany.mockResolvedValue([]);

      await service.listPendingInvites();

      expect(prismaMock.tenantInvite.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
      );
    });
  });

  // ─── cancelInvite ─────────────────────────────────────────────────────────

  describe('cancelInvite', () => {
    it('should cancel invite by setting expiresAt to now', async () => {
      prismaMock.tenantInvite.findUnique.mockResolvedValue({
        id: 'invite-1',
        invitedById: 'admin-1',
        usedAt: null,
      });
      prismaMock.tenantInvite.update.mockResolvedValue({
        id: 'invite-1',
        expiresAt: expect.any(Date),
      });

      await service.cancelInvite('invite-1', 'admin-1', 'ADMIN' as any);

      expect(prismaMock.tenantInvite.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'invite-1' },
          data: { expiresAt: expect.any(Date) },
        }),
      );
    });

    it('should throw when invite not found', async () => {
      prismaMock.tenantInvite.findUnique.mockResolvedValue(null);

      await expect(
        service.cancelInvite('invite-nonexistent', 'admin-1', 'ADMIN' as any),
      ).rejects.toThrow('Convite não encontrado');
    });

    it('should throw when non-SUPER_ADMIN tries to cancel another user invite', async () => {
      prismaMock.tenantInvite.findUnique.mockResolvedValue({
        id: 'invite-1',
        invitedById: 'admin-other',
        usedAt: null,
      });

      await expect(
        service.cancelInvite('invite-1', 'admin-1', 'ADMIN' as any),
      ).rejects.toThrow('Não autorizado');
    });

    it('should allow SUPER_ADMIN to cancel any invite', async () => {
      prismaMock.tenantInvite.findUnique.mockResolvedValue({
        id: 'invite-1',
        invitedById: 'admin-other',
        usedAt: null,
      });
      prismaMock.tenantInvite.update.mockResolvedValue({ id: 'invite-1' });

      await service.cancelInvite('invite-1', 'super-admin-1', 'SUPER_ADMIN' as any);

      expect(prismaMock.tenantInvite.update).toHaveBeenCalled();
    });

    it('should throw when invite has already been used', async () => {
      prismaMock.tenantInvite.findUnique.mockResolvedValue({
        id: 'invite-1',
        invitedById: 'admin-1',
        usedAt: new Date(),
      });

      await expect(
        service.cancelInvite('invite-1', 'admin-1', 'ADMIN' as any),
      ).rejects.toThrow('Não é possível cancelar um convite que já foi usado');
    });
  });

  // ─── validateInvite ───────────────────────────────────────────────────────

  describe('validateInvite', () => {
    it('should validate a valid token', async () => {
      prismaMock.tenantInvite.findUnique.mockResolvedValue({
        id: 'invite-1',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 100000),
        usedAt: null,
        tenant: { name: 'Test Corp' },
      });

      const result = await service.validateInvite('valid-token');

      expect(result.id).toBe('invite-1');
    });

    it('should throw when token is invalid', async () => {
      prismaMock.tenantInvite.findUnique.mockResolvedValue(null);

      await expect(
        service.validateInvite('invalid-token'),
      ).rejects.toThrow('Token de convite inválido');
    });

    it('should throw when invite already used', async () => {
      prismaMock.tenantInvite.findUnique.mockResolvedValue({
        id: 'invite-1',
        token: 'used-token',
        expiresAt: new Date(Date.now() + 100000),
        usedAt: new Date(),
      });

      await expect(
        service.validateInvite('used-token'),
      ).rejects.toThrow('Convite já utilizado');
    });

    it('should throw when invite is expired', async () => {
      prismaMock.tenantInvite.findUnique.mockResolvedValue({
        id: 'invite-1',
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 100000),
        usedAt: null,
      });

      await expect(
        service.validateInvite('expired-token'),
      ).rejects.toThrow('Convite expirado');
    });
  });

  // ─── acceptInvite ─────────────────────────────────────────────────────────

  describe('acceptInvite', () => {
    it('should create user and mark invite as used', async () => {
      // Validate invite step
      prismaMock.tenantInvite.findUnique.mockResolvedValue({
        id: 'invite-1',
        token: 'valid-token',
        email: 'newuser@test.com',
        role: 'MEMBER',
        tenantId: 'tenant-1',
        expiresAt: new Date(Date.now() + 100000),
        usedAt: null,
        tenant: { name: 'Test Corp' },
      });

      prismaMock.user.create.mockResolvedValue({
        id: 'new-user-1',
        email: 'newuser@test.com',
        name: 'New User',
      });
      prismaMock.tenantInvite.update.mockResolvedValue({});

      const result = await service.acceptInvite('valid-token', {
        password: 'StrongPass123!',
        name: 'New User',
      });

      expect(result.email).toBe('newuser@test.com');
      expect(prismaMock.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'newuser@test.com',
            name: 'New User',
            role: 'MEMBER',
            tenantId: 'tenant-1',
            status: 'ACTIVE',
            emailVerified: true,
          }),
        }),
      );
      expect(prismaMock.tenantInvite.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'invite-1' },
          data: { usedAt: expect.any(Date) },
        }),
      );
    });

    it('should throw when token is invalid during accept', async () => {
      prismaMock.tenantInvite.findUnique.mockResolvedValue(null);

      await expect(
        service.acceptInvite('invalid-token', {
          password: 'Pass123!',
          name: 'User',
        }),
      ).rejects.toThrow('Token de convite inválido');
    });
  });
});
