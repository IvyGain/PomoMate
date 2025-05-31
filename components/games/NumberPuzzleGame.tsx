import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { colors, spacing, fontSizes, borderRadius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { Award, Clock, X, Zap } from 'lucide-react-native';

interface Tile {
  value: number;
  position: number;
}

export const NumberPuzzleGame: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [emptyPosition, setEmptyPosition] = useState(15);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  
  const { unlockAchievement } = useUserStore();
  const { updateHighScore, games } = useGameStore();
  
  // 現在のゲームのハイスコアを取得
  const currentGame = games.find(game => game.id === 'number_puzzle');
  const highScore = currentGame ? currentGame.highScore : 0;
  
  // ゲーム初期化
  useEffect(() => {
    initGame();
  }, []);
  
  const initGame = () => {
    // 1-15のタイルを作成し、シャッフル
    let newTiles: Tile[] = Array.from({ length: 15 }, (_, i) => ({
      value: i + 1,
      position: i
    }));
    
    // 解けるパズルになるようにシャッフル
    do {
      newTiles = shuffleTiles(newTiles);
    } while (!isSolvable(newTiles));
    
    setTiles(newTiles);
    setEmptyPosition(15);
    setMoves(0);
    setGameOver(false);
    setStartTime(Date.now());
    setEndTime(0);
  };
  
  // タイルをシャッフル
  const shuffleTiles = (tiles: Tile[]): Tile[] => {
    const shuffled = [...tiles];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      
      // positionを更新
      shuffled[i].position = i;
      shuffled[j].position = j;
    }
    return shuffled;
  };
  
  // パズルが解けるかチェック（偶数の転倒数なら解ける）
  const isSolvable = (tiles: Tile[]): boolean => {
    let inversions = 0;
    for (let i = 0; i < tiles.length; i++) {
      for (let j = i + 1; j < tiles.length; j++) {
        if (tiles[i].value > tiles[j].value) {
          inversions++;
        }
      }
    }
    return inversions % 2 === 0;
  };
  
  // タイルをクリックした時の処理
  const handleTilePress = (position: number) => {
    if (gameOver) return;
    
    // 空白の隣のタイルかチェック
    if (!isAdjacent(position, emptyPosition)) return;
    
    // タイルを移動
    const newTiles = [...tiles];
    const tileIndex = newTiles.findIndex(t => t.position === position);
    
    if (tileIndex !== -1) {
      newTiles[tileIndex].position = emptyPosition;
      setEmptyPosition(position);
      setTiles(newTiles);
      setMoves(moves + 1);
      
      // ゲームクリアチェック
      if (isGameComplete(newTiles)) {
        setGameOver(true);
        setEndTime(Date.now());
        
        // スコア計算
        const timeBonus = Math.max(0, 120 - Math.floor((Date.now() - startTime) / 1000));
        const score = Math.max(1, 200 - moves) + timeBonus;
        
        // ハイスコア更新
        if (score > highScore) {
          updateHighScore('number_puzzle', score);
          
          // 実績解除
          if (score >= 150) {
            unlockAchievement('puzzle_master');
          }
        }
      }
    }
  };
  
  // 隣接しているかチェック
  const isAdjacent = (pos1: number, pos2: number): boolean => {
    const row1 = Math.floor(pos1 / 4);
    const col1 = pos1 % 4;
    const row2 = Math.floor(pos2 / 4);
    const col2 = pos2 % 4;
    
    return (
      (Math.abs(row1 - row2) === 1 && col1 === col2) ||
      (Math.abs(col1 - col2) === 1 && row1 === row2)
    );
  };
  
  // ゲームクリアチェック
  const isGameComplete = (tiles: Tile[]): boolean => {
    return tiles.every(tile => tile.value === tile.position + 1);
  };
  
  // ゲーム時間の計算
  const getGameTime = () => {
    const totalTime = endTime > 0 ? endTime - startTime : Date.now() - startTime;
    return Math.floor(totalTime / 1000);
  };
  
  // スコア計算
  const calculateScore = () => {
    const timeBonus = Math.max(0, 120 - getGameTime());
    return Math.max(1, 200 - moves) + timeBonus;
  };
  
  // 画面サイズに基づいてタイルサイズを計算
  const screenWidth = Dimensions.get('window').width;
  const tileSize = (screenWidth - (spacing.md * 2) - (spacing.xs * 8)) / 4;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>数字パズル</Text>
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
          <View style={styles.puzzleContainer}>
            {Array.from({ length: 16 }).map((_, position) => {
              const tile = tiles.find(t => t.position === position);
              
              if (position === emptyPosition) {
                return (
                  <View 
                    key={position} 
                    style={[
                      styles.tile, 
                      styles.emptyTile,
                      { width: tileSize, height: tileSize }
                    ]} 
                  />
                );
              }
              
              return (
                <TouchableOpacity
                  key={position}
                  style={[
                    styles.tile,
                    { width: tileSize, height: tileSize }
                  ]}
                  onPress={() => handleTilePress(position)}
                >
                  <Text style={styles.tileText}>{tile?.value}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={initGame}
          >
            <Text style={styles.resetButtonText}>リセット</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameOverContainer}>
          <Award size={48} color={colors.primary} />
          <Text style={styles.gameOverTitle}>ゲームクリア！</Text>
          <Text style={styles.gameOverScore}>スコア: {calculateScore()}</Text>
          <Text style={styles.gameOverStats}>手数: {moves} / 時間: {getGameTime()}秒</Text>
          
          {calculateScore() > highScore && (
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
    alignItems: 'center',
  },
  puzzleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  tile: {
    margin: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTile: {
    backgroundColor: 'transparent',
  },
  tileText: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    color: colors.text,
  },
  resetButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.xl,
  },
  resetButtonText: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: fontSizes.md,
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
    color: colors.text,
    marginBottom: spacing.sm,
  },
  gameOverStats: {
    fontSize: fontSizes.md,
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