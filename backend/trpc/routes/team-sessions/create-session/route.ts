import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/memory-db";

export const createTeamSessionProcedure = publicProcedure
  .input(
    z.object({
      name: z.string(),
      duration: z.number(),
      creatorId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const sessionId = Math.random().toString(36).substring(2, 10).toUpperCase();
    const creatorId = input.creatorId || 'demo-user';
    
    console.log(`[CREATE TEAM SESSION] Creating session ${sessionId}:`, input);
    
    const session = db.createTeamSession({
      id: sessionId,
      name: input.name,
      creatorId,
      members: [creatorId],
      duration: input.duration,
      startTime: null,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    });
    
    return {
      success: true,
      session,
      sessionId,
      message: "Team session created successfully",
    };
  });
