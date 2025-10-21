import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../db/memory-db";

export const getAchievementsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().optional(),
    }).optional()
  )
  .query(async ({ input }) => {
    const userId = input?.userId || 'demo-user';
    
    const achievements = db.getAchievements(userId);
    
    return {
      unlockedAchievements: achievements.map(a => a.achievementId),
      totalAchievements: achievements.length,
      achievements,
    };
  });
