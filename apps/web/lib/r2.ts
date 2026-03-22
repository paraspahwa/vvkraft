import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME ?? "videoforge";
const PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "";

/**
 * Upload a buffer to R2 and return the public URL
 */
export async function uploadToR2(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  await r2Client.send(
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
 * Upload from a URL (download then re-upload to R2)
 */
export async function uploadFromUrl(key: string, sourceUrl: string, contentType: string): Promise<string> {
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error(`Failed to fetch source URL: ${response.statusText}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  return uploadToR2(key, buffer, contentType);
}

/**
 * Delete an object from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(
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
    r2Client,
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn }
  );
}

/**
 * Build R2 storage key for a user's video
 */
export function buildVideoKey(userId: string, generationId: string): string {
  return `videos/${userId}/${generationId}/output.mp4`;
}

/**
 * Build R2 storage key for a video thumbnail
 */
export function buildThumbnailKey(userId: string, generationId: string): string {
  return `videos/${userId}/${generationId}/thumbnail.jpg`;
}

/**
 * Build R2 storage key for a character reference image
 */
export function buildCharacterKey(userId: string, characterId: string): string {
  return `characters/${userId}/${characterId}/reference.jpg`;
}
