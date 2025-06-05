import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getStorageInterface } from '../src/utils/storage';

export interface Game {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  highScore: number;
  unlockCondition: {
    type: 'level' | 'achievement' | 'default';
    value: string | number;
    description: string;
  };
  // Added new properties for GameSelector component
  icon?: string;
  difficulty?: string;
  image?: string;
}

interface GameState {
  games: Game[];
  unlockedGames: string[];
  selectedGame: string | null;
  
  // Actions
  unlockGame: (gameId: string) => void;
  selectGame: (gameId: string) => void;
  updateHighScore: (gameId: string, score: number) => void;
  checkUnlockConditions: (level: number, achievements: string[]) => string[];
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      games: [
        {
          id: 'tap_target',
          name: 'タップターゲット',
          description: '制限時間内にできるだけ多くのターゲットをタップしよう！',
          unlocked: true, // デフォルトで解放
          highScore: 0,
          unlockCondition: {
            type: 'default',
            value: 'default',
            description: '最初から遊べます'
          },
          icon: '🎯',
          difficulty: '簡単',
          image: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'memory_match',
          name: 'メモリーマッチ',
          description: 'カードをめくって同じ絵柄のペアを見つけよう！',
          unlocked: false,
          highScore: 0,
          unlockCondition: {
            type: 'level',
            value: 3,
            description: 'レベル3に到達する'
          },
          icon: '🃏',
          difficulty: '普通',
          image: 'https://images.unsplash.com/photo-1605870445919-838d190e8e1b?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'number_puzzle',
          name: '数字パズル',
          description: '数字を順番に並べよう！',
          unlocked: false,
          highScore: 0,
          unlockCondition: {
            type: 'level',
            value: 5,
            description: 'レベル5に到達する'
          },
          icon: '🔢',
          difficulty: '普通',
          image: 'https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'pattern_memory',
          name: 'パターンメモリー',
          description: '光るパターンを記憶して再現しよう！',
          unlocked: false,
          highScore: 0,
          unlockCondition: {
            type: 'achievement',
            value: 'focus_master',
            description: '「集中マスター」の実績を解除する'
          },
          icon: '🧠',
          difficulty: '難しい',
          image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'anagram',
          name: 'アナグラム',
          description: '単語の文字を並べ替えて新しい単語を作ろう！',
          unlocked: false,
          highScore: 0,
          unlockCondition: {
            type: 'achievement',
            value: 'consistency_pro',
            description: '「継続のプロ」の実績を解除する'
          },
          icon: '📝',
          difficulty: '難しい',
          image: 'https://images.unsplash.com/photo-1544396821-4dd40b938ad3?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'math_challenge',
          name: '計算チャレンジ',
          description: '制限時間内にできるだけ多くの計算問題を解こう！',
          unlocked: false,
          highScore: 0,
          unlockCondition: {
            type: 'level',
            value: 8,
            description: 'レベル8に到達する'
          },
          icon: '🧮',
          difficulty: '普通',
          image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'color_match',
          name: 'カラーマッチ',
          description: '表示された色の名前と実際の色が一致しているかを判断しよう！',
          unlocked: false,
          highScore: 0,
          unlockCondition: {
            type: 'achievement',
            value: 'time_wizard',
            description: '「タイムウィザード」の実績を解除する'
          },
          icon: '🎨',
          difficulty: '簡単',
          image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000&auto=format&fit=crop'
        },
        {
          id: 'word_scramble',
          name: '単語スクランブル',
          description: '表示される単語の正しい意味を選んでください。',
          unlocked: true,
          highScore: 0,
          unlockCondition: {
            type: 'default',
            value: 'default',
            description: '最初から遊べます'
          },
          icon: '📚',
          difficulty: '普通',
          image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1000&auto=format&fit=crop'
        }
      ],
      unlockedGames: ['tap_target', 'word_scramble'],
      selectedGame: null,
      
      unlockGame: (gameId: string) => set((state) => {
        // ゲームが既に解放されている場合は何もしない
        if (state.unlockedGames.includes(gameId)) {
          return state;
        }
        
        // ゲームを解放する
        const updatedGames = state.games.map(game => 
          game.id === gameId ? { ...game, unlocked: true } : game
        );
        
        return {
          games: updatedGames,
          unlockedGames: [...state.unlockedGames, gameId]
        };
      }),
      
      selectGame: (gameId: string) => set({ selectedGame: gameId }),
      
      updateHighScore: (gameId: string, score: number) => set((state) => {
        const updatedGames = state.games.map(game => 
          game.id === gameId && score > game.highScore 
            ? { ...game, highScore: score } 
            : game
        );
        
        return { games: updatedGames };
      }),
      
      checkUnlockConditions: (level: number, achievements: string[]) => {
        const { games, unlockGame, unlockedGames } = get();
        const newlyUnlocked: string[] = [];
        
        games.forEach(game => {
          // 既に解放されているゲームはスキップ
          if (game.unlocked || unlockedGames.includes(game.id)) {
            return;
          }
          
          let shouldUnlock = false;
          
          // 解放条件をチェック
          if (game.unlockCondition.type === 'level') {
            // 型アサーションを使用して、valueがnumberであることを保証
            const levelValue = game.unlockCondition.value as number;
            if (level >= levelValue) {
              shouldUnlock = true;
            }
          } else if (game.unlockCondition.type === 'achievement') {
            // 型アサーションを使用して、valueがstringであることを保証
            const achievementId = game.unlockCondition.value as string;
            if (achievements.includes(achievementId)) {
              shouldUnlock = true;
            }
          }
          
          if (shouldUnlock) {
            unlockGame(game.id);
            newlyUnlocked.push(game.id);
          }
        });
        
        return newlyUnlocked;
      }
    }),
    {
      name: 'game-storage',
      storage: createJSONStorage(() => getStorageInterface()),
    }
  )
);