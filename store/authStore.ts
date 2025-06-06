import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UnifiedAuthService } from '../src/services/authService.unified';
import { getStorageInterface } from '../src/utils/storage';
import { handleError } from '../src/utils/errorHandler';
import type { User, AuthState as BaseAuthState, LoginCredentials, RegisterCredentials } from '../src/types/auth';

interface AuthState extends Omit<BaseAuthState, 'session'> {
  // Store methods
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        try {
          console.log('🏪 AuthStore: Starting login process');
          set({ isLoading: true, error: null });
          
          console.log('🏪 AuthStore: Calling UnifiedAuthService.login');
          const result = await UnifiedAuthService.login(email, password);
          console.log('🏪 AuthStore: Login service result:', { 
            hasUser: !!result.user, 
            hasToken: !!result.accessToken 
          });
          
          if (result.user) {
            console.log('🏪 AuthStore: Setting authenticated state');
            set({ 
              user: result.user as User, 
              isAuthenticated: true,
              isLoading: false,
              error: null, 
            });
            console.log('🏪 AuthStore: Authentication state updated successfully');
          } else {
            console.warn('🏪 AuthStore: No user returned from login service');
            set({ isLoading: false, error: 'No user data received' });
          }
        } catch (error: any) {
          console.error('🏪 AuthStore: Login error:', error);
          const appError = handleError(error, 'AuthStore.login');
          set({ 
            isLoading: false, 
            error: appError.userMessage || appError.message, 
          });
          throw error;
        }
      },
      
      register: async (email: string, password: string, username: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const result = await UnifiedAuthService.register(email, password, username);
          
          if (result.requiresEmailConfirmation) {
            set({ isLoading: false, error: null });
            // Email confirmation required - will be handled by register screen
            return;
          }
          
          if (result.user) {
            set({ 
              user: result.user as User, 
              isAuthenticated: true,
              isLoading: false,
              error: null, 
            });
          }
        } catch (error: any) {
          const appError = handleError(error, 'AuthStore.register');
          set({ 
            isLoading: false, 
            error: appError.userMessage || appError.message, 
          });
          throw error;
        }
      },
      
      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          
          await UnifiedAuthService.logout();
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null, 
          });
        } catch (error: any) {
          // Force logout even if API fails
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false,
            error: null, 
          });
        }
      },
      
      checkAuth: async () => {
        try {
          const user = await UnifiedAuthService.getCurrentUser();
          
          if (user) {
            set({ 
              user: user as User, 
              isAuthenticated: true,
              error: null, 
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false,
              error: null, 
            });
          }
        } catch (error) {
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null, 
          });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
      
      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          
          await UnifiedAuthService.requestPasswordReset(email);
          
          set({ isLoading: false, error: null });
        } catch (error: any) {
          const appError = handleError(error, 'AuthStore.resetPassword');
          set({ 
            isLoading: false, 
            error: appError.userMessage || appError.message, 
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => getStorageInterface()),
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated, 
      }),
    },
  ),
);