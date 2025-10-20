import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const updateProfileProcedure = publicProcedure
  .input(
    z.object({
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
    console.log(`[UPDATE PROFILE] Updating profile:`, input);
    
    return {
      success: true,
      message: "Profile updated successfully",
    };
  });
