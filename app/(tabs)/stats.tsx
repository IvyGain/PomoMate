import React from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { spacing, fontSizes, borderRadius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useThemeStore } from '@/store/themeStore';
import { LevelProgress } from '@/components/LevelProgress';
import { StatsCard } from '@/components/StatsCard';
import { Clock, Flame, Zap, Award, Calendar, BarChart2, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

export default function StatsScreen() {
  const {
    level,
    xp,
    xpToNextLevel,
    sessions,
    streak,
    totalMinutes,
    unlockedAchievements,
    activeDays,
    totalDays,
  } = useUserStore();
  
  const { theme } = useThemeStore();
  const { width } = useWindowDimensions();
  
  // Format total time
  const formatTotalTime = () => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}時間 ${mins}分`;
    }
    return `${mins}分`;
  };
  
  // Calculate average session length
  const averageSessionLength = sessions > 0 ? Math.round(totalMinutes / sessions) : 0;
  
  // Calculate average daily time
  const averageDailyTime = totalDays > 0 ? Math.round(totalMinutes / totalDays) : 0;
  
  // Calculate completion rate (sessions completed vs days active)
  const completionRate = totalDays > 0 ? Math.round((sessions / totalDays) * 100) : 0;
  
  // Generate last 7 days activity data
  const generateWeeklyData = () => {
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      // Check if this date is in activeDays
      const isActive = activeDays.includes(dateString);
      
      weekData.push({
        day: ['日', '月', '火', '水', '木', '金', '土'][date.getDay()],
        active: isActive,
      });
    }
    
    return weekData;
  };
  
  const weeklyData = generateWeeklyData();
  
  const contentWidth = Math.min(width, 600);
  const dayColumnWidth = (contentWidth - spacing.lg * 2 - spacing.md * 2) / 7;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ 
        title: '進捗状況',
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTitleStyle: {
          color: theme.text,
          fontWeight: 'bold',
        },
      }} />
      
      <ResponsiveContainer>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.levelSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>レベル進捗</Text>
          <LevelProgress
            level={level}
            xp={xp}
            xpToNextLevel={xpToNextLevel}
          />
        </View>
        
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={[theme.primary, theme.background]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryHeader}>
              <Text style={[styles.summaryTitle, { color: theme.text }]}>総合サマリー</Text>
              <TrendingUp size={20} color={theme.text} />
            </View>
            
            <View style={styles.summaryStats}>
              <View style={styles.summaryStatItem}>
                <Text style={[styles.summaryStatValue, { color: theme.text }]}>{formatTotalTime()}</Text>
                <Text style={[styles.summaryStatLabel, { color: theme.textSecondary }]}>合計時間</Text>
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryStatItem}>
                <Text style={[styles.summaryStatValue, { color: theme.text }]}>{sessions}</Text>
                <Text style={[styles.summaryStatLabel, { color: theme.textSecondary }]}>セッション</Text>
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryStatItem}>
                <Text style={[styles.summaryStatValue, { color: theme.text }]}>{streak}</Text>
                <Text style={[styles.summaryStatLabel, { color: theme.textSecondary }]}>連続日数</Text>
              </View>
            </View>
          </LinearGradient>
        </View>
        
        <Text style={[styles.sectionTitle, { color: theme.text }]}>詳細統計</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <View style={styles.statsColumn}>
              <StatsCard
                title="フォーカスセッション"
                value={sessions}
                icon={<Clock size={20} color={theme.text} />}
                color="#FF6B6B"
              />
            </View>
            <View style={styles.statsColumn}>
              <StatsCard
                title="現在の連続日数"
                value={streak}
                icon={<Flame size={20} color={theme.text} />}
                color="#F59E0B"
              />
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statsColumn}>
              <StatsCard
                title="合計フォーカス時間"
                value={formatTotalTime()}
                icon={<Zap size={20} color={theme.text} />}
                color="#10B981"
              />
            </View>
            <View style={styles.statsColumn}>
              <StatsCard
                title="実績解除"
                value={`${unlockedAchievements.length}/12`}
                icon={<Award size={20} color={theme.text} />}
                color="#3B82F6"
              />
            </View>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.statsColumn}>
              <StatsCard
                title="平均セッション時間"
                value={`${averageSessionLength}分`}
                icon={<BarChart2 size={20} color={theme.text} />}
                color="#A855F7"
              />
            </View>
            <View style={styles.statsColumn}>
              <StatsCard
                title="アクティブ日数"
                value={totalDays}
                icon={<Calendar size={20} color={theme.text} />}
                color="#4ECDC4"
              />
            </View>
          </View>
        </View>
        
        <View style={styles.weeklyActivityContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>週間アクティビティ</Text>
          <View style={[styles.weeklyActivityChart, { backgroundColor: theme.card }]}>
            {weeklyData.map((day, index) => (
              <View key={index} style={[styles.dayColumn, { width: dayColumnWidth }]}>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      day.active ? [styles.activeBar, { backgroundColor: theme.primary }] : 
                                  [styles.inactiveBar, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]
                    ]} 
                  />
                </View>
                <Text style={[styles.dayLabel, { color: theme.textSecondary }]}>{day.day}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View style={styles.averagesContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>平均値</Text>
          
          <View style={[styles.averageCard, { backgroundColor: theme.card }]}>
            <View style={styles.averageHeader}>
              <Text style={[styles.averageTitle, { color: theme.textSecondary }]}>1日の平均フォーカス時間</Text>
            </View>
            <Text style={[styles.averageValue, { color: theme.primary }]}>{averageDailyTime}</Text>
            <Text style={[styles.averageUnit, { color: theme.textSecondary }]}>分 / 日</Text>
          </View>
          
          <View style={[styles.averageCard, { backgroundColor: theme.card }]}>
            <View style={styles.averageHeader}>
              <Text style={[styles.averageTitle, { color: theme.textSecondary }]}>セッション完了率</Text>
            </View>
            <Text style={[styles.averageValue, { color: theme.primary }]}>{completionRate}%</Text>
            <Text style={[styles.averageUnit, { color: theme.textSecondary }]}>アクティブ日あたり</Text>
          </View>
        </View>
        </ScrollView>
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  levelSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  summaryCard: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  summaryGradient: {
    padding: spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryStatValue: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  summaryStatLabel: {
    fontSize: fontSizes.sm,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsGrid: {
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.xs,
  },
  statsColumn: {
    flex: 1,
    paddingHorizontal: spacing.xs,
  },
  weeklyActivityContainer: {
    marginBottom: spacing.xl,
  },
  weeklyActivityChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  dayColumn: {
    alignItems: 'center',
  },
  barContainer: {
    height: 80,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 12,
    borderRadius: borderRadius.sm,
  },
  activeBar: {
    height: 60,
  },
  inactiveBar: {
    height: 20,
  },
  dayLabel: {
    marginTop: spacing.xs,
    fontSize: fontSizes.sm,
  },
  averagesContainer: {
    marginBottom: spacing.xl,
  },
  averageCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  averageHeader: {
    marginBottom: spacing.sm,
  },
  averageTitle: {
    fontSize: fontSizes.md,
  },
  averageValue: {
    fontSize: fontSizes.xxxl,
    fontWeight: 'bold',
  },
  averageUnit: {
    fontSize: fontSizes.sm,
    marginTop: spacing.xs,
  },
});