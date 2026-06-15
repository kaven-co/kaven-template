import type { FastifyInstance } from 'fastify';
import { createStorageProvider } from '../services/storage.service';
import { prisma } from '../../../lib/prisma';
import { authMiddleware } from '../../../middleware/auth.middleware';

const storageProvider = createStorageProvider();

export async function storageRoutes(app: FastifyInstance) {
  // POST /api/storage/presign — gera presigned URL para upload direto ao S3/R2
  app.post<{
    Body: { filename: string; contentType: string };
  }>(
    '/presign',
    {
      preHandler: [authMiddleware],
      schema: {
        body: {
          type: 'object',
          required: ['filename', 'contentType'],
          properties: {
            filename: { type: 'string' },
            contentType: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = request.user!.id;
      const tenantId = request.user!.tenantId;
      const { filename, contentType } = request.body;

      // Tenant isolation obrigatório: prefixo com tenantId + userId
      const key = `${tenantId}/${userId}/${Date.now()}-${filename}`;
      const uploadUrl = await storageProvider.getPresignedUploadUrl(key, contentType);

      const storageObject = await prisma.storageObject.create({
        data: {
          key,
          bucket: process.env.AWS_S3_BUCKET ?? '',
          provider: process.env.STORAGE_PROVIDER ?? 's3',
          tenantId,
          userId,
          mimeType: contentType,
          size: 0,
        },
      });

      return reply.status(201).send({ uploadUrl, key, objectId: storageObject.id });
    },
  );

  // DELETE /api/storage/:objectId — remove objeto com verificação de tenant
  app.delete<{ Params: { objectId: string } }>(
    '/:objectId',
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const tenantId = request.user!.tenantId;
      const { objectId } = request.params;

      const obj = await prisma.storageObject.findFirst({
        where: { id: objectId, tenantId },
      });

      if (!obj) {
        return reply.status(404).send({ error: 'Object not found' });
      }

      await storageProvider.deleteObject(obj.key);
      await prisma.storageObject.delete({ where: { id: objectId } });

      return reply.send({ success: true });
    },
  );

  // GET /api/storage — lista arquivos do tenant atual
  app.get('/', { preHandler: [authMiddleware] }, async (request, reply) => {
    const tenantId = request.user!.tenantId;

    const objects = await prisma.storageObject.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send(objects);
  });
}
