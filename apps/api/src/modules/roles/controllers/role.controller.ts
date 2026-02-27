import { FastifyRequest, FastifyReply } from 'fastify';
import { roleService } from '../services/role.service';
import { z } from 'zod';
import prisma from '../../../lib/prisma';

// TODO: Mover para lib/validation se reutilizado
const createRoleSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().optional(),
  capabilities: z.array(z.string()).default([])
});

const updateRoleSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().optional(),
  capabilities: z.array(z.string()).optional()
});

export class RoleController {
  async list(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) return reply.status(401).send({ error: 'Unauthorized' });

      const { spaceId } = request.params as { spaceId: string };

      // Validate that the user has access to this space
      // SUPER_ADMIN can access any space
      if (request.user.role !== 'SUPER_ADMIN') {
        const space = await prisma.space.findUnique({
          where: { id: spaceId },
          select: { tenantId: true },
        });

        if (!space) {
          return reply.status(404).send({ error: 'Space não encontrado' });
        }

        // Space must belong to the user's tenant (or be global with null tenantId)
        if (space.tenantId && space.tenantId !== request.user.tenantId) {
          return reply.status(403).send({
            error: 'Acesso negado',
            message: 'Você não tem acesso a este space',
          });
        }
      }

      const roles = await roleService.listRoles(spaceId);
      reply.send(roles);
    } catch (error: any) {
      reply.status(400).send({ error: error.message });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const role = await roleService.getRoleById(id);
      reply.send(role);
    } catch (error: any) {
      reply.status(404).send({ error: error.message });
    }
  }

  async listCapabilities(request: FastifyRequest, reply: FastifyReply) {
    try {
      const capabilities = await roleService.listCapabilities();
      reply.send(capabilities);
    } catch (error: any) {
      reply.status(400).send({ error: error.message });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) return reply.status(401).send({ error: 'Unauthorized' });

      const { spaceId } = request.params as { spaceId: string };

      // Validate space access — SUPER_ADMIN bypasses, others need tenant match
      if (request.user.role !== 'SUPER_ADMIN') {
        const space = await prisma.space.findUnique({
          where: { id: spaceId },
          select: { tenantId: true },
        });

        if (!space) {
          return reply.status(404).send({ error: 'Space não encontrado' });
        }

        if (space.tenantId && space.tenantId !== request.user.tenantId) {
          return reply.status(403).send({
            error: 'Acesso negado',
            message: 'Você não tem acesso a este space',
          });
        }
      }

      const data = createRoleSchema.parse(request.body);

      const role = await roleService.createRole({
        ...data,
        spaceId
      });

      reply.status(201).send(role);
    } catch (error: any) {
      reply.status(400).send({ error: error.message });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const data = updateRoleSchema.parse(request.body);
      
      const role = await roleService.updateRole(id, data);
      reply.send(role);
    } catch (error: any) {
      reply.status(400).send({ error: error.message });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      await roleService.deleteRole(id);
      reply.status(204).send();
    } catch (error: any) {
      reply.status(400).send({ error: error.message });
    }
  }
}

export const roleController = new RoleController();
