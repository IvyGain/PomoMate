import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export const useSupabaseAuth = () => {
  const { setUser, checkAuth } = useAuthStore();

  useEffect(() => {
    // Check current session
    checkAuth();

    // Listen for auth changes
    const authListener = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Fetch user profile
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser(profile);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      try {
        if (authListener) {
          if ('data' in authListener && authListener.data?.subscription) {
            authListener.data.subscription.unsubscribe();
          } else if ('subscription' in authListener && authListener.subscription) {
            authListener.subscription.unsubscribe();
          }
        }
      } catch (error) {
        console.log('Auth cleanup failed (demo mode):', error);
      }
    };
  }, [checkAuth, setUser]);
};