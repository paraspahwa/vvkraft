import { supabase } from "./supabase";
import type { User, Generation, Character, CreditTransaction, SubscriptionTier, VideoUpscaleJob, VideoEditorProject } from "@videoforge/shared";

// ── Mapping helpers (snake_case DB columns → camelCase TS interfaces) ────────

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: row["id"] as string,
    email: row["email"] as string,
    displayName: (row["display_name"] as string) ?? null,
    photoURL: (row["photo_url"] as string) ?? null,
    tier: row["tier"] as SubscriptionTier,
    credits: row["credits"] as number,
    creditsUsedThisMonth: row["credits_used_this_month"] as number,
    razorpayCustomerId: (row["razorpay_customer_id"] as string) ?? null,
    razorpaySubscriptionId: (row["razorpay_subscription_id"] as string) ?? null,
    createdAt: new Date(row["created_at"] as string),
    updatedAt: new Date(row["updated_at"] as string),
  };
}

function rowToGeneration(row: Record<string, unknown>): Generation {
  return {
    id: row["id"] as string,
    userId: row["user_id"] as string,
    status: row["status"] as Generation["status"],
    prompt: row["prompt"] as string,
    negativePrompt: (row["negative_prompt"] as string) ?? null,
    model: row["model"] as Generation["model"],
    resolution: row["resolution"] as Generation["resolution"],
    durationSeconds: row["duration_seconds"] as number,
    aspectRatio: row["aspect_ratio"] as Generation["aspectRatio"],
    seed: (row["seed"] as number) ?? null,
    motionStrength: (row["motion_strength"] as number) ?? null,
    referenceImageUrl: (row["reference_image_url"] as string) ?? null,
    characterId: (row["character_id"] as string) ?? null,
    videoUrl: (row["video_url"] as string) ?? null,
    thumbnailUrl: (row["thumbnail_url"] as string) ?? null,
    r2Key: (row["r2_key"] as string) ?? null,
    falRequestId: (row["fal_request_id"] as string) ?? null,
    creditsCost: row["credits_cost"] as number,
    actualCostUsd: (row["actual_cost_usd"] as number) ?? null,
    errorMessage: (row["error_message"] as string) ?? null,
    processingStartedAt: row["processing_started_at"] ? new Date(row["processing_started_at"] as string) : null,
    completedAt: row["completed_at"] ? new Date(row["completed_at"] as string) : null,
    createdAt: new Date(row["created_at"] as string),
    updatedAt: new Date(row["updated_at"] as string),
  } as Generation;
}

function rowToCharacter(row: Record<string, unknown>): Character {
  return {
    id: row["id"] as string,
    userId: row["user_id"] as string,
    name: row["name"] as string,
    description: (row["description"] as string) ?? null,
    referenceImageUrl: row["reference_image_url"] as string,
    r2Key: row["r2_key"] as string,
    generationCount: row["generation_count"] as number,
    createdAt: new Date(row["created_at"] as string),
    updatedAt: new Date(row["updated_at"] as string),
  };
}

function rowToUpscaleJob(row: Record<string, unknown>): VideoUpscaleJob {
  return {
    id: row["id"] as string,
    userId: row["user_id"] as string,
    status: row["status"] as VideoUpscaleJob["status"],
    inputVideoUrl: row["input_video_url"] as string,
    inputDurationSeconds: row["input_duration_seconds"] as number,
    inputR2Key: (row["input_r2_key"] as string) ?? null,
    qualityMode: row["quality_mode"] as VideoUpscaleJob["qualityMode"],
    outputVideoUrl: (row["output_video_url"] as string) ?? null,
    outputR2Key: (row["output_r2_key"] as string) ?? null,
    falRequestId: (row["fal_request_id"] as string) ?? null,
    creditsCost: row["credits_cost"] as number,
    errorMessage: (row["error_message"] as string) ?? null,
    processingStartedAt: row["processing_started_at"] ? new Date(row["processing_started_at"] as string) : null,
    completedAt: row["completed_at"] ? new Date(row["completed_at"] as string) : null,
    createdAt: new Date(row["created_at"] as string),
    updatedAt: new Date(row["updated_at"] as string),
  } as VideoUpscaleJob;
}

function rowToEditorProject(row: Record<string, unknown>): VideoEditorProject {
  return {
    id: row["id"] as string,
    userId: row["user_id"] as string,
    name: row["name"] as string,
    clips: (row["clips"] ?? []) as VideoEditorProject["clips"],
    textOverlays: (row["text_overlays"] ?? []) as VideoEditorProject["textOverlays"],
    backgroundAudioUrl: (row["background_audio_url"] as string) ?? null,
    backgroundAudioVolume: (row["background_audio_volume"] as number) ?? 0.5,
    status: row["status"] as VideoEditorProject["status"],
    exportedVideoUrl: (row["exported_video_url"] as string) ?? null,
    exportedR2Key: (row["exported_r2_key"] as string) ?? null,
    errorMessage: (row["error_message"] as string) ?? null,
    totalDurationSeconds: (row["total_duration_seconds"] as number) ?? 0,
    createdAt: new Date(row["created_at"] as string),
    updatedAt: new Date(row["updated_at"] as string),
  } as VideoEditorProject;
}

// camelCase key to snake_case converter for update objects
function toSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = value instanceof Date ? value.toISOString() : value;
  }
  return result;
}

// ── User operations ──────────────────────────────────────────────────────────

export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return rowToUser(data);
}

export async function createUser(
  userId: string,
  data: Pick<User, "email" | "displayName" | "photoURL">
): Promise<User> {
  const now = new Date().toISOString();
  const row = {
    id: userId,
    email: data.email,
    display_name: data.displayName,
    photo_url: data.photoURL,
    tier: "free" as SubscriptionTier,
    credits: 0,
    credits_used_this_month: 0,
    razorpay_customer_id: null,
    razorpay_subscription_id: null,
    created_at: now,
    updated_at: now,
  };

  const { data: inserted, error } = await supabase
    .from("users")
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(`Failed to create user: ${error.message}`);
  return rowToUser(inserted);
}

export async function updateUser(
  userId: string,
  data: Partial<Omit<User, "id" | "createdAt">>
): Promise<void> {
  const snakeData = toSnake(data as Record<string, unknown>);
  snakeData["updated_at"] = new Date().toISOString();

  const { error } = await supabase
    .from("users")
    .update(snakeData)
    .eq("id", userId);

  if (error) throw new Error(`Failed to update user: ${error.message}`);
}

export async function deductCredits(
  userId: string,
  amount: number,
  generationId: string,
  description: string
): Promise<void> {
  const { error } = await supabase.rpc("deduct_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_generation_id: generationId,
    p_description: description,
  });

  if (error) throw new Error(error.message);
}

export async function addCredits(
  userId: string,
  amount: number,
  type: CreditTransaction["type"],
  description: string,
  razorpayPaymentId?: string
): Promise<void> {
  const { error } = await supabase.rpc("add_credits", {
    p_user_id: userId,
    p_amount: amount,
    p_type: type,
    p_description: description,
    p_razorpay_payment_id: razorpayPaymentId ?? null,
  });

  if (error) throw new Error(error.message);
}

// ── Generation operations ────────────────────────────────────────────────────

export async function createGeneration(
  data: Omit<Generation, "id" | "createdAt" | "updatedAt">
): Promise<Generation> {
  const snakeData = toSnake(data as unknown as Record<string, unknown>);
  delete snakeData["id"];

  const { data: inserted, error } = await supabase
    .from("generations")
    .insert(snakeData)
    .select()
    .single();

  if (error) throw new Error(`Failed to create generation: ${error.message}`);
  return rowToGeneration(inserted);
}

export async function getGenerationById(generationId: string): Promise<Generation | null> {
  const { data, error } = await supabase
    .from("generations")
    .select("*")
    .eq("id", generationId)
    .single();

  if (error || !data) return null;
  return rowToGeneration(data);
}

export async function updateGeneration(
  generationId: string,
  data: Partial<Omit<Generation, "id" | "createdAt">>
): Promise<void> {
  const snakeData = toSnake(data as unknown as Record<string, unknown>);
  snakeData["updated_at"] = new Date().toISOString();

  const { error } = await supabase
    .from("generations")
    .update(snakeData)
    .eq("id", generationId);

  if (error) throw new Error(`Failed to update generation: ${error.message}`);
}

export async function getUserGenerations(
  userId: string,
  limit = 20,
  startAfter?: string
): Promise<Generation[]> {
  let query = supabase
    .from("generations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (startAfter) {
    // Cursor-based pagination: get created_at of the cursor document
    const { data: cursor } = await supabase
      .from("generations")
      .select("created_at")
      .eq("id", startAfter)
      .single();
    if (cursor) {
      query = query.lt("created_at", cursor["created_at"]);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list generations: ${error.message}`);
  return (data ?? []).map(rowToGeneration);
}

// ── Character operations ─────────────────────────────────────────────────────

export async function createCharacter(
  data: Omit<Character, "id" | "createdAt" | "updatedAt" | "generationCount">
): Promise<Character> {
  const now = new Date().toISOString();
  const row = {
    user_id: data.userId,
    name: data.name,
    description: data.description,
    reference_image_url: data.referenceImageUrl,
    r2_key: data.r2Key,
    generation_count: 0,
    created_at: now,
    updated_at: now,
  };

  const { data: inserted, error } = await supabase
    .from("characters")
    .insert(row)
    .select()
    .single();

  if (error) throw new Error(`Failed to create character: ${error.message}`);
  return rowToCharacter(inserted);
}

export async function getUserCharacters(userId: string): Promise<Character[]> {
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list characters: ${error.message}`);
  return (data ?? []).map(rowToCharacter);
}

// ── Video Upscale Job operations ──────────────────────────────────────────────

export async function createUpscaleJob(
  data: Omit<VideoUpscaleJob, "id" | "createdAt" | "updatedAt">
): Promise<VideoUpscaleJob> {
  const snakeData = toSnake(data as unknown as Record<string, unknown>);

  const { data: inserted, error } = await supabase
    .from("video_upscale_jobs")
    .insert(snakeData)
    .select()
    .single();

  if (error) throw new Error(`Failed to create upscale job: ${error.message}`);
  return rowToUpscaleJob(inserted);
}

export async function getUpscaleJobById(jobId: string): Promise<VideoUpscaleJob | null> {
  const { data, error } = await supabase
    .from("video_upscale_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error || !data) return null;
  return rowToUpscaleJob(data);
}

export async function updateUpscaleJob(
  jobId: string,
  data: Partial<Omit<VideoUpscaleJob, "id" | "createdAt">>
): Promise<void> {
  const snakeData = toSnake(data as unknown as Record<string, unknown>);
  snakeData["updated_at"] = new Date().toISOString();

  const { error } = await supabase
    .from("video_upscale_jobs")
    .update(snakeData)
    .eq("id", jobId);

  if (error) throw new Error(`Failed to update upscale job: ${error.message}`);
}

export async function getUserUpscaleJobs(
  userId: string,
  limit = 20,
  startAfter?: string
): Promise<VideoUpscaleJob[]> {
  let query = supabase
    .from("video_upscale_jobs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (startAfter) {
    const { data: cursor } = await supabase
      .from("video_upscale_jobs")
      .select("created_at")
      .eq("id", startAfter)
      .single();
    if (cursor) {
      query = query.lt("created_at", cursor["created_at"]);
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list upscale jobs: ${error.message}`);
  return (data ?? []).map(rowToUpscaleJob);
}

// ── Video Editor Project operations ──────────────────────────────────────────

export async function createEditorProject(
  data: Omit<VideoEditorProject, "id" | "createdAt" | "updatedAt">
): Promise<VideoEditorProject> {
  const snakeData = toSnake(data as unknown as Record<string, unknown>);

  const { data: inserted, error } = await supabase
    .from("video_editor_projects")
    .insert(snakeData)
    .select()
    .single();

  if (error) throw new Error(`Failed to create editor project: ${error.message}`);
  return rowToEditorProject(inserted);
}

export async function getEditorProjectById(projectId: string): Promise<VideoEditorProject | null> {
  const { data, error } = await supabase
    .from("video_editor_projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error || !data) return null;
  return rowToEditorProject(data);
}

export async function updateEditorProject(
  projectId: string,
  data: Partial<Omit<VideoEditorProject, "id" | "createdAt">>
): Promise<void> {
  const snakeData = toSnake(data as unknown as Record<string, unknown>);
  snakeData["updated_at"] = new Date().toISOString();

  const { error } = await supabase
    .from("video_editor_projects")
    .update(snakeData)
    .eq("id", projectId);

  if (error) throw new Error(`Failed to update editor project: ${error.message}`);
}

export async function getUserEditorProjects(
  userId: string,
  limit = 20
): Promise<VideoEditorProject[]> {
  const { data, error } = await supabase
    .from("video_editor_projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to list editor projects: ${error.message}`);
  return (data ?? []).map(rowToEditorProject);
}

export async function deleteEditorProject(projectId: string): Promise<void> {
  const { error } = await supabase
    .from("video_editor_projects")
    .delete()
    .eq("id", projectId);

  if (error) throw new Error(`Failed to delete editor project: ${error.message}`);
}
