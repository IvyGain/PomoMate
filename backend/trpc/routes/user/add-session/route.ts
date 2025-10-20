import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const addSessionProcedure = publicProcedure
  .input(
    z.object({
      minutes: z.number(),
      isTeamSession: z.boolean().optional(),
      teamSize: z.number().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log(`[ADD SESSION] Adding session:`, input);
    
    const xpEarned = 20 + Math.floor(input.minutes / 5) * 5;
    
    return {
      success: true,
      xpEarned,
      message: "Session added successfully",
    };
  });
