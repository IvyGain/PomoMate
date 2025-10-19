import { publicProcedure } from "../../../create-context";
import { z } from "zod";

export const googleLoginProcedure = publicProcedure
  .input(
    z.object({
      idToken: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${input.idToken}`
      );

      if (!response.ok) {
        throw new Error("Invalid token");
      }

      const tokenInfo = await response.json();

      const user = {
        id: tokenInfo.sub,
        email: tokenInfo.email,
        displayName: tokenInfo.name || tokenInfo.email,
        photoURL: tokenInfo.picture,
        createdAt: new Date().toISOString(),
      };

      return {
        success: true,
        user,
      };
    } catch (error) {
      console.error("Google login error:", error);
      throw new Error("Google認証に失敗しました");
    }
  });
