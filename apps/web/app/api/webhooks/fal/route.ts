import { type NextRequest, NextResponse } from "next/server";
import { updateGeneration, getGenerationById, addCredits, getUpscaleJobById, updateUpscaleJob } from "@/lib/db";
import { uploadFromUrl, buildVideoKey, buildUpscaleOutputKey } from "@/lib/r2";

export async function POST(req: NextRequest) {
  // Verify the webhook secret to prevent spoofed requests.
  // FAL_WEBHOOK_SECRET must always be configured in production.
  const expectedSecret = process.env.FAL_WEBHOOK_SECRET;
  if (!expectedSecret) {
    console.error("FAL_WEBHOOK_SECRET is not configured — rejecting all webhook calls");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }
  const secret = req.headers.get("x-fal-webhook-secret");
  if (secret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json() as Record<string, unknown>;

    const requestId = body["request_id"] as string | undefined;
    const status = body["status"] as string | undefined;

    if (!requestId) {
      return NextResponse.json({ error: "Missing request_id" }, { status: 400 });
    }

    // Route based on query parameters set when the webhook URL was constructed
    const url = new URL(req.url);
    const jobTypeParam = url.searchParams.get("jobType");
    const jobIdParam = url.searchParams.get("jobId");

    if (jobTypeParam === "upscale" && jobIdParam) {
      return handleUpscaleWebhook(jobIdParam, requestId, status, body);
    }

    // ── Standard video generation webhook ─────────────────────────────────────
    const payload = body["payload"] as Record<string, unknown> | undefined;
    const generationId = payload?.["generationId"] as string | undefined;

    if (!generationId) {
      return NextResponse.json({ error: "Missing generationId in payload" }, { status: 400 });
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

/**
 * Handle webhook events for video upscale jobs.
 */
async function handleUpscaleWebhook(
  jobId: string,
  requestId: string,
  status: string | undefined,
  body: Record<string, unknown>
): Promise<NextResponse> {
  const job = await getUpscaleJobById(jobId);
  if (!job) {
    return NextResponse.json({ error: "Upscale job not found" }, { status: 404 });
  }

  if (status === "COMPLETED") {
    const output = body["output"] as { video?: { url: string } } | undefined;
    const outputUrl = output?.video?.url;

    if (outputUrl) {
      const r2Key = buildUpscaleOutputKey(job.userId, jobId);
      const permanentUrl = await uploadFromUrl(r2Key, outputUrl, "video/mp4").catch(() => outputUrl);

      await updateUpscaleJob(jobId, {
        status: "completed",
        outputVideoUrl: permanentUrl,
        outputR2Key: r2Key,
        falRequestId: requestId,
        completedAt: new Date(),
      });
    } else {
      await updateUpscaleJob(jobId, {
        status: "failed",
        errorMessage: "Upscale completed but no output video URL was returned",
        completedAt: new Date(),
      });
    }
  } else if (status === "FAILED") {
    const error = body["error"] as string | undefined;

    await updateUpscaleJob(jobId, {
      status: "failed",
      errorMessage: error ?? "Upscale failed",
      completedAt: new Date(),
    });

    // Refund credits on failure
    await addCredits(
      job.userId,
      job.creditsCost,
      "refund",
      `Refund for failed upscale job #${jobId.slice(0, 8)}`
    );
  } else if (status === "IN_PROGRESS") {
    await updateUpscaleJob(jobId, {
      status: "processing",
      processingStartedAt: new Date(),
      falRequestId: requestId,
    });
  }

  return NextResponse.json({ ok: true });
}
