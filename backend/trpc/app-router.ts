import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { googleLoginProcedure } from "./routes/auth/google-login/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    googleLogin: googleLoginProcedure,
  }),
});

export type AppRouter = typeof appRouter;
