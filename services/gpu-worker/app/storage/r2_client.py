"""Cloudflare R2 storage client for the GPU worker service."""

from __future__ import annotations

import logging
from typing import Optional

import boto3
from botocore.config import Config

from app.config import settings

logger = logging.getLogger(__name__)

_s3_client = None


def _get_client():
    """Lazy-initialize and return the S3-compatible R2 client."""
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            region_name="auto",
            config=Config(signature_version="s3v4"),
        )
    return _s3_client


def upload_bytes(key: str, data: bytes, content_type: str = "video/mp4") -> str:
    """Upload raw bytes to R2 and return the public URL."""
    client = _get_client()
    client.put_object(
        Bucket=settings.R2_BUCKET_NAME,
        Key=key,
        Body=data,
        ContentType=content_type,
    )
    url = f"{settings.R2_PUBLIC_URL}/{key}"
    logger.info("Uploaded to R2: %s", key)
    return url


def upload_file(key: str, file_path: str, content_type: str = "video/mp4") -> str:
    """Upload a local file to R2."""
    client = _get_client()
    client.upload_file(
        Filename=file_path,
        Bucket=settings.R2_BUCKET_NAME,
        Key=key,
        ExtraArgs={"ContentType": content_type},
    )
    url = f"{settings.R2_PUBLIC_URL}/{key}"
    logger.info("Uploaded file to R2: %s", key)
    return url


def download_file(key: str, dest_path: str) -> str:
    """Download a file from R2 to *dest_path*."""
    client = _get_client()
    client.download_file(
        Bucket=settings.R2_BUCKET_NAME,
        Key=key,
        Filename=dest_path,
    )
    return dest_path


def generate_presigned_url(key: str, expires_in: int = 3600) -> str:
    """Generate a presigned upload URL for direct client uploads."""
    client = _get_client()
    return client.generate_presigned_url(
        "put_object",
        Params={"Bucket": settings.R2_BUCKET_NAME, "Key": key},
        ExpiresIn=expires_in,
    )


# ── Key builders ───────────────────────────────────────────────────────────────


def build_video_key(user_id: str, generation_id: str) -> str:
    return f"videos/{user_id}/{generation_id}/output.mp4"


def build_scene_key(user_id: str, generation_id: str, scene_index: int) -> str:
    return f"videos/{user_id}/{generation_id}/scene_{scene_index}.mp4"


def build_thumbnail_key(user_id: str, generation_id: str) -> str:
    return f"videos/{user_id}/{generation_id}/thumbnail.jpg"


def build_draft_key(user_id: str, generation_id: str) -> str:
    return f"videos/{user_id}/{generation_id}/draft_preview.mp4"
