import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '@/store/themeStore';
import { Timer } from '@/components/Timer';
import ProfileHeader from '@/components/ProfileHeader';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

export default function HomeScreen() {
  const { theme } = useThemeStore();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ResponsiveContainer>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ProfileHeader />
          
          <View style={styles.timerContainer}>
            <Timer />
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
  scrollContent: {
    flexGrow: 1,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
});