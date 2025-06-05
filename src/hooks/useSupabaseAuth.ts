import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export const useSupabaseAuth = () => {
  const { setUser, checkAuth } = useAuthStore();

  useEffect(() => {
    console.log('🔍 Initializing Supabase auth listener...');
    
    // Check current session
    checkAuth();

    // Listen for auth changes
    const authListener = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', { event, hasSession: !!session, userId: session?.user?.id });
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in, fetching profile...');
          // Fetch user profile
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('❌ Failed to fetch user profile:', error);
          } else if (profile) {
            console.log('✅ User profile loaded:', { username: profile.username });
            setUser(profile);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('💭 User signed out');
          setUser(null);
        }
      },
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