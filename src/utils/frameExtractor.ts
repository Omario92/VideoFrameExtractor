import { createVideoPlayer } from 'expo-video';
import { ExtractedFrame, ImageFormat } from '@/types';
import { processAndSaveThumbnail } from './ExportService';

/**
 * Extract a single frame from a video at the given timestamp.
 */
export async function extractFrameAtTime(
  videoUri: string,
  timeMs: number,
  format: ImageFormat = 'JPEG',
  quality = 95
): Promise<ExtractedFrame | null> {
  const player = createVideoPlayer(videoUri);
  try {
    const timeSec = Math.max(0, timeMs / 1000);
    const thumbs = await player.generateThumbnailsAsync([timeSec]);
    if (thumbs.length === 0) return null;
    
    return await processAndSaveThumbnail(thumbs[0], videoUri, format, quality, true);
  } catch (error) {
    console.warn('[frameExtractor] Failed to extract frame at', timeMs, error);
    throw error;
  } finally {
    if (typeof player.release === 'function') {
      player.release();
    }
  }
}

/**
 * Extract multiple frames at specific timestamps (in seconds).
 */
export async function extractFramesAtTimestamps(
  videoUri: string,
  timestamps: number[], // in seconds
  format: ImageFormat = 'JPEG',
  quality = 95,
  onProgress?: (done: number, total: number) => void
): Promise<ExtractedFrame[]> {
  const frames: ExtractedFrame[] = [];
  const player = createVideoPlayer(videoUri);

  try {
    const thumbs = await player.generateThumbnailsAsync(timestamps);
    
    for (let i = 0; i < thumbs.length; i++) {
      const frame = await processAndSaveThumbnail(thumbs[i], videoUri, format, quality, true);
      if (frame) {
        frames.push(frame);
      }
      onProgress?.(i + 1, timestamps.length);
    }
  } catch (error) {
    console.warn('[frameExtractor] Failed to extract frames at timestamps', error);
    throw error;
  } finally {
    if (typeof player.release === 'function') {
      player.release();
    }
  }

  return frames;
}

/**
 * Extract the very first and last frames of a video.
 */
export async function extractFirstAndLastFrames(
  videoUri: string,
  durationSeconds: number,
  format: ImageFormat = 'JPEG',
  quality = 95
): Promise<ExtractedFrame[]> {
  const timestamps = [0];
  if (durationSeconds > 0) {
    timestamps.push(Math.max(0, durationSeconds - 0.2));
  }
  return extractFramesAtTimestamps(videoUri, timestamps, format, quality);
}

/**
 * Generate filmstrip thumbnails (evenly spaced) for the scrubber UI.
 */
export async function generateFilmstrip(
  videoUri: string,
  durationSeconds: number,
  count = 12,
  quality = 50 // UI thumbnails can be lower quality
): Promise<ExtractedFrame[]> {
  if (durationSeconds <= 0) return [];
  const safeDuration = Math.max(0, durationSeconds - 0.2);
  const interval = safeDuration / Math.max(1, count - 1);
  const timestamps = Array.from({ length: count }, (_, i) =>
    Math.min(i * interval, safeDuration)
  );
  
  const frames: ExtractedFrame[] = [];
  const player = createVideoPlayer(videoUri);
  try {
    const thumbs = await player.generateThumbnailsAsync(timestamps);
    
    // We use isPersistent=false for filmstrip
    for (let i = 0; i < thumbs.length; i++) {
      const frame = await processAndSaveThumbnail(thumbs[i], videoUri, 'JPEG', quality, false);
      if (frame) {
        frames.push(frame);
      }
    }
  } catch (error) {
    console.warn('[frameExtractor] Failed to generate filmstrip', error);
    throw error;
  } finally {
    if (typeof player.release === 'function') {
      player.release();
    }
  }
  return frames;
}
