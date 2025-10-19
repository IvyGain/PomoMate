import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { colors, spacing, fontSizes, borderRadius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { Award, X, Zap } from 'lucide-react-native';

// Card icons (emojis)
const cardIcons = [
  '❤️', '⭐', '😊', '☀️', '🌙', '☁️', '☂️', '☕'
];

interface Card {
  id: number;
  icon: string;
  flipped: boolean;
  matched: boolean;
}

// Get screen dimensions to calculate card size
const { width, height } = Dimensions.get('window');
const CARD_MARGIN = spacing.xs;
const GRID_PADDING = spacing.md * 2;
const HEADER_HEIGHT = 60;
const STATS_HEIGHT = 80;
const AVAILABLE_HEIGHT = height - HEADER_HEIGHT - STATS_HEIGHT - GRID_PADDING - 40;
const AVAILABLE_WIDTH = width - GRID_PADDING;

const CARDS_PER_ROW = 4;
const NUM_ROWS = 4;

// Calculate card size to fit in a 4x4 grid
const CARD_SIZE_BY_WIDTH = (AVAILABLE_WIDTH / CARDS_PER_ROW) - (CARD_MARGIN * 2);
const CARD_SIZE_BY_HEIGHT = (AVAILABLE_HEIGHT / NUM_ROWS) - (CARD_MARGIN * 2);
const CARD_SIZE = Math.min(CARD_SIZE_BY_WIDTH, CARD_SIZE_BY_HEIGHT, 80); // Max 80px per card

export const MemoryMatchGame: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [scoreBreakdown, setScoreBreakdown] = useState<{
    base: number;
    movesBonus: number;
    timeBonus: number;
    total: number;
  } | null>(null);
  
  const { unlockAchievement } = useUserStore();
  const { updateHighScore, games } = useGameStore();
  
  // Get current game high score
  const currentGame = games.find(game => game.id === 'memory_match');
  const highScore = currentGame ? currentGame.highScore : 0;
  
  // Initialize game
  useEffect(() => {
    initGame();
  }, []);
  
  const initGame = () => {
    // Create pairs of cards and shuffle
    const cardPairs: Card[] = [];
    
    // Create pairs of cards
    cardIcons.forEach((icon, index) => {
      // Add two cards with the same icon
      cardPairs.push({
        id: index * 2,
        icon,
        flipped: false,
        matched: false
      });
      
      cardPairs.push({
        id: index * 2 + 1,
        icon,
        flipped: false,
        matched: false
      });
    });
    
    // Shuffle cards
    const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setGameOver(false);
    setStartTime(Date.now());
    setEndTime(0);
  };
  
  // Handle card press
  const handleCardPress = (id: number) => {
    // Ignore if game is over, two cards are already flipped, or card is already flipped/matched
    if (gameOver || flippedCards.length >= 2 || cards.find(card => card.id === id)?.flipped || cards.find(card => card.id === id)?.matched) {
      return;
    }
    
    // Flip the card
    const newCards = [...cards];
    const cardIndex = newCards.findIndex(card => card.id === id);
    newCards[cardIndex].flipped = true;
    setCards(newCards);
    
    // Add to flipped cards
    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);
    
    // If two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      
      // Check if they match
      const firstCardIndex = cards.findIndex(card => card.id === newFlippedCards[0]);
      const secondCardIndex = cards.findIndex(card => card.id === newFlippedCards[1]);
      
      if (cards[firstCardIndex].icon === cards[secondCardIndex].icon) {
        // Cards match
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstCardIndex].matched = true;
          matchedCards[secondCardIndex].matched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          
          const newMatchedPairs = matchedPairs + 1;
          setMatchedPairs(newMatchedPairs);
          
          // Check if all cards are matched (8 pairs total)
          if (newMatchedPairs === 8) {
            setGameOver(true);
            const finalEndTime = Date.now();
            setEndTime(finalEndTime);
            
            // Calculate score
            const breakdown = calculateFinalScore(moves + 1, finalEndTime - startTime);
            setScoreBreakdown(breakdown);
            
            // Update high score
            if (breakdown.total > highScore) {
              updateHighScore('memory_match', breakdown.total);
              
              // Unlock achievement
              if (breakdown.total >= 150) {
                unlockAchievement('memory_master');
              }
            }
          }
        }, 500);
      } else {
        // Cards don't match, flip them back
        setTimeout(() => {
          const unmatchedCards = [...cards];
          unmatchedCards[firstCardIndex].flipped = false;
          unmatchedCards[secondCardIndex].flipped = false;
          setCards(unmatchedCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };
  
  // Calculate game time
  const getGameTime = () => {
    const totalTime = endTime > 0 ? endTime - startTime : Date.now() - startTime;
    return Math.floor(totalTime / 1000);
  };
  
  // Calculate final score with breakdown
  const calculateFinalScore = (totalMoves: number, totalTimeMs: number) => {
    const timeInSeconds = Math.floor(totalTimeMs / 1000);
    
    // Base score: 100 points
    let score = 100;
    let breakdown = {
      base: 100,
      movesBonus: 0,
      timeBonus: 0,
      total: 0
    };
    
    // Moves bonus: 16手以内の場合、1手ずつ加点
    const optimalMoves = 16; // 8 pairs × 2 moves = perfect play
    if (totalMoves <= optimalMoves) {
      // 16手以内: (16 - 実際の手数) × 加点
      const movesUnderOptimal = optimalMoves - totalMoves;
      breakdown.movesBonus = movesUnderOptimal * 5; // 1手ごとに5点加点
      score += breakdown.movesBonus;
    } else {
      // 16手以上: ペナルティ
      const penalty = (totalMoves - optimalMoves) * 2;
      breakdown.movesBonus = -penalty;
      score -= penalty;
    }
    
    // Time bonus: 30秒未満の場合、1秒ごとに+5点
    if (timeInSeconds < 30) {
      // 30秒未満: (30 - 実際の秒数) × 5点
      const secondsUnder30 = 30 - timeInSeconds;
      breakdown.timeBonus = secondsUnder30 * 5;
      score += breakdown.timeBonus;
    } else if (timeInSeconds < 45) {
      breakdown.timeBonus = 10;
      score += 10;
    } else if (timeInSeconds < 60) {
      breakdown.timeBonus = 0;
    } else {
      // 60秒以上: ペナルティ
      const penalty = (timeInSeconds - 60) * 2;
      breakdown.timeBonus = -penalty;
      score -= penalty;
    }
    
    // Minimum score is 10
    breakdown.total = Math.max(10, score);
    return breakdown;
  };
  
  // Calculate current score (for display during game)
  const getCurrentScore = () => {
    if (scoreBreakdown) {
      return scoreBreakdown.total;
    }
    return 0;
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>メモリーマッチ</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>手数</Text>
          <Text style={styles.statValue}>{moves}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>時間</Text>
          <Text style={styles.statValue}>{getGameTime()}秒</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ハイスコア</Text>
          <Text style={styles.statValue}>{highScore}</Text>
        </View>
      </View>
      
      {!gameOver ? (
        <View style={styles.gameArea}>
          <View style={styles.cardGrid}>
            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={[
                  styles.card,
                  card.flipped && styles.cardFlipped,
                  card.matched && styles.cardMatched
                ]}
                onPress={() => handleCardPress(card.id)}
                activeOpacity={0.7}
              >
                {card.flipped || card.matched ? (
                  <Text style={styles.cardIcon}>{card.icon}</Text>
                ) : (
                  <Text style={styles.cardBack}>?</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <View style={styles.gameOverContainer}>
          <Award size={48} color={colors.primary} />
          <Text style={styles.gameOverTitle}>ゲームクリア！</Text>
          
          <View style={styles.scoreBreakdown}>
            <Text style={styles.finalScoreTitle}>最終スコア</Text>
            <Text style={styles.finalScoreValue}>{getCurrentScore()}</Text>
            
            <View style={styles.breakdownDivider} />
            
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>基本スコア</Text>
              <Text style={styles.breakdownValue}>+{scoreBreakdown?.base}</Text>
            </View>
            
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>手数ボーナス ({moves}手)</Text>
              <Text style={[
                styles.breakdownValue,
                scoreBreakdown && scoreBreakdown.movesBonus < 0 ? styles.breakdownPenalty : styles.breakdownBonus
              ]}>
                {scoreBreakdown && scoreBreakdown.movesBonus >= 0 ? '+' : ''}{scoreBreakdown?.movesBonus}
              </Text>
            </View>
            
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>時間ボーナス ({getGameTime()}秒)</Text>
              <Text style={[
                styles.breakdownValue,
                scoreBreakdown && scoreBreakdown.timeBonus < 0 ? styles.breakdownPenalty : styles.breakdownBonus
              ]}>
                {scoreBreakdown && scoreBreakdown.timeBonus >= 0 ? '+' : ''}{scoreBreakdown?.timeBonus}
              </Text>
            </View>
          </View>
          
          {getCurrentScore() > highScore && (
            <View style={styles.newHighScore}>
              <Zap size={20} color={colors.warning} />
              <Text style={styles.newHighScoreText}>新記録達成！</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={initGame}
          >
            <Text style={styles.restartButtonText}>もう一度プレイ</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  gameArea: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: (CARD_SIZE + CARD_MARGIN * 2) * CARDS_PER_ROW,
    alignSelf: 'center',
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    margin: CARD_MARGIN,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardFlipped: {
    backgroundColor: colors.secondary,
  },
  cardMatched: {
    backgroundColor: colors.success,
  },
  cardBack: {
    fontSize: CARD_SIZE * 0.4,
    color: colors.text,
  },
  cardIcon: {
    fontSize: CARD_SIZE * 0.4,
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  gameOverTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  scoreBreakdown: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.lg,
  },
  finalScoreTitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  finalScoreValue: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: spacing.md,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  breakdownLabel: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
  },
  breakdownValue: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.text,
  },
  breakdownBonus: {
    color: colors.success,
  },
  breakdownPenalty: {
    color: colors.error,
  },
  newHighScore: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  newHighScoreText: {
    color: colors.warning,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  restartButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  restartButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: fontSizes.md,
  },
});