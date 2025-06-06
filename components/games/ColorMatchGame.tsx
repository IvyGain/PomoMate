import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, fontSizes, borderRadius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { Award, Clock, X, Zap, Check, X as XIcon } from 'lucide-react-native';

// 色の定義
const colorOptions = [
  { name: 'あか', color: '#FF6B6B' },
  { name: 'あお', color: '#4ECDC4' },
  { name: 'みどり', color: '#6BCB77' },
  { name: 'きいろ', color: '#FFD166' },
  { name: 'むらさき', color: '#9370DB' },
];

interface ColorProblem {
  text: string;  // 表示される色の名前
  textColor: string;  // 文字の色
  isMatch: boolean;  // 名前と色が一致しているか
}

export const ColorMatchGame: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentProblem, setCurrentProblem] = useState<ColorProblem | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30秒ゲーム
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0); // 連続正解数
  
  const { unlockAchievement } = useUserStore();
  const { updateHighScore, games } = useGameStore();
  
  // 現在のゲームのハイスコアを取得
  const currentGame = games.find(game => game.id === 'color_match');
  const highScore = currentGame ? currentGame.highScore : 0;
  
  // ゲーム初期化
  useEffect(() => {
    startGame();
  }, []);
  
  // タイマー処理
  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver) {
      endGame();
    }
  }, [timeLeft, gameOver]);
  
  // ゲーム開始
  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setStreak(0);
    generateNewProblem();
  };
  
  // 新しい問題を生成
  const generateNewProblem = () => {
    // ランダムに色の名前を選択
    const textIndex = Math.floor(Math.random() * colorOptions.length);
    const text = colorOptions[textIndex].name;
    
    // 一致するかどうかをランダムに決定
    const isMatch = Math.random() > 0.5;
    
    let textColor;
    if (isMatch) {
      // 一致する場合は同じ色を使用
      textColor = colorOptions[textIndex].color;
    } else {
      // 一致しない場合は別の色を選択
      let colorIndex;
      do {
        colorIndex = Math.floor(Math.random() * colorOptions.length);
      } while (colorIndex === textIndex);
      textColor = colorOptions[colorIndex].color;
    }
    
    setCurrentProblem({ text, textColor, isMatch });
  };
  
  // 回答処理
  const handleAnswer = (userAnswer: boolean) => {
    if (!currentProblem || gameOver) return;
    
    const isCorrect = userAnswer === currentProblem.isMatch;
    
    if (isCorrect) {
      // 正解
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // 連続正解ボーナス
      const streakBonus = Math.min(5, Math.floor(newStreak / 3));
      setScore(score + 1 + streakBonus);
    } else {
      // 不正解
      setStreak(0);
    }
    
    // 次の問題
    generateNewProblem();
  };
  
  // ゲーム終了
  const endGame = () => {
    setGameOver(true);
    
    // ハイスコア更新
    if (score > highScore) {
      updateHighScore('color_match', score);
      
      // 実績解除
      if (score >= 25) {
        unlockAchievement('color_master');
      }
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>カラーマッチ</Text>
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
          <Text style={styles.statLabel}>連続正解</Text>
          <Text style={styles.statValue}>{streak}</Text>
        </View>
      </View>
      
      {!gameOver ? (
        <View style={styles.gameArea}>
          <View style={styles.instructionContainer}>
            <Text style={styles.instruction}>
              色の名前と実際の色が一致していますか？
            </Text>
          </View>
          
          {currentProblem && (
            <View style={styles.problemContainer}>
              <Text style={[
                styles.colorText,
                { color: currentProblem.textColor }
              ]}>
                {currentProblem.text}
              </Text>
            </View>
          )}
          
          <View style={styles.answerContainer}>
            <TouchableOpacity 
              style={[styles.answerButton, styles.matchButton]}
              onPress={() => handleAnswer(true)}
            >
              <Check size={24} color={colors.text} />
              <Text style={styles.answerButtonText}>一致</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.answerButton, styles.noMatchButton]}
              onPress={() => handleAnswer(false)}
            >
              <XIcon size={24} color={colors.text} />
              <Text style={styles.answerButtonText}>不一致</Text>
            </TouchableOpacity>
          </View>
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
            onPress={startGame}
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
  instructionContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  instruction: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  problemContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  colorText: {
    fontSize: fontSizes.xxxl,
    fontWeight: 'bold',
  },
  answerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  answerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  matchButton: {
    backgroundColor: colors.success,
  },
  noMatchButton: {
    backgroundColor: colors.error,
  },
  answerButtonText: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginLeft: spacing.sm,
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