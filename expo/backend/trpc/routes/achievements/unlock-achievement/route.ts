import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/memory-db";

export const unlockAchievementProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().optional(),
      achievementId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const userId = input.userId || 'demo-user-123456789';
    console.log(`[UNLOCK ACHIEVEMENT] Unlocking achievement ${input.achievementId} for user ${userId}`);
    
    const existingAchievements = db.getAchievements(userId);
    const alreadyUnlocked = existingAchievements.some(a => a.achievementId === input.achievementId);
    
    if (alreadyUnlocked) {
      return {
        success: false,
        message: "Achievement already unlocked",
      };
    }
    
    db.addAchievement(userId, {
      userId,
      achievementId: input.achievementId,
      unlockedAt: new Date().toISOString(),
    });
    
    return {
      success: true,
      message: "Achievement unlocked successfully",
    };
  });
