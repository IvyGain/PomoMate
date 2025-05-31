import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SocialFeatures } from '@/components/SocialFeatures';
import { Stack } from 'expo-router';

export default function SocialScreen() {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: false,
      }} />
      <SocialFeatures />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});