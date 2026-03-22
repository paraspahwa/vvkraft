import { router } from "../trpc";
import { generationRouter } from "./generation";
import { userRouter } from "./user";
import { billingRouter } from "./billing";
import { characterRouter } from "./character";

export const appRouter = router({
  generation: generationRouter,
  user: userRouter,
  billing: billingRouter,
  character: characterRouter,
});

export type AppRouter = typeof appRouter;
