'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useAuthStore } from '@/stores/auth.store';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('SUPER_ADMIN' | 'TENANT_ADMIN' | 'USER')[];
}

/**
 * AuthGuard - Estilo Axisor
 * Aguarda isInitialized ao invés de isHydrated
 */
export function AuthGuard({ children, allowedRoles }: Readonly<AuthGuardProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading, isInitialized, initializeFromStorage } = useAuthStore();

  useEffect(() => {
    if (isInitialized) return;
    useAuthStore.persist.rehydrate();

    const timeout = setTimeout(() => {
      if (!useAuthStore.getState().isInitialized) {
        initializeFromStorage();
      }
    }, 1200);
    return () => clearTimeout(timeout);
  }, [isInitialized, initializeFromStorage]);

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    // Ignore public paths to prevent loops
    const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify'];
    const isPublicPath = PUBLIC_PATHS.some(path => pathname.includes(path));

    if (isPublicPath) {
        return;
    }

    // Verificar autenticação
    if (!isAuthenticated) {
      const returnUrl = encodeURIComponent(pathname);
      router.replace(`/login?returnUrl=${returnUrl}`);
      return;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.replace('/unauthorized');
      return;
    }
  }, [isInitialized, isAuthenticated, user, router, pathname, allowedRoles]);

  // ✅ AXISOR STYLE: Loader bloqueante
  // Enquanto estiver checando token (loading) ou ainda não inicializou
  if (!isInitialized || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            Verificando credenciais...
          </p>
        </div>
      </div>
    );
  }

  // Se passou pelo loading e não está autenticado, retorna null (o useEffect vai redirecionar)
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
