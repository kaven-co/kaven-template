import { describe, it, expect, vi, beforeEach } from 'vitest';
import { featureService } from './feature.service';

const prismaMock = vi.hoisted(() => ({
  feature: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: prismaMock,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFeature(overrides: Record<string, any> = {}) {
  return {
    id: 'feat-1',
    code: 'max_users',
    name: 'Max Users',
    description: 'Maximum number of users allowed',
    type: 'NUMERIC',
    defaultValue: '10',
    unit: 'users',
    category: 'limits',
    sortOrder: 0,
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('FeatureService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // listFeatures
  // -------------------------------------------------------------------------
  describe('listFeatures', () => {
    it('should return all features with empty filters', async () => {
      prismaMock.feature.findMany.mockResolvedValue([makeFeature()]);

      const result = await featureService.listFeatures();

      expect(prismaMock.feature.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      );
      expect(result).toHaveLength(1);
      expect(result[0].code).toBe('max_users');
    });

    it('should apply isActive filter', async () => {
      prismaMock.feature.findMany.mockResolvedValue([]);

      await featureService.listFeatures({ isActive: true });

      expect(prismaMock.feature.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        })
      );
    });

    it('should apply category filter', async () => {
      prismaMock.feature.findMany.mockResolvedValue([]);

      await featureService.listFeatures({ category: 'limits' });

      expect(prismaMock.feature.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'limits' }),
        })
      );
    });

    it('should order by category then sortOrder', async () => {
      prismaMock.feature.findMany.mockResolvedValue([]);

      await featureService.listFeatures();

      expect(prismaMock.feature.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // getFeatureById
  // -------------------------------------------------------------------------
  describe('getFeatureById', () => {
    it('should return formatted feature when found', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(makeFeature());

      const result = await featureService.getFeatureById('feat-1');

      expect(result.id).toBe('feat-1');
      expect(result.code).toBe('max_users');
    });

    it('should throw when feature not found', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(null);

      await expect(featureService.getFeatureById('nonexistent')).rejects.toThrow(
        'Feature não encontrada'
      );
    });
  });

  // -------------------------------------------------------------------------
  // getFeatureByCode
  // -------------------------------------------------------------------------
  describe('getFeatureByCode', () => {
    it('should find feature by code', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(makeFeature({ code: 'max_storage' }));

      const result = await featureService.getFeatureByCode('max_storage');

      expect(prismaMock.feature.findUnique).toHaveBeenCalledWith({
        where: { code: 'max_storage' },
      });
      expect(result.code).toBe('max_storage');
    });

    it('should throw when feature code not found', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(null);

      await expect(featureService.getFeatureByCode('nonexistent')).rejects.toThrow(
        'Feature não encontrada'
      );
    });
  });

  // -------------------------------------------------------------------------
  // createFeature
  // -------------------------------------------------------------------------
  describe('createFeature', () => {
    it('should create feature when code is unique', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(null); // no duplicate
      prismaMock.feature.create.mockResolvedValue(
        makeFeature({ id: 'new-feat', code: 'new_feature' })
      );

      const result = await featureService.createFeature({
        code: 'new_feature',
        name: 'New Feature',
        type: 'BOOLEAN',
      } as any);

      expect(prismaMock.feature.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          code: 'new_feature',
          name: 'New Feature',
          type: 'BOOLEAN',
        }),
      });
      expect(result.code).toBe('new_feature');
    });

    it('should throw when duplicate code exists', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(makeFeature());

      await expect(
        featureService.createFeature({
          code: 'max_users',
          name: 'Duplicate',
          type: 'NUMERIC',
        } as any)
      ).rejects.toThrow('Já existe uma feature com este código');
    });
  });

  // -------------------------------------------------------------------------
  // updateFeature
  // -------------------------------------------------------------------------
  describe('updateFeature', () => {
    it('should update existing feature', async () => {
      const existing = makeFeature();
      const updated = makeFeature({ name: 'Updated Name' });

      prismaMock.feature.findUnique.mockResolvedValue(existing);
      prismaMock.feature.update.mockResolvedValue(updated);

      const result = await featureService.updateFeature('feat-1', {
        name: 'Updated Name',
      } as any);

      expect(prismaMock.feature.update).toHaveBeenCalledWith({
        where: { id: 'feat-1' },
        data: { name: 'Updated Name' },
      });
      expect(result.name).toBe('Updated Name');
    });

    it('should throw when feature does not exist', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(null);

      await expect(
        featureService.updateFeature('nonexistent', { name: 'X' } as any)
      ).rejects.toThrow('Feature não encontrada');
    });
  });

  // -------------------------------------------------------------------------
  // deleteFeature
  // -------------------------------------------------------------------------
  describe('deleteFeature', () => {
    it('should throw when feature does not exist', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(null);

      await expect(featureService.deleteFeature('nonexistent')).rejects.toThrow(
        'Feature não encontrada'
      );
    });

    it('should throw when feature is in use by plans or products', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(
        makeFeature({
          planFeatures: [{ id: 'pf1' }],
          productEffects: [],
        })
      );

      await expect(featureService.deleteFeature('feat-1')).rejects.toThrow(
        'Feature está em uso'
      );
    });

    it('should throw when feature is in use by products', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(
        makeFeature({
          planFeatures: [],
          productEffects: [{ id: 'pe1' }],
        })
      );

      await expect(featureService.deleteFeature('feat-1')).rejects.toThrow(
        'Feature está em uso'
      );
    });

    it('should soft-delete when feature is not in use', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(
        makeFeature({ planFeatures: [], productEffects: [] })
      );
      prismaMock.feature.update.mockResolvedValue({});

      const result = await featureService.deleteFeature('feat-1');

      expect(prismaMock.feature.update).toHaveBeenCalledWith({
        where: { id: 'feat-1' },
        data: { isActive: false },
      });
      expect(result.message).toContain('desativada');
    });
  });

  // -------------------------------------------------------------------------
  // listCategories
  // -------------------------------------------------------------------------
  describe('listCategories', () => {
    it('should return sorted unique categories', async () => {
      prismaMock.feature.findMany.mockResolvedValue([
        { category: 'limits' },
        { category: 'access' },
      ]);

      const result = await featureService.listCategories();

      expect(result).toEqual(['access', 'limits']);
    });

    it('should filter out null categories', async () => {
      prismaMock.feature.findMany.mockResolvedValue([
        { category: 'limits' },
        { category: null },
      ]);

      const result = await featureService.listCategories();

      expect(result).toEqual(['limits']);
    });
  });
});
