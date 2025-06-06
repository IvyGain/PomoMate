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
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => void;
  clearError: () => void;
}

// Mock user database for demo purposes
const MOCK_USERS: Record<string, { id: string; email: string; password: string; displayName: string; createdAt: string }> = {};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if user exists in our mock database
          const normalizedEmail = email.toLowerCase().trim();
          const user = Object.values(MOCK_USERS).find(u => u.email === normalizedEmail);
          
          if (!user) {
            throw new Error("ユーザーが見つかりません。");
          }
          
          if (user.password !== password) {
            throw new Error("パスワードが正しくありません。");
          }
          
          // Login successful
          const { password: _, ...userWithoutPassword } = user;
          set({ 
            user: userWithoutPassword as User, 
            isAuthenticated: true,
            isLoading: false 
          });
          
          return Promise.resolve();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "ログイン中にエラーが発生しました。", 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      
      register: async (email: string, password: string, displayName: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Validate input
          if (!email || !password || !displayName) {
            throw new Error("すべての項目を入力してください。");
          }
          
          // Check if email is already registered
          const normalizedEmail = email.toLowerCase().trim();
          const existingUser = Object.values(MOCK_USERS).find(u => u.email === normalizedEmail);
          
          if (existingUser) {
            throw new Error("このメールアドレスは既に登録されています。");
          }
          
          // Create new user
          const newUser = {
            id: Date.now().toString(),
            email: normalizedEmail,
            password,
            displayName,
            createdAt: new Date().toISOString()
          };
          
          // Add to mock database
          MOCK_USERS[newUser.id] = newUser;
          
          // Login the user
          const { password: _, ...userWithoutPassword } = newUser;
          set({ 
            user: userWithoutPassword as User, 
            isAuthenticated: true,
            isLoading: false 
          });
          
          return Promise.resolve();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "登録中にエラーが発生しました。", 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      
      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if user exists
          const normalizedEmail = email.toLowerCase().trim();
          const user = Object.values(MOCK_USERS).find(u => u.email === normalizedEmail);
          
          if (!user) {
            throw new Error("このメールアドレスは登録されていません。");
          }
          
          // In a real app, we would send a password reset email here
          // For this demo, we'll just show a success message
          
          set({ isLoading: false });
          return Promise.resolve();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : "パスワードリセット中にエラーが発生しました。", 
            isLoading: false 
          });
          return Promise.reject(error);
        }
      },
      
      updateProfile: (data: Partial<User>) => {
        const { user } = get();
        if (!user) return;
        
        set({ 
          user: { ...user, ...data }
        });
        
        // In a real app, we would update the user in the database here
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