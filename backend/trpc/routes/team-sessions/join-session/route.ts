import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/memory-db";

export const joinTeamSessionProcedure = publicProcedure
  .input(
    z.object({
      sessionId: z.string(),
      userId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const userId = input.userId || 'demo-user';
    console.log(`[JOIN TEAM SESSION] User ${userId} joining session ${input.sessionId}`);
    
    const session = db.getTeamSession(input.sessionId);
    
    if (!session) {
      return {
        success: false,
        message: "Session not found",
      };
    }
    
    if (session.status !== 'waiting') {
      return {
        success: false,
        message: "Session already started or completed",
      };
    }
    
    if (session.members.includes(userId)) {
      return {
        success: false,
        message: "Already in this session",
      };
    }
    
    const updatedSession = db.updateTeamSession(input.sessionId, {
      members: [...session.members, userId],
    });
    
    return {
      success: true,
      session: updatedSession,
      message: "Joined team session successfully",
    };
  });
