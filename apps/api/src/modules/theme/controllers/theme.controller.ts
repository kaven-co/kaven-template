import { FastifyReply, FastifyRequest } from 'fastify';
import { Role } from '@prisma/client';
import { sanitize } from 'isomorphic-dompurify';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';

const updateThemeSchema = z.object({
  name: z.string().min(1, 'name is required'),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'primaryColor must be a valid hex color'),
  logoUrl: z.string().url().optional(),
  faviconUrl: z.string().url().optional(),
});

type ThemeConfigResponse = {
  id: string;
  tenantId: string | null;
  name: string;
  primaryColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  updatedAt: Date;
};

function toThemeResponse(config: {
  id: string;
  tenantId: string | null;
  companyName: string;
  primaryColor: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  updatedAt: Date;
}): ThemeConfigResponse {
  return {
    id: config.id,
    tenantId: config.tenantId,
    name: config.companyName,
    primaryColor: config.primaryColor,
    logoUrl: config.logoUrl,
    faviconUrl: config.faviconUrl,
    updatedAt: config.updatedAt,
  };
}

export class ThemeController {
  async getTheme(request: FastifyRequest, reply: FastifyReply) {
    const tenantId = request.user?.tenantId;

    if (!tenantId) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Tenant ID not found for authenticated user',
      });
    }

    const config = await prisma.platformConfig.findFirst({
      where: { tenantId },
      select: {
        id: true,
        tenantId: true,
        companyName: true,
        primaryColor: true,
        logoUrl: true,
        faviconUrl: true,
        updatedAt: true,
      },
    });

    if (!config) {
      return reply.status(404).send({
        error: 'Theme not found',
        message: 'No theme configuration found for this tenant',
      });
    }

    return reply.send(toThemeResponse(config));
  }

  async upsertTheme(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user;

    if (!user?.tenantId) {
      return reply.status(401).send({
        error: 'Unauthorized',
        message: 'Tenant ID not found for authenticated user',
      });
    }

    if (user.role !== Role.TENANT_ADMIN && user.role !== Role.SUPER_ADMIN) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Only tenant administrators can update theme settings',
      });
    }

    const parsed = updateThemeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        error: 'Validation error',
        details: parsed.error.issues,
      });
    }

    const input = {
      ...parsed.data,
      name: sanitize(parsed.data.name),
      logoUrl: parsed.data.logoUrl ? sanitize(parsed.data.logoUrl) : undefined,
      faviconUrl: parsed.data.faviconUrl ? sanitize(parsed.data.faviconUrl) : undefined,
    };
    const tenantId = user.tenantId;

    const existing = await prisma.platformConfig.findFirst({
      where: { tenantId },
      select: { id: true },
    });

    const config = existing
      ? await prisma.platformConfig.update({
          where: { id: existing.id },
          data: {
            companyName: input.name,
            primaryColor: input.primaryColor,
            logoUrl: input.logoUrl,
            faviconUrl: input.faviconUrl,
          },
          select: {
            id: true,
            tenantId: true,
            companyName: true,
            primaryColor: true,
            logoUrl: true,
            faviconUrl: true,
            updatedAt: true,
          },
        })
      : await prisma.platformConfig.create({
          data: {
            tenantId,
            companyName: input.name,
            primaryColor: input.primaryColor,
            logoUrl: input.logoUrl,
            faviconUrl: input.faviconUrl,
          },
          select: {
            id: true,
            tenantId: true,
            companyName: true,
            primaryColor: true,
            logoUrl: true,
            faviconUrl: true,
            updatedAt: true,
          },
        });

    return reply.send(toThemeResponse(config));
  }
}

export const themeController = new ThemeController();
