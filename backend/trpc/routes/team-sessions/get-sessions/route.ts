import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/memory-db";

export const getTeamSessionsProcedure = publicProcedure.query(async () => {
  const allSessions = db.getTeamSessions();
  
  const activeSessions = allSessions.filter(s => s.status === 'waiting' || s.status === 'active');
  
  return {
    sessions: activeSessions.map(s => ({
      id: s.id,
      name: s.name,
      creatorId: s.creatorId,
      members: s.members,
      memberCount: s.members.length,
      duration: s.duration,
      status: s.status,
      createdAt: s.createdAt,
    })),
  };
});
