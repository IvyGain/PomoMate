import { publicProcedure } from "../../../create-context";

export const getAchievementsProcedure = publicProcedure.query(async () => {
  
  return {
    unlockedAchievements: [],
    totalAchievements: 0,
  };
});
