import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "../../../../db/memory-db";

export const getFriendsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().optional(),
    }).optional()
  )
  .query(async ({ input }) => {
    const userId = input?.userId || 'demo-user';
    
    const allFriends = db.getFriends(userId);
    
    const friends = allFriends.filter(f => f.status === 'accepted');
    const pendingRequests = allFriends.filter(f => f.status === 'pending');
    
    return {
      friends: friends.map(f => ({
        id: f.friendId,
        displayName: f.displayName,
        photoURL: f.photoURL,
        level: f.level,
      })),
      pendingRequests: pendingRequests.map(f => ({
        id: f.friendId,
        displayName: f.displayName,
        photoURL: f.photoURL,
        level: f.level,
      })),
    };
  });
