import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getStorageInterface } from '../src/utils/storage';
import { achievements } from '@/constants/achievements';
import { CharacterType, determineCharacterType, getCharacterByEvolutionPath } from '@/constants/characters';
import { useAuthStore } from './authStore';
import { userService, characterService, achievementService } from '../src/services/supabaseService';
import { supabase } from '../src/lib/supabase';

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
  characterType: CharacterType; // キャラクターのタイプ
  characterLevel: number; // キャラクターのレベル
  characterExp: number; // キャラクター進化用の経験値
  characterEvolutionPath: CharacterType[]; // 進化の履歴
  playedGames: string[]; // プレイしたゲームのID
  gamePlayCount: number; // ゲームをプレイした回数
  activeAbilities: string[]; // 有効化されている特殊能力のID
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
  evolveCharacter: () => void; // Evolve character if conditions are met
  recordGamePlay: (gameId: string) => void; // Record game play
  applyCharacterAbility: (abilityId: string) => void; // Apply character ability
  syncWithBackend: () => Promise<void>; // Sync user data with backend
  loadUserData: () => Promise<void>; // Load user data from backend
  unlockCharacterFromBackend: (characterId: string) => Promise<void>; // Unlock character via API
  selectCharacterBackend: (characterId: string) => Promise<void>; // Select character via API
  
  // Additional methods needed by other stores
  updateStats: (stats: Partial<UserStats>) => void;
  enableDemoMode: () => void;
  resetStats: () => void;
  completeSession: (duration: number, type: 'focus' | 'break') => void;
  addBreakActivity: (activity: string) => void;
  
  // Stats namespace for compatibility
  stats: {
    addXP: (amount: number) => void;
    addCoins: (amount: number) => void;
    updateAchievements: (achievementIds: string[]) => void;
  };
}

// XP required for each level (index is level - 1)
const XP_REQUIREMENTS = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 
  1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000,
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
      characterType: 'balanced',
      characterLevel: 1,
      characterExp: 0,
      characterEvolutionPath: ['balanced'],
      playedGames: [],
      gamePlayCount: 0,
      activeAbilities: [],
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
          characterExp,
          activeAbilities,
          teamSessionsCompleted,
          teamSessionMinutes,
        } = get();
        
        // Calculate streak and active days
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        let newStreak = streak;
        const newActiveDays = [...activeDays];
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
          // Check for streak protection ability
          const character = getCharacterByEvolutionPath(get().characterEvolutionPath, get().characterLevel);
          const hasStreakProtection = character.abilities.some(
            ability => ability.type === 'streakProtection' && ability.isActive,
          );
          
          if (hasStreakProtection && lastSessionDate && 
              new Date(lastSessionDate).getTime() > Date.now() - 172800000) { // Within 48 hours
            // Streak protected
            newStreak += 1;
          } else {
            // Streak broken or first time
            newStreak = 1;
          }
        }
        
        // Add XP for completing a session (base XP + minutes bonus)
        let sessionXp = 20 + Math.floor(minutes / 5) * 5;
        
        // Apply team session multiplier if applicable
        if (isTeamSession && teamSize > 1) {
          const multiplier = getTeamSessionMultiplier(teamSize);
          sessionXp = Math.round(sessionXp * multiplier);
        }
        
        // Apply XP boost from character abilities if any
        const character = getCharacterByEvolutionPath(get().characterEvolutionPath, get().characterLevel);
        const xpBoostAbility = character.abilities.find(
          ability => ability.type === 'xpBoost' && ability.isActive,
        );
        
        if (xpBoostAbility) {
          sessionXp = Math.round(sessionXp * (1 + xpBoostAbility.value / 100));
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
        
        // Update character exp
        const newCharacterExp = characterExp + Math.floor(minutes / 2);
        
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
          characterExp: newCharacterExp,
          teamSessionsCompleted: newTeamSessionsCompleted,
          teamSessionMinutes: newTeamSessionMinutes,
        });
        
        // Check for character evolution
        get().evolveCharacter();
        
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
        
        // Sync with Supabase backend
        get().syncWithBackend().catch(error => {
          console.error('バックエンド同期エラー:', error);
        });
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
            const { xp, level, xpToNextLevel, activeAbilities } = userStats;
            
            // Apply achievement boost from character abilities if any
            let achievementReward = achievement.reward;
            const character = getCharacterByEvolutionPath(get().characterEvolutionPath, get().characterLevel);
            const achievementBoostAbility = character.abilities.find(
              ability => ability.type === 'achievementBoost' && ability.isActive,
            );
            
            if (achievementBoostAbility) {
              achievementReward = Math.round(achievementReward * (1 + achievementBoostAbility.value / 100));
            }
            
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
      
      evolveCharacter: () => {
        const {
          characterLevel,
          characterExp,
          characterType,
          characterEvolutionPath,
          sessions,
          streak,
          totalDays,
        } = get();
        
        // Get current character data
        const character = getCharacterByEvolutionPath(characterEvolutionPath, characterLevel);
        
        if (!character || !character.nextEvolutionExp) {
          return; // Already at max evolution or invalid character
        }
        
        // Check if enough exp to evolve
        if (characterExp >= character.nextEvolutionExp) {
          // Determine new character type based on recent stats
          const newType = determineCharacterType(sessions, streak, totalDays);
          
          // Create new evolution path
          const newEvolutionPath = [...characterEvolutionPath, newType];
          
          // Update character
          set({
            characterLevel: characterLevel + 1,
            characterExp: 0, // Reset exp after evolution
            characterType: newType,
            characterEvolutionPath: newEvolutionPath,
          });
          
          // Unlock character evolution achievement
          if (characterLevel === 1) {
            get().unlockAchievement('character_evolution_1');
          } else if (characterLevel === 2) {
            get().unlockAchievement('character_evolution_2');
          } else if (characterLevel === 3) {
            get().unlockAchievement('character_evolution_3');
          } else if (characterLevel === 4) {
            get().unlockAchievement('character_evolution_4');
          }
          
          // Unlock character type achievement
          if (newType === 'balanced' && !get().unlockedAchievements.includes('balanced_character')) {
            get().unlockAchievement('balanced_character');
          } else if (newType === 'focused' && !get().unlockedAchievements.includes('focused_character')) {
            get().unlockAchievement('focused_character');
          } else if (newType === 'consistent' && !get().unlockedAchievements.includes('consistent_character')) {
            get().unlockAchievement('consistent_character');
          }
          
          // Check for character collector achievement
          const uniqueTypes = new Set(characterEvolutionPath);
          if (uniqueTypes.size >= 3 && !get().unlockedAchievements.includes('character_collector')) {
            get().unlockAchievement('character_collector');
          }
          
          // Check for evolution master achievement
          if (characterLevel + 1 === 5 && !get().unlockedAchievements.includes('evolution_master')) {
            get().unlockAchievement('evolution_master');
          }
        }
      },
      
      // Apply character ability
      applyCharacterAbility: (abilityId: string) => {
        const { activeAbilities } = get();
        
        // Check if ability is already active
        if (activeAbilities.includes(abilityId)) {
          // Deactivate ability
          set({
            activeAbilities: activeAbilities.filter(id => id !== abilityId),
          });
        } else {
          // Activate ability
          set({
            activeAbilities: [...activeAbilities, abilityId],
          });
        }
      },
      
      resetProgress: () => {
        // Get the current user from auth store to maintain the connection
        const { user } = useAuthStore.getState();
        
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
          characterType: 'balanced',
          characterLevel: 1,
          characterExp: 0,
          characterEvolutionPath: ['balanced'],
          playedGames: [],
          gamePlayCount: 0,
          activeAbilities: [],
          teamSessionsCompleted: 0,
          teamSessionMinutes: 0,
        });
      },
      
      // Record game play
      recordGamePlay: (gameId: string) => {
        const { playedGames, gamePlayCount } = get();
        
        // Add game to played games if not already there
        const newPlayedGames = [...playedGames];
        if (!playedGames.includes(gameId)) {
          newPlayedGames.push(gameId);
        }
        
        // Increment game play count
        const newGamePlayCount = gamePlayCount + 1;
        
        set({
          playedGames: newPlayedGames,
          gamePlayCount: newGamePlayCount,
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
      
      syncWithBackend: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        try {
          const state = get();
          
          // Update stats in Supabase (snake_case fields)
          await userService.updateStats({
            level: state.level,
            experience: state.xp,
            streak_days: state.streak,
            total_focus_time: state.totalMinutes,
            focus_time_today: state.totalMinutes, // This would need proper daily tracking
          });
          
          // Check for new achievements
          const newAchievements = await achievementService.checkAchievements();
          if (newAchievements.length > 0) {
            console.log('新しいアチーブメント:', newAchievements);
          }
        } catch (error) {
          console.error('バックエンド同期エラー:', error);
        }
      },
      
      loadUserData: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        try {
          // Load user profile from Supabase
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (!profile) return;
          
          // Load achievements
          const userAchievements = await achievementService.getUserAchievements();
          
          // Load characters
          const userCharacters = await characterService.getUserCharacters();
          const activeCharacter = userCharacters?.find((c: any) => c.is_active);
          
          // Helper function to map character ID to type
          const getCharacterTypeFromId = (id: string): CharacterType => {
            if (id.includes('focused')) return 'focused';
            if (id.includes('consistent')) return 'consistent';
            return 'balanced';
          };
          
          // Update local state with Supabase data
          set({
            level: profile.level || 1,
            xp: profile.experience || 0,
            xpToNextLevel: getXpForLevel(profile.level || 1),
            streak: profile.streak_days || 0,
            totalMinutes: profile.total_focus_time || 0,
            unlockedAchievements: userAchievements?.map((a: any) => a.achievement_id) || [],
            // Character data from active character
            characterType: activeCharacter ? getCharacterTypeFromId(activeCharacter.character_id) : 'balanced',
            characterLevel: activeCharacter?.level || 1,
            characterExp: activeCharacter?.experience || 0,
          });
          
          // Load session stats
          const { count: sessionCount } = await supabase
            .from('sessions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'completed');
          
          set({ sessions: sessionCount || 0 });
        } catch (error) {
          console.error('ユーザーデータ読み込みエラー:', error);
        }
      },
      
      unlockCharacterFromBackend: async (characterId: string) => {
        try {
          await characterService.unlockCharacter(characterId);
          
          // Reload user data to get updated character list
          await get().loadUserData();
        } catch (error) {
          console.error('キャラクター解除エラー:', error);
          throw error;
        }
      },
      
      selectCharacterBackend: async (characterId: string) => {
        try {
          await characterService.setActiveCharacter(characterId);
          
          // Helper function to map character ID to type
          const getCharacterTypeFromId = (id: string): CharacterType => {
            if (id.includes('focused')) return 'focused';
            if (id.includes('consistent')) return 'consistent';
            return 'balanced';
          };
          
          // Update local state
          const characterType = getCharacterTypeFromId(characterId);
          set({
            characterType,
            characterLevel: 1,
            characterExp: 0,
            characterEvolutionPath: [characterType],
          });
        } catch (error) {
          console.error('キャラクター選択エラー:', error);
          throw error;
        }
      },
      
      // Additional methods needed by other stores
      updateStats: (stats: Partial<UserStats>) => {
        set(stats);
      },
      
      enableDemoMode: () => {
        // Enable demo mode with sample data
        set({
          level: 5,
          xp: 1200,
          xpToNextLevel: getXpForLevel(5),
          sessions: 50,
          streak: 7,
          totalMinutes: 1500,
          unlockedAchievements: ['first_session', 'streak_3', 'sessions_10'],
          totalDays: 15,
          totalSessions: 75,
        });
      },
      
      resetStats: () => {
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
          characterType: 'balanced',
          characterLevel: 1,
          characterExp: 0,
          characterEvolutionPath: ['balanced'],
          playedGames: [],
          gamePlayCount: 0,
          activeAbilities: [],
          teamSessionsCompleted: 0,
          teamSessionMinutes: 0,
        });
      },
      
      completeSession: (duration: number, type: 'focus' | 'break') => {
        const isTeamSession = false; // Default to individual session
        get().addSession(duration, isTeamSession);
      },
      
      addBreakActivity: (activity: string) => {
        // Log break activity (can be extended to track break activities)
        console.log(`Break activity: ${activity}`);
        // Could add to a breakActivities array if needed
      },
      
      // Stats namespace for compatibility
      stats: {
        addXP: (amount: number) => {
          get().addXp(amount);
        },
        
        addCoins: (amount: number) => {
          const currentLevel = get().level;
          const currentXp = get().xp;
          // Convert coins to XP (1 coin = 10 XP for now)
          get().addXp(amount * 10);
        },
        
        updateAchievements: (achievementIds: string[]) => {
          achievementIds.forEach(id => {
            get().unlockAchievement(id);
          });
        },
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => getStorageInterface()),
    },
  ),
);