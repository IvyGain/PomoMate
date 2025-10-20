import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const leaveTeamSessionProcedure = publicProcedure
  .input(
    z.object({
      sessionId: z.string(),
      userId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log(`[LEAVE TEAM SESSION] User ${input.userId} leaving session ${input.sessionId}`);
    
    return {
      success: true,
      message: "Left team session successfully",
    };
  });
