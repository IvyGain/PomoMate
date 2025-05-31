import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function EmailSentScreen() {
  const { theme } = useThemeStore();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
          <Ionicons name="mail-outline" size={64} color={theme.primary} />
        </View>
        
        <Text style={[styles.title, { color: theme.text }]}>
          認証メールを送信しました
        </Text>
        
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          ご登録いただいたメールアドレスに認証用のメールを送信しました。
          メール内のリンクをクリックして、アカウントの登録を完了してください。
        </Text>
        
        <View style={styles.infoBox}>
          <Text style={[styles.infoTitle, { color: theme.text }]}>
            メールが届かない場合
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            • 迷惑メールフォルダをご確認ください
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            • メールアドレスが正しいかご確認ください
          </Text>
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            • 数分待ってから再度お試しください
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={() => router.replace('/login')}
        >
          <Text style={styles.buttonText}>ログイン画面に戻る</Text>
        </TouchableOpacity>
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
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  infoBox: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});