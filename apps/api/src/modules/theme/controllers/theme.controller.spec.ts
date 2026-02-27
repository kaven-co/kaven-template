import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Role } from '@prisma/client';
import { themeController } from './theme.controller';

const prismaMock = vi.hoisted(() => ({
  platformConfig: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: prismaMock,
  default: prismaMock,
}));

function createReplyMock() {
  const reply: any = {
    statusCode: 200,
    payload: undefined,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    send(payload: unknown) {
      this.payload = payload;
      return this;
    },
  };
  return reply;
}

describe('ThemeController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should isolate theme lookup by authenticated tenantId', async () => {
    const reply = createReplyMock();
    const updatedAt = new Date('2026-02-13T00:00:00.000Z');

    prismaMock.platformConfig.findFirst.mockResolvedValue({
      id: 'cfg-1',
      tenantId: 'tenant-a',
      companyName: 'Tenant A',
      primaryColor: '#112233',
      logoUrl: null,
      faviconUrl: null,
      updatedAt,
    });

    await themeController.getTheme(
      {
        user: {
          id: 'u-1',
          email: 'a@tenant.com',
          role: Role.TENANT_ADMIN,
          tenantId: 'tenant-a',
        },
      } as any,
      reply
    );

    expect(prismaMock.platformConfig.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-a' },
      })
    );
    expect(reply.statusCode).toBe(200);
    expect(reply.payload).toMatchObject({
      tenantId: 'tenant-a',
      name: 'Tenant A',
      primaryColor: '#112233',
    });
  });

  it('should return 403 when member tries to update theme', async () => {
    const reply = createReplyMock();

    await themeController.upsertTheme(
      {
        user: {
          id: 'u-2',
          email: 'member@tenant.com',
          role: Role.USER,
          tenantId: 'tenant-a',
        },
        body: {
          name: 'Tenant A',
          primaryColor: '#123456',
        },
      } as any,
      reply
    );

    expect(reply.statusCode).toBe(403);
    expect(reply.payload).toMatchObject({
      error: 'Forbidden',
    });
  });

  it('should validate required fields for theme update', async () => {
    const reply = createReplyMock();

    await themeController.upsertTheme(
      {
        user: {
          id: 'u-1',
          email: 'admin@tenant.com',
          role: Role.TENANT_ADMIN,
          tenantId: 'tenant-a',
        },
        body: {
          name: '',
          primaryColor: 'blue',
        },
      } as any,
      reply
    );

    expect(reply.statusCode).toBe(400);
    expect(reply.payload).toMatchObject({
      error: 'Validation error',
    });
  });

  it('should return 401 when user has no tenantId on getTheme', async () => {
    const reply = createReplyMock();

    await themeController.getTheme(
      {
        user: { id: 'u-1', email: 'a@test.com', role: Role.TENANT_ADMIN, tenantId: null },
      } as any,
      reply
    );

    expect(reply.statusCode).toBe(401);
    expect(reply.payload).toMatchObject({ error: 'Unauthorized' });
  });

  it('should return 404 when tenant has no theme config', async () => {
    const reply = createReplyMock();
    prismaMock.platformConfig.findFirst.mockResolvedValue(null);

    await themeController.getTheme(
      {
        user: { id: 'u-1', email: 'a@test.com', role: Role.TENANT_ADMIN, tenantId: 'tenant-a' },
      } as any,
      reply
    );

    expect(reply.statusCode).toBe(404);
    expect(reply.payload).toMatchObject({ error: 'Theme not found' });
  });

  it('should return 401 when user has no tenantId on upsertTheme', async () => {
    const reply = createReplyMock();

    await themeController.upsertTheme(
      {
        user: { id: 'u-1', email: 'a@test.com', role: Role.TENANT_ADMIN, tenantId: null },
        body: { name: 'Test', primaryColor: '#112233' },
      } as any,
      reply
    );

    expect(reply.statusCode).toBe(401);
    expect(reply.payload).toMatchObject({ error: 'Unauthorized' });
  });

  it('should allow SUPER_ADMIN to update theme', async () => {
    const reply = createReplyMock();
    const updatedAt = new Date('2026-02-13T01:00:00.000Z');

    prismaMock.platformConfig.findFirst.mockResolvedValueOnce({ id: 'cfg-1' });
    prismaMock.platformConfig.update.mockResolvedValue({
      id: 'cfg-1',
      tenantId: 'tenant-a',
      companyName: 'Updated',
      primaryColor: '#AABBCC',
      logoUrl: null,
      faviconUrl: null,
      updatedAt,
    });

    await themeController.upsertTheme(
      {
        user: { id: 'u-1', email: 'admin@kaven.com', role: Role.SUPER_ADMIN, tenantId: 'tenant-a' },
        body: { name: 'Updated', primaryColor: '#AABBCC' },
      } as any,
      reply
    );

    expect(prismaMock.platformConfig.update).toHaveBeenCalled();
    expect(reply.statusCode).toBe(200);
    expect(reply.payload).toMatchObject({ name: 'Updated', primaryColor: '#AABBCC' });
  });

  it('should create config when tenant has no theme yet', async () => {
    const reply = createReplyMock();
    const updatedAt = new Date('2026-02-13T01:00:00.000Z');

    prismaMock.platformConfig.findFirst.mockResolvedValueOnce(null);
    prismaMock.platformConfig.create.mockResolvedValue({
      id: 'cfg-new',
      tenantId: 'tenant-a',
      companyName: 'Tenant A',
      primaryColor: '#123456',
      logoUrl: null,
      faviconUrl: null,
      updatedAt,
    });

    await themeController.upsertTheme(
      {
        user: {
          id: 'u-1',
          email: 'admin@tenant.com',
          role: Role.TENANT_ADMIN,
          tenantId: 'tenant-a',
        },
        body: {
          name: 'Tenant A',
          primaryColor: '#123456',
        },
      } as any,
      reply
    );

    expect(prismaMock.platformConfig.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-a',
          companyName: 'Tenant A',
          primaryColor: '#123456',
        }),
      })
    );
    expect(reply.statusCode).toBe(200);
  });
});
