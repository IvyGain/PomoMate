import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SafeTextInput } from '@/components/SafeTextInput';

export default function LoginScreen() {
  const { theme } = useThemeStore();
  const { login, register, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Show error alert when error changes
  React.useEffect(() => {
    if (error) {
      Alert.alert('エラー', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('入力エラー', 'メールアドレスとパスワードを入力してください。');
      return;
    }
    
    try {
      await login(email, password);
      // Navigation is handled by _layout.tsx
    } catch (error) {
      // Error is shown by the effect above
    }
  };

  const handleDemoLogin = async () => {
    const demoEmail = 'demo@pomomate.app';
    const demoPassword = 'DemoPassword123!';
    
    try {
      await login(demoEmail, demoPassword);
    } catch (error) {
      // If login fails, try to register demo account
      try {
        await register(demoEmail, demoPassword, 'デモユーザー');
      } catch (registerError) {
        // Error is shown by the effect above
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>PomoMate</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          集中力を高め、生産性を向上させる
        </Text>
        
        <View style={styles.form}>
          <SafeTextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="メールアドレス"
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <SafeTextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="パスワード"
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>ログイン</Text>
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
          
          <TouchableOpacity onPress={() => {
            console.log('🔍 Navigating to simple register screen');
            router.push('/register-simple');
          }}>
            <Text style={[styles.link, { color: theme.primary }]}>
              新規登録（テスト）
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => {
            console.log('🔍 Attempting original register navigation');
            router.push('/register');
          }} style={{ marginTop: 8 }}>
            <Text style={[styles.link, { color: theme.primary, fontSize: 14 }]}>
              新規登録（オリジナル）
            </Text>
          </TouchableOpacity>
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  input: {
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
  },
  button: {
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoButton: {
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  demoButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});