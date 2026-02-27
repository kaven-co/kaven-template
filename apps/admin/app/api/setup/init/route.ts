import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { setupConfigSchema } from '@/lib/validations/setup';
import { SetupService } from '@/lib/services/setup.service';
import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';

/**
 * POST /api/setup/init
 * Endpoint para inicializar o sistema via Setup Wizard
 */
export async function POST(request: NextRequest) {
  try {
    // Proteção: sistema já foi inicializado?
    const tenantCount = await prisma.tenant.count();
    if (tenantCount > 0) {
      return NextResponse.json(
        { success: false, error: 'System already initialized' },
        { status: 403 }
      );
    }

    // Parse do body
    const body = await request.json();
    
    // Validar com Zod
    const config = setupConfigSchema.parse(body);
    
    console.log('🚀 Setup API called with config:', {
      companyName: config.companyName,
      mode: config.mode,
      modules: config.modules
    });
    
    // Executar seed via SetupService
    const result = await SetupService.seedDatabase(config);
    
    console.log('✅ Setup completed successfully');
    
    // Retornar sucesso
    return NextResponse.json({
      success: true,
      message: 'Setup completed successfully',
      data: {
        tenantId: result.tenant.id,
        tenantName: result.tenant.name,
        usersCreated: result.users.length,
        users: result.users.map((u: User) => ({
          email: u.email,
          role: u.role
        }))
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Setup API error:', error);
    
    // Erro de validação Zod
    if (error instanceof ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid configuration',
        details: error.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }))
      }, { status: 400 });
    }
    
    // Erro genérico
    return NextResponse.json({
      success: false,
      error: 'Setup failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    // Desconectar Prisma
    await SetupService.disconnect();
  }
}
