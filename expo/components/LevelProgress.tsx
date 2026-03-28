import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSizes, borderRadius } from '@/constants/theme';

interface LevelProgressProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({
  level,
  xp,
  xpToNextLevel,
}) => {
  const progress = xp / xpToNextLevel;
  
  return (
    <View style={styles.container}>
      <View style={styles.levelInfo}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{level}</Text>
        </View>
        <View>
          <Text style={styles.levelTitle}>レベル {level}</Text>
          <Text style={styles.xpText}>{xp}/{xpToNextLevel} XP</Text>
        </View>
      </View>
      
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  levelText: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  levelTitle: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  xpText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
  },
  progressContainer: {
    height: 8,
    backgroundColor: colors.inactive,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});