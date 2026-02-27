import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from './product.service';

const prismaMock = vi.hoisted(() => ({
  product: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  productEffect: {
    createMany: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  feature: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: prismaMock,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeProduct(overrides: Record<string, any> = {}) {
  return {
    id: 'prod-1',
    code: 'addon-storage',
    name: 'Extra Storage',
    description: 'Additional 10GB storage',
    type: 'ADDON',
    price: '2900',
    currency: 'BRL',
    originalPrice: null,
    isActive: true,
    isPublic: true,
    sortOrder: 0,
    stock: null,
    maxPerTenant: null,
    stripeProductId: null,
    stripePriceId: null,
    imageUrl: null,
    planId: null,
    tenantId: null,
    metadata: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    effects: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ProductService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // listProducts
  // -------------------------------------------------------------------------
  describe('listProducts', () => {
    it('should return formatted products', async () => {
      prismaMock.product.findMany.mockResolvedValue([makeProduct()]);

      const result = await productService.listProducts({ tenantId: 't1' });

      expect(result).toHaveLength(1);
      expect(result[0].price).toBe(2900);
      expect(result[0].code).toBe('addon-storage');
    });

    it('should pass empty where when no filters', async () => {
      prismaMock.product.findMany.mockResolvedValue([]);

      await productService.listProducts();

      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      );
    });

    it('should apply tenantId filter', async () => {
      prismaMock.product.findMany.mockResolvedValue([]);

      await productService.listProducts({ tenantId: 'tenant-a' });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 'tenant-a' }),
        })
      );
    });

    it('should apply isActive filter', async () => {
      prismaMock.product.findMany.mockResolvedValue([]);

      await productService.listProducts({ isActive: true });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        })
      );
    });

    it('should apply isPublic filter', async () => {
      prismaMock.product.findMany.mockResolvedValue([]);

      await productService.listProducts({ isPublic: false });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isPublic: false }),
        })
      );
    });

    it('should apply type filter', async () => {
      prismaMock.product.findMany.mockResolvedValue([]);

      await productService.listProducts({ type: 'ADDON' } as any);

      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'ADDON' }),
        })
      );
    });

    it('should apply planId filter', async () => {
      prismaMock.product.findMany.mockResolvedValue([]);

      await productService.listProducts({ planId: 'plan-1' });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ planId: 'plan-1' }),
        })
      );
    });

    it('should order by sortOrder ascending', async () => {
      prismaMock.product.findMany.mockResolvedValue([]);

      await productService.listProducts();

      expect(prismaMock.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { sortOrder: 'asc' },
        })
      );
    });

    it('should format effects with feature details', async () => {
      const product = makeProduct({
        effects: [
          {
            effectType: 'ADD',
            value: 10,
            isPermanent: true,
            durationDays: null,
            feature: {
              code: 'max_storage',
              name: 'Max Storage',
              type: 'NUMERIC',
              unit: 'GB',
            },
          },
        ],
      });
      prismaMock.product.findMany.mockResolvedValue([product]);

      const [result] = await productService.listProducts();

      expect(result.effects).toHaveLength(1);
      expect(result.effects[0]).toMatchObject({
        featureCode: 'max_storage',
        featureName: 'Max Storage',
        effectType: 'ADD',
        value: 10,
        isPermanent: true,
      });
    });

    it('should handle originalPrice formatting', async () => {
      const product = makeProduct({ originalPrice: '4900' });
      prismaMock.product.findMany.mockResolvedValue([product]);

      const [result] = await productService.listProducts();

      expect(result.originalPrice).toBe(4900);
    });
  });

  // -------------------------------------------------------------------------
  // getProductById
  // -------------------------------------------------------------------------
  describe('getProductById', () => {
    it('should return product when found', async () => {
      prismaMock.product.findFirst.mockResolvedValue(makeProduct());

      const result = await productService.getProductById('prod-1');

      expect(result.id).toBe('prod-1');
    });

    it('should apply tenant isolation with OR clause', async () => {
      prismaMock.product.findFirst.mockResolvedValue(makeProduct());

      await productService.getProductById('prod-1', 'tenant-a');

      expect(prismaMock.product.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'prod-1',
            OR: [
              { tenantId: 'tenant-a' },
              { tenantId: null },
              { isPublic: true },
            ],
          }),
        })
      );
    });

    it('should restrict to public products for anonymous access', async () => {
      prismaMock.product.findFirst.mockResolvedValue(makeProduct());

      await productService.getProductById('prod-1');

      expect(prismaMock.product.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'prod-1',
            isPublic: true,
          }),
        })
      );
    });

    it('should throw when product not found', async () => {
      prismaMock.product.findFirst.mockResolvedValue(null);

      await expect(productService.getProductById('nonexistent')).rejects.toThrow(
        'Produto não encontrado'
      );
    });
  });

  // -------------------------------------------------------------------------
  // getProductByCode
  // -------------------------------------------------------------------------
  describe('getProductByCode', () => {
    it('should find product by code and tenantId', async () => {
      prismaMock.product.findFirst.mockResolvedValue(makeProduct({ code: 'premium' }));

      const result = await productService.getProductByCode('premium', 'tenant-a');

      expect(prismaMock.product.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { code: 'premium', tenantId: 'tenant-a' },
        })
      );
      expect(result.code).toBe('premium');
    });

    it('should default tenantId to null', async () => {
      prismaMock.product.findFirst.mockResolvedValue(makeProduct());

      await productService.getProductByCode('addon-storage');

      expect(prismaMock.product.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { code: 'addon-storage', tenantId: null },
        })
      );
    });

    it('should throw when product code not found', async () => {
      prismaMock.product.findFirst.mockResolvedValue(null);

      await expect(productService.getProductByCode('nonexistent')).rejects.toThrow(
        'Produto não encontrado'
      );
    });
  });

  // -------------------------------------------------------------------------
  // createProduct
  // -------------------------------------------------------------------------
  describe('createProduct', () => {
    it('should create product with effects', async () => {
      const mockProduct = makeProduct({ id: 'new-prod' });
      prismaMock.product.findFirst
        .mockResolvedValueOnce(null) // no duplicate
        .mockResolvedValueOnce(mockProduct); // getProductById
      prismaMock.product.create.mockResolvedValue(mockProduct);
      prismaMock.feature.findMany.mockResolvedValue([{ id: 'f1', code: 'feat1', isActive: true }]);
      prismaMock.productEffect.createMany.mockResolvedValue({ count: 1 });

      const result = await productService.createProduct({
        code: 'P1',
        name: 'Product 1',
        type: 'ADDON',
        price: 10,
        effects: [{ featureCode: 'feat1', effectType: 'ADD', isPermanent: false }],
      } as any);

      expect(prismaMock.product.create).toHaveBeenCalled();
      expect(prismaMock.productEffect.createMany).toHaveBeenCalled();
    });

    it('should throw when duplicate code exists for same tenant', async () => {
      prismaMock.product.findFirst.mockResolvedValueOnce({ id: 'existing' });

      await expect(
        productService.createProduct({
          code: 'duplicate',
          name: 'Dup',
          type: 'ADDON',
          price: 10,
          effects: [],
        } as any)
      ).rejects.toThrow('Já existe um produto com este código');
    });

    it('should create product without effects', async () => {
      const mockProduct = makeProduct({ id: 'no-effects' });
      prismaMock.product.findFirst
        .mockResolvedValueOnce(null) // no duplicate
        .mockResolvedValueOnce(mockProduct); // getProductById
      prismaMock.product.create.mockResolvedValue(mockProduct);

      await productService.createProduct({
        code: 'simple',
        name: 'Simple Product',
        type: 'ADDON',
        price: 5,
      } as any);

      expect(prismaMock.product.create).toHaveBeenCalled();
      expect(prismaMock.productEffect.createMany).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // updateProduct
  // -------------------------------------------------------------------------
  describe('updateProduct', () => {
    it('should throw when product does not exist', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      await expect(
        productService.updateProduct('nonexistent', { name: 'Updated' } as any)
      ).rejects.toThrow('Produto não encontrado');
    });

    it('should update product and return refreshed data', async () => {
      const existing = makeProduct();
      const updated = makeProduct({ name: 'Updated Product' });

      prismaMock.product.findUnique.mockResolvedValue(existing);
      prismaMock.product.update.mockResolvedValue(updated);
      prismaMock.product.findFirst.mockResolvedValue(updated); // getProductById

      const result = await productService.updateProduct('prod-1', { name: 'Updated Product' } as any);

      expect(prismaMock.product.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod-1' },
          data: { name: 'Updated Product' },
        })
      );
      expect(result.name).toBe('Updated Product');
    });
  });

  // -------------------------------------------------------------------------
  // deleteProduct
  // -------------------------------------------------------------------------
  describe('deleteProduct', () => {
    it('should throw when product does not exist', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      await expect(productService.deleteProduct('nonexistent')).rejects.toThrow(
        'Produto não encontrado'
      );
    });

    it('should soft-delete by setting isActive and isPublic to false', async () => {
      prismaMock.product.findUnique.mockResolvedValue(makeProduct());
      prismaMock.product.update.mockResolvedValue({});

      const result = await productService.deleteProduct('prod-1');

      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { isActive: false, isPublic: false },
      });
      expect(result.message).toContain('desativado');
    });
  });

  // -------------------------------------------------------------------------
  // addEffectsToProduct
  // -------------------------------------------------------------------------
  describe('addEffectsToProduct', () => {
    it('should throw when features are not found', async () => {
      prismaMock.feature.findMany.mockResolvedValue([]);

      await expect(
        productService.addEffectsToProduct('prod-1', [
          { featureCode: 'missing' },
        ])
      ).rejects.toThrow('Features não encontradas: missing');
    });

    it('should create product effects with defaults', async () => {
      prismaMock.feature.findMany.mockResolvedValue([
        { id: 'f1', code: 'max_storage', isActive: true },
      ]);
      prismaMock.productEffect.createMany.mockResolvedValue({ count: 1 });

      await productService.addEffectsToProduct('prod-1', [
        { featureCode: 'max_storage', value: 10 },
      ]);

      expect(prismaMock.productEffect.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [
            expect.objectContaining({
              productId: 'prod-1',
              featureId: 'f1',
              effectType: 'ADD', // default
              value: 10,
              isPermanent: false, // default
            }),
          ],
          skipDuplicates: true,
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // updateProductEffect
  // -------------------------------------------------------------------------
  describe('updateProductEffect', () => {
    it('should throw when feature not found', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(null);

      await expect(
        productService.updateProductEffect('prod-1', 'nonexistent', { value: 20 })
      ).rejects.toThrow('Feature não encontrada');
    });

    it('should update effect and return refreshed product', async () => {
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'f1', code: 'max_storage' });
      prismaMock.productEffect.update.mockResolvedValue({});
      prismaMock.product.findFirst.mockResolvedValue(makeProduct()); // getProductById

      await productService.updateProductEffect('prod-1', 'max_storage', { value: 50 });

      expect(prismaMock.productEffect.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            productId_featureId: { productId: 'prod-1', featureId: 'f1' },
          },
          data: { value: 50 },
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // removeProductEffect
  // -------------------------------------------------------------------------
  describe('removeProductEffect', () => {
    it('should throw when feature not found', async () => {
      prismaMock.feature.findUnique.mockResolvedValue(null);

      await expect(
        productService.removeProductEffect('prod-1', 'nonexistent')
      ).rejects.toThrow('Feature não encontrada');
    });

    it('should delete effect association', async () => {
      prismaMock.feature.findUnique.mockResolvedValue({ id: 'f1', code: 'max_storage' });
      prismaMock.productEffect.delete.mockResolvedValue({});

      const result = await productService.removeProductEffect('prod-1', 'max_storage');

      expect(prismaMock.productEffect.delete).toHaveBeenCalledWith({
        where: {
          productId_featureId: { productId: 'prod-1', featureId: 'f1' },
        },
      });
      expect(result.message).toContain('removido');
    });
  });
});
