import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/spaces
 * Retorna lista de spaces disponíveis para o usuário logado.
 *
 * - SUPER_ADMIN / TENANT_ADMIN: veem todos os spaces ativos do tenant
 * - USER: vê apenas os spaces atribuídos via UserSpace
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    const tenantId = session.user.tenantId ?? null;

    // SUPER_ADMIN and TENANT_ADMIN see all active spaces for the tenant
    if (userRole === 'SUPER_ADMIN' || userRole === 'TENANT_ADMIN') {
      const spaces = await prisma.space.findMany({
        where: {
          isActive: true,
          // Include both tenant-specific and global (tenantId=null) spaces
          OR: [
            { tenantId },
            { tenantId: null },
          ],
        },
        select: {
          id: true,
          code: true,
          name: true,
          icon: true,
          color: true,
          description: true,
          sortOrder: true,
        },
        orderBy: { sortOrder: 'asc' },
      });

      return NextResponse.json({ spaces });
    }

    // Regular USER: only spaces assigned via UserSpace
    const userSpaces = await prisma.userSpace.findMany({
      where: { userId },
      select: {
        space: {
          select: {
            id: true,
            code: true,
            name: true,
            icon: true,
            color: true,
            description: true,
            sortOrder: true,
            isActive: true,
          },
        },
      },
    });

    const spaces = userSpaces
      .map((us) => us.space)
      .filter((space) => space.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(({ isActive: _isActive, ...space }) => space);

    return NextResponse.json({ spaces });
  } catch (error) {
    console.error('Error fetching spaces:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spaces' },
      { status: 500 }
    );
  }
}
