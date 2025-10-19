import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';
import { useTimerStore } from '@/store/timerStore';
import { Settings, Clock, Users } from 'lucide-react-native';
import { router } from 'expo-router';

interface ProfileHeaderProps {
  showSettings?: boolean;
}

export default function ProfileHeader({ showSettings = true }: ProfileHeaderProps) {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { level, xp, xpToNextLevel } = useUserStore();
  const { isRunning, currentMode, isTeamSession } = useTimerStore();
  
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
  
  const getModeColor = () => {
    switch (currentMode) {
      case 'focus':
        return theme.primary;
      case 'shortBreak':
        return theme.secondary;
      case 'longBreak':
        return theme.success;
      default:
        return theme.primary;
    }
  };

  const getModeName = () => {
    switch (currentMode) {
      case 'focus':
        return 'フォーカス中';
      case 'shortBreak':
        return '小休憩中';
      case 'longBreak':
        return '長休憩中';
      default:
        return 'フォーカス中';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.profileLeft}>
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
            <View style={styles.nameRow}>
              <Text style={[styles.displayName, { color: theme.text }]}>
                {user.displayName}
              </Text>
              {isRunning && (
                <View style={[styles.statusBadge, { backgroundColor: getModeColor() + '20' }]}>
                  {isTeamSession ? (
                    <Users size={12} color={getModeColor()} />
                  ) : (
                    <Clock size={12} color={getModeColor()} />
                  )}
                  <Text style={[styles.statusText, { color: getModeColor() }]}>
                    {getModeName()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.levelBadge}>
              <Text style={[styles.levelText, { color: theme.primary }]}>Lv.{level}</Text>
              <Text style={[styles.xpText, { color: theme.textSecondary }]}>
                {xp}/{xpToNextLevel} XP
              </Text>
            </View>
          </View>
        </View>
        
        {showSettings && (
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: theme.card }]}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <Settings size={20} color={theme.text} />
          </TouchableOpacity>
        )}
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
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  displayName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
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
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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