import React from 'react';
import { Tabs } from 'expo-router';
import { Clock, BarChart2, Award, Users } from 'lucide-react-native';
import { useThemeStore } from '@/store/themeStore';

export default function TabLayout() {
  const { theme } = useThemeStore();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
        },
        headerStyle: {
          backgroundColor: theme.background,
        },
        headerTitleStyle: {
          color: theme.text,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'PomoMate',
          tabBarLabel: 'ホーム',
          tabBarIcon: ({ color }) => <Clock size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: '進捗状況',
          tabBarLabel: '進捗',
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="achievements"
        options={{
          title: '実績',
          tabBarLabel: '実績',
          tabBarIcon: ({ color }) => <Award size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'ソーシャル',
          tabBarLabel: 'ソーシャル',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}