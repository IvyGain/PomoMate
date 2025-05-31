import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SafeTextInput } from '@/components/SafeTextInput';

// デバッグログ
console.log('📱 RegisterScreen loading...');

export default function RegisterScreen() {
  // デバッグ: レンダリング開始
  console.log('🎨 RegisterScreen rendering...');
  
  const { theme } = useThemeStore();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mounted, setMounted] = useState(false);

  // コンポーネントマウント確認
  useEffect(() => {
    console.log('🔄 RegisterScreen mounted');
    setMounted(true);
    
    return () => {
      console.log('🔄 RegisterScreen unmounted');
      clearError();
    };
  }, []);

  // エラー表示
  useEffect(() => {
    if (error && mounted) {
      console.error('❌ Auth error:', error);
      Alert.alert('エラー', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError, mounted]);

  const handleRegister = async () => {
    console.log('📝 Attempting registration...');
    
    // バリデーション
    if (!email || !password || !username) {
      Alert.alert('入力エラー', 'すべてのフィールドを入力してください。');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('入力エラー', 'パスワードが一致しません。');
      return;
    }

    if (password.length < 6) {
      Alert.alert('入力エラー', 'パスワードは6文字以上で入力してください。');
      return;
    }
    
    try {
      console.log('🚀 Calling register function...');
      await register(email, password, username);
      console.log('✅ Registration successful');
      // Navigation is handled by _layout.tsx
    } catch (error) {
      console.error('❌ Registration failed:', error);
      // Error is shown by the effect above
    }
  };

  const handleBack = () => {
    console.log('🔙 Navigating back to login...');
    router.back();
  };

  // セーフガード: テーマが読み込まれていない場合
  if (!theme) {
    console.warn('⚠️ Theme not loaded');
    return (
      <View style={[styles.container, { backgroundColor: '#1a1a1a' }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // メインレンダリング
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.text }]}>新規登録</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              アカウントを作成してPomoMateを始めましょう
            </Text>
            
            <View style={styles.form}>
              <SafeTextInput
                style={[styles.input, { 
                  backgroundColor: theme.card, 
                  color: theme.text,
                  borderColor: theme.border || 'transparent'
                }]}
                placeholder="ユーザー名"
                placeholderTextColor={theme.textSecondary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                testID="username-input"
              />
              
              <SafeTextInput
                style={[styles.input, { 
                  backgroundColor: theme.card, 
                  color: theme.text,
                  borderColor: theme.border || 'transparent'
                }]}
                placeholder="メールアドレス"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                testID="email-input"
              />
              
              <SafeTextInput
                style={[styles.input, { 
                  backgroundColor: theme.card, 
                  color: theme.text,
                  borderColor: theme.border || 'transparent'
                }]}
                placeholder="パスワード（6文字以上）"
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                testID="password-input"
              />
              
              <SafeTextInput
                style={[styles.input, { 
                  backgroundColor: theme.card, 
                  color: theme.text,
                  borderColor: theme.border || 'transparent'
                }]}
                placeholder="パスワード確認"
                placeholderTextColor={theme.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                testID="confirm-password-input"
              />
              
              <TouchableOpacity 
                style={[styles.button, { 
                  backgroundColor: theme.primary,
                  opacity: isLoading ? 0.7 : 1
                }]}
                onPress={handleRegister}
                disabled={isLoading}
                testID="register-button"
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>登録</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleBack}
                testID="back-button"
                style={styles.linkContainer}
              >
                <Text style={[styles.link, { color: theme.primary }]}>
                  ログイン画面に戻る
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 40,
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
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkContainer: {
    paddingVertical: 8,
  },
  link: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});