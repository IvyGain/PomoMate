import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/authStore';

const ProfileHeader: React.FC = () => {
  const { user } = useAuthStore();
  
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>こんにちは!</Text>
      <Text style={styles.username}>
        {user?.display_name || user?.username || 'ゲスト'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ProfileHeader;