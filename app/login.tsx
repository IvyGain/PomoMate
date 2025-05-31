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
  Alert
} from 'react-native';
import { Link } from 'expo-router';
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
  
  // Refs for TextInputs to avoid findDOMNode warnings
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  
  // Show error alert when error changes
  React.useEffect(() => {
    if (error) {
      Alert.alert('エラー', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください。');
      return;
    }
    
    try {
      await login(email, password);
      // Navigation is now handled by the useProtectedRoute hook in _layout.tsx
    } catch (error) {
      // Error is handled by the store
    }
  };
  
  const handleDemoLogin = async () => {
    // Create a demo account if it doesn't exist and log in
    const demoEmail = 'demo@example.com';
    const demoPassword = 'password123';
    
    try {
      await login(demoEmail, demoPassword);
    } catch (error) {
      // If login fails, register a demo account
      const { register } = useAuthStore.getState();
      try {
        await register(demoEmail, demoPassword, 'デモユーザー');
      } catch (registerError) {
        // Error is handled by the store
      }
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
              <Link href="/forgot-password" asChild>
                <TouchableOpacity>
                  <Text style={[styles.link, { color: theme.primary }]}>
                    パスワードをお忘れの方
                  </Text>
                </TouchableOpacity>
              </Link>
              
              <Link href="/register" asChild>
                <TouchableOpacity>
                  <Text style={[styles.link, { color: theme.primary }]}>
                    新規登録
                  </Text>
                </TouchableOpacity>
              </Link>
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