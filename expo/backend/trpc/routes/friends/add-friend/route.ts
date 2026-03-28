import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { db } from "../../../../db/memory-db";

export const addFriendProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().optional(),
      friendCode: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const userId = input.userId || 'demo-user-123456789';
    console.log(`[ADD FRIEND] User ${userId} adding friend with code ${input.friendCode}`);
    
    const friendUser = db.getUser(input.friendCode);
    
    if (!friendUser) {
      return {
        success: false,
        message: "Friend not found",
      };
    }
    
    if (friendUser.id === userId) {
      return {
        success: false,
        message: "Cannot add yourself as a friend",
      };
    }
    
    const existingFriends = db.getFriends(userId);
    const alreadyFriend = existingFriends.some(f => f.friendId === friendUser.id);
    
    if (alreadyFriend) {
      return {
        success: false,
        message: "Already friends or request pending",
      };
    }
    
    db.addFriend(userId, {
      userId,
      friendId: friendUser.id,
      displayName: friendUser.displayName,
      photoURL: friendUser.photoURL,
      level: friendUser.level,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    
    const currentUser = db.getUser(userId);
    
    db.addFriend(friendUser.id, {
      userId: friendUser.id,
      friendId: userId,
      displayName: currentUser?.displayName || 'Demo User',
      photoURL: currentUser?.photoURL,
      level: currentUser?.level || 1,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    
    return {
      success: true,
      message: "Friend request sent successfully",
    };
  });
