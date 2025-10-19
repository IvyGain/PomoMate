import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SocialFeatures } from '@/components/SocialFeatures';
import { useThemeStore } from '@/store/themeStore';
import { Stack } from 'expo-router';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';

export default function SocialScreen() {
  const { theme } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ 
        title: 'ソーシャル',
        headerShown: false,
      }} />
      <ResponsiveContainer maxWidth={600}>
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