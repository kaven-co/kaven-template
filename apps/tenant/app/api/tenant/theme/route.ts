import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/tenant/theme
 * Returns the theme config for the current tenant (or global fallback).
 * Called by theme-provider.tsx on init using a relative URL.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const tenantId = session?.user?.tenantId ?? null;

    const config = tenantId
      ? await prisma.platformConfig.findFirst({ where: { tenantId } })
      : await prisma.platformConfig.findFirst({ where: { tenantId: null } });

    if (!config) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      id: config.id,
      tenantId: config.tenantId,
      name: config.companyName,
      primaryColor: config.primaryColor,
      logoUrl: config.logoUrl,
      faviconUrl: config.faviconUrl,
      updatedAt: config.updatedAt,
    });
  } catch (error) {
    console.error('[tenant/theme] GET error:', error);
    // Return null so theme-provider falls back to localStorage defaults
    return NextResponse.json(null);
  }
}

/**
 * PUT /api/tenant/theme
 * Upserts the theme config for the current tenant.
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId ?? null;
    const body = await req.json() as {
      name?: string;
      primaryColor?: string;
      logoUrl?: string | null;
      faviconUrl?: string | null;
    };

    const { name, primaryColor, logoUrl, faviconUrl } = body;

    const existing = tenantId
      ? await prisma.platformConfig.findFirst({ where: { tenantId }, select: { id: true } })
      : await prisma.platformConfig.findFirst({ where: { tenantId: null }, select: { id: true } });

    let config;
    if (existing) {
      config = await prisma.platformConfig.update({
        where: { id: existing.id },
        data: {
          ...(name && { companyName: name }),
          ...(primaryColor && { primaryColor }),
          ...(logoUrl !== undefined && { logoUrl }),
          ...(faviconUrl !== undefined && { faviconUrl }),
        },
      });
    } else {
      config = await prisma.platformConfig.create({
        data: {
          tenantId,
          companyName: name ?? 'Kaven SaaS',
          primaryColor: primaryColor ?? '#10B981',
          logoUrl: logoUrl ?? null,
          faviconUrl: faviconUrl ?? null,
        },
      });
    }

    return NextResponse.json({
      id: config.id,
      tenantId: config.tenantId,
      name: config.companyName,
      primaryColor: config.primaryColor,
      logoUrl: config.logoUrl,
      faviconUrl: config.faviconUrl,
      updatedAt: config.updatedAt,
    });
  } catch (error) {
    console.error('[tenant/theme] PUT error:', error);
    return NextResponse.json({ error: 'Failed to save theme' }, { status: 500 });
  }
}
