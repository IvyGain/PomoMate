import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { LogOut, Settings } from 'lucide-react-native';
import { router } from 'expo-router';

interface ProfileHeaderProps {
  showSettings?: boolean;
}

export default function ProfileHeader({ showSettings = true }: ProfileHeaderProps) {
  const { user, logout } = useAuthStore();
  const { theme } = useThemeStore();
  
  if (!user) return null;
  
  // Generate initials from display name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        {user.photoURL ? (
          <Image 
            source={{ uri: user.photoURL }} 
            style={styles.avatar} 
          />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
            <Text style={styles.initials}>{getInitials(user.displayName)}</Text>
          </View>
        )}
        
        <View style={styles.userInfo}>
          <Text style={[styles.displayName, { color: theme.text }]}>
            {user.displayName}
          </Text>
          <Text style={[styles.email, { color: theme.textSecondary }]}>
            {user.email}
          </Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        {showSettings && (
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: theme.card }]}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Settings size={20} color={theme.text} />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: theme.card }]}
          onPress={logout}
        >
          <LogOut size={20} color={theme.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    marginLeft: 12,
  },
  displayName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});