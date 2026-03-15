import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * GET /api/tenant
 * Retorna dados do tenant atual do usuário logado.
 *
 * Auth strategy: the admin login uses Fastify directly (stores JWT in localStorage),
 * so the client sends Authorization: Bearer <fastify-token>.
 * We forward that token to Fastify /api/users/me to validate and get tenantId.
 */
export async function GET(req: NextRequest) {
  try {
    // Read Fastify Bearer token from Authorization header
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!bearerToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate token against Fastify API
    const meResponse = await fetch(`${API_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${bearerToken}` },
      // Don't cache — always fresh
      cache: 'no-store',
    });

    if (!meResponse.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const me = await meResponse.json();
    const tenantId = me?.tenantId as string | undefined;

    const tenant = tenantId
      ? await prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { id: true, name: true, slug: true },
        })
      : await prisma.tenant.findFirst({
          select: { id: true, name: true, slug: true },
        });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Fetch active subscription plan name (fallback to FREE)
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId: tenant.id },
      select: { plan: { select: { name: true } }, status: true },
    });
    const plan = subscription?.status === 'ACTIVE' || subscription?.status === 'TRIALING'
      ? subscription.plan.name
      : 'FREE';

    return NextResponse.json({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      plan,
    });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenant' },
      { status: 500 }
    );
  }
}
