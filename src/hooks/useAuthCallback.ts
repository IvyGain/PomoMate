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
        console.log('🔗 Auth callback URL:', url);
        
        // Check for new auth confirm format
        const urlParams = new URLSearchParams(window.location.search);
        const tokenHash = urlParams.get('token_hash');
        const type = urlParams.get('type');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        
        // Handle errors
        if (error) {
          console.error('❌ Auth callback error:', errorDescription);
          alert(`認証エラー: ${errorDescription || error}`);
          router.replace('/login');
          return;
        }
        
        // Handle new token_hash format (email confirmation)
        if (tokenHash && type === 'email') {
          console.log('📧 Processing email confirmation with token_hash...');
          
          try {
            const { data, error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type: 'email',
            });
            
            if (verifyError) {
              console.error('❌ OTP verification error:', verifyError);
              alert(`認証エラー: ${verifyError.message}`);
              router.replace('/login');
              return;
            }
            
            console.log('✅ Email confirmed successfully');
            router.replace('/email-confirmed');
            return;
          } catch (verifyErr) {
            console.error('❌ Verification error:', verifyErr);
            alert('認証処理中にエラーが発生しました。');
            router.replace('/login');
            return;
          }
        }
        
        // Handle legacy access_token format (fallback)
        if (url.includes('access_token=')) {
          console.log('🔑 Processing legacy access token format...');
          
          // Parse the URL hash for legacy format
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          
          if (accessToken) {
            try {
              // Set the session
              const { data, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: hashParams.get('refresh_token') || '',
              });
              
              if (sessionError) {
                console.error('❌ Session error:', sessionError);
                alert(`セッションエラー: ${sessionError.message}`);
                router.replace('/login');
                return;
              }
              
              console.log('✅ Session set successfully');
              router.replace('/email-confirmed');
            } catch (sessionErr) {
              console.error('❌ Session setting error:', sessionErr);
              alert('セッション設定中にエラーが発生しました。');
              router.replace('/login');
            }
          }
        }
      } catch (error) {
        console.error('❌ Auth callback error:', error);
        alert('認証処理中に予期しないエラーが発生しました。');
        router.replace('/login');
      }
    };
    
    // Only run on web
    if (typeof window !== 'undefined') {
      handleAuthCallback();
    }
  }, []);
};