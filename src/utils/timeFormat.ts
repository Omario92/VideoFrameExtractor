/**
 * Format a time in seconds to "MM:SS.ff" or "MM:SS" display format.
 */
export function formatTime(seconds: number, showFrames = false): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '00:00.00';
  const totalSeconds = Math.max(0, seconds);
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  const frac = Math.round((totalSeconds % 1) * 100);

  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  const ff = String(frac).padStart(2, '0');

  if (showFrames) {
    // Show frame number (assuming 30fps)
    const frame = Math.round((totalSeconds % 1) * 30);
    return `${mm}:${ss}:${String(frame).padStart(2, '0')}`;
  }
  return `${mm}:${ss}.${ff}`;
}

/**
 * Parse MM:SS.ff back to seconds
 */
export function parseTime(timeStr: string): number {
  const parts = timeStr.split(':');
  if (parts.length < 2) return 0;
  const mins = parseInt(parts[0], 10) || 0;
  const secParts = parts[1].split('.');
  const secs = parseInt(secParts[0], 10) || 0;
  const frac = secParts[1] ? parseInt(secParts[1], 10) / 100 : 0;
  return mins * 60 + secs + frac;
}

/**
 * Generate evenly-spaced timestamps for filmstrip preview.
 */
export function generateFilmstripTimestamps(
  duration: number,
  count = 10
): number[] {
  if (duration <= 0) return [];
  const interval = duration / Math.max(1, count - 1);
  return Array.from({ length: count }, (_, i) =>
    Math.min(i * interval, duration)
  );
}

/**
 * Generate timestamps for interval extraction.
 */
export function generateIntervalTimestamps(
  duration: number,
  intervalSeconds: number
): number[] {
  if (duration <= 0 || intervalSeconds <= 0) return [0];
  const timestamps: number[] = [];
  for (let t = 0; t <= duration; t += intervalSeconds) {
    timestamps.push(Math.min(t, duration));
  }
  return timestamps;
}
