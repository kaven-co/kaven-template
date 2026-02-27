import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';

// Mock dependencies
const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  tenant: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  verificationToken: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  refreshToken: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  securityAuditLog: {
    create: vi.fn(),
  },
  passwordResetToken: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: prismaMock,
}));

const passwordMocks = vi.hoisted(() => ({
  hashPassword: vi.fn().mockResolvedValue('hashed_sys'),
  comparePassword: vi.fn().mockResolvedValue(true),
  validatePasswordStrength: vi.fn().mockReturnValue({ isValid: true }),
}));

vi.mock('../../../lib/password', () => passwordMocks);

vi.mock('../../../lib/jwt', () => ({
  generateAccessToken: vi.fn().mockResolvedValue('access_token'),
  generateRefreshToken: vi.fn().mockReturnValue('refresh_token'),
  getRefreshTokenExpiry: vi.fn().mockReturnValue(new Date()),
}));

vi.mock('../../../lib/email', () => ({
  emailServiceV2: {
    send: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock('../../audit/services/audit.service', () => ({
  auditService: {
    log: vi.fn().mockResolvedValue(true),
  },
}));

const twoFaMocks = vi.hoisted(() => ({
  verify2FACode: vi.fn().mockReturnValue(true),
  generate2FASecret: vi.fn().mockResolvedValue({ secret: 'secret-2fa', qrCodeUrl: 'https://qr.example.com' }),
  generateBackupCodes: vi.fn().mockReturnValue(['code1', 'code2', 'code3']),
}));

vi.mock('../../../lib/2fa', () => twoFaMocks);

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService();
  });

  // ─── register ──────────────────────────────────────────────────────────────

  describe('register', () => {
    it('should register a new user successfully (chameleon tenant)', async () => {
      const input = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.tenant.findUnique.mockResolvedValue(null);
      prismaMock.tenant.create.mockResolvedValue({ id: 'tenant-123', slug: 'test-user' });
      prismaMock.user.create.mockResolvedValue({
        id: 'user-123',
        ...input,
        tenantId: 'tenant-123',
        role: 'USER',
      });

      const result = await authService.register(input);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: input.email } });
      expect(prismaMock.tenant.create).toHaveBeenCalled();
      expect(prismaMock.user.create).toHaveBeenCalled();
      expect(result.user.id).toBe('user-123');
    });

    it('should throw if email exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: 'existing' });
      await expect(authService.register({
        name: 'User', email: 'exist@email.com', password: '123'
      })).rejects.toThrow('Email já cadastrado');
    });

    it('should register user with existing tenant when tenantSlug is provided', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.tenant.findUnique.mockResolvedValue({ id: 'existing-tenant', slug: 'my-company' });
      prismaMock.user.create.mockResolvedValue({
        id: 'user-456',
        name: 'New User',
        email: 'new@company.com',
        tenantId: 'existing-tenant',
        role: 'USER',
      });

      const result = await authService.register({
        name: 'New User',
        email: 'new@company.com',
        password: 'Password123!',
        tenantSlug: 'my-company',
      });

      expect(prismaMock.tenant.create).not.toHaveBeenCalled();
      expect(result.user.tenantId).toBe('existing-tenant');
    });

    it('should throw if tenantSlug provided but tenant not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.tenant.findUnique.mockResolvedValue(null);

      await expect(authService.register({
        name: 'User',
        email: 'user@test.com',
        password: 'Password123!',
        tenantSlug: 'nonexistent',
      })).rejects.toThrow('Tenant não encontrado');
    });

    it('should throw if password validation fails', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      prismaMock.tenant.findUnique.mockResolvedValue(null);
      prismaMock.tenant.create.mockResolvedValue({ id: 'tenant-123', slug: 'test' });
      passwordMocks.validatePasswordStrength.mockReturnValueOnce({ isValid: false, message: 'Senha fraca' });

      await expect(authService.register({
        name: 'User',
        email: 'user@test.com',
        password: 'weak',
      })).rejects.toThrow('Senha fraca');
    });
  });

  // ─── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    const validUser = {
      id: 'user-123',
      email: 'login@test.com',
      password: 'hashed',
      name: 'Test User',
      role: 'USER',
      tenantId: 'tenant-1',
      twoFactorEnabled: false,
      deletedAt: null,
      lockedUntil: null,
      loginAttempts: 0,
    };

    it('should return tokens on success', async () => {
      prismaMock.user.findUnique.mockResolvedValue(validUser);

      const result = await authService.login({
        email: validUser.email,
        password: 'Password123!'
      });

      expect(result.accessToken).toBe('access_token');
      expect(result.refreshToken).toBe('refresh_token');
    });

    it('should throw if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(authService.login({
        email: 'unknown@test.com',
        password: 'Password123!',
      })).rejects.toThrow('Credenciais inválidas');
    });

    it('should throw if user is soft deleted', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...validUser,
        deletedAt: new Date(),
      });

      await expect(authService.login({
        email: validUser.email,
        password: 'Password123!',
      })).rejects.toThrow('Credenciais inválidas');
    });

    it('should throw if account is locked', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 10);

      prismaMock.user.findUnique.mockResolvedValue({
        ...validUser,
        lockedUntil: futureDate,
      });

      await expect(authService.login({
        email: validUser.email,
        password: 'Password123!',
      })).rejects.toThrow('Conta temporariamente bloqueada');
    });

    it('should throw and increment attempts on wrong password', async () => {
      passwordMocks.comparePassword.mockResolvedValueOnce(false);
      prismaMock.user.findUnique.mockResolvedValue(validUser);

      await expect(authService.login({
        email: validUser.email,
        password: 'wrong_pass',
      })).rejects.toThrow('Credenciais inválidas');

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ loginAttempts: 1 }),
        }),
      );
    });

    it('should lock account after 5 failed attempts', async () => {
      passwordMocks.comparePassword.mockResolvedValueOnce(false);
      prismaMock.user.findUnique.mockResolvedValue({
        ...validUser,
        loginAttempts: 4,
      });

      await expect(authService.login({
        email: validUser.email,
        password: 'wrong_pass',
      })).rejects.toThrow('Credenciais inválidas');

      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            loginAttempts: 5,
            lockedUntil: expect.any(Date),
          }),
        }),
      );
    });

    it('should require 2FA code when 2FA is enabled', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        ...validUser,
        twoFactorEnabled: true,
        twoFactorSecret: 'secret',
      });

      const result = await authService.login({
        email: validUser.email,
        password: 'Password123!',
      });

      expect((result as any).requires2FA).toBe(true);
    });

    it('should throw if 2FA code is invalid', async () => {
      twoFaMocks.verify2FACode.mockReturnValueOnce(false);
      prismaMock.user.findUnique.mockResolvedValue({
        ...validUser,
        twoFactorEnabled: true,
        twoFactorSecret: 'secret',
      });

      await expect(authService.login({
        email: validUser.email,
        password: 'Password123!',
        twoFactorCode: '000000',
      })).rejects.toThrow('Código 2FA inválido');
    });

    it('should reset login attempts on successful login', async () => {
      prismaMock.user.findUnique.mockResolvedValue(validUser);

      await authService.login({
        email: validUser.email,
        password: 'Password123!',
      });

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

  // ─── refreshAccessToken ────────────────────────────────────────────────────

  describe('refreshAccessToken', () => {
    it('should generate a new access token with valid refresh token', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        token: 'valid-refresh',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 86400000),
        user: {
          id: 'user-123',
          email: 'test@test.com',
          role: 'USER',
          tenantId: 'tenant-1',
        },
      });

      const result = await authService.refreshAccessToken('valid-refresh');

      expect(result.accessToken).toBe('access_token');
    });

    it('should throw if refresh token not found', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue(null);

      await expect(authService.refreshAccessToken('invalid-token'))
        .rejects.toThrow('Refresh token inválido ou expirado');
    });

    it('should throw if refresh token is revoked', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        token: 'revoked-token',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
        user: { id: 'user-123' },
      });

      await expect(authService.refreshAccessToken('revoked-token'))
        .rejects.toThrow('Refresh token inválido ou expirado');
    });

    it('should throw if refresh token is expired', async () => {
      prismaMock.refreshToken.findUnique.mockResolvedValue({
        token: 'expired-token',
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000),
        user: { id: 'user-123' },
      });

      await expect(authService.refreshAccessToken('expired-token'))
        .rejects.toThrow('Refresh token inválido ou expirado');
    });
  });

  // ─── logout ────────────────────────────────────────────────────────────────

  describe('logout', () => {
    it('should revoke refresh token successfully', async () => {
      prismaMock.refreshToken.update.mockResolvedValue({});

      const result = await authService.logout('valid-refresh');

      expect(result.message).toBe('Logout realizado com sucesso');
      expect(prismaMock.refreshToken.update).toHaveBeenCalledWith({
        where: { token: 'valid-refresh' },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  // ─── verifyEmail ───────────────────────────────────────────────────────────

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      prismaMock.verificationToken.findUnique.mockResolvedValue({
        id: 'vt-1',
        token: 'hashed-token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 86400000),
        usedAt: null,
      });
      prismaMock.user.update.mockResolvedValue({
        id: 'user-123',
        email: 'test@test.com',
        name: 'Test',
        tenantId: 'tenant-1',
      });
      prismaMock.verificationToken.update.mockResolvedValue({});

      const result = await authService.verifyEmail('raw-token');

      expect(result.message).toBe('Email verificado com sucesso');
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            emailVerified: true,
          }),
        }),
      );
    });

    it('should throw if verification token not found', async () => {
      prismaMock.verificationToken.findUnique.mockResolvedValue(null);

      await expect(authService.verifyEmail('bad-token'))
        .rejects.toThrow('Token inválido');
    });

    it('should throw if verification token is expired', async () => {
      prismaMock.verificationToken.findUnique.mockResolvedValue({
        id: 'vt-1',
        token: 'hashed',
        userId: 'user-123',
        expiresAt: new Date(Date.now() - 1000),
        usedAt: null,
      });

      await expect(authService.verifyEmail('raw-token'))
        .rejects.toThrow('Token expirado');
    });

    it('should throw if verification token already used', async () => {
      prismaMock.verificationToken.findUnique.mockResolvedValue({
        id: 'vt-1',
        token: 'hashed',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 86400000),
        usedAt: new Date(),
      });

      await expect(authService.verifyEmail('raw-token'))
        .rejects.toThrow('Token já utilizado');
    });
  });

  // ─── forgotPassword ────────────────────────────────────────────────────────

  describe('forgotPassword', () => {
    it('should return success message even when email does not exist (anti-enumeration)', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await authService.forgotPassword('unknown@test.com');

      expect(result.message).toContain('Se o email existir');
      expect(prismaMock.passwordResetToken.create).not.toHaveBeenCalled();
    });

    it('should create a reset token and send email for valid user', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@test.com',
        name: 'Test',
        tenantId: 'tenant-1',
      });
      prismaMock.passwordResetToken.create.mockResolvedValue({});

      const result = await authService.forgotPassword('test@test.com');

      expect(result.message).toContain('Se o email existir');
      expect(prismaMock.passwordResetToken.create).toHaveBeenCalled();
    });
  });

  // ─── resetPassword ─────────────────────────────────────────────────────────

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      prismaMock.passwordResetToken.findUnique.mockResolvedValue({
        id: 'prt-1',
        token: 'valid-reset-token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 3600000),
      });
      prismaMock.user.update.mockResolvedValue({});
      prismaMock.passwordResetToken.update.mockResolvedValue({});
      prismaMock.passwordResetToken.updateMany.mockResolvedValue({});

      const result = await authService.resetPassword('valid-reset-token', 'NewPassword123!');

      expect(result.message).toBe('Senha resetada com sucesso');
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            loginAttempts: 0,
            lockedUntil: null,
          }),
        }),
      );
    });

    it('should throw if reset token not found', async () => {
      prismaMock.passwordResetToken.findUnique.mockResolvedValue(null);

      await expect(authService.resetPassword('bad-token', 'NewPass123!'))
        .rejects.toThrow('Token inválido');
    });

    it('should throw if reset token is expired', async () => {
      prismaMock.passwordResetToken.findUnique.mockResolvedValue({
        id: 'prt-1',
        token: 'expired-token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() - 1000),
      });

      await expect(authService.resetPassword('expired-token', 'NewPass123!'))
        .rejects.toThrow('Token expirado');
    });
  });

  // ─── setup2FA ──────────────────────────────────────────────────────────────

  describe('setup2FA', () => {
    it('should set up 2FA for user', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@test.com',
        twoFactorEnabled: false,
        tenantId: 'tenant-1',
      });
      prismaMock.user.update.mockResolvedValue({});

      const result = await authService.setup2FA('user-123');

      expect(result.secret).toBe('secret-2fa');
      expect(result.qrCodeUrl).toBeDefined();
      expect(result.backupCodes).toHaveLength(3);
    });

    it('should throw if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(authService.setup2FA('nonexistent'))
        .rejects.toThrow('Usuário não encontrado');
    });

    it('should throw if 2FA is already enabled', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        twoFactorEnabled: true,
      });

      await expect(authService.setup2FA('user-123'))
        .rejects.toThrow('2FA já está habilitado');
    });
  });

  // ─── verify2FA ─────────────────────────────────────────────────────────────

  describe('verify2FA', () => {
    it('should enable 2FA with valid code', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        twoFactorSecret: 'secret',
        tenantId: 'tenant-1',
      });
      prismaMock.user.update.mockResolvedValue({});

      const result = await authService.verify2FA('user-123', '123456');

      expect(result.message).toBe('2FA habilitado com sucesso');
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { twoFactorEnabled: true },
        }),
      );
    });

    it('should throw if 2FA was not set up', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        twoFactorSecret: null,
      });

      await expect(authService.verify2FA('user-123', '123456'))
        .rejects.toThrow('2FA não foi configurado');
    });

    it('should throw if 2FA code is invalid', async () => {
      twoFaMocks.verify2FACode.mockReturnValueOnce(false);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        twoFactorSecret: 'secret',
      });

      await expect(authService.verify2FA('user-123', 'bad-code'))
        .rejects.toThrow('Código inválido');
    });
  });

  // ─── disable2FA ────────────────────────────────────────────────────────────

  describe('disable2FA', () => {
    it('should disable 2FA with valid code', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        twoFactorEnabled: true,
        twoFactorSecret: 'secret',
        tenantId: 'tenant-1',
      });
      prismaMock.user.update.mockResolvedValue({});

      const result = await authService.disable2FA('user-123', '123456');

      expect(result.message).toBe('2FA desabilitado com sucesso');
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            twoFactorEnabled: false,
            twoFactorSecret: null,
            backupCodes: null,
          }),
        }),
      );
    });

    it('should throw if 2FA is not enabled', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        twoFactorEnabled: false,
      });

      await expect(authService.disable2FA('user-123', '123456'))
        .rejects.toThrow('2FA não está habilitado');
    });

    it('should throw if code is invalid when disabling', async () => {
      twoFaMocks.verify2FACode.mockReturnValueOnce(false);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        twoFactorEnabled: true,
        twoFactorSecret: 'secret',
      });

      await expect(authService.disable2FA('user-123', 'bad-code'))
        .rejects.toThrow('Código inválido');
    });
  });

  // ─── resendVerification ────────────────────────────────────────────────────

  describe('resendVerification', () => {
    it('should return success message even when email does not exist (anti-enumeration)', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await authService.resendVerification('unknown@test.com');

      expect(result.message).toContain('Se o email existir');
    });

    it('should throw if email is already verified', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@test.com',
        emailVerified: true,
      });

      await expect(authService.resendVerification('test@test.com'))
        .rejects.toThrow('Email já verificado');
    });

    it('should create new verification token for unverified user', async () => {
      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@test.com',
        name: 'Test',
        emailVerified: false,
        tenantId: 'tenant-1',
      });
      prismaMock.verificationToken.create.mockResolvedValue({});

      const result = await authService.resendVerification('test@test.com');

      expect(result.message).toContain('Se o email existir');
      expect(prismaMock.verificationToken.create).toHaveBeenCalled();
    });
  });
});
