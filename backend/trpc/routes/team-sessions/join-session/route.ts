import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const joinTeamSessionProcedure = publicProcedure
  .input(
    z.object({
      sessionId: z.string(),
      userId: z.string(),
      userName: z.string(),
      userAvatar: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log(`[JOIN TEAM SESSION] User ${input.userId} joining session ${input.sessionId}`);
    
    return {
      success: true,
      message: "Joined team session successfully",
    };
  });
