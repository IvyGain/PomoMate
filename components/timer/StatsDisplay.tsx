import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StatsDisplayProps {
  focusTimeToday: number;
  dailyGoal: number;
  sessionsToday: number;
  streak: number;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({
  focusTimeToday,
  dailyGoal,
  sessionsToday,
  streak,
}) => {
  const focusProgress = Math.min((focusTimeToday / dailyGoal) * 100, 100);
  
  return (
    <View className="bg-white/10 rounded-2xl p-4 mb-6">
      <View className="flex-row justify-between mb-4">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Ionicons name="time" size={16} color="#9ca3af" />
            <Text className="text-gray-400 text-xs ml-1">今日の集中時間</Text>
          </View>
          <Text className="text-white text-2xl font-bold">
            {Math.floor(focusTimeToday / 60)}時間{focusTimeToday % 60}分
          </Text>
          <View className="bg-white/10 h-2 rounded-full mt-2 overflow-hidden">
            <View
              className="bg-green-500 h-full rounded-full"
              style={{ width: `${focusProgress}%` }}
            />
          </View>
        </View>
        
        <View className="ml-4">
          <View className="flex-row items-center mb-1">
            <Ionicons name="flame" size={16} color="#9ca3af" />
            <Text className="text-gray-400 text-xs ml-1">連続日数</Text>
          </View>
          <Text className="text-white text-2xl font-bold">{streak}日</Text>
        </View>
      </View>
      
      <View className="flex-row justify-between">
        <View>
          <Text className="text-gray-400 text-xs">今日のセッション</Text>
          <Text className="text-white text-lg font-semibold">{sessionsToday}回</Text>
        </View>
        <View>
          <Text className="text-gray-400 text-xs">目標まで</Text>
          <Text className="text-white text-lg font-semibold">
            {Math.max(0, dailyGoal - focusTimeToday)}分
          </Text>
        </View>
      </View>
    </View>
  );
};