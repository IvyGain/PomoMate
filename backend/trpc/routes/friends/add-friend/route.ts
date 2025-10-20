import { z } from "zod";
import { publicProcedure } from "../../../create-context";

export const addFriendProcedure = publicProcedure
  .input(
    z.object({
      friendCode: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log(`[ADD FRIEND] Adding friend with code ${input.friendCode}`);
    
    return {
      success: true,
      message: "Friend request sent successfully",
    };
  });
