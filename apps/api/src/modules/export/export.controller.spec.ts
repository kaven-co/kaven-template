import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks (vi.hoisted pattern)
// ---------------------------------------------------------------------------

const prismaMock = vi.hoisted(() => ({
  user: {
    findMany: vi.fn(),
  },
  auditLog: {
    findMany: vi.fn(),
  },
}));

const exportServiceMock = vi.hoisted(() => ({
  generateCSV: vi.fn(),
}));

vi.mock('../../lib/prisma', () => ({
  prisma: prismaMock,
}));

vi.mock('../../services/export.service', () => ({
  exportService: exportServiceMock,
}));

// Mock isomorphic-dompurify
vi.mock('isomorphic-dompurify', () => ({
  sanitize: (val: string) => val,
}));

import { exportController } from './controllers/export.controller';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(overrides: Record<string, any> = {}): any {
  return {
    tenantId: 'tenant-1',
    query: {},
    user: { id: 'user-1' },
    ip: '127.0.0.1',
    headers: { 'user-agent': 'vitest' },
    ...overrides,
  };
}

function makeReply(): any {
  const reply: any = {
    statusCode: 200,
    _body: undefined as any,
    _headers: {} as Record<string, string>,
  };
  reply.status = vi.fn((code: number) => {
    reply.statusCode = code;
    return reply;
  });
  reply.send = vi.fn((body: any) => {
    reply._body = body;
    return reply;
  });
  reply.header = vi.fn((key: string, val: string) => {
    reply._headers[key] = val;
    return reply;
  });
  return reply;
}

function makeUser(overrides: Record<string, any> = {}) {
  return {
    id: 'u-1',
    name: 'Alice',
    email: 'alice@example.com',
    phone: '+5511999999999',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date('2026-01-15'),
    ...overrides,
  };
}

function makeAuditLog(overrides: Record<string, any> = {}) {
  return {
    id: 'log-1',
    createdAt: new Date('2026-01-15'),
    action: 'user.create',
    entity: 'User',
    entityId: 'u-1',
    ipAddress: '127.0.0.1',
    metadata: { foo: 'bar' },
    user: { email: 'alice@example.com' },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ExportController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // exportUsers
  // -----------------------------------------------------------------------
  describe('exportUsers', () => {
    it('should return 400 when tenantId is missing', async () => {
      const req = makeRequest({ tenantId: undefined });
      const reply = makeReply();

      await exportController.exportUsers(req, reply);

      expect(reply.status).toHaveBeenCalledWith(400);
      expect(reply._body.error).toContain('Tenant ID');
    });

    it('should fetch users scoped to tenant and generate CSV', async () => {
      const users = [makeUser()];
      prismaMock.user.findMany.mockResolvedValue(users);
      exportServiceMock.generateCSV.mockResolvedValue('csv-content');

      const req = makeRequest();
      const reply = makeReply();

      await exportController.exportUsers(req, reply);

      // Verify tenant scoping
      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: 'tenant-1' }),
        })
      );

      // Verify exportService called with correct args
      expect(exportServiceMock.generateCSV).toHaveBeenCalledWith(
        expect.objectContaining({
          entity: 'User',
          data: users,
          tenantId: 'tenant-1',
          actorId: 'user-1',
        })
      );

      // Verify CSV response headers
      expect(reply.header).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(reply.header).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('users-export-')
      );
      expect(reply.send).toHaveBeenCalledWith('csv-content');
    });

    it('should apply role filter when provided', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);
      exportServiceMock.generateCSV.mockResolvedValue('');

      const req = makeRequest({ query: { role: 'ADMIN' } });
      const reply = makeReply();

      await exportController.exportUsers(req, reply);

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ role: 'ADMIN' }),
        })
      );
    });

    it('should apply status filter when provided', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);
      exportServiceMock.generateCSV.mockResolvedValue('');

      const req = makeRequest({ query: { status: 'ACTIVE' } });
      const reply = makeReply();

      await exportController.exportUsers(req, reply);

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'ACTIVE' }),
        })
      );
    });

    it('should apply search filter with OR clause', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);
      exportServiceMock.generateCSV.mockResolvedValue('');

      const req = makeRequest({ query: { search: 'alice' } });
      const reply = makeReply();

      await exportController.exportUsers(req, reply);

      expect(prismaMock.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'alice', mode: 'insensitive' } },
              { email: { contains: 'alice', mode: 'insensitive' } },
            ],
          }),
        })
      );
    });

    it('should ignore role=all and status=all filters', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);
      exportServiceMock.generateCSV.mockResolvedValue('');

      const req = makeRequest({ query: { role: 'all', status: 'all' } });
      const reply = makeReply();

      await exportController.exportUsers(req, reply);

      const callArgs = prismaMock.user.findMany.mock.calls[0][0];
      expect(callArgs.where).not.toHaveProperty('role');
      expect(callArgs.where).not.toHaveProperty('status');
    });

    it('should fallback actorId to system when user is undefined', async () => {
      prismaMock.user.findMany.mockResolvedValue([]);
      exportServiceMock.generateCSV.mockResolvedValue('');

      const req = makeRequest({ user: undefined });
      const reply = makeReply();

      await exportController.exportUsers(req, reply);

      expect(exportServiceMock.generateCSV).toHaveBeenCalledWith(
        expect.objectContaining({ actorId: 'system' })
      );
    });
  });

  // -----------------------------------------------------------------------
  // exportAuditLogs
  // -----------------------------------------------------------------------
  describe('exportAuditLogs', () => {
    it('should fetch audit logs scoped to tenant and generate CSV', async () => {
      const logs = [makeAuditLog()];
      prismaMock.auditLog.findMany.mockResolvedValue(logs);
      exportServiceMock.generateCSV.mockResolvedValue('audit-csv');

      const req = makeRequest();
      const reply = makeReply();

      await exportController.exportAuditLogs(req, reply);

      expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
          take: 5000,
        })
      );

      expect(exportServiceMock.generateCSV).toHaveBeenCalledWith(
        expect.objectContaining({
          entity: 'AuditLog',
          tenantId: 'tenant-1',
        })
      );

      expect(reply.header).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(reply.header).toHaveBeenCalledWith(
        'Content-Disposition',
        expect.stringContaining('audit-logs-export-')
      );
      expect(reply.send).toHaveBeenCalledWith('audit-csv');
    });

    it('should fetch all logs when tenantId is not set (super admin)', async () => {
      prismaMock.auditLog.findMany.mockResolvedValue([]);
      exportServiceMock.generateCSV.mockResolvedValue('');

      const req = makeRequest({ tenantId: undefined });
      const reply = makeReply();

      await exportController.exportAuditLogs(req, reply);

      expect(prismaMock.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} })
      );
    });

    it('should format log metadata as JSON string', async () => {
      const logs = [makeAuditLog({ metadata: { key: 'value' } })];
      prismaMock.auditLog.findMany.mockResolvedValue(logs);
      exportServiceMock.generateCSV.mockResolvedValue('');

      const req = makeRequest();
      const reply = makeReply();

      await exportController.exportAuditLogs(req, reply);

      const csvCall = exportServiceMock.generateCSV.mock.calls[0][0];
      expect(csvCall.data[0].metadataStr).toBe('{"key":"value"}');
    });

    it('should set userEmail to N/A when user relation is missing', async () => {
      const logs = [makeAuditLog({ user: null })];
      prismaMock.auditLog.findMany.mockResolvedValue(logs);
      exportServiceMock.generateCSV.mockResolvedValue('');

      const req = makeRequest();
      const reply = makeReply();

      await exportController.exportAuditLogs(req, reply);

      const csvCall = exportServiceMock.generateCSV.mock.calls[0][0];
      expect(csvCall.data[0].userEmail).toBe('N/A');
    });

    it('should use system as tenantId when tenantId is absent', async () => {
      prismaMock.auditLog.findMany.mockResolvedValue([]);
      exportServiceMock.generateCSV.mockResolvedValue('');

      const req = makeRequest({ tenantId: undefined });
      const reply = makeReply();

      await exportController.exportAuditLogs(req, reply);

      expect(exportServiceMock.generateCSV).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: 'system' })
      );
    });
  });
});
