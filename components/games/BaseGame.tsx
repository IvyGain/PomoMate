import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTimerStore } from '../../store/timerStore';
import { useUserStore } from '../../store/userStore';
import { logger } from '../../src/utils/logger';

interface BaseGameProps {
  children: React.ReactNode;
  gameName: string;
  onGameOver: (score: number) => void;
  score: number;
  lives?: number;
  maxLives?: number;
}

interface GameOverModalProps {
  visible: boolean;
  score: number;
  xpEarned: number;
  coinsEarned: number;
  isNewHighScore: boolean;
  onPlayAgain: () => void;
  onExit: () => void;
}

const gameLogger = logger.child('BaseGame');

export const GameOverModal: React.FC<GameOverModalProps> = ({
  visible,
  score,
  xpEarned,
  coinsEarned,
  isNewHighScore,
  onPlayAgain,
  onExit,
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onExit}
  >
    <View className="flex-1 bg-black/80 justify-center items-center p-4">
      <View className="bg-gray-800 rounded-3xl p-6 w-full max-w-sm">
        <Text className="text-3xl font-bold text-white text-center mb-2">
          ゲームオーバー
        </Text>
        
        {isNewHighScore && (
          <View className="bg-yellow-500/20 rounded-lg p-2 mb-4">
            <Text className="text-yellow-400 text-center font-semibold">
              🎉 新記録達成！
            </Text>
          </View>
        )}
        
        <View className="mb-6">
          <Text className="text-gray-400 text-center mb-2">スコア</Text>
          <Text className="text-4xl font-bold text-white text-center">
            {score}
          </Text>
        </View>
        
        <View className="flex-row justify-around mb-6">
          <View className="items-center">
            <View className="flex-row items-center">
              <Ionicons name="star" size={20} color="#fbbf24" />
              <Text className="text-yellow-400 font-semibold ml-1">
                +{xpEarned} XP
              </Text>
            </View>
          </View>
          <View className="items-center">
            <View className="flex-row items-center">
              <Ionicons name="logo-bitcoin" size={20} color="#fbbf24" />
              <Text className="text-yellow-400 font-semibold ml-1">
                +{coinsEarned}
              </Text>
            </View>
          </View>
        </View>
        
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={onPlayAgain}
            className="flex-1 bg-blue-600 py-3 rounded-xl"
          >
            <Text className="text-white text-center font-semibold">
              もう一度
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onExit}
            className="flex-1 bg-gray-700 py-3 rounded-xl"
          >
            <Text className="text-white text-center font-semibold">
              終了
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export const BaseGame: React.FC<BaseGameProps> = ({
  children,
  gameName,
  onGameOver,
  score,
  lives = 0,
  maxLives = 3,
}) => {
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameStats, setGameStats] = useState({
    xpEarned: 0,
    coinsEarned: 0,
    isNewHighScore: false,
  });
  
  const timerStore = useTimerStore();
  const userStore = useUserStore();
  const { stats, recordGamePlay } = userStore;
  
  const calculateRewards = useCallback((finalScore: number) => {
    const xp = Math.floor(finalScore / 10) * 5;
    const coins = Math.floor(finalScore / 50) + 1;
    
    return { xp, coins };
  }, []);
  
  const handleGameEnd = useCallback(() => {
    gameLogger.info('Game ended', { gameName, score });
    
    const { xp, coins } = calculateRewards(score);
    const previousHighScore = 0; // Will be tracked in backend
    const isNewHighScore = score > previousHighScore;
    
    // Update stats using the stats namespace
    stats.addXP(xp);
    stats.addCoins(coins);
    
    // Record game play
    recordGamePlay(gameName);
    
    // Log break activity if in break mode
    if (timerStore.currentMode !== 'focus') {
      timerStore.addBreakActivity(`Played ${gameName} - Score: ${score}`);
    }
    
    // Check for high score achievement
    if (isNewHighScore) {
      const achId = `game_${gameName}_highscore`;
      stats.updateAchievements([achId]);
    }
    
    setGameStats({ xpEarned: xp, coinsEarned: coins, isNewHighScore });
    setShowGameOver(true);
    onGameOver(score);
  }, [score, gameName, calculateRewards, stats, recordGamePlay, timerStore, onGameOver]);
  
  useEffect(() => {
    if (lives === 0 && maxLives > 0) {
      handleGameEnd();
    }
  }, [lives, maxLives, handleGameEnd]);
  
  const handlePlayAgain = () => {
    setShowGameOver(false);
    // Parent component should reset the game
  };
  
  const handleExit = () => {
    setShowGameOver(false);
    // Parent component should handle navigation
  };
  
  return (
    <>
      <View className="flex-1">
        {/* Game Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <Text className="text-gray-400 mr-2">スコア:</Text>
            <Text className="text-2xl font-bold text-white">{score}</Text>
          </View>
          
          {maxLives > 0 && (
            <View className="flex-row">
              {[...Array(maxLives)].map((_, i) => (
                <Ionicons
                  key={i}
                  name="heart"
                  size={24}
                  color={i < lives ? '#ef4444' : '#374151'}
                  style={{ marginLeft: i > 0 ? 4 : 0 }}
                />
              ))}
            </View>
          )}
        </View>
        
        {/* Game Content */}
        {children}
      </View>
      
      <GameOverModal
        visible={showGameOver}
        score={score}
        xpEarned={gameStats.xpEarned}
        coinsEarned={gameStats.coinsEarned}
        isNewHighScore={gameStats.isNewHighScore}
        onPlayAgain={handlePlayAgain}
        onExit={handleExit}
      />
    </>
  );
};