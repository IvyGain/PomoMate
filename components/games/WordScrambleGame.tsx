import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { spacing, fontSizes, borderRadius } from '@/constants/theme';
import { Check, X, HelpCircle, Clock } from 'lucide-react-native';

interface WordScrambleGameProps {
  onComplete: (score: number) => void;
  onClose?: () => void; // Added onClose prop
}

// Word pairs for the game (Japanese word and its meaning)
const wordPairs = [
  { word: "集中力", meaning: "物事に注意を向ける能力" },
  { word: "効率的", meaning: "無駄なく最大の効果を得る" },
  { word: "時間管理", meaning: "時間を有効に使うこと" },
  { word: "生産性", meaning: "効率よく成果を出すこと" },
  { word: "目標設定", meaning: "達成したい成果を決めること" },
  { word: "習慣化", meaning: "行動を自然に行えるようにすること" },
  { word: "優先順位", meaning: "重要度に基づいて順序をつけること" },
  { word: "タスク分割", meaning: "大きな仕事を小さく分けること" },
  { word: "休息時間", meaning: "疲れを回復するための時間" },
  { word: "自己管理", meaning: "自分自身をコントロールすること" },
  { word: "継続力", meaning: "物事を続ける能力" },
  { word: "達成感", meaning: "目標を達成した時の満足感" },
  { word: "集中モード", meaning: "邪魔されずに作業に取り組む状態" },
  { word: "作業環境", meaning: "仕事をする場所の状態" },
  { word: "締め切り", meaning: "完了すべき期限" },
];

// Fisher-Yates shuffle algorithm
const shuffleArray = (array: any[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const WordScrambleGame: React.FC<WordScrambleGameProps> = ({ onComplete, onClose }) => {
  const { theme } = useThemeStore();
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameActive, setGameActive] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [correctMeaning, setCorrectMeaning] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Total number of rounds
  const totalRounds = 5;
  
  // Start the game
  const startGame = () => {
    setCurrentRound(0);
    setScore(0);
    setGameActive(true);
    setShowResult(false);
    loadNextWord();
  };
  
  // Load the next word
  const loadNextWord = () => {
    // Reset state for new word
    setTimeLeft(15);
    setSelectedOption(null);
    setIsCorrect(null);
    
    // Get a random word from the list
    const randomIndex = Math.floor(Math.random() * wordPairs.length);
    const wordPair = wordPairs[randomIndex];
    
    setCurrentWord(wordPair.word);
    setCorrectMeaning(wordPair.meaning);
    
    // Generate options (1 correct, 3 incorrect)
    const incorrectOptions = wordPairs
      .filter(pair => pair.meaning !== wordPair.meaning)
      .map(pair => pair.meaning)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    // Combine correct and incorrect options and shuffle
    const allOptions = shuffleArray([wordPair.meaning, ...incorrectOptions]);
    setOptions(allOptions);
  };
  
  // Handle option selection
  const handleSelectOption = (option: string) => {
    if (selectedOption !== null) return; // Already selected
    
    setSelectedOption(option);
    const correct = option === correctMeaning;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + Math.max(1, timeLeft));
    }
    
    // Show result for 2 seconds, then move to next word
    setTimeout(() => {
      if (currentRound < totalRounds - 1) {
        setCurrentRound(prev => prev + 1);
        loadNextWord();
      } else {
        // Game over
        setGameActive(false);
        setShowResult(true);
      }
    }, 2000);
  };
  
  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (gameActive && timeLeft > 0 && selectedOption === null) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && selectedOption === null) {
      // Time's up, move to next word
      setSelectedOption('');
      setIsCorrect(false);
      
      setTimeout(() => {
        if (currentRound < totalRounds - 1) {
          setCurrentRound(prev => prev + 1);
          loadNextWord();
        } else {
          // Game over
          setGameActive(false);
          setShowResult(true);
        }
      }, 2000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameActive, timeLeft, selectedOption, currentRound]);
  
  // Complete the game
  const completeGame = () => {
    // Calculate final score (max 100)
    const finalScore = Math.min(100, score);
    onComplete(finalScore);
  };

  // Handle close button
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {!gameActive && !showResult ? (
        <View style={styles.startContainer}>
          <Text style={[styles.title, { color: theme.text }]}>単語マッチング</Text>
          <Text style={[styles.instructions, { color: theme.textSecondary }]}>
            表示される単語の正しい意味を選んでください。
            素早く正解するほど高得点になります。
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
      ) : showResult ? (
        <View style={styles.resultContainer}>
          <Text style={[styles.resultTitle, { color: theme.text }]}>
            ゲーム終了！
          </Text>
          <Text style={[styles.resultScore, { color: theme.primary }]}>
            スコア: {score}
          </Text>
          <TouchableOpacity
            style={[styles.completeButton, { backgroundColor: theme.primary }]}
            onPress={completeGame}
          >
            <Text style={[styles.completeButtonText, { color: theme.text }]}>
              完了
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
      ) : (
        <View style={styles.gameContainer}>
          <View style={styles.header}>
            <View style={styles.progressContainer}>
              <Text style={[styles.progressText, { color: theme.text }]}>
                {currentRound + 1}/{totalRounds}
              </Text>
              <View style={[styles.progressBar, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${((currentRound + 1) / totalRounds) * 100}%`,
                      backgroundColor: theme.primary 
                    }
                  ]} 
                />
              </View>
            </View>
            
            <View style={[styles.timerContainer, { borderColor: timeLeft < 5 ? theme.error : theme.textSecondary }]}>
              <Clock size={16} color={timeLeft < 5 ? theme.error : theme.textSecondary} />
              <Text style={[
                styles.timerText, 
                { color: timeLeft < 5 ? theme.error : theme.textSecondary }
              ]}>
                {timeLeft}
              </Text>
            </View>
          </View>
          
          <View style={styles.wordContainer}>
            <Text style={[styles.wordLabel, { color: theme.textSecondary }]}>
              この単語の意味は？
            </Text>
            <Text style={[styles.word, { color: theme.text }]}>
              {currentWord}
            </Text>
          </View>
          
          <ScrollView style={styles.optionsContainer}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  { backgroundColor: theme.card },
                  selectedOption === option && (
                    isCorrect ? { backgroundColor: 'rgba(107, 203, 119, 0.3)' } : 
                    { backgroundColor: 'rgba(239, 71, 111, 0.3)' }
                  ),
                  option === correctMeaning && selectedOption !== null && { backgroundColor: 'rgba(107, 203, 119, 0.3)' }
                ]}
                onPress={() => handleSelectOption(option)}
                disabled={selectedOption !== null}
              >
                <Text style={[styles.optionText, { color: theme.text }]}>
                  {option}
                </Text>
                
                {selectedOption === option && (
                  isCorrect ? (
                    <Check size={20} color={theme.success} style={styles.resultIcon} />
                  ) : (
                    <X size={20} color={theme.error} style={styles.resultIcon} />
                  )
                )}
                
                {option === correctMeaning && selectedOption !== null && selectedOption !== option && (
                  <Check size={20} color={theme.success} style={styles.resultIcon} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {selectedOption !== null && (
            <View style={styles.feedbackContainer}>
              <Text style={[
                styles.feedbackText, 
                { color: isCorrect ? theme.success : theme.error }
              ]}>
                {isCorrect ? "正解！" : "不正解..."}
              </Text>
            </View>
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
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  instructions: {
    fontSize: fontSizes.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: fontSizes.md * 1.5,
  },
  startButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  startButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  closeButtonText: {
    fontSize: fontSizes.md,
  },
  gameContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  progressText: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  timerText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  wordLabel: {
    fontSize: fontSizes.md,
    marginBottom: spacing.sm,
  },
  word: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
  },
  optionsContainer: {
    flex: 1,
    marginBottom: spacing.lg,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  optionText: {
    fontSize: fontSizes.md,
    flex: 1,
  },
  resultIcon: {
    marginLeft: spacing.sm,
  },
  feedbackContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  feedbackText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    marginBottom: spacing.lg,
  },
  resultScore: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
    marginBottom: spacing.xl,
  },
  completeButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  completeButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
});