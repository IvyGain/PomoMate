import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal } from 'react-native';
import { RotateCcw, Clock, Coffee, Bug, Zap, CheckCircle, GamepadIcon, Users } from 'lucide-react-native';
import { ProgressCircle } from './ProgressCircle';
import { useTimerStore } from '@/store/timerStore';
import { useUserStore } from '@/store/userStore';
import { colors, fontSizes, spacing, borderRadius } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { BreakTimeGame } from './BreakTimeGame';
import { TeamSessionModal } from './TeamSessionModal';
import { LevelUpModal } from './LevelUpModal';

export const Timer: React.FC = () => {
  const {
    isRunning,
    timeRemaining,
    currentMode,
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    startTimer,
    pauseTimer,
    resetTimer,
    tickTimer,
    setMode,
    completeSession,
    vibrationEnabled,
    soundEnabled,
    sessionsUntilLongBreak,
    consecutiveSessionsCount,
    isTeamSession,
    currentTeamSessionId,
    teamSessions,
  } = useTimerStore();
  
  const { 
    addSession, 
    level,
    teamSessionsCompleted,
  } = useUserStore();
  
  // For notification when timer completes
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  const [devMode, setDevMode] = useState(false);
  
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  
  const [showBreakGame, setShowBreakGame] = useState(false);
  
  const [showTeamSessionModal, setShowTeamSessionModal] = useState(false);
  
  const prevLevelRef = React.useRef(level);
  
  // Calculate total duration based on current mode
  const getTotalDuration = () => {
    switch (currentMode) {
      case 'focus':
        return focusDuration * 60;
      case 'shortBreak':
        return shortBreakDuration * 60;
      case 'longBreak':
        return longBreakDuration * 60;
      default:
        return focusDuration * 60;
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress (0 to 1)
  const progress = timeRemaining / getTotalDuration();
  
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playCompletionSound = useCallback(async () => {
    if (!soundEnabled || Platform.OS === 'web') return;
    
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/complete.mp3')
      );
      setSound(newSound);
      await newSound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }, [soundEnabled]);
  
  // Timer tick effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tickTimer]);
  
  useEffect(() => {
    const handleLevelUp = async () => {
      if (level > prevLevelRef.current) {
        setNewLevel(level);
        setShowLevelUp(true);
        
        if (vibrationEnabled && Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        if (soundEnabled && Platform.OS !== 'web') {
          await playCompletionSound();
        }
      }
      
      prevLevelRef.current = level;
    };
    
    handleLevelUp();
  }, [level, vibrationEnabled, soundEnabled, playCompletionSound]);
  
  useEffect(() => {
    const handleCompletion = async () => {
      if (timeRemaining === 0 && !showCompletionMessage) {
        setShowCompletionMessage(true);
        
        if (vibrationEnabled && Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        
        if (soundEnabled && Platform.OS !== 'web') {
          await playCompletionSound();
        }
        
        if (currentMode === 'focus') {
          if (isTeamSession && currentTeamSessionId) {
            const session = teamSessions.find(s => s.id === currentTeamSessionId);
            if (session) {
              const activeParticipants = session.participants.filter(p => p.isActive).length;
              addSession(focusDuration, true, activeParticipants);
            } else {
              addSession(focusDuration);
            }
          } else {
            addSession(focusDuration);
          }
        }
        
        setTimeout(() => {
          setShowCompletionMessage(false);
        }, 3000);
      }
    };
    
    handleCompletion();
  }, [timeRemaining, showCompletionMessage, currentMode, vibrationEnabled, soundEnabled, isTeamSession, currentTeamSessionId, teamSessions, addSession, focusDuration, playCompletionSound]);
  
  // Handle dev mode session completion
  const handleDevModeComplete = () => {
    console.log('[DEV MODE] Current consecutiveSessionsCount:', consecutiveSessionsCount);
    console.log('[DEV MODE] Sessions until long break:', sessionsUntilLongBreak);
    
    if (currentMode === 'focus') {
      // Add session to stats
      if (isTeamSession && currentTeamSessionId) {
        const session = teamSessions.find(s => s.id === currentTeamSessionId);
        if (session) {
          const activeParticipants = session.participants.filter(p => p.isActive).length;
          addSession(focusDuration, true, activeParticipants);
        } else {
          addSession(focusDuration);
        }
      } else {
        addSession(focusDuration);
      }
      
      // Vibrate if enabled and not on web
      if (vibrationEnabled && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
    
    // Complete session (handles mode transition and consecutive count)
    completeSession();
  };
  
  // Get color based on current mode
  const getModeColor = () => {
    switch (currentMode) {
      case 'focus':
        return colors.focus;
      case 'shortBreak':
        return colors.shortBreak;
      case 'longBreak':
        return colors.longBreak;
      default:
        return colors.focus;
    }
  };
  
  // Get mode name in Japanese
  const getModeName = () => {
    switch (currentMode) {
      case 'focus':
        return 'フォーカス';
      case 'shortBreak':
        return '小休憩';
      case 'longBreak':
        return '長休憩';
      default:
        return 'フォーカス';
    }
  };
  
  // Get next session info
  const getNextSessionInfo = () => {
    const untilLongBreak = sessionsUntilLongBreak - consecutiveSessionsCount;
    
    console.log('[INFO] Consecutive sessions:', consecutiveSessionsCount);
    console.log('[INFO] Sessions until long break setting:', sessionsUntilLongBreak);
    console.log('[INFO] Until long break:', untilLongBreak);
    
    if (untilLongBreak <= 0) {
      return '次は長休憩です';
    } else {
      return `長休憩まであと ${untilLongBreak} セッション`;
    }
  };
  
  // Handle team session button click
  const handleTeamSessionClick = () => {
    setShowTeamSessionModal(true);
  };
  
  return (
    <View style={styles.container}>
      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            currentMode === 'focus' && { backgroundColor: colors.primary },
          ]}
          onPress={() => setMode('focus')}
        >
          <Clock size={16} color={currentMode === 'focus' ? colors.text : colors.textSecondary} />
          <Text
            style={[
              styles.modeButtonText,
              currentMode === 'focus' && { color: colors.text },
            ]}
          >
            フォーカス
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.modeButton,
            currentMode === 'shortBreak' && { backgroundColor: colors.secondary },
          ]}
          onPress={() => setMode('shortBreak')}
        >
          <Coffee size={16} color={currentMode === 'shortBreak' ? colors.text : colors.textSecondary} />
          <Text
            style={[
              styles.modeButtonText,
              currentMode === 'shortBreak' && { color: colors.text },
            ]}
          >
            小休憩
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.modeButton,
            currentMode === 'longBreak' && { backgroundColor: colors.success },
          ]}
          onPress={() => setMode('longBreak')}
        >
          <Coffee size={16} color={currentMode === 'longBreak' ? colors.text : colors.textSecondary} />
          <Text
            style={[
              styles.modeButtonText,
              currentMode === 'longBreak' && { color: colors.text },
            ]}
          >
            長休憩
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Session Info */}
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionInfoText}>
          {currentMode === 'focus' ? getNextSessionInfo() : '休憩中...'}
        </Text>
        
        {/* Team Session Button */}
        <TouchableOpacity
          style={[styles.teamButton, { backgroundColor: isTeamSession ? colors.primary : colors.card }]}
          onPress={handleTeamSessionClick}
        >
          <Users size={16} color={isTeamSession ? colors.text : colors.textSecondary} />
          <Text style={[
            styles.teamButtonText, 
            { color: isTeamSession ? colors.text : colors.textSecondary }
          ]}>
            {isTeamSession ? 'チームセッション中' : 'チームセッション'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Timer Circle */}
      <TouchableOpacity 
        style={styles.timerContainer}
        activeOpacity={0.8}
        onPress={isRunning ? pauseTimer : startTimer}
      >
        <View style={[
          styles.timerButtonOuter, 
          isRunning && {
            backgroundColor: getModeColor() + '20',
            shadowColor: getModeColor(),
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 20,
            elevation: 8,
          }
        ]}>
          <ProgressCircle
            progress={progress}
            size={280}
            strokeWidth={15}
            color={getModeColor()}
          >
            <View style={styles.timerContent}>
              <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
              <Text style={styles.modeText}>
                {getModeName()}
                {isTeamSession && ' (チーム)'}
              </Text>
              
              {isTeamSession && currentTeamSessionId && (
                <View style={styles.teamIndicator}>
                  <Users size={16} color={getModeColor()} />
                  <Text style={[styles.teamIndicatorText, { color: getModeColor() }]}>
                    {(() => {
                      const session = teamSessions.find(s => s.id === currentTeamSessionId);
                      return session ? session.participants.filter(p => p.isActive).length : 0;
                    })()}人参加中
                  </Text>
                </View>
              )}
            </View>
          </ProgressCircle>
        </View>
      </TouchableOpacity>
      

      
      {/* Timer Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={resetTimer}
        >
          <RotateCcw size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        
        {/* Break Time Game Button */}
        {(currentMode === 'shortBreak' || currentMode === 'longBreak') && (
          <TouchableOpacity
            style={styles.gameButton}
            onPress={() => setShowBreakGame(true)}
          >
            <GamepadIcon size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        
        {/* Dev Mode Toggle */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setDevMode(!devMode)}
        >
          <Bug size={24} color={devMode ? colors.primary : colors.textSecondary} />
        </TouchableOpacity>
      </View>
      
      {/* Dev Mode Controls */}
      {devMode && (
        <View style={styles.devControls}>
          <TouchableOpacity
            style={[styles.devButton, { backgroundColor: getModeColor() }]}
            onPress={handleDevModeComplete}
          >
            <CheckCircle size={20} color={colors.text} />
            <Text style={styles.devButtonText}>
              {currentMode === 'focus' ? 'セッション完了' : '休憩完了'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Team Session Stats */}
      {teamSessionsCompleted > 0 && (
        <View style={styles.teamStatsContainer}>
          <Text style={styles.teamStatsTitle}>チームセッション統計</Text>
          <View style={styles.teamStats}>
            <View style={styles.teamStat}>
              <Users size={16} color={colors.primary} />
              <Text style={styles.teamStatValue}>{teamSessionsCompleted}</Text>
              <Text style={styles.teamStatLabel}>完了</Text>
            </View>
            <View style={styles.teamStat}>
              <Zap size={16} color={colors.primary} />
              <Text style={styles.teamStatValue}>+20%</Text>
              <Text style={styles.teamStatLabel}>XP</Text>
            </View>
          </View>
        </View>
      )}
      
      {/* Completion Message */}
      {showCompletionMessage && (
        <View style={styles.completionOverlay}>
          <View style={styles.completionMessage}>
            <Text style={styles.completionTitle}>
              {currentMode === 'focus' ? 'フォーカス完了！' : '休憩完了！'}
            </Text>
            <Text style={styles.completionSubtitle}>
              {currentMode === 'focus' 
                ? isTeamSession 
                  ? `+${Math.floor((focusDuration / 5) * 5 + 20) * 1.2} XP獲得 (チームボーナス +20%)` 
                  : `+${Math.floor(focusDuration / 5) * 5 + 20} XP獲得`
                : '次のセッションを始めましょう'}
            </Text>
          </View>
        </View>
      )}
      
      <LevelUpModal
        visible={showLevelUp}
        level={newLevel}
        onClose={() => setShowLevelUp(false)}
      />
      
      {/* Break Time Game Modal */}
      <Modal
        visible={showBreakGame}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowBreakGame(false)}
      >
        <BreakTimeGame onClose={() => setShowBreakGame(false)} />
      </Modal>
      
      {/* Team Session Modal */}
      <TeamSessionModal
        visible={showTeamSessionModal}
        onClose={() => setShowTeamSessionModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    backgroundColor: colors.cardElevated,
    borderRadius: borderRadius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginHorizontal: 2,
  },
  modeButtonText: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
    marginLeft: spacing.xs,
  },
  sessionInfo: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  sessionInfoText: {
    color: colors.textSecondary,
    fontSize: fontSizes.md,
    marginBottom: spacing.sm,
  },
  teamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  teamButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  gameButton: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  timerContainer: {
    marginBottom: spacing.xl,
  },
  timerButtonOuter: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  timerButtonOuterActive: {},
  timerContent: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: fontSizes.timer,
    fontWeight: 'bold',
    color: colors.text,
  },
  modeText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  teamIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  teamIndicatorText: {
    fontSize: fontSizes.sm,
    marginLeft: spacing.xs,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.circle,
    backgroundColor: colors.cardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  devControls: {
    marginTop: spacing.xl,
    width: '100%',
  },
  devButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  devButtonText: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
  },
  teamStatsContainer: {
    marginTop: spacing.lg,
    backgroundColor: colors.cardElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  teamStatsTitle: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  teamStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  teamStat: {
    alignItems: 'center',
  },
  teamStatValue: {
    color: colors.text,
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    marginTop: spacing.xs,
  },
  teamStatLabel: {
    color: colors.textSecondary,
    fontSize: fontSizes.sm,
  },
  completionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completionMessage: {
    backgroundColor: colors.cardElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderAccent,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  completionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  completionSubtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
});