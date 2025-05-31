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
  ScrollView,
  Alert
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react-native';
import { Link, router } from 'expo-router';
import '@/src/utils/styleFix';

export default function RegisterScreen() {
  const { theme } = useThemeStore();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  // Refs for TextInputs to avoid findDOMNode warnings
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);
  const displayNameInputRef = useRef<TextInput>(null);
  
  // Show error alert when error changes
  React.useEffect(() => {
    if (error) {
      Alert.alert('エラー', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);
  
  const handleRegister = async () => {
    try {
      // Clear any previous errors
      clearError();
      
      // Validate inputs
      if (!email || !password || !confirmPassword || !displayName) {
        Alert.alert('入力エラー', 'すべての項目を入力してください。');
        return;
      }
      
      if (password !== confirmPassword) {
        Alert.alert('パスワードエラー', 'パスワードが一致しません。');
        return;
      }
      
      if (password.length < 6) {
        Alert.alert('パスワードエラー', 'パスワードは6文字以上で入力してください。');
        return;
      }
      
      console.log('Starting registration process...');
      const result = await register(email, password, displayName);
      console.log('Registration result:', result);
      
      if (result?.requiresEmailConfirmation) {
        // Show email confirmation message
        console.log('Email confirmation required');
        setRegisteredEmail(email);
        setShowConfirmationMessage(true);
      } else {
        console.log('Registration completed successfully');
      }
      // If no email confirmation required, navigation is handled by the useProtectedRoute hook
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Check if email already exists
      if (error.message?.includes('already registered')) {
        Alert.alert(
          'アカウント作成エラー',
          'このメールアドレスは既に登録されています。ログインするか、別のメールアドレスをお使いください。',
          [
            { text: 'ログイン画面へ', onPress: () => router.push('/login') },
            { text: 'OK', style: 'cancel' }
          ]
        );
      } else {
        // Show generic error for other cases
        Alert.alert(
          'アカウント作成エラー',
          `登録に失敗しました: ${error.message || '不明なエラーが発生しました'}`,
          [{ text: 'OK' }]
        );
      }
    }
  };
  
  // Show email confirmation message if needed
  if (showConfirmationMessage) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.confirmationContainer}>
          <View style={[styles.confirmationCard, { backgroundColor: theme.card }]}>
            <Mail size={64} color={theme.primary} style={styles.confirmationIcon} />
            <Text style={[styles.confirmationTitle, { color: theme.text }]}>
              メールをご確認ください
            </Text>
            <Text style={[styles.confirmationText, { color: theme.textSecondary }]}>
              確認メールを送信しました：
            </Text>
            <Text style={[styles.confirmationEmail, { color: theme.primary }]}>
              {registeredEmail}
            </Text>
            <Text style={[styles.confirmationInstructions, { color: theme.textSecondary }]}>
              メール内のリンクをクリックして、アカウントの登録を完了してください。
            </Text>
            
            <View style={styles.confirmationNote}>
              <Text style={[styles.noteTitle, { color: theme.text }]}>
                📝 重要な注意事項：
              </Text>
              <Text style={[styles.noteText, { color: theme.textSecondary }]}>
                • メールが届かない場合は、迷惑メールフォルダをご確認ください
              </Text>
              <Text style={[styles.noteText, { color: theme.textSecondary }]}>
                • リンクをクリック後、このアプリに戻ってログインしてください
              </Text>
              <Text style={[styles.noteText, { color: theme.textSecondary }]}>
                • 確認リンクは24時間有効です
              </Text>
            </View>
            
            <Link href="/login" asChild>
              <TouchableOpacity 
                style={[styles.backToLoginButton, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.backToLoginText}>ログイン画面へ</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Text style={[styles.header, { color: theme.text }]}>アカウント作成</Text>
            <Text style={[styles.subheader, { color: theme.textSecondary }]}>
              PomoMateを始めるために新しいアカウントを作成しましょう
            </Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
              <User size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                ref={displayNameInputRef}
                style={[styles.input, { color: theme.text }]}
                placeholder="ユーザー名"
                placeholderTextColor={theme.textSecondary}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            </View>
            
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
            
            <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
              <Lock size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                ref={confirmPasswordInputRef}
                style={[styles.input, { color: theme.text }]}
                placeholder="パスワード（確認）"
                placeholderTextColor={theme.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.registerButton, { backgroundColor: theme.primary }]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>アカウント作成</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.loginLinkContainer}>
              <Text style={[styles.loginText, { color: theme.textSecondary }]}>
                既にアカウントをお持ちですか？
              </Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text style={[styles.loginLink, { color: theme.primary }]}>
                    ログイン
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
    padding: 20,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
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
  registerButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    marginRight: 4,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmationCard: {
    width: '100%',
    maxWidth: 400,
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
  },
  confirmationIcon: {
    marginBottom: 24,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  confirmationEmail: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  confirmationInstructions: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  confirmationNote: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 24,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noteText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  backToLoginButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});