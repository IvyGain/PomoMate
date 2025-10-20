import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { trpcClient } from '@/lib/trpc';

export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  clearError: () => void;
}



export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      loginWithGoogle: async (idToken: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await trpcClient.auth.googleLogin.mutate({ idToken });
          
          if (!response.success || !response.user) {
            throw new Error('認証に失敗しました');
          }
          
          set({ 
            user: response.user, 
            isAuthenticated: true,
            isLoading: false 
          });
          
          return Promise.resolve();
        } catch (error) {
          console.error('[AUTH] Google login error:', error);
          set({ 
            error: error instanceof Error ? error.message : "Google認証中にエラーが発生しました。", 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      

      updateProfile: (data: Partial<User>) => {
        const { user } = get();
        if (!user) return;
        
        set({ 
          user: { ...user, ...data }
        });
      },
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);