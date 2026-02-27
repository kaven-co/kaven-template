import { describe, it, expect, vi, beforeEach } from 'vitest';
import { emailIntegrationHealthService } from './email-integration-health.service';

const prismaMock = vi.hoisted(() => ({
  emailIntegration: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: prismaMock,
}));

// Mock EmailServiceV2 singleton
const providerMock = {
    healthCheck: vi.fn().mockResolvedValue({ healthy: true }),
};

const emailServiceInstanceMock = {
    reload: vi.fn(),
    providers: new Map([['int-1', providerMock]]),
};

vi.mock('../../../lib/email', () => ({
    EmailServiceV2: {
        getInstance: () => emailServiceInstanceMock,
    }
}));

describe('EmailIntegrationHealthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkIntegration', () => {
    it('should check health of integration', async () => {
      prismaMock.emailIntegration.findUnique.mockResolvedValue({ id: 'int-1' });
      
      const result = await emailIntegrationHealthService.checkIntegration('int-1');
      expect(result.healthy).toBe(true);
      expect(providerMock.healthCheck).toHaveBeenCalled();
    });

    it('should handle missing credential provider', async () => {
        prismaMock.emailIntegration.findUnique.mockResolvedValue({ id: 'int-missing' });
        // Map will return undefined
        
        const result = await emailIntegrationHealthService.checkIntegration('int-missing');
        expect(result.healthy).toBe(false);
        expect(result.message).toContain('Credentials not configured');
    });
  });

  describe('checkIntegration — error paths', () => {
    it('should throw when integration not found', async () => {
      prismaMock.emailIntegration.findUnique.mockResolvedValue(null);

      await expect(
        emailIntegrationHealthService.checkIntegration('nonexistent')
      ).resolves.toMatchObject({
        healthy: false,
        message: expect.stringContaining('Health check failed'),
      });
    });

    it('should handle healthCheck throwing an error', async () => {
      prismaMock.emailIntegration.findUnique.mockResolvedValue({ id: 'int-1' });
      providerMock.healthCheck.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await emailIntegrationHealthService.checkIntegration('int-1');
      expect(result.healthy).toBe(false);
      expect(result.message).toContain('Connection refused');
    });
  });

  describe('checkAll', () => {
    it('should iterate over all integrations', async () => {
      prismaMock.emailIntegration.findMany.mockResolvedValue([{ id: 'int-1' }]);
      prismaMock.emailIntegration.findUnique.mockResolvedValue({ id: 'int-1' });

      await emailIntegrationHealthService.checkAllIntegrations();
      expect(providerMock.healthCheck).toHaveBeenCalled();
    });

    it('should handle empty integrations list', async () => {
      prismaMock.emailIntegration.findMany.mockResolvedValue([]);

      await emailIntegrationHealthService.checkAllIntegrations();
      expect(providerMock.healthCheck).not.toHaveBeenCalled();
    });

    it('should process multiple integrations', async () => {
      prismaMock.emailIntegration.findMany.mockResolvedValue([
        { id: 'int-1' },
        { id: 'int-2' },
      ]);
      prismaMock.emailIntegration.findUnique.mockResolvedValue({ id: 'int-1' });

      await emailIntegrationHealthService.checkAllIntegrations();
      expect(prismaMock.emailIntegration.findUnique).toHaveBeenCalledTimes(2);
    });
  });
});
