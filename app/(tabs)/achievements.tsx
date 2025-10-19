import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { spacing, fontSizes } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useThemeStore } from '@/store/themeStore';
import { achievements } from '@/constants/achievements';
import { AchievementCard } from '@/components/AchievementCard';
import { Award } from 'lucide-react-native';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

type FilterType = 'all' | 'unlocked' | 'locked';

export default function AchievementsScreen() {
  const userStats = useUserStore();
  const { theme } = useThemeStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [filteredAchievements, setFilteredAchievements] = useState(achievements);
  
  // Apply filter
  useEffect(() => {
    let filtered = [...achievements];
    
    if (filter === 'unlocked') {
      filtered = filtered.filter(achievement => 
        userStats.unlockedAchievements.includes(achievement.id)
      );
    } else if (filter === 'locked') {
      filtered = filtered.filter(achievement => 
        !userStats.unlockedAchievements.includes(achievement.id)
      );
    }
    
    setFilteredAchievements(filtered);
  }, [filter, userStats.unlockedAchievements]);
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ 
        title: '実績',
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTitleStyle: {
          color: theme.text,
          fontWeight: 'bold',
        },
      }} />
      
      <ResponsiveContainer>
        <View style={[styles.header, { borderBottomColor: 'rgba(255, 255, 255, 0.1)' }]}>
        <View style={styles.statsContainer}>
          <Award size={24} color={theme.primary} />
          <Text style={[styles.statsText, { color: theme.text }]}>
            {userStats.unlockedAchievements.length}/{achievements.length} 解除済み
          </Text>
        </View>
        
        <View style={[styles.filterContainer, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[
              styles.filterButton, 
              filter === 'all' && [styles.activeFilter, { backgroundColor: theme.primary }]
            ]}
            onPress={() => setFilter('all')}
          >
            <Text style={[
              styles.filterText, 
              { color: filter === 'all' ? theme.text : theme.textSecondary }
            ]}>
              全て
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton, 
              filter === 'unlocked' && [styles.activeFilter, { backgroundColor: theme.primary }]
            ]}
            onPress={() => setFilter('unlocked')}
          >
            <Text style={[
              styles.filterText, 
              { color: filter === 'unlocked' ? theme.text : theme.textSecondary }
            ]}>
              解除済み
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton, 
              filter === 'locked' && [styles.activeFilter, { backgroundColor: theme.primary }]
            ]}
            onPress={() => setFilter('locked')}
          >
            <Text style={[
              styles.filterText, 
              { color: filter === 'locked' ? theme.text : theme.textSecondary }
            ]}>
              未解除
            </Text>
          </TouchableOpacity>
        </View>
        </View>
        
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {filteredAchievements.length > 0 ? (
          filteredAchievements.map(achievement => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              userStats={userStats}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>実績が見つかりません</Text>
          </View>
        )}
        </ScrollView>
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statsText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  filterContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeFilter: {
    backgroundColor: '#9333EA',
  },
  filterText: {
    fontSize: fontSizes.sm,
  },
  activeFilterText: {
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fontSizes.md,
  },
});