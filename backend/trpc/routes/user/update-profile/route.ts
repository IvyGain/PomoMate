import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/memory-db";

export const updateProfileProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().optional(),
      level: z.number().optional(),
      xp: z.number().optional(),
      xpToNextLevel: z.number().optional(),
      sessions: z.number().optional(),
      streak: z.number().optional(),
      lastSessionDate: z.string().nullable().optional(),
      totalMinutes: z.number().optional(),
      unlockedAchievements: z.array(z.string()).optional(),
      totalDays: z.number().optional(),
      totalSessions: z.number().optional(),
      activeDays: z.array(z.string()).optional(),
      playedGames: z.array(z.string()).optional(),
      gamePlayCount: z.number().optional(),
      teamSessionsCompleted: z.number().optional(),
      teamSessionMinutes: z.number().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const userId = input.userId || 'demo-user-123456789';
    console.log(`[UPDATE PROFILE] Updating profile for user ${userId}:`, input);
    
    let user = db.getUser(userId);
    
    if (!user) {
      user = db.createUser({
        id: userId,
        email: 'demo@example.com',
        displayName: 'Demo User',
        createdAt: new Date().toISOString(),
        level: input.level || 1,
        xp: input.xp || 0,
        xpToNextLevel: input.xpToNextLevel || 100,
        sessions: input.sessions || 0,
        streak: input.streak || 0,
        lastSessionDate: input.lastSessionDate || null,
        totalMinutes: input.totalMinutes || 0,
        unlockedAchievements: input.unlockedAchievements || [],
        totalDays: input.totalDays || 0,
        totalSessions: input.totalSessions || 0,
        activeDays: input.activeDays || [],
        playedGames: input.playedGames || [],
        gamePlayCount: input.gamePlayCount || 0,
        teamSessionsCompleted: input.teamSessionsCompleted || 0,
        teamSessionMinutes: input.teamSessionMinutes || 0,
      });
    } else {
      const { userId: _, ...updateData } = input;
      user = db.updateUser(userId, updateData) || user;
    }
    
    return {
      success: true,
      message: "Profile updated successfully",
      user,
    };
  });
