import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/memory-db";

export const removeFriendProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().optional(),
      friendId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const userId = input.userId || 'demo-user';
    console.log(`[REMOVE FRIEND] User ${userId} removing friend ${input.friendId}`);
    
    db.removeFriend(userId, input.friendId);
    db.removeFriend(input.friendId, userId);
    
    return {
      success: true,
      message: "Friend removed successfully",
    };
  });
