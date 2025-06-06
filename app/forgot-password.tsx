import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { Link } from 'expo-router';

export default function ForgotPasswordScreen() {
  const { theme } = useThemeStore();
  const { resetPassword, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  
  // Show error alert when error changes
  React.useEffect(() => {
    if (error) {
      Alert.alert('エラー', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error, clearError]);
  
  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('入力エラー', 'メールアドレスを入力してください。');
      return;
    }
    
    try {
      await resetPassword(email);
      setResetSent(true);
      Alert.alert(
        'パスワードリセット',
        'パスワードリセットの手順をメールで送信しました。メールをご確認ください。',
        [{ text: 'OK' }]
      );
    } catch (error) {
      // Error is handled by the store
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.backButton}>
              <ArrowLeft size={24} color={theme.text} />
            </TouchableOpacity>
          </Link>
          
          <View style={styles.headerContainer}>
            <Text style={[styles.header, { color: theme.text }]}>
              パスワードをリセット
            </Text>
            <Text style={[styles.subheader, { color: theme.textSecondary }]}>
              アカウントに登録したメールアドレスを入力してください。パスワードリセットの手順をメールで送信します。
            </Text>
          </View>
          
          <View style={styles.formContainer}>
            <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
              <Mail size={20} color={theme.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="メールアドレス"
                placeholderTextColor={theme.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!resetSent}
              />
            </View>
            
            <TouchableOpacity 
              style={[
                styles.resetButton, 
                { 
                  backgroundColor: resetSent ? theme.success : theme.primary,
                  opacity: resetSent ? 0.8 : 1
                }
              ]}
              onPress={handleResetPassword}
              disabled={isLoading || resetSent}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.resetButtonText}>
                  {resetSent ? '送信済み' : 'リセットリンクを送信'}
                </Text>
              )}
            </TouchableOpacity>
            
            <Link href="/login" asChild>
              <TouchableOpacity style={styles.loginLinkContainer}>
                <Text style={[styles.loginLink, { color: theme.primary }]}>
                  ログイン画面に戻る
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
    padding: 4,
  },
  headerContainer: {
    marginBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subheader: {
    fontSize: 16,
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 24,
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
  resetButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginLinkContainer: {
    alignItems: 'center',
    padding: 8,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: '500',
  },
});