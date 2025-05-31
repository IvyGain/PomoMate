import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { spacing, fontSizes, borderRadius } from '@/constants/theme';
import { Brain, Check, X, AlertTriangle } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const TILE_SIZE = (width - spacing.lg * 4) / 2;

interface PatternMemoryGameProps {
  onComplete: (score: number) => void;
}

// Colors for the tiles
const TILE_COLORS = [
  '#FF5252', // Red
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#FFEB3B', // Yellow
];

export const PatternMemoryGame: React.FC<PatternMemoryGameProps> = ({ onComplete }) => {
  const { theme } = useThemeStore();
  const [gameState, setGameState] = useState<'ready' | 'watch' | 'repeat' | 'result'>('ready');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [pattern, setPattern] = useState<number[]>([]);
  const [playerPattern, setPlayerPattern] = useState<number[]>([]);
  const [activeTile, setActiveTile] = useState<number | null>(null);
  const [showError, setShowError] = useState(false);
  
  // Animation values
  const tileAnimations = [
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
    useRef(new Animated.Value(1)).current,
  ];
  
  // Timer refs
  const patternTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Start the game
  const startGame = () => {
    setLevel(1);
    setScore(0);
    setPattern([]);
    setPlayerPattern([]);
    setGameState('watch');
    generatePattern(1);
  };
  
  // Generate a pattern for the current level
  const generatePattern = (currentLevel: number) => {
    // Pattern length increases with level
    const patternLength = Math.min(currentLevel + 2, 10);
    const newPattern: number[] = [];
    
    for (let i = 0; i < patternLength; i++) {
      newPattern.push(Math.floor(Math.random() * 4));
    }
    
    setPattern(newPattern);
    
    // Start showing the pattern after a short delay
    setTimeout(() => {
      showPattern(newPattern);
    }, 1000);
  };
  
  // Show the pattern to the player
  const showPattern = (patternToShow: number[]) => {
    let index = 0;
    
    const showNextTile = () => {
      if (index < patternToShow.length) {
        const tileIndex = patternToShow[index];
        setActiveTile(tileIndex);
        
        // Animate the tile
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
        
        // Move to the next tile after a delay
        patternTimerRef.current = setTimeout(() => {
          setActiveTile(null);
          patternTimerRef.current = setTimeout(() => {
            index++;
            showNextTile();
          }, 200);
        }, 600);
      } else {
        // Pattern finished, player's turn
        setActiveTile(null);
        setPlayerPattern([]);
        setGameState('repeat');
      }
    };
    
    showNextTile();
  };
  
  // Handle tile press during player's turn
  const handleTilePress = (tileIndex: number) => {
    if (gameState !== 'repeat') return;
    
    // Animate the pressed tile
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
    
    // Check if the player's pattern matches the original pattern so far
    const isCorrectSoFar = newPlayerPattern.every(
      (tile, index) => tile === pattern[index]
    );
    
    if (!isCorrectSoFar) {
      // Wrong tile pressed
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
        setGameState('result');
      }, 1000);
      return;
    }
    
    // Check if the player has completed the pattern
    if (newPlayerPattern.length === pattern.length) {
      // Pattern completed successfully
      const levelScore = level * 10;
      setScore(prevScore => prevScore + levelScore);
      
      // Move to the next level or end the game
      if (level < 5) {
        setTimeout(() => {
          setLevel(prevLevel => prevLevel + 1);
          setPattern([]);
          setPlayerPattern([]);
          setGameState('watch');
          generatePattern(level + 1);
        }, 1000);
      } else {
        // Game completed
        setTimeout(() => {
          setGameState('result');
        }, 1000);
      }
    }
  };
  
  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (patternTimerRef.current) {
        clearTimeout(patternTimerRef.current);
      }
    };
  }, []);
  
  // Render a single tile
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
  
  // Handle game completion
  const handleComplete = () => {
    // Calculate final score (max 100)
    const finalScore = Math.min(100, score);
    onComplete(finalScore);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>パターンメモリー</Text>
        {gameState !== 'ready' && gameState !== 'result' && (
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            レベル {level}/5
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
            レベルが上がるごとにパターンが長くなります
          </Text>
          
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: theme.primary }]}
            onPress={startGame}
          >
            <Text style={[styles.startButtonText, { color: theme.text }]}>
              スタート
            </Text>
          </TouchableOpacity>
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
          {score > 0 ? (
            <>
              <Check size={60} color={theme.success} />
              <Text style={[styles.resultTitle, { color: theme.text }]}>
                素晴らしい！
              </Text>
              <Text style={[styles.resultScore, { color: theme.primary }]}>
                スコア: {score}
              </Text>
              <Text style={[styles.resultDetail, { color: theme.textSecondary }]}>
                レベル {level} まで達成
              </Text>
            </>
          ) : (
            <>
              <AlertTriangle size={60} color={theme.warning} />
              <Text style={[styles.resultTitle, { color: theme.text }]}>
                残念！
              </Text>
              <Text style={[styles.resultDetail, { color: theme.textSecondary }]}>
                もう一度挑戦してみよう
              </Text>
            </>
          )}
          
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
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.md,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  instructions: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
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
  },
  startButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameInstruction: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
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
    fontWeight: 'bold',
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
    fontWeight: 'bold',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  resultScore: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  resultDetail: {
    fontSize: fontSizes.md,
    marginBottom: spacing.xl,
  },
  resultButtonsContainer: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  resultButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.sm,
  },
  resultButtonText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
});