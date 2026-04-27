import * as VideoThumbnails from 'expo-video-thumbnails';
import { ExtractedFrame } from '@/types';

/**
 * Extract a single frame from a video at the given timestamp.
 * @param videoUri  Local URI of the video file
 * @param timeMs    Time in milliseconds
 * @param quality   JPEG quality 0–1 (default 0.9)
 */
export async function extractFrameAtTime(
  videoUri: string,
  timeMs: number,
  quality = 0.9
): Promise<ExtractedFrame | null> {
  try {
    const { uri, width, height } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: Math.max(0, timeMs),
      quality,
    });
    return {
      id: `frame_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      uri,
      timestamp: timeMs / 1000,
      width,
      height,
    };
  } catch (error) {
    console.warn('[frameExtractor] Failed to extract frame at', timeMs, error);
    return null;
  }
}

/**
 * Extract multiple frames at specific timestamps (in seconds).
 * Reports progress via onProgress callback.
 */
export async function extractFramesAtTimestamps(
  videoUri: string,
  timestamps: number[], // in seconds
  quality = 0.9,
  onProgress?: (done: number, total: number) => void
): Promise<ExtractedFrame[]> {
  const frames: ExtractedFrame[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    const timeMs = Math.round(timestamps[i] * 1000);
    const frame = await extractFrameAtTime(videoUri, timeMs, quality);
    if (frame) {
      frames.push(frame);
    }
    onProgress?.(i + 1, timestamps.length);
  }

  return frames;
}

/**
 * Extract the very first and last frames of a video.
 */
export async function extractFirstAndLastFrames(
  videoUri: string,
  durationSeconds: number,
  quality = 0.9
): Promise<ExtractedFrame[]> {
  const results: ExtractedFrame[] = [];

  const first = await extractFrameAtTime(videoUri, 0, quality);
  if (first) results.push(first);

  if (durationSeconds > 0) {
    const lastMs = Math.max(0, Math.round(durationSeconds * 1000) - 200);
    const last = await extractFrameAtTime(videoUri, lastMs, quality);
    if (last) results.push(last);
  }

  return results;
}

/**
 * Generate filmstrip thumbnails (evenly spaced) for the scrubber UI.
 */
export async function generateFilmstrip(
  videoUri: string,
  durationSeconds: number,
  count = 12,
  quality = 0.5
): Promise<ExtractedFrame[]> {
  if (durationSeconds <= 0) return [];
  const interval = durationSeconds / Math.max(1, count - 1);
  const timestamps = Array.from({ length: count }, (_, i) =>
    Math.min(i * interval, durationSeconds)
  );
  return extractFramesAtTimestamps(videoUri, timestamps, quality);
}
