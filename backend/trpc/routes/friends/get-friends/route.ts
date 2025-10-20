import { publicProcedure } from "../../../create-context";

export const getFriendsProcedure = publicProcedure.query(async () => {
  
  return {
    friends: [],
    pendingRequests: [],
  };
});
