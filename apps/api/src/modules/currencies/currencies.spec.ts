import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Prisma mock (vi.hoisted pattern)
// ---------------------------------------------------------------------------

const prismaMock = vi.hoisted(() => ({
  currency: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../../lib/prisma', () => ({
  prisma: prismaMock,
}));

// Mock isomorphic-dompurify — sanitize returns the input unchanged for tests
vi.mock('isomorphic-dompurify', () => ({
  sanitize: (val: string) => val,
}));

// ---------------------------------------------------------------------------
// We import the route registration function so we can call handlers directly
// by building a minimal Fastify-like app stub.
// ---------------------------------------------------------------------------

import { currenciesRoutes } from './routes/currencies.routes';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCurrency(overrides: Record<string, any> = {}) {
  return {
    id: 'cur-1',
    code: 'BRL',
    name: 'Brazilian Real',
    symbol: 'R$',
    iconType: 'TEXT',
    iconSvgPath: null,
    decimals: 2,
    isActive: true,
    isCrypto: false,
    sortOrder: 0,
    metadata: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

/**
 * Build a minimal Fastify-like stub that captures registered handlers
 * so we can invoke them directly without booting a real server.
 */
function buildApp() {
  const routes: Record<string, Record<string, Function>> = {};

  const app: any = {
    log: { error: vi.fn() },
  };

  for (const method of ['get', 'post', 'put', 'delete'] as const) {
    app[method] = vi.fn((path: string, handler: Function) => {
      if (!routes[method]) routes[method] = {};
      routes[method][path] = handler;
    });
  }

  return { app, routes };
}

function makeRequest(overrides: Record<string, any> = {}): any {
  return {
    query: {},
    params: {},
    body: {},
    ...overrides,
  };
}

function makeReply(): any {
  const reply: any = {
    statusCode: 200,
    _body: undefined as any,
  };
  reply.status = vi.fn((code: number) => {
    reply.statusCode = code;
    return reply;
  });
  reply.send = vi.fn((body: any) => {
    reply._body = body;
    return reply;
  });
  return reply;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CurrenciesRoutes', () => {
  let routes: Record<string, Record<string, Function>>;
  let app: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const built = buildApp();
    app = built.app;
    routes = built.routes;
    await currenciesRoutes(app);
  });

  // -----------------------------------------------------------------------
  // GET / — list currencies
  // -----------------------------------------------------------------------
  describe('GET /', () => {
    it('should return only active currencies by default', async () => {
      const currencies = [makeCurrency()];
      prismaMock.currency.findMany.mockResolvedValue(currencies);

      const req = makeRequest();
      const reply = makeReply();
      await routes.get['/']( req, reply);

      expect(prismaMock.currency.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        })
      );
      expect(reply.send).toHaveBeenCalledWith(currencies);
    });

    it('should return all currencies when includeInactive=true', async () => {
      prismaMock.currency.findMany.mockResolvedValue([]);

      const req = makeRequest({ query: { includeInactive: 'true' } });
      const reply = makeReply();
      await routes.get['/']( req, reply);

      expect(prismaMock.currency.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      );
    });

    it('should return 500 on database error', async () => {
      prismaMock.currency.findMany.mockRejectedValue(new Error('DB down'));

      const req = makeRequest();
      const reply = makeReply();
      await routes.get['/']( req, reply);

      expect(reply.status).toHaveBeenCalledWith(500);
      expect(reply._body).toEqual({ error: 'Failed to fetch currencies' });
    });
  });

  // -----------------------------------------------------------------------
  // POST / — create currency
  // -----------------------------------------------------------------------
  describe('POST /', () => {
    it('should create a new currency', async () => {
      const input = {
        code: 'usd',
        name: 'US Dollar',
        symbol: '$',
        iconType: 'TEXT',
        decimals: 2,
        isActive: true,
        isCrypto: false,
        sortOrder: 1,
      };
      prismaMock.currency.findUnique.mockResolvedValue(null);
      const created = makeCurrency({ code: 'USD', name: 'US Dollar', symbol: '$' });
      prismaMock.currency.create.mockResolvedValue(created);

      const req = makeRequest({ body: input });
      const reply = makeReply();
      await routes.post['/']( req, reply);

      expect(prismaMock.currency.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ code: 'USD' }),
        })
      );
      expect(reply.status).toHaveBeenCalledWith(201);
      expect(reply._body).toEqual(created);
    });

    it('should return 400 when code is missing', async () => {
      const req = makeRequest({ body: { name: 'No Code' } });
      const reply = makeReply();
      await routes.post['/']( req, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply._body.error).toContain('Currency code is required');
    });

    it('should return 400 when code already exists', async () => {
      prismaMock.currency.findUnique.mockResolvedValue(makeCurrency());

      const req = makeRequest({ body: { code: 'BRL', name: 'Dup' } });
      const reply = makeReply();
      await routes.post['/']( req, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply._body.error).toContain('already exists');
    });

    it('should return 500 on database error', async () => {
      prismaMock.currency.findUnique.mockResolvedValue(null);
      prismaMock.currency.create.mockRejectedValue(new Error('DB'));

      const req = makeRequest({ body: { code: 'EUR', name: 'Euro' } });
      const reply = makeReply();
      await routes.post['/']( req, reply);

      expect(reply.status).toHaveBeenCalledWith(500);
    });
  });

  // -----------------------------------------------------------------------
  // GET /:code — get currency by code
  // -----------------------------------------------------------------------
  describe('GET /:code', () => {
    it('should return currency when found', async () => {
      const currency = makeCurrency();
      prismaMock.currency.findUnique.mockResolvedValue(currency);

      const req = makeRequest({ params: { code: 'brl' } });
      const reply = makeReply();
      await routes.get['/:code']( req, reply);

      expect(prismaMock.currency.findUnique).toHaveBeenCalledWith({
        where: { code: 'BRL' },
      });
      expect(reply.send).toHaveBeenCalledWith(currency);
    });

    it('should return 404 when currency not found', async () => {
      prismaMock.currency.findUnique.mockResolvedValue(null);

      const req = makeRequest({ params: { code: 'XYZ' } });
      const reply = makeReply();
      await routes.get['/:code']( req, reply);

      expect(reply.status).toHaveBeenCalledWith(404);
      expect(reply._body.error).toContain('not found');
    });

    it('should return 500 on database error', async () => {
      prismaMock.currency.findUnique.mockRejectedValue(new Error('DB'));

      const req = makeRequest({ params: { code: 'BRL' } });
      const reply = makeReply();
      await routes.get['/:code']( req, reply);

      expect(reply.status).toHaveBeenCalledWith(500);
    });
  });

  // -----------------------------------------------------------------------
  // PUT /:code — update currency
  // -----------------------------------------------------------------------
  describe('PUT /:code', () => {
    it('should update an existing currency', async () => {
      const existing = makeCurrency();
      const updated = makeCurrency({ name: 'Real Brasileiro' });

      prismaMock.currency.findUnique.mockResolvedValue(existing);
      prismaMock.currency.update.mockResolvedValue(updated);

      const req = makeRequest({
        params: { code: 'BRL' },
        body: { name: 'Real Brasileiro' },
      });
      const reply = makeReply();
      await routes.put['/:code']( req, reply);

      expect(prismaMock.currency.update).toHaveBeenCalled();
      expect(reply.send).toHaveBeenCalledWith(updated);
    });

    it('should return 404 when currency does not exist', async () => {
      prismaMock.currency.findUnique.mockResolvedValue(null);

      const req = makeRequest({ params: { code: 'XYZ' }, body: { name: 'X' } });
      const reply = makeReply();
      await routes.put['/:code']( req, reply);

      expect(reply.status).toHaveBeenCalledWith(404);
    });

    it('should return 400 when changing to an existing code', async () => {
      const existing = makeCurrency({ code: 'BRL' });
      const conflicting = makeCurrency({ code: 'USD' });

      prismaMock.currency.findUnique
        .mockResolvedValueOnce(existing)   // lookup current
        .mockResolvedValueOnce(conflicting); // lookup new code

      const req = makeRequest({
        params: { code: 'BRL' },
        body: { code: 'USD' },
      });
      const reply = makeReply();
      await routes.put['/:code']( req, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply._body.error).toContain('already exists');
    });

    it('should return 500 on database error', async () => {
      prismaMock.currency.findUnique.mockResolvedValue(makeCurrency());
      prismaMock.currency.update.mockRejectedValue(new Error('DB'));

      const req = makeRequest({ params: { code: 'BRL' }, body: { name: 'X' } });
      const reply = makeReply();
      await routes.put['/:code']( req, reply);

      expect(reply.status).toHaveBeenCalledWith(500);
    });
  });

  // -----------------------------------------------------------------------
  // DELETE /:code — soft-delete (deactivate) currency
  // -----------------------------------------------------------------------
  describe('DELETE /:code', () => {
    it('should deactivate an existing currency', async () => {
      prismaMock.currency.findUnique.mockResolvedValue(makeCurrency());
      prismaMock.currency.update.mockResolvedValue({});

      const req = makeRequest({ params: { code: 'BRL' } });
      const reply = makeReply();
      await routes.delete['/:code']( req, reply);

      expect(prismaMock.currency.update).toHaveBeenCalledWith({
        where: { code: 'BRL' },
        data: { isActive: false },
      });
      expect(reply._body.message).toContain('deactivated');
    });

    it('should return 404 when currency does not exist', async () => {
      prismaMock.currency.findUnique.mockResolvedValue(null);

      const req = makeRequest({ params: { code: 'XYZ' } });
      const reply = makeReply();
      await routes.delete['/:code']( req, reply);

      expect(reply.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 on database error', async () => {
      prismaMock.currency.findUnique.mockResolvedValue(makeCurrency());
      prismaMock.currency.update.mockRejectedValue(new Error('DB'));

      const req = makeRequest({ params: { code: 'BRL' } });
      const reply = makeReply();
      await routes.delete['/:code']( req, reply);

      expect(reply.status).toHaveBeenCalledWith(500);
    });
  });
});
