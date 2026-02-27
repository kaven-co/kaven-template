import { vi } from 'vitest';

/**
 * Creates a reusable Prisma mock factory.
 *
 * Usage inside vi.hoisted():
 *   const prismaMock = vi.hoisted(() => createPrismaMock('product', 'feature'));
 *
 * Or call directly when you need a quick mock for a single model:
 *   const mock = createModelMock();
 */

type ModelMock = {
  findMany: ReturnType<typeof vi.fn>;
  findFirst: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  createMany: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  updateMany: ReturnType<typeof vi.fn>;
  upsert: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  deleteMany: ReturnType<typeof vi.fn>;
  count: ReturnType<typeof vi.fn>;
  aggregate: ReturnType<typeof vi.fn>;
};

/**
 * Creates a mock object for a single Prisma model with all common methods.
 */
export function createModelMock(): ModelMock {
  return {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    createMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
  };
}

/**
 * Creates a Prisma client mock with the specified model names.
 *
 * @param modelNames - List of Prisma model names (camelCase, e.g. 'plan', 'planFeature')
 * @returns An object with each model as a key containing mock methods, plus $transaction
 *
 * @example
 * const prismaMock = vi.hoisted(() => createPrismaMock('plan', 'planFeature', 'feature'));
 * vi.mock('../../../lib/prisma', () => ({ prisma: prismaMock }));
 */
export function createPrismaMock<T extends string>(
  ...modelNames: T[]
): Record<T, ModelMock> & { $transaction: ReturnType<typeof vi.fn> } {
  const mock: any = {
    $transaction: vi.fn((callback: any) => callback(mock)),
  };

  for (const name of modelNames) {
    mock[name] = createModelMock();
  }

  return mock;
}
