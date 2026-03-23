import { router } from "../trpc";
import { generationRouter } from "./generation";
import { userRouter } from "./user";
import { billingRouter } from "./billing";
import { characterRouter } from "./character";
import { upscalerRouter } from "./upscaler";

export const appRouter = router({
  generation: generationRouter,
  user: userRouter,
  billing: billingRouter,
  character: characterRouter,
  upscaler: upscalerRouter,
});

export type AppRouter = typeof appRouter;
