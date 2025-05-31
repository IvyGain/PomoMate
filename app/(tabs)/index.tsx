import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';
import { Timer } from '@/components/Timer';
import { LevelProgress } from '@/components/LevelProgress';
import ProfileHeader from '@/components/ProfileHeader';

export default function HomeScreen() {
  const { theme } = useThemeStore();
  const userStats = useUserStore();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProfileHeader />
        
        <View style={styles.timerContainer}>
          <Timer />
        </View>
        
        <View style={styles.statsContainer}>
          <LevelProgress 
            level={userStats.level}
            xp={userStats.xp}
            xpToNextLevel={userStats.xpToNextLevel}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  statsContainer: {
    padding: 16,
  },
});