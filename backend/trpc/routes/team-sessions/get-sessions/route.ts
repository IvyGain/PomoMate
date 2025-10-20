import { publicProcedure } from "../../../create-context";

export const getTeamSessionsProcedure = publicProcedure.query(async () => {
  
  return {
    sessions: [],
  };
});
