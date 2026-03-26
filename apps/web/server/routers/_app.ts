import { router } from "../trpc";
import { generationRouter } from "./generation";
import { userRouter } from "./user";
import { billingRouter } from "./billing";
import { characterRouter } from "./character";
import { upscalerRouter } from "./upscaler";
import { templatesRouter } from "./templates";
import { autoScriptRouter } from "./autoScript";
import { adminRouter } from "./admin";
import { communityRouter } from "./community";
import { exportRouter } from "./export";
import { videoEditorRouter } from "./videoEditor";

export const appRouter = router({
  generation: generationRouter,
  user: userRouter,
  billing: billingRouter,
  character: characterRouter,
  upscaler: upscalerRouter,
  templates: templatesRouter,
  autoScript: autoScriptRouter,
  admin: adminRouter,
  community: communityRouter,
  export: exportRouter,
  videoEditor: videoEditorRouter,
});

export type AppRouter = typeof appRouter;
