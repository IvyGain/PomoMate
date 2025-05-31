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
  
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
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
          set({ isLoading: true, error: null });
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) throw error;
          
          if (data.user) {
            // Fetch user profile
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
          
          const redirectUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
            ? `${window.location.origin}/email-confirmed`
            : 'https://pomomate.vercel.app/email-confirmed';

          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                username,
                display_name: username,
              },
              emailRedirectTo: redirectUrl,
            },
          });
          
          if (authError) throw authError;
          
          // Check if email confirmation is required
          if (authData.user && !authData.session) {
            set({ isLoading: false, error: null });
            // Email confirmation required - will be handled by register screen
            return;
          }
          
          if (authData.user) {
            // Create user profile
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .insert([{
                id: authData.user.id,
                email,
                username,
                display_name: username,
              }])
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
                  return;
                }
              }
              throw profileError;
            }
            
            // Create default settings
            await supabase.from('user_settings').insert([
              { user_id: authData.user.id },
            ]);
            
            // Create default character
            await supabase.from('user_characters').insert([{
              user_id: authData.user.id,
              character_id: 'balanced_1',
              is_active: true,
            }]);
            
            set({ 
              user: profile, 
              isAuthenticated: true,
              isLoading: false,
              error: null 
            });
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
        } catch (error: any) {
          // Force logout even if API fails
          set({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false,
            error: null 
          });
        }
      },
      
      checkAuth: async () => {
        try {
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
              error: null 
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false,
              error: null 
            });
          }
        } catch (error) {
          set({ 
            user: null, 
            isAuthenticated: false, 
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