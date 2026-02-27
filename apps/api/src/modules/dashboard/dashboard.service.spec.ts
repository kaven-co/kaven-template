import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Prisma mock (vi.hoisted pattern)
// ---------------------------------------------------------------------------

const prismaMock = vi.hoisted(() => ({
  user: {
    count: vi.fn(),
    findMany: vi.fn(),
  },
  invoice: {
    aggregate: vi.fn(),
    count: vi.fn(),
    findMany: vi.fn(),
  },
  order: {
    count: vi.fn(),
  },
  tenant: {
    count: vi.fn(),
  },
}));

vi.mock('../../lib/prisma', () => ({
  prisma: prismaMock,
}));

import { dashboardService } from './dashboard.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Set up all prisma mocks for a standard getSummaryMetrics call */
function mockSummaryDefaults(overrides: {
  totalUsersCurrent?: number;
  totalUsersPrevious?: number;
  newSignupsCurrent?: number;
  newSignupsPrevious?: number;
  verifiedCurrent?: number;
  verifiedPrevious?: number;
  revenueCurrentSum?: number;
  revenuePreviousSum?: number;
  totalRevenueSum?: number;
  invoicesCurrent?: number;
  invoicesPrevious?: number;
  totalInvoices?: number;
  orderCount?: number;
  activeTenants?: number;
} = {}) {
  const o = {
    totalUsersCurrent: 100,
    totalUsersPrevious: 95,
    newSignupsCurrent: 10,
    newSignupsPrevious: 8,
    verifiedCurrent: 7,
    verifiedPrevious: 6,
    revenueCurrentSum: 5000,
    revenuePreviousSum: 4000,
    totalRevenueSum: 50000,
    invoicesCurrent: 20,
    invoicesPrevious: 15,
    totalInvoices: 200,
    orderCount: 30,
    ...overrides,
  };

  // user.count is called 6 times in sequence:
  // 1) totalUsersCurrent  2) totalUsersPrevious
  // 3) newSignupsCurrent  4) newSignupsPrevious
  // 5) verifiedCurrent    6) verifiedPrevious
  prismaMock.user.count
    .mockResolvedValueOnce(o.totalUsersCurrent)
    .mockResolvedValueOnce(o.totalUsersPrevious)
    .mockResolvedValueOnce(o.newSignupsCurrent)
    .mockResolvedValueOnce(o.newSignupsPrevious)
    .mockResolvedValueOnce(o.verifiedCurrent)
    .mockResolvedValueOnce(o.verifiedPrevious);

  // invoice.aggregate is called 3 times:
  // 1) revenueCurrent  2) revenuePrevious  3) totalRevenue
  prismaMock.invoice.aggregate
    .mockResolvedValueOnce({ _sum: { amountPaid: o.revenueCurrentSum } })
    .mockResolvedValueOnce({ _sum: { amountPaid: o.revenuePreviousSum } })
    .mockResolvedValueOnce({ _sum: { amountPaid: o.totalRevenueSum } });

  // invoice.count is called 3 times:
  // 1) invoicesCurrent  2) invoicesPrevious  3) totalInvoices
  prismaMock.invoice.count
    .mockResolvedValueOnce(o.invoicesCurrent)
    .mockResolvedValueOnce(o.invoicesPrevious)
    .mockResolvedValueOnce(o.totalInvoices);

  // tenant.count: 1 call (active tenants)
  prismaMock.tenant.count.mockResolvedValueOnce(o.activeTenants ?? 5);

  // order.count: 1 call
  prismaMock.order.count.mockResolvedValueOnce(o.orderCount);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------------------------------------------------
  // calculateTrend (private — tested indirectly via getSummaryMetrics)
  // -----------------------------------------------------------------------
  describe('getSummaryMetrics — trend calculation', () => {
    it('should return 100 when previous is 0 and current > 0', async () => {
      mockSummaryDefaults({
        totalUsersCurrent: 10,
        totalUsersPrevious: 0,
      });

      const result = await dashboardService.getSummaryMetrics();

      expect(result.totalUsers.trend).toBe(100);
    });

    it('should return 0 when both current and previous are 0', async () => {
      mockSummaryDefaults({
        newSignupsCurrent: 0,
        newSignupsPrevious: 0,
        verifiedCurrent: 0,
        verifiedPrevious: 0,
      });

      const result = await dashboardService.getSummaryMetrics();

      expect(result.newSignups.trend).toBe(0);
    });

    it('should calculate correct percentage change', async () => {
      // (100 - 80) / 80 * 100 = 25.0
      mockSummaryDefaults({
        totalUsersCurrent: 100,
        totalUsersPrevious: 80,
      });

      const result = await dashboardService.getSummaryMetrics();

      expect(result.totalUsers.trend).toBe(25);
    });

    it('should return negative trend when current < previous', async () => {
      // (5 - 10) / 10 * 100 = -50.0
      mockSummaryDefaults({
        newSignupsCurrent: 5,
        newSignupsPrevious: 10,
        verifiedCurrent: 3,
        verifiedPrevious: 7,
      });

      const result = await dashboardService.getSummaryMetrics();

      expect(result.newSignups.trend).toBe(-50);
    });
  });

  // -----------------------------------------------------------------------
  // getSummaryMetrics — full return shape
  // -----------------------------------------------------------------------
  describe('getSummaryMetrics — return shape', () => {
    it('should return all expected metric keys', async () => {
      mockSummaryDefaults();

      const result = await dashboardService.getSummaryMetrics();

      expect(result).toHaveProperty('totalUsers');
      expect(result).toHaveProperty('newSignups');
      expect(result).toHaveProperty('activationRate');
      expect(result).toHaveProperty('revenue');
      expect(result).toHaveProperty('invoices');
      expect(result).toHaveProperty('orders');
      expect(result).toHaveProperty('tenants');
    });

    it('should compute correct metric values', async () => {
      mockSummaryDefaults({
        totalUsersCurrent: 100,
        totalRevenueSum: 50000,
        totalInvoices: 200,
        orderCount: 30,
      });

      const result = await dashboardService.getSummaryMetrics();

      expect(result.totalUsers.value).toBe(100);
      expect(result.revenue.value).toBe(50000);
      expect(result.invoices.value).toBe(200);
      expect(result.orders.value).toBe(30);
    });

    it('should compute activation rate correctly', async () => {
      // 7 verified out of 10 signups = 70%
      mockSummaryDefaults({
        newSignupsCurrent: 10,
        verifiedCurrent: 7,
      });

      const result = await dashboardService.getSummaryMetrics();

      expect(result.activationRate.value).toBe(70);
    });

    it('should handle zero signups without division error (activation rate = 0)', async () => {
      mockSummaryDefaults({
        newSignupsCurrent: 0,
        newSignupsPrevious: 0,
        verifiedCurrent: 0,
        verifiedPrevious: 0,
      });

      const result = await dashboardService.getSummaryMetrics();

      expect(result.activationRate.value).toBe(0);
      expect(result.activationRate.trend).toBe(0);
    });

    it('should handle null amountPaid sums gracefully', async () => {
      // Override defaults with null sums
      prismaMock.user.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      prismaMock.invoice.aggregate
        .mockResolvedValueOnce({ _sum: { amountPaid: null } })
        .mockResolvedValueOnce({ _sum: { amountPaid: null } })
        .mockResolvedValueOnce({ _sum: { amountPaid: null } });
      prismaMock.invoice.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      prismaMock.tenant.count.mockResolvedValueOnce(0);
      prismaMock.order.count.mockResolvedValueOnce(0);

      const result = await dashboardService.getSummaryMetrics();

      expect(result.revenue.value).toBe(0);
      expect(result.revenue.trend).toBe(0);
    });
  });

  // -----------------------------------------------------------------------
  // getCharts
  // -----------------------------------------------------------------------
  describe('getCharts', () => {
    it('should return 12 months of chart data', async () => {
      prismaMock.invoice.findMany.mockResolvedValue([]);
      prismaMock.user.findMany.mockResolvedValue([]);

      const result = await dashboardService.getCharts();

      expect(result).toHaveLength(12);
      expect(result[0].name).toBe('Jan');
      expect(result[11].name).toBe('Dec');
    });

    it('should aggregate revenue and users per month', async () => {
      prismaMock.invoice.findMany.mockResolvedValue([
        { createdAt: new Date(2026, 2, 15), amountPaid: 1000 },  // March 15
        { createdAt: new Date(2026, 2, 20), amountPaid: 2000 },  // March 20
        { createdAt: new Date(2026, 4, 10), amountPaid: 500 },   // May 10
      ]);
      prismaMock.user.findMany.mockResolvedValue([
        { createdAt: new Date(2026, 2, 10) },  // March 10
        { createdAt: new Date(2026, 2, 15) },  // March 15
        { createdAt: new Date(2026, 4, 5) },   // May 5
      ]);

      const result = await dashboardService.getCharts();

      // March (index 2)
      expect(result[2].revenue).toBe(3000);
      expect(result[2].users).toBe(2);
      // May (index 4)
      expect(result[4].revenue).toBe(500);
      expect(result[4].users).toBe(1);
      // January (index 0) — no data
      expect(result[0].revenue).toBe(0);
      expect(result[0].users).toBe(0);
    });

    it('should return zero for all months when no data exists', async () => {
      prismaMock.invoice.findMany.mockResolvedValue([]);
      prismaMock.user.findMany.mockResolvedValue([]);

      const result = await dashboardService.getCharts();

      for (const month of result) {
        expect(month.revenue).toBe(0);
        expect(month.users).toBe(0);
      }
    });
  });

  // -----------------------------------------------------------------------
  // getDistribution
  // -----------------------------------------------------------------------
  describe('getDistribution', () => {
    it('should return distribution data with correct structure', async () => {
      // user.count called 3 times (by role)
      prismaMock.user.count
        .mockResolvedValueOnce(2)   // SUPER_ADMIN
        .mockResolvedValueOnce(5)   // TENANT_ADMIN
        .mockResolvedValueOnce(50); // USER

      // tenant.count called 2 times (by status)
      prismaMock.tenant.count
        .mockResolvedValueOnce(8)   // ACTIVE
        .mockResolvedValueOnce(1);  // SUSPENDED

      // invoice.count called 4 times (by status)
      prismaMock.invoice.count
        .mockResolvedValueOnce(100) // PAID
        .mockResolvedValueOnce(20)  // PENDING
        .mockResolvedValueOnce(5)   // OVERDUE
        .mockResolvedValueOnce(3);  // CANCELED

      const result = await dashboardService.getDistribution();

      expect(result.usersByRole).toEqual([
        { name: 'Super Admin', value: 2 },
        { name: 'Tenant Admin', value: 5 },
        { name: 'User', value: 50 },
      ]);

      expect(result.tenantsByStatus).toEqual([
        { name: 'Active', value: 8 },
        { name: 'Suspended', value: 1 },
      ]);

      expect(result.invoicesByStatus).toEqual([
        { name: 'Paid', value: 100 },
        { name: 'Pending', value: 20 },
        { name: 'Overdue', value: 5 },
        { name: 'Canceled', value: 3 },
      ]);
    });

    it('should handle empty data gracefully', async () => {
      prismaMock.user.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      prismaMock.tenant.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      prismaMock.invoice.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await dashboardService.getDistribution();

      expect(result.usersByRole).toHaveLength(3);
      expect(result.tenantsByStatus).toHaveLength(2);
      expect(result.invoicesByStatus).toHaveLength(4);
      // All values should be 0
      for (const item of [...result.usersByRole, ...result.tenantsByStatus, ...result.invoicesByStatus]) {
        expect(item.value).toBe(0);
      }
    });
  });
});
