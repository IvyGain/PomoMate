import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { colors, spacing, fontSizes, borderRadius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { Award, Clock, X, Zap, Check, AlertCircle } from 'lucide-react-native';

// 難易度レベル
enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard'
}

// 演算子
type Operator = '+' | '-' | '×' | '÷';

interface Problem {
  question: string;
  answer: number;
  options: number[];
}

// Get screen width for responsive design
const { width } = Dimensions.get('window');

export const MathChallengeGame: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Easy);
  const [currentProblem, setCurrentProblem] = useState<Problem | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // 60秒ゲーム
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'neutral'>('neutral');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  const { unlockAchievement } = useUserStore();
  const { updateHighScore, games } = useGameStore();
  
  // 現在のゲームのハイスコアを取得
  const currentGame = games.find(game => game.id === 'math_challenge');
  const highScore = currentGame ? currentGame.highScore : 0;
  
  // 難易度に応じた問題生成
  const generateProblem = (diff: Difficulty): Problem => {
    let num1: number, num2: number, operator: Operator, answer: number;
    
    switch (diff) {
      case Difficulty.Easy:
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        operator = ['+', '-'][Math.floor(Math.random() * 2)] as Operator;
        break;
      case Difficulty.Medium:
        num1 = Math.floor(Math.random() * 20) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        operator = ['+', '-', '×'][Math.floor(Math.random() * 3)] as Operator;
        break;
      case Difficulty.Hard:
        num1 = Math.floor(Math.random() * 50) + 1;
        num2 = Math.floor(Math.random() * 20) + 1;
        operator = ['+', '-', '×', '÷'][Math.floor(Math.random() * 4)] as Operator;
        break;
    }
    
    // 引き算の場合は大きい数から小さい数を引く
    if (operator === '-' && num1 < num2) {
      [num1, num2] = [num2, num1];
    }
    
    // 割り算の場合は割り切れる数を使う
    if (operator === '÷') {
      num2 = Math.max(1, num2); // 0で割らないようにする
      num1 = num2 * Math.floor(Math.random() * 10 + 1); // 割り切れる数にする
    }
    
    // 答えを計算
    switch (operator) {
      case '+':
        answer = num1 + num2;
        break;
      case '-':
        answer = num1 - num2;
        break;
      case '×':
        answer = num1 * num2;
        break;
      case '÷':
        answer = num1 / num2;
        break;
    }
    
    // 選択肢を生成（正解を含む4つの選択肢）
    const options = [answer];
    
    // 間違った選択肢を生成
    while (options.length < 4) {
      let wrongAnswer;
      const randomOffset = Math.floor(Math.random() * 10) + 1;
      
      // 50%の確率で足す、50%の確率で引く
      if (Math.random() > 0.5) {
        wrongAnswer = answer + randomOffset;
      } else {
        wrongAnswer = Math.max(1, answer - randomOffset); // 負の数は避ける
      }
      
      // 重複を避ける
      if (!options.includes(wrongAnswer)) {
        options.push(wrongAnswer);
      }
    }
    
    // 選択肢をシャッフル
    options.sort(() => Math.random() - 0.5);
    
    return {
      question: `${num1} ${operator} ${num2} = ?`,
      answer,
      options
    };
  };
  
  // ゲーム開始
  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setScore(0);
    setTimeLeft(60);
    setGameStarted(true);
    setGameOver(false);
    setMessage('');
    setMessageType('neutral');
    setCurrentProblem(generateProblem(diff));
    setSelectedOption(null);
  };
  
  // タイマー処理
  useEffect(() => {
    if (timeLeft > 0 && gameStarted && !gameOver) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted && !gameOver) {
      endGame();
    }
  }, [timeLeft, gameStarted, gameOver]);
  
  // 回答チェック
  const checkAnswer = (selectedAnswer: number) => {
    if (!currentProblem) return;
    
    setSelectedOption(selectedAnswer);
    
    if (selectedAnswer === currentProblem.answer) {
      // 正解
      const pointsEarned = difficulty === Difficulty.Easy ? 1 :
                          difficulty === Difficulty.Medium ? 2 : 3;
      
      setScore(score + pointsEarned);
      setMessage(`+${pointsEarned}ポイント`);
      setMessageType('success');
      
      // 少し待ってから次の問題へ
      setTimeout(() => {
        setCurrentProblem(generateProblem(difficulty));
        setSelectedOption(null);
        setMessage('');
      }, 1000);
    } else {
      // 不正解
      setMessage('不正解...');
      setMessageType('error');
      
      // 少し待ってから次の問題へ
      setTimeout(() => {
        setCurrentProblem(generateProblem(difficulty));
        setSelectedOption(null);
        setMessage('');
      }, 1500);
    }
  };
  
  // ゲーム終了
  const endGame = () => {
    setGameOver(true);
    
    // 難易度に応じたスコア倍率
    const multiplier = difficulty === Difficulty.Easy ? 1 :
                      difficulty === Difficulty.Medium ? 1.5 : 2;
    
    const finalScore = Math.round(score * multiplier);
    
    // ハイスコア更新
    if (finalScore > highScore) {
      updateHighScore('math_challenge', finalScore);
      
      // 実績解除
      if (finalScore >= 30) {
        unlockAchievement('math_genius');
      }
    }
  };
  
  // 難易度選択画面
  if (!gameStarted) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>計算チャレンジ</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.difficultyContainer}>
          <Text style={styles.difficultyTitle}>難易度を選択</Text>
          
          <TouchableOpacity 
            style={[styles.difficultyButton, { backgroundColor: colors.success }]}
            onPress={() => startGame(Difficulty.Easy)}
          >
            <Text style={styles.difficultyButtonText}>かんたん</Text>
            <Text style={styles.difficultyDescription}>足し算・引き算（1〜10）</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.difficultyButton, { backgroundColor: colors.warning }]}
            onPress={() => startGame(Difficulty.Medium)}
          >
            <Text style={styles.difficultyButtonText}>ふつう</Text>
            <Text style={styles.difficultyDescription}>足し算・引き算・掛け算（1〜20）</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.difficultyButton, { backgroundColor: colors.error }]}
            onPress={() => startGame(Difficulty.Hard)}
          >
            <Text style={styles.difficultyButtonText}>むずかしい</Text>
            <Text style={styles.difficultyDescription}>四則演算（1〜50）</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>計算チャレンジ</Text>
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
          <Text style={styles.statLabel}>難易度</Text>
          <Text style={styles.statValue}>
            {difficulty === Difficulty.Easy ? 'かんたん' : 
             difficulty === Difficulty.Medium ? 'ふつう' : 'むずかしい'}
          </Text>
        </View>
      </View>
      
      {!gameOver ? (
        <View style={styles.gameArea}>
          <View style={styles.problemContainer}>
            <Text style={styles.problem}>{currentProblem?.question}</Text>
          </View>
          
          <View style={styles.optionsContainer}>
            {currentProblem?.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedOption === option && 
                    (option === currentProblem.answer ? styles.correctOption : styles.wrongOption)
                ]}
                onPress={() => checkAnswer(option)}
                disabled={selectedOption !== null}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {message ? (
            <View style={[
              styles.messageContainer,
              messageType === 'success' ? styles.successMessage : 
              messageType === 'error' ? styles.errorMessage : styles.neutralMessage
            ]}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.gameOverContainer}>
          <Award size={48} color={colors.primary} />
          <Text style={styles.gameOverTitle}>ゲーム終了！</Text>
          
          <Text style={styles.gameOverScore}>
            スコア: {score} × 
            {difficulty === Difficulty.Easy ? '1' : 
             difficulty === Difficulty.Medium ? '1.5' : '2'} = 
            {Math.round(score * (difficulty === Difficulty.Easy ? 1 : 
                               difficulty === Difficulty.Medium ? 1.5 : 2))}
          </Text>
          
          {Math.round(score * (difficulty === Difficulty.Easy ? 1 : 
                             difficulty === Difficulty.Medium ? 1.5 : 2)) > highScore && (
            <View style={styles.newHighScore}>
              <Zap size={20} color={colors.warning} />
              <Text style={styles.newHighScoreText}>新記録達成！</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.restartButton}
            onPress={() => setGameStarted(false)}
          >
            <Text style={styles.restartButtonText}>難易度選択に戻る</Text>
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
  difficultyContainer: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  difficultyTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  difficultyButton: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  difficultyButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  difficultyDescription: {
    fontSize: fontSizes.sm,
    color: colors.text,
    opacity: 0.8,
    textAlign: 'center',
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
  },
  problemContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  problem: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: spacing.md,
  },
  optionButton: {
    width: (width - spacing.md * 4) / 2,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctOption: {
    backgroundColor: colors.success,
  },
  wrongOption: {
    backgroundColor: colors.error,
  },
  optionText: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  messageContainer: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
  },
  successMessage: {
    backgroundColor: 'rgba(107, 203, 119, 0.2)',
  },
  errorMessage: {
    backgroundColor: 'rgba(239, 71, 111, 0.2)',
  },
  neutralMessage: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  messageText: {
    color: colors.text,
    fontSize: fontSizes.md,
    fontWeight: 'bold',
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