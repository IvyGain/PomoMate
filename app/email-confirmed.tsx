import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '@/store/themeStore';
import { CheckCircle } from 'lucide-react-native';
import { Link, router } from 'expo-router';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export default function EmailConfirmedScreen() {
  const { theme } = useThemeStore();
  const { setUser } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const processEmailConfirmation = async () => {
      try {
        console.log('📧 Processing email confirmation...');
        
        // Check if we're on web and have URL parameters
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const fragment = window.location.hash.substring(1);
          const hashParams = new URLSearchParams(fragment);
          
          console.log('🔍 URL params:', Object.fromEntries(urlParams));
          console.log('🔍 Hash params:', Object.fromEntries(hashParams));
          
          // Check for error in URL
          const error = urlParams.get('error') || hashParams.get('error');
          const errorDescription = urlParams.get('error_description') || hashParams.get('error_description');
          
          if (error) {
            console.error('❌ Auth error from URL:', error, errorDescription);
            
            if (error === 'email_link_expired') {
              throw new Error('認証リンクの有効期限が切れています。新しい確認メールをリクエストしてください。');
            } else if (error === 'invalid_token') {
              throw new Error('認証トークンが無効です。新しい確認メールをリクエストしてください。');
            } else {
              throw new Error(`認証エラー: ${errorDescription || error}`);
            }
          }
          
          // Check for access token or session info
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          
          if (accessToken) {
            console.log('✅ Found tokens in URL, setting session...');
            
            // Set the session manually
            const { data, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (setSessionError) {
              console.error('❌ Session setting error:', setSessionError);
              throw setSessionError;
            }
            
            console.log('✅ Session set successfully');
          }
        }
        
        // Wait a bit for auth callback to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Session error:', sessionError);
          throw sessionError;
        }
        
        if (session?.user) {
          console.log('✅ Email confirmed for:', session.user.email);
          
          // Create or update user profile
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            // PGRST116 is "not found" - ignore this error
            console.error('❌ Profile fetch error:', profileError);
            throw profileError;
          }
            
          if (!profile) {
            // Create profile if it doesn't exist
            const username = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User';
            
            console.log('📝 Creating new user profile...');
            const { data: newProfile, error: insertError } = await supabase
              .from('users')
              .insert([{
                id: session.user.id,
                email: session.user.email,
                username: username,
                display_name: username,
                level: 1,
                experience: 0,
                coins: 100,
                streak_days: 0,
                focus_time_today: 0,
                total_focus_time: 0,
              }])
              .select()
              .single();
              
            if (insertError) {
              console.error('❌ Profile creation error:', insertError);
              throw insertError;
            }
              
            if (newProfile) {
              console.log('✅ Profile created successfully');
              setUser(newProfile);
            }
          } else {
            console.log('✅ Profile loaded successfully');
            setUser(profile);
          }
        } else {
          console.log('⚠️ No session found, but that might be OK if auth is still processing');
          // Don't throw error here - the user might still be in the auth process
        }
      } catch (err: any) {
        console.error('❌ Email confirmation error:', err);
        let errorMessage = 'メール確認の処理中にエラーが発生しました';
        
        if (err.message) {
          if (err.message.includes('expired')) {
            errorMessage = '認証リンクの有効期限が切れています。新しい確認メールをリクエストしてください。';
          } else if (err.message.includes('invalid')) {
            errorMessage = '認証リンクが無効です。新しい確認メールをリクエストしてください。';
          } else {
            errorMessage = err.message;
          }
        }
        
        setError(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    };
    
    // Only run if we're on the email-confirmed page
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      if (currentPath.includes('email-confirmed')) {
        processEmailConfirmation();
      } else {
        setIsProcessing(false);
      }
    } else {
      processEmailConfirmation();
    }
  }, []);
  
  if (isProcessing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.title, { color: theme.text }]}>
            認証処理中...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const handleResendEmail = async () => {
    try {
      setIsProcessing(true);
      // For now, redirect to register page where they can request a new email
      router.push('/register');
    } catch (err) {
      console.error('Failed to navigate:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: theme.card }]}>
            <Text style={[styles.title, { color: theme.text }]}>
              認証エラー
            </Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {error}
            </Text>
            
            <View style={styles.buttonContainer}>
              {error.includes('有効期限') || error.includes('無効') ? (
                <TouchableOpacity 
                  style={[styles.resendButton, { backgroundColor: theme.success || '#4CAF50' }]}
                  onPress={handleResendEmail}
                >
                  <Text style={styles.buttonText}>新しい確認メールを送信</Text>
                </TouchableOpacity>
              ) : null}
              
              <Link href="/login" asChild>
                <TouchableOpacity 
                  style={[styles.loginButton, { backgroundColor: theme.primary }]}
                >
                  <Text style={styles.buttonText}>ログイン画面へ</Text>
                </TouchableOpacity>
              </Link>
              
              <Link href="/register" asChild>
                <TouchableOpacity 
                  style={[styles.secondaryButton, { borderColor: theme.primary }]}
                >
                  <Text style={[styles.secondaryButtonText, { color: theme.primary }]}>新規登録</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <CheckCircle size={80} color={theme.success || '#4CAF50'} style={styles.icon} />
          
          <Text style={[styles.title, { color: theme.text }]}>
            メール確認完了！
          </Text>
          
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            アカウントの登録が完了しました
          </Text>
          
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            メールアドレスの確認が完了しました。
            今すぐログインして、PomoMateを始めましょう！
          </Text>
          
          <Link href="/login" asChild>
            <TouchableOpacity 
              style={[styles.loginButton, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.loginButtonText}>ログイン画面へ進む</Text>
            </TouchableOpacity>
          </Link>
          
          <View style={styles.tips}>
            <Text style={[styles.tipsTitle, { color: theme.text }]}>
              🎉 PomoMateへようこそ！
            </Text>
            <Text style={[styles.tipsText, { color: theme.textSecondary }]}>
              • ポモドーロタイマーで集中力を高めましょう
            </Text>
            <Text style={[styles.tipsText, { color: theme.textSecondary }]}>
              • キャラクターを育てて楽しく継続
            </Text>
            <Text style={[styles.tipsText, { color: theme.textSecondary }]}>
              • 友達と一緒にチームセッションも可能
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  loginButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tips: {
    width: '100%',
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  tipsText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});