import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  console.log('[API] GET /api/settings/theme - Started');
  try {
    const config = await prisma.platformConfig.findFirst({
      select: { themeOverrides: true },
    });

    console.log('[API] GET /api/settings/theme - Fetch result:', config);

    if (!config) {
      console.log('[API] GET /api/settings/theme - No config found, returning null.');
      return NextResponse.json(null);
    }

    return NextResponse.json(config.themeOverrides);
  } catch (error) {
    console.error('[API] ❌ CRITICAL ERROR in GET /api/settings/theme:', error);
    // Return null instead of 500 so the UI falls back to default theme
    return NextResponse.json(null);
  }
}

export async function POST(req: Request) {
  console.log('[API] POST /api/settings/theme - Started');
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('[API] POST /api/settings/theme - Body:', JSON.stringify(body, null, 2));

    const existing = await prisma.platformConfig.findFirst({
      select: { id: true },
    });

    let result;

    if (existing) {
      console.log('[API] POST /api/settings/theme - Updating existing config ID:', existing.id);
      result = await prisma.platformConfig.update({
        where: { id: existing.id },
        data: { themeOverrides: body },
        select: { themeOverrides: true },
      });
    } else {
      console.log('[API] POST /api/settings/theme - Creating new config...');
      result = await prisma.platformConfig.create({
        data: { themeOverrides: body },
        select: { themeOverrides: true },
      });
    }

    console.log('[API] POST /api/settings/theme - Save successful:', result);
    return NextResponse.json(result.themeOverrides);
  } catch (error) {
    console.error('[API] ❌ CRITICAL ERROR in POST /api/settings/theme:', error);
    const apiError = error as Error;
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: apiError?.message,
        details: String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  console.log('[API] DELETE /api/settings/theme - Started');
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.platformConfig.findFirst({
      select: { id: true },
    });

    if (existing) {
      console.log('[API] DELETE /api/settings/theme - Clearing themeOverrides for config ID:', existing.id);
      await prisma.platformConfig.update({
        where: { id: existing.id },
        data: { themeOverrides: Prisma.JsonNull },
      });
    } else {
      console.log('[API] DELETE /api/settings/theme - No config found, nothing to clear.');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] ❌ CRITICAL ERROR in DELETE /api/settings/theme:', error);
    const apiError = error as Error;
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: apiError?.message,
        details: String(error),
      },
      { status: 500 }
    );
  }
}
