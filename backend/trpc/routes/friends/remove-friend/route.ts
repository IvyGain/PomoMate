import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const removeFriendProcedure = publicProcedure
  .input(
    z.object({
      friendId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log(`[REMOVE FRIEND] Removing friend ${input.friendId}`);
    
    return {
      success: true,
      message: "Friend removed successfully",
    };
  });
