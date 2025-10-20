import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const createTeamSessionProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      voiceChatEnabled: z.boolean().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const sessionId = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    console.log(`[CREATE TEAM SESSION] Creating session ${sessionId}:`, input);
    
    return {
      success: true,
      sessionId,
      message: "Team session created successfully",
    };
  });
