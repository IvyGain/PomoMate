import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';

export default function LoginScreen() {
  const { theme } = useThemeStore();
  const { login, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Debug mount
  React.useEffect(() => {
    console.log('LoginScreen mounted successfully');
  }, []);
  
  // Refs for TextInputs to avoid findDOMNode warnings
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  
  // Show error alert when error changes
  React.useEffect(() => {
    if (error) {
      Alert.alert('エラー', error, [
        { text: 'OK', onPress: clearError },
      ]);
    }
  }, [error, clearError]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください。');
      return;
    }
    
    console.log('🔄 Starting login process with:', { email });
    
    try {
      console.log('🔐 Calling login function...');
      await login(email, password);
      console.log('✅ Login function completed successfully');
      
      // Wait a moment for state to update, then navigate
      setTimeout(() => {
        console.log('🚀 Navigating to tabs...');
        router.replace('/(tabs)');
        console.log('✅ Navigation initiated');
      }, 500);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      
      Alert.alert(
        'ログインエラー', 
        `ログインに失敗しました: ${error.message || 'Unknown error'}`,
        [{ text: 'OK' }],
      );
    }
  };

  const handleDemoLogin = async () => {
    // Use existing registered demo user
    const demoEmail = 'romancemorio+test@gmail.com';
    const demoPassword = 'Po8silba8';
    
    try {
      console.log('Attempting demo login with:', demoEmail);
      await login(demoEmail, demoPassword);
      
      // Wait a moment for state to update, then navigate
      setTimeout(() => {
        console.log('Demo login successful, navigating to tabs');
        router.replace('/(tabs)');
      }, 500);
    } catch (error) {
      console.error('Demo login failed:', error);
      Alert.alert(
        'デモログインエラー', 
        'デモユーザーでのログインに失敗しました。管理者にお問い合わせください。',
        [{ text: 'OK' }],
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
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
            <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
              <Mail size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                ref={emailInputRef}
                style={[styles.input, { color: theme.text }]}
                placeholder="メールアドレス"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            
            <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
              <Lock size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                ref={passwordInputRef}
                style={[styles.input, { color: theme.text }]}
                placeholder="パスワード"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                {showPassword ? (
                  <EyeOff size={20} color={theme.textSecondary} />
                ) : (
                  <Eye size={20} color={theme.textSecondary} />
                )}
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.loginButton, { backgroundColor: theme.primary }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>ログイン</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.demoButton, { backgroundColor: theme.card }]}
              onPress={handleDemoLogin}
              disabled={isLoading}
            >
              <Text style={[styles.demoButtonText, { color: theme.text }]}>
                デモアカウントでログイン
              </Text>
            </TouchableOpacity>
            
            <View style={styles.linksContainer}>
              <TouchableOpacity onPress={() => {
                console.log('Forgot password button pressed');
                try {
                  router.push('/forgot-password');
                } catch (error) {
                  console.error('Navigation error:', error);
                  Alert.alert('エラー', 'パスワードリセット画面への移動に失敗しました');
                }
              }}>
                <Text style={[styles.link, { color: theme.primary }]}>
                  パスワードをお忘れの方
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={(e) => {
                console.log('Register button pressed');
                console.log('Event:', e);
                console.log('Router object:', router);
                console.log('Current pathname:', window?.location?.pathname);
                
                // Prevent default if needed
                if (e && e.preventDefault) {
                  e.preventDefault();
                }
                
                try {
                  console.log('Attempting navigation to /register');
                  
                  // Try different navigation methods
                  if (router && router.push) {
                    console.log('Using router.push');
                    router.push('/register');
                  } else if (router && router.navigate) {
                    console.log('Using router.navigate');
                    router.navigate('/register');
                  } else if (window && window.location) {
                    console.log('Using window.location fallback');
                    window.location.href = '/register';
                  } else {
                    throw new Error('No navigation method available');
                  }
                  
                  console.log('Navigation to /register completed');
                } catch (error: any) {
                  console.error('Navigation error:', error);
                  console.error('Error stack:', error.stack);
                  console.error('Error type:', error.constructor.name);
                  Alert.alert('エラー', `登録画面への移動に失敗しました: ${error.message || error}`);
                }
              }}>
                <Text style={[styles.link, { color: theme.primary }]}>
                  新規登録
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  link: {
    fontSize: 14,
    fontWeight: '500',
  },
});