import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Switch, Modal, Animated } from 'react-native';
import { Play, Pause, RotateCcw, Clock, Coffee, Bug, Zap, Award, Flame, CheckCircle, GamepadIcon, Users } from 'lucide-react-native';
import { ProgressCircle } from './ProgressCircle';
import { useTimerStore } from '@/store/timerStore';
import { useUserStore } from '@/store/userStore';
import { colors, fontSizes, spacing, borderRadius } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { BreakTimeGame } from './BreakTimeGame';
import { TeamSessionModal } from './TeamSessionModal';

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
    vibrationEnabled,
    soundEnabled,
    autoStartBreaks,
    autoStartFocus,
    completedSessions,
    sessionsUntilLongBreak,
    consecutiveSessionsCount,
    isTeamSession,
    currentTeamSessionId,
    teamSessions,
  } = useTimerStore();
  
  const { 
    addSession, 
    level, 
    xp, 
    xpToNextLevel, 
    sessions, 
    streak,
    totalMinutes,
    teamSessionsCompleted,
  } = useUserStore();
  
  // For notification when timer completes
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  
  // Developer mode state
  const [devMode, setDevMode] = useState(false);
  
  // Level up celebration
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(0);
  
  // Break time game
  const [showBreakGame, setShowBreakGame] = useState(false);
  
  // Team session modal
  const [showTeamSessionModal, setShowTeamSessionModal] = useState(false);
  
  // Animation values
  const scaleAnim = useState(new Animated.Value(1))[0];
  const opacityAnim = useState(new Animated.Value(0))[0];
  
  // Store previous level in ref to detect changes
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
  
  // Load sound
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  // Play completion sound
  const playCompletionSound = async () => {
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
  };
  
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
  
  // Track level changes to show celebration
  useEffect(() => {
    // Check if level increased
    if (level > prevLevelRef.current) {
      setNewLevel(level);
      setShowLevelUp(true);
      
      // Vibrate if enabled and not on web
      if (vibrationEnabled && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Play sound if enabled
      if (soundEnabled && Platform.OS !== 'web') {
        playCompletionSound();
      }
      
      // Animate level up
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            setShowLevelUp(false);
          });
        }, 3000);
      });
      
      // Hide after 5 seconds
      setTimeout(() => {
        setShowLevelUp(false);
      }, 5000);
    }
    
    // Update ref
    prevLevelRef.current = level;
  }, [level, vibrationEnabled, soundEnabled, scaleAnim, opacityAnim]);
  
  // Handle timer completion
  useEffect(() => {
    if (timeRemaining === 0 && !showCompletionMessage) {
      // Show completion message
      setShowCompletionMessage(true);
      
      // Vibrate if enabled and not on web
      if (vibrationEnabled && Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Play sound if enabled
      if (soundEnabled && Platform.OS !== 'web') {
        playCompletionSound();
      }
      
      // If focus session completed, add to stats
      if (currentMode === 'focus') {
        // If team session, get team size
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
      
      // Hide message after 3 seconds
      setTimeout(() => {
        setShowCompletionMessage(false);
      }, 3000);
    }
  }, [timeRemaining, showCompletionMessage, currentMode, vibrationEnabled, soundEnabled]);
  
  // Handle dev mode session completion
  const handleDevModeComplete = () => {
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
      
      // Transition to break based on completed sessions
      const newCompletedSessions = completedSessions + 1;
      const shouldTakeLongBreak = newCompletedSessions % sessionsUntilLongBreak === 0;
      const nextMode = shouldTakeLongBreak ? 'longBreak' : 'shortBreak';
      
      // Set next mode and start if auto start is enabled
      setMode(nextMode);
      if (autoStartBreaks) {
        startTimer();
      }
    } else {
      // Coming from a break, go back to focus
      setMode('focus');
      if (autoStartFocus) {
        startTimer();
      }
    }
  };
  
  // Get color based on current mode
  const getModeColor = () => {
    switch (currentMode) {
      case 'focus':
        return colors.primary;
      case 'shortBreak':
        return colors.secondary;
      case 'longBreak':
        return colors.success;
      default:
        return colors.primary;
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
    
    if (untilLongBreak === 0) {
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
            backgroundColor: getModeColor() + '10',
          }
        ]}>
          {isRunning && (
            <View style={[
              styles.glowContainer,
              {
                shadowColor: getModeColor(),
              }
            ]} />
          )}
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
      
      {/* User Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Award size={16} color={colors.textSecondary} />
          <Text style={styles.statText}>Lv.{level}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Zap size={16} color={colors.textSecondary} />
          <Text style={styles.statText}>{xp}/{xpToNextLevel} XP</Text>
        </View>
        
        <View style={styles.statItem}>
          <Flame size={16} color={colors.textSecondary} />
          <Text style={styles.statText}>{streak}日連続</Text>
        </View>
        
        <View style={styles.statItem}>
          <Clock size={16} color={colors.textSecondary} />
          <Text style={styles.statText}>{sessions}回</Text>
        </View>
      </View>
      
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
      
      {/* Level Up Celebration */}
      {showLevelUp && (
        <View style={styles.levelUpOverlay}>
          <Animated.View 
            style={[
              styles.levelUpContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: opacityAnim
              }
            ]}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FFD166', '#06D6A0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.levelUpGradient}
            >
              <Text style={styles.levelUpTitle}>レベルアップ！</Text>
              <Text style={styles.levelUpLevel}>Lv.{newLevel}</Text>
              <Text style={styles.levelUpMessage}>おめでとうございます！</Text>
            </LinearGradient>
          </Animated.View>
        </View>
      )}
      
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
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: 4,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
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
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.md,
  },
  timerContainer: {
    marginBottom: spacing.xl,
  },
  timerButtonOuter: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowContainer: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 0,
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
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.md,
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
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    width: '100%',
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
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
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
  levelUpOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelUpContainer: {
    width: 300,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  levelUpGradient: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelUpTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  levelUpLevel: {
    fontSize: fontSizes.xxxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  levelUpMessage: {
    fontSize: fontSizes.lg,
    color: colors.text,
  },
});