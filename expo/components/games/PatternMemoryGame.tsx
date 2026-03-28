import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { spacing, fontSizes, borderRadius } from '@/constants/theme';
import { Brain, X, Trophy } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - spacing.lg * 4) / 2;

interface PatternMemoryGameProps {
  onComplete: (score: number) => void;
  onClose?: () => void;
}

const TILE_COLORS = [
  '#FF5252',
  '#4CAF50',
  '#2196F3',
  '#FFEB3B',
];

export const PatternMemoryGame: React.FC<PatternMemoryGameProps> = ({ onComplete, onClose }) => {
  const { theme } = useThemeStore();
  const [gameState, setGameState] = useState<'ready' | 'watch' | 'repeat' | 'result'>('ready');
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [pattern, setPattern] = useState<number[]>([]);
  const [playerPattern, setPlayerPattern] = useState<number[]>([]);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [showError, setShowError] = useState(false);
  
  const tileAnimations = [
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
  ];
  
  const patternTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  
  const startGame = () => {
    setStreak(0);
    setBestStreak(0);
    setPattern([]);
    setPlayerPattern([]);
    setGameState('watch');
    generatePattern([]);
  };
  
  const generatePattern = (currentPattern: number[]) => {
    const nextTile = Math.floor(Math.random() * 4);
    const newPattern = [...currentPattern, nextTile];
    setPattern(newPattern);
    
    setTimeout(() => {
      showPattern(newPattern);
    }, 1000);
  };
  
  const showPattern = (patternToShow: number[]) => {
    let index = 0;
    
    const showNextTile = () => {
      if (index < patternToShow.length) {
        const tileIndex = patternToShow[index];
        setActiveTile(tileIndex);
        
        Animated.sequence([
          Animated.timing(tileAnimations[tileIndex], {
            toValue: 1.2,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(tileAnimations[tileIndex], {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
        
        patternTimerRef.current = setTimeout(() => {
          setActiveTile(null);
          patternTimerRef.current = setTimeout(() => {
            index++;
            showNextTile();
          }, 200);
        }, 600);
      } else {
        setActiveTile(null);
        setPlayerPattern([]);
        setGameState('repeat');
      }
    };
    
    showNextTile();
  };
  
  const handleTilePress = (tileIndex: number) => {
    if (gameState !== 'repeat') return;
    
    Animated.sequence([
      Animated.timing(tileAnimations[tileIndex], {
        toValue: 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(tileAnimations[tileIndex], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    const newPlayerPattern = [...playerPattern, tileIndex];
    setPlayerPattern(newPlayerPattern);
    
    const isCorrectSoFar = newPlayerPattern.every(
      (tile, index) => tile === pattern[index]
    );
    
    if (!isCorrectSoFar) {
      setShowError(true);
      setBestStreak(Math.max(bestStreak, streak));
      setTimeout(() => {
        setShowError(false);
        setGameState('result');
      }, 1500);
      return;
    }
    
    if (newPlayerPattern.length === pattern.length) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak(Math.max(bestStreak, newStreak));
      
      setTimeout(() => {
        setPattern([]);
        setPlayerPattern([]);
        setGameState('watch');
        generatePattern(pattern);
      }, 1000);
    }
  };
  
  useEffect(() => {
    return () => {
      if (patternTimerRef.current) {
        clearTimeout(patternTimerRef.current);
      }
    };
  }, []);
  
  const renderTile = (index: number) => {
    const isActive = activeTile === index;
    const baseColor = TILE_COLORS[index];
    
    return (
      <Animated.View
        style={[
          styles.tile,
          { 
            backgroundColor: isActive ? baseColor : `${baseColor}80`,
            transform: [{ scale: tileAnimations[index] }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.tileButton}
          onPress={() => handleTilePress(index)}
          disabled={gameState !== 'repeat'}
          activeOpacity={0.7}
        />
      </Animated.View>
    );
  };
  
  const handleComplete = () => {
    const finalScore = Math.min(100, Math.max(bestStreak, streak) * 10);
    onComplete(finalScore);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>パターンメモリー</Text>
        {gameState !== 'ready' && gameState !== 'result' && (
          <Text style={[styles.subtitle, { color: theme.primary }]}>
            {streak} 連続
          </Text>
        )}
      </View>
      
      {gameState === 'ready' && (
        <View style={styles.contentContainer}>
          <Brain size={60} color={theme.primary} />
          <Text style={[styles.instructions, { color: theme.text }]}>
            光るパターンを記憶して再現しよう！
          </Text>
          <Text style={[styles.subInstructions, { color: theme.textSecondary }]}>
            間違えるまで何連続できるか挑戦しよう
          </Text>
          
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: theme.primary }]}
            onPress={startGame}
          >
            <Text style={[styles.startButtonText, { color: theme.text }]}>
              スタート
            </Text>
          </TouchableOpacity>

          {onClose && (
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
              onPress={handleClose}
            >
              <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>
                閉じる
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {(gameState === 'watch' || gameState === 'repeat') && (
        <View style={styles.gameContainer}>
          <Text style={[styles.gameInstruction, { color: theme.text }]}>
            {gameState === 'watch' 
              ? 'パターンを記憶してください...' 
              : 'パターンを再現してください！'}
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(playerPattern.length / pattern.length) * 100}%`,
                    backgroundColor: theme.primary 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
              {playerPattern.length}/{pattern.length}
            </Text>
          </View>
          
          <View style={styles.tilesContainer}>
            <View style={styles.tilesRow}>
              {renderTile(0)}
              {renderTile(1)}
            </View>
            <View style={styles.tilesRow}>
              {renderTile(2)}
              {renderTile(3)}
            </View>
          </View>
          
          {showError && (
            <View style={styles.errorContainer}>
              <X size={30} color={theme.error} />
              <Text style={[styles.errorText, { color: theme.error }]}>
                間違えました！
              </Text>
            </View>
          )}
        </View>
      )}
      
      {gameState === 'result' && (
        <View style={styles.resultContainer}>
          <Trophy size={60} color={theme.primary} />
          <Text style={[styles.resultTitle, { color: theme.text }]}>
            お疲れ様でした！
          </Text>
          <Text style={[styles.resultScore, { color: theme.primary }]}>
            {bestStreak} 連続
          </Text>
          <Text style={[styles.resultDetail, { color: theme.textSecondary }]}>
            最高記録を達成しました
          </Text>
          
          <View style={styles.resultButtonsContainer}>
            <TouchableOpacity
              style={[styles.resultButton, { backgroundColor: theme.card }]}
              onPress={startGame}
            >
              <Text style={[styles.resultButtonText, { color: theme.text }]}>
                リトライ
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.resultButton, { backgroundColor: theme.primary }]}
              onPress={handleComplete}
            >
              <Text style={[styles.resultButtonText, { color: theme.text }]}>
                完了
              </Text>
            </TouchableOpacity>
          </View>

          {onClose && (
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
              onPress={handleClose}
            >
              <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>
                閉じる
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold' as const,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold' as const,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  instructions: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold' as const,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  subInstructions: {
    fontSize: fontSizes.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  startButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  startButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold' as const,
  },
  closeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  closeButtonText: {
    fontSize: fontSizes.md,
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameInstruction: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold' as const,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
  tilesContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tilesRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    margin: spacing.sm,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  tileButton: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  errorText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold' as const,
    marginTop: spacing.sm,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  resultTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold' as const,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  resultScore: {
    fontSize: fontSizes.xxl * 1.5,
    fontWeight: 'bold' as const,
    marginBottom: spacing.md,
  },
  resultDetail: {
    fontSize: fontSizes.md,
    marginBottom: spacing.xl,
  },
  resultButtonsContainer: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  resultButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.sm,
  },
  resultButtonText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold' as const,
  },
});