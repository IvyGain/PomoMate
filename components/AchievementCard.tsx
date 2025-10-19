import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Achievement, getAchievementProgress } from '@/constants/achievements';
import { colors, spacing, fontSizes, borderRadius } from '@/constants/theme';
import { Lock, ChevronRight } from 'lucide-react-native';

interface AchievementCardProps {
  achievement: Achievement;
  userStats: {
    sessions: number;
    streak: number;
    totalMinutes: number;
    level: number;
    unlockedAchievements: string[];
    totalDays: number;
    totalSessions: number;
  };
  onPress?: () => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  userStats,
  onPress,
}) => {
  const { progress, isUnlocked, currentValue } = getAchievementProgress(achievement, userStats);
  
  const Icon = achievement.icon;
  
  // For secret achievements that are not yet unlocked
  const isSecret = achievement.secret && !isUnlocked;
  
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        isUnlocked ? styles.unlockedContainer : styles.lockedContainer
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[
        styles.iconContainer,
        { backgroundColor: isUnlocked ? achievement.iconColor : colors.inactive }
      ]}>
        {isUnlocked ? (
          <Icon size={24} color={colors.text} />
        ) : (
          <Lock size={24} color={colors.textSecondary} />
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[
          styles.title,
          isUnlocked ? styles.unlockedTitle : styles.lockedTitle
        ]}>
          {isSecret ? '???' : achievement.title}
        </Text>
        
        <Text style={styles.description}>
          {isSecret ? '達成条件は秘密です。プレイを続けて発見しましょう。' : achievement.description}
        </Text>
        
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          {!isSecret && (
            <Text style={styles.progressText}>
              {currentValue}/{achievement.requiredValue}
            </Text>
          )}
        </View>
      </View>
      
      {isUnlocked && (
        <View style={styles.rewardBadge}>
          <Text style={styles.rewardText}>+{achievement.reward} XP</Text>
        </View>
      )}
      
      {onPress && (
        <ChevronRight size={20} color={colors.textSecondary} style={styles.chevron} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  unlockedContainer: {
    backgroundColor: colors.cardElevated,
  },
  lockedContainer: {
    backgroundColor: colors.card,
    opacity: 0.7,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  unlockedTitle: {
    color: colors.text,
  },
  lockedTitle: {
    color: colors.textSecondary,
  },
  description: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  progressContainer: {
    height: 6,
    backgroundColor: colors.inactive,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    position: 'absolute',
    right: 0,
    top: -18,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  rewardBadge: {
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderAccent,
  },
  rewardText: {
    color: colors.primary,
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
  },
  chevron: {
    marginLeft: spacing.sm,
  },
});