import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';
import { LogOut, Settings } from 'lucide-react-native';
import { router } from 'expo-router';

interface ProfileHeaderProps {
  showSettings?: boolean;
}

export default function ProfileHeader({ showSettings = true }: ProfileHeaderProps) {
  const { user, logout } = useAuthStore();
  const { theme } = useThemeStore();
  const { level, xp, xpToNextLevel } = useUserStore();
  
  if (!user) return null;
  
  const progress = xp / xpToNextLevel;
  
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
          <View style={styles.levelBadge}>
            <Text style={[styles.levelText, { color: theme.primary }]}>Lv.{level}</Text>
            <Text style={[styles.xpText, { color: theme.textSecondary }]}>
              {xp}/{xpToNextLevel} XP
            </Text>
          </View>
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
      
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarBackground, { backgroundColor: theme.card }]}>
          <View 
            style={[
              styles.progressBarFill, 
              { backgroundColor: theme.primary, width: `${progress * 100}%` }
            ]} 
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  xpText: {
    fontSize: 12,
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
  progressBarContainer: {
    paddingHorizontal: 4,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});