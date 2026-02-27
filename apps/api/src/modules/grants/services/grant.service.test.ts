import { describe, it, expect, beforeEach, vi } from "vitest";
import { GrantService } from "./grant.service";
import { prisma } from "../../../lib/prisma";
import {
  GrantStatus,
  GrantType,
  AccessLevel,
  CapabilityScope,
} from "@prisma/client";

// Mock Prisma
vi.mock("../../../lib/prisma", () => ({
  prisma: {
    grant: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    capability: {
      findUnique: vi.fn(),
    },
    space: {
      findUnique: vi.fn(),
    },
  },
}));

const mockGrant = {
  id: "grant-123",
  userId: "user-123",
  tenantId: "tenant-123",
  spaceId: "space-123",
  capabilityId: "cap-123",
  type: GrantType.ADD,
  accessLevel: AccessLevel.READ_ONLY,
  scope: CapabilityScope.SPACE,
  justification: "Acesso necessário para relatórios",
  grantedBy: "admin-123",
  grantedAt: new Date(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  status: GrantStatus.ACTIVE,
  revokedAt: null,
  revokedBy: null,
  revokeReason: null,
  grantRequestId: null,
  metadata: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("GrantService", () => {
  let service: GrantService;

  beforeEach(() => {
    service = new GrantService();
    vi.clearAllMocks();
  });

  // ─── createGrant ─────────────────────────────────────────────────────────────

  describe("createGrant", () => {
    it("deve criar grant com sucesso quando dados válidos", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        tenantId: "tenant-123",
      } as any);
      vi.mocked(prisma.capability.findUnique).mockResolvedValue({
        id: "cap-123",
      } as any);
      vi.mocked(prisma.space.findUnique).mockResolvedValue({
        id: "space-123",
        tenantId: "tenant-123",
      } as any);
      vi.mocked(prisma.grant.create).mockResolvedValue(mockGrant as any);

      const result = await service.createGrant({
        userId: "user-123",
        tenantId: "tenant-123",
        spaceId: "space-123",
        capabilityId: "cap-123",
        justification: "Acesso necessário para relatórios",
        grantedBy: "admin-123",
      });

      expect(result).toEqual(mockGrant);
      expect(prisma.grant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-123",
            tenantId: "tenant-123",
            status: GrantStatus.ACTIVE,
          }),
        }),
      );
    });

    it("deve lançar erro se userId não informado", async () => {
      await expect(
        service.createGrant({
          userId: "",
          tenantId: "tenant-123",
          justification: "Acesso necessário",
          grantedBy: "admin-123",
        }),
      ).rejects.toThrow("userId é obrigatório");
    });

    it("deve lançar erro se tenantId não informado", async () => {
      await expect(
        service.createGrant({
          userId: "user-123",
          tenantId: "",
          justification: "Acesso necessário",
          grantedBy: "admin-123",
        }),
      ).rejects.toThrow("tenantId é obrigatório");
    });

    it("deve lançar erro se justificativa muito curta", async () => {
      await expect(
        service.createGrant({
          userId: "user-123",
          tenantId: "tenant-123",
          justification: "ok",
          grantedBy: "admin-123",
        }),
      ).rejects.toThrow("Justificativa muito curta");
    });

    it("deve lançar erro se usuário não encontrado", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        service.createGrant({
          userId: "user-xxx",
          tenantId: "tenant-123",
          justification: "Acesso necessário",
          grantedBy: "admin-123",
        }),
      ).rejects.toThrow("Usuário não encontrado");
    });

    it("deve lançar erro se usuário não pertence ao tenant — isolamento multi-tenant", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        tenantId: "tenant-OUTRO",
      } as any);

      await expect(
        service.createGrant({
          userId: "user-123",
          tenantId: "tenant-123",
          justification: "Acesso necessário",
          grantedBy: "admin-123",
        }),
      ).rejects.toThrow("Usuário não pertence ao tenant informado");
    });

    it("deve lançar erro se capability não encontrada", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        tenantId: "tenant-123",
      } as any);
      vi.mocked(prisma.capability.findUnique).mockResolvedValue(null);

      await expect(
        service.createGrant({
          userId: "user-123",
          tenantId: "tenant-123",
          spaceId: "space-123",
          capabilityId: "cap-inexistente",
          justification: "Acesso necessário",
          grantedBy: "admin-123",
        }),
      ).rejects.toThrow("Capability não encontrada");
    });

    it("deve criar grant com spaceId mas sem capabilityId (grant de espaço)", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        tenantId: "tenant-123",
      } as any);
      vi.mocked(prisma.space.findUnique).mockResolvedValue({
        id: "space-123",
        tenantId: "tenant-123",
      } as any);
      vi.mocked(prisma.grant.create).mockResolvedValue({
        ...mockGrant,
        capabilityId: null,
      } as any);

      const result = await service.createGrant({
        userId: "user-123",
        tenantId: "tenant-123",
        spaceId: "space-123",
        justification: "Acesso genérico de espaço",
        grantedBy: "admin-123",
      });

      expect(result).toBeDefined();
      expect(prisma.capability.findUnique).not.toHaveBeenCalled();
    });

    // ─── Validation: spaceId/capabilityId business rules ─────────────────

    it("deve lançar erro se nem spaceId nem capabilityId informados", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        tenantId: "tenant-123",
      } as any);

      await expect(
        service.createGrant({
          userId: "user-123",
          tenantId: "tenant-123",
          justification: "Acesso genérico",
          grantedBy: "admin-123",
        }),
      ).rejects.toThrow(
        "Grant deve ter pelo menos spaceId ou capabilityId",
      );
    });

    it("deve lançar erro se escopo é SPACE mas spaceId não informado", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        tenantId: "tenant-123",
      } as any);

      await expect(
        service.createGrant({
          userId: "user-123",
          tenantId: "tenant-123",
          capabilityId: "cap-123",
          scope: CapabilityScope.SPACE,
          justification: "Acesso a capability",
          grantedBy: "admin-123",
        }),
      ).rejects.toThrow("spaceId é obrigatório quando o escopo do grant é SPACE");
    });

    it("deve criar grant com capabilityId e escopo TENANT sem spaceId", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        tenantId: "tenant-123",
      } as any);
      vi.mocked(prisma.capability.findUnique).mockResolvedValue({
        id: "cap-123",
      } as any);
      vi.mocked(prisma.grant.create).mockResolvedValue({
        ...mockGrant,
        spaceId: null,
        scope: CapabilityScope.TENANT,
      } as any);

      const result = await service.createGrant({
        userId: "user-123",
        tenantId: "tenant-123",
        capabilityId: "cap-123",
        scope: CapabilityScope.TENANT,
        justification: "Acesso tenant-wide",
        grantedBy: "admin-123",
      });

      expect(result).toBeDefined();
    });

    it("deve lançar erro se space não encontrado", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        tenantId: "tenant-123",
      } as any);
      vi.mocked(prisma.space.findUnique).mockResolvedValue(null);

      await expect(
        service.createGrant({
          userId: "user-123",
          tenantId: "tenant-123",
          spaceId: "space-inexistente",
          justification: "Acesso necessário",
          grantedBy: "admin-123",
        }),
      ).rejects.toThrow("Space não encontrado");
    });

    it("deve lançar erro se space não pertence ao tenant", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: "user-123",
        tenantId: "tenant-123",
      } as any);
      vi.mocked(prisma.space.findUnique).mockResolvedValue({
        id: "space-123",
        tenantId: "tenant-OUTRO",
      } as any);

      await expect(
        service.createGrant({
          userId: "user-123",
          tenantId: "tenant-123",
          spaceId: "space-123",
          justification: "Acesso necessário",
          grantedBy: "admin-123",
        }),
      ).rejects.toThrow("Space não pertence ao tenant informado");
    });
  });

  // ─── revokeGrant ─────────────────────────────────────────────────────────────

  describe("revokeGrant", () => {
    it("deve revogar grant ativo com sucesso", async () => {
      vi.mocked(prisma.grant.findUnique).mockResolvedValue(mockGrant as any);
      vi.mocked(prisma.grant.update).mockResolvedValue({
        ...mockGrant,
        status: GrantStatus.REVOKED,
        revokedAt: new Date(),
        revokedBy: "admin-123",
        revokeReason: "Acesso não mais necessário",
      } as any);

      const result = await service.revokeGrant(
        "grant-123",
        "admin-123",
        "Acesso não mais necessário",
        "tenant-123",
      );

      expect((result as any).status).toBe(GrantStatus.REVOKED);
      expect(prisma.grant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: GrantStatus.REVOKED,
            revokedBy: "admin-123",
          }),
        }),
      );
    });

    it("deve ser idempotente — grant já revogado retorna sem erro", async () => {
      vi.mocked(prisma.grant.findUnique).mockResolvedValue({
        ...mockGrant,
        status: GrantStatus.REVOKED,
      } as any);

      const result = await service.revokeGrant(
        "grant-123",
        "admin-123",
        "Já revogado",
        "tenant-123",
      );

      // Retorna o grant sem chamar update novamente
      expect(prisma.grant.update).not.toHaveBeenCalled();
      expect((result as any).status).toBe(GrantStatus.REVOKED);
    });

    it("deve lançar erro se grant não encontrado", async () => {
      vi.mocked(prisma.grant.findUnique).mockResolvedValue(null);

      await expect(
        service.revokeGrant("grant-xxx", "admin-123", "motivo", "tenant-123"),
      ).rejects.toThrow("Grant não encontrado");
    });

    it("deve lançar erro se grant pertence a outro tenant — isolamento multi-tenant", async () => {
      vi.mocked(prisma.grant.findUnique).mockResolvedValue({
        ...mockGrant,
        tenantId: "tenant-OUTRO",
      } as any);

      await expect(
        service.revokeGrant("grant-123", "admin-123", "motivo", "tenant-123"),
      ).rejects.toThrow("Grant não pertence ao tenant informado");
    });

    it("deve lançar erro se grant já expirado", async () => {
      vi.mocked(prisma.grant.findUnique).mockResolvedValue({
        ...mockGrant,
        status: GrantStatus.EXPIRED,
      } as any);

      await expect(
        service.revokeGrant("grant-123", "admin-123", "motivo", "tenant-123"),
      ).rejects.toThrow("Grant já expirado não pode ser revogado");
    });
  });

  // ─── listGrants ──────────────────────────────────────────────────────────────

  describe("listGrants", () => {
    it("deve listar grants filtrados pelo tenantId", async () => {
      const mockGrants = [mockGrant, { ...mockGrant, id: "grant-456" }];
      vi.mocked(prisma.grant.findMany).mockResolvedValue(mockGrants as any);
      vi.mocked(prisma.grant.count).mockResolvedValue(2);

      const result = await service.listGrants({ tenantId: "tenant-123" });

      expect(result.grants).toHaveLength(2);
      expect(result.pagination.total).toBe(2);
      expect(prisma.grant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: "tenant-123" }),
        }),
      );
    });

    it("grant de tenant A não deve aparecer ao listar grants do tenant B", async () => {
      vi.mocked(prisma.grant.findMany).mockResolvedValue([]);
      vi.mocked(prisma.grant.count).mockResolvedValue(0);

      const result = await service.listGrants({ tenantId: "tenant-B" });

      expect(result.grants).toHaveLength(0);
      expect(prisma.grant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tenantId: "tenant-B" }),
        }),
      );
    });

    it("deve filtrar por userId", async () => {
      vi.mocked(prisma.grant.findMany).mockResolvedValue([mockGrant] as any);
      vi.mocked(prisma.grant.count).mockResolvedValue(1);

      await service.listGrants({
        tenantId: "tenant-123",
        userId: "user-123",
      });

      expect(prisma.grant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: "tenant-123",
            userId: "user-123",
          }),
        }),
      );
    });

    it("deve filtrar por status", async () => {
      vi.mocked(prisma.grant.findMany).mockResolvedValue([]);
      vi.mocked(prisma.grant.count).mockResolvedValue(0);

      await service.listGrants({
        tenantId: "tenant-123",
        status: GrantStatus.REVOKED,
      });

      expect(prisma.grant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: GrantStatus.REVOKED }),
        }),
      );
    });

    it("deve aplicar paginação corretamente", async () => {
      vi.mocked(prisma.grant.findMany).mockResolvedValue([]);
      vi.mocked(prisma.grant.count).mockResolvedValue(50);

      const result = await service.listGrants({
        tenantId: "tenant-123",
        page: 3,
        limit: 10,
      });

      expect(result.pagination.pages).toBe(5);
      expect(result.pagination.page).toBe(3);
      expect(prisma.grant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 }),
      );
    });
  });

  // ─── validateGrant ───────────────────────────────────────────────────────────

  describe("validateGrant", () => {
    it("deve validar grant ativo com sucesso", async () => {
      vi.mocked(prisma.grant.findUnique).mockResolvedValue(mockGrant as any);

      const result = await service.validateGrant("grant-123", "tenant-123");

      expect(result.valid).toBe(true);
      expect(result.grant).toEqual(mockGrant);
    });

    it("deve lançar erro se grant não encontrado", async () => {
      vi.mocked(prisma.grant.findUnique).mockResolvedValue(null);

      await expect(
        service.validateGrant("grant-xxx", "tenant-123"),
      ).rejects.toThrow("Grant não encontrado");
    });

    it("deve lançar erro se grant pertence a outro tenant — isolamento multi-tenant", async () => {
      vi.mocked(prisma.grant.findUnique).mockResolvedValue({
        ...mockGrant,
        tenantId: "tenant-OUTRO",
      } as any);

      await expect(
        service.validateGrant("grant-123", "tenant-123"),
      ).rejects.toThrow("Grant não pertence ao tenant informado");
    });

    it("deve lançar erro se grant revogado", async () => {
      vi.mocked(prisma.grant.findUnique).mockResolvedValue({
        ...mockGrant,
        status: GrantStatus.REVOKED,
      } as any);

      await expect(
        service.validateGrant("grant-123", "tenant-123"),
      ).rejects.toThrow("Grant foi revogado");
    });

    it("deve lançar erro se grant expirado (status EXPIRED)", async () => {
      vi.mocked(prisma.grant.findUnique).mockResolvedValue({
        ...mockGrant,
        status: GrantStatus.EXPIRED,
      } as any);

      await expect(
        service.validateGrant("grant-123", "tenant-123"),
      ).rejects.toThrow("Grant expirado");
    });

    it("deve lançar erro se grant expirado por data (expiresAt no passado)", async () => {
      vi.mocked(prisma.grant.findUnique).mockResolvedValue({
        ...mockGrant,
        status: GrantStatus.ACTIVE,
        expiresAt: new Date(Date.now() - 1000), // 1 segundo atrás
      } as any);

      await expect(
        service.validateGrant("grant-123", "tenant-123"),
      ).rejects.toThrow("Grant expirado");
    });

    it("deve validar grant sem expiresAt (grant permanente)", async () => {
      vi.mocked(prisma.grant.findUnique).mockResolvedValue({
        ...mockGrant,
        expiresAt: null,
      } as any);

      const result = await service.validateGrant("grant-123", "tenant-123");

      expect(result.valid).toBe(true);
    });
  });
});
