import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TeamSession } from '@/store/timerStore';

interface TeamSessionIndicatorProps {
  teamSession: TeamSession | null;
  onLeave?: () => void;
}

export const TeamSessionIndicator: React.FC<TeamSessionIndicatorProps> = ({
  teamSession,
  onLeave,
}) => {
  if (!teamSession) return null;
  
  return (
    <View className="bg-purple-600/20 rounded-lg p-3 mb-4 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <Ionicons name="people" size={20} color="#a78bfa" />
        <Text className="text-purple-300 ml-2">
          チームセッション: {teamSession.name}
        </Text>
        <View className="bg-purple-600 rounded-full px-2 py-1 ml-2">
          <Text className="text-white text-xs">
            {teamSession.participants.length}人
          </Text>
        </View>
      </View>
      
      {onLeave && (
        <TouchableOpacity
          onPress={onLeave}
          className="bg-purple-600/30 rounded-full p-2"
        >
          <Ionicons name="exit" size={16} color="#a78bfa" />
        </TouchableOpacity>
      )}
    </View>
  );
};