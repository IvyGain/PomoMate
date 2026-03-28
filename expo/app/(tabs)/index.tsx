import React from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '@/store/themeStore';
import { Timer } from '@/components/Timer';
import ProfileHeader from '@/components/ProfileHeader';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

export default function HomeScreen() {
  const { theme } = useThemeStore();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ResponsiveContainer maxWidth={isDesktop ? 900 : 800}>
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            isDesktop && styles.desktopScrollContent
          ]}
          showsVerticalScrollIndicator={false}
        >
          <ProfileHeader />
          
          <View style={[
            styles.timerContainer,
            isDesktop && styles.desktopTimerContainer
          ]}>
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
  desktopScrollContent: {
    paddingVertical: 24,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  desktopTimerContainer: {
    paddingVertical: 40,
  },
});