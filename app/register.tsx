import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const { theme } = useThemeStore();
  const { register, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');

  React.useEffect(() => {
    if (error) {
      Alert.alert('エラー', error, [{ text: 'OK', onPress: clearError }]);
    }
  }, [error, clearError]);

  const handleRegister = async () => {
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
      await register(email, password, username);
      // Navigation is handled by _layout.tsx
    } catch (error) {
      // Error is shown by the effect above
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>新規登録</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          アカウントを作成してPomoMateを始めましょう
        </Text>
        
        <View style={styles.form}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="ユーザー名"
            placeholderTextColor={theme.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="メールアドレス"
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="パスワード（6文字以上）"
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text }]}
            placeholder="パスワード確認"
            placeholderTextColor={theme.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>登録</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.link, { color: theme.primary }]}>
              ログイン画面に戻る
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
  link: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
});