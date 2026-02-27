import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from './user.service';
import { TEST_EXISTING_EMAIL, TEST_PASSWORD, TEST_USER_EMAIL } from '../../../../test/constants';

// Mocks
const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  tenant: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  default: prismaMock,
}));

vi.mock('../../../lib/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed_password'),
}));

vi.mock('../../audit/services/audit.service', () => ({
  auditService: {
    log: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('sharp', () => ({
  default: vi.fn().mockReturnValue({
    resize: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    toFile: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('node:path', () => ({
  join: vi.fn((...args: string[]) => args.join('/')),
}));

vi.mock('node:crypto', () => ({
  randomBytes: vi.fn().mockReturnValue(Buffer.from('abcdef1234567890', 'hex')),
}));

import { hashPassword } from '../../../lib/password';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    userService = new UserService();
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      const input = {
        email: TEST_USER_EMAIL,
        password: TEST_PASSWORD,
        name: 'New User',
        role: 'USER' as const,
        status: 'ACTIVE' as const,
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.user.create.mockResolvedValue({
        id: 'user-123',
        email: input.email,
        name: input.name,
        role: input.role,
        tenantId: null,
      });

      // Act
      const result = await userService.createUser(input);

      // Assert
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: input.email } });
      expect(hashPassword).toHaveBeenCalledWith(input.password);
      expect(prismaMock.user.create).toHaveBeenCalled();
      expect(result.email).toBe(input.email);
    });

    it('should throw error if email already exists', async () => {
      const input = {
        email: TEST_EXISTING_EMAIL,
        name: 'Existing User',
        password: TEST_PASSWORD,
        role: 'USER' as const,
        status: 'ACTIVE' as const,
      };

      prismaMock.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(userService.createUser(input)).rejects.toThrow('Email já cadastrado');
      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('deve criar tenant próprio quando createOwnTenant = true', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null); // email não existe
      prismaMock.tenant.findUnique.mockResolvedValue(null); // slug disponível
      prismaMock.tenant.create.mockResolvedValue({ id: 'new-tenant-123' });
      prismaMock.user.create.mockResolvedValue({
        id: 'user-123',
        email: TEST_USER_EMAIL,
        name: 'João Silva',
        role: 'USER',
        tenantId: 'new-tenant-123',
        createdAt: new Date(),
      });

      const result = await userService.createUser({
        email: TEST_USER_EMAIL,
        password: TEST_PASSWORD,
        name: 'João Silva',
        role: 'USER',
        status: 'ACTIVE',
        createOwnTenant: true,
      } as any);

      expect(prismaMock.tenant.create).toHaveBeenCalled();
      expect(result.tenantId).toBe('new-tenant-123');
    });

    it('deve gerar slug único quando slug já existe', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.tenant.findUnique
        .mockResolvedValueOnce({ id: 'existing' }) // slug 'joao-silva' existe
        .mockResolvedValueOnce(null);               // slug 'joao-silva-1' disponível
      prismaMock.tenant.create.mockResolvedValue({ id: 'new-tenant-456' });
      prismaMock.user.create.mockResolvedValue({
        id: 'user-456',
        email: TEST_USER_EMAIL,
        name: 'João Silva',
        role: 'USER',
        tenantId: 'new-tenant-456',
        createdAt: new Date(),
      });

      await userService.createUser({
        email: TEST_USER_EMAIL,
        password: TEST_PASSWORD,
        name: 'João Silva',
        role: 'USER',
        status: 'ACTIVE',
        createOwnTenant: true,
      } as any);

      // tenant.create chamado com slug '-1'
      expect(prismaMock.tenant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slug: 'joao-silva-1' }),
        })
      );
    });
  });

  describe('listUsers', () => {
    it('should return paginated users', async () => {
      // Arrange
      const mockUsers = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
      ];
      const total = 20;

      prismaMock.user.findMany.mockResolvedValue(mockUsers);
      prismaMock.user.count.mockResolvedValue(total);

      // Act
      const result = await userService.listUsers(undefined, 1, 10);

      // Assert
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
        skip: 0,
        take: 10,
      }));
      expect(result.users).toEqual(mockUsers);
      expect(result.pagination.total).toBe(total);
      expect(result.pagination.totalPages).toBe(2);
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user', async () => {
      const userId = 'user-123';
      prismaMock.user.findUnique.mockResolvedValue({ id: userId, email: 'user@test.com', deletedAt: null });
      prismaMock.user.update.mockResolvedValue({ id: userId });

      await userService.deleteUser(userId);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
          status: 'BANNED',
          email: expect.stringContaining('deleted_'),
        }),
      });
    });

    it('should throw error if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      await expect(userService.deleteUser('non-existent')).rejects.toThrow('Usuário não encontrado');
    });

    it('should throw error if user already deleted', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-123', deletedAt: new Date() });
      await expect(userService.deleteUser('user-123')).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('getStats', () => {
    it('deve retornar estatísticas sem filtro de tenant', async () => {
      prismaMock.user.count
        .mockResolvedValueOnce(100)  // total
        .mockResolvedValueOnce(80)   // active
        .mockResolvedValueOnce(10)   // pending
        .mockResolvedValueOnce(5)    // banned
        .mockResolvedValueOnce(5);   // rejected

      const result = await userService.getStats();

      expect(result.total).toBe(100);
      expect(result.active).toBe(80);
      expect(result.pending).toBe(10);
    });

    it('deve retornar estatísticas filtradas por tenant', async () => {
      prismaMock.user.count.mockResolvedValue(0);

      await userService.getStats('tenant-123');

      expect(prismaMock.user.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 'tenant-123' }),
        })
      );
    });
  });

  describe('listUsers', () => {
    it('deve filtrar por tenantId', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.user.count.mockResolvedValue(0);

      await userService.listUsers('tenant-123');

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 'tenant-123' }),
        })
      );
    });

    it('deve filtrar por status', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.user.count.mockResolvedValue(0);

      await userService.listUsers(undefined, 1, 10, undefined, 'ACTIVE');

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'ACTIVE' }),
        })
      );
    });

    it('deve filtrar por search (nome ou email)', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);
      prismaMock.user.count.mockResolvedValue(0);

      await userService.listUsers(undefined, 1, 10, 'João');

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ name: expect.objectContaining({ contains: 'João' }) }),
            ]),
          }),
        })
      );
    });
  });

  describe('getUserById', () => {
    it('deve retornar usuário existente', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
        name: 'Test User',
        role: 'USER',
        deletedAt: null,
        metadata: null,
      };
      prismaMock.user.findFirst.mockResolvedValue(mockUser);

      const result = await userService.getUserById('user-123');

      expect(result.id).toBe('user-123');
    });

    it('deve lançar erro se usuário não encontrado', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(userService.getUserById('non-existent')).rejects.toThrow('Usuário não encontrado');
    });

    it('deve lançar erro se usuário deletado (soft delete)', async () => {
      prismaMock.user.findFirst.mockResolvedValue({
        id: 'user-123',
        deletedAt: new Date(),
      });

      await expect(userService.getUserById('user-123')).rejects.toThrow('Usuário não encontrado');
    });

    it('deve filtrar por tenantId (isolamento multi-tenant)', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);

      await expect(userService.getUserById('user-123', 'tenant-B')).rejects.toThrow();

      expect(prismaMock.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'user-123', tenantId: 'tenant-B' }),
        })
      );
    });
  });

  describe('updateUser', () => {
    const mockExistingUser = {
      id: 'user-123',
      email: 'user@test.com',
      name: 'Old Name',
      tenantId: 'tenant-123',
      deletedAt: null,
      metadata: null,
    };

    it('deve atualizar usuário com sucesso', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce(mockExistingUser);  // existingUser check
      prismaMock.user.update.mockResolvedValue({
        ...mockExistingUser,
        name: 'New Name',
      });

      const result = await userService.updateUser('user-123', { name: 'New Name' });

      expect(result.name).toBe('New Name');
    });

    it('deve lançar erro se usuário não encontrado', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        userService.updateUser('non-existent', { name: 'Name' })
      ).rejects.toThrow('Usuário não encontrado');
    });

    it('deve lançar erro se email já está em uso', async () => {
      prismaMock.user.findUnique
        .mockResolvedValueOnce(mockExistingUser)          // existingUser
        .mockResolvedValueOnce({ id: 'other-user' });     // email conflict check

      await expect(
        userService.updateUser('user-123', { email: 'other@test.com' })
      ).rejects.toThrow('Email já está em uso');
    });
  });

  describe('getCurrentUser', () => {
    it('deve retornar usuário autenticado', async () => {
      prismaMock.user.findFirst.mockResolvedValue({
        id: 'user-123',
        email: 'user@test.com',
        name: 'Test User',
        deletedAt: null,
        metadata: null,
      });

      const result = await userService.getCurrentUser('user-123');

      expect(result.id).toBe('user-123');
    });
  });

  describe('uploadAvatar', () => {
    it('deve lançar erro se usuário não encontrado', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(
        userService.uploadAvatar('non-existent', Buffer.from(''), 'avatar.jpg')
      ).rejects.toThrow('Usuário não encontrado');
    });

    it('deve fazer upload de avatar com sucesso', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-123', tenantId: 'tenant-1' });
      prismaMock.user.update.mockResolvedValue({ id: 'user-123' });

      const result = await userService.uploadAvatar(
        'user-123',
        Buffer.from('fake-image-data'),
        'avatar.jpg'
      );

      expect(result).toContain('/uploads/avatars/');
      expect(result).toContain('_256.webp');
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ avatar: expect.stringContaining('/uploads/avatars/') }),
        })
      );
    });

    it('deve criar avatar com escopo de tenant para isolamento', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-123', tenantId: 'tenant-abc' });
      prismaMock.user.update.mockResolvedValue({ id: 'user-123' });

      const result = await userService.uploadAvatar(
        'user-123',
        Buffer.from('fake-image-data'),
        'avatar.jpg'
      );

      expect(result).toContain('tenant-abc');
    });

    it('deve usar escopo global quando user não tem tenant', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-123', tenantId: null });
      prismaMock.user.update.mockResolvedValue({ id: 'user-123' });

      const result = await userService.uploadAvatar(
        'user-123',
        Buffer.from('fake-image-data'),
        'avatar.jpg'
      );

      expect(result).toContain('/global/');
    });

    it('deve produzir duas imagens (128x128 thumbnail + 256x256 profile)', async () => {
      const sharp = (await import('sharp')).default;

      prismaMock.user.findUnique.mockResolvedValue({ id: 'user-123', tenantId: 'tenant-1' });
      prismaMock.user.update.mockResolvedValue({ id: 'user-123' });

      await userService.uploadAvatar(
        'user-123',
        Buffer.from('fake-image-data'),
        'avatar.jpg'
      );

      // sharp should have been called twice
      expect(sharp).toHaveBeenCalledTimes(2);
    });
  });

  describe('resetTwoFactor', () => {
    it('deve resetar 2FA com sucesso', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        twoFactorEnabled: true,
      });
      prismaMock.user.update.mockResolvedValue({ id: 'user-123' });

      const result = await userService.resetTwoFactor('user-123');

      expect(result).toBe(true);
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            twoFactorEnabled: false,
            twoFactorSecret: null,
          }),
        })
      );
    });

    it('deve lançar erro se usuário não encontrado', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(userService.resetTwoFactor('non-existent')).rejects.toThrow('Usuário não encontrado');
    });
  });
});
