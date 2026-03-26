import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { characterCreateSchema } from "@videoforge/shared";
import { createCharacter, getUserCharacters } from "../../lib/db";
import { supabase } from "../../lib/supabase";
import { deleteFromR2, getPresignedUploadUrl, buildCharacterKey } from "../../lib/r2";

export const characterRouter = router({
  // List user's characters
  list: protectedProcedure.query(async ({ ctx }) => {
    return getUserCharacters(ctx.userId);
  }),

  // Get a presigned upload URL for a character's reference image.
  getUploadUrl: protectedProcedure
    .input(
      z.object({
        characterId: z.string().min(1),
        contentType: z.enum(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const key = buildCharacterKey(ctx.userId, input.characterId);
      const uploadUrl = await getPresignedUploadUrl(key, input.contentType, 3600);
      const publicUrl = `${process.env.B2_PUBLIC_URL ?? ""}/${key}`;
      return { uploadUrl, publicUrl, key };
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
      const { data: doc, error } = await supabase
        .from("characters")
        .select("*")
        .eq("id", input.id)
        .single();

      if (error || !doc) throw new TRPCError({ code: "NOT_FOUND" });
      if (doc["user_id"] !== ctx.userId) throw new TRPCError({ code: "FORBIDDEN" });

      const r2Key = doc["r2_key"] as string;

      // Delete from B2 if stored there
      if (r2Key) {
        await deleteFromR2(r2Key).catch(() => {
          // Non-fatal: log and continue
          console.warn(`Failed to delete storage object: ${r2Key}`);
        });
      }

      await supabase.from("characters").delete().eq("id", input.id);
      return { success: true };
    }),
});
