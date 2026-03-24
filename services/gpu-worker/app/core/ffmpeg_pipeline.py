"""FFmpeg video processing pipeline.

Handles scene stitching, resolution adjustment, watermarking, and format
optimization for the final output video.
"""

from __future__ import annotations

import logging
import os
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

import httpx

logger = logging.getLogger(__name__)


async def download_file(url: str, dest: Path) -> Path:
    """Download a file from *url* to *dest*."""
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.get(url)
        response.raise_for_status()
        dest.write_bytes(response.content)
    return dest


def stitch_scenes(
    scene_paths: list[Path],
    output_path: Path,
    target_resolution: Optional[str] = None,
    target_fps: int = 24,
) -> Path:
    """Concatenate scene video files into a single output using FFmpeg.

    Args:
        scene_paths: Ordered list of scene video file paths.
        output_path: Where to write the stitched result.
        target_resolution: Optional resolution string (e.g. ``"1280x720"``).
        target_fps: Target frames-per-second for the output.

    Returns:
        Path to the stitched output file.
    """
    if not scene_paths:
        raise ValueError("No scene files provided for stitching")

    if len(scene_paths) == 1:
        # Single scene – just re-encode to normalise format
        return _reencode(scene_paths[0], output_path, target_resolution, target_fps)

    with tempfile.NamedTemporaryFile(
        mode="w", suffix=".txt", delete=False
    ) as concat_list:
        for path in scene_paths:
            concat_list.write(f"file '{path}'\n")
        concat_list_path = concat_list.name

    try:
        cmd = [
            "ffmpeg",
            "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concat_list_path,
        ]

        filter_parts: list[str] = []
        if target_resolution:
            filter_parts.append(f"scale={target_resolution}:force_original_aspect_ratio=decrease,pad={target_resolution}:(ow-iw)/2:(oh-ih)/2")
        filter_parts.append(f"fps={target_fps}")

        if filter_parts:
            cmd.extend(["-vf", ",".join(filter_parts)])

        cmd.extend([
            "-c:v", "libx264",
            "-preset", "fast",
            "-crf", "23",
            "-c:a", "aac",
            "-movflags", "+faststart",
            str(output_path),
        ])

        _run_ffmpeg(cmd)
    finally:
        os.unlink(concat_list_path)

    return output_path


def add_watermark(
    input_path: Path,
    output_path: Path,
    text: str = "VideoForge",
) -> Path:
    """Burn a text watermark into the bottom-right corner of the video."""
    cmd = [
        "ffmpeg",
        "-y",
        "-i", str(input_path),
        "-vf", (
            f"drawtext=text='{text}'"
            ":fontcolor=white@0.4"
            ":fontsize=24"
            ":x=w-tw-20"
            ":y=h-th-20"
        ),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "copy",
        str(output_path),
    ]
    _run_ffmpeg(cmd)
    return output_path


def reduce_resolution(
    input_path: Path,
    output_path: Path,
    target: str = "854x480",
) -> Path:
    """Downscale a video to the given resolution."""
    cmd = [
        "ffmpeg",
        "-y",
        "-i", str(input_path),
        "-vf", f"scale={target}:force_original_aspect_ratio=decrease",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "copy",
        str(output_path),
    ]
    _run_ffmpeg(cmd)
    return output_path


def reduce_fps(
    input_path: Path,
    output_path: Path,
    target_fps: int = 16,
) -> Path:
    """Reduce the frame-rate of a video."""
    cmd = [
        "ffmpeg",
        "-y",
        "-i", str(input_path),
        "-vf", f"fps={target_fps}",
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "copy",
        str(output_path),
    ]
    _run_ffmpeg(cmd)
    return output_path


def extract_thumbnail(
    input_path: Path,
    output_path: Path,
    timestamp: float = 1.0,
) -> Path:
    """Extract a single frame as a JPEG thumbnail."""
    cmd = [
        "ffmpeg",
        "-y",
        "-i", str(input_path),
        "-ss", str(timestamp),
        "-frames:v", "1",
        "-q:v", "2",
        str(output_path),
    ]
    _run_ffmpeg(cmd)
    return output_path


def get_video_duration(input_path: Path) -> float:
    """Return the duration of a video in seconds using ffprobe."""
    cmd = [
        "ffprobe",
        "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(input_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    return float(result.stdout.strip())


# ── Internal helpers ───────────────────────────────────────────────────────────


def _reencode(
    input_path: Path,
    output_path: Path,
    target_resolution: Optional[str] = None,
    target_fps: int = 24,
) -> Path:
    """Re-encode a single file to normalise codec/format."""
    cmd = ["ffmpeg", "-y", "-i", str(input_path)]

    filter_parts: list[str] = []
    if target_resolution:
        filter_parts.append(f"scale={target_resolution}:force_original_aspect_ratio=decrease")
    filter_parts.append(f"fps={target_fps}")
    cmd.extend(["-vf", ",".join(filter_parts)])

    cmd.extend([
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "aac",
        "-movflags", "+faststart",
        str(output_path),
    ])
    _run_ffmpeg(cmd)
    return output_path


def _run_ffmpeg(cmd: list[str]) -> None:
    """Execute an FFmpeg command, raising on failure."""
    logger.debug("FFmpeg command: %s", " ".join(cmd))
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        logger.error("FFmpeg stderr: %s", result.stderr)
        raise RuntimeError(f"FFmpeg failed (exit {result.returncode}): {result.stderr[:500]}")
