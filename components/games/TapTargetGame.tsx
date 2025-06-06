import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, spacing, fontSizes, borderRadius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { Smile, Award, Zap, X } from 'lucide-react-native';

export const TapTargetGame: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30秒ゲーム
  const [gameOver, setGameOver] = useState(false);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const targetSize = useRef(new Animated.Value(1)).current;
  
  const { unlockAchievement } = useUserStore();
  const { updateHighScore, games } = useGameStore();
  
  // 現在のゲームのハイスコアを取得
  const currentGame = games.find(game => game.id === 'tap_target');
  const highScore = currentGame ? currentGame.highScore : 0;
  
  // タイマー処理
  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver) {
      setGameOver(true);
      
      // 高得点更新チェック
      if (score > highScore) {
        updateHighScore('tap_target', score);
        
        // 高得点達成で実績解除
        if (score >= 20) {
          unlockAchievement('minigame_master');
        }
      }
    }
  }, [timeLeft, gameOver]);
  
  // ターゲットをタップした時の処理
  const handleTargetPress = () => {
    if (gameOver) return;
    
    // スコア加算
    setScore(score + 1);
    
    // ターゲットアニメーション
    Animated.sequence([
      Animated.timing(targetSize, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(targetSize, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    // ランダムな位置に移動
    const newX = Math.random() * 80; // 画面幅の80%以内
    const newY = Math.random() * 60; // 画面高さの60%以内
    setTargetPosition({ x: newX, y: newY });
  };
  
  // ゲームリスタート
  const restartGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setTargetPosition({ x: 50, y: 50 });
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>タップターゲット</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>スコア</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>残り時間</Text>
          <Text style={styles.statValue}>{timeLeft}秒</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>ハイスコア</Text>
          <Text style={styles.statValue}>{highScore}</Text>
        </View>
      </View>
      
      {!gameOver ? (
        <View style={styles.gameArea}>
          <Animated.View 
            style={[
              styles.target, 
              { 
                left: `${targetPosition.x}%`, 
                top: `${targetPosition.y}%`,
                transform: [{ scale: targetSize }]
              }
            ]}
          >
            <TouchableOpacity
              style={styles.targetButton}
              onPress={handleTargetPress}
            >
              <Smile size={32} color={colors.text} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      ) : (
        <View style={styles.gameOverContainer}>
          <Award size={48} color={colors.primary} />
          <Text style={styles.gameOverTitle}>ゲーム終了！</Text>
          <Text style={styles.gameOverScore}>スコア: {score}</Text>
          
          {score > highScore && (
            <View style={styles.newHighScore}>
              <Zap size={20} color={colors.warning} />
              <Text style={styles.newHighScoreText}>新記録達成！</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={restartGame}
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
    position: 'relative',
    margin: spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.md,
  },
  target: {
    position: 'absolute',
    width: 60,
    height: 60,
  },
  targetButton: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: spacing.sm,
  },
  gameOverScore: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
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