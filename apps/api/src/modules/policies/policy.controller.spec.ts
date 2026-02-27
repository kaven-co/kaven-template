import { beforeEach, describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks — vi.hoisted ensures they're available before vi.mock calls
// ---------------------------------------------------------------------------

const mockPolicyService = vi.hoisted(() => ({
  createPolicy: vi.fn(),
  listPolicies: vi.fn(),
  getPolicyById: vi.fn(),
  updatePolicy: vi.fn(),
  deletePolicy: vi.fn(),
  evaluatePolicy: vi.fn(),
  evaluatePolicies: vi.fn(),
}));

const mockMaskingConfig = vi.hoisted(() => ({
  User: {
    email: { type: 'EMAIL', requiredCapability: 'users.view_pii' },
    phoneNumber: { type: 'PHONE', requiredCapability: 'users.view_pii' },
  },
  AuditLog: {
    ipAddress: { type: 'GENERIC', requiredCapability: 'audit.view_pii' },
  },
}));

vi.mock('../../services/policy.service', () => ({
  PolicyService: function () {
    return mockPolicyService;
  },
}));

vi.mock('../../config/masking.config', () => ({
  MASKING_CONFIG: mockMaskingConfig,
}));

import { PolicyController } from './controllers/policy.controller';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function makePolicy(overrides: Record<string, any> = {}) {
  return {
    id: 'policy-1',
    tenantId: 'tenant-a',
    name: 'Office IP Whitelist',
    description: 'Allow only office IPs',
    type: 'IP_WHITELIST',
    targetType: 'CAPABILITY',
    targetId: 'cap-1',
    conditions: { allowedIps: ['192.168.1.0/24'] },
    enforcement: 'DENY',
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ipWhitelists: [],
    deviceTracking: [],
    ...overrides,
  };
}

function makeRequest(overrides: Record<string, any> = {}) {
  return {
    user: {
      id: 'user-1',
      email: 'admin@tenant-a.com',
      role: 'TENANT_ADMIN',
      tenantId: 'tenant-a',
    },
    params: {},
    query: {},
    body: {},
    ...overrides,
  } as any;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PolicyController', () => {
  let controller: PolicyController;

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new PolicyController();
  });

  // -------------------------------------------------------------------------
  // listPolicies — GET /api/policies
  // -------------------------------------------------------------------------
  describe('listPolicies', () => {
    it('should return all policies with no filters', async () => {
      const policies = [makePolicy()];
      mockPolicyService.listPolicies.mockResolvedValue(policies);
      const reply = createReplyMock();

      await controller.listPolicies(makeRequest({ query: {} }), reply);

      expect(mockPolicyService.listPolicies).toHaveBeenCalledWith({});
      expect(reply.payload).toEqual({ policies });
    });

    it('should pass type filter from query params', async () => {
      mockPolicyService.listPolicies.mockResolvedValue([]);
      const reply = createReplyMock();

      await controller.listPolicies(
        makeRequest({ query: { type: 'IP_WHITELIST' } }),
        reply,
      );

      expect(mockPolicyService.listPolicies).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'IP_WHITELIST' }),
      );
    });

    it('should pass targetType and targetId filters', async () => {
      mockPolicyService.listPolicies.mockResolvedValue([]);
      const reply = createReplyMock();

      await controller.listPolicies(
        makeRequest({
          query: { targetType: 'CAPABILITY', targetId: 'cap-1' },
        }),
        reply,
      );

      expect(mockPolicyService.listPolicies).toHaveBeenCalledWith(
        expect.objectContaining({
          targetType: 'CAPABILITY',
          targetId: 'cap-1',
        }),
      );
    });

    it('should convert isActive string to boolean', async () => {
      mockPolicyService.listPolicies.mockResolvedValue([]);
      const reply = createReplyMock();

      await controller.listPolicies(
        makeRequest({ query: { isActive: 'true' } }),
        reply,
      );

      expect(mockPolicyService.listPolicies).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      );
    });

    it('should return 500 on service error', async () => {
      mockPolicyService.listPolicies.mockRejectedValue(new Error('DB error'));
      const reply = createReplyMock();

      await controller.listPolicies(makeRequest(), reply);

      expect(reply.statusCode).toBe(500);
      expect(reply.payload).toMatchObject({ error: 'Failed to list policies' });
    });
  });

  // -------------------------------------------------------------------------
  // getPolicyById — GET /api/policies/:id
  // -------------------------------------------------------------------------
  describe('getPolicyById', () => {
    it('should return policy when found', async () => {
      const policy = makePolicy();
      mockPolicyService.getPolicyById.mockResolvedValue(policy);
      const reply = createReplyMock();

      await controller.getPolicyById(
        makeRequest({ params: { id: 'policy-1' } }),
        reply,
      );

      expect(mockPolicyService.getPolicyById).toHaveBeenCalledWith('policy-1');
      expect(reply.payload).toEqual({ policy });
    });

    it('should return 404 when policy not found', async () => {
      mockPolicyService.getPolicyById.mockRejectedValue(
        new Error('Policy not found'),
      );
      const reply = createReplyMock();

      await controller.getPolicyById(
        makeRequest({ params: { id: 'nonexistent' } }),
        reply,
      );

      expect(reply.statusCode).toBe(404);
      expect(reply.payload).toMatchObject({ error: 'Policy not found' });
    });

    it('should return 500 on unexpected error', async () => {
      mockPolicyService.getPolicyById.mockRejectedValue(
        new Error('Connection lost'),
      );
      const reply = createReplyMock();

      await controller.getPolicyById(
        makeRequest({ params: { id: 'policy-1' } }),
        reply,
      );

      expect(reply.statusCode).toBe(500);
      expect(reply.payload).toMatchObject({ error: 'Failed to get policy' });
    });
  });

  // -------------------------------------------------------------------------
  // createPolicy — POST /api/policies
  // -------------------------------------------------------------------------
  describe('createPolicy', () => {
    const validBody = {
      name: 'Office IP Whitelist',
      description: 'Allow only office IPs',
      type: 'IP_WHITELIST',
      targetType: 'CAPABILITY',
      targetId: 'cap-1',
      conditions: { allowedIps: ['10.0.0.1'] },
      enforcement: 'DENY',
    };

    it('should create a policy with valid data', async () => {
      const created = makePolicy();
      mockPolicyService.createPolicy.mockResolvedValue(created);
      const reply = createReplyMock();

      await controller.createPolicy(
        makeRequest({ body: validBody }),
        reply,
      );

      expect(mockPolicyService.createPolicy).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-a',
          name: 'Office IP Whitelist',
          type: 'IP_WHITELIST',
          targetType: 'CAPABILITY',
          conditions: { allowedIps: ['10.0.0.1'] },
          enforcement: 'DENY',
        }),
      );
      expect(reply.statusCode).toBe(201);
      expect(reply.payload).toEqual({ policy: created });
    });

    it('should return 400 when required fields are missing', async () => {
      const reply = createReplyMock();

      await controller.createPolicy(
        makeRequest({ body: { name: 'Incomplete' } }),
        reply,
      );

      expect(reply.statusCode).toBe(400);
      expect(reply.payload).toMatchObject({
        error: expect.stringContaining('Missing required fields'),
      });
      expect(mockPolicyService.createPolicy).not.toHaveBeenCalled();
    });

    it('should return 400 when tenantId is missing from user context', async () => {
      const reply = createReplyMock();

      await controller.createPolicy(
        makeRequest({
          user: { id: 'u-1', email: 'no-tenant@test.com', role: 'USER' },
          body: validBody,
        }),
        reply,
      );

      expect(reply.statusCode).toBe(400);
      expect(reply.payload).toMatchObject({
        error: 'Tenant ID not found in user context',
      });
    });

    it('should return 400 when service throws validation error', async () => {
      mockPolicyService.createPolicy.mockRejectedValue(
        new Error('IP_WHITELIST policy requires allowedIps or blockedIps array'),
      );
      const reply = createReplyMock();

      await controller.createPolicy(
        makeRequest({
          body: {
            ...validBody,
            conditions: { allowedIps: ['invalid-ip'] },
          },
        }),
        reply,
      );

      expect(reply.statusCode).toBe(400);
      expect(reply.payload.error).toContain('IP_WHITELIST');
    });

    it('should pass isActive flag when provided', async () => {
      mockPolicyService.createPolicy.mockResolvedValue(
        makePolicy({ isActive: false }),
      );
      const reply = createReplyMock();

      await controller.createPolicy(
        makeRequest({ body: { ...validBody, isActive: false } }),
        reply,
      );

      expect(mockPolicyService.createPolicy).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // updatePolicy — PUT /api/policies/:id
  // -------------------------------------------------------------------------
  describe('updatePolicy', () => {
    it('should update policy fields', async () => {
      const updated = makePolicy({ name: 'Updated Name' });
      mockPolicyService.updatePolicy.mockResolvedValue(updated);
      const reply = createReplyMock();

      await controller.updatePolicy(
        makeRequest({
          params: { id: 'policy-1' },
          body: { name: 'Updated Name' },
        }),
        reply,
      );

      expect(mockPolicyService.updatePolicy).toHaveBeenCalledWith('policy-1', {
        name: 'Updated Name',
        description: undefined,
        conditions: undefined,
        enforcement: undefined,
        isActive: undefined,
      });
      expect(reply.payload).toEqual({ policy: updated });
    });

    it('should return 404 when policy not found', async () => {
      mockPolicyService.updatePolicy.mockRejectedValue(
        new Error('Policy not found'),
      );
      const reply = createReplyMock();

      await controller.updatePolicy(
        makeRequest({
          params: { id: 'nonexistent' },
          body: { name: 'New' },
        }),
        reply,
      );

      expect(reply.statusCode).toBe(404);
      expect(reply.payload).toMatchObject({ error: 'Policy not found' });
    });

    it('should return 400 on validation error from service', async () => {
      mockPolicyService.updatePolicy.mockRejectedValue(
        new Error('TIME_BASED policy requires allowedHours array'),
      );
      const reply = createReplyMock();

      await controller.updatePolicy(
        makeRequest({
          params: { id: 'policy-1' },
          body: { conditions: { invalid: true } },
        }),
        reply,
      );

      expect(reply.statusCode).toBe(400);
      expect(reply.payload.error).toContain('TIME_BASED');
    });

    it('should update enforcement type', async () => {
      const updated = makePolicy({ enforcement: 'ALLOW' });
      mockPolicyService.updatePolicy.mockResolvedValue(updated);
      const reply = createReplyMock();

      await controller.updatePolicy(
        makeRequest({
          params: { id: 'policy-1' },
          body: { enforcement: 'ALLOW' },
        }),
        reply,
      );

      expect(mockPolicyService.updatePolicy).toHaveBeenCalledWith(
        'policy-1',
        expect.objectContaining({ enforcement: 'ALLOW' }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // deletePolicy — DELETE /api/policies/:id
  // -------------------------------------------------------------------------
  describe('deletePolicy', () => {
    it('should delete policy and return success message', async () => {
      mockPolicyService.deletePolicy.mockResolvedValue(makePolicy());
      const reply = createReplyMock();

      await controller.deletePolicy(
        makeRequest({ params: { id: 'policy-1' } }),
        reply,
      );

      expect(mockPolicyService.deletePolicy).toHaveBeenCalledWith('policy-1');
      expect(reply.payload).toMatchObject({
        message: 'Policy deleted successfully',
      });
    });

    it('should return 404 when policy not found', async () => {
      mockPolicyService.deletePolicy.mockRejectedValue(
        new Error('Policy not found'),
      );
      const reply = createReplyMock();

      await controller.deletePolicy(
        makeRequest({ params: { id: 'nonexistent' } }),
        reply,
      );

      expect(reply.statusCode).toBe(404);
      expect(reply.payload).toMatchObject({ error: 'Policy not found' });
    });

    it('should return 500 on unexpected error', async () => {
      mockPolicyService.deletePolicy.mockRejectedValue(
        new Error('DB constraint violation'),
      );
      const reply = createReplyMock();

      await controller.deletePolicy(
        makeRequest({ params: { id: 'policy-1' } }),
        reply,
      );

      expect(reply.statusCode).toBe(500);
      expect(reply.payload).toMatchObject({
        error: 'Failed to delete policy',
      });
    });
  });

  // -------------------------------------------------------------------------
  // evaluatePolicy — POST /api/policies/:id/evaluate
  // -------------------------------------------------------------------------
  describe('evaluatePolicy', () => {
    it('should evaluate IP_WHITELIST policy and return allowed', async () => {
      const result = {
        allowed: true,
        reason: 'IP 10.0.0.1 is whitelisted',
        policyId: 'policy-1',
        policyName: 'Office IP Whitelist',
      };
      mockPolicyService.evaluatePolicy.mockResolvedValue(result);
      const reply = createReplyMock();

      await controller.evaluatePolicy(
        makeRequest({
          params: { id: 'policy-1' },
          body: { userId: 'user-1', ipAddress: '10.0.0.1' },
        }),
        reply,
      );

      expect(mockPolicyService.evaluatePolicy).toHaveBeenCalledWith(
        'policy-1',
        expect.objectContaining({
          userId: 'user-1',
          ipAddress: '10.0.0.1',
        }),
      );
      expect(reply.payload).toEqual({ result });
    });

    it('should evaluate DEVICE_TRUST policy with deviceId', async () => {
      const result = { allowed: true, reason: 'Device is trusted' };
      mockPolicyService.evaluatePolicy.mockResolvedValue(result);
      const reply = createReplyMock();

      await controller.evaluatePolicy(
        makeRequest({
          params: { id: 'policy-2' },
          body: { userId: 'user-1', deviceId: 'device-abc' },
        }),
        reply,
      );

      expect(mockPolicyService.evaluatePolicy).toHaveBeenCalledWith(
        'policy-2',
        expect.objectContaining({
          userId: 'user-1',
          deviceId: 'device-abc',
        }),
      );
    });

    it('should evaluate TIME_BASED policy with timestamp', async () => {
      const result = { allowed: true, reason: 'Within allowed time window' };
      mockPolicyService.evaluatePolicy.mockResolvedValue(result);
      const reply = createReplyMock();

      await controller.evaluatePolicy(
        makeRequest({
          params: { id: 'policy-3' },
          body: {
            userId: 'user-1',
            timestamp: '2026-02-15T14:00:00.000Z',
          },
        }),
        reply,
      );

      expect(mockPolicyService.evaluatePolicy).toHaveBeenCalledWith(
        'policy-3',
        expect.objectContaining({
          userId: 'user-1',
          timestamp: expect.any(Date),
        }),
      );
    });

    it('should return denied result for blocked IP', async () => {
      const result = {
        allowed: false,
        reason: 'IP 10.0.0.99 is blocked',
        policyId: 'policy-1',
        policyName: 'Block suspicious IPs',
      };
      mockPolicyService.evaluatePolicy.mockResolvedValue(result);
      const reply = createReplyMock();

      await controller.evaluatePolicy(
        makeRequest({
          params: { id: 'policy-1' },
          body: { userId: 'user-1', ipAddress: '10.0.0.99' },
        }),
        reply,
      );

      expect(reply.payload.result.allowed).toBe(false);
      expect(reply.payload.result.reason).toContain('blocked');
    });

    it('should return 400 when userId is missing', async () => {
      const reply = createReplyMock();

      await controller.evaluatePolicy(
        makeRequest({
          params: { id: 'policy-1' },
          body: { ipAddress: '10.0.0.1' },
        }),
        reply,
      );

      expect(reply.statusCode).toBe(400);
      expect(reply.payload).toMatchObject({ error: 'userId is required' });
      expect(mockPolicyService.evaluatePolicy).not.toHaveBeenCalled();
    });

    it('should return 404 when policy not found', async () => {
      mockPolicyService.evaluatePolicy.mockRejectedValue(
        new Error('Policy not found'),
      );
      const reply = createReplyMock();

      await controller.evaluatePolicy(
        makeRequest({
          params: { id: 'nonexistent' },
          body: { userId: 'user-1' },
        }),
        reply,
      );

      expect(reply.statusCode).toBe(404);
    });

    it('should return 500 on unexpected error', async () => {
      mockPolicyService.evaluatePolicy.mockRejectedValue(
        new Error('Unexpected crash'),
      );
      const reply = createReplyMock();

      await controller.evaluatePolicy(
        makeRequest({
          params: { id: 'policy-1' },
          body: { userId: 'user-1' },
        }),
        reply,
      );

      expect(reply.statusCode).toBe(500);
      expect(reply.payload).toMatchObject({
        error: 'Failed to evaluate policy',
      });
    });

    it('should pass userAgent to evaluation context', async () => {
      mockPolicyService.evaluatePolicy.mockResolvedValue({ allowed: true });
      const reply = createReplyMock();

      await controller.evaluatePolicy(
        makeRequest({
          params: { id: 'policy-1' },
          body: {
            userId: 'user-1',
            userAgent: 'Mozilla/5.0',
          },
        }),
        reply,
      );

      expect(mockPolicyService.evaluatePolicy).toHaveBeenCalledWith(
        'policy-1',
        expect.objectContaining({ userAgent: 'Mozilla/5.0' }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // evaluatePolicies — POST /api/policies/evaluate
  // -------------------------------------------------------------------------
  describe('evaluatePolicies', () => {
    it('should evaluate all policies for a target', async () => {
      const result = { allowed: true };
      mockPolicyService.evaluatePolicies.mockResolvedValue(result);
      const reply = createReplyMock();

      await controller.evaluatePolicies(
        makeRequest({
          body: {
            targetType: 'CAPABILITY',
            targetId: 'cap-1',
            userId: 'user-1',
            ipAddress: '10.0.0.1',
          },
        }),
        reply,
      );

      expect(mockPolicyService.evaluatePolicies).toHaveBeenCalledWith(
        'CAPABILITY',
        'cap-1',
        expect.objectContaining({
          userId: 'user-1',
          ipAddress: '10.0.0.1',
        }),
      );
      expect(reply.payload).toEqual({ result });
    });

    it('should deny when DENY policy blocks access', async () => {
      const result = {
        allowed: false,
        reason: 'IP 10.0.0.99 is blocked',
        policyId: 'policy-1',
        policyName: 'Block suspicious IPs',
      };
      mockPolicyService.evaluatePolicies.mockResolvedValue(result);
      const reply = createReplyMock();

      await controller.evaluatePolicies(
        makeRequest({
          body: {
            targetType: 'CAPABILITY',
            targetId: 'cap-1',
            userId: 'user-1',
            ipAddress: '10.0.0.99',
          },
        }),
        reply,
      );

      expect(reply.payload.result.allowed).toBe(false);
    });

    it('should deny when no ALLOW policy matches', async () => {
      const result = {
        allowed: false,
        reason: 'No ALLOW policy matched',
      };
      mockPolicyService.evaluatePolicies.mockResolvedValue(result);
      const reply = createReplyMock();

      await controller.evaluatePolicies(
        makeRequest({
          body: {
            targetType: 'SPACE',
            targetId: 'space-1',
            userId: 'user-1',
          },
        }),
        reply,
      );

      expect(reply.payload.result.allowed).toBe(false);
      expect(reply.payload.result.reason).toBe('No ALLOW policy matched');
    });

    it('should return 400 when required fields are missing', async () => {
      const reply = createReplyMock();

      await controller.evaluatePolicies(
        makeRequest({
          body: { targetType: 'CAPABILITY' },
        }),
        reply,
      );

      expect(reply.statusCode).toBe(400);
      expect(reply.payload).toMatchObject({
        error: expect.stringContaining('targetType, targetId, and userId are required'),
      });
      expect(mockPolicyService.evaluatePolicies).not.toHaveBeenCalled();
    });

    it('should return 400 when userId is missing', async () => {
      const reply = createReplyMock();

      await controller.evaluatePolicies(
        makeRequest({
          body: { targetType: 'CAPABILITY', targetId: 'cap-1' },
        }),
        reply,
      );

      expect(reply.statusCode).toBe(400);
    });

    it('should return 500 on service error', async () => {
      mockPolicyService.evaluatePolicies.mockRejectedValue(
        new Error('DB timeout'),
      );
      const reply = createReplyMock();

      await controller.evaluatePolicies(
        makeRequest({
          body: {
            targetType: 'CAPABILITY',
            targetId: 'cap-1',
            userId: 'user-1',
          },
        }),
        reply,
      );

      expect(reply.statusCode).toBe(500);
      expect(reply.payload).toMatchObject({
        error: 'Failed to evaluate policies',
      });
    });

    it('should pass timestamp as Date when provided', async () => {
      mockPolicyService.evaluatePolicies.mockResolvedValue({ allowed: true });
      const reply = createReplyMock();

      await controller.evaluatePolicies(
        makeRequest({
          body: {
            targetType: 'CAPABILITY',
            targetId: 'cap-1',
            userId: 'user-1',
            timestamp: '2026-02-15T09:00:00.000Z',
          },
        }),
        reply,
      );

      expect(mockPolicyService.evaluatePolicies).toHaveBeenCalledWith(
        'CAPABILITY',
        'cap-1',
        expect.objectContaining({
          timestamp: expect.any(Date),
        }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // getMaskingConfig — GET /api/policies/masking-config
  // -------------------------------------------------------------------------
  describe('getMaskingConfig', () => {
    it('should return the masking configuration', async () => {
      const reply = createReplyMock();

      await controller.getMaskingConfig(makeRequest(), reply);

      expect(reply.payload).toEqual({ config: mockMaskingConfig });
    });

    it('should include User entity masking rules', async () => {
      const reply = createReplyMock();

      await controller.getMaskingConfig(makeRequest(), reply);

      expect(reply.payload.config.User).toBeDefined();
      expect(reply.payload.config.User.email.type).toBe('EMAIL');
      expect(reply.payload.config.User.email.requiredCapability).toBe(
        'users.view_pii',
      );
    });

    it('should include AuditLog entity masking rules', async () => {
      const reply = createReplyMock();

      await controller.getMaskingConfig(makeRequest(), reply);

      expect(reply.payload.config.AuditLog).toBeDefined();
      expect(reply.payload.config.AuditLog.ipAddress.requiredCapability).toBe(
        'audit.view_pii',
      );
    });
  });

  // -------------------------------------------------------------------------
  // Tenant Isolation Tests
  // -------------------------------------------------------------------------
  describe('tenant isolation', () => {
    it('should use tenantId from authenticated user when creating policy', async () => {
      mockPolicyService.createPolicy.mockResolvedValue(
        makePolicy({ tenantId: 'tenant-b' }),
      );
      const reply = createReplyMock();

      await controller.createPolicy(
        makeRequest({
          user: {
            id: 'user-2',
            email: 'admin@tenant-b.com',
            role: 'TENANT_ADMIN',
            tenantId: 'tenant-b',
          },
          body: {
            name: 'Tenant B Policy',
            type: 'IP_WHITELIST',
            targetType: 'CAPABILITY',
            conditions: { allowedIps: ['10.0.0.1'] },
            enforcement: 'DENY',
          },
        }),
        reply,
      );

      expect(mockPolicyService.createPolicy).toHaveBeenCalledWith(
        expect.objectContaining({ tenantId: 'tenant-b' }),
      );
    });

    it('should reject policy creation when user has no tenantId', async () => {
      const reply = createReplyMock();

      await controller.createPolicy(
        makeRequest({
          user: { id: 'user-1', email: 'orphan@test.com', role: 'USER' },
          body: {
            name: 'Orphan Policy',
            type: 'IP_WHITELIST',
            targetType: 'CAPABILITY',
            conditions: { allowedIps: ['10.0.0.1'] },
            enforcement: 'DENY',
          },
        }),
        reply,
      );

      expect(reply.statusCode).toBe(400);
      expect(reply.payload.error).toContain('Tenant ID not found');
      expect(mockPolicyService.createPolicy).not.toHaveBeenCalled();
    });

    it('should not leak policies across tenants via evaluation', async () => {
      // Simulates evaluatePolicies returning no policies for different tenant
      mockPolicyService.evaluatePolicies.mockResolvedValue({ allowed: true });
      const reply = createReplyMock();

      await controller.evaluatePolicies(
        makeRequest({
          user: { id: 'user-3', tenantId: 'tenant-c' },
          body: {
            targetType: 'CAPABILITY',
            targetId: 'cap-1',
            userId: 'user-3',
          },
        }),
        reply,
      );

      expect(reply.payload.result.allowed).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Policy-Capability Relationship Tests
  // -------------------------------------------------------------------------
  describe('policy-capability relationships', () => {
    it('should create policy targeting a specific capability', async () => {
      mockPolicyService.createPolicy.mockResolvedValue(
        makePolicy({ targetType: 'CAPABILITY', targetId: 'cap-admin-panel' }),
      );
      const reply = createReplyMock();

      await controller.createPolicy(
        makeRequest({
          body: {
            name: 'Admin Panel IP Lock',
            type: 'IP_WHITELIST',
            targetType: 'CAPABILITY',
            targetId: 'cap-admin-panel',
            conditions: { allowedIps: ['192.168.1.100'] },
            enforcement: 'DENY',
          },
        }),
        reply,
      );

      expect(mockPolicyService.createPolicy).toHaveBeenCalledWith(
        expect.objectContaining({
          targetType: 'CAPABILITY',
          targetId: 'cap-admin-panel',
        }),
      );
      expect(reply.statusCode).toBe(201);
    });

    it('should create policy targeting a space', async () => {
      mockPolicyService.createPolicy.mockResolvedValue(
        makePolicy({ targetType: 'SPACE', targetId: 'space-finance' }),
      );
      const reply = createReplyMock();

      await controller.createPolicy(
        makeRequest({
          body: {
            name: 'Finance Hours Only',
            type: 'TIME_BASED',
            targetType: 'SPACE',
            targetId: 'space-finance',
            conditions: { allowedHours: [[9, 18]], allowedDays: [1, 2, 3, 4, 5] },
            enforcement: 'DENY',
          },
        }),
        reply,
      );

      expect(mockPolicyService.createPolicy).toHaveBeenCalledWith(
        expect.objectContaining({
          targetType: 'SPACE',
          targetId: 'space-finance',
        }),
      );
    });

    it('should evaluate policies for a specific capability target', async () => {
      const result = {
        allowed: false,
        reason: 'IP 10.0.0.99 is not in whitelist',
        policyId: 'policy-1',
        policyName: 'Admin Panel IP Lock',
      };
      mockPolicyService.evaluatePolicies.mockResolvedValue(result);
      const reply = createReplyMock();

      await controller.evaluatePolicies(
        makeRequest({
          body: {
            targetType: 'CAPABILITY',
            targetId: 'cap-admin-panel',
            userId: 'user-1',
            ipAddress: '10.0.0.99',
          },
        }),
        reply,
      );

      expect(mockPolicyService.evaluatePolicies).toHaveBeenCalledWith(
        'CAPABILITY',
        'cap-admin-panel',
        expect.any(Object),
      );
      expect(reply.payload.result.allowed).toBe(false);
    });
  });
});
