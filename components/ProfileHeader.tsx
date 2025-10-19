import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';
import { useTimerStore } from '@/store/timerStore';
import { Settings, Clock, Users, Flame, Target } from 'lucide-react-native';
import { router } from 'expo-router';

interface ProfileHeaderProps {
  showSettings?: boolean;
}

export default function ProfileHeader({ showSettings = true }: ProfileHeaderProps) {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { level, xp, xpToNextLevel, streak, sessions } = useUserStore();
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
        return '#FF6B6B';
      case 'shortBreak':
        return '#4ECDC4';
      case 'longBreak':
        return '#10B981';
      default:
        return '#FF6B6B';
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
            <View style={styles.statsRow}>
              <View style={styles.levelBadge}>
                <Text style={[styles.levelText, { color: theme.primary }]}>Lv.{level}</Text>
                <Text style={[styles.xpText, { color: theme.textSecondary }]}>
                  {xp}/{xpToNextLevel} XP
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Flame size={14} color="#FF6B6B" />
                <Text style={[styles.statValue, { color: theme.text }]}>{streak}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Target size={14} color="#4ECDC4" />
                <Text style={[styles.statValue, { color: theme.text }]}>{sessions}</Text>
              </View>
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
    paddingBottom: 12,
    backgroundColor: 'transparent',
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
    gap: 6,
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBarContainer: {
    paddingHorizontal: 4,
  },
  progressBarBackground: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});