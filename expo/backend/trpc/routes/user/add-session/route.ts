import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/memory-db";

const getXpForLevel = (level: number): number => {
  const XP_REQUIREMENTS = [
    100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 
    1100, 1200, 1300, 1400, 1500, 1600, 1700, 1800, 1900, 2000
  ];
  
  if (level <= 0) return 0;
  if (level <= XP_REQUIREMENTS.length) return XP_REQUIREMENTS[level - 1];
  return 2000 + (level - XP_REQUIREMENTS.length) * 200;
};

const getTeamSessionMultiplier = (teamSize: number): number => {
  if (teamSize <= 1) return 1.0;
  if (teamSize === 2) return 1.2;
  if (teamSize === 3) return 1.3;
  if (teamSize === 4) return 1.4;
  return 1.5;
};

export const addSessionProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().optional(),
      minutes: z.number(),
      isTeamSession: z.boolean().optional(),
      teamSize: z.number().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const userId = input.userId || 'demo-user-123456789';
    console.log(`[ADD SESSION] Adding session for user ${userId}:`, input);
    
    let user = db.getUser(userId);
    
    if (!user) {
      user = db.createUser({
        id: userId,
        email: 'demo@example.com',
        displayName: 'Demo User',
        createdAt: new Date().toISOString(),
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
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
    }
    
    let sessionXp = 20 + Math.floor(input.minutes / 5) * 5;
    
    if (input.isTeamSession && input.teamSize && input.teamSize > 1) {
      const multiplier = getTeamSessionMultiplier(input.teamSize);
      sessionXp = Math.round(sessionXp * multiplier);
    }
    
    let newXp = user.xp + sessionXp;
    let newLevel = user.level;
    let newXpToNextLevel = getXpForLevel(newLevel);
    
    while (newXp >= newXpToNextLevel) {
      newXp -= newXpToNextLevel;
      newLevel += 1;
      newXpToNextLevel = getXpForLevel(newLevel);
    }
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let newStreak = user.streak;
    let newActiveDays = [...user.activeDays];
    let newTotalDays = user.totalDays;
    
    if (!user.activeDays.includes(today)) {
      newActiveDays.push(today);
      newTotalDays += 1;
    }
    
    if (user.lastSessionDate === yesterday) {
      newStreak += 1;
    } else if (user.lastSessionDate !== today) {
      newStreak = 1;
    }
    
    const updatedUser = db.updateUser(userId, {
      sessions: user.sessions + 1,
      totalMinutes: user.totalMinutes + input.minutes,
      streak: newStreak,
      lastSessionDate: today,
      xp: newXp,
      level: newLevel,
      xpToNextLevel: newXpToNextLevel,
      totalSessions: user.totalSessions + 1,
      activeDays: newActiveDays,
      totalDays: newTotalDays,
      teamSessionsCompleted: input.isTeamSession ? user.teamSessionsCompleted + 1 : user.teamSessionsCompleted,
      teamSessionMinutes: input.isTeamSession ? user.teamSessionMinutes + input.minutes : user.teamSessionMinutes,
    });
    
    return {
      success: true,
      xpEarned: sessionXp,
      leveledUp: newLevel > user.level,
      newLevel,
      message: "Session added successfully",
      user: updatedUser,
    };
  });
