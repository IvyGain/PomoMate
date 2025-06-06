import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { colors, spacing, fontSizes, borderRadius } from '@/constants/theme';
import { X, Award, Gamepad, Zap } from 'lucide-react-native';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { ColorMatchGame } from './games/ColorMatchGame';
import { MemoryMatchGame } from './games/MemoryMatchGame';
import { TapTargetGame } from './games/TapTargetGame';
import { NumberPuzzleGame } from './games/NumberPuzzleGame';
import { MathChallengeGame } from './games/MathChallengeGame';
import { WordScrambleGame } from './games/WordScrambleGame';
import { PatternMemoryGame } from './games/PatternMemoryGame';

interface BreakTimeGameProps {
  onClose: () => void;
}

export const BreakTimeGame: React.FC<BreakTimeGameProps> = ({ onClose }) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [showGameSelector, setShowGameSelector] = useState(true);
  const { addXp } = useUserStore();
  const { games, updateHighScore } = useGameStore();
  
  const modalRef = useRef<Modal>(null);
  
  // Handle game completion
  const handleGameComplete = (gameId: string, score: number) => {
    // Update high score if needed
    const game = games.find(g => g.id === gameId);
    if (game && score > game.highScore) {
      updateHighScore(gameId, score);
    }
    
    // Award XP based on score
    const xpEarned = Math.floor(score / 10) + 5;
    addXp(xpEarned);
    
    // Return to game selector
    setSelectedGame(null);
    setShowGameSelector(true);
  };
  
  // Handle game close
  const handleGameClose = () => {
    setSelectedGame(null);
    setShowGameSelector(true);
  };
  
  // Render game based on selection
  const renderGame = () => {
    switch (selectedGame) {
      case 'color_match':
        return <ColorMatchGame onClose={handleGameClose} />;
      case 'memory_match':
        return <MemoryMatchGame onClose={handleGameClose} />;
      case 'tap_target':
        return <TapTargetGame onClose={handleGameClose} />;
      case 'number_puzzle':
        return <NumberPuzzleGame onClose={handleGameClose} />;
      case 'math_challenge':
        return <MathChallengeGame onClose={handleGameClose} />;
      case 'word_scramble':
        return (
          <WordScrambleGame 
            onComplete={(score) => handleGameComplete('word_scramble', score)}
            onClose={handleGameClose}
          />
        );
      case 'pattern_memory':
        return (
          <PatternMemoryGame 
            onComplete={(score) => handleGameComplete('pattern_memory', score)} 
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <View style={styles.container}>
      {showGameSelector ? (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>休憩タイム ミニゲーム</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subtitle}>
            ミニゲームで遊んでXPを獲得しよう！
          </Text>
          
          <ScrollView style={styles.gameList}>
            <GameCard
              title="カラーマッチ"
              description="色と名前が一致しているかを判断しよう"
              icon="🎨"
              onPress={() => {
                setSelectedGame('color_match');
                setShowGameSelector(false);
              }}
              highScore={games.find(g => g.id === 'color_match')?.highScore || 0}
            />
            
            <GameCard
              title="メモリーマッチ"
              description="カードをめくって同じペアを見つけよう"
              icon="🃏"
              onPress={() => {
                setSelectedGame('memory_match');
                setShowGameSelector(false);
              }}
              highScore={games.find(g => g.id === 'memory_match')?.highScore || 0}
            />
            
            <GameCard
              title="タップターゲット"
              description="動くターゲットをタップしよう"
              icon="🎯"
              onPress={() => {
                setSelectedGame('tap_target');
                setShowGameSelector(false);
              }}
              highScore={games.find(g => g.id === 'tap_target')?.highScore || 0}
            />
            
            <GameCard
              title="数字パズル"
              description="数字を順番に並べよう"
              icon="🔢"
              onPress={() => {
                setSelectedGame('number_puzzle');
                setShowGameSelector(false);
              }}
              highScore={games.find(g => g.id === 'number_puzzle')?.highScore || 0}
            />
            
            <GameCard
              title="計算チャレンジ"
              description="計算問題を解こう"
              icon="🧮"
              onPress={() => {
                setSelectedGame('math_challenge');
                setShowGameSelector(false);
              }}
              highScore={games.find(g => g.id === 'math_challenge')?.highScore || 0}
            />
            
            <GameCard
              title="単語スクランブル"
              description="バラバラの文字から単語を作ろう"
              icon="📝"
              onPress={() => {
                setSelectedGame('word_scramble');
                setShowGameSelector(false);
              }}
              highScore={games.find(g => g.id === 'word_scramble')?.highScore || 0}
            />
            
            <GameCard
              title="パターンメモリー"
              description="光るパターンを記憶しよう"
              icon="🧠"
              onPress={() => {
                setSelectedGame('pattern_memory');
                setShowGameSelector(false);
              }}
              highScore={games.find(g => g.id === 'pattern_memory')?.highScore || 0}
            />
          </ScrollView>
        </>
      ) : (
        renderGame()
      )}
    </View>
  );
};

interface GameCardProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  highScore: number;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, icon, onPress, highScore }) => {
  return (
    <TouchableOpacity style={styles.gameCard} onPress={onPress}>
      <View style={styles.gameIconContainer}>
        <Text style={styles.gameIcon}>{icon}</Text>
      </View>
      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle}>{title}</Text>
        <Text style={styles.gameDescription}>{description}</Text>
        <View style={styles.highScoreContainer}>
          <Award size={14} color={colors.warning} />
          <Text style={styles.highScoreText}>ハイスコア: {highScore}</Text>
        </View>
      </View>
      <Gamepad size={24} color={colors.primary} />
    </TouchableOpacity>
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
  subtitle: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  gameList: {
    flex: 1,
    padding: spacing.md,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  gameIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  gameIcon: {
    fontSize: 24,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  gameDescription: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  highScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highScoreText: {
    fontSize: fontSizes.xs,
    color: colors.warning,
    marginLeft: spacing.xs,
  },
});