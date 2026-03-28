import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { spacing, fontSizes, borderRadius } from '@/constants/theme';
import { Check, X, Clock } from 'lucide-react-native';

interface WordScrambleGameProps {
  onComplete: (score: number) => void;
  onClose?: () => void;
}

const words = [
  { original: "集中力", choices: ["集中力", "集中気", "集合力", "集力中"] },
  { original: "効率的", choices: ["効率的", "高率的", "功率的", "効立的"] },
  { original: "時間管理", choices: ["時間管理", "時管理間", "事間管理", "時管間理"] },
  { original: "生産性", choices: ["生産性", "生性産", "生算性", "正産性"] },
  { original: "目標設定", choices: ["目標設定", "目設標定", "木標設定", "目標定設"] },
  { original: "習慣化", choices: ["習慣化", "習化慣", "週慣化", "習貫化"] },
  { original: "優先順位", choices: ["優先順位", "優位順先", "憂先順位", "優順先位"] },
  { original: "継続力", choices: ["継続力", "継力続", "系続力", "継統力"] },
  { original: "達成感", choices: ["達成感", "達感成", "立成感", "達制感"] },
  { original: "自己管理", choices: ["自己管理", "自理己管", "自子管理", "自己理管"] },
  { original: "作業環境", choices: ["作業環境", "作環業境", "昨業環境", "作業境環"] },
  { original: "締め切り", choices: ["締め切り", "締切めり", "占め切り", "締めりき"] },
  { original: "休息時間", choices: ["休息時間", "休時息間", "球息時間", "休息間時"] },
  { original: "集中モード", choices: ["集中モード", "集モード中", "集仲モード", "集中ドーム"] },
  { original: "タスク分割", choices: ["タスク分割", "タ割ス分ク", "タスク割分", "タクス分割"] },
];

const shuffleWord = (word: string): string => {
  const chars = word.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  const shuffled = chars.join('');
  return shuffled === word ? shuffleWord(word) : shuffled;
};

export const WordScrambleGame: React.FC<WordScrambleGameProps> = ({ onComplete, onClose }) => {
  const { theme } = useThemeStore();
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [gameActive, setGameActive] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [scrambledWord, setScrambledWord] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [usedWords, setUsedWords] = useState<Set<number>>(new Set());
  
  const totalRounds = 8;
  
  const startGame = () => {
    setCurrentRound(0);
    setScore(0);
    setGameActive(true);
    setShowResult(false);
    setUsedWords(new Set());
    loadNextWord();
  };
  
  const loadNextWord = () => {
    setTimeLeft(20);
    setSelectedOption(null);
    setIsCorrect(null);
    
    const availableIndices = words
      .map((_, index) => index)
      .filter(index => !usedWords.has(index));
    
    if (availableIndices.length === 0) {
      setUsedWords(new Set());
      availableIndices.push(...words.map((_, index) => index));
    }
    
    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const wordData = words[randomIndex];
    
    setUsedWords(prev => new Set([...prev, randomIndex]));
    setCorrectAnswer(wordData.original);
    setScrambledWord(shuffleWord(wordData.original));
    
    const shuffledChoices = [...wordData.choices].sort(() => Math.random() - 0.5);
    setOptions(shuffledChoices);
  };
  
  const handleSelectOption = (option: string) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(option);
    const correct = option === correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      const timeBonus = Math.floor(timeLeft * 2);
      setScore(prev => prev + 10 + timeBonus);
    }
    
    setTimeout(() => {
      if (currentRound < totalRounds - 1) {
        setCurrentRound(prev => prev + 1);
        loadNextWord();
      } else {
        setGameActive(false);
        setShowResult(true);
      }
    }, 1500);
  };
  
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (gameActive && timeLeft > 0 && selectedOption === null) {
      timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && selectedOption === null) {
      setSelectedOption('');
      setIsCorrect(false);
      
      setTimeout(() => {
        if (currentRound < totalRounds - 1) {
          setCurrentRound(prev => prev + 1);
          loadNextWord();
        } else {
          setGameActive(false);
          setShowResult(true);
        }
      }, 1500);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameActive, timeLeft, selectedOption, currentRound]);
  
  const completeGame = () => {
    const finalScore = Math.min(100, score);
    onComplete(finalScore);
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {!gameActive && !showResult ? (
        <View style={styles.startContainer}>
          <Text style={[styles.title, { color: theme.text }]}>単語スクランブル</Text>
          <Text style={[styles.instructions, { color: theme.textSecondary }]}>
            バラバラになった文字から正しい単語を選んでください。
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
              この文字から正しい単語を選んでください
            </Text>
            <View style={[styles.scrambledContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.scrambledWord, { color: theme.primary }]}>
                {scrambledWord}
              </Text>
            </View>
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
                  option === correctAnswer && selectedOption !== null && { backgroundColor: 'rgba(107, 203, 119, 0.3)' }
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
                
                {option === correctAnswer && selectedOption !== null && selectedOption !== option && (
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
    fontWeight: 'bold' as const,
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
    fontWeight: 'bold' as const,
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
    fontWeight: 'bold' as const,
    marginLeft: spacing.xs,
  },
  wordContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  wordLabel: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  scrambledContainer: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  scrambledWord: {
    fontSize: fontSizes.xxl * 1.2,
    fontWeight: 'bold' as const,
    letterSpacing: 8,
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
    fontSize: fontSizes.lg,
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
    fontWeight: 'bold' as const,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold' as const,
    marginBottom: spacing.lg,
  },
  resultScore: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold' as const,
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
    fontWeight: 'bold' as const,
  },
});