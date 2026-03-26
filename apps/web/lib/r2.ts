import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Backblaze B2 S3-compatible storage client
const b2Client = new S3Client({
  region: process.env.B2_REGION ?? "us-west-004",
  endpoint: `https://s3.${process.env.B2_REGION ?? "us-west-004"}.backblazeb2.com`,
  credentials: {
    accessKeyId: process.env.B2_APPLICATION_KEY_ID ?? "",
    secretAccessKey: process.env.B2_APPLICATION_KEY ?? "",
  },
});

const BUCKET_NAME = process.env.B2_BUCKET_NAME ?? "videoforge";
const PUBLIC_URL = process.env.B2_PUBLIC_URL ?? "";

/**
 * Upload a buffer to Backblaze B2 and return the public URL
 */
export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await b2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return `${PUBLIC_URL}/${key}`;
}

/**
 * Upload from a URL (download then re-upload to B2)
 */
export async function uploadFromUrl(key: string, sourceUrl: string, contentType: string): Promise<string> {
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`Failed to fetch source URL: ${response.statusText}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return uploadToR2(key, buffer, contentType);
}

/**
 * Delete an object from B2
 */
export async function deleteFromR2(key: string): Promise<void> {
  await b2Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

/**
 * Generate a pre-signed URL for direct upload from client
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  return getSignedUrl(
    b2Client,
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn }
  );
}

/**
 * Generate a pre-signed URL for downloading / reading an object from B2.
 * Used for secure local export (the URL expires after `expiresIn` seconds).
 */
export async function getPresignedDownloadUrl(
  key: string,
  filename: string,
  expiresIn = 3600
): Promise<string> {
  return getSignedUrl(
    b2Client,
    new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${filename}"`,
    }),
    { expiresIn }
  );
}

/**
 * Build storage key for a user's video
 */
export function buildVideoKey(userId: string, generationId: string): string {
  return `videos/${userId}/${generationId}/output.mp4`;
}

/**
 * Build storage key for a video thumbnail
 */
export function buildThumbnailKey(userId: string, generationId: string): string {
  return `videos/${userId}/${generationId}/thumbnail.jpg`;
}

/**
 * Build storage key for a character reference image
 */
export function buildCharacterKey(userId: string, characterId: string): string {
  return `characters/${userId}/${characterId}/reference.jpg`;
}

/**
 * Build storage key for an upscale input video
 */
export function buildUpscaleInputKey(userId: string, jobId: string): string {
  return `upscale/${userId}/${jobId}/input.mp4`;
}

/**
 * Build storage key for an upscale output (4K) video
 */
export function buildUpscaleOutputKey(userId: string, jobId: string): string {
  return `upscale/${userId}/${jobId}/output-4k.mp4`;
}

/**
 * Build storage key for a user-uploaded video in the editor
 */
export function buildEditorInputKey(userId: string, projectId: string, clipId: string): string {
  return `editor/${userId}/${projectId}/${clipId}/input.mp4`;
}

/**
 * Build storage key for a rendered/exported editor project
 */
export function buildEditorOutputKey(userId: string, projectId: string): string {
  return `editor/${userId}/${projectId}/export.mp4`;
}
