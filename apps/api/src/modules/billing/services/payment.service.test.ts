import { describe, it, expect, beforeEach, vi } from "vitest";
import { PaymentService } from "./payment.service";
import { SubscriptionStatus, InvoiceStatus } from "@prisma/client";

// Mock Prisma
vi.mock("../../../lib/prisma", () => ({
  default: {
    tenant: { findUnique: vi.fn() },
    subscription: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    invoice: {
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import prisma from "../../../lib/prisma";

const mockSubscription = {
  id: "sub-123",
  tenantId: "tenant-123",
  planId: "plan-basic",
  status: SubscriptionStatus.TRIALING,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("PaymentService", () => {
  let service: PaymentService;

  beforeEach(() => {
    service = new PaymentService();
    vi.clearAllMocks();
  });

  // ─── createSubscription ────────────────────────────────────────────────────

  describe("createSubscription", () => {
    it("deve criar subscription com sucesso", async () => {
      vi.mocked(prisma.tenant.findUnique).mockResolvedValue({
        id: "tenant-123",
      } as any);
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.subscription.create).mockResolvedValue(
        mockSubscription as any,
      );

      const result = await service.createSubscription({
        tenantId: "tenant-123",
        planId: "plan-basic",
      });

      expect(result).toEqual(mockSubscription);
      expect(prisma.subscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: "tenant-123",
            planId: "plan-basic",
            status: SubscriptionStatus.TRIALING,
          }),
        }),
      );
    });

    it("deve lançar erro se tenantId ausente", async () => {
      await expect(
        service.createSubscription({ tenantId: "", planId: "plan-basic" }),
      ).rejects.toThrow("tenantId é obrigatório");
    });

    it("deve lançar erro se planId ausente", async () => {
      await expect(
        service.createSubscription({ tenantId: "tenant-123", planId: "" }),
      ).rejects.toThrow("planId é obrigatório");
    });

    it("deve lançar erro se tenant não encontrado", async () => {
      vi.mocked(prisma.tenant.findUnique).mockResolvedValue(null);

      await expect(
        service.createSubscription({
          tenantId: "tenant-xxx",
          planId: "plan-basic",
        }),
      ).rejects.toThrow("Tenant não encontrado");
    });

    it("deve lançar erro se tenant já possui subscription ativa", async () => {
      vi.mocked(prisma.tenant.findUnique).mockResolvedValue({
        id: "tenant-123",
      } as any);
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
        ...mockSubscription,
        status: SubscriptionStatus.ACTIVE,
      } as any);

      await expect(
        service.createSubscription({
          tenantId: "tenant-123",
          planId: "plan-pro",
        }),
      ).rejects.toThrow("Tenant já possui subscription ativa");
    });

    it("deve atualizar subscription existente (não ativa)", async () => {
      vi.mocked(prisma.tenant.findUnique).mockResolvedValue({
        id: "tenant-123",
      } as any);
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
        ...mockSubscription,
        status: SubscriptionStatus.CANCELED,
      } as any);
      vi.mocked(prisma.subscription.update).mockResolvedValue(
        mockSubscription as any,
      );

      await service.createSubscription({
        tenantId: "tenant-123",
        planId: "plan-pro",
      });

      expect(prisma.subscription.update).toHaveBeenCalled();
      expect(prisma.subscription.create).not.toHaveBeenCalled();
    });

    it("deve calcular trialEnd quando trialDays fornecido", async () => {
      vi.mocked(prisma.tenant.findUnique).mockResolvedValue({
        id: "tenant-123",
      } as any);
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.subscription.create).mockResolvedValue(
        mockSubscription as any,
      );

      await service.createSubscription({
        tenantId: "tenant-123",
        planId: "plan-basic",
        trialDays: 14,
      });

      expect(prisma.subscription.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            trialEnd: expect.any(Date),
          }),
        }),
      );
    });
  });

  // ─── cancelSubscription ────────────────────────────────────────────────────

  describe("cancelSubscription", () => {
    it("deve cancelar subscription ativa", async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(
        mockSubscription as any,
      );
      vi.mocked(prisma.subscription.update).mockResolvedValue({
        ...mockSubscription,
        status: SubscriptionStatus.CANCELED,
      } as any);

      const result = await service.cancelSubscription(
        "tenant-123",
        "Não preciso mais",
      );

      expect((result as any).status).toBe(SubscriptionStatus.CANCELED);
    });

    it("deve ser idempotente — subscription já cancelada retorna sem update", async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
        ...mockSubscription,
        status: SubscriptionStatus.CANCELED,
      } as any);

      await service.cancelSubscription("tenant-123");

      expect(prisma.subscription.update).not.toHaveBeenCalled();
    });

    it("deve lançar erro se subscription não encontrada", async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(null);

      await expect(
        service.cancelSubscription("tenant-xxx"),
      ).rejects.toThrow("Subscription não encontrada");
    });
  });

  // ─── processWebhook ────────────────────────────────────────────────────────

  describe("processWebhook", () => {
    it("deve processar webhook subscription.created", async () => {
      vi.mocked(prisma.subscription.updateMany).mockResolvedValue({
        count: 1,
      } as any);

      const result = await service.processWebhook({
        event_type: "subscription.created",
        event_id: "evt-001",
        data: { tenantId: "tenant-123" },
      });

      expect((result as any).processed).toBe(true);
      expect((result as any).action).toBe("subscription_activated");
    });

    it("deve processar webhook payment.completed", async () => {
      vi.mocked(prisma.invoice.update).mockResolvedValue({} as any);

      const result = await service.processWebhook({
        event_type: "payment.completed",
        event_id: "evt-002",
        data: { invoiceId: "inv-123" },
      });

      expect((result as any).processed).toBe(true);
      expect((result as any).action).toBe("payment_completed");
      expect(prisma.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "inv-123" },
          data: expect.objectContaining({ status: InvoiceStatus.PAID }),
        }),
      );
    });

    it("deve processar webhook subscription.canceled", async () => {
      vi.mocked(prisma.subscription.updateMany).mockResolvedValue({
        count: 1,
      } as any);

      const result = await service.processWebhook({
        event_type: "subscription.canceled",
        event_id: "evt-003",
        data: { tenantId: "tenant-123" },
      });

      expect((result as any).action).toBe("subscription_canceled");
    });

    it("deve ser idempotente — mesmo event_id não processa duas vezes", async () => {
      vi.mocked(prisma.subscription.updateMany).mockResolvedValue({
        count: 0,
      } as any);

      const payload = {
        event_type: "subscription.created",
        event_id: "evt-duplicate",
        data: { tenantId: "tenant-123" },
      };

      await service.processWebhook(payload);
      const second = await service.processWebhook(payload); // mesmo event_id

      expect((second as any).processed).toBe(false);
      expect((second as any).reason).toContain("já processado");
    });

    it("deve lançar erro de assinatura inválida", async () => {
      await expect(
        service.processWebhook(
          {
            event_type: "payment.completed",
            event_id: "evt-bad",
            data: {},
          },
          "invalid-signature",
        ),
      ).rejects.toThrow("Assinatura Paddle inválida");
    });

    it("deve ignorar event_type desconhecido", async () => {
      const result = await service.processWebhook({
        event_type: "unknown.event",
        event_id: "evt-unknown",
        data: {},
      });

      expect((result as any).action).toBe("ignored");
    });
  });

  // ─── getInvoices ───────────────────────────────────────────────────────────

  describe("getInvoices", () => {
    it("deve listar invoices filtradas por tenantId", async () => {
      const mockInvoices = [{ id: "inv-1", tenantId: "tenant-123" }];
      vi.mocked(prisma.invoice.findMany).mockResolvedValue(mockInvoices as any);
      vi.mocked(prisma.invoice.count).mockResolvedValue(1);

      const result = await service.getInvoices({ tenantId: "tenant-123" });

      expect(result.invoices).toHaveLength(1);
      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: "tenant-123" }),
        }),
      );
    });

    it("invoice de tenant A não deve aparecer para tenant B — isolamento multi-tenant", async () => {
      vi.mocked(prisma.invoice.findMany).mockResolvedValue([]);
      vi.mocked(prisma.invoice.count).mockResolvedValue(0);

      const result = await service.getInvoices({ tenantId: "tenant-B" });

      expect(result.invoices).toHaveLength(0);
      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: "tenant-B" }),
        }),
      );
    });

    it("deve filtrar por status", async () => {
      vi.mocked(prisma.invoice.findMany).mockResolvedValue([]);
      vi.mocked(prisma.invoice.count).mockResolvedValue(0);

      await service.getInvoices({
        tenantId: "tenant-123",
        status: InvoiceStatus.PAID,
      });

      expect(prisma.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: InvoiceStatus.PAID }),
        }),
      );
    });

    it("deve aplicar paginação", async () => {
      vi.mocked(prisma.invoice.findMany).mockResolvedValue([]);
      vi.mocked(prisma.invoice.count).mockResolvedValue(30);

      const result = await service.getInvoices({
        tenantId: "tenant-123",
        page: 2,
        limit: 10,
      });

      expect(result.pagination.pages).toBe(3);
      expect(result.pagination.page).toBe(2);
    });
  });
});
