import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../db/memory-db";

export const getProfileProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().optional(),
    }).optional()
  )
  .query(async ({ input }) => {
    const userId = input?.userId || 'demo-user';
    
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
    
    return {
      id: user.id,
      level: user.level,
      xp: user.xp,
      xpToNextLevel: user.xpToNextLevel,
      sessions: user.sessions,
      streak: user.streak,
      lastSessionDate: user.lastSessionDate,
      totalMinutes: user.totalMinutes,
      unlockedAchievements: user.unlockedAchievements,
      totalDays: user.totalDays,
      totalSessions: user.totalSessions,
      activeDays: user.activeDays,
      playedGames: user.playedGames,
      gamePlayCount: user.gamePlayCount,
      teamSessionsCompleted: user.teamSessionsCompleted,
      teamSessionMinutes: user.teamSessionMinutes,
    };
  });
