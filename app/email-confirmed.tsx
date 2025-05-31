import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '@/store/themeStore';
import { CheckCircle } from 'lucide-react-native';
import { Link } from 'expo-router';

export default function EmailConfirmedScreen() {
  const { theme } = useThemeStore();
  
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
  loginButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: '#fff',
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