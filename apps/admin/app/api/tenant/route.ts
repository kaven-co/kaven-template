import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/tenant
 * Retorna dados do tenant atual do usuário logado
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use tenantId from JWT session; fall back to first tenant for admin backwards compat
    const tenantId = session.user.tenantId;

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
