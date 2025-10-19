import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
          
          const user = {
            id: idToken.substring(0, 20),
            email: 'google-user@example.com',
            displayName: 'Google User',
            photoURL: undefined,
            createdAt: new Date().toISOString(),
          };
          
          set({ 
            user, 
            isAuthenticated: true,
            isLoading: false 
          });
          
          return Promise.resolve();
        } catch (error) {
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