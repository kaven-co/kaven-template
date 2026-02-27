import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'USER';
  tenantId?: string;
  avatar?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
}

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean; // ← Axisor style
  error: string | null;
  
  // Actions
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updateTokens: (accessToken: string, refreshToken: string) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  set: (state: Partial<AuthState>) => void;
  initializeFromStorage: () => void;
}

import { CONFIG } from '@/lib/config';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
      
      // Login action (Axisor style)
      login: (user, accessToken, refreshToken) => {
        console.log('🔑 LOGIN - Storing tokens in localStorage...');
        
        // ✅ AXISOR STYLE: Armazenar DIRETAMENTE no localStorage
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        
        console.log('✅ LOGIN - Tokens stored in localStorage');
        
        set({
          user,
          isAuthenticated: true,
          isInitialized: true,
          error: null,
        });
        
        console.log('✅ LOGIN - State updated');
      },
      
      // Logout action (Axisor style)
      logout: () => {
        console.log('🚪 LOGOUT - Clearing tokens from localStorage...');
        
        // ✅ AXISOR STYLE: Remover do localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        console.log('✅ LOGOUT - Tokens cleared from localStorage');
        
        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
          error: null,
        });
        
        console.log('✅ LOGOUT - State cleared');
      },
      
      // Update user action
      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
      
      // Update tokens action (Axisor style)
      updateTokens: (accessToken, refreshToken) => {
        console.log('🔄 UPDATE TOKENS - Updating tokens in localStorage...');
        
        // ✅ AXISOR STYLE: Atualizar DIRETAMENTE no localStorage
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);
        
        console.log('✅ UPDATE TOKENS - Tokens updated in localStorage');
      },
      
      // Clear error
      clearError: () => set({ error: null }),
      
      // Set loading
      setLoading: (loading) => set({ isLoading: loading }),

      // Generic set action
      set: (state) => set(state),

      // Force-safe init for client navigation guards.
      initializeFromStorage: () => {
        if (typeof window === 'undefined') return;
        const token = window.localStorage.getItem('access_token');
        set({
          isAuthenticated: Boolean(token),
          isInitialized: true,
          isLoading: false,
          ...(token ? {} : { user: null }),
        });
      },
    }),
    {
      name: 'kaven-auth',
      // ✅ AXISOR STYLE: NÃO persistir isAuthenticated nem tokens
      partialize: (state) => ({
        user: state.user,
        // NÃO persistir tokens nem isAuthenticated
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!state) return;
        if (typeof window === 'undefined') return;

        if (error) {
          state.set({
            isAuthenticated: false,
            isInitialized: true,
            isLoading: false,
            user: null,
            error: null,
          });
          return;
        }

        const token = window.localStorage.getItem('access_token');
        state.set({
          isAuthenticated: Boolean(token),
          isInitialized: true,
          isLoading: false,
          error: null,
          ...(token ? {} : { user: null }),
        });

        if (!token) return;

        setTimeout(() => {
          const apiUrl = CONFIG.serverUrl;

          fetch(`${apiUrl}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
            .then((res) => {
              if (res.status === 401) throw new Error('Unauthorized');
              if (!res.ok) throw new Error(`Server error: ${res.status}`);
              return res.json();
            })
            .then((user) => {
              state.set({
                user,
                isAuthenticated: true,
              });
            })
            .catch((validationError) => {
              if ((validationError as Error).message === 'Unauthorized') {
                window.localStorage.removeItem('access_token');
                window.localStorage.removeItem('refresh_token');
                state.set({
                  isAuthenticated: false,
                  user: null,
                });
              }
            });
        }, 100);
      },
    }
  )
);
