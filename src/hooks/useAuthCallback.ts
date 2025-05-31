import { useEffect } from 'react';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';

export const useAuthCallback = () => {
  useEffect(() => {
    // Handle auth callback from email confirmation
    const handleAuthCallback = async () => {
      try {
        // Get the current URL
        const url = window.location.href;
        
        // Check if this is an auth callback
        if (url.includes('access_token=') || url.includes('error=')) {
          // Parse the URL hash
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const error = hashParams.get('error');
          const errorDescription = hashParams.get('error_description');
          
          if (error) {
            console.error('Auth callback error:', errorDescription);
            router.replace('/login');
            return;
          }
          
          if (accessToken) {
            // Set the session
            const { data, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || '',
            });
            
            if (sessionError) {
              console.error('Session error:', sessionError);
              router.replace('/login');
              return;
            }
            
            // Successfully confirmed email
            router.replace('/email-confirmed');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
      }
    };
    
    // Only run on web
    if (typeof window !== 'undefined') {
      handleAuthCallback();
    }
  }, []);
};