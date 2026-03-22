import { type NextRequest, NextResponse } from "next/server";
import { updateGeneration, getGenerationById, addCredits } from "@/lib/db";
import { uploadFromUrl, buildVideoKey } from "@/lib/r2";

export async function POST(req: NextRequest) {
  // Verify the webhook secret to prevent spoofed requests
  const secret = req.headers.get("x-fal-webhook-secret");
  if (process.env.FAL_WEBHOOK_SECRET && secret !== process.env.FAL_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as Record<string, unknown>;

    const requestId = body["request_id"] as string | undefined;
    const status = body["status"] as string | undefined;
    const payload = body["payload"] as Record<string, unknown> | undefined;
    const generationId = payload?.["generationId"] as string | undefined;

    if (!requestId || !generationId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const generation = await getGenerationById(generationId);
    if (!generation) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 });
    }

    if (status === "COMPLETED") {
      const output = body["output"] as { video?: { url: string } } | undefined;
      const videoUrl = output?.video?.url;

      if (videoUrl) {
        const r2Key = buildVideoKey(generation.userId, generationId);
        const permanentUrl = await uploadFromUrl(r2Key, videoUrl, "video/mp4").catch(() => videoUrl);

        await updateGeneration(generationId, {
          status: "completed",
          videoUrl: permanentUrl,
          r2Key,
          completedAt: new Date(),
          falRequestId: requestId,
        });
      }
    } else if (status === "FAILED") {
      const error = body["error"] as string | undefined;

      await updateGeneration(generationId, {
        status: "failed",
        errorMessage: error ?? "Generation failed",
        completedAt: new Date(),
      });

      // Refund credits on failure
      await addCredits(
        generation.userId,
        generation.creditsCost,
        "refund",
        `Refund for failed generation #${generationId.slice(0, 8)}`
      );
    } else if (status === "IN_PROGRESS") {
      await updateGeneration(generationId, {
        status: "processing",
        processingStartedAt: new Date(),
        falRequestId: requestId,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Fal webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
