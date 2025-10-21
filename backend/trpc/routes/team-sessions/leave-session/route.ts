import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/memory-db";

export const leaveTeamSessionProcedure = publicProcedure
  .input(
    z.object({
      sessionId: z.string(),
      userId: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const userId = input.userId || 'demo-user';
    console.log(`[LEAVE TEAM SESSION] User ${userId} leaving session ${input.sessionId}`);
    
    const session = db.getTeamSession(input.sessionId);
    
    if (!session) {
      return {
        success: false,
        message: "Session not found",
      };
    }
    
    const updatedMembers = session.members.filter(id => id !== userId);
    
    if (updatedMembers.length === 0) {
      db.deleteTeamSession(input.sessionId);
      return {
        success: true,
        message: "Session deleted (no members left)",
      };
    }
    
    const updatedSession = db.updateTeamSession(input.sessionId, {
      members: updatedMembers,
    });
    
    return {
      success: true,
      session: updatedSession,
      message: "Left team session successfully",
    };
  });
