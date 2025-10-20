import { publicProcedure } from "../../../create-context";

export const getProfileProcedure = publicProcedure.query(async () => {
  
  return {
    id: 'demo-user',
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    sessions: 0,
    streak: 0,
    lastSessionDate: null,
    totalMinutes: 0,
    unlockedAchievements: [],
    totalDays: 0,
    totalSessions: 0,
    activeDays: [],
    playedGames: [],
    gamePlayCount: 0,
    teamSessionsCompleted: 0,
    teamSessionMinutes: 0,
  };
});
