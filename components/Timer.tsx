import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ProgressCircle } from './ProgressCircle';
import { useThemeStore } from '@/store/themeStore';

export const Timer: React.FC = () => {
  const { theme } = useThemeStore();
  const [timeRemaining, setTimeRemaining] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const totalTime = 25 * 60; // Total session time

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeRemaining(totalTime);
  };

  // Calculate progress (0 to 1)
  const progress = (totalTime - timeRemaining) / totalTime;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Session Type Tabs */}
      <View style={styles.sessionTabs}>
        <TouchableOpacity style={[styles.tab, styles.activeTab, { backgroundColor: theme.primary }]}>
          <Text style={[styles.tabText, styles.activeTabText]}>フォーカス</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, { borderColor: theme.border }]}>
          <Text style={[styles.tabText, { color: theme.textSecondary }]}>小休憩</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, { borderColor: theme.border }]}>
          <Text style={[styles.tabText, { color: theme.textSecondary }]}>長休憩</Text>
        </TouchableOpacity>
      </View>

      {/* User Stats */}
      <View style={styles.userStats}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Lv1</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>0/100 XP</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>0連続</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>0コイン</Text>
        </View>
      </View>

      {/* Additional Info */}
      <Text style={[styles.sessionInfo, { color: theme.textSecondary }]}>
        長休憩まであと3セッション
      </Text>
      <Text style={[styles.teamInfo, { color: theme.textSecondary }]}>
        👥 チームセッション
      </Text>

      {/* Timer Circle */}
      <View style={styles.timerContainer}>
        <ProgressCircle
          progress={progress}
          size={240}
          strokeWidth={6}
          color={theme.primary}
          backgroundColor={theme.inactive}
        >
          <View style={styles.timerContent}>
            <Text style={[styles.timeText, { color: theme.text }]}>
              {formatTime(timeRemaining)}
            </Text>
            <Text style={[styles.sessionLabel, { color: theme.textSecondary }]}>
              フォーカス
            </Text>
          </View>
        </ProgressCircle>
      </View>
      
      {/* Control Buttons */}
      <View style={styles.controls}>
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.card }]}>
          <Text style={[styles.iconText, { color: theme.textSecondary }]}>↻</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.playButton, { backgroundColor: theme.primary }]} 
          onPress={handleStartPause}
        >
          <Text style={styles.playIcon}>
            {isRunning ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.card }]}>
          <Text style={[styles.iconText, { color: theme.textSecondary }]}>⚙</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  sessionTabs: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTab: {
    borderWidth: 0,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  userStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  sessionInfo: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  teamInfo: {
    fontSize: 14,
    marginBottom: 32,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 56,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sessionLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  playIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});