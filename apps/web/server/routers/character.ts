import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { characterCreateSchema } from "@videoforge/shared";
import { createCharacter, getUserCharacters } from "@/lib/db";
import { adminDb } from "@/lib/firebase-admin";
import { deleteFromR2 } from "@/lib/r2";

export const characterRouter = router({
  // List user's characters
  list: protectedProcedure.query(async ({ ctx }) => {
    return getUserCharacters(ctx.userId);
  }),

  // Create a character
  create: protectedProcedure
    .input(characterCreateSchema)
    .mutation(async ({ ctx, input }) => {
      // Free tier: max 3 characters
      if (ctx.user.tier === "free") {
        const chars = await getUserCharacters(ctx.userId);
        if (chars.length >= 3) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Free plan allows up to 3 characters. Upgrade to create more.",
          });
        }
      }

      return createCharacter({
        userId: ctx.userId,
        name: input.name,
        description: input.description ?? null,
        referenceImageUrl: input.referenceImageUrl,
        r2Key: "", // Set after upload
      });
    }),

  // Delete a character
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const doc = await adminDb.collection("characters").doc(input.id).get();
      if (!doc.exists) throw new TRPCError({ code: "NOT_FOUND" });
      if (doc.data()!["userId"] !== ctx.userId) throw new TRPCError({ code: "FORBIDDEN" });

      const r2Key = doc.data()!["r2Key"] as string;

      // Delete from R2 if stored there
      if (r2Key) {
        await deleteFromR2(r2Key).catch(() => {
          // Non-fatal: log and continue
          console.warn(`Failed to delete R2 object: ${r2Key}`);
        });
      }

      await adminDb.collection("characters").doc(input.id).delete();
      return { success: true };
    }),
});
