import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TimerMode } from '../../types/timer';
import { Ionicons } from '@expo/vector-icons';

interface ModeSelectorProps {
  mode: TimerMode;
  onModeChange: (mode: TimerMode) => void;
  isRunning: boolean;
  disabled?: boolean;
}

const modeConfig = {
  [TimerMode.WORK]: {
    label: '集中',
    icon: 'flame' as const,
    color: '#ef4444',
  },
  [TimerMode.BREAK]: {
    label: '小休憩',
    icon: 'cafe' as const,
    color: '#3b82f6',
  },
  [TimerMode.LONG_BREAK]: {
    label: '長休憩',
    icon: 'bed' as const,
    color: '#8b5cf6',
  },
};

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  onModeChange,
  isRunning,
  disabled = false,
}) => {
  return (
    <View className="flex-row justify-center mb-6">
      {Object.entries(modeConfig).map(([modeKey, config]) => {
        const isActive = mode === modeKey;
        const isDisabled = disabled || (isRunning && !isActive);
        
        return (
          <TouchableOpacity
            key={modeKey}
            onPress={() => onModeChange(modeKey as TimerMode)}
            disabled={isDisabled}
            className={`mx-2 px-4 py-2 rounded-full flex-row items-center ${
              isActive ? 'bg-white/20' : 'bg-white/10'
            } ${isDisabled ? 'opacity-50' : ''}`}
          >
            <Ionicons
              name={config.icon}
              size={20}
              color={isActive ? config.color : '#9ca3af'}
            />
            <Text
              className={`ml-2 font-semibold ${
                isActive ? 'text-white' : 'text-gray-400'
              }`}
            >
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};