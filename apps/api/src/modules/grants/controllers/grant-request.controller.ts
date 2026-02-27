import { FastifyRequest, FastifyReply } from 'fastify';
import { grantRequestService } from '../services/grant-request.service';
import { createGrantRequestSchema, reviewGrantRequestSchema } from '@kaven/shared';
import { prisma } from '../../../lib/prisma';

export class GrantRequestController {
  
  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) return reply.status(401).send({ error: 'Unauthorized' });
      
      const data = createGrantRequestSchema.parse(request.body);
      const grantRequest = await grantRequestService.createRequest(request.user.id, data);
      
      reply.status(201).send(grantRequest);
    } catch (error: any) {
      reply.status(400).send({ error: error.message });
    }
  }

  async listMyRequests(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) return reply.status(401).send({ error: 'Unauthorized' });
      
      const requests = await grantRequestService.listMyRequests(request.user.id);
      reply.send(requests);
    } catch (error: any) {
      reply.status(400).send({ error: error.message });
    }
  }

  async listPending(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) return reply.status(401).send({ error: 'Unauthorized' });

      const { spaceId } = request.query as { spaceId?: string };

      // SUPER_ADMIN can view all pending requests
      if (request.user.role !== 'SUPER_ADMIN') {
        // TENANT_ADMIN can view requests within their tenant (no spaceId filter needed)
        if (request.user.role !== 'TENANT_ADMIN') {
          // Regular users must be a Space Owner to view pending grant requests
          if (!spaceId) {
            return reply.status(403).send({
              error: 'Acesso negado',
              message: 'Informe o spaceId para verificar suas permissões',
            });
          }

          const isOwner = await prisma.spaceOwner.findUnique({
            where: { spaceId_userId: { spaceId, userId: request.user.id } },
          });
          if (!isOwner) {
            return reply.status(403).send({
              error: 'Acesso negado',
              message: 'Você precisa ser Space Owner ou Admin para ver pedidos pendentes',
            });
          }
        }
      }

      const requests = await grantRequestService.listPendingRequests(spaceId);
      reply.send(requests);
    } catch (error: any) {
      reply.status(400).send({ error: error.message });
    }
  }

  async review(request: FastifyRequest, reply: FastifyReply) {
    try {
      if (!request.user) return reply.status(401).send({ error: 'Unauthorized' });
      
      const { id } = request.params as { id: string };
      const data = reviewGrantRequestSchema.parse(request.body);
      
      const result = await grantRequestService.reviewRequest(request.user.id, id, data);
      reply.send(result);
    } catch (error: any) {
      reply.status(400).send({ error: error.message });
    }
  }
}

export const grantRequestController = new GrantRequestController();
