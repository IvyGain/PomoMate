import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { db } from "@/backend/db/memory-db";

export const googleLoginProcedure = publicProcedure
  .input(
    z.object({
      idToken: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      if (input.idToken.startsWith('demo-token')) {
        const demoUserId = 'demo-user-123456789';
        let user = db.getUser(demoUserId);
        
        if (!user) {
          user = db.createUser({
            id: demoUserId,
            email: 'demo@example.com',
            displayName: 'デモユーザー',
            photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
            createdAt: new Date().toISOString(),
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
          });
        }
        
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: user.createdAt,
          },
        };
      }

      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${input.idToken}`
      );

      if (!response.ok) {
        throw new Error("Invalid token");
      }

      const tokenInfo = await response.json();
      
      let user = db.getUser(tokenInfo.sub);
      
      if (!user) {
        user = db.createUser({
          id: tokenInfo.sub,
          email: tokenInfo.email,
          displayName: tokenInfo.name || tokenInfo.email,
          photoURL: tokenInfo.picture,
          createdAt: new Date().toISOString(),
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
        });
      }

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      console.error("Google login error:", error);
      throw new Error("Google認証に失敗しました");
    }
  });
