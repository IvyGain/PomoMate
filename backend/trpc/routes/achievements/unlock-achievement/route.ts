import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const unlockAchievementProcedure = publicProcedure
  .input(
    z.object({
      achievementId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log(`[UNLOCK ACHIEVEMENT] Unlocking achievement ${input.achievementId}`);
    
    return {
      success: true,
      message: "Achievement unlocked successfully",
    };
  });
