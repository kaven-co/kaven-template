import { useEffect } from 'react';
import { useTenantStore } from '@/stores/tenant.store';

/**
 * Hook para buscar e gerenciar dados do tenant atual
 */
export function useTenant() {
  const { tenant, isLoading, error, fetchTenant } = useTenantStore();
  
  useEffect(() => {
    // Don't retry if already loading or if auth failed (prevents infinite loop on 401)
    if (!tenant && !isLoading && error !== 'unauthorized') {
      fetchTenant();
    }
  }, [tenant, isLoading, error, fetchTenant]);
  
  return { tenant, isLoading, error };
}
