import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PasswordResetService } from './password-reset.service';

// Mocks
const prismaMock = {
  user: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  passwordResetToken: {
    create: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
};

vi.mock('../../../lib/email', () => ({
  emailServiceV2: {
    send: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../../lib/password', () => ({
  hashPassword: vi.fn().mockResolvedValue('hashed_new_password'),
  validatePasswordStrength: vi.fn().mockReturnValue({ isValid: true }),
}));

vi.mock('node:crypto', () => ({
  default: {
    randomBytes: vi.fn().mockReturnValue({
      toString: vi.fn().mockReturnValue('abc123token'),
    }),
    createHash: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        digest: vi.fn().mockReturnValue('hashed_token_value'),
      }),
    }),
  },
}));

vi.mock('date-fns', () => ({
  addHours: vi.fn().mockReturnValue(new Date('2026-03-01T01:00:00Z')),
}));

import { emailServiceV2 } from '../../../lib/email';
import { hashPassword, validatePasswordStrength } from '../../../lib/password';

describe('PasswordResetService', () => {
  let service: PasswordResetService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PasswordResetService(prismaMock as any);
  });

  // ─── requestReset ──────────────────────────────────────────────────────────

  describe('requestReset', () => {
    it('deve enviar email de reset quando usuário existe', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
        name: 'Test User',
        tenantId: 'tenant-123',
      };
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      prismaMock.passwordResetToken.create.mockResolvedValue({ id: 'token-1' });

      const result = await service.requestReset('user@test.com');

      expect(result.message).toBe('Se o e-mail existir, um link de recuperação será enviado');
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: 'user@test.com' } });
      expect(prismaMock.passwordResetToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-123',
            token: 'hashed_token_value',
          }),
        }),
      );
      expect(emailServiceV2.send).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@test.com',
          template: 'password-reset',
          userId: 'user-123',
        }),
      );
    });

    it('deve retornar mensagem genérica quando email não existe — não revela se email existe', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await service.requestReset('unknown@test.com');

      expect(result.message).toBe('Se o e-mail existir, um link de recuperação será enviado');
      expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
      expect(emailServiceV2.send).not.toHaveBeenCalled();
    });

    it('deve criar token com expiração de 1 hora', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'user@test.com',
        name: 'User',
        tenantId: null,
      });
      prismaMock.passwordResetToken.create.mockResolvedValue({ id: 'token-1' });

      await service.requestReset('user@test.com');

      expect(prismaMock.passwordResetToken.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            expiresAt: expect.any(Date),
          }),
        }),
      );
    });

    it('deve incluir tenantId na chamada de email quando usuário tem tenant', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'user@test.com',
        name: 'User',
        tenantId: 'tenant-abc',
      });
      prismaMock.passwordResetToken.create.mockResolvedValue({ id: 'token-1' });

      await service.requestReset('user@test.com');

      expect(emailServiceV2.send).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-abc',
        }),
      );
    });
  });

  // ─── resetPassword ─────────────────────────────────────────────────────────

  describe('resetPassword', () => {
    const mockResetToken = {
      id: 'token-123',
      userId: 'user-123',
      token: 'hashed_token_value',
      usedAt: null,
      expiresAt: new Date(Date.now() + 3600000),
      user: { id: 'user-123', email: 'user@test.com' },
    };

    it('deve resetar senha com sucesso quando token é válido', async () => {
      prismaMock.passwordResetToken.findFirst.mockResolvedValue(mockResetToken);
      prismaMock.user.update.mockResolvedValue({ id: 'user-123' });
      prismaMock.passwordResetToken.update.mockResolvedValue({ id: 'token-123' });
      prismaMock.passwordResetToken.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.resetPassword('abc123token', 'NewStr0ng!Pass');

      expect(result.message).toBe('Senha redefinida com sucesso');
      expect(hashPassword).toHaveBeenCalledWith('NewStr0ng!Pass');
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-123' },
          data: expect.objectContaining({
            password: 'hashed_new_password',
            loginAttempts: 0,
            lockedUntil: null,
          }),
        }),
      );
    });

    it('deve lançar erro se token inválido ou expirado', async () => {
      prismaMock.passwordResetToken.findFirst.mockResolvedValue(null);

      await expect(
        service.resetPassword('invalid-token', 'NewStr0ng!Pass'),
      ).rejects.toThrow('Token de redefinição inválido ou expirado');
    });

    it('deve lançar erro se senha é fraca', async () => {
      prismaMock.passwordResetToken.findFirst.mockResolvedValue(mockResetToken);
      vi.mocked(validatePasswordStrength).mockReturnValueOnce({
        isValid: false,
        message: 'Senha muito fraca',
      } as any);

      await expect(
        service.resetPassword('abc123token', '123'),
      ).rejects.toThrow('Senha muito fraca');
    });

    it('deve marcar token como usado após reset', async () => {
      prismaMock.passwordResetToken.findFirst.mockResolvedValue(mockResetToken);
      prismaMock.user.update.mockResolvedValue({ id: 'user-123' });
      prismaMock.passwordResetToken.update.mockResolvedValue({ id: 'token-123' });
      prismaMock.passwordResetToken.updateMany.mockResolvedValue({ count: 1 });

      await service.resetPassword('abc123token', 'NewStr0ng!Pass');

      expect(prismaMock.passwordResetToken.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'token-123' },
          data: expect.objectContaining({ usedAt: expect.any(Date) }),
        }),
      );
    });

    it('deve invalidar todos os tokens do usuário após reset', async () => {
      prismaMock.passwordResetToken.findFirst.mockResolvedValue(mockResetToken);
      prismaMock.user.update.mockResolvedValue({ id: 'user-123' });
      prismaMock.passwordResetToken.update.mockResolvedValue({ id: 'token-123' });
      prismaMock.passwordResetToken.updateMany.mockResolvedValue({ count: 3 });

      await service.resetPassword('abc123token', 'NewStr0ng!Pass');

      expect(prismaMock.passwordResetToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-123',
            usedAt: null,
          }),
          data: expect.objectContaining({ usedAt: expect.any(Date) }),
        }),
      );
    });

    it('deve resetar loginAttempts e lockedUntil ao redefinir senha', async () => {
      prismaMock.passwordResetToken.findFirst.mockResolvedValue(mockResetToken);
      prismaMock.user.update.mockResolvedValue({ id: 'user-123' });
      prismaMock.passwordResetToken.update.mockResolvedValue({ id: 'token-123' });
      prismaMock.passwordResetToken.updateMany.mockResolvedValue({ count: 1 });

      await service.resetPassword('abc123token', 'NewStr0ng!Pass');

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            loginAttempts: 0,
            lockedUntil: null,
          }),
        }),
      );
    });
  });
});
