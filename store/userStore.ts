import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { achievements } from '@/constants/achievements';
import { trpcClient } from '@/lib/trpc';
import { useAuthStore } from './authStore';

interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  sessions: number;
  streak: number;
  lastSessionDate: string | null;
  totalMinutes: number;
  unlockedAchievements: string[];
  totalDays: number; // 合計使用日数（連続でなくても）
  totalSessions: number; // フォーカスと休憩を含む全セッション数
  activeDays: string[]; // アクティブだった日付の配列
  playedGames: string[]; // プレイしたゲームのID
  gamePlayCount: number; // ゲームをプレイした回数
  teamSessionsCompleted: number; // 完了したチームセッション数
  teamSessionMinutes: number; // チームセッションの合計時間（分）
}

interface UserState extends UserStats {
  addSession: (minutes: number, isTeamSession?: boolean, teamSize?: number) => void;
  checkAchievements: () => string[]; // Returns newly unlocked achievements
  resetProgress: () => void;
  addXp: (amount: number) => void; // For developer mode
  reduceXp: (amount: number) => void; // For developer mode
  unlockAchievement: (achievementId: string) => void; // For developer mode
  checkSpecialAchievements: () => void; // Check time-based and special achievements
  recordGamePlay: (gameId: string) => void; // Record game play
  syncWithBackend: () => Promise<void>; // Sync user data with backend
  loadFromBackend: () => Promise<void>; // Load user data from backend
}

// XP required for each level (index is level - 1)
const XP_REQUIREMENTS = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 
  1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000
];

// Get XP required for a specific level
const getXpForLevel = (level: number): number => {
  if (level <= 0) return 0;
  if (level <= XP_REQUIREMENTS.length) return XP_REQUIREMENTS[level - 1];
  // For levels beyond our predefined list, use a formula
  return 2000 + (level - XP_REQUIREMENTS.length) * 200;
};

// Calculate team session XP multiplier based on team size
const getTeamSessionMultiplier = (teamSize: number): number => {
  if (teamSize <= 1) return 1.0; // Solo session
  if (teamSize === 2) return 1.2; // 2 people: 20% bonus
  if (teamSize === 3) return 1.3; // 3 people: 30% bonus
  if (teamSize === 4) return 1.4; // 4 people: 40% bonus
  return 1.5; // 5+ people: 50% bonus (max)
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      level: 1,
      xp: 0,
      xpToNextLevel: getXpForLevel(1),
      sessions: 0,
      streak: 0,
      lastSessionDate: null,
      totalMinutes: 0,
      unlockedAchievements: [],
      totalDays: 0,
      totalSessions: 0,
      activeDays: [],
      playedGames: [],
      gamePlayCount: 0,
      teamSessionsCompleted: 0,
      teamSessionMinutes: 0,
      
      addSession: (minutes: number, isTeamSession = false, teamSize = 1) => {
        const {
          sessions,
          totalMinutes,
          streak,
          lastSessionDate,
          xp,
          level,
          totalSessions,
          activeDays,
          totalDays,
          teamSessionsCompleted,
          teamSessionMinutes,
        } = get();
        
        // Calculate streak and active days
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        let newStreak = streak;
        let newActiveDays = [...activeDays];
        let newTotalDays = totalDays;
        
        // Update active days
        if (!activeDays.includes(today)) {
          newActiveDays.push(today);
          newTotalDays += 1;
        }
        
        // Update streak
        if (lastSessionDate === yesterday) {
          // Continued streak
          newStreak += 1;
        } else if (lastSessionDate !== today) {
          // Streak broken or first time
          newStreak = 1;
        }
        
        // Add XP for completing a session (base XP + minutes bonus)
        let sessionXp = 20 + Math.floor(minutes / 5) * 5;
        
        // Apply team session multiplier if applicable
        if (isTeamSession && teamSize > 1) {
          const multiplier = getTeamSessionMultiplier(teamSize);
          sessionXp = Math.round(sessionXp * multiplier);
        }
        
        let newXp = xp + sessionXp;
        let newLevel = level;
        let newXpToNextLevel = getXpForLevel(newLevel);
        
        // Check for level up
        while (newXp >= newXpToNextLevel) {
          newXp -= newXpToNextLevel;
          newLevel += 1;
          newXpToNextLevel = getXpForLevel(newLevel);
        }
        
        // Update team session stats if applicable
        const newTeamSessionsCompleted = isTeamSession ? teamSessionsCompleted + 1 : teamSessionsCompleted;
        const newTeamSessionMinutes = isTeamSession ? teamSessionMinutes + minutes : teamSessionMinutes;
        
        set({
          sessions: sessions + 1,
          totalMinutes: totalMinutes + minutes,
          streak: newStreak,
          lastSessionDate: today,
          xp: newXp,
          level: newLevel,
          xpToNextLevel: newXpToNextLevel,
          totalSessions: totalSessions + 1,
          activeDays: newActiveDays,
          totalDays: newTotalDays,
          teamSessionsCompleted: newTeamSessionsCompleted,
          teamSessionMinutes: newTeamSessionMinutes,
        });
        
        // Check for new achievements
        get().checkAchievements();
        
        // Check for special achievements
        get().checkSpecialAchievements();
        
        // Check for team session achievements
        if (isTeamSession) {
          // First team session achievement
          if (newTeamSessionsCompleted === 1 && !get().unlockedAchievements.includes('first_team_session')) {
            get().unlockAchievement('first_team_session');
          }
          
          // Team player achievement (5 team sessions)
          if (newTeamSessionsCompleted === 5 && !get().unlockedAchievements.includes('team_player')) {
            get().unlockAchievement('team_player');
          }
          
          // Team leader achievement (20 team sessions)
          if (newTeamSessionsCompleted === 20 && !get().unlockedAchievements.includes('team_leader')) {
            get().unlockAchievement('team_leader');
          }
          
          // Team champion achievement (50 team sessions)
          if (newTeamSessionsCompleted === 50 && !get().unlockedAchievements.includes('team_champion')) {
            get().unlockAchievement('team_champion');
          }
          
          // Team hours achievements
          if (newTeamSessionMinutes >= 60 && !get().unlockedAchievements.includes('team_hour')) {
            get().unlockAchievement('team_hour');
          }
          
          if (newTeamSessionMinutes >= 300 && !get().unlockedAchievements.includes('team_5_hours')) {
            get().unlockAchievement('team_5_hours');
          }
          
          if (newTeamSessionMinutes >= 1000 && !get().unlockedAchievements.includes('team_master')) {
            get().unlockAchievement('team_master');
          }
        }
      },
      
      checkAchievements: () => {
        const userStats = get();
        const newlyUnlocked: string[] = [];
        
        achievements.forEach(achievement => {
          // Skip if already unlocked
          if (userStats.unlockedAchievements.includes(achievement.id)) {
            return;
          }
          
          let isUnlocked = false;
          
          switch (achievement.type) {
            case 'sessions':
              isUnlocked = userStats.sessions >= achievement.requiredValue;
              break;
            case 'streak':
              isUnlocked = userStats.streak >= achievement.requiredValue;
              break;
            case 'totalMinutes':
              isUnlocked = userStats.totalMinutes >= achievement.requiredValue;
              break;
            case 'level':
              isUnlocked = userStats.level >= achievement.requiredValue;
              break;
            case 'totalDays':
              isUnlocked = userStats.totalDays >= achievement.requiredValue;
              break;
            case 'totalSessions':
              isUnlocked = userStats.totalSessions >= achievement.requiredValue;
              break;
            case 'specialAction':
              // Special cases
              if (achievement.id === 'star_achiever' || achievement.id === 'achievement_hunter' || achievement.id === 'achievement_collector') {
                isUnlocked = userStats.unlockedAchievements.length >= achievement.requiredValue;
              } else if (achievement.id === 'game_explorer') {
                isUnlocked = userStats.playedGames.length >= achievement.requiredValue;
              } else if (achievement.id === 'game_enthusiast') {
                isUnlocked = userStats.playedGames.length >= achievement.requiredValue;
              } else if (achievement.id === 'game_addict') {
                isUnlocked = userStats.gamePlayCount >= achievement.requiredValue;
              }
              break;
            case 'gameScore':
              // Game score achievements would be handled separately
              break;
          }
          
          if (isUnlocked) {
            newlyUnlocked.push(achievement.id);
            
            // Add XP reward for unlocking achievement
            const { xp, level, xpToNextLevel } = userStats;
            
            let achievementReward = achievement.reward;
            
            let newXp = xp + achievementReward;
            let newLevel = level;
            let newXpToNextLevel = xpToNextLevel;
            
            // Check for level up from achievement reward
            while (newXp >= newXpToNextLevel) {
              newXp -= newXpToNextLevel;
              newLevel += 1;
              newXpToNextLevel = getXpForLevel(newLevel);
            }
            
            set({
              unlockedAchievements: [...userStats.unlockedAchievements, achievement.id],
              xp: newXp,
              level: newLevel,
              xpToNextLevel: newXpToNextLevel,
            });
          }
        });
        
        return newlyUnlocked;
      },
      
      checkSpecialAchievements: () => {
        const userStats = get();
        const now = new Date();
        const hour = now.getHours();
        const dayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        
        // Night Owl achievement
        if (hour >= 22 || hour < 4) {
          if (!userStats.unlockedAchievements.includes('night_owl')) {
            get().unlockAchievement('night_owl');
          }
        }
        
        // Early Bird achievement
        if (hour < 6) {
          if (!userStats.unlockedAchievements.includes('early_bird')) {
            get().unlockAchievement('early_bird');
          }
        }
        
        // Weekend Warrior logic would need to track sessions completed on weekends
        // This is simplified here
        if (isWeekend) {
          // In a real implementation, you would track weekend sessions separately
          // For now, we'll just unlock it if they complete a session on the weekend
          if (!userStats.unlockedAchievements.includes('weekend_warrior')) {
            get().unlockAchievement('weekend_warrior');
          }
        }
        
        // Morning Routine (6am-9am)
        if (hour >= 6 && hour < 9) {
          if (!userStats.unlockedAchievements.includes('morning_routine')) {
            // In a real implementation, you would track morning sessions
            // For simplicity, we'll just unlock it
            get().unlockAchievement('morning_routine');
          }
        }
        
        // Lunch Break Hero (12pm-1pm)
        if (hour >= 12 && hour < 13) {
          if (!userStats.unlockedAchievements.includes('lunch_break_hero')) {
            get().unlockAchievement('lunch_break_hero');
          }
        }
        
        // Evening Scholar (5pm-8pm)
        if (hour >= 17 && hour < 20) {
          if (!userStats.unlockedAchievements.includes('evening_scholar')) {
            // In a real implementation, you would track evening sessions
            // For simplicity, we'll just unlock it
            get().unlockAchievement('evening_scholar');
          }
        }
        
        // Holiday Hustler would need a holiday calendar
        // Marathon Master would need to track daily sessions
        // Perfect Week would need to track daily sessions for a week
      },
      

      resetProgress: () => {
        
        set({
          level: 1,
          xp: 0,
          xpToNextLevel: getXpForLevel(1),
          sessions: 0,
          streak: 0,
          lastSessionDate: null,
          totalMinutes: 0,
          unlockedAchievements: [],
          totalDays: 0,
          totalSessions: 0,
          activeDays: [],
          playedGames: [],
          gamePlayCount: 0,
          teamSessionsCompleted: 0,
          teamSessionMinutes: 0,
        });
      },
      
      // Sync with backend
      syncWithBackend: async () => {
        try {
          const state = get();
          const userId = useAuthStore.getState().user?.id;
          await trpcClient.user.updateProfile.mutate({
            userId,
            level: state.level,
            xp: state.xp,
            xpToNextLevel: state.xpToNextLevel,
            sessions: state.sessions,
            streak: state.streak,
            lastSessionDate: state.lastSessionDate,
            totalMinutes: state.totalMinutes,
            unlockedAchievements: state.unlockedAchievements,
            totalDays: state.totalDays,
            totalSessions: state.totalSessions,
            activeDays: state.activeDays,
            playedGames: state.playedGames,
            gamePlayCount: state.gamePlayCount,
            teamSessionsCompleted: state.teamSessionsCompleted,
            teamSessionMinutes: state.teamSessionMinutes,
          });
          console.log('[USER] Synced with backend');
        } catch (error) {
          console.error('[USER] Failed to sync with backend:', error);
        }
      },
      
      // Load from backend
      loadFromBackend: async () => {
        try {
          const userId = useAuthStore.getState().user?.id;
          const profile = await trpcClient.user.getProfile.query({ userId });
          set({
            level: profile.level,
            xp: profile.xp,
            xpToNextLevel: profile.xpToNextLevel,
            sessions: profile.sessions,
            streak: profile.streak,
            lastSessionDate: profile.lastSessionDate,
            totalMinutes: profile.totalMinutes,
            unlockedAchievements: profile.unlockedAchievements,
            totalDays: profile.totalDays,
            totalSessions: profile.totalSessions,
            activeDays: profile.activeDays,
            playedGames: profile.playedGames,
            gamePlayCount: profile.gamePlayCount,
            teamSessionsCompleted: profile.teamSessionsCompleted,
            teamSessionMinutes: profile.teamSessionMinutes,
          });
          console.log('[USER] Loaded from backend');
        } catch (error) {
          console.error('[USER] Failed to load from backend:', error);
        }
      },
      
      // Record game play
      recordGamePlay: (gameId: string) => {
        const { playedGames, gamePlayCount } = get();
        
        // Add game to played games if not already there
        let newPlayedGames = [...playedGames];
        if (!playedGames.includes(gameId)) {
          newPlayedGames.push(gameId);
        }
        
        // Increment game play count
        const newGamePlayCount = gamePlayCount + 1;
        
        set({
          playedGames: newPlayedGames,
          gamePlayCount: newGamePlayCount
        });
        
        // Check for game-related achievements
        if (newPlayedGames.length >= 3 && !get().unlockedAchievements.includes('game_explorer')) {
          get().unlockAchievement('game_explorer');
        }
        
        if (newPlayedGames.length >= 7 && !get().unlockedAchievements.includes('game_enthusiast')) {
          get().unlockAchievement('game_enthusiast');
        }
        
        if (newGamePlayCount >= 50 && !get().unlockedAchievements.includes('game_addict')) {
          get().unlockAchievement('game_addict');
        }
        
        // Sync with backend
        get().syncWithBackend();
      },
      
      // Developer mode functions
      addXp: (amount: number) => {
        const { xp, level, xpToNextLevel } = get();
        let newXp = xp + amount;
        let newLevel = level;
        let newXpToNextLevel = xpToNextLevel;
        
        // Check for level up
        while (newXp >= newXpToNextLevel) {
          newXp -= newXpToNextLevel;
          newLevel += 1;
          newXpToNextLevel = getXpForLevel(newLevel);
        }
        
        set({
          xp: newXp,
          level: newLevel,
          xpToNextLevel: newXpToNextLevel,
        });
        
        // Check for level-based achievements
        get().checkAchievements();
        
        // Sync with backend
        get().syncWithBackend();
      },
      
      reduceXp: (amount: number) => {
        const { xp, level } = get();
        
        if (level === 1 && xp < amount) {
          // Can't go below level 1 with 0 XP
          set({ xp: 0 });
          return;
        }
        
        let newXp = xp - amount;
        let newLevel = level;
        
        // Handle level down if XP goes negative
        while (newXp < 0 && newLevel > 1) {
          newLevel -= 1;
          newXp += getXpForLevel(newLevel);
        }
        
        // Ensure XP doesn't go below 0 at level 1
        if (newLevel === 1 && newXp < 0) {
          newXp = 0;
        }
        
        set({
          xp: newXp,
          level: newLevel,
          xpToNextLevel: getXpForLevel(newLevel),
        });
      },
      
      unlockAchievement: (achievementId: string) => {
        const { unlockedAchievements } = get();
        
        // Skip if already unlocked
        if (unlockedAchievements.includes(achievementId)) {
          return;
        }
        
        // Find the achievement
        const achievement = achievements.find(a => a.id === achievementId);
        if (!achievement) return;
        
        // Add XP reward
        const { xp, level, xpToNextLevel } = get();
        let newXp = xp + achievement.reward;
        let newLevel = level;
        let newXpToNextLevel = xpToNextLevel;
        
        // Check for level up
        while (newXp >= newXpToNextLevel) {
          newXp -= newXpToNextLevel;
          newLevel += 1;
          newXpToNextLevel = getXpForLevel(newLevel);
        }
        
        set({
          unlockedAchievements: [...unlockedAchievements, achievementId],
          xp: newXp,
          level: newLevel,
          xpToNextLevel: newXpToNextLevel,
        });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);