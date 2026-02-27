import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PolicyService } from './policy.service';
import { PolicyType, PolicyTargetType, PolicyEnforcement } from '@prisma/client';

describe('PolicyService', () => {
  let service: PolicyService;
  let mockPrisma: any;

  beforeEach(() => {
    // Criar mock do Prisma Client
    mockPrisma = {
      policy: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      policyDeviceTracking: {
        findUnique: vi.fn(),
      },
    };

    // Injetar mock no PolicyService
    service = new PolicyService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe('createPolicy', () => {
    it('deve criar policy de IP Whitelist com sucesso', async () => {
      const mockPolicy = {
        id: 'policy-123',
        name: 'Office IP Whitelist',
        type: PolicyType.IP_WHITELIST,
        targetType: PolicyTargetType.CAPABILITY,
        targetId: 'cap-123',
        conditions: { allowedIps: ['192.168.1.0/24', '10.0.0.1'] },
        enforcement: PolicyEnforcement.DENY,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.create.mockResolvedValue(mockPolicy);

      const result = await service.createPolicy({
        name: 'Office IP Whitelist',
        type: PolicyType.IP_WHITELIST,
        targetType: PolicyTargetType.CAPABILITY,
        targetId: 'cap-123',
        conditions: { allowedIps: ['192.168.1.0/24', '10.0.0.1'] },
        enforcement: PolicyEnforcement.DENY,
      });

      expect(result).toEqual(mockPolicy);
      expect(mockPrisma.policy.create).toHaveBeenCalled();
    });

    it('deve lançar erro se IP inválido em IP_WHITELIST', async () => {
      await expect(
        service.createPolicy({
          name: 'Invalid IP Policy',
          type: PolicyType.IP_WHITELIST,
          targetType: PolicyTargetType.CAPABILITY,
          conditions: { allowedIps: ['invalid-ip'] },
          enforcement: PolicyEnforcement.DENY,
        })
      ).rejects.toThrow('Invalid IP or CIDR');
    });

    it('deve criar policy Time-based com sucesso', async () => {
      const mockPolicy = {
        id: 'policy-456',
        name: 'Business Hours Only',
        type: PolicyType.TIME_BASED,
        targetType: PolicyTargetType.SPACE,
        targetId: 'space-123',
        conditions: {
          allowedHours: [[9, 18]],
          allowedDays: [1, 2, 3, 4, 5],
        },
        enforcement: PolicyEnforcement.DENY,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        description: null,
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.create.mockResolvedValue(mockPolicy);

      const result = await service.createPolicy({
        name: 'Business Hours Only',
        type: PolicyType.TIME_BASED,
        targetType: PolicyTargetType.SPACE,
        targetId: 'space-123',
        conditions: {
          allowedHours: [[9, 18]],
          allowedDays: [1, 2, 3, 4, 5],
        },
        enforcement: PolicyEnforcement.DENY,
      });

      expect(result).toEqual(mockPolicy);
    });
  });

  describe('evaluatePolicy - IP Whitelist', () => {
    it('deve permitir IP na whitelist', async () => {
      const mockPolicy = {
        id: 'policy-123',
        type: PolicyType.IP_WHITELIST,
        enforcement: PolicyEnforcement.DENY,
        isActive: true,
        conditions: { allowedIps: ['192.168.1.100', '10.0.0.0/24'] },
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);

      const result = await service.evaluatePolicy('policy-123', {
        userId: 'user-123',
        ipAddress: '192.168.1.100',
      });

      expect(result.allowed).toBe(true);
      expect(result.reason).toContain('whitelisted');
    });

    it('deve negar IP não na whitelist', async () => {
      const mockPolicy = {
        id: 'policy-123',
        type: PolicyType.IP_WHITELIST,
        enforcement: PolicyEnforcement.DENY,
        isActive: true,
        conditions: { allowedIps: ['192.168.1.100'] },
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);

      const result = await service.evaluatePolicy('policy-123', {
        userId: 'user-123',
        ipAddress: '10.0.0.1',
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not in whitelist');
    });

    it('deve permitir IP em range CIDR', async () => {
      const mockPolicy = {
        id: 'policy-123',
        type: PolicyType.IP_WHITELIST,
        enforcement: PolicyEnforcement.DENY,
        isActive: true,
        conditions: { allowedIps: ['192.168.1.0/24'] },
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);

      const result = await service.evaluatePolicy('policy-123', {
        userId: 'user-123',
        ipAddress: '192.168.1.50',
      });

      expect(result.allowed).toBe(true);
    });
  });

  describe('evaluatePolicy - Device Trust', () => {
    it('deve permitir dispositivo confiável', async () => {
      const mockPolicy = {
        id: 'policy-456',
        type: PolicyType.DEVICE_TRUST,
        enforcement: PolicyEnforcement.DENY,
        isActive: true,
        conditions: { requireTrusted: true },
        ipWhitelists: [],
        deviceTracking: [],
      };

      const mockDevice = {
        deviceId: 'device-123',
        isTrusted: true,
      };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);
      mockPrisma.policyDeviceTracking.findUnique.mockResolvedValue(mockDevice);

      const result = await service.evaluatePolicy('policy-456', {
        userId: 'user-123',
        deviceId: 'device-123',
      });

      expect(result.allowed).toBe(true);
      expect(result.reason).toContain('trusted');
    });

    it('deve negar dispositivo não confiável', async () => {
      const mockPolicy = {
        id: 'policy-456',
        type: PolicyType.DEVICE_TRUST,
        enforcement: PolicyEnforcement.DENY,
        isActive: true,
        conditions: { requireTrusted: true },
        ipWhitelists: [],
        deviceTracking: [],
      };

      const mockDevice = {
        deviceId: 'device-123',
        isTrusted: false,
      };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);
      mockPrisma.policyDeviceTracking.findUnique.mockResolvedValue(mockDevice);

      const result = await service.evaluatePolicy('policy-456', {
        userId: 'user-123',
        deviceId: 'device-123',
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not trusted');
    });
  });

  describe('evaluatePolicy - Time Based', () => {
    it('deve permitir acesso dentro do horário permitido', async () => {
      const mockPolicy = {
        id: 'policy-789',
        type: PolicyType.TIME_BASED,
        enforcement: PolicyEnforcement.DENY,
        isActive: true,
        conditions: {
          allowedHours: [[9, 18]],
          allowedDays: [1, 2, 3, 4, 5],
        },
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);

      // Simular terça-feira às 14h
      const tuesday2PM = new Date('2026-01-21T14:00:00');

      const result = await service.evaluatePolicy('policy-789', {
        userId: 'user-123',
        timestamp: tuesday2PM,
      });

      expect(result.allowed).toBe(true);
      expect(result.reason).toContain('allowed time window');
    });

    it('deve negar acesso fora do horário permitido', async () => {
      const mockPolicy = {
        id: 'policy-789',
        type: PolicyType.TIME_BASED,
        enforcement: PolicyEnforcement.DENY,
        isActive: true,
        conditions: {
          allowedHours: [[9, 18]],
          allowedDays: [1, 2, 3, 4, 5],
        },
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);

      // Simular terça-feira às 20h (8pm)
      const tuesday8PM = new Date('2026-01-21T20:00:00');

      const result = await service.evaluatePolicy('policy-789', {
        userId: 'user-123',
        timestamp: tuesday8PM,
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not allowed at');
    });

    it('deve negar acesso em dia não permitido', async () => {
      const mockPolicy = {
        id: 'policy-789',
        type: PolicyType.TIME_BASED,
        enforcement: PolicyEnforcement.DENY,
        isActive: true,
        conditions: {
          allowedHours: [[9, 18]],
          allowedDays: [1, 2, 3, 4, 5],
        },
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);

      // Simular sábado às 14h
      const saturday2PM = new Date('2026-01-25T14:00:00');

      const result = await service.evaluatePolicy('policy-789', {
        userId: 'user-123',
        timestamp: saturday2PM,
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not allowed on this day');
    });
  });

  describe('evaluatePolicies', () => {
    it('deve negar se qualquer DENY policy negar', async () => {
      const mockPolicies = [
        {
          id: 'policy-deny',
          type: PolicyType.IP_WHITELIST,
          enforcement: PolicyEnforcement.DENY,
          isActive: true,
          conditions: { allowedIps: ['192.168.1.100'] },
          ipWhitelists: [],
          deviceTracking: [],
        },
      ];

      mockPrisma.policy.findMany.mockResolvedValue(mockPolicies);
      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicies[0]);

      const result = await service.evaluatePolicies(
        PolicyTargetType.CAPABILITY,
        'cap-123',
        {
          userId: 'user-123',
          ipAddress: '10.0.0.1', // IP não permitido
        }
      );

      expect(result.allowed).toBe(false);
    });

    it('deve permitir se não há policies', async () => {
      mockPrisma.policy.findMany.mockResolvedValue([]);

      const result = await service.evaluatePolicies(
        PolicyTargetType.CAPABILITY,
        'cap-123',
        { userId: 'user-123' }
      );

      expect(result.allowed).toBe(true);
    });

    it('deve negar se ALLOW policy não corresponde', async () => {
      const mockAllowPolicy = {
        id: 'policy-allow',
        type: PolicyType.IP_WHITELIST,
        enforcement: PolicyEnforcement.ALLOW,
        isActive: true,
        conditions: { allowedIps: ['192.168.1.100'] },
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.findMany.mockResolvedValue([mockAllowPolicy]);
      mockPrisma.policy.findUnique.mockResolvedValue(mockAllowPolicy);

      const result = await service.evaluatePolicies(
        PolicyTargetType.CAPABILITY,
        'cap-123',
        { userId: 'user-123', ipAddress: '10.0.0.99' } // IP não na whitelist
      );

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('No ALLOW policy matched');
    });
  });

  describe('listPolicies', () => {
    it('deve listar policies sem filtro', async () => {
      mockPrisma.policy.findMany.mockResolvedValue([]);

      await service.listPolicies();

      expect(mockPrisma.policy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      );
    });

    it('deve listar policies com filtros', async () => {
      mockPrisma.policy.findMany.mockResolvedValue([]);

      await service.listPolicies({
        type: PolicyType.IP_WHITELIST,
        isActive: true,
      });

      expect(mockPrisma.policy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: PolicyType.IP_WHITELIST,
            isActive: true,
          }),
        })
      );
    });
  });

  describe('getPolicyById', () => {
    it('deve lançar erro se policy não encontrada', async () => {
      mockPrisma.policy.findUnique.mockResolvedValue(null);

      await expect(service.getPolicyById('policy-xxx')).rejects.toThrow(
        'Policy not found'
      );
    });
  });

  describe('updatePolicy', () => {
    it('deve atualizar policy com sucesso', async () => {
      const mockPolicy = {
        id: 'policy-123',
        type: PolicyType.IP_WHITELIST,
        name: 'Old Name',
        conditions: { allowedIps: ['10.0.0.1'] },
        isActive: true,
        ipWhitelists: [],
        deviceTracking: [],
      };
      const updatedPolicy = { ...mockPolicy, name: 'New Name' };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);
      mockPrisma.policy.update.mockResolvedValue(updatedPolicy);

      const result = await service.updatePolicy('policy-123', {
        name: 'New Name',
      });

      expect(result.name).toBe('New Name');
    });

    it('deve validar condições ao atualizar', async () => {
      const mockPolicy = {
        id: 'policy-123',
        type: PolicyType.IP_WHITELIST,
        conditions: { allowedIps: ['10.0.0.1'] },
        isActive: true,
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);

      await expect(
        service.updatePolicy('policy-123', {
          conditions: { allowedIps: ['invalid-ip!!!'] },
        })
      ).rejects.toThrow('Invalid IP or CIDR');
    });
  });

  describe('deletePolicy', () => {
    it('deve deletar policy existente', async () => {
      const mockPolicy = {
        id: 'policy-123',
        type: PolicyType.IP_WHITELIST,
        conditions: {},
        isActive: true,
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);
      mockPrisma.policy.delete.mockResolvedValue(mockPolicy);

      await service.deletePolicy('policy-123');

      expect(mockPrisma.policy.delete).toHaveBeenCalledWith({
        where: { id: 'policy-123' },
      });
    });

    it('deve lançar erro ao deletar policy inexistente', async () => {
      mockPrisma.policy.findUnique.mockResolvedValue(null);

      await expect(service.deletePolicy('policy-xxx')).rejects.toThrow(
        'Policy not found'
      );
    });
  });

  describe('evaluatePolicy - inactive policy', () => {
    it('deve permitir se policy está inativa', async () => {
      const mockPolicy = {
        id: 'policy-inactive',
        type: PolicyType.IP_WHITELIST,
        enforcement: PolicyEnforcement.DENY,
        isActive: false,
        conditions: { allowedIps: ['192.168.1.1'] },
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);

      const result = await service.evaluatePolicy('policy-inactive', {
        userId: 'user-123',
        ipAddress: '10.0.0.1', // IP que seria bloqueado se ativa
      });

      expect(result.allowed).toBe(true);
      expect(result.reason).toContain('inactive');
    });
  });

  describe('evaluatePolicy - IP Whitelist edge cases', () => {
    it('deve negar se sem IP address na IP_WHITELIST policy', async () => {
      const mockPolicy = {
        id: 'policy-123',
        type: PolicyType.IP_WHITELIST,
        enforcement: PolicyEnforcement.DENY,
        isActive: true,
        conditions: { allowedIps: ['10.0.0.1'] },
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);

      const result = await service.evaluatePolicy('policy-123', {
        userId: 'user-123',
        // sem ipAddress
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('No IP address provided');
    });

    it('deve bloquear IP na blacklist (blockedIps)', async () => {
      const mockPolicy = {
        id: 'policy-123',
        type: PolicyType.IP_WHITELIST,
        enforcement: PolicyEnforcement.DENY,
        isActive: true,
        conditions: { blockedIps: ['10.0.0.99'] },
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);

      const result = await service.evaluatePolicy('policy-123', {
        userId: 'user-123',
        ipAddress: '10.0.0.99',
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('blocked');
    });

    it('deve permitir IP não na blacklist quando sem whitelist', async () => {
      const mockPolicy = {
        id: 'policy-123',
        type: PolicyType.IP_WHITELIST,
        enforcement: PolicyEnforcement.DENY,
        isActive: true,
        conditions: { blockedIps: ['10.0.0.99'] },
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);

      const result = await service.evaluatePolicy('policy-123', {
        userId: 'user-123',
        ipAddress: '192.168.1.1', // não na blacklist
      });

      expect(result.allowed).toBe(true);
    });
  });

  describe('evaluatePolicy - Device Trust edge cases', () => {
    it('deve negar se sem deviceId', async () => {
      const mockPolicy = {
        id: 'policy-456',
        type: PolicyType.DEVICE_TRUST,
        enforcement: PolicyEnforcement.DENY,
        isActive: true,
        conditions: { requireTrusted: true },
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);

      const result = await service.evaluatePolicy('policy-456', {
        userId: 'user-123',
        // sem deviceId
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('No device ID provided');
    });

    it('deve negar se dispositivo não reconhecido', async () => {
      const mockPolicy = {
        id: 'policy-456',
        type: PolicyType.DEVICE_TRUST,
        enforcement: PolicyEnforcement.DENY,
        isActive: true,
        conditions: { requireTrusted: true },
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);
      mockPrisma.policyDeviceTracking.findUnique.mockResolvedValue(null);

      const result = await service.evaluatePolicy('policy-456', {
        userId: 'user-123',
        deviceId: 'unknown-device',
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not recognized');
    });
  });

  describe('validateConditions', () => {
    it('deve lançar erro em IP_WHITELIST sem allowedIps nem blockedIps', async () => {
      await expect(
        service.createPolicy({
          name: 'Bad Policy',
          type: PolicyType.IP_WHITELIST,
          targetType: PolicyTargetType.CAPABILITY,
          conditions: {},
          enforcement: PolicyEnforcement.DENY,
        })
      ).rejects.toThrow('IP_WHITELIST policy requires allowedIps or blockedIps');
    });

    it('deve lançar erro em DEVICE_TRUST sem requireTrusted nem minTrustLevel', async () => {
      await expect(
        service.createPolicy({
          name: 'Bad Device Policy',
          type: PolicyType.DEVICE_TRUST,
          targetType: PolicyTargetType.CAPABILITY,
          conditions: {},
          enforcement: PolicyEnforcement.DENY,
        })
      ).rejects.toThrow('DEVICE_TRUST policy requires requireTrusted or minTrustLevel');
    });

    it('deve lançar erro em TIME_BASED sem allowedHours', async () => {
      await expect(
        service.createPolicy({
          name: 'Bad Time Policy',
          type: PolicyType.TIME_BASED,
          targetType: PolicyTargetType.CAPABILITY,
          conditions: {},
          enforcement: PolicyEnforcement.DENY,
        })
      ).rejects.toThrow('TIME_BASED policy requires allowedHours array');
    });

    it('deve lançar erro se blockedIps contém IP inválido', async () => {
      await expect(
        service.createPolicy({
          name: 'Bad Blocked IP Policy',
          type: PolicyType.IP_WHITELIST,
          targetType: PolicyTargetType.CAPABILITY,
          conditions: { blockedIps: ['not-an-ip'] },
          enforcement: PolicyEnforcement.DENY,
        })
      ).rejects.toThrow('Invalid IP or CIDR in blockedIps');
    });
  });

  describe('evaluatePolicy - ALLOW enforcement', () => {
    it('deve retornar resultado quando ALLOW policy não permite', async () => {
      const mockPolicy = {
        id: 'policy-allow',
        type: PolicyType.IP_WHITELIST,
        enforcement: PolicyEnforcement.ALLOW,
        isActive: true,
        conditions: { allowedIps: ['192.168.1.100'] },
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);

      const result = await service.evaluatePolicy('policy-allow', {
        userId: 'user-123',
        ipAddress: '10.0.0.1', // não na whitelist
      });

      expect(result.allowed).toBe(false);
    });

    it('deve retornar permitido quando ALLOW policy corresponde', async () => {
      const mockPolicy = {
        id: 'policy-allow',
        name: 'My Allow Policy',
        type: PolicyType.IP_WHITELIST,
        enforcement: PolicyEnforcement.ALLOW,
        isActive: true,
        conditions: { allowedIps: ['192.168.1.100'] },
        ipWhitelists: [],
        deviceTracking: [],
      };

      mockPrisma.policy.findUnique.mockResolvedValue(mockPolicy);

      const result = await service.evaluatePolicy('policy-allow', {
        userId: 'user-123',
        ipAddress: '192.168.1.100',
      });

      expect(result.allowed).toBe(true);
      expect(result.policyId).toBe('policy-allow');
    });
  });
});
