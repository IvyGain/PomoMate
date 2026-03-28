import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { SocialFeatures } from '@/components/SocialFeatures';
import { useThemeStore } from '@/store/themeStore';
import { Stack } from 'expo-router';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

export default function SocialScreen() {
  const { theme } = useThemeStore();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ 
        title: 'ソーシャル',
        headerShown: false,
      }} />
      <ResponsiveContainer maxWidth={isDesktop ? 1000 : 800}>
        <SocialFeatures />
      </ResponsiveContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});