import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TestRegisterScreen() {
  const router = useRouter();
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>テスト新規登録ページ</Text>
        <Text style={styles.subtitle}>このページが表示されれば、ルーティングは正常です</Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>戻る</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});