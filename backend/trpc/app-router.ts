import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { googleLoginProcedure } from "./routes/auth/google-login/route";
import { getProfileProcedure } from "./routes/user/get-profile/route";
import { updateProfileProcedure } from "./routes/user/update-profile/route";
import { addSessionProcedure } from "./routes/user/add-session/route";
import { getAchievementsProcedure } from "./routes/achievements/get-achievements/route";
import { unlockAchievementProcedure } from "./routes/achievements/unlock-achievement/route";
import { getFriendsProcedure } from "./routes/friends/get-friends/route";
import { addFriendProcedure } from "./routes/friends/add-friend/route";
import { removeFriendProcedure } from "./routes/friends/remove-friend/route";
import { createTeamSessionProcedure } from "./routes/team-sessions/create-session/route";
import { joinTeamSessionProcedure } from "./routes/team-sessions/join-session/route";
import { leaveTeamSessionProcedure } from "./routes/team-sessions/leave-session/route";
import { getTeamSessionsProcedure } from "./routes/team-sessions/get-sessions/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    googleLogin: googleLoginProcedure,
  }),
  user: createTRPCRouter({
    getProfile: getProfileProcedure,
    updateProfile: updateProfileProcedure,
    addSession: addSessionProcedure,
  }),
  achievements: createTRPCRouter({
    getAchievements: getAchievementsProcedure,
    unlockAchievement: unlockAchievementProcedure,
  }),
  friends: createTRPCRouter({
    getFriends: getFriendsProcedure,
    addFriend: addFriendProcedure,
    removeFriend: removeFriendProcedure,
  }),
  teamSessions: createTRPCRouter({
    createSession: createTeamSessionProcedure,
    joinSession: joinTeamSessionProcedure,
    leaveSession: leaveTeamSessionProcedure,
    getSessions: getTeamSessionsProcedure,
  }),
});

export type AppRouter = typeof appRouter;
