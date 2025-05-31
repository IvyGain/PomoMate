import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../src/lib/supabase';

// Web-compatible AsyncStorage
const getStorage = () => {
  if (typeof window !== 'undefined') {
    return {
      getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
      removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
    };
  }
  // Fallback for non-web environments
  return require('@react-native-async-storage/async-storage').default;
};

export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  level: number;
  experience: number;
  coins: number;
  streak_days: number;
  last_session_date?: string;
  focus_time_today: number;
  total_focus_time: number;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

// Helper function to sync user stats
const syncUserStats = async (user: User) => {
  try {
    // Dynamically import to avoid circular dependency
    const { useUserStore } = await import('./userStore');
    const userStore = useUserStore.getState();
    
    if (user) {
      userStore.updateStats({
        level: user.level,
        xp: user.experience,
        totalSessions: 0, // Will be updated from sessions
        totalMinutes: user.total_focus_time,
        streak: user.streak_days,
      });
    }
  } catch (error) {
    console.error('Error syncing user stats:', error);
  }
};

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
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          if (data.user) {
            // Fetch user profile from database
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();
              
            if (profileError) throw profileError;
            
            set({ 
              user: profile, 
              isAuthenticated: true,
              isLoading: false,
              error: null 
            });
            
            // Sync user stats
            await syncUserStats(profile);
            
            // For demo account, enable demo mode
            if (email === 'demo@example.com') {
              const { useUserStore } = await import('./userStore');
              useUserStore.getState().enableDemoMode();
            }
          }
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'ログインに失敗しました' 
          });
          throw error;
        }
      },
      
      register: async (email: string, password: string, username: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // Sign up with Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username,
                display_name: username,
              },
            },
          });
          
          if (authError) throw authError;
          
          // Check if email confirmation is required
          if (authData.user && !authData.session) {
            // Email confirmation required
            set({ 
              isLoading: false,
              error: null 
            });
            return { 
              success: true, 
              requiresEmailConfirmation: true,
              email 
            };
          }
          
          if (authData.user) {
            // Create user profile
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .insert([
                {
                  id: authData.user.id,
                  email,
                  username,
                  display_name: username,
                },
              ])
              .select()
              .single();
              
            if (profileError) {
              // If profile already exists, fetch it
              if (profileError.code === '23505') {
                const { data: existingProfile } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', authData.user.id)
                  .single();
                  
                if (existingProfile) {
                  set({ 
                    user: existingProfile, 
                    isAuthenticated: true,
                    isLoading: false,
                    error: null 
                  });
                  return { success: true, requiresEmailConfirmation: false };
                }
              }
              throw profileError;
            }
            
            // Create default settings
            await supabase.from('user_settings').insert([
              { user_id: authData.user.id },
            ]);
            
            // Create default character
            await supabase.from('user_characters').insert([
              {
                user_id: authData.user.id,
                character_id: 'balanced_1',
                is_active: true,
              },
            ]);
            
            set({ 
              user: profile, 
              isAuthenticated: true,
              isLoading: false,
              error: null 
            });
            
            // Sync user stats
            await syncUserStats(profile);
            
            return { success: true, requiresEmailConfirmation: false };
          }
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || '登録に失敗しました' 
          });
          throw error;
        }
      },
      
      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
          
          // Clear user data
          const { useUserStore } = await import('./userStore');
          useUserStore.getState().resetStats();
          
          // Clear persisted storage
          const storage = getStorage();
          await storage.removeItem('auth-storage');
        } catch (error: any) {
          console.error('Logout error:', error);
          // Force logout even if API fails
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false,
            error: null 
          });
          
          // Clear user data and storage anyway
          const { useUserStore } = await import('./userStore');
          useUserStore.getState().resetStats();
          const storage = getStorage();
          await storage.removeItem('auth-storage');
        }
      },
      
      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const { error } = await supabase.auth.resetPasswordForEmail(email);
          if (error) throw error;
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'パスワードリセットに失敗しました' 
          });
          throw error;
        }
      },
      
      updateProfile: async (data: Partial<User>) => {
        try {
          set({ isLoading: true, error: null });
          
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('認証が必要です');
          
          const { data: profile, error } = await supabase
            .from('users')
            .update(data)
            .eq('id', user.id)
            .select()
            .single();
            
          if (error) throw error;
          
          set({ 
            user: profile, 
            isLoading: false,
            error: null 
          });
        } catch (error: any) {
          set({ 
            isLoading: false, 
            error: error.message || 'プロフィール更新に失敗しました' 
          });
          throw error;
        }
      },
      
      checkAuth: async () => {
        try {
          set({ isLoading: true });
          
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Fetch user profile
            const { data: profile, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (error) throw error;
            
            set({ 
              user: profile, 
              isAuthenticated: true,
              isLoading: false,
              error: null 
            });
            
            // Sync user stats
            await syncUserStats(profile);
          } else {
            set({ 
              user: null, 
              isAuthenticated: false,
              isLoading: false,
              error: null 
            });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null 
          });
        }
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => getStorage()),
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);