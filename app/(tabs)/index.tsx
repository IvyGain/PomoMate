import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '@/store/themeStore';
import { Timer } from '@/components/Timer';
import { LevelProgress } from '@/components/LevelProgress';
import ProfileHeader from '@/components/ProfileHeader';

export default function HomeScreen() {
  const { theme } = useThemeStore();
  
  // Simple mock data to avoid userStore dependency issues
  const mockUserStats = {
    level: 1,
    xp: 50,
    xpToNextLevel: 100,
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ProfileHeader />
        
        <View style={styles.timerContainer}>
          <Timer />
        </View>
        
        <View style={styles.statsContainer}>
          <LevelProgress 
            level={mockUserStats.level}
            xp={mockUserStats.xp}
            xpToNextLevel={mockUserStats.xpToNextLevel}
          />
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, { color: theme.text }]}>
            🎯 PomoMate へようこそ！
          </Text>
          <Text style={[styles.subText, { color: theme.textSecondary }]}>
            タイマーを使って集中力を高めましょう
          </Text>
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
  infoContainer: {
    padding: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    textAlign: 'center',
  },
});