import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Image,
  Alert,
  Platform
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { theme } = useThemeStore();
  const { loginWithGoogle, isLoading, error, clearError } = useAuthStore();
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const redirectUri = makeRedirectUri({
    scheme: Platform.OS === 'web' ? 'https' : 'pomomate',
    path: Platform.OS === 'web' ? undefined : 'login',
    useProxy: Platform.OS === 'web' ? false : true,
  });

  React.useEffect(() => {
    console.log('=== Google OAuth Configuration ===');
    console.log('Redirect URI:', redirectUri);
    console.log('Platform:', Platform.OS);
    console.log('================================');
  }, [redirectUri]);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    {
      clientId: Platform.select({
        ios: '773602259069-db0uo70d31rmh7lsd3fbsf36uagq3lno.apps.googleusercontent.com',
        android: '',
        default: '773602259069-e8e1k3gfr1cgge47743079jci75sgfvg.apps.googleusercontent.com'
      }),
      redirectUri,
    },
  );

  React.useEffect(() => {
    if (error) {
      Alert.alert('エラー', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);

  const handleGoogleLogin = React.useCallback(async (idToken: string) => {
    try {
      setGoogleLoading(true);
      await loginWithGoogle(idToken);
    } catch (error) {
      console.error('Google login error:', error);
    } finally {
      setGoogleLoading(false);
    }
  }, [loginWithGoogle]);

  React.useEffect(() => {
    const processResponse = async () => {
      if (response?.type === 'success') {
        const { id_token } = response.params;
        await handleGoogleLogin(id_token);
      } else if (response?.type === 'error') {
        setGoogleLoading(false);
        Alert.alert('エラー', 'Google認証がキャンセルされました。');
      }
    };
    processResponse();
  }, [response, handleGoogleLogin]);

  const handleDemoLogin = async () => {
    try {
      console.log('[LOGIN] Starting demo login...');
      await loginWithGoogle('demo-token-123456789');
      console.log('[LOGIN] Demo login successful');
    } catch (error) {
      console.error('[LOGIN] Demo login error:', error);
      Alert.alert('エラー', 'デモログインに失敗しました。もう一度お試しください。');
    }
  };

  const handleGooglePress = async () => {
    try {
      setGoogleLoading(true);
      await promptAsync();
    } catch {
      setGoogleLoading(false);
      Alert.alert('エラー', 'Google認証を開始できませんでした。');
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1611224885990-ab7363d7f2a9?q=80&w=200&auto=format&fit=crop' }} 
            style={styles.logo} 
          />
          <Text style={[styles.appName, { color: theme.text }]}>PomoMate</Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            集中力を高め、生産性を向上させる
          </Text>
        </View>
        
        <View style={styles.formContainer}>
          <TouchableOpacity 
            style={[styles.googleButton, { backgroundColor: '#fff' }]}
            onPress={handleGooglePress}
            disabled={isLoading || googleLoading || !request}
          >
            {googleLoading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Image
                  source={{ uri: 'https://cdn.cdnlogo.com/logos/g/35/google-icon.svg' }}
                  style={styles.googleIcon}
                />
                <Text style={styles.googleButtonText}>Googleでログイン</Text>
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>または</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>
          
          <TouchableOpacity 
            style={[styles.demoButton, { backgroundColor: theme.card }]}
            onPress={handleDemoLogin}
            disabled={isLoading || googleLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={theme.text} />
            ) : (
              <Text style={[styles.demoButtonText, { color: theme.text }]}>
                デモアカウントでログイン
              </Text>
            )}
          </TouchableOpacity>
          
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Googleアカウントでログインすることで、{'\n'}
            利用規約とプライバシーポリシーに同意したものとみなされます。
          </Text>
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
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  googleButton: {
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  demoButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});